package models

import (
	"time"
)

type User struct {
	ID        string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	Phone     string    `gorm:"uniqueIndex;type:varchar(32)" json:"phone"`
	Name      string    `gorm:"type:varchar(64)" json:"name"`
	AvatarID  string    `gorm:"type:varchar(32);default:'avatar_1'" json:"avatarId"`
	IsBlocked bool      `gorm:"default:false" json:"isBlocked"`
	IsBanned  bool      `gorm:"default:false" json:"isBanned"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Wallet struct {
	UserID       string    `gorm:"primaryKey;type:varchar(64)" json:"userId"`
	DepositPaise int64     `gorm:"default:0" json:"depositPaise"`
	WinningPaise int64     `gorm:"default:0" json:"winningPaise"`
	BonusPaise   int64     `gorm:"default:0" json:"bonusPaise"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

func (w *Wallet) TotalPaise() int64 {
	return w.DepositPaise + w.WinningPaise + w.BonusPaise
}

func (w *Wallet) TotalRupees() float64 {
	return float64(w.TotalPaise()) / 100.0
}

type Transaction struct {
	ID                string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID            string    `gorm:"index;type:varchar(64)" json:"userId"`
	Type              string    `gorm:"type:varchar(32)" json:"type"` // DEPOSIT, WITHDRAWAL, BET_PLACED, WIN_PAYOUT, BET_REFUND
	AmountPaise       int64     `json:"amountPaise"`
	BalanceAfterPaise int64     `json:"balanceAfterPaise"`
	Status            string    `gorm:"type:varchar(32);default:'SUCCESS'" json:"status"` // SUCCESS, PENDING, REJECTED
	ReferenceID       string    `gorm:"index;type:varchar(128)" json:"referenceId"`
	Description       string    `gorm:"type:varchar(256)" json:"description"`
	CreatedAt         time.Time `json:"createdAt"`
}

type Deposit struct {
	ID           string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
	UserID       string    `gorm:"index;type:varchar(64)" json:"userId"`
	AmountRupees float64   `json:"amountRupees"`
	Status       string    `gorm:"type:varchar(32);default:'PENDING'" json:"status"` // PENDING, APPROVED, REJECTED
	UTR          string    `gorm:"type:varchar(64)" json:"utr"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`
}

type Withdrawal struct {
	ID           string    `gorm:"primaryKey;type:varchar(64)" json:"id"`
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
	Active        bool   `gorm:"default:true" json:"active"`
	DisplayOrder  int    `gorm:"default:0" json:"displayOrder"`
}
