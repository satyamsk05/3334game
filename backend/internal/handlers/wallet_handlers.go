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
			// Fix Audit 6.3: Explicitly document currency equivalence:
			// In the Bit Arcade ledger: 1 Chip = 1 Paisa (100 Chips = ₹1.00 INR).
			// The *Chips fields are canonical; *Paise fields are provided for backwards compatibility.
			"depositChips": wallet.DepositChips,
			"winningChips": wallet.WinningChips,
			"bonusChips":   wallet.BonusChips,
			"totalChips":   wallet.TotalChips(),
			// Backward-compatibility aliases (1 Chip == 1 Paisa)
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

	// Fix (Issue 9.2): Enforce deposit bounds (min ₹10, max ₹50,000) to prevent zero/negative or overflow attacks
	const MinDepositRupees = 10.0
	const MaxDepositRupees = 50000.0
	if req.AmountRupees < MinDepositRupees || req.AmountRupees > MaxDepositRupees {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"error":   fmt.Sprintf("Deposit amount must be between ₹%.0f and ₹%.0f", MinDepositRupees, MaxDepositRupees),
		})
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

type PaymentWebhookPayload struct {
	DepositID string  `json:"depositId"`
	OrderID   string  `json:"orderId"`
	Status    string  `json:"status"` // SUCCESS, APPROVED, FAILED, REJECTED
	UTR       string  `json:"utr"`
	Amount    float64 `json:"amount"`
	Signature string  `json:"signature"`
}

// Fix (Issue 5.3): Server-to-server webhook endpoint for payment gateways to notify deposit results directly
func (h *APIHandler) PaymentWebhook(c *gin.Context) {
	var payload PaymentWebhookPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid webhook payload"})
		return
	}

	depID := payload.DepositID
	if depID == "" {
		depID = payload.OrderID
	}
	if depID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "depositId or orderId is required"})
		return
	}

	status := strings.ToUpper(payload.Status)
	if status == "SUCCESS" || status == "APPROVED" || status == "PAID" {
		if payload.UTR != "" {
			_, _ = h.walletService.SubmitDepositUTR("", depID, payload.UTR)
		}
		dep, err := h.walletService.ApproveDeposit(depID)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Deposit credited successfully via webhook", "depositId": dep.ID})
		return
	}

	if status == "FAILED" || status == "REJECTED" {
		_, _ = h.walletService.RejectDeposit(depID)
		c.JSON(http.StatusOK, gin.H{"success": true, "message": "Deposit marked rejected via webhook", "depositId": depID})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Webhook acknowledged"})
}
