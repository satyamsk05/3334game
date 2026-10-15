package services

import (
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/models"

	"github.com/google/uuid"
)

type BindBankRequest struct {
	AccountHolderName string `json:"accountHolderName"`
	AccountNumber     string `json:"accountNumber"`
	IFSC              string `json:"ifsc"`
	BankName          string `json:"bankName"`
	UPIID             string `json:"upiId"`
}

type BankService struct {
	bundle *database.DBBundle
	mu     sync.Mutex
}

func NewBankService(bundle *database.DBBundle) *BankService {
	return &BankService{bundle: bundle}
}

func (s *BankService) GetBankAccount(userID string) (*models.BankAccount, error) {
	if s.bundle.DB == nil || userID == "" {
		return nil, errors.New("database unavailable")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var bank models.BankAccount
	if err := s.bundle.DB.Where("user_id = ?", userID).First(&bank).Error; err != nil {
		return nil, nil // Not bound yet
	}
	return &bank, nil
}

// BindBankAccount binds bank or UPI details permanently.
// If already bound, user is locked out from editing/deleting.
func (s *BankService) BindBankAccount(userID string, req BindBankRequest) (*models.BankAccount, error) {
	if s.bundle.DB == nil || userID == "" {
		return nil, errors.New("database unavailable")
	}

	upiClean := strings.TrimSpace(req.UPIID)
	accClean := strings.TrimSpace(req.AccountNumber)
	if upiClean == "" && accClean == "" {
		return nil, errors.New("either a valid UPI ID or Bank Account Number is required")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var existing models.BankAccount
	err := s.bundle.DB.Where("user_id = ?", userID).First(&existing).Error
	if err == nil {
		if existing.IsLocked {
			return nil, errors.New("Your withdrawal account is permanently locked. You cannot modify or delete it. Please contact Customer Support to rebind.")
		}
	}

	bank := models.BankAccount{
		ID:                fmt.Sprintf("BA-%s", uuid.New().String()[:8]),
		UserID:            userID,
		AccountHolderName: strings.TrimSpace(req.AccountHolderName),
		AccountNumber:     accClean,
		IFSC:              strings.ToUpper(strings.TrimSpace(req.IFSC)),
		BankName:          strings.TrimSpace(req.BankName),
		UPIID:             upiClean,
		IsLocked:          true, // Permanently locked on binding
		BoundAt:           time.Now(),
		UpdatedAt:         time.Now(),
	}

	if existing.ID != "" {
		bank.ID = existing.ID
		if err := s.bundle.DB.Save(&bank).Error; err != nil {
			return nil, err
		}
	} else {
		if err := s.bundle.DB.Create(&bank).Error; err != nil {
			return nil, err
		}
	}

	return &bank, nil
}

// AdminUnbindBankAccount allows admin/support to reset or rebind user's bank details
func (s *BankService) AdminUnbindBankAccount(targetUserID, adminUser, reason string) error {
	if s.bundle.DB == nil || targetUserID == "" {
		return errors.New("database unavailable")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var bank models.BankAccount
	if err := s.bundle.DB.Where("user_id = ?", targetUserID).First(&bank).Error; err != nil {
		return errors.New("no bound bank account found for this user")
	}

	if err := s.bundle.DB.Delete(&bank).Error; err != nil {
		return err
	}

	// Record in audit log
	audit := models.AuditLog{
		ID:        fmt.Sprintf("AUD-%s", uuid.New().String()[:8]),
		AdminUser: adminUser,
		Action:    "UNBIND_BANK_ACCOUNT",
		TargetID:  targetUserID,
		Details:   fmt.Sprintf("Deleted locked bank account (UPI: %s, Acc: %s). Reason: %s", bank.UPIID, bank.AccountNumber, reason),
		CreatedAt: time.Now(),
	}
	_ = s.bundle.DB.Create(&audit)

	return nil
}
