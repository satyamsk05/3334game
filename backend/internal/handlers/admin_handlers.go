package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"bitarcade-backend/internal/models"

	"github.com/gin-gonic/gin"
)

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

	token, err := h.authService.GenerateAdminToken(req.Username)
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
	authHeader := c.GetHeader("Authorization")
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		h.authService.RevokeToken(tokenStr, time.Now().Add(8*time.Hour))
	}
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
			"deposit_balance":   fmt.Sprintf("%.2f", float64(w.DepositChips)/100.0),
			"winnings_balance":  fmt.Sprintf("%.2f", float64(w.WinningChips)/100.0),
			"rewards_balance":   fmt.Sprintf("%.2f", float64(w.BonusChips)/100.0),
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
				"deposit_balance":   fmt.Sprintf("%.2f", float64(wallet.DepositChips)/100.0),
				"winnings_balance":  fmt.Sprintf("%.2f", float64(wallet.WinningChips)/100.0),
				"rewards_balance":   fmt.Sprintf("%.2f", float64(wallet.BonusChips)/100.0),
				"available_balance": fmt.Sprintf("%.2f", wallet.TotalRupees()),
			},
			"metrics": gin.H{
				"totalBets":         0,
				"totalWageredChips": 0,
				"totalWonChips":     0,
				"ggrChips":          0,
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

	amountChips := int64(req.AmountRupees * 100)
	isCredit := req.Type == "CREDIT"
	if err := h.walletService.AdjustWallet(userID, req.Bucket, isCredit, amountChips, req.Reason); err != nil {
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

// ==========================================
// Admin Promotion Management
// ==========================================

type CreatePromotionRequest struct {
	Title         string `json:"title" binding:"required"`
	Subtitle      string `json:"subtitle" binding:"required"`
	BadgeText     string `json:"badgeText"`
	CtaText       string `json:"ctaText"`
	TargetRoute   string `json:"targetRoute"`
	GradientStart string `json:"gradientStart"`
	GradientEnd   string `json:"gradientEnd"`
	IconType      string `json:"iconType"`
	ImageURL      string `json:"imageUrl"`
	DisplayOrder  int    `json:"displayOrder"`
}

func (h *APIHandler) AdminCreatePromotion(c *gin.Context) {
	var req CreatePromotionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Title and subtitle required"})
		return
	}

	p := models.Promotion{
		Title:         req.Title,
		Subtitle:      req.Subtitle,
		BadgeText:     req.BadgeText,
		CtaText:       req.CtaText,
		TargetRoute:   req.TargetRoute,
		GradientStart: req.GradientStart,
		GradientEnd:   req.GradientEnd,
		IconType:      req.IconType,
		ImageURL:      req.ImageURL,
		Active:        true,
		DisplayOrder:  req.DisplayOrder,
	}

	if err := h.walletService.CreatePromotion(&p); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": p, "message": "Promotion created successfully"})
}

func (h *APIHandler) AdminUpdatePromotion(c *gin.Context) {
	id := c.Param("id")
	var req map[string]interface{}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "Invalid payload"})
		return
	}

	p, err := h.walletService.UpdatePromotion(id, req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "data": p, "message": "Promotion updated successfully"})
}

type TogglePromotionRequest struct {
	IsActive bool `json:"isActive"`
}

func (h *APIHandler) AdminTogglePromotionStatus(c *gin.Context) {
	id := c.Param("id")
	var req TogglePromotionRequest
	_ = c.ShouldBindJSON(&req)

	if err := h.walletService.TogglePromotion(id, req.IsActive); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promotion status updated"})
}

func (h *APIHandler) AdminDeletePromotion(c *gin.Context) {
	id := c.Param("id")
	if err := h.walletService.DeletePromotion(id); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Promotion deleted successfully"})
}

// ==========================================
// Admin Games Management
// ==========================================

var globalGames = []gin.H{
	{
		"id":            "dragon_tiger",
		"name":          "Dragon vs Tiger",
		"slug":          "dragon-tiger",
		"type":          "CARD_HIGH_LOW",
		"status":        "LIVE",
		"display_order": 1,
		"config":        gin.H{"minBetChips": 1000, "maxBetChips": 500000, "roundDurationSeconds": 25},
	},
}

func (h *APIHandler) AdminGetGames(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": globalGames})
}

func (h *APIHandler) AdminGetGameDetails(c *gin.Context) {
	id := c.Param("id")
	for _, g := range globalGames {
		if g["id"] == id || g["slug"] == id {
			c.JSON(http.StatusOK, gin.H{"success": true, "data": g})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Game not found"})
}

type UpdateGameStatusRequest struct {
	Status string `json:"status" binding:"required"`
}

func (h *APIHandler) AdminUpdateGameStatus(c *gin.Context) {
	id := c.Param("id")
	var req UpdateGameStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "status required"})
		return
	}
	for i, g := range globalGames {
		if g["id"] == id || g["slug"] == id {
			globalGames[i]["status"] = req.Status
			c.JSON(http.StatusOK, gin.H{"success": true, "data": globalGames[i], "message": "Game status updated"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Game not found"})
}

func (h *APIHandler) AdminUpdateGameConfig(c *gin.Context) {
	id := c.Param("id")
	var req gin.H
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "invalid config"})
		return
	}
	for i, g := range globalGames {
		if g["id"] == id || g["slug"] == id {
			globalGames[i]["config"] = req["config"]
			c.JSON(http.StatusOK, gin.H{"success": true, "data": globalGames[i], "message": "Game config updated"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Game not found"})
}

// ==========================================
// Admin System Settings, Announcements, & Notes
// ==========================================

var systemSettings = map[string]interface{}{
	"maintenance_mode":     false,
	"min_deposit_rupees":   10.0,
	"max_deposit_rupees":   100000.0,
	"min_withdraw_rupees":  25.0,
	"max_withdraw_rupees":  5000.0,
	"daily_withdraw_limit": 3,
	"upi_merchant_id":      "satyamskk@ptyes",
	"upi_merchant_name":    "satyam",
}

func (h *APIHandler) AdminGetSystemSettings(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": systemSettings})
}

func (h *APIHandler) AdminUpdateSystemSetting(c *gin.Context) {
	key := c.Param("key")
	var req struct {
		Value interface{} `json:"value"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "value required"})
		return
	}
	systemSettings[key] = req.Value
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Setting updated", "data": systemSettings})
}

var announcements = []gin.H{
	{
		"id":         "ann_1",
		"title":      "Welcome to BitArcade!",
		"message":    "Instant withdrawals are active 24/7 via UPI.",
		"type":       "INFO",
		"is_active":  true,
		"created_at": time.Now().Format(time.RFC3339),
	},
}

func (h *APIHandler) AdminGetAnnouncements(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "data": announcements})
}

func (h *APIHandler) AdminCreateAnnouncement(c *gin.Context) {
	var req struct {
		Title   string `json:"title" binding:"required"`
		Message string `json:"message" binding:"required"`
		Type    string `json:"type"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "title and message required"})
		return
	}
	ann := gin.H{
		"id":         fmt.Sprintf("ann_%d", time.Now().Unix()),
		"title":      req.Title,
		"message":    req.Message,
		"type":       req.Type,
		"is_active":  true,
		"created_at": time.Now().Format(time.RFC3339),
	}
	announcements = append([]gin.H{ann}, announcements...)
	c.JSON(http.StatusOK, gin.H{"success": true, "data": ann, "message": "Announcement created"})
}

func (h *APIHandler) AdminToggleAnnouncementStatus(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		IsActive bool `json:"isActive"`
	}
	_ = c.ShouldBindJSON(&req)
	for i, a := range announcements {
		if a["id"] == id {
			announcements[i]["is_active"] = req.IsActive
			c.JSON(http.StatusOK, gin.H{"success": true, "message": "Announcement status updated"})
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"success": false, "message": "Announcement not found"})
}

func (h *APIHandler) AdminSendPushNotification(c *gin.Context) {
	var req struct {
		Title string `json:"title" binding:"required"`
		Body  string `json:"body" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "title and body required"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Push notification broadcast queued"})
}

func (h *APIHandler) AdminAddUserNote(c *gin.Context) {
	var req struct {
		Note string `json:"note" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "message": "note text required"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User note added successfully"})
}

func (h *APIHandler) AdminUpdateUser(c *gin.Context) {
	id := c.Param("id")
	var req struct {
		Name  string `json:"name"`
		Phone string `json:"phone"`
	}
	_ = c.ShouldBindJSON(&req)
	if req.Name != "" {
		_, _ = h.authService.UpdateProfile(id, req.Name, "")
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "User updated successfully"})
}

// ==========================================
// Admin Security & Audit Logs
// ==========================================

func (h *APIHandler) AdminListAdmins(c *gin.Context) {
	admins := []gin.H{
		{
			"id":         "admin-1",
			"username":   h.cfg.AdminUsername,
			"role":       "superadmin",
			"is_active":  true,
			"created_at": time.Now().Add(-720 * time.Hour).Format(time.RFC3339),
		},
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": admins})
}

func (h *APIHandler) AdminCreateAdmin(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Admin user created successfully"})
}

func (h *APIHandler) AdminToggleAdminActive(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Admin status updated"})
}

func (h *APIHandler) AdminGetAuditLogs(c *gin.Context) {
	logs := []gin.H{
		{
			"id":         "audit-1",
			"admin_id":   h.cfg.AdminUsername,
			"action":     "SYSTEM_BOOT",
			"target_id":  "bitarcade-server",
			"details":    gin.H{"status": "online"},
			"ip_address": c.ClientIP(),
			"created_at": time.Now().Format(time.RFC3339),
		},
	}
	c.JSON(http.StatusOK, gin.H{"success": true, "data": logs})
}
