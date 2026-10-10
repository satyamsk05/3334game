package services

import (
	"errors"
	"fmt"
	"math/rand"
	"net/url"
	"sync"
	"time"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AuthService struct {
	cfg      *config.Config
	bundle   *database.DBBundle
	mu       sync.Mutex
	memUsers map[string]*models.User
}

func NewAuthService(cfg *config.Config, bundle *database.DBBundle) *AuthService {
	return &AuthService{
		cfg:      cfg,
		bundle:   bundle,
		memUsers: make(map[string]*models.User),
	}
}

func (s *AuthService) LoginOrRegister(phone, name string) (*models.User, string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if phone == "" {
		return nil, "", errors.New("phone number is required")
	}

	var user models.User
	if s.bundle.DB != nil {
		res := s.bundle.DB.Where("phone = ?", phone).First(&user)
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			userID := fmt.Sprintf("USR-%s", uuid.New().String()[:8])
			if name == "" {
				name = "Player_" + phone[max(0, len(phone)-4):]
			}
			user = models.User{
				ID:        userID,
				Phone:     phone,
				Name:      name,
				AvatarID:  "avatar_1",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			if err := s.bundle.DB.Create(&user).Error; err != nil {
				return nil, "", err
			}
		} else if res.Error != nil {
			return nil, "", res.Error
		}
	} else {
		// In-memory fallback
		found := false
		for _, u := range s.memUsers {
			if u.Phone == phone {
				user = *u
				found = true
				break
			}
		}
		if !found {
			userID := fmt.Sprintf("USR-%s", uuid.New().String()[:8])
			if name == "" {
				name = "Player_" + phone[max(0, len(phone)-4):]
			}
			user = models.User{
				ID:        userID,
				Phone:     phone,
				Name:      name,
				AvatarID:  "avatar_1",
				CreatedAt: time.Now(),
				UpdatedAt: time.Now(),
			}
			s.memUsers[user.ID] = &user
		}
	}

	// Generate JWT
	token, err := s.GenerateToken(user.ID, "user")
	if err != nil {
		return nil, "", err
	}

	return &user, token, nil
}

func (s *AuthService) GenerateToken(userID, role string) (string, error) {
	claims := jwt.MapClaims{
		"userId": userID,
		"sub":    userID,
		"role":   role,
		"exp":    time.Now().Add(30 * 24 * time.Hour).Unix(),
		"iat":    time.Now().Unix(),
	}

	secret := s.cfg.JWTSecret
	if role == "admin" {
		secret = s.cfg.AdminJWTSecret
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secret))
}

func (s *AuthService) GetUser(userID string) (*models.User, error) {
	if s.bundle.DB != nil {
		var user models.User
		if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.memUsers[userID]
	if !ok {
		return nil, errors.New("user not found")
	}
	return u, nil
}

func (s *AuthService) GetUserByPhone(phone string) (*models.User, error) {
	if phone == "" {
		return nil, errors.New("phone required")
	}
	if s.bundle.DB != nil {
		var user models.User
		if err := s.bundle.DB.Where("phone = ?", phone).First(&user).Error; err != nil {
			return nil, err
		}
		return &user, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	for _, u := range s.memUsers {
		if u.Phone == phone {
			return u, nil
		}
	}
	return nil, errors.New("user not found")
}

func (s *AuthService) UpdateProfile(userID, name, avatarID string) (*models.User, error) {
	if s.bundle.DB != nil {
		var user models.User
		if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			return nil, err
		}
		if name != "" {
			user.Name = name
		}
		if avatarID != "" {
			user.AvatarID = avatarID
		}
		user.UpdatedAt = time.Now()
		_ = s.bundle.DB.Save(&user)
		return &user, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.memUsers[userID]
	if !ok {
		return nil, errors.New("user not found")
	}
	if name != "" {
		u.Name = name
	}
	if avatarID != "" {
		u.AvatarID = avatarID
	}
	u.UpdatedAt = time.Now()
	return u, nil
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func (s *AuthService) InitiateWhatsAppAuth(appKeyOverride string) (string, string) {
	appKey := s.cfg.LogginAppKey
	if appKeyOverride != "" {
		appKey = appKeyOverride
	}
	if appKey == "" {
		appKey = "BITARCADE"
	}

	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
	randPart := make([]byte, 6)
	for i := range randPart {
		randPart[i] = chars[rand.Intn(len(chars))]
	}
	token := fmt.Sprintf("%s-%s", appKey, string(randPart))

	businessPhone := "919989907408"
	msg := fmt.Sprintf("Please do not edit this message.\nLOGGIN %s", token)
	waLink := fmt.Sprintf("https://wa.me/%s?text=%s", businessPhone, url.QueryEscape(msg))

	return token, waLink
}

func (s *AuthService) GetAllUsers(limit int) []models.User {
	if limit <= 0 {
		limit = 100
	}
	if s.bundle.DB != nil {
		var users []models.User
		s.bundle.DB.Order("created_at desc").Limit(limit).Find(&users)
		return users
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	var list []models.User
	for _, u := range s.memUsers {
		list = append(list, *u)
	}
	return list
}

func (s *AuthService) ToggleBan(userID string, isBlocked bool, reason string) error {
	if s.bundle.DB != nil {
		var user models.User
		if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
			return errors.New("user not found")
		}
		user.IsBlocked = isBlocked
		user.IsBanned = isBlocked
		user.UpdatedAt = time.Now()
		return s.bundle.DB.Save(&user).Error
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	u, ok := s.memUsers[userID]
	if !ok {
		return errors.New("user not found")
	}
	u.IsBlocked = isBlocked
	u.IsBanned = isBlocked
	u.UpdatedAt = time.Now()
	return nil
}

func (s *AuthService) GetUserStats() (int, int, int) {
	total := 0
	active := 0
	banned := 0

	if s.bundle.DB != nil {
		var totalCount int64
		var bannedCount int64
		s.bundle.DB.Model(&models.User{}).Count(&totalCount)
		s.bundle.DB.Model(&models.User{}).Where("is_blocked = ? OR is_banned = ?", true, true).Count(&bannedCount)
		total = int(totalCount)
		banned = int(bannedCount)
		active = total - banned
	} else {
		s.mu.Lock()
		for _, u := range s.memUsers {
			total++
			if u.IsBlocked || u.IsBanned {
				banned++
			} else {
				active++
			}
		}
		s.mu.Unlock()
	}
	return total, active, banned
}

