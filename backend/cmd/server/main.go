package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/game"
	"bitarcade-backend/internal/handlers"
	"bitarcade-backend/internal/middleware"
	"bitarcade-backend/internal/models"
	"bitarcade-backend/internal/services"
	"bitarcade-backend/internal/ws"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func main() {
	cfg, err := config.LoadConfig()
	if err != nil {
		log.Fatalf("[CONFIG ERROR] %v", err)
	}

	log.Println("==================================================")
	log.Println("🚀 BIT ARCADE HIGH-PERFORMANCE GO BACKEND STARTING")
	log.Println("==================================================")

	// Database initialization
	dbBundle, err := database.InitDB(cfg)
	if err != nil {
		log.Printf("[DB WARNING] %v", err)
	}

	// Services
	authService := services.NewAuthService(cfg, dbBundle)
	walletService := services.NewWalletService(dbBundle)

	// WebSocket Hub
	hub := ws.NewHub(cfg)
	go hub.Run()

	// Handlers
	apiHandler := handlers.NewAPIHandler(cfg, authService, walletService, dbBundle)

	// Rate Limiting Middlewares (Redis-backed with in-memory fallback)
	generalLimiter := middleware.RateLimitMiddleware(dbBundle.Redis, "gen", 120, time.Minute)
	authLimiter := middleware.RateLimitMiddleware(dbBundle.Redis, "auth", 15, time.Minute)
	paymentLimiter := middleware.RateLimitMiddleware(dbBundle.Redis, "pay", 20, time.Minute)

	// Gin Engine
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware(cfg))
	router.Use(middleware.SecurityHeadersMiddleware())
	router.Use(generalLimiter)

	// Public Routes
	router.GET("/api/v1/health", apiHandler.HealthCheck)
	router.GET("/health", apiHandler.HealthCheck)

	// WebSockets
	router.GET("/ws", hub.HandleWebSocket)

	// Dragon vs Tiger Game Engine
	dtEngine := game.NewDragonTigerEngine(hub, walletService, dbBundle)
	dtEngine.Start()

	// Dragon vs Tiger Game Routes
	router.GET("/api/v1/games/dragontiger/state", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    dtEngine.GetSnapshot(),
		})
	})
	router.GET("/games/dragontiger/state", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    dtEngine.GetSnapshot(),
		})
	})

	router.GET("/api/v1/games/dragontiger/history", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    dtEngine.GetHistory(20),
		})
	})

	// Fix (Issues 1.6 & 14.2): Hardened client-log with rate limiting, 64KB size limit, sanitization, and persistent audit storage
	router.POST("/api/v1/client-log", generalLimiter, func(c *gin.Context) {
		limitedReader := io.LimitReader(c.Request.Body, 64*1024)
		body, err := io.ReadAll(limitedReader)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "failed to read body"})
			return
		}

		safeLog := string(body)
		if len(safeLog) > 4096 {
			safeLog = safeLog[:4096] + "... [TRUNCATED]"
		}
		// Sanitize carriage returns to prevent terminal injection
		sanitizedLog := strings.ReplaceAll(safeLog, "\r", "")

		log.Printf("[CLIENT_CRASH] IP=%s: %s", c.ClientIP(), sanitizedLog)
		if dbBundle != nil && dbBundle.DB != nil {
			_ = dbBundle.DB.Create(&models.AuditLog{
				ID:        fmt.Sprintf("CRASH-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
				AdminUser: "system",
				Action:    "CLIENT_CRASH",
				TargetID:  c.ClientIP(),
				Details:   sanitizedLog,
				IPAddress: c.ClientIP(),
				CreatedAt: time.Now(),
			})
		}
		c.JSON(http.StatusOK, gin.H{"status": "logged"})
	})

	// Place Bet Handler
	handleBet := func(c *gin.Context) {
		userID := c.GetString("userId")
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Unauthorized: valid session token required"})
			return
		}

		var req struct {
			Target         string `json:"target" binding:"required"`
			AmountChips    int64  `json:"amountChips" binding:"required"`
			IdempotencyKey string `json:"idempotencyKey"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid bet payload"})
			return
		}

		// Fix (Issue 10.1): Deduplicate bets using idempotency key
		bet, newBal, err := dtEngine.PlaceBetWithIdempotency(userID, req.Target, req.AmountChips, req.IdempotencyKey)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"message": "Bet placed successfully",
			"data": gin.H{
				"betId":        bet.ID,
				"target":       bet.Target,
				"amount":       bet.Amount,
				"newBalance":   newBal / 100,
				"balanceChips": newBal,
			},
		})
	}

	router.POST("/api/v1/games/dragontiger/bet", middleware.JWTAuthMiddleware(cfg), handleBet)
	router.POST("/games/dragontiger/bet", middleware.JWTAuthMiddleware(cfg), handleBet)

	// Fix: Removed hardcoded local developer path (/Users/satyamkumar/3334game/...) to ensure production compatibility.
	// Payment Gateway UI handler (serves payment-proxy/index.html dynamically via env, pwd, or executable path)
	servePaymentPage := func(c *gin.Context) {
		candidates := []string{}
		if customPath := os.Getenv("PAYMENT_PROXY_HTML_PATH"); customPath != "" {
			candidates = append(candidates, customPath)
		}
		candidates = append(candidates,
			"payment-proxy/index.html",
			"../payment-proxy/index.html",
			"../../payment-proxy/index.html",
		)
		if exePath, err := os.Executable(); err == nil {
			exeDir := filepath.Dir(exePath)
			candidates = append(candidates,
				filepath.Join(exeDir, "payment-proxy/index.html"),
				filepath.Join(exeDir, "../payment-proxy/index.html"),
			)
		}
		for _, path := range candidates {
			if _, err := os.Stat(path); err == nil {
				c.File(path)
				return
			}
		}
		c.String(http.StatusNotFound, "Payment gateway interface not found")
	}
	router.GET("/pay", servePaymentPage)
	router.GET("/api/v1/pay", servePaymentPage)

	// Auth Group
	authGroup := router.Group("/api/v1/auth")
	authGroup.Use(authLimiter)
	{
		authGroup.POST("/login-or-register", apiHandler.LoginOrRegister)
		authGroup.POST("/login", apiHandler.LoginOrRegister)
		authGroup.GET("/status", apiHandler.AuthStatus)
		authGroup.PUT("/profile", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
		authGroup.POST("/whatsapp/initiate", apiHandler.InitiateWhatsApp)
		authGroup.POST("/whatsapp/verify", apiHandler.VerifyWhatsApp)
		authGroup.GET("/me", middleware.JWTAuthMiddleware(cfg), apiHandler.GetMe)
	}

	// Direct routes matching legacy client paths
	router.POST("/auth/login", authLimiter, apiHandler.LoginOrRegister)
	router.GET("/auth/status", authLimiter, apiHandler.AuthStatus)
	router.PUT("/auth/profile", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
	router.POST("/auth/whatsapp/initiate", authLimiter, apiHandler.InitiateWhatsApp)
	router.POST("/auth/whatsapp/verify", authLimiter, apiHandler.VerifyWhatsApp)

	// Wallet Group
	walletGroup := router.Group("/api/v1/wallet")
	walletGroup.Use(middleware.JWTAuthMiddleware(cfg))
	{
		walletGroup.GET("/balance", apiHandler.GetBalance)
		walletGroup.GET("/transactions", apiHandler.GetTransactions)
	}

	directWalletGroup := router.Group("/wallet")
	directWalletGroup.Use(middleware.JWTAuthMiddleware(cfg))
	{
		directWalletGroup.GET("/balance", apiHandler.GetBalance)
		directWalletGroup.GET("/transactions", apiHandler.GetTransactions)
	}

	// Payments Group
	paymentGroup := router.Group("/api/v1/payments")
	paymentGroup.Use(paymentLimiter)
	{
		paymentGroup.POST("/deposits/initiate", middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
		paymentGroup.POST("/deposits/utr", middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
		paymentGroup.GET("/deposits/status", apiHandler.GetDepositStatus)
		paymentGroup.POST("/withdraw", middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)
		paymentGroup.POST("/withdraw/request", middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)
		// Fix (Issue 5.3): Server-to-server webhook endpoint
		paymentGroup.POST("/webhook", apiHandler.PaymentWebhook)
	}

	// Fix (Issue 5.3): Direct webhook fallback route (paymentGroup already registered /api/v1/payments/webhook)
	router.POST("/payments/webhook", apiHandler.PaymentWebhook)

	// Alternate direct routes matching legacy app & payment proxy paths
	router.POST("/deposits/initiate", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
	router.POST("/api/v1/deposits/initiate", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
	router.POST("/deposits/utr", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.POST("/api/v1/deposits/utr", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.POST("/api/v1/deposits/submit-utr", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.GET("/api/v1/deposits/status", apiHandler.GetDepositStatus)
	router.GET("/deposits/status", apiHandler.GetDepositStatus)
	router.POST("/payments/withdraw/request", paymentLimiter, middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)

	// Users Group & FCM Token
	userGroup := router.Group("/api/v1/users")
	{
		userGroup.PUT("/:id", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
		userGroup.PUT("/profile", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
		userGroup.POST("/fcm-token", apiHandler.UpdateFCMToken)
		userGroup.DELETE("/me", middleware.JWTAuthMiddleware(cfg), apiHandler.DeleteAccount)
	}
	router.Group("/users").PUT("/:id", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
	router.POST("/users/fcm-token", apiHandler.UpdateFCMToken)
	// Account deletion (DPDP Act 2023 right to erasure)
	router.DELETE("/users/me", middleware.JWTAuthMiddleware(cfg), apiHandler.DeleteAccount)

	// Promotions Group
	router.GET("/api/v1/promotions", apiHandler.GetPromotions)
	router.GET("/api/v1/promotions/active", apiHandler.GetPromotions)
	router.GET("/promotions", apiHandler.GetPromotions)
	router.GET("/promotions/active", apiHandler.GetPromotions)

	// Admin Auth Group
	adminAuth := router.Group("/api/v1/auth/admin")
	adminAuth.Use(authLimiter)
	{
		adminAuth.POST("/login", apiHandler.AdminLogin)
		adminAuth.POST("/logout", apiHandler.AdminLogout)
	}
	router.POST("/auth/admin/login", authLimiter, apiHandler.AdminLogin)
	router.POST("/auth/admin/logout", apiHandler.AdminLogout)

	// Fix (Issues 2.5 & 6.4): Unified Admin Route Registration to eliminate route bloat & duplicate code
	registerAdminEndpoints := func(g *gin.RouterGroup) {
		g.GET("/me", apiHandler.AdminMe)
		g.GET("/dashboard/stats", apiHandler.AdminDashboardStats)
		g.GET("/dashboard/pending-counts", apiHandler.AdminPendingCounts)

		// Users
		g.GET("/users", apiHandler.AdminGetUsers)
		g.GET("/users/:id", apiHandler.AdminGetUserDetails)
		g.PATCH("/users/:id", apiHandler.AdminUpdateUser)
		g.POST("/users/:id/ban", apiHandler.AdminToggleBan)
		g.POST("/users/:id/adjust-wallet", apiHandler.AdminAdjustWallet)
		g.POST("/users/:id/notes", apiHandler.AdminAddUserNote)

		// Deposits & Withdrawals
		g.GET("/deposits", apiHandler.AdminGetDeposits)
		g.POST("/deposits/approve", apiHandler.AdminApproveDeposit)
		g.POST("/deposits/reject", apiHandler.AdminRejectDeposit)

		g.GET("/withdrawals", apiHandler.AdminGetWithdrawals)
		g.POST("/withdrawals/approve", apiHandler.AdminApproveWithdrawal)
		g.POST("/withdrawals/reject", apiHandler.AdminRejectWithdrawal)
		g.POST("/withdrawals/process", apiHandler.AdminApproveWithdrawal)

		// Ledger & System (Issue 6.4: Separate distinct handler for ledger overview)
		g.GET("/ledger/overview", apiHandler.AdminGetLedgerOverview)
		g.GET("/ledger/transactions", apiHandler.AdminGetLedger)
		g.GET("/system/health", apiHandler.AdminSystemHealth)

		// Promotions
		g.GET("/promotions", apiHandler.GetPromotions)
		g.POST("/promotions", apiHandler.AdminCreatePromotion)
		g.PUT("/promotions/:id", apiHandler.AdminUpdatePromotion)
		g.PATCH("/promotions/:id/status", apiHandler.AdminTogglePromotionStatus)
		g.DELETE("/promotions/:id", apiHandler.AdminDeletePromotion)

		// Games
		g.GET("/games", apiHandler.AdminGetGames)
		g.GET("/games/:id", apiHandler.AdminGetGameDetails)
		g.PATCH("/games/:id/status", apiHandler.AdminUpdateGameStatus)
		g.PATCH("/games/:id/config", apiHandler.AdminUpdateGameConfig)

		// System Settings & Announcements
		g.GET("/system/settings", apiHandler.AdminGetSystemSettings)
		g.PATCH("/system/settings/:key", apiHandler.AdminUpdateSystemSetting)
		g.GET("/system/announcements", apiHandler.AdminGetAnnouncements)
		g.POST("/system/announcements", apiHandler.AdminCreateAnnouncement)
		g.PATCH("/system/announcements/:id/status", apiHandler.AdminToggleAnnouncementStatus)
		g.POST("/system/notifications/push", apiHandler.AdminSendPushNotification)

		// Staff & Audit Logs
		g.GET("/admins", apiHandler.AdminListAdmins)
		g.POST("/admins", apiHandler.AdminCreateAdmin)
		g.PATCH("/admins/:id/status", apiHandler.AdminToggleAdminActive)
		g.GET("/audit-logs", apiHandler.AdminGetAuditLogs)
	}

	// Admin Management Group
	adminGroup := router.Group("/api/v1/admin")
	adminGroup.Use(middleware.AdminAuthMiddleware(cfg, authService))
	registerAdminEndpoints(adminGroup)

	// Direct aliases for Admin Panel Next.js proxy
	directAdmin := router.Group("/admin")
	directAdmin.Use(middleware.AdminAuthMiddleware(cfg, authService))
	registerAdminEndpoints(directAdmin)


	// HTTP Server with Graceful Shutdown
	srv := &http.Server{
		Addr:         fmt.Sprintf(":%s", cfg.Port),
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("🌐 Server listening on http://localhost:%s\n", cfg.Port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Listen error: %s\n", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("[SERVER] Shutting down Go server gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("[SERVER] Go backend exited gracefully")
}
