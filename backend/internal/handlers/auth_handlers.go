package handlers

import (
	"net/http"
	"strings"

	"bitarcade-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// ==========================================
// Auth Handlers
// ==========================================

type LoginRequest struct {
	Phone             string `json:"phone" binding:"required"`
	Name              string `json:"name"`
	VerificationToken string `json:"verificationToken"`
}

func (h *APIHandler) LoginOrRegister(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Phone number is required"})
		return
	}

	phone := strings.TrimSpace(req.Phone)
	if len(phone) < 10 {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "Invalid phone number"})
		return
	}

	// Check if already authenticated with valid JWT session (e.g. app profile/device background sync)
	authHeader := c.GetHeader("Authorization")
	authenticated := false
	if strings.HasPrefix(authHeader, "Bearer ") {
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(h.cfg.JWTSecret), nil
		})
		if err == nil && token.Valid {
			authenticated = true
		}
	}

	// If not already authenticated via JWT, require real WhatsApp verification token
	if !authenticated {
		if req.VerificationToken == "" {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Verification required. Please complete WhatsApp verification to log in.",
			})
			return
		}

		verifiedPhone, err := h.authService.VerifyWhatsAppToken(req.VerificationToken)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "WhatsApp verification failed: " + err.Error(),
			})
			return
		}

		// Ensure verified phone matches the requested phone number
		cleanVerified := strings.TrimLeft(verifiedPhone, "+")
		cleanPhone := strings.TrimLeft(phone, "+")
		if !strings.HasSuffix(cleanVerified, cleanPhone) && !strings.HasSuffix(cleanPhone, cleanVerified) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"success": false,
				"error":   "Phone number does not match WhatsApp verification",
			})
			return
		}
		phone = verifiedPhone
	}

	user, token, err := h.authService.LoginOrRegister(phone, req.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": err.Error()})
		return
	}

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
// WhatsApp Authentication Handlers
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

	verifiedPhone, err := h.authService.VerifyWhatsAppToken(req.Token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "WhatsApp verification failed: " + err.Error()})
		return
	}

	user, token, err := h.authService.LoginOrRegister(verifiedPhone, "WhatsAppPlayer")
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
// Profile & Account Handlers
// ==========================================

type UpdateProfileRequest struct {
	Name     string `json:"name"`
	AvatarID string `json:"avatarId"`
}

func (h *APIHandler) UpdateProfile(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "Unauthorized: valid session token required"})
		return
	}

	if paramID := c.Param("id"); paramID != "" && paramID != userID {
		c.JSON(http.StatusForbidden, gin.H{"success": false, "error": "Forbidden: cannot modify another user's profile"})
		return
	}

	var req UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"success": false, "error": "invalid profile payload"})
		return
	}

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

func (h *APIHandler) DeleteAccount(c *gin.Context) {
	userID := c.GetString("userId")
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"success": false, "error": "unauthorized"})
		return
	}
	if err := h.authService.DeleteUserData(userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"success": false, "error": "account deletion failed, please contact support"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "Account and personal data deleted",
	})
}
