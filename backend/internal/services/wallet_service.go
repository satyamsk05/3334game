package services

import (
	"errors"
	"fmt"
	"sync"
	"time"

	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/models"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type WalletService struct {
	bundle   *database.DBBundle
	mu       sync.Mutex
	memUsers map[string]*models.Wallet
	memTxns  map[string][]models.Transaction
}

func NewWalletService(bundle *database.DBBundle) *WalletService {
	return &WalletService{
		bundle:   bundle,
		memUsers: make(map[string]*models.Wallet),
		memTxns:  make(map[string][]models.Transaction),
	}
}

func (s *WalletService) GetOrCreateWallet(userID string) (*models.Wallet, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.bundle.DB != nil {
		var wallet models.Wallet
		res := s.bundle.DB.Where("user_id = ?", userID).First(&wallet)
		if errors.Is(res.Error, gorm.ErrRecordNotFound) {
			wallet = models.Wallet{
				UserID:       userID,
				DepositPaise: 0,
				WinningPaise: 0,
				BonusPaise:   0,
				UpdatedAt:    time.Now(),
			}
			if err := s.bundle.DB.Create(&wallet).Error; err != nil {
				return nil, err
			}
		} else if res.Error != nil {
			return nil, res.Error
		}
		return &wallet, nil
	}

	// Memory fallback
	w, exists := s.memUsers[userID]
	if !exists {
		w = &models.Wallet{
			UserID:       userID,
			DepositPaise: 0,
			WinningPaise: 0,
			BonusPaise:   0,
			UpdatedAt:    time.Now(),
		}
		s.memUsers[userID] = w
	}
	return w, nil
}

func (s *WalletService) CreditDeposit(userID string, amountPaise int64, referenceID, description string) (*models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if amountPaise <= 0 {
		return nil, errors.New("amount must be positive")
	}

	var w *models.Wallet
	if s.bundle.DB != nil {
		if err := s.bundle.DB.Where("user_id = ?", userID).First(&w).Error; err != nil {
			w = &models.Wallet{UserID: userID}
			_ = s.bundle.DB.Create(w)
		}
		w.DepositPaise += amountPaise
		w.UpdatedAt = time.Now()
		_ = s.bundle.DB.Save(w)
	} else {
		w = s.memUsers[userID]
		if w == nil {
			w = &models.Wallet{UserID: userID}
			s.memUsers[userID] = w
		}
		w.DepositPaise += amountPaise
		w.UpdatedAt = time.Now()
	}

	tx := models.Transaction{
		ID:                fmt.Sprintf("TX-%d", time.Now().UnixNano()),
		UserID:            userID,
		Type:              "DEPOSIT",
		AmountPaise:       amountPaise,
		BalanceAfterPaise: w.TotalPaise(),
		Status:            "SUCCESS",
		ReferenceID:       referenceID,
		Description:       description,
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		_ = s.bundle.DB.Create(&tx)
	} else {
		s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)
	}

	return &tx, nil
}

func (s *WalletService) RequestWithdrawal(userID, upiID string, amountPaise int64) (*models.Withdrawal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	minPaise := int64(2500)   // ₹25
	maxPaise := int64(500000) // ₹5000
	if amountPaise < minPaise || amountPaise > maxPaise {
		return nil, fmt.Errorf("withdrawal must be between ₹%d and ₹%d", minPaise/100, maxPaise/100)
	}

	var w *models.Wallet
	if s.bundle.DB != nil {
		if err := s.bundle.DB.Where("user_id = ?", userID).First(&w).Error; err != nil {
			return nil, errors.New("wallet not found")
		}
	} else {
		w = s.memUsers[userID]
		if w == nil {
			return nil, errors.New("wallet not found")
		}
	}

	if w.WinningPaise < amountPaise {
		return nil, errors.New("insufficient winning balance")
	}

	w.WinningPaise -= amountPaise
	w.UpdatedAt = time.Now()
	if s.bundle.DB != nil {
		_ = s.bundle.DB.Save(w)
	}

	wdID := fmt.Sprintf("W%d", time.Now().UnixNano()%1000000000000)
	wd := models.Withdrawal{
		ID:           wdID,
		UserID:       userID,
		AmountRupees: float64(amountPaise) / 100.0,
		UPIID:        upiID,
		Status:       "PENDING",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	tx := models.Transaction{
		ID:                wdID,
		UserID:            userID,
		Type:              "WITHDRAWAL",
		AmountPaise:       amountPaise,
		BalanceAfterPaise: w.TotalPaise(),
		Status:            "PENDING",
		ReferenceID:       wdID,
		Description:       fmt.Sprintf("Withdrawal to UPI: %s", upiID),
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		_ = s.bundle.DB.Create(&wd)
		_ = s.bundle.DB.Create(&tx)
	} else {
		s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)
	}

	return &wd, nil
}

func (s *WalletService) GetTransactions(userID string, limit int) []models.Transaction {
	if limit <= 0 {
		limit = 50
	}

	if s.bundle.DB != nil {
		var txns []models.Transaction
		s.bundle.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&txns)
		return txns
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	txns := s.memTxns[userID]
	if len(txns) > limit {
		return txns[:limit]
	}
	return txns
}

func (s *WalletService) CreateDepositRequest(userID string, amountRupees float64) (*models.Deposit, error) {
	depID := fmt.Sprintf("D%d", time.Now().UnixNano()%1000000000000)
	dep := models.Deposit{
		ID:           depID,
		UserID:       userID,
		AmountRupees: amountRupees,
		Status:       "PENDING",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if s.bundle.DB != nil {
		if err := s.bundle.DB.Create(&dep).Error; err != nil {
			return nil, err
		}
	}
	return &dep, nil
}

func (s *WalletService) SubmitDepositUTR(userID, depositID, utr string) (*models.Deposit, error) {
	if s.bundle.DB != nil {
		var dep models.Deposit
		if err := s.bundle.DB.Where("id = ?", depositID).First(&dep).Error; err != nil {
			return nil, errors.New("deposit not found")
		}
		if userID != "" && dep.UserID != userID {
			return nil, errors.New("unauthorized: deposit does not belong to you")
		}
		dep.UTR = utr
		dep.UpdatedAt = time.Now()
		if err := s.bundle.DB.Save(&dep).Error; err != nil {
			return nil, err
		}
		return &dep, nil
	}
	return &models.Deposit{ID: depositID, UserID: userID, UTR: utr, Status: "PENDING"}, nil
}

func (s *WalletService) ApproveDeposit(depositID string) (*models.Deposit, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.bundle.DB != nil {
		var dep models.Deposit
		err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", depositID).First(&dep).Error; err != nil {
				return errors.New("deposit not found")
			}

			// Idempotency: avoid double-crediting
			if dep.Status == "APPROVED" {
				return nil
			}
			if dep.Status == "REJECTED" {
				return errors.New("cannot approve an already rejected deposit")
			}

			dep.Status = "APPROVED"
			dep.UpdatedAt = time.Now()
			if err := tx.Save(&dep).Error; err != nil {
				return err
			}

			amountPaise := int64(dep.AmountRupees * 100)
			if amountPaise <= 0 {
				return errors.New("invalid deposit amount")
			}

			var w models.Wallet
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("user_id = ?", dep.UserID).First(&w).Error; err != nil {
				w = models.Wallet{UserID: dep.UserID}
				if err := tx.Create(&w).Error; err != nil {
					return err
				}
			}

			w.DepositPaise += amountPaise
			w.UpdatedAt = time.Now()
			if err := tx.Save(&w).Error; err != nil {
				return err
			}

			txnRecord := models.Transaction{
				ID:                fmt.Sprintf("TX-%s", uuid.New().String()[:12]),
				UserID:            dep.UserID,
				Type:              "DEPOSIT",
				AmountPaise:       amountPaise,
				BalanceAfterPaise: w.TotalPaise(),
				Status:            "SUCCESS",
				ReferenceID:       dep.UTR,
				Description:       "Cash Deposit Approved",
				CreatedAt:         time.Now(),
			}
			return tx.Create(&txnRecord).Error
		})

		if err != nil {
			return nil, err
		}
		return &dep, nil
	}

	return &models.Deposit{ID: depositID, Status: "APPROVED"}, nil
}

func (s *WalletService) RejectDeposit(depositID string) (*models.Deposit, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.bundle.DB != nil {
		var dep models.Deposit
		if err := s.bundle.DB.Where("id = ?", depositID).First(&dep).Error; err != nil {
			return nil, errors.New("deposit not found")
		}
		if dep.Status == "APPROVED" {
			return nil, errors.New("cannot reject an already approved deposit")
		}
		dep.Status = "REJECTED"
		dep.UpdatedAt = time.Now()
		if err := s.bundle.DB.Save(&dep).Error; err != nil {
			return nil, err
		}
		return &dep, nil
	}
	return &models.Deposit{ID: depositID, Status: "REJECTED"}, nil
}

func (s *WalletService) ApproveWithdrawal(withdrawalID string) (*models.Withdrawal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.bundle.DB != nil {
		var wd models.Withdrawal
		if err := s.bundle.DB.Where("id = ?", withdrawalID).First(&wd).Error; err != nil {
			return nil, errors.New("withdrawal not found")
		}
		if wd.Status == "APPROVED" {
			return &wd, nil
		}
		if wd.Status == "REJECTED" {
			return nil, errors.New("cannot approve an already rejected withdrawal")
		}
		wd.Status = "APPROVED"
		wd.UpdatedAt = time.Now()
		if err := s.bundle.DB.Save(&wd).Error; err != nil {
			return nil, err
		}
		return &wd, nil
	}
	return &models.Withdrawal{ID: withdrawalID, Status: "APPROVED"}, nil
}

func (s *WalletService) RejectWithdrawal(withdrawalID string) (*models.Withdrawal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.bundle.DB != nil {
		var wd models.Withdrawal
		err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("id = ?", withdrawalID).First(&wd).Error; err != nil {
				return errors.New("withdrawal not found")
			}
			if wd.Status == "REJECTED" {
				return nil
			}
			if wd.Status == "APPROVED" {
				return errors.New("cannot reject an already approved withdrawal")
			}
			wd.Status = "REJECTED"
			wd.UpdatedAt = time.Now()
			if err := tx.Save(&wd).Error; err != nil {
				return err
			}

			// Atomic refund of winnings
			amountPaise := int64(wd.AmountRupees * 100)
			var w models.Wallet
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("user_id = ?", wd.UserID).First(&w).Error; err == nil {
				w.WinningPaise += amountPaise
				w.UpdatedAt = time.Now()
				if err := tx.Save(&w).Error; err != nil {
					return err
				}

				txnRecord := models.Transaction{
					ID:                fmt.Sprintf("TX-%s", uuid.New().String()[:12]),
					UserID:            wd.UserID,
					Type:              "REFUND",
					AmountPaise:       amountPaise,
					BalanceAfterPaise: w.TotalPaise(),
					Status:            "SUCCESS",
					ReferenceID:       wd.ID,
					Description:       "Withdrawal Rejected - Refunded to Winnings",
					CreatedAt:         time.Now(),
				}
				return tx.Create(&txnRecord).Error
			}
			return nil
		})

		if err != nil {
			return nil, err
		}
		return &wd, nil
	}
	return &models.Withdrawal{ID: withdrawalID, Status: "REJECTED"}, nil
}

func (s *WalletService) GetPendingCounts() (int, int) {
	pendingDeposits := 0
	pendingWithdrawals := 0

	if s.bundle.DB != nil {
		var depCount int64
		var wdCount int64
		s.bundle.DB.Model(&models.Deposit{}).Where("status = ?", "PENDING").Count(&depCount)
		s.bundle.DB.Model(&models.Withdrawal{}).Where("status = ?", "PENDING").Count(&wdCount)
		pendingDeposits = int(depCount)
		pendingWithdrawals = int(wdCount)
	}
	return pendingDeposits, pendingWithdrawals
}

func (s *WalletService) GetAllDeposits(limit int) []models.Deposit {
	if limit <= 0 {
		limit = 100
	}
	if s.bundle.DB != nil {
		var deps []models.Deposit
		s.bundle.DB.Order("created_at desc").Limit(limit).Find(&deps)
		return deps
	}
	return []models.Deposit{}
}

func (s *WalletService) GetAllWithdrawals(limit int) []models.Withdrawal {
	if limit <= 0 {
		limit = 100
	}
	if s.bundle.DB != nil {
		var wds []models.Withdrawal
		s.bundle.DB.Order("created_at desc").Limit(limit).Find(&wds)
		return wds
	}
	return []models.Withdrawal{}
}

func (s *WalletService) GetAllTransactions(limit int) []models.Transaction {
	if limit <= 0 {
		limit = 100
	}
	if s.bundle.DB != nil {
		var txns []models.Transaction
		s.bundle.DB.Order("created_at desc").Limit(limit).Find(&txns)
		return txns
	}

	s.mu.Lock()
	defer s.mu.Unlock()
	var all []models.Transaction
	for _, userTxns := range s.memTxns {
		all = append(all, userTxns...)
	}
	if len(all) > limit {
		return all[:limit]
	}
	return all
}

func (s *WalletService) AdjustWallet(userID, bucket string, isCredit bool, amountPaise int64, reason string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	var w *models.Wallet
	if s.bundle.DB != nil {
		if err := s.bundle.DB.Where("user_id = ?", userID).First(&w).Error; err != nil {
			return errors.New("user wallet not found")
		}
	} else {
		w = s.memUsers[userID]
		if w == nil {
			return errors.New("user wallet not found")
		}
	}

	delta := amountPaise
	if !isCredit {
		delta = -amountPaise
	}

	switch bucket {
	case "deposit":
		if !isCredit && w.DepositPaise < amountPaise {
			return errors.New("insufficient deposit balance")
		}
		w.DepositPaise += delta
	case "winnings":
		if !isCredit && w.WinningPaise < amountPaise {
			return errors.New("insufficient winning balance")
		}
		w.WinningPaise += delta
	case "bonus":
		if !isCredit && w.BonusPaise < amountPaise {
			return errors.New("insufficient bonus balance")
		}
		w.BonusPaise += delta
	default:
		w.DepositPaise += delta
	}
	w.UpdatedAt = time.Now()

	txType := "ADMIN_CREDIT"
	if !isCredit {
		txType = "ADMIN_DEBIT"
	}

	tx := models.Transaction{
		ID:                fmt.Sprintf("ADJ-%d", time.Now().UnixNano()%1000000000000),
		UserID:            userID,
		Type:              txType,
		AmountPaise:       amountPaise,
		BalanceAfterPaise: w.TotalPaise(),
		Status:            "SUCCESS",
		ReferenceID:       fmt.Sprintf("ADMIN-%s", bucket),
		Description:       reason,
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		_ = s.bundle.DB.Save(w)
		_ = s.bundle.DB.Create(&tx)
	} else {
		s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)
	}

	return nil
}

func (s *WalletService) GetFinancialStats() map[string]interface{} {
	var totalDep int64
	var totalWin int64
	var totalBon int64
	var approvedDep int64
	var approvedWd int64
	var pendingWd int64
	var pendingWdCount int64

	if s.bundle.DB != nil {
		var wallets []models.Wallet
		s.bundle.DB.Find(&wallets)
		for _, w := range wallets {
			totalDep += w.DepositPaise
			totalWin += w.WinningPaise
			totalBon += w.BonusPaise
		}

		var deps []models.Deposit
		s.bundle.DB.Where("status = ?", "APPROVED").Find(&deps)
		for _, d := range deps {
			approvedDep += int64(d.AmountRupees * 100)
		}

		var wds []models.Withdrawal
		s.bundle.DB.Find(&wds)
		for _, wd := range wds {
			if wd.Status == "APPROVED" {
				approvedWd += int64(wd.AmountRupees * 100)
			} else if wd.Status == "PENDING" {
				pendingWd += int64(wd.AmountRupees * 100)
				pendingWdCount++
			}
		}
	} else {
		s.mu.Lock()
		for _, w := range s.memUsers {
			totalDep += w.DepositPaise
			totalWin += w.WinningPaise
			totalBon += w.BonusPaise
		}
		s.mu.Unlock()
	}

	return map[string]interface{}{
		"totalDepositPaise":           totalDep,
		"totalWinningPaise":           totalWin,
		"totalBonusPaise":             totalBon,
		"totalAvailablePaise":         totalDep + totalWin + totalBon,
		"approvedAmountPaise":         approvedDep,
		"approvedWithdrawalsPaise":    approvedWd,
		"pendingWithdrawalsPaise":     pendingWd,
		"pendingWithdrawalsCount":     pendingWdCount,
	}
}

