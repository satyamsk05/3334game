package handlers

import (
	"fmt"
	"net/http"

	"bitarcade-backend/internal/services"

	"github.com/gin-gonic/gin"
)

// ==========================================
// VIP Status & Rewards Handlers
// ==========================================

func (h *APIHandler) GetVIPStatus(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = c.Query("userId")
	}
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	status, err := h.vipService.GetVIPStatus(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    status,
	})
}

type ClaimVIPUpgradeRequest struct {
	Level int `json:"level" binding:"required"`
}

func (h *APIHandler) ClaimVIPUpgrade(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	var req ClaimVIPUpgradeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "VIP level is required"})
		return
	}

	bonusRupees, err := h.vipService.ClaimUpgradeReward(userID, req.Level)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("VIP Level %d Upgrade Bonus of ₹%.2f credited to your wallet!", req.Level, bonusRupees),
		"bonusRupees": bonusRupees,
		"bonusChips": int64(bonusRupees * 100),
	})
}

func (h *APIHandler) ClaimVIPWeekly(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	bonusRupees, err := h.vipService.ClaimWeeklyReward(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("VIP Weekly Bonus of ₹%.2f credited to your wallet!", bonusRupees),
		"bonusRupees": bonusRupees,
		"bonusChips": int64(bonusRupees * 100),
	})
}

func (h *APIHandler) ClaimVIPMonthly(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	bonusRupees, err := h.vipService.ClaimMonthlyReward(userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("VIP Monthly Bonus of ₹%.2f credited to your wallet!", bonusRupees),
		"bonusRupees": bonusRupees,
		"bonusChips": int64(bonusRupees * 100),
	})
}

// ==========================================
// Permanent Bank & UPI Account Handlers
// ==========================================

func (h *APIHandler) GetBankAccount(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		userID = c.Query("userId")
	}
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	bank, err := h.bankService.GetBankAccount(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bank,
		"isBound": bank != nil,
	})
}

func (h *APIHandler) BindBankAccount(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	var req services.BindBankRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid bank details payload"})
		return
	}

	bank, err := h.bankService.BindBankAccount(userID, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    bank,
		"message": "Withdrawal account permanently bound and locked. Modifications are only permitted via Customer Support.",
	})
}

type AdminUnbindBankRequest struct {
	Reason string `json:"reason"`
}

func (h *APIHandler) AdminUnbindBankAccount(c *gin.Context) {
	adminUser := c.GetString("adminUser")
	if adminUser == "" {
		adminUser = "admin"
	}
	targetUserID := c.Param("id")
	if targetUserID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "User ID is required"})
		return
	}

	var req AdminUnbindBankRequest
	_ = c.ShouldBindJSON(&req)
	if req.Reason == "" {
		req.Reason = "Unbound by administrative support"
	}

	err := h.bankService.AdminUnbindBankAccount(targetUserID, adminUser, req.Reason)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": fmt.Sprintf("Bank account for user %s successfully unbound and deleted", targetUserID),
	})
}
