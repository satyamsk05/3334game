package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

// ==========================================
// Wallet & Financial Handlers
// ==========================================

func (h *APIHandler) GetBalance(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	wallet, err := h.walletService.GetOrCreateWallet(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"userId":       wallet.UserID,
			"depositChips": wallet.DepositChips,
			"winningChips": wallet.WinningChips,
			"bonusChips":   wallet.BonusChips,
			"totalChips":   wallet.TotalChips(),
			// Backward-compatibility aliases
			"depositPaise": wallet.DepositChips,
			"winningPaise": wallet.WinningChips,
			"bonusPaise":   wallet.BonusChips,
			"totalPaise":   wallet.TotalChips(),
			"totalRupees":  wallet.TotalRupees(),
		},
	})
}

func (h *APIHandler) GetTransactions(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "50"))
	txns := h.walletService.GetTransactions(userID, limit)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    txns,
	})
}

type InitiateDepositRequest struct {
	AmountRupees float64 `json:"amountRupees" binding:"required"`
}

func (h *APIHandler) InitiateDeposit(c *gin.Context) {
	userID := c.GetString("userId")
	var req InitiateDepositRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Valid amountRupees required"})
		return
	}

	dep, err := h.walletService.CreateDepositRequest(userID, req.AmountRupees)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"depositId":    dep.ID,
			"orderId":      dep.ID,
			"amountRupees": dep.AmountRupees,
			"paymentUrl":   "/pay?orderId=" + dep.ID + "&amount=" + fmt.Sprintf("%.2f", dep.AmountRupees),
			"payUrl":       "/pay?orderId=" + dep.ID + "&amount=" + fmt.Sprintf("%.2f", dep.AmountRupees),
		},
	})
}

func (h *APIHandler) GetDepositStatus(c *gin.Context) {
	depositID := c.Query("depositId")
	if depositID == "" {
		depositID = c.Query("orderId")
	}
	if depositID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "depositId or orderId is required"})
		return
	}

	dep, err := h.walletService.GetDeposit(depositID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "Deposit not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"depositId":    dep.ID,
			"orderId":      dep.ID,
			"amountRupees": dep.AmountRupees,
			"status":       dep.Status,
			"utr":          dep.UTR,
			"createdAt":    dep.CreatedAt,
			"updatedAt":    dep.UpdatedAt,
		},
	})
}

type SubmitUTRRequest struct {
	DepositID string `json:"depositId" binding:"required"`
	UTR       string `json:"utr" binding:"required"`
}

func (h *APIHandler) SubmitUTR(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	var req SubmitUTRRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "depositId and utr required"})
		return
	}

	utrClean := strings.TrimSpace(req.UTR)
	if len(utrClean) < 6 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid UTR number format"})
		return
	}

	dep, err := h.walletService.SubmitDepositUTR(userID, req.DepositID, utrClean)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    dep,
		"message": "UTR submitted successfully, awaiting approval",
	})
}

type WithdrawalRequest struct {
	AmountRupees float64 `json:"amountRupees" binding:"required"`
	UPIID        string  `json:"upiId" binding:"required"`
}

func (h *APIHandler) RequestWithdrawal(c *gin.Context) {
	userID := c.GetString("userId")
	var req WithdrawalRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "amountRupees and upiId required"})
		return
	}

	amountPaise := int64(req.AmountRupees * 100)
	wd, err := h.walletService.RequestWithdrawal(userID, req.UPIID, amountPaise)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    wd,
		"message": "Withdrawal request submitted successfully",
	})
}

func (h *APIHandler) GetPromotions(c *gin.Context) {
	promos := h.walletService.GetAllPromotions()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    promos,
	})
}
