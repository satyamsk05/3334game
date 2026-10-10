package middleware

import (
	"context"
	"fmt"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

type memoryLimiter struct {
	mu      sync.Mutex
	counts  map[string]int
	expires map[string]time.Time
}

var memLimiter = &memoryLimiter{
	counts:  make(map[string]int),
	expires: make(map[string]time.Time),
}

func (m *memoryLimiter) allow(key string, limit int, window time.Duration) bool {
	m.mu.Lock()
	defer m.mu.Unlock()

	now := time.Now()
	// Clean up expired keys periodically
	if exp, exists := m.expires[key]; !exists || now.After(exp) {
		m.counts[key] = 1
		m.expires[key] = now.Add(window)
		return true
	}

	if m.counts[key] >= limit {
		return false
	}

	m.counts[key]++
	return true
}

// RateLimitMiddleware creates a rate limiter based on client IP / identity.
// limit: maximum requests allowed per duration window.
func RateLimitMiddleware(rdb *redis.Client, prefix string, limit int, window time.Duration) gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()
		if clientIP == "" {
			clientIP = c.RemoteIP()
		}
		if clientIP == "" {
			clientIP = "unknown"
		}

		key := fmt.Sprintf("ratelimit:%s:%s", prefix, clientIP)
		allowed := true

		if rdb != nil {
			ctx, cancel := context.WithTimeout(c.Request.Context(), 500*time.Millisecond)
			defer cancel()

			count, err := rdb.Incr(ctx, key).Result()
			if err == nil {
				if count == 1 {
					rdb.Expire(ctx, key, window)
				}
				if count > int64(limit) {
					allowed = false
				}
			} else {
				// Redis unavailable or errored: fallback to in-memory limiter
				allowed = memLimiter.allow(key, limit, window)
			}
		} else {
			allowed = memLimiter.allow(key, limit, window)
		}

		if !allowed {
			c.Header("Retry-After", fmt.Sprintf("%d", int(window.Seconds())))
			c.JSON(http.StatusTooManyRequests, gin.H{
				"success": false,
				"error":   "Too many requests. Please slow down and try again later.",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
