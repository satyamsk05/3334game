package models

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Phone     string    `gorm:"uniqueIndex;type:varchar(32)" json:"phone"`
	Name      string    `gorm:"type:varchar(64)" json:"name"`
	AvatarID  string    `gorm:"type:varchar(32);default:'avatar_1'" json:"avatarId"`
	FCMToken  string    `gorm:"type:varchar(512)" json:"fcmToken,omitempty"`
	IsBlocked bool      `gorm:"default:false" json:"isBlocked"`
	IsBanned  bool      `gorm:"default:false" json:"isBanned"`
	VIPLevel  int       `gorm:"default:0" json:"vipLevel"`
	VIPExp    int64     `gorm:"default:0" json:"vipExp"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

// BankAccount stores permanent bank & UPI details for withdrawals.
// Once bound, it is locked (IsLocked = true) and cannot be edited or deleted by the user.
// Only customer support / admin can unbind or rebind it.
type BankAccount struct {
	ID                string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID            string    `gorm:"uniqueIndex;type:varchar(64)" json:"userId"`
	AccountHolderName string    `gorm:"type:varchar(128)" json:"accountHolderName"`
	AccountNumber     string    `gorm:"type:varchar(64)" json:"accountNumber"`
	IFSC              string    `gorm:"type:varchar(32)" json:"ifsc"`
	BankName          string    `gorm:"type:varchar(64)" json:"bankName"`
	UPIID             string    `gorm:"type:varchar(64)" json:"upiId"`
	IsLocked          bool      `gorm:"default:true" json:"isLocked"`
	BoundAt           time.Time `json:"boundAt"`
	UpdatedAt         time.Time `json:"updatedAt"`
}

type VIPRewardClaim struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID    string    `gorm:"index;type:varchar(64)" json:"userId"`
	Type      string    `gorm:"type:varchar(32)" json:"type"` // UPGRADE, WEEKLY, MONTHLY
	Level     int       `json:"level"`
	Chips     int64     `json:"chips"`
	ClaimedAt time.Time `json:"claimedAt"`
}

type Wallet struct {
	UserID       string    `gorm:"primaryKey;type:varchar(64)" json:"userId"`
	DepositChips int64     `gorm:"default:0" json:"depositChips"`
	WinningChips int64     `gorm:"default:0" json:"winningChips"`
	BonusChips   int64     `gorm:"default:0" json:"bonusChips"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (w *Wallet) TotalChips() int64 {
	return w.DepositChips + w.WinningChips + w.BonusChips
}

func (w *Wallet) TotalPaise() int64 {
	return w.TotalChips()
}

func (w *Wallet) TotalRupees() float64 {
	return float64(w.TotalChips()) / 100.0
}

type Transaction struct {
	ID                string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID            string    `gorm:"index;type:varchar(64)" json:"userId"`
	Type              string    `gorm:"type:varchar(32)" json:"type"` // DEPOSIT, WITHDRAWAL, BET_PLACED, WIN_PAYOUT, BET_REFUND
	AmountChips       int64     `json:"amountChips"`
	BalanceAfterChips int64     `json:"balanceAfterChips"`
	AmountPaise       int64     `json:"amountPaise,omitempty"`
	BalanceAfterPaise int64     `json:"balanceAfterPaise,omitempty"`
	Status            string    `gorm:"type:varchar(32);default:'SUCCESS'" json:"status"` // SUCCESS, PENDING, REJECTED
	ReferenceID       string    `gorm:"index;type:varchar(128)" json:"referenceId"`
	Description       string    `gorm:"type:varchar(256)" json:"description"`
	CreatedAt         time.Time `json:"createdAt"`
}

type Deposit struct {
	ID           string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	DepositID    string    `gorm:"-" json:"depositId,omitempty"`
	UserID       string    `gorm:"index;type:varchar(64)" json:"userId"`
	AmountRupees float64   `json:"amountRupees"`
	Status       string    `gorm:"type:varchar(32);default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	UTR          string    `gorm:"index;type:varchar(64)" json:"utr"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Withdrawal struct {
	ID           string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	WithdrawalID string    `gorm:"-" json:"withdrawalId,omitempty"`
	UserID       string    `gorm:"index;type:varchar(64)" json:"userId"`
	AmountRupees float64   `json:"amountRupees"`
	UPIID        string    `gorm:"type:varchar(64)" json:"upiId"`
	Status       string    `gorm:"type:varchar(32);default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Promotion struct {
	ID            string `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Title         string `json:"title"`
	Subtitle      string `json:"subtitle"`
	GradientStart string `json:"gradientStart"`
	GradientEnd   string `json:"gradientEnd"`
	IconType      string `json:"iconType"`
	TargetRoute   string `json:"targetRoute"`
	BadgeText     string `json:"badgeText"`
	CtaText       string `json:"ctaText"`
	ImageURL      string `json:"imageUrl"`
	Active        bool   `gorm:"default:true" json:"active"`
	DisplayOrder  int    `gorm:"default:0" json:"displayOrder"`
}

type DtRound struct {
	ID          string     `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Phase       string     `gorm:"type:varchar(32)" json:"phase"`
	DragonRank  int        `json:"dragonRank"`
	DragonSuit  string     `gorm:"type:varchar(16)" json:"dragonSuit"`
	TigerRank   int        `json:"tigerRank"`
	TigerSuit   string     `gorm:"type:varchar(16)" json:"tigerSuit"`
	Winner      string     `gorm:"type:varchar(32)" json:"winner"`
	StartedAt   time.Time  `json:"startedAt"`
	FinishedAt  *time.Time `json:"finishedAt,omitempty"`
}

type DtBet struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	RoundID   string    `gorm:"index;type:varchar(64)" json:"roundId"`
	UserID    string    `gorm:"index;type:varchar(64)" json:"userId"`
	Target    string    `gorm:"type:varchar(32)" json:"target"` // DRAGON, TIGER, TIE
	Amount    int64     `json:"amount"`
	Payout    int64     `gorm:"default:0" json:"payout"`
	Status    string    `gorm:"type:varchar(32);default:'ACCEPTED'" json:"status"` // ACCEPTED, SETTLED, REFUNDED
	CreatedAt time.Time `json:"createdAt"`
}

// Fix (Issue 9.4): AuditLog tracks administrative actions for accountability and anti-fraud
type AuditLog struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	AdminUser string    `gorm:"index;type:varchar(64)" json:"adminUser"`
	Action    string    `gorm:"type:varchar(64)" json:"action"`
	TargetID  string    `gorm:"index;type:varchar(64)" json:"targetId"`
	Details   string    `gorm:"type:text" json:"details"`
	IPAddress string    `gorm:"type:varchar(64)" json:"ipAddress"`
	CreatedAt time.Time `json:"createdAt"`
}

type TaskMission struct {
	ID          string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Title       string    `gorm:"type:varchar(128)" json:"title"`
	Description string    `gorm:"type:varchar(256)" json:"description"`
	Category    string    `gorm:"type:varchar(32);default:'MISSION'" json:"category"` // REWARD or MISSION
	Type        string    `gorm:"type:varchar(64)" json:"type"`                     // DAILY_CHECKIN, PLAY_GAMES, BET_AMOUNT, DEPOSIT, WIN_GAMES
	TargetCount int64     `gorm:"default:1" json:"targetCount"`                     // Target value
	RewardChips int64     `gorm:"default:0" json:"rewardChips"`                     // Reward chips/paise
	IconURL     string    `gorm:"type:varchar(256)" json:"iconUrl"`
	Active      bool      `gorm:"default:true" json:"active"`
	SortOrder   int       `gorm:"default:0" json:"sortOrder"`
	DayNumber   int       `gorm:"default:0" json:"dayNumber"`                       // 1-7 for daily check-in
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type UserTaskProgress struct {
	ID           string     `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID       string     `gorm:"index;type:varchar(64)" json:"userId"`
	TaskID       string     `gorm:"index;type:varchar(64)" json:"taskId"`
	CurrentCount int64      `gorm:"default:0" json:"currentCount"`
	IsCompleted  bool       `gorm:"default:false" json:"isCompleted"`
	IsClaimed    bool       `gorm:"default:false" json:"isClaimed"`
	ClaimedAt    *time.Time `json:"claimedAt,omitempty"`
	ResetDate    string     `gorm:"type:varchar(16)" json:"resetDate"` // YYYY-MM-DD
	UpdatedAt    time.Time  `json:"updatedAt"`
}

type DailyCheckinRecord struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID    string    `gorm:"index;type:varchar(64)" json:"userId"`
	DayNumber int       `json:"dayNumber"` // 1-7
	Date      string    `gorm:"type:varchar(16)" json:"date"` // YYYY-MM-DD
	Chips     int64     `json:"chips"`
	ClaimedAt time.Time `json:"claimedAt"`
}


