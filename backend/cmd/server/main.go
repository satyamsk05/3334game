package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/database"
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

	// Gin Engine
	gin.SetMode(gin.ReleaseMode)
	router := gin.New()
	router.Use(gin.Recovery())
	router.Use(middleware.CORSMiddleware(cfg))
	router.Use(middleware.SecurityHeadersMiddleware())

	// Public Routes
	router.GET("/api/v1/health", apiHandler.HealthCheck)
	router.GET("/health", apiHandler.HealthCheck)

	// WebSockets
	router.GET("/ws", hub.HandleWebSocket)

	// Auth Group
	authGroup := router.Group("/api/v1/auth")
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
	router.POST("/auth/login", apiHandler.LoginOrRegister)
	router.GET("/auth/status", apiHandler.AuthStatus)
	router.PUT("/auth/profile", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
	router.POST("/auth/whatsapp/initiate", apiHandler.InitiateWhatsApp)
	router.POST("/auth/whatsapp/verify", apiHandler.VerifyWhatsApp)

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
	{
		paymentGroup.POST("/deposits/initiate", middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
		paymentGroup.POST("/deposits/utr", middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
		paymentGroup.POST("/withdraw", middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)
		paymentGroup.POST("/withdraw/request", middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)
	}

	// Alternate direct routes matching legacy app paths
	router.POST("/deposits/initiate", middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
	router.POST("/api/v1/deposits/initiate", middleware.JWTAuthMiddleware(cfg), apiHandler.InitiateDeposit)
	router.POST("/deposits/utr", middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.POST("/api/v1/deposits/utr", middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.POST("/api/v1/deposits/submit-utr", middleware.JWTAuthMiddleware(cfg), apiHandler.SubmitUTR)
	router.POST("/payments/withdraw/request", middleware.JWTAuthMiddleware(cfg), apiHandler.RequestWithdrawal)

	// Users Group & FCM Token
	userGroup := router.Group("/api/v1/users")
	{
		userGroup.PUT("/:id", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
		userGroup.PUT("/profile", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
		userGroup.POST("/fcm-token", apiHandler.UpdateFCMToken)
	}
	router.Group("/users").PUT("/:id", middleware.JWTAuthMiddleware(cfg), apiHandler.UpdateProfile)
	router.POST("/users/fcm-token", apiHandler.UpdateFCMToken)

	// Promotions Group
	router.GET("/api/v1/promotions", apiHandler.GetPromotions)
	router.GET("/api/v1/promotions/active", apiHandler.GetPromotions)
	router.GET("/promotions", apiHandler.GetPromotions)
	router.GET("/promotions/active", apiHandler.GetPromotions)

	// Admin Auth Group
	adminAuth := router.Group("/api/v1/auth/admin")
	{
		adminAuth.POST("/login", apiHandler.AdminLogin)
		adminAuth.POST("/logout", apiHandler.AdminLogout)
	}
	router.POST("/auth/admin/login", apiHandler.AdminLogin)
	router.POST("/auth/admin/logout", apiHandler.AdminLogout)

	// Admin Management Group
	adminGroup := router.Group("/api/v1/admin")
	adminGroup.Use(middleware.AdminAuthMiddleware(cfg))
	{
		adminGroup.GET("/me", apiHandler.AdminMe)
		adminGroup.GET("/dashboard/stats", apiHandler.AdminDashboardStats)
		adminGroup.GET("/dashboard/pending-counts", apiHandler.AdminPendingCounts)

		// Users
		adminGroup.GET("/users", apiHandler.AdminGetUsers)
		adminGroup.GET("/users/:id", apiHandler.AdminGetUserDetails)
		adminGroup.POST("/users/:id/ban", apiHandler.AdminToggleBan)
		adminGroup.POST("/users/:id/adjust-wallet", apiHandler.AdminAdjustWallet)

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
		adminGroup.GET("/promotions", apiHandler.GetPromotions)
		adminGroup.GET("/system/health", apiHandler.AdminSystemHealth)
	}

	// Direct aliases for Admin Panel Next.js proxy
	directAdmin := router.Group("/admin")
	directAdmin.Use(middleware.AdminAuthMiddleware(cfg))
	{
		directAdmin.GET("/me", apiHandler.AdminMe)
		directAdmin.GET("/dashboard/stats", apiHandler.AdminDashboardStats)
		directAdmin.GET("/dashboard/pending-counts", apiHandler.AdminPendingCounts)
		directAdmin.GET("/users", apiHandler.AdminGetUsers)
		directAdmin.GET("/users/:id", apiHandler.AdminGetUserDetails)
		directAdmin.POST("/users/:id/ban", apiHandler.AdminToggleBan)
		directAdmin.POST("/users/:id/adjust-wallet", apiHandler.AdminAdjustWallet)
		directAdmin.GET("/deposits", apiHandler.AdminGetDeposits)
		directAdmin.POST("/deposits/approve", apiHandler.AdminApproveDeposit)
		directAdmin.POST("/deposits/reject", apiHandler.AdminRejectDeposit)
		directAdmin.GET("/withdrawals", apiHandler.AdminGetWithdrawals)
		directAdmin.POST("/withdrawals/approve", apiHandler.AdminApproveWithdrawal)
		directAdmin.POST("/withdrawals/reject", apiHandler.AdminRejectWithdrawal)
		directAdmin.POST("/withdrawals/process", apiHandler.AdminApproveWithdrawal)
		directAdmin.GET("/ledger/overview", apiHandler.AdminDashboardStats)
		directAdmin.GET("/ledger/transactions", apiHandler.AdminGetLedger)
		directAdmin.GET("/promotions", apiHandler.GetPromotions)
		directAdmin.GET("/system/health", apiHandler.AdminSystemHealth)
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
