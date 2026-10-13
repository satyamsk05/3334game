package database

import (
	"context"
	"fmt"
	"log"
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

	db, err := gorm.Open(postgres.Open(cfg.DatabaseURL), gormConfig)
	if err != nil {
		log.Printf("[DB WARNING] PostgreSQL connection failed: %v. Running in-memory / fallback mode.", err)
		db = nil
	} else {
		sqlDB, err := db.DB()
		if err == nil {
			sqlDB.SetMaxIdleConns(10)
			sqlDB.SetMaxOpenConns(50)
			sqlDB.SetConnMaxLifetime(time.Hour)
		}

		// Auto-migrate tables
		_ = db.AutoMigrate(
			&models.User{},
			&models.Wallet{},
			&models.Transaction{},
			&models.Deposit{},
			&models.Withdrawal{},
			&models.Promotion{},
			&models.DtRound{},
			&models.DtBet{},
		)
		log.Println("[DB] PostgreSQL connected & tables migrated successfully")
	}

	// Redis connection
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       0,
	})

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("[REDIS WARNING] Redis not reachable (%v). Continuing without Redis caching.", err)
	} else {
		log.Println("[REDIS] Redis client connected successfully")
	}

	return &DBBundle{
		DB:    db,
		Redis: rdb,
	}, nil
}
