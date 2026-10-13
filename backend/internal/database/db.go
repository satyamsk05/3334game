package database

import (
	"context"
	"fmt"
	"log"
	"strings"
	"time"

	"bitarcade-backend/internal/config"
	"bitarcade-backend/internal/models"

	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type DBBundle struct {
	DB    *gorm.DB
	Redis *redis.Client
}

func InitDB(cfg *config.Config) (*DBBundle, error) {
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	}

	rawURL := strings.TrimSpace(cfg.DatabaseURL)
	if rawURL == "" {
		log.Println("[DATABASE WARNING] Neither DATABASE_URL nor SUPABASE_DB_URL is set in .env. Running without persistent database.")
	} else {
		// If connecting to Supabase (direct or pooler) and sslmode isn't specified, enforce sslmode=require
		if (strings.Contains(rawURL, "supabase.co") || strings.Contains(rawURL, "supabase.com")) && !strings.Contains(rawURL, "sslmode=") {
			separator := "?"
			if strings.Contains(rawURL, "?") {
				separator = "&"
			}
			rawURL = rawURL + separator + "sslmode=require"
		}
	}

	var db *gorm.DB
	if rawURL != "" {
		var err error
		db, err = gorm.Open(postgres.Open(rawURL), gormConfig)
		if err != nil {
			log.Printf("[DATABASE ERROR] Failed to connect to PostgreSQL / Supabase: %v", err)
			log.Println("[DATABASE] ⚠️  Falling back to in-memory state. Verify your DATABASE_URL in .env.")
			db = nil
		} else {
			sqlDB, err := db.DB()
			if err == nil {
				// Optimal connection pool settings for Supabase pooler / production EC2
				sqlDB.SetMaxIdleConns(5)
				sqlDB.SetMaxOpenConns(30)
				sqlDB.SetConnMaxLifetime(30 * time.Minute)
				sqlDB.SetConnMaxIdleTime(5 * time.Minute)
			}

			// Automatically create / migrate all core game & wallet tables
			log.Println("[DATABASE] 🚀 Auto-migrating core tables in Supabase / PostgreSQL...")
			err = db.AutoMigrate(
				&models.User{},
				&models.Wallet{},
				&models.Transaction{},
				&models.Deposit{},
				&models.Withdrawal{},
				&models.Promotion{},
				&models.DtRound{},
				&models.DtBet{},
			)
			if err != nil {
				log.Printf("[DATABASE WARNING] AutoMigrate warning: %v", err)
			} else {
				log.Println("[DATABASE] ✅ Database ready! Tables migrated: users, wallets, transactions, deposits, withdrawals, promotions, dt_rounds, dt_bets")
			}
		}
	}

	// ── Redis Connection (Optional with In-Memory Auto-Fallback) ──────────────
	redisHost := strings.TrimSpace(cfg.RedisHost)
	if redisHost == "" {
		redisHost = "127.0.0.1"
	}
	redisPort := strings.TrimSpace(cfg.RedisPort)
	if redisPort == "" {
		redisPort = "6379"
	}

	rdb := redis.NewClient(&redis.Options{
		Addr:         fmt.Sprintf("%s:%s", redisHost, redisPort),
		Password:     cfg.RedisPassword,
		DB:           0,
		DialTimeout:  1 * time.Second,
		ReadTimeout:  1 * time.Second,
		WriteTimeout: 1 * time.Second,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[REDIS] ℹ️  Redis not reachable at %s:%s (%v).", redisHost, redisPort, err)
		log.Println("[REDIS] ✅ Auto-fallback active: Using fast In-Memory Cache (No action needed).")
		rdb = nil
	} else {
		log.Printf("[REDIS] ✅ Connected to Redis successfully at %s:%s", redisHost, redisPort)
	}

	return &DBBundle{
		DB:    db,
		Redis: rdb,
	}, nil
}
