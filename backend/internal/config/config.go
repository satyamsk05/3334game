package config

import (
	"errors"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port           string
	DatabaseURL    string
	RedisHost      string
	RedisPort      string
	RedisPassword  string
	JWTSecret      string
	AdminJWTSecret string
	AdminUsername  string
	AdminPassword  string
	ClientOrigin   string
	LogginAppKey   string
}

func LoadConfig() (*Config, error) {
	// Automatically load .env from current dir or root workspace
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")

	port := os.Getenv("PORT")
	if port == "" {
		port = "5050"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = os.Getenv("SUPABASE_DB_URL")
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("SECURITY ERROR: 'JWT_SECRET' is missing. Please set JWT_SECRET in your .env file")
	}

	adminJwtSecret := os.Getenv("ADMIN_JWT_SECRET")
	if adminJwtSecret == "" {
		adminJwtSecret = os.Getenv("ADMIN_SECRET_KEY")
	}
	if adminJwtSecret == "" {
		return nil, errors.New("SECURITY ERROR: 'ADMIN_JWT_SECRET' (or 'ADMIN_SECRET_KEY') is missing. Please set it in your .env file")
	}

	logginAppKey := os.Getenv("LOGGIN_APP_KEY")

	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" {
		adminUser = "admin"
	}
	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		adminPass = "admin123"
	}

	return &Config{
		Port:           port,
		DatabaseURL:    dbURL,
		RedisHost:      os.Getenv("REDIS_HOST"),
		RedisPort:      os.Getenv("REDIS_PORT"),
		RedisPassword:  os.Getenv("REDIS_PASSWORD"),
		JWTSecret:      jwtSecret,
		AdminJWTSecret: adminJwtSecret,
		AdminUsername:  adminUser,
		AdminPassword:  adminPass,
		ClientOrigin:   os.Getenv("CORS_ORIGIN"),
		LogginAppKey:   logginAppKey,
	}, nil
}
