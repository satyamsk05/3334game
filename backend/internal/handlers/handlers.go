package handlers

import (
	"net/http"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// APIHandler is the central HTTP controller bundle, delegating domain logic to sub-handler files:
// - auth_handlers.go   : Authentication, WhatsApp verification, user profile, account deletion
// - wallet_handlers.go : Balance, deposits, UTR submission, withdrawals, promotions
// - admin_handlers.go  : Admin portal, statistics, user management, game config, announcements
type APIHandler struct {
	cfg           *config.Config
	authService   *services.AuthService
	walletService *services.WalletService
}

func NewAPIHandler(cfg *config.Config, authService *services.AuthService, walletService *services.WalletService) *APIHandler {
	return &APIHandler{
		cfg:           cfg,
		authService:   authService,
		walletService: walletService,
	}
}

// ==========================================
// Health & System
// ==========================================

func (h *APIHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "bitarcade-go-backend",
		"version": "1.0.0",
	})
}
