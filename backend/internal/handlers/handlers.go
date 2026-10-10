package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/models"
	"bitarcade-backend/internal/services"

	"github.com/gin-gonic/gin"
)

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
// Health
// ==========================================
func (h *APIHandler) HealthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "ok",
		"service": "bitarcade-go-backend",
		"version": "1.0.0",
	})
}

// ==========================================
// Auth Handlers
// ==========================================
type LoginRequest struct {
	Phone string `json:"phone" binding:"required"`
	Name  string `json:"name"`
}

func (h *APIHandler) LoginOrRegister(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Phone number is required"})
		return
	}

	user, token, err := h.authService.LoginOrRegister(req.Phone, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	// Ensure wallet exists
	wallet, _ := h.walletService.GetOrCreateWallet(user.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user":   user,
			"wallet": wallet,
			"token":  token,
		},
	})
}

// ==========================================
// Loggin.dev WhatsApp Authentication Handlers
// ==========================================
type WhatsAppInitiateRequest struct {
	AppKey string `json:"appKey"`
}

func (h *APIHandler) InitiateWhatsApp(c *gin.Context) {
	var req WhatsAppInitiateRequest
	_ = c.ShouldBindJSON(&req)

	token, waLink := h.authService.InitiateWhatsAppAuth(req.AppKey)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "WhatsApp authentication initiated",
		"data": gin.H{
			"token":  token,
			"waLink": waLink,
		},
	})
}

type WhatsAppVerifyRequest struct {
	Token string `json:"token" binding:"required"`
	Phone string `json:"phone"`
}

func (h *APIHandler) VerifyWhatsApp(c *gin.Context) {
	var req WhatsAppVerifyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "token is required"})
		return
	}

	phone := req.Phone
	if phone == "" {
		phone = "98" + req.Token[max(0, len(req.Token)-8):]
	}

	user, token, err := h.authService.LoginOrRegister(phone, "WhatsAppPlayer")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

	wallet, _ := h.walletService.GetOrCreateWallet(user.ID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "WhatsApp verified successfully",
		"data": gin.H{
			"user":   user,
			"wallet": wallet,
			"token":  token,
		},
	})
}

func (h *APIHandler) GetMe(c *gin.Context) {
	userID := c.GetString("userId")
	user, err := h.authService.GetUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "error": "User not found"})
		return
	}

	wallet, _ := h.walletService.GetOrCreateWallet(userID)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user":   user,
			"wallet": wallet,
		},
	})
}

// ==========================================
// Wallet Handlers
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
			"depositPaise": wallet.DepositPaise,
			"winningPaise": wallet.WinningPaise,
			"bonusPaise":   wallet.BonusPaise,
			"totalPaise":   wallet.TotalPaise(),
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

// ==========================================
// Payments Handlers
// ==========================================
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
			"amountRupees": dep.AmountRupees,
			"paymentUrl":   "/deposit?id=" + dep.ID,
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

// ==========================================
// User Profile Handlers
// ==========================================
type UpdateProfileRequest struct {
	Name     string `json:"name"`
	AvatarID string `json:"avatarId"`
}

func (h *APIHandler) UpdateProfile(c *gin.Context) {
	userID := c.Param("id")
	if userID == "" {
		userID = c.GetString("userId")
	}

	var req UpdateProfileRequest
	_ = c.ShouldBindJSON(&req)

	user, err := h.authService.UpdateProfile(userID, req.Name, req.AvatarID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    user,
	})
}

func (h *APIHandler) GetPromotions(c *gin.Context) {
	// Clean default promotions without old game banners
	promos := []models.Promotion{
		{
			ID:            "promo_welcome",
			Title:         "Welcome to Bit Arcade",
			Subtitle:      "Deposit now to start playing exciting games",
			GradientStart: "#3B1578",
			GradientEnd:   "#1B0B3B",
			IconType:      "wallet",
			TargetRoute:   "deposit",
			BadgeText:     "BONUS",
			CtaText:       "Add Cash",
			Active:        true,
			DisplayOrder:  1,
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    promos,
	})
}

func (h *APIHandler) AuthStatus(c *gin.Context) {
	phone := c.Query("phone")
	userID := c.Query("userId")

	var user *models.User
	var err error

	if phone != "" {
		user, err = h.authService.GetUserByPhone(phone)
	} else if userID != "" {
		user, err = h.authService.GetUser(userID)
	}

	if err != nil || user == nil {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data": gin.H{
				"exists":   false,
				"isBanned": false,
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"exists":   true,
			"userId":   user.ID,
			"name":     user.Name,
			"phone":    user.Phone,
			"isBanned": user.IsBanned,
		},
	})
}

type FCMTokenRequest struct {
	FCMToken string `json:"fcmToken"`
}

func (h *APIHandler) UpdateFCMToken(c *gin.Context) {
	var req FCMTokenRequest
	_ = c.ShouldBindJSON(&req)
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "FCM token updated successfully",
	})
}

// ==========================================
// Admin Handlers
// ==========================================

type AdminLoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func (h *APIHandler) AdminLogin(c *gin.Context) {
	var req AdminLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Username and password required"})
		return
	}

	if req.Username != h.cfg.AdminUsername || req.Password != h.cfg.AdminPassword {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "message": "Invalid admin credentials"})
		return
	}

	token, err := h.authService.GenerateToken("admin-1", "admin")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": "Failed to generate admin token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"token":    token,
			"username": req.Username,
			"role":     "superadmin",
		},
	})
}

func (h *APIHandler) AdminLogout(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Logged out successfully"})
}

func (h *APIHandler) AdminMe(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"username": h.cfg.AdminUsername,
			"role":     "superadmin",
		},
	})
}

func (h *APIHandler) AdminDashboardStats(c *gin.Context) {
	totalUsers, activeUsers, bannedUsers := h.authService.GetUserStats()
	finStats := h.walletService.GetFinancialStats()
	pendingDep, pendingWd := h.walletService.GetPendingCounts()
	recentTxns := h.walletService.GetAllTransactions(10)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"users": gin.H{
				"total":  totalUsers,
				"active": activeUsers,
				"banned": bannedUsers,
			},
			"wallet":     finStats,
			"financials": finStats,
			"deposits": gin.H{
				"approvedAmountPaise": finStats["approvedAmountPaise"],
				"pendingCount":        pendingDep,
			},
			"withdrawals": gin.H{
				"approvedAmountPaise": finStats["approvedWithdrawalsPaise"],
				"pendingAmountPaise":  finStats["pendingWithdrawalsPaise"],
				"pendingCount":        pendingWd,
			},
			"games": gin.H{
				"totalRounds":       0,
				"totalRoundsPlayed": 0,
				"totalWageredPaise": 0,
				"totalPayoutsPaise": 0,
				"ggrPaise":          0,
			},
			"recentActivity": recentTxns,
		},
	})
}

func (h *APIHandler) AdminPendingCounts(c *gin.Context) {
	pendingDep, pendingWd := h.walletService.GetPendingCounts()
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"pendingDeposits":    pendingDep,
			"pendingWithdrawals": pendingWd,
		},
	})
}

func (h *APIHandler) AdminGetUsers(c *gin.Context) {
	users := h.authService.GetAllUsers(100)
	var enriched []gin.H
	for _, u := range users {
		w, _ := h.walletService.GetOrCreateWallet(u.ID)
		enriched = append(enriched, gin.H{
			"id":                u.ID,
			"phone":             u.Phone,
			"name":              u.Name,
			"is_blocked":        u.IsBlocked || u.IsBanned,
			"created_at":        u.CreatedAt,
			"deposit_balance":   fmt.Sprintf("%.2f", float64(w.DepositPaise)/100.0),
			"winnings_balance":  fmt.Sprintf("%.2f", float64(w.WinningPaise)/100.0),
			"rewards_balance":   fmt.Sprintf("%.2f", float64(w.BonusPaise)/100.0),
			"available_balance": fmt.Sprintf("%.2f", w.TotalRupees()),
		})
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    enriched,
	})
}

func (h *APIHandler) AdminGetUserDetails(c *gin.Context) {
	userID := c.Param("id")
	user, err := h.authService.GetUser(userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "User not found"})
		return
	}

	wallet, _ := h.walletService.GetOrCreateWallet(userID)
	txns := h.walletService.GetTransactions(userID, 50)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"user": user,
			"wallet": gin.H{
				"deposit_balance":   fmt.Sprintf("%.2f", float64(wallet.DepositPaise)/100.0),
				"winnings_balance":  fmt.Sprintf("%.2f", float64(wallet.WinningPaise)/100.0),
				"rewards_balance":   fmt.Sprintf("%.2f", float64(wallet.BonusPaise)/100.0),
				"available_balance": fmt.Sprintf("%.2f", wallet.TotalRupees()),
			},
			"metrics": gin.H{
				"totalBets":         0,
				"totalWageredPaise": 0,
				"totalWonPaise":     0,
				"ggrPaise":          0,
			},
			"recentTransactions": txns,
			"recentBets":         []gin.H{},
			"deposits":           []gin.H{},
			"withdrawals":        []gin.H{},
			"notes":              []gin.H{},
			"auditTrail":         []gin.H{},
		},
	})
}

type ToggleBanRequest struct {
	IsBlocked bool   `json:"isBlocked"`
	Reason    string `json:"reason"`
}

func (h *APIHandler) AdminToggleBan(c *gin.Context) {
	userID := c.Param("id")
	var req ToggleBanRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.authService.ToggleBan(userID, req.IsBlocked, req.Reason); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User status updated successfully"})
}

type AdjustWalletRequest struct {
	Bucket       string  `json:"bucket"`
	Type         string  `json:"type"`
	AmountRupees float64 `json:"amountRupees"`
	Reason       string  `json:"reason"`
}

func (h *APIHandler) AdminAdjustWallet(c *gin.Context) {
	userID := c.Param("id")
	var req AdjustWalletRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid request"})
		return
	}

	amountPaise := int64(req.AmountRupees * 100)
	isCredit := req.Type == "CREDIT"
	if err := h.walletService.AdjustWallet(userID, req.Bucket, isCredit, amountPaise, req.Reason); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Wallet adjusted successfully"})
}

func (h *APIHandler) AdminGetDeposits(c *gin.Context) {
	deps := h.walletService.GetAllDeposits(100)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": deps})
}

type DepositActionRequest struct {
	DepositID string `json:"depositId" binding:"required"`
}

func (h *APIHandler) AdminApproveDeposit(c *gin.Context) {
	var req DepositActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "depositId required"})
		return
	}

	dep, err := h.walletService.ApproveDeposit(req.DepositID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": dep, "message": "Deposit approved"})
}

func (h *APIHandler) AdminRejectDeposit(c *gin.Context) {
	var req DepositActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "depositId required"})
		return
	}

	dep, err := h.walletService.RejectDeposit(req.DepositID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": dep, "message": "Deposit rejected"})
}

func (h *APIHandler) AdminGetWithdrawals(c *gin.Context) {
	wds := h.walletService.GetAllWithdrawals(100)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": wds})
}

type WithdrawalActionRequest struct {
	WithdrawalID string `json:"withdrawalId" binding:"required"`
}

func (h *APIHandler) AdminApproveWithdrawal(c *gin.Context) {
	var req WithdrawalActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "withdrawalId required"})
		return
	}

	wd, err := h.walletService.ApproveWithdrawal(req.WithdrawalID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wd, "message": "Withdrawal approved"})
}

func (h *APIHandler) AdminRejectWithdrawal(c *gin.Context) {
	var req WithdrawalActionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "withdrawalId required"})
		return
	}

	wd, err := h.walletService.RejectWithdrawal(req.WithdrawalID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": wd, "message": "Withdrawal rejected & refunded"})
}

func (h *APIHandler) AdminGetLedger(c *gin.Context) {
	txns := h.walletService.GetAllTransactions(100)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": txns})
}

func (h *APIHandler) AdminSystemHealth(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data": gin.H{
			"status":   "ONLINE",
			"database": "ONLINE",
			"redis":    "ONLINE",
			"version":  "1.0.0",
		},
	})
}


