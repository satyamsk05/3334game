package config

import (
	"errors"
	"os"
	"strings"

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
	// AllowedOrigins is the parsed allowlist from CORS_ORIGIN (comma-separated).
	// Empty slice means no CORS restriction was configured (lock down in middleware).
	AllowedOrigins []string
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

	// ── JWT secrets ──────────────────────────────────────────────────────────
	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		return nil, errors.New("SECURITY ERROR: JWT_SECRET is missing. Set it in your .env file")
	}
	if len(jwtSecret) < 32 {
		return nil, errors.New("SECURITY ERROR: JWT_SECRET must be at least 32 characters long")
	}

	adminJwtSecret := os.Getenv("ADMIN_JWT_SECRET")
	if adminJwtSecret == "" {
		adminJwtSecret = os.Getenv("ADMIN_SECRET_KEY")
	}
	if adminJwtSecret == "" {
		return nil, errors.New("SECURITY ERROR: ADMIN_JWT_SECRET (or ADMIN_SECRET_KEY) is missing. Set it in your .env file")
	}
	if len(adminJwtSecret) < 32 {
		return nil, errors.New("SECURITY ERROR: ADMIN_JWT_SECRET must be at least 32 characters long")
	}

	// ── Admin credentials ─────────────────────────────────────────────────────
	// SEC-01 / SEC-06 fix: NO hardcoded fallbacks — server refuses to start without these.
	adminUser := os.Getenv("ADMIN_USERNAME")
	if adminUser == "" {
		return nil, errors.New("SECURITY ERROR: ADMIN_USERNAME is missing. Set it in your .env file")
	}

	adminPass := os.Getenv("ADMIN_PASSWORD")
	if adminPass == "" {
		return nil, errors.New("SECURITY ERROR: ADMIN_PASSWORD is missing. Set it in your .env file")
	}
	if len(adminPass) < 12 {
		return nil, errors.New("SECURITY ERROR: ADMIN_PASSWORD must be at least 12 characters long")
	}

	// ── CORS ─────────────────────────────────────────────────────────────────
	corsOrigin := os.Getenv("CORS_ORIGIN")
	var allowedOrigins []string
	if corsOrigin != "" && corsOrigin != "*" {
		for _, o := range strings.Split(corsOrigin, ",") {
			if o = strings.TrimSpace(o); o != "" {
				allowedOrigins = append(allowedOrigins, o)
			}
		}
	}

	logginAppKey := os.Getenv("LOGGIN_APP_KEY")

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
		ClientOrigin:   corsOrigin,
		LogginAppKey:   logginAppKey,
		AllowedOrigins: allowedOrigins,
	}, nil
}
