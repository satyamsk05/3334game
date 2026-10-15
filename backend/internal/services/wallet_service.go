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
				DepositChips: 0,
				WinningChips: 0,
				BonusChips:   0,
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
			DepositChips: 0,
			WinningChips: 0,
			BonusChips:   0,
			UpdatedAt:    time.Now(),
		}
		s.memUsers[userID] = w
	}
	return w, nil
}

func (s *WalletService) CreditDeposit(userID string, amountChips int64, referenceID, description string) (*models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if amountChips <= 0 {
		return nil, errors.New("amount must be positive")
	}

	var w *models.Wallet
	if s.bundle.DB != nil {
		if err := s.bundle.DB.Where("user_id = ?", userID).First(&w).Error; err != nil {
			w = &models.Wallet{UserID: userID}
			_ = s.bundle.DB.Create(w)
		}
		w.DepositChips += amountChips
		w.UpdatedAt = time.Now()
		_ = s.bundle.DB.Save(w)
	} else {
		w = s.memUsers[userID]
		if w == nil {
			w = &models.Wallet{UserID: userID}
			s.memUsers[userID] = w
		}
		w.DepositChips += amountChips
		w.UpdatedAt = time.Now()
	}

	// Fix (Issue 2.6): Collision-safe UUID-based transaction ID
	tx := models.Transaction{
		ID:                fmt.Sprintf("TX-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
		UserID:            userID,
		Type:              "DEPOSIT",
		AmountChips:       amountChips,
		BalanceAfterChips: w.TotalChips(),
		AmountPaise:       amountChips,
		BalanceAfterPaise: w.TotalChips(),
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

func (s *WalletService) RequestWithdrawal(userID, upiID string, amountChips int64) (*models.Withdrawal, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	minChips := int64(2500)   // 25.00
	maxChips := int64(500000) // 5000.00
	if amountChips < minChips || amountChips > maxChips {
		return nil, fmt.Errorf("withdrawal must be between %d and %d chips", minChips/100, maxChips/100)
	}

	// Fix (Issue 2.6): Generate UUID-based collision-safe ID
	wdID := fmt.Sprintf("W-%s-%d", uuid.New().String()[:8], time.Now().Unix())
	wd := models.Withdrawal{
		ID:           wdID,
		UserID:       userID,
		AmountRupees: float64(amountChips) / 100.0,
		UPIID:        upiID,
		Status:       "PENDING",
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	if s.bundle.DB != nil {
		// Fix Audit 9.1 & RMG AML Compliance:
		// In accordance with Real Money Gaming regulatory and Anti-Money Laundering guidelines,
		// user withdrawals are restricted to WinningChips to prevent peer remittance/hawala.
		// Unused deposit refunds must be routed via customer support and AdminAdjustWallet.
		// Fix (Issue 2.4 & 13.1): Atomic SQL balance check & debit inside a transaction to prevent race conditions and double-spending
		var updatedWallet models.Wallet
		err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
			res := tx.Model(&models.Wallet{}).
				Where("user_id = ? AND winning_chips >= ?", userID, amountChips).
				Updates(map[string]interface{}{
					"winning_chips": gorm.Expr("winning_chips - ?", amountChips),
					"updated_at":    time.Now(),
				})
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return errors.New("insufficient winning balance or wallet not found")
			}

			if err := tx.Where("user_id = ?", userID).First(&updatedWallet).Error; err != nil {
				return err
			}

			if err := tx.Create(&wd).Error; err != nil {
				return err
			}

			txRecord := models.Transaction{
				ID:                wdID,
				UserID:            userID,
				Type:              "WITHDRAWAL",
				AmountChips:       amountChips,
				BalanceAfterChips: updatedWallet.TotalChips(),
				AmountPaise:       amountChips,
				BalanceAfterPaise: updatedWallet.TotalChips(),
				Status:            "PENDING",
				ReferenceID:       wdID,
				Description:       fmt.Sprintf("Withdrawal to UPI: %s", upiID),
				CreatedAt:         time.Now(),
			}

			return tx.Create(&txRecord).Error
		})
		if err != nil {
			return nil, err
		}
		return &wd, nil
	}

	// In-memory fallback protected by mutex
	s.mu.Lock()
	defer s.mu.Unlock()
	w := s.memUsers[userID]
	if w == nil {
		return nil, errors.New("wallet not found")
	}

	if w.WinningChips < amountChips {
		return nil, errors.New("insufficient winning balance")
	}

	w.WinningChips -= amountChips
	w.UpdatedAt = time.Now()

	tx := models.Transaction{
		ID:                wdID,
		UserID:            userID,
		Type:              "WITHDRAWAL",
		AmountChips:       amountChips,
		BalanceAfterChips: w.TotalChips(),
		AmountPaise:       amountChips,
		BalanceAfterPaise: w.TotalChips(),
		Status:            "PENDING",
		ReferenceID:       wdID,
		Description:       fmt.Sprintf("Withdrawal to UPI: %s", upiID),
		CreatedAt:         time.Now(),
	}

	s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)

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
	// Fix (Issue 9.2): Enforce deposit bounds at service layer as well
	if amountRupees < 10.0 || amountRupees > 50000.0 {
		return nil, errors.New("deposit amount must be between ₹10 and ₹50,000")
	}
	// Fix (Issue 2.6): Collision-safe UUID-based deposit ID
	depID := fmt.Sprintf("D-%s-%d", uuid.New().String()[:8], time.Now().Unix())
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

// Fix (Issue 9.3): Prevent duplicate UTR submission across deposits to block fraud
func (s *WalletService) SubmitDepositUTR(userID, depositID, utr string) (*models.Deposit, error) {
	if s.bundle.DB != nil {
		var dep models.Deposit
		if err := s.bundle.DB.Where("id = ?", depositID).First(&dep).Error; err != nil {
			return nil, errors.New("deposit not found")
		}
		if userID != "" && dep.UserID != userID {
			return nil, errors.New("unauthorized: deposit does not belong to you")
		}
		if dep.Status == "APPROVED" {
			return nil, errors.New("deposit has already been approved")
		}

		// Check if this UTR has already been submitted for another non-rejected deposit
		var duplicateCount int64
		if err := s.bundle.DB.Model(&models.Deposit{}).
			Where("utr = ? AND id != ? AND status != 'REJECTED'", utr, depositID).
			Count(&duplicateCount).Error; err != nil {
			return nil, err
		}
		if duplicateCount > 0 {
			return nil, errors.New("this UTR has already been submitted for another deposit")
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

func (s *WalletService) GetDeposit(depositID string) (*models.Deposit, error) {
	if s.bundle.DB != nil {
		var dep models.Deposit
		if err := s.bundle.DB.Where("id = ?", depositID).First(&dep).Error; err != nil {
			return nil, errors.New("deposit not found")
		}
		return &dep, nil
	}
	return &models.Deposit{ID: depositID, Status: "PENDING"}, nil
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

			amountChips := int64(dep.AmountRupees * 100)
			if amountChips <= 0 {
				return errors.New("invalid deposit amount")
			}

			var w models.Wallet
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("user_id = ?", dep.UserID).First(&w).Error; err != nil {
				w = models.Wallet{UserID: dep.UserID}
				if err := tx.Create(&w).Error; err != nil {
					return err
				}
			}

			w.DepositChips += amountChips
			w.UpdatedAt = time.Now()
			if err := tx.Save(&w).Error; err != nil {
				return err
			}

			txnRecord := models.Transaction{
				ID:                fmt.Sprintf("TX-%s", uuid.New().String()[:12]),
				UserID:            dep.UserID,
				Type:              "DEPOSIT",
				AmountChips:       amountChips,
				BalanceAfterChips: w.TotalChips(),
				AmountPaise:       amountChips,
				BalanceAfterPaise: w.TotalChips(),
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
			amountChips := int64(wd.AmountRupees * 100)
			var w models.Wallet
			if err := tx.Set("gorm:query_option", "FOR UPDATE").Where("user_id = ?", wd.UserID).First(&w).Error; err == nil {
				w.WinningChips += amountChips
				w.UpdatedAt = time.Now()
				if err := tx.Save(&w).Error; err != nil {
					return err
				}

				txnRecord := models.Transaction{
					ID:                fmt.Sprintf("TX-%s", uuid.New().String()[:12]),
					UserID:            wd.UserID,
					Type:              "REFUND",
					AmountChips:       amountChips,
					BalanceAfterChips: w.TotalChips(),
					AmountPaise:       amountChips,
					BalanceAfterPaise: w.TotalChips(),
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

func (s *WalletService) AdjustWallet(userID, bucket string, isCredit bool, amountChips int64, reason string) error {
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

	delta := amountChips
	if !isCredit {
		delta = -amountChips
	}

	switch bucket {
	case "deposit":
		if !isCredit && w.DepositChips < amountChips {
			return errors.New("insufficient deposit balance")
		}
		w.DepositChips += delta
	case "winnings":
		if !isCredit && w.WinningChips < amountChips {
			return errors.New("insufficient winning balance")
		}
		w.WinningChips += delta
	case "bonus":
		if !isCredit && w.BonusChips < amountChips {
			return errors.New("insufficient bonus balance")
		}
		w.BonusChips += delta
	default:
		return fmt.Errorf("invalid bucket '%s': must be deposit, winnings, or bonus", bucket)
	}
	w.UpdatedAt = time.Now()

	txType := "ADMIN_CREDIT"
	if !isCredit {
		txType = "ADMIN_DEBIT"
	}

	// Fix (Issue 2.6): Collision-safe UUID-based ID
	tx := models.Transaction{
		ID:                fmt.Sprintf("ADJ-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
		UserID:            userID,
		Type:              txType,
		AmountChips:       amountChips,
		BalanceAfterChips: w.TotalChips(),
		AmountPaise:       amountChips,
		BalanceAfterPaise: w.TotalChips(),
		Status:            "SUCCESS",
		ReferenceID:       fmt.Sprintf("ADMIN-%s", bucket),
		Description:       reason,
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		// Fix (Issue 13.1): Handle DB errors instead of silently ignoring
		if err := s.bundle.DB.Save(w).Error; err != nil {
			return err
		}
		if err := s.bundle.DB.Create(&tx).Error; err != nil {
			return err
		}
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
		type WalletSums struct {
			TotalDeposit int64 `gorm:"column:total_deposit"`
			TotalWinning int64 `gorm:"column:total_winning"`
			TotalBonus   int64 `gorm:"column:total_bonus"`
		}
		var wSums WalletSums
		s.bundle.DB.Model(&models.Wallet{}).Select(
			"COALESCE(SUM(deposit_chips), 0) as total_deposit, COALESCE(SUM(winning_chips), 0) as total_winning, COALESCE(SUM(bonus_chips), 0) as total_bonus",
		).Scan(&wSums)
		totalDep = wSums.TotalDeposit
		totalWin = wSums.TotalWinning
		totalBon = wSums.TotalBonus

		var depSum float64
		s.bundle.DB.Model(&models.Deposit{}).Where("status = ?", "APPROVED").Select("COALESCE(SUM(amount_rupees), 0)").Row().Scan(&depSum)
		approvedDep = int64(depSum * 100)

		var wdApprovedSum float64
		s.bundle.DB.Model(&models.Withdrawal{}).Where("status = ?", "APPROVED").Select("COALESCE(SUM(amount_rupees), 0)").Row().Scan(&wdApprovedSum)
		approvedWd = int64(wdApprovedSum * 100)

		var wdPendingSum float64
		s.bundle.DB.Model(&models.Withdrawal{}).Where("status = ?", "PENDING").Select("COALESCE(SUM(amount_rupees), 0)").Row().Scan(&wdPendingSum)
		pendingWd = int64(wdPendingSum * 100)

		s.bundle.DB.Model(&models.Withdrawal{}).Where("status = ?", "PENDING").Count(&pendingWdCount)
	} else {
		s.mu.Lock()
		for _, w := range s.memUsers {
			totalDep += w.DepositChips
			totalWin += w.WinningChips
			totalBon += w.BonusChips
		}
		s.mu.Unlock()
	}

	return map[string]interface{}{
		"totalDepositChips":        totalDep,
		"totalWinningChips":        totalWin,
		"totalBonusChips":          totalBon,
		"totalAvailableChips":      totalDep + totalWin + totalBon,
		"approvedAmountChips":      approvedDep,
		"approvedWithdrawalsChips": approvedWd,
		"pendingWithdrawalsChips":  pendingWd,
		"pendingWithdrawalsCount":  pendingWdCount,
		"totalDepositPaise":        totalDep,
		"totalWinningPaise":        totalWin,
		"totalBonusPaise":          totalBon,
		"totalAvailablePaise":      totalDep + totalWin + totalBon,
		"approvedAmountPaise":      approvedDep,
		"approvedWithdrawalsPaise": approvedWd,
		"pendingWithdrawalsPaise":  pendingWd,
	}
}

// ==========================================
// Promotions CRUD
// ==========================================
func (s *WalletService) GetAllPromotions() []models.Promotion {
	if s.bundle.DB != nil {
		var promos []models.Promotion
		s.bundle.DB.Order("display_order asc, id asc").Find(&promos)
		if len(promos) > 0 {
			return promos
		}
	}
	return []models.Promotion{
		{
			ID:            "promo_welcome",
			Title:         "100% First Deposit Bonus",
			Subtitle:      "Deposit now & get up to ₹500 extra bonus chips!",
			GradientStart: "#7C3AED",
			GradientEnd:   "#1E1B4B",
			IconType:      "gift",
			TargetRoute:   "deposit",
			BadgeText:     "EXTRA CHIPS",
			CtaText:       "Claim Bonus",
			Active:        true,
			DisplayOrder:  1,
		},
		{
			ID:            "promo_cashback",
			Title:         "Mega Table Cashback",
			Subtitle:      "Play Dragon vs Tiger with zero table deduction today!",
			GradientStart: "#BE123C",
			GradientEnd:   "#4C0519",
			IconType:      "trophy",
			TargetRoute:   "deposit",
			BadgeText:     "HOT DEAL",
			CtaText:       "Play Now",
			Active:        true,
			DisplayOrder:  2,
		},
	}
}

func (s *WalletService) CreatePromotion(p *models.Promotion) error {
	if s.bundle.DB == nil {
		return errors.New("database not available")
	}
	if p.ID == "" {
		p.ID = fmt.Sprintf("promo_%s", uuid.New().String()[:8])
	}
	return s.bundle.DB.Create(p).Error
}

func (s *WalletService) UpdatePromotion(id string, updates map[string]interface{}) (*models.Promotion, error) {
	if s.bundle.DB == nil {
		return nil, errors.New("database not available")
	}
	var p models.Promotion
	if err := s.bundle.DB.Where("id = ?", id).First(&p).Error; err != nil {
		return nil, errors.New("promotion not found")
	}
	if err := s.bundle.DB.Model(&p).Updates(updates).Error; err != nil {
		return nil, err
	}
	return &p, nil
}

func (s *WalletService) TogglePromotion(id string, active bool) error {
	if s.bundle.DB == nil {
		return errors.New("database not available")
	}
	return s.bundle.DB.Model(&models.Promotion{}).Where("id = ?", id).Update("active", active).Error
}

func (s *WalletService) DeletePromotion(id string) error {
	if s.bundle.DB == nil {
		return errors.New("database not available")
	}
	return s.bundle.DB.Where("id = ?", id).Delete(&models.Promotion{}).Error
}

func (s *WalletService) DebitBet(userID string, amountChips int64, gameName, roundID string) (*models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

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

	if w.TotalChips() < amountChips {
		return nil, errors.New("insufficient wallet balance")
	}

	rem := amountChips
	// Deduct from deposit first
	if w.DepositChips >= rem {
		w.DepositChips -= rem
		rem = 0
	} else {
		rem -= w.DepositChips
		w.DepositChips = 0
	}

	// Deduct from winnings
	if rem > 0 {
		if w.WinningChips >= rem {
			w.WinningChips -= rem
			rem = 0
		} else {
			rem -= w.WinningChips
			w.WinningChips = 0
		}
	}

	// Deduct from bonus
	if rem > 0 {
		if w.BonusChips >= rem {
			w.BonusChips -= rem
			rem = 0
		} else {
			return nil, errors.New("insufficient balance")
		}
	}

	w.UpdatedAt = time.Now()

	// Fix (Issue 2.6): Collision-safe UUID ID for bet transaction
	tx := models.Transaction{
		ID:                fmt.Sprintf("BET-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
		UserID:            userID,
		Type:              "BET_PLACED",
		AmountChips:       amountChips,
		BalanceAfterChips: w.TotalChips(),
		AmountPaise:       amountChips,
		BalanceAfterPaise: w.TotalChips(),
		Status:            "SUCCESS",
		ReferenceID:       roundID,
		Description:       fmt.Sprintf("%s Bet", gameName),
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		// Fix (Issue 13.1): Check and return GORM errors
		if err := s.bundle.DB.Save(w).Error; err != nil {
			return nil, err
		}
		if err := s.bundle.DB.Create(&tx).Error; err != nil {
			return nil, err
		}
	} else {
		s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)
	}

	return &tx, nil
}

func (s *WalletService) CreditWinnings(userID string, amountChips int64, gameName, roundID string) (*models.Transaction, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

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

	w.WinningChips += amountChips
	w.UpdatedAt = time.Now()

	// Fix (Issue 2.6): Collision-safe UUID ID for win transaction
	tx := models.Transaction{
		ID:                fmt.Sprintf("WIN-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
		UserID:            userID,
		Type:              "WIN_PAYOUT",
		AmountChips:       amountChips,
		BalanceAfterChips: w.TotalChips(),
		AmountPaise:       amountChips,
		BalanceAfterPaise: w.TotalChips(),
		Status:            "SUCCESS",
		ReferenceID:       roundID,
		Description:       fmt.Sprintf("%s Win Payout", gameName),
		CreatedAt:         time.Now(),
	}

	if s.bundle.DB != nil {
		// Fix (Issue 13.1): Check and return GORM errors
		if err := s.bundle.DB.Save(w).Error; err != nil {
			return nil, err
		}
		if err := s.bundle.DB.Create(&tx).Error; err != nil {
			return nil, err
		}
	} else {
		s.memTxns[userID] = append([]models.Transaction{tx}, s.memTxns[userID]...)
	}

	return &tx, nil
}

// Fix (Issue 9.4): RecordAuditLog saves administrative actions for compliance and fraud detection
func (s *WalletService) RecordAuditLog(adminUser, action, targetID, details, ip string) error {
	logEntry := models.AuditLog{
		ID:        fmt.Sprintf("AUD-%s-%d", uuid.New().String()[:8], time.Now().Unix()),
		AdminUser: adminUser,
		Action:    action,
		TargetID:  targetID,
		Details:   details,
		IPAddress: ip,
		CreatedAt: time.Now(),
	}
	if s.bundle != nil && s.bundle.DB != nil {
		return s.bundle.DB.Create(&logEntry).Error
	}
	return nil
}

func (s *WalletService) GetAuditLogs(limit int) []models.AuditLog {
	if limit <= 0 {
		limit = 100
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var logs []models.AuditLog
		s.bundle.DB.Order("created_at desc").Limit(limit).Find(&logs)
		return logs
	}
	return []models.AuditLog{}
}

// Fix (Issue 2.2): Real database game statistics for Admin Dashboard
func (s *WalletService) GetGameStats() map[string]interface{} {
	stats := map[string]interface{}{
		"totalRounds":       int64(0),
		"totalRoundsPlayed": int64(0),
		"totalWageredPaise": int64(0),
		"totalPayoutsPaise": int64(0),
		"ggrPaise":          int64(0),
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var totalRounds int64
		s.bundle.DB.Model(&models.DtRound{}).Count(&totalRounds)

		var totalWagered int64
		var totalPayout int64
		s.bundle.DB.Model(&models.DtBet{}).Select("COALESCE(SUM(amount), 0)").Scan(&totalWagered)
		s.bundle.DB.Model(&models.DtBet{}).Select("COALESCE(SUM(payout), 0)").Scan(&totalPayout)

		stats["totalRounds"] = totalRounds
		stats["totalRoundsPlayed"] = totalRounds
		stats["totalWageredPaise"] = totalWagered
		stats["totalPayoutsPaise"] = totalPayout
		stats["ggrPaise"] = totalWagered - totalPayout
	}
	return stats
}

// Fix (Issue 2.3): Real database user betting metrics
func (s *WalletService) GetUserGameMetrics(userID string) map[string]interface{} {
	metrics := map[string]interface{}{
		"totalBets":         int64(0),
		"totalWageredChips": int64(0),
		"totalWonChips":     int64(0),
		"ggrChips":          int64(0),
		"totalWageredPaise": int64(0),
		"totalWonPaise":     int64(0),
		"ggrPaise":          int64(0),
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var count int64
		var wagered int64
		var won int64
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ?", userID).Count(&count)
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ?", userID).Select("COALESCE(SUM(amount), 0)").Scan(&wagered)
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ?", userID).Select("COALESCE(SUM(payout), 0)").Scan(&won)

		metrics["totalBets"] = count
		metrics["totalWageredChips"] = wagered
		metrics["totalWonChips"] = won
		metrics["ggrChips"] = wagered - won
		metrics["totalWageredPaise"] = wagered
		metrics["totalWonPaise"] = won
		metrics["ggrPaise"] = wagered - won
	}
	return metrics
}

func (s *WalletService) GetUserDeposits(userID string, limit int) []models.Deposit {
	if limit <= 0 {
		limit = 20
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var deps []models.Deposit
		s.bundle.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&deps)
		return deps
	}
	return []models.Deposit{}
}

func (s *WalletService) GetUserWithdrawals(userID string, limit int) []models.Withdrawal {
	if limit <= 0 {
		limit = 20
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var wds []models.Withdrawal
		s.bundle.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&wds)
		return wds
	}
	return []models.Withdrawal{}
}

func (s *WalletService) GetUserBets(userID string, limit int) []models.DtBet {
	if limit <= 0 {
		limit = 20
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var bets []models.DtBet
		s.bundle.DB.Where("user_id = ?", userID).Order("created_at desc").Limit(limit).Find(&bets)
		return bets
	}
	return []models.DtBet{}
}

func (s *WalletService) GetUserAuditLogs(userID string, limit int) []models.AuditLog {
	if limit <= 0 {
		limit = 20
	}
	if s.bundle != nil && s.bundle.DB != nil {
		var logs []models.AuditLog
		s.bundle.DB.Where("target_id = ?", userID).Order("created_at desc").Limit(limit).Find(&logs)
		return logs
	}
	return []models.AuditLog{}
}


