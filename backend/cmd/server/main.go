package main

import (
	"context"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/game"
	"bitarcade-backend/internal/handlers"
	"bitarcade-backend/internal/middleware"
	"bitarcade-backend/internal/services"
	"bitarcade-backend/internal/ws"

	"github.com/gin-gonic/gin"
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
	apiHandler := handlers.NewAPIHandler(cfg, authService, walletService)

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

	router.POST("/api/v1/client-log", func(c *gin.Context) {
		body, _ := io.ReadAll(c.Request.Body)
		log.Printf("\n🚨 [CLIENT_CRASH] 🚨\n%s\n", string(body))
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
			Target      string `json:"target" binding:"required"`
			AmountChips int64  `json:"amountChips" binding:"required"`
		}
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid bet payload"})
			return
		}

		bet, newBal, err := dtEngine.PlaceBet(userID, req.Target, req.AmountChips)
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

	// Payment Gateway UI handler (serves payment-proxy/index.html)
	servePaymentPage := func(c *gin.Context) {
		candidates := []string{
			"payment-proxy/index.html",
			"../payment-proxy/index.html",
			"/Users/satyamkumar/3334game/payment-proxy/index.html",
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
	}

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

	// Admin Management Group
	adminGroup := router.Group("/api/v1/admin")
	adminGroup.Use(middleware.AdminAuthMiddleware(cfg, authService))
	{
		adminGroup.GET("/me", apiHandler.AdminMe)
		adminGroup.GET("/dashboard/stats", apiHandler.AdminDashboardStats)
		adminGroup.GET("/dashboard/pending-counts", apiHandler.AdminPendingCounts)

		// Users
		adminGroup.GET("/users", apiHandler.AdminGetUsers)
		adminGroup.GET("/users/:id", apiHandler.AdminGetUserDetails)
		adminGroup.PATCH("/users/:id", apiHandler.AdminUpdateUser)
		adminGroup.POST("/users/:id/ban", apiHandler.AdminToggleBan)
		adminGroup.POST("/users/:id/adjust-wallet", apiHandler.AdminAdjustWallet)
		adminGroup.POST("/users/:id/notes", apiHandler.AdminAddUserNote)

		// Deposits & Withdrawals
		adminGroup.GET("/deposits", apiHandler.AdminGetDeposits)
		adminGroup.POST("/deposits/approve", apiHandler.AdminApproveDeposit)
		adminGroup.POST("/deposits/reject", apiHandler.AdminRejectDeposit)

		adminGroup.GET("/withdrawals", apiHandler.AdminGetWithdrawals)
		adminGroup.POST("/withdrawals/approve", apiHandler.AdminApproveWithdrawal)
		adminGroup.POST("/withdrawals/reject", apiHandler.AdminRejectWithdrawal)
		adminGroup.POST("/withdrawals/process", apiHandler.AdminApproveWithdrawal)

		// Ledger & System
		adminGroup.GET("/ledger/overview", apiHandler.AdminDashboardStats)
		adminGroup.GET("/ledger/transactions", apiHandler.AdminGetLedger)
		adminGroup.GET("/system/health", apiHandler.AdminSystemHealth)

		// Promotions
		adminGroup.GET("/promotions", apiHandler.GetPromotions)
		adminGroup.POST("/promotions", apiHandler.AdminCreatePromotion)
		adminGroup.PUT("/promotions/:id", apiHandler.AdminUpdatePromotion)
		adminGroup.PATCH("/promotions/:id/status", apiHandler.AdminTogglePromotionStatus)
		adminGroup.DELETE("/promotions/:id", apiHandler.AdminDeletePromotion)

		// Games
		adminGroup.GET("/games", apiHandler.AdminGetGames)
		adminGroup.GET("/games/:id", apiHandler.AdminGetGameDetails)
		adminGroup.PATCH("/games/:id/status", apiHandler.AdminUpdateGameStatus)
		adminGroup.PATCH("/games/:id/config", apiHandler.AdminUpdateGameConfig)

		// System Settings & Announcements
		adminGroup.GET("/system/settings", apiHandler.AdminGetSystemSettings)
		adminGroup.PATCH("/system/settings/:key", apiHandler.AdminUpdateSystemSetting)
		adminGroup.GET("/system/announcements", apiHandler.AdminGetAnnouncements)
		adminGroup.POST("/system/announcements", apiHandler.AdminCreateAnnouncement)
		adminGroup.PATCH("/system/announcements/:id/status", apiHandler.AdminToggleAnnouncementStatus)
		adminGroup.POST("/system/notifications/push", apiHandler.AdminSendPushNotification)

		// Staff & Audit Logs
		adminGroup.GET("/admins", apiHandler.AdminListAdmins)
		adminGroup.POST("/admins", apiHandler.AdminCreateAdmin)
		adminGroup.PATCH("/admins/:id/status", apiHandler.AdminToggleAdminActive)
		adminGroup.GET("/audit-logs", apiHandler.AdminGetAuditLogs)
	}

	// Direct aliases for Admin Panel Next.js proxy
	directAdmin := router.Group("/admin")
	directAdmin.Use(middleware.AdminAuthMiddleware(cfg, authService))
	{
		directAdmin.GET("/me", apiHandler.AdminMe)
		directAdmin.GET("/dashboard/stats", apiHandler.AdminDashboardStats)
		directAdmin.GET("/dashboard/pending-counts", apiHandler.AdminPendingCounts)
		directAdmin.GET("/users", apiHandler.AdminGetUsers)
		directAdmin.GET("/users/:id", apiHandler.AdminGetUserDetails)
		directAdmin.PATCH("/users/:id", apiHandler.AdminUpdateUser)
		directAdmin.POST("/users/:id/ban", apiHandler.AdminToggleBan)
		directAdmin.POST("/users/:id/adjust-wallet", apiHandler.AdminAdjustWallet)
		directAdmin.POST("/users/:id/notes", apiHandler.AdminAddUserNote)
		directAdmin.GET("/deposits", apiHandler.AdminGetDeposits)
		directAdmin.POST("/deposits/approve", apiHandler.AdminApproveDeposit)
		directAdmin.POST("/deposits/reject", apiHandler.AdminRejectDeposit)
		directAdmin.GET("/withdrawals", apiHandler.AdminGetWithdrawals)
		directAdmin.POST("/withdrawals/approve", apiHandler.AdminApproveWithdrawal)
		directAdmin.POST("/withdrawals/reject", apiHandler.AdminRejectWithdrawal)
		directAdmin.POST("/withdrawals/process", apiHandler.AdminApproveWithdrawal)
		directAdmin.GET("/ledger/overview", apiHandler.AdminDashboardStats)
		directAdmin.GET("/ledger/transactions", apiHandler.AdminGetLedger)
		directAdmin.GET("/system/health", apiHandler.AdminSystemHealth)

		// Promotions
		directAdmin.GET("/promotions", apiHandler.GetPromotions)
		directAdmin.POST("/promotions", apiHandler.AdminCreatePromotion)
		directAdmin.PUT("/promotions/:id", apiHandler.AdminUpdatePromotion)
		directAdmin.PATCH("/promotions/:id/status", apiHandler.AdminTogglePromotionStatus)
		directAdmin.DELETE("/promotions/:id", apiHandler.AdminDeletePromotion)

		// Games
		directAdmin.GET("/games", apiHandler.AdminGetGames)
		directAdmin.GET("/games/:id", apiHandler.AdminGetGameDetails)
		directAdmin.PATCH("/games/:id/status", apiHandler.AdminUpdateGameStatus)
		directAdmin.PATCH("/games/:id/config", apiHandler.AdminUpdateGameConfig)

		// System Settings & Announcements
		directAdmin.GET("/system/settings", apiHandler.AdminGetSystemSettings)
		directAdmin.PATCH("/system/settings/:key", apiHandler.AdminUpdateSystemSetting)
		directAdmin.GET("/system/announcements", apiHandler.AdminGetAnnouncements)
		directAdmin.POST("/system/announcements", apiHandler.AdminCreateAnnouncement)
		directAdmin.PATCH("/system/announcements/:id/status", apiHandler.AdminToggleAnnouncementStatus)
		directAdmin.POST("/system/notifications/push", apiHandler.AdminSendPushNotification)

		// Staff & Audit Logs
		directAdmin.GET("/admins", apiHandler.AdminListAdmins)
		directAdmin.POST("/admins", apiHandler.AdminCreateAdmin)
		directAdmin.PATCH("/admins/:id/status", apiHandler.AdminToggleAdminActive)
		directAdmin.GET("/audit-logs", apiHandler.AdminGetAuditLogs)
	}


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
