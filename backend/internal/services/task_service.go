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

type TaskService struct {
	bundle *database.DBBundle
	mu     sync.Mutex
}

func NewTaskService(bundle *database.DBBundle) *TaskService {
	s := &TaskService{
		bundle: bundle,
	}
	s.EnsureDefaultTasks()
	return s
}

// EnsureDefaultTasks seeds standard dynamic check-in rewards & gameplay missions if empty
func (s *TaskService) EnsureDefaultTasks() {
	if s.bundle.DB == nil {
		return
	}

	var count int64
	s.bundle.DB.Model(&models.TaskMission{}).Count(&count)
	if count > 0 {
		return
	}

	defaults := []models.TaskMission{
		// 7-Day Daily Check-in Rewards
		{ID: "CHK-DAY-1", Title: "Day 1 Check-in", Description: "Log in today to claim free bonus", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 1, RewardChips: 200, TargetCount: 1, Active: true, SortOrder: 1},
		{ID: "CHK-DAY-2", Title: "Day 2 Check-in", Description: "Consecutive log in reward", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 2, RewardChips: 500, TargetCount: 1, Active: true, SortOrder: 2},
		{ID: "CHK-DAY-3", Title: "Day 3 Check-in", Description: "Consecutive log in reward", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 3, RewardChips: 800, TargetCount: 1, Active: true, SortOrder: 3},
		{ID: "CHK-DAY-4", Title: "Day 4 Check-in", Description: "Consecutive log in reward", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 4, RewardChips: 1200, TargetCount: 1, Active: true, SortOrder: 4},
		{ID: "CHK-DAY-5", Title: "Day 5 Check-in", Description: "Consecutive log in reward", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 5, RewardChips: 1800, TargetCount: 1, Active: true, SortOrder: 5},
		{ID: "CHK-DAY-6", Title: "Day 6 Check-in", Description: "Consecutive log in reward", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 6, RewardChips: 2500, TargetCount: 1, Active: true, SortOrder: 6},
		{ID: "CHK-DAY-7", Title: "Day 7 Grand Mystery Gift", Description: "7-day streak completion bonus gift box", Category: "REWARD", Type: "DAILY_CHECKIN", DayNumber: 7, RewardChips: 5000, TargetCount: 1, Active: true, SortOrder: 7},

		// Gameplay & Action Missions
		{ID: "MSN-PLAY-5", Title: "Play 5 Rounds", Description: "Play 5 rounds in Dragon vs Tiger", Category: "MISSION", Type: "PLAY_GAMES", TargetCount: 5, RewardChips: 1000, Active: true, SortOrder: 10},
		{ID: "MSN-BET-500", Title: "High Roller Daily", Description: "Place cumulative ₹500 bets today", Category: "MISSION", Type: "BET_AMOUNT", TargetCount: 50000, RewardChips: 2500, Active: true, SortOrder: 11},
		{ID: "MSN-WIN-3", Title: "Dragon Streak", Description: "Win 3 rounds in Dragon vs Tiger", Category: "MISSION", Type: "WIN_GAMES", TargetCount: 3, RewardChips: 1500, Active: true, SortOrder: 12},
		{ID: "MSN-DEPOSIT-100", Title: "Recharge Power", Description: "Recharge ₹100 or more to get extra cash", Category: "MISSION", Type: "DEPOSIT", TargetCount: 100, RewardChips: 3000, Active: true, SortOrder: 13},
	}

	for _, t := range defaults {
		t.CreatedAt = time.Now()
		t.UpdatedAt = time.Now()
		_ = s.bundle.DB.Create(&t).Error
	}
}

type CheckinDayStatus struct {
	DayNumber   int     `json:"dayNumber"`
	RewardRupees float64 `json:"rewardRupees"`
	RewardChips int64   `json:"rewardChips"`
	IsClaimed   bool    `json:"isClaimed"`
	IsCurrent   bool    `json:"isCurrent"`
}

type TaskResponse struct {
	Checkin struct {
		CurrentStreak int                `json:"currentStreak"`
		CanClaimToday bool               `json:"canClaimToday"`
		TodayReward   float64            `json:"todayReward"`
		Days          []CheckinDayStatus `json:"days"`
	} `json:"checkin"`
	Missions []MissionItem `json:"missions"`
}

type MissionItem struct {
	ID           string  `json:"id"`
	Title        string  `json:"title"`
	Description  string  `json:"description"`
	Type         string  `json:"type"`
	TargetCount  int64   `json:"targetCount"`
	CurrentCount int64   `json:"currentCount"`
	RewardRupees float64 `json:"rewardRupees"`
	RewardChips  int64   `json:"rewardChips"`
	IsCompleted  bool    `json:"isCompleted"`
	IsClaimed    bool    `json:"isClaimed"`
}

// GetTasks returns active check-in data and missions with user progress
func (s *TaskService) GetTasks(userID string) (*TaskResponse, error) {
	resp := &TaskResponse{}

	todayStr := time.Now().Format("2006-01-02")
	yesterdayStr := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	if s.bundle.DB == nil {
		return resp, nil
	}

	// 1. Check-in records for user
	var lastClaim models.DailyCheckinRecord
	hasLast := s.bundle.DB.Where("user_id = ?", userID).Order("claimed_at desc").First(&lastClaim).Error == nil

	currentStreak := 0
	canClaimToday := true

	if hasLast {
		if lastClaim.Date == todayStr {
			canClaimToday = false
			currentStreak = lastClaim.DayNumber
		} else if lastClaim.Date == yesterdayStr {
			currentStreak = lastClaim.DayNumber
		} else {
			// Streak broken
			currentStreak = 0
		}
	}

	resp.Checkin.CurrentStreak = currentStreak
	resp.Checkin.CanClaimToday = canClaimToday

	// Next claim day
	nextDay := currentStreak + 1
	if !canClaimToday {
		nextDay = currentStreak
	}
	if nextDay > 7 {
		nextDay = 1
	}

	// Fetch checkin task definitions
	var checkinTasks []models.TaskMission
	s.bundle.DB.Where("category = 'REWARD' AND active = true").Order("sort_order asc").Find(&checkinTasks)

	// Fetch today's claims
	var userClaims []models.DailyCheckinRecord
	s.bundle.DB.Where("user_id = ?", userID).Find(&userClaims)
	claimedDaysMap := make(map[int]bool)
	for _, c := range userClaims {
		claimedDaysMap[c.DayNumber] = true
	}

	for _, ct := range checkinTasks {
		isClaimed := false
		if canClaimToday {
			isClaimed = ct.DayNumber <= currentStreak
		} else {
			isClaimed = ct.DayNumber <= currentStreak
		}

		isCur := ct.DayNumber == nextDay && canClaimToday

		if isCur {
			resp.Checkin.TodayReward = float64(ct.RewardChips) / 100.0
		}

		resp.Checkin.Days = append(resp.Checkin.Days, CheckinDayStatus{
			DayNumber:    ct.DayNumber,
			RewardRupees: float64(ct.RewardChips) / 100.0,
			RewardChips:  ct.RewardChips,
			IsClaimed:    isClaimed,
			IsCurrent:    isCur,
		})
	}

	// 2. Fetch Missions
	var missions []models.TaskMission
	s.bundle.DB.Where("category = 'MISSION' AND active = true").Order("sort_order asc").Find(&missions)

	// Fetch progress for today
	var progresses []models.UserTaskProgress
	s.bundle.DB.Where("user_id = ? AND reset_date = ?", userID, todayStr).Find(&progresses)
	progMap := make(map[string]models.UserTaskProgress)
	for _, p := range progresses {
		progMap[p.TaskID] = p
	}

	// Count today's real user bets for progress
	var todayBetsCount int64
	var todayBetsAmount int64
	var todayWinsCount int64
	startOfToday := time.Now().Truncate(24 * time.Hour)
	s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ?", userID, startOfToday).Count(&todayBetsCount)
	s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ?", userID, startOfToday).Select("COALESCE(SUM(amount), 0)").Scan(&todayBetsAmount)
	s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ? AND payout > 0", userID, startOfToday).Count(&todayWinsCount)

	for _, m := range missions {
		p, exists := progMap[m.ID]
		currentCount := int64(0)
		if exists {
			currentCount = p.CurrentCount
		}

		// Sync with real bets if greater
		if m.Type == "PLAY_GAMES" && todayBetsCount > currentCount {
			currentCount = todayBetsCount
		} else if m.Type == "BET_AMOUNT" && todayBetsAmount > currentCount {
			currentCount = todayBetsAmount
		} else if m.Type == "WIN_GAMES" && todayWinsCount > currentCount {
			currentCount = todayWinsCount
		}

		isCompleted := currentCount >= m.TargetCount
		isClaimed := exists && p.IsClaimed

		resp.Missions = append(resp.Missions, MissionItem{
			ID:           m.ID,
			Title:        m.Title,
			Description:  m.Description,
			Type:         m.Type,
			TargetCount:  m.TargetCount,
			CurrentCount: currentCount,
			RewardRupees: float64(m.RewardChips) / 100.0,
			RewardChips:  m.RewardChips,
			IsCompleted:  isCompleted,
			IsClaimed:    isClaimed,
		})
	}

	return resp, nil
}

// ClaimDailyCheckin claims today's reward and credits bonus chips
func (s *TaskService) ClaimDailyCheckin(userID string) (float64, error) {
	if s.bundle.DB == nil {
		return 0, errors.New("database not available")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	todayStr := time.Now().Format("2006-01-02")
	yesterdayStr := time.Now().AddDate(0, 0, -1).Format("2006-01-02")

	// Check if already claimed today
	var todayClaim models.DailyCheckinRecord
	if err := s.bundle.DB.Where("user_id = ? AND date = ?", userID, todayStr).First(&todayClaim).Error; err == nil {
		return 0, errors.New("today's check-in bonus already claimed! Come back tomorrow.")
	}

	// Calculate streak day
	var lastClaim models.DailyCheckinRecord
	streakDay := 1
	if err := s.bundle.DB.Where("user_id = ?", userID).Order("claimed_at desc").First(&lastClaim).Error; err == nil {
		if lastClaim.Date == yesterdayStr {
			streakDay = lastClaim.DayNumber + 1
			if streakDay > 7 {
				streakDay = 1
			}
		}
	}

	// Find the reward for this streak day
	var task models.TaskMission
	if err := s.bundle.DB.Where("category = 'REWARD' AND day_number = ? AND active = true", streakDay).First(&task).Error; err != nil {
		task.RewardChips = int64(streakDay * 200) // Fallback ₹2, ₹4...
	}

	rewardChips := task.RewardChips

	// Execute transaction to credit wallet and record claim
	err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
		record := models.DailyCheckinRecord{
			ID:        fmt.Sprintf("CHK-%s-%d", uuid.New().String()[:8], streakDay),
			UserID:    userID,
			DayNumber: streakDay,
			Date:      todayStr,
			Chips:     rewardChips,
			ClaimedAt: time.Now(),
		}
		if err := tx.Create(&record).Error; err != nil {
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

		// Log transaction
		txn := models.Transaction{
			ID:                fmt.Sprintf("TX-CHK-%s", uuid.New().String()[:8]),
			UserID:            userID,
			Type:              "DAILY_CHECKIN_REWARD",
			AmountChips:       rewardChips,
			BalanceAfterChips: wallet.TotalChips(),
			Status:            "SUCCESS",
			ReferenceID:       record.ID,
			Description:       fmt.Sprintf("Daily Check-in Day %d Reward: +₹%.2f", streakDay, float64(rewardChips)/100.0),
			CreatedAt:         time.Now(),
		}
		return tx.Create(&txn).Error
	})

	if err != nil {
		return 0, err
	}

	return float64(rewardChips) / 100.0, nil
}

// ClaimMission claims a completed mission reward
func (s *TaskService) ClaimMission(userID string, taskID string) (float64, error) {
	if s.bundle.DB == nil {
		return 0, errors.New("database not available")
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	todayStr := time.Now().Format("2006-01-02")

	var mission models.TaskMission
	if err := s.bundle.DB.Where("id = ? AND active = true", taskID).First(&mission).Error; err != nil {
		return 0, errors.New("mission not found or inactive")
	}

	// Verify progress
	startOfToday := time.Now().Truncate(24 * time.Hour)
	var currentCount int64
	if mission.Type == "PLAY_GAMES" {
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ?", userID, startOfToday).Count(&currentCount)
	} else if mission.Type == "BET_AMOUNT" {
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ?", userID, startOfToday).Select("COALESCE(SUM(amount), 0)").Scan(&currentCount)
	} else if mission.Type == "WIN_GAMES" {
		s.bundle.DB.Model(&models.DtBet{}).Where("user_id = ? AND created_at >= ? AND payout > 0", userID, startOfToday).Count(&currentCount)
	} else if mission.Type == "DEPOSIT" {
		var depCount int64
		s.bundle.DB.Model(&models.Deposit{}).Where("user_id = ? AND status = 'APPROVED'", userID).Count(&depCount)
		currentCount = depCount
	}

	if currentCount < mission.TargetCount {
		return 0, fmt.Errorf("mission target not yet reached (%d/%d)", currentCount, mission.TargetCount)
	}

	// Check if already claimed
	var prog models.UserTaskProgress
	if err := s.bundle.DB.Where("user_id = ? AND task_id = ? AND reset_date = ?", userID, taskID, todayStr).First(&prog).Error; err == nil {
		if prog.IsClaimed {
			return 0, errors.New("this mission reward has already been claimed today!")
		}
	}

	rewardChips := mission.RewardChips

	now := time.Now()
	err := s.bundle.DB.Transaction(func(tx *gorm.DB) error {
		prog.ID = fmt.Sprintf("PRG-%s-%s", userID[:6], taskID)
		prog.UserID = userID
		prog.TaskID = taskID
		prog.CurrentCount = currentCount
		prog.IsCompleted = true
		prog.IsClaimed = true
		prog.ClaimedAt = &now
		prog.ResetDate = todayStr
		prog.UpdatedAt = now

		if err := tx.Save(&prog).Error; err != nil {
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
		wallet.UpdatedAt = now
		if err := tx.Save(&wallet).Error; err != nil {
			return err
		}

		txn := models.Transaction{
			ID:                fmt.Sprintf("TX-MSN-%s", uuid.New().String()[:8]),
			UserID:            userID,
			Type:              "MISSION_REWARD",
			AmountChips:       rewardChips,
			BalanceAfterChips: wallet.TotalChips(),
			Status:            "SUCCESS",
			ReferenceID:       taskID,
			Description:       fmt.Sprintf("Mission Reward (%s): +₹%.2f", mission.Title, float64(rewardChips)/100.0),
			CreatedAt:         now,
		}
		return tx.Create(&txn).Error
	})

	if err != nil {
		return 0, err
	}

	return float64(rewardChips) / 100.0, nil
}

// Admin Management APIs
func (s *TaskService) AdminListTasks() ([]models.TaskMission, error) {
	if s.bundle.DB == nil {
		return nil, errors.New("database not available")
	}
	var tasks []models.TaskMission
	err := s.bundle.DB.Order("category asc, sort_order asc").Find(&tasks).Error
	return tasks, err
}

func (s *TaskService) AdminSaveTask(task *models.TaskMission) error {
	if s.bundle.DB == nil {
		return errors.New("database not available")
	}
	if task.ID == "" {
		task.ID = fmt.Sprintf("TSK-%s", uuid.New().String()[:8])
		task.CreatedAt = time.Now()
	}
	task.UpdatedAt = time.Now()
	return s.bundle.DB.Save(task).Error
}

func (s *TaskService) AdminDeleteTask(taskID string) error {
	if s.bundle.DB == nil {
		return errors.New("database not available")
	}
	return s.bundle.DB.Where("id = ?", taskID).Delete(&models.TaskMission{}).Error
}
