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

type VIPTier struct {
	Level               int     `json:"level"`
	RequiredEXP         int64   `json:"requiredExp"`
	UpgradeRewardRupees float64 `json:"upgradeRewardRupees"`
	WeeklyRewardRupees  float64 `json:"weeklyRewardRupees"`
	MonthlyRewardRupees float64 `json:"monthlyRewardRupees"`
	SignInBuffPercent   int     `json:"signInBuffPercent"`
	WeeklyMinDeposit    float64 `json:"weeklyMinDeposit"`
	MonthlyMinDeposit   float64 `json:"monthlyMinDeposit"`
}

var VIPTiers = []VIPTier{
	{Level: 1, RequiredEXP: 500, UpgradeRewardRupees: 10, WeeklyRewardRupees: 5, MonthlyRewardRupees: 10, SignInBuffPercent: 5, WeeklyMinDeposit: 50, MonthlyMinDeposit: 100},
	{Level: 2, RequiredEXP: 5000, UpgradeRewardRupees: 50, WeeklyRewardRupees: 20, MonthlyRewardRupees: 50, SignInBuffPercent: 8, WeeklyMinDeposit: 100, MonthlyMinDeposit: 500},
	{Level: 3, RequiredEXP: 15000, UpgradeRewardRupees: 150, WeeklyRewardRupees: 50, MonthlyRewardRupees: 120, SignInBuffPercent: 10, WeeklyMinDeposit: 200, MonthlyMinDeposit: 800},
	{Level: 4, RequiredEXP: 50000, UpgradeRewardRupees: 500, WeeklyRewardRupees: 120, MonthlyRewardRupees: 300, SignInBuffPercent: 12, WeeklyMinDeposit: 300, MonthlyMinDeposit: 1500},
	{Level: 5, RequiredEXP: 100000, UpgradeRewardRupees: 1000, WeeklyRewardRupees: 250, MonthlyRewardRupees: 600, SignInBuffPercent: 15, WeeklyMinDeposit: 400, MonthlyMinDeposit: 2000},
	{Level: 6, RequiredEXP: 200000, UpgradeRewardRupees: 2500, WeeklyRewardRupees: 500, MonthlyRewardRupees: 1200, SignInBuffPercent: 18, WeeklyMinDeposit: 500, MonthlyMinDeposit: 2500},
	{Level: 7, RequiredEXP: 500000, UpgradeRewardRupees: 6000, WeeklyRewardRupees: 1200, MonthlyRewardRupees: 3000, SignInBuffPercent: 21, WeeklyMinDeposit: 800, MonthlyMinDeposit: 4000},
	{Level: 8, RequiredEXP: 1000000, UpgradeRewardRupees: 12000, WeeklyRewardRupees: 2500, MonthlyRewardRupees: 6000, SignInBuffPercent: 25, WeeklyMinDeposit: 1000, MonthlyMinDeposit: 5000},
	{Level: 9, RequiredEXP: 2000000, UpgradeRewardRupees: 25000, WeeklyRewardRupees: 5000, MonthlyRewardRupees: 12000, SignInBuffPercent: 28, WeeklyMinDeposit: 1500, MonthlyMinDeposit: 8000},
	{Level: 10, RequiredEXP: 3500000, UpgradeRewardRupees: 45000, WeeklyRewardRupees: 9000, MonthlyRewardRupees: 20000, SignInBuffPercent: 32, WeeklyMinDeposit: 2000, MonthlyMinDeposit: 10000},
	{Level: 11, RequiredEXP: 5000000, UpgradeRewardRupees: 70000, WeeklyRewardRupees: 14000, MonthlyRewardRupees: 30000, SignInBuffPercent: 35, WeeklyMinDeposit: 2500, MonthlyMinDeposit: 15000},
	{Level: 12, RequiredEXP: 7500000, UpgradeRewardRupees: 100000, WeeklyRewardRupees: 20000, MonthlyRewardRupees: 45000, SignInBuffPercent: 38, WeeklyMinDeposit: 3000, MonthlyMinDeposit: 20000},
	{Level: 13, RequiredEXP: 10000000, UpgradeRewardRupees: 150000, WeeklyRewardRupees: 30000, MonthlyRewardRupees: 65000, SignInBuffPercent: 42, WeeklyMinDeposit: 4000, MonthlyMinDeposit: 25000},
	{Level: 14, RequiredEXP: 15000000, UpgradeRewardRupees: 220000, WeeklyRewardRupees: 45000, MonthlyRewardRupees: 90000, SignInBuffPercent: 45, WeeklyMinDeposit: 5000, MonthlyMinDeposit: 30000},
	{Level: 15, RequiredEXP: 20000000, UpgradeRewardRupees: 300000, WeeklyRewardRupees: 60000, MonthlyRewardRupees: 130000, SignInBuffPercent: 50, WeeklyMinDeposit: 6000, MonthlyMinDeposit: 40000},
	{Level: 16, RequiredEXP: 30000000, UpgradeRewardRupees: 450000, WeeklyRewardRupees: 90000, MonthlyRewardRupees: 180000, SignInBuffPercent: 55, WeeklyMinDeposit: 8000, MonthlyMinDeposit: 50000},
	{Level: 17, RequiredEXP: 45000000, UpgradeRewardRupees: 650000, WeeklyRewardRupees: 130000, MonthlyRewardRupees: 250000, SignInBuffPercent: 60, WeeklyMinDeposit: 10000, MonthlyMinDeposit: 65000},
	{Level: 18, RequiredEXP: 65000000, UpgradeRewardRupees: 950000, WeeklyRewardRupees: 190000, MonthlyRewardRupees: 350000, SignInBuffPercent: 65, WeeklyMinDeposit: 15000, MonthlyMinDeposit: 80000},
	{Level: 19, RequiredEXP: 90000000, UpgradeRewardRupees: 1350000, WeeklyRewardRupees: 270000, MonthlyRewardRupees: 500000, SignInBuffPercent: 70, WeeklyMinDeposit: 20000, MonthlyMinDeposit: 100000},
	{Level: 20, RequiredEXP: 120000000, UpgradeRewardRupees: 2000000, WeeklyRewardRupees: 400000, MonthlyRewardRupees: 800000, SignInBuffPercent: 80, WeeklyMinDeposit: 25000, MonthlyMinDeposit: 150000},
}

type VIPStatusResponse struct {
	VIPLevel             int              `json:"vipLevel"`
	VIPExp               int64            `json:"vipExp"`
	NextLevel            int              `json:"nextLevel"`
	NextLevelExp         int64            `json:"nextLevelExp"`
	ExpNeeded            int64            `json:"expNeeded"`
	ClaimableUpgrades    []int            `json:"claimableUpgrades"`
	ClaimedUpgrades      []int            `json:"claimedUpgrades"`
	CanClaimWeekly       bool             `json:"canClaimWeekly"`
	NextWeeklyClaimSecs  int64            `json:"nextWeeklyClaimSecs"`
	CanClaimMonthly      bool             `json:"canClaimMonthly"`
	NextMonthlyClaimSecs int64            `json:"nextMonthlyClaimSecs"`
	CurrentWeeklyReward  float64          `json:"currentWeeklyReward"`
	CurrentMonthlyReward float64          `json:"currentMonthlyReward"`
	Tiers                []VIPTier        `json:"tiers"`
}

type VIPService struct {
	bundle *database.DBBundle
	mu     sync.Mutex
}

func NewVIPService(bundle *database.DBBundle) *VIPService {
	return &VIPService{
		bundle: bundle,
	}
}

func (s *VIPService) CalculateLevel(exp int64) int {
	lvl := 0
	for _, tier := range VIPTiers {
		if exp >= tier.RequiredEXP {
			lvl = tier.Level
		} else {
			break
		}
	}
	return lvl
}

func (s *VIPService) AddVIPExp(userID string, chipsAdded int64) (int, error) {
	if s.bundle.DB == nil || userID == "" || chipsAdded <= 0 {
		return 0, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var user models.User
	if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return 0, err
	}

	user.VIPExp += chipsAdded
	newLevel := s.CalculateLevel(user.VIPExp)
	if newLevel > user.VIPLevel {
		user.VIPLevel = newLevel
	}
	user.UpdatedAt = time.Now()

	if err := s.bundle.DB.Save(&user).Error; err != nil {
		return 0, err
	}

	return user.VIPLevel, nil
}

func (s *VIPService) GetVIPStatus(userID string) (*VIPStatusResponse, error) {
	resp := &VIPStatusResponse{
		VIPLevel:          0,
		VIPExp:            0,
		NextLevel:         1,
		NextLevelExp:      VIPTiers[0].RequiredEXP,
		ExpNeeded:         VIPTiers[0].RequiredEXP,
		ClaimableUpgrades: []int{},
		ClaimedUpgrades:   []int{},
		Tiers:             VIPTiers,
	}

	if s.bundle.DB == nil || userID == "" {
		return resp, nil
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var user models.User
	if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err == nil {
		resp.VIPLevel = user.VIPLevel
		resp.VIPExp = user.VIPExp
	}

	// Calculate next level info
	if resp.VIPLevel >= 20 {
		resp.NextLevel = 20
		resp.NextLevelExp = VIPTiers[19].RequiredEXP
		resp.ExpNeeded = 0
	} else {
		nextTier := VIPTiers[resp.VIPLevel] // 0-indexed matches level
		resp.NextLevel = nextTier.Level
		resp.NextLevelExp = nextTier.RequiredEXP
		if nextTier.RequiredEXP > resp.VIPExp {
			resp.ExpNeeded = nextTier.RequiredEXP - resp.VIPExp
		} else {
			resp.ExpNeeded = 0
		}
	}

	// Find claimed rewards
	var claims []models.VIPRewardClaim
	s.bundle.DB.Where("user_id = ?", userID).Find(&claims)

	claimedMap := make(map[string]time.Time)
	for _, c := range claims {
		if c.Type == "UPGRADE" {
			resp.ClaimedUpgrades = append(resp.ClaimedUpgrades, c.Level)
		} else {
			if existing, exists := claimedMap[c.Type]; !exists || c.ClaimedAt.After(existing) {
				claimedMap[c.Type] = c.ClaimedAt
			}
		}
	}

	// Check claimable upgrades (levels user reached but hasn't claimed)
	claimedSet := make(map[int]bool)
	for _, l := range resp.ClaimedUpgrades {
		claimedSet[l] = true
	}
	for i := 1; i <= resp.VIPLevel; i++ {
		if !claimedSet[i] {
			resp.ClaimableUpgrades = append(resp.ClaimableUpgrades, i)
		}
	}

	// Weekly claim check (cooldown: 7 days)
	if resp.VIPLevel >= 1 {
		tier := VIPTiers[resp.VIPLevel-1]
		resp.CurrentWeeklyReward = tier.WeeklyRewardRupees
		resp.CurrentMonthlyReward = tier.MonthlyRewardRupees

		lastWeekly, hasWeekly := claimedMap["WEEKLY"]
		if !hasWeekly {
			resp.CanClaimWeekly = true
		} else {
			diff := time.Since(lastWeekly)
			if diff >= 7*24*time.Hour {
				resp.CanClaimWeekly = true
			} else {
				resp.CanClaimWeekly = false
				resp.NextWeeklyClaimSecs = int64((7*24*time.Hour - diff).Seconds())
			}
		}

		// Monthly claim check (cooldown: 30 days)
		lastMonthly, hasMonthly := claimedMap["MONTHLY"]
		if !hasMonthly {
			resp.CanClaimMonthly = true
		} else {
			diff := time.Since(lastMonthly)
			if diff >= 30*24*time.Hour {
				resp.CanClaimMonthly = true
			} else {
				resp.CanClaimMonthly = false
				resp.NextMonthlyClaimSecs = int64((30*24*time.Hour - diff).Seconds())
			}
		}
	}

	return resp, nil
}

func (s *VIPService) ClaimUpgradeReward(userID string, level int) (float64, error) {
	if s.bundle.DB == nil || userID == "" {
		return 0, errors.New("database unavailable")
	}
	if level < 1 || level > 20 {
		return 0, errors.New("invalid VIP level")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var user models.User
	if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return 0, errors.New("user not found")
	}

	if user.VIPLevel < level {
		return 0, fmt.Errorf("you have not reached VIP Level %d yet", level)
	}

	var count int64
	s.bundle.DB.Model(&models.VIPRewardClaim{}).
		Where("user_id = ? AND type = 'UPGRADE' AND level = ?", userID, level).
		Count(&count)
	if count > 0 {
		return 0, errors.New("upgrade reward for this VIP level has already been claimed")
	}

	tier := VIPTiers[level-1]
	rewardChips := int64(tier.UpgradeRewardRupees * 100)

	err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
		claim := models.VIPRewardClaim{
			ID:        fmt.Sprintf("VIP-UPG-%s", uuid.New().String()[:8]),
			UserID:    userID,
			Type:      "UPGRADE",
			Level:     level,
			Chips:     rewardChips,
			ClaimedAt: time.Now(),
		}
		if err := tx.Create(&claim).Error; err != nil {
			return err
		}

		var wallet models.Wallet
		if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
			wallet = models.Wallet{UserID: userID}
			if err := tx.Create(&wallet).Error; err != nil {
				return err
			}
		}

		wallet.BonusChips += rewardChips
		wallet.UpdatedAt = time.Now()
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		txn := models.Transaction{
			ID:                fmt.Sprintf("TX-VIP-%s", uuid.New().String()[:8]),
			UserID:            userID,
			Type:              "VIP_UPGRADE_REWARD",
			AmountChips:       rewardChips,
			BalanceAfterChips: wallet.TotalChips(),
			AmountPaise:       rewardChips,
			BalanceAfterPaise: wallet.TotalChips(),
			Status:            "SUCCESS",
			ReferenceID:       claim.ID,
			Description:       fmt.Sprintf("VIP Level %d Upgrade Bonus", level),
			CreatedAt:         time.Now(),
		}
		return tx.Create(&txn).Error
	})

	if err != nil {
		return 0, err
	}

	return tier.UpgradeRewardRupees, nil
}

func (s *VIPService) ClaimWeeklyReward(userID string) (float64, error) {
	if s.bundle.DB == nil || userID == "" {
		return 0, errors.New("database unavailable")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var user models.User
	if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return 0, errors.New("user not found")
	}
	if user.VIPLevel < 1 {
		return 0, errors.New("VIP Level 1 or higher required to claim weekly reward")
	}

	var lastClaim models.VIPRewardClaim
	err := s.bundle.DB.Where("user_id = ? AND type = 'WEEKLY'", userID).Order("claimed_at desc").First(&lastClaim).Error
	if err == nil {
		if time.Since(lastClaim.ClaimedAt) < 7*24*time.Hour {
			remaining := 7*24*time.Hour - time.Since(lastClaim.ClaimedAt)
			return 0, fmt.Errorf("weekly reward already claimed. Next claim available in %d hours", int(remaining.Hours()))
		}
	}

	tier := VIPTiers[user.VIPLevel-1]
	rewardChips := int64(tier.WeeklyRewardRupees * 100)

	err = s.bundle.DB.Transaction(func(tx *gorm.DB) error {
		claim := models.VIPRewardClaim{
			ID:        fmt.Sprintf("VIP-WK-%s", uuid.New().String()[:8]),
			UserID:    userID,
			Type:      "WEEKLY",
			Level:     user.VIPLevel,
			Chips:     rewardChips,
			ClaimedAt: time.Now(),
		}
		if err := tx.Create(&claim).Error; err != nil {
			return err
		}

		var wallet models.Wallet
		if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
			wallet = models.Wallet{UserID: userID}
			if err := tx.Create(&wallet).Error; err != nil {
				return err
			}
		}

		wallet.BonusChips += rewardChips
		wallet.UpdatedAt = time.Now()
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		txn := models.Transaction{
			ID:                fmt.Sprintf("TX-WK-%s", uuid.New().String()[:8]),
			UserID:            userID,
			Type:              "VIP_WEEKLY_REWARD",
			AmountChips:       rewardChips,
			BalanceAfterChips: wallet.TotalChips(),
			AmountPaise:       rewardChips,
			BalanceAfterPaise: wallet.TotalChips(),
			Status:            "SUCCESS",
			ReferenceID:       claim.ID,
			Description:       fmt.Sprintf("VIP %d Weekly Reward", user.VIPLevel),
			CreatedAt:         time.Now(),
		}
		return tx.Create(&txn).Error
	})

	if err != nil {
		return 0, err
	}

	return tier.WeeklyRewardRupees, nil
}

func (s *VIPService) ClaimMonthlyReward(userID string) (float64, error) {
	if s.bundle.DB == nil || userID == "" {
		return 0, errors.New("database unavailable")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var user models.User
	if err := s.bundle.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return 0, errors.New("user not found")
	}
	if user.VIPLevel < 1 {
		return 0, errors.New("VIP Level 1 or higher required to claim monthly reward")
	}

	var lastClaim models.VIPRewardClaim
	err := s.bundle.DB.Where("user_id = ? AND type = 'MONTHLY'", userID).Order("claimed_at desc").First(&lastClaim).Error
	if err == nil {
		if time.Since(lastClaim.ClaimedAt) < 30*24*time.Hour {
			remaining := 30*24*time.Hour - time.Since(lastClaim.ClaimedAt)
			return 0, fmt.Errorf("monthly reward already claimed. Next claim available in %d days", int(remaining.Hours()/24))
		}
	}

	tier := VIPTiers[user.VIPLevel-1]
	rewardChips := int64(tier.MonthlyRewardRupees * 100)

	err = s.bundle.DB.Transaction(func(tx *gorm.DB) error {
		claim := models.VIPRewardClaim{
			ID:        fmt.Sprintf("VIP-MO-%s", uuid.New().String()[:8]),
			UserID:    userID,
			Type:      "MONTHLY",
			Level:     user.VIPLevel,
			Chips:     rewardChips,
			ClaimedAt: time.Now(),
		}
		if err := tx.Create(&claim).Error; err != nil {
			return err
		}

		var wallet models.Wallet
		if err := tx.Where("user_id = ?", userID).First(&wallet).Error; err != nil {
			wallet = models.Wallet{UserID: userID}
			if err := tx.Create(&wallet).Error; err != nil {
				return err
			}
		}

		wallet.BonusChips += rewardChips
		wallet.UpdatedAt = time.Now()
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		txn := models.Transaction{
			ID:                fmt.Sprintf("TX-MO-%s", uuid.New().String()[:8]),
			UserID:            userID,
			Type:              "VIP_MONTHLY_REWARD",
			AmountChips:       rewardChips,
			BalanceAfterChips: wallet.TotalChips(),
			AmountPaise:       rewardChips,
			BalanceAfterPaise: wallet.TotalChips(),
			Status:            "SUCCESS",
			ReferenceID:       claim.ID,
			Description:       fmt.Sprintf("VIP %d Monthly Reward", user.VIPLevel),
			CreatedAt:         time.Now(),
		}
		return tx.Create(&txn).Error
	})

	if err != nil {
		return 0, err
	}

	return tier.MonthlyRewardRupees, nil
}
