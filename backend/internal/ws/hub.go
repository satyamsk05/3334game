package ws

import (
	"log"
	"net/http"
	"strings"
	"sync"
	"time"

	"bitarcade-backend/internal/config"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
)


type Client struct {
	UserID string
	Conn   *websocket.Conn
	Send   chan []byte
}

type Hub struct {
	cfg        *config.Config
	clients    map[string]map[*Client]bool // userID -> set of clients
	broadcast  chan []byte
	register   chan *Client
	unregister chan *Client
	mu         sync.RWMutex
}

func NewHub(cfg *config.Config) *Hub {
	return &Hub{
		cfg:        cfg,
		clients:    make(map[string]map[*Client]bool),
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
	}
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			if _, ok := h.clients[client.UserID]; !ok {
				h.clients[client.UserID] = make(map[*Client]bool)
			}
			h.clients[client.UserID][client] = true
			h.mu.Unlock()
			log.Printf("[WS] Client connected: user=%s", client.UserID)

		case client := <-h.unregister:
			h.mu.Lock()
			if userClients, ok := h.clients[client.UserID]; ok {
				if _, exists := userClients[client]; exists {
					delete(userClients, client)
					close(client.Send)
					if len(userClients) == 0 {
						delete(h.clients, client.UserID)
					}
				}
			}
			h.mu.Unlock()
			log.Printf("[WS] Client disconnected: user=%s", client.UserID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for _, userClients := range h.clients {
				for client := range userClients {
					select {
					case client.Send <- message:
					default:
					}
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) EmitToUser(userID string, payload []byte) {
	h.mu.RLock()
	defer h.mu.RUnlock()
	if userClients, ok := h.clients[userID]; ok {
		for client := range userClients {
			select {
			case client.Send <- payload:
			default:
			}
		}
	}
}

func (h *Hub) Broadcast(payload []byte) {
	h.broadcast <- payload
}

func (h *Hub) HandleWebSocket(c *gin.Context) {
	tokenStr := c.Query("token")
	if tokenStr == "" {
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			tokenStr = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	userID := "guest"
	if tokenStr != "" {
		token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
			return []byte(h.cfg.JWTSecret), nil
		})
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				if uid, ok := claims["userId"].(string); ok && uid != "" {
					userID = uid
				}
			}
		}
	}

	upgrader := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			origin := r.Header.Get("Origin")
			if origin == "" {
				// Allow native mobile app clients (OkHttp / Android WebSocket client)
				return true
			}
			return h.cfg.IsOriginAllowed(origin)
		},
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Printf("[WS UPGRADE ERROR] %v", err)
		return
	}

	client := &Client{
		UserID: userID,
		Conn:   conn,
		Send:   make(chan []byte, 64),
	}

	h.register <- client

	go client.writePump()
	go client.readPump(h)
}

func (c *Client) readPump(h *Hub) {
	defer func() {
		h.unregister <- c
		c.Conn.Close()
	}()

	c.Conn.SetReadLimit(64 * 1024)
	c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
	c.Conn.SetPongHandler(func(string) error {
		c.Conn.SetReadDeadline(time.Now().Add(60 * time.Second))
		return nil
	})

	for {
		_, _, err := c.Conn.ReadMessage()
		if err != nil {
			break
		}
	}
}

func (c *Client) writePump() {
	ticker := time.NewTicker(30 * time.Second)
	defer func() {
		ticker.Stop()
		c.Conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.Send:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if !ok {
				c.Conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}
			if err := c.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			c.Conn.SetWriteDeadline(time.Now().Add(10 * time.Second))
			if err := c.Conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}
