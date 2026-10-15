package game

import (
	"crypto/rand"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"sync"
	"sync/atomic"
	"time"

	"bitarcade-backend/internal/database"
	"bitarcade-backend/internal/models"
	"bitarcade-backend/internal/services"
	"bitarcade-backend/internal/ws"

	"github.com/google/uuid"
)

// ─────────────────────────────────────────────────────────────────────────────
// 1. Core Types (Matching Canonical Spec)
// ─────────────────────────────────────────────────────────────────────────────

type Phase string

const (
	PhaseBetting Phase = "BETTING"
	PhaseDealing Phase = "DEALING"
	PhaseResult  Phase = "RESULT"
)

type Card struct {
	Rank  int    `json:"rank"`  // 2-14 (14 = Ace)
	Suit  string `json:"suit"`  // "H", "D", "C", "S"
	IsRed bool   `json:"isRed"` // Helper for UI color
}

type Bet struct {
	ID        string    `json:"id"`
	UserID    string    `json:"userId"`
	Target    string    `json:"target"` // "DRAGON" | "TIGER" | "TIE"
	Amount    int64     `json:"amount"` // in chips (paise)
	Status    string    `json:"status"` // "ACCEPTED" | "SETTLED" | "REFUNDED"
	Payout    int64     `json:"payout"`
	CreatedAt time.Time `json:"createdAt"`
}

type Totals struct {
	Dragon int64 `json:"dragon"`
	Tiger  int64 `json:"tiger"`
	Tie    int64 `json:"tie"`
}

type RoundHistoryItem struct {
	RoundID   string `json:"roundId"`
	Winner    string `json:"winner"`
	Dragon    *Card  `json:"dragon,omitempty"`
	Tiger     *Card  `json:"tiger,omitempty"`
	Timestamp int64  `json:"timestamp"`
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. WebSocket Protocol Payloads
// ─────────────────────────────────────────────────────────────────────────────

type WsRoundStateMsg struct {
	Type         string `json:"type"` // "dt_round_state"
	RoundID      string `json:"roundId"`
	Phase        Phase  `json:"phase"`
	TimerSeconds int    `json:"timerSeconds"`
	MinBet       int64  `json:"minBet"`
	MaxBet       int64  `json:"maxBet"`
	Totals       Totals `json:"totals"`
}

type WsBetAcceptedMsg struct {
	Type       string `json:"type"` // "dt_bet_accepted"
	BetID      string `json:"betId"`
	Target     string `json:"target"`
	Amount     int64  `json:"amount"`
	NewBalance int64  `json:"newBalance"`
}

type WsBetRejectedMsg struct {
	Type    string `json:"type"` // "dt_bet_rejected"
	Code    string `json:"code"`
	Message string `json:"message"`
}

type CardsResult struct {
	Dragon *Card `json:"dragon"`
	Tiger  *Card `json:"tiger"`
}

type WsRoundResultMsg struct {
	Type        string      `json:"type"` // "dt_round_result"
	RoundID     string      `json:"roundId"`
	Winner      string      `json:"winner"` // "DRAGON" | "TIGER" | "TIE"
	Cards       CardsResult `json:"cards"`
	YourPayout  int64       `json:"yourPayout"`
	NewBalance  int64       `json:"newBalance"`
	Totals      Totals      `json:"totals"`
}

type WsHistoryMsg struct {
	Type   string             `json:"type"` // "dt_history"
	Rounds []RoundHistoryItem `json:"rounds"`
}

type WsErrorMsg struct {
	Type    string `json:"type"` // "dt_error"
	Code    string `json:"code"`
	Message string `json:"message"`
}

type IncomingWsAction struct {
	Action         string `json:"action"` // "dt_place_bet" | "dt_get_state" | "dt_get_history"
	RoundID        string `json:"roundId,omitempty"`
	Target         string `json:"target,omitempty"`
	Amount         int64  `json:"amount,omitempty"`
	Limit          int    `json:"limit,omitempty"`
	IdempotencyKey string `json:"idempotencyKey,omitempty"`
}

type cachedBetResult struct {
	bet     *Bet
	balance int64
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Dragon vs Tiger Engine Implementation
// ─────────────────────────────────────────────────────────────────────────────

type DragonTigerEngine struct {
	hub           *ws.Hub
	walletService *services.WalletService
	dbBundle      *database.DBBundle

	mu              sync.RWMutex
	roundID         string
	phase           Phase
	timerSeconds    int
	dragonCard      *Card
	tigerCard       *Card
	winner          string
	startedAt       time.Time
	bets            map[string]*Bet // betID -> Bet
	userBetsInRound map[string][]*Bet
	idempotentBets  map[string]cachedBetResult // Fix (Issue 10.1): Deduplicate bet submissions
	totalDragon     int64
	totalTiger      int64
	totalTie        int64

	bettingLocked atomic.Bool

	history []RoundHistoryItem

	// Config
	bettingDuration int
	dealingDuration int
	resultDuration  int
	minBetChips     int64
	maxBetChips     int64
}

func NewDragonTigerEngine(hub *ws.Hub, walletService *services.WalletService, dbBundle *database.DBBundle) *DragonTigerEngine {
	e := &DragonTigerEngine{
		hub:             hub,
		walletService:   walletService,
		dbBundle:        dbBundle,
		phase:           PhaseBetting,
		timerSeconds:    15,
		bettingDuration: 15,
		dealingDuration: 3,
		resultDuration:  5,
		minBetChips:     100,      // ₹1.00
		maxBetChips:     10000000, // ₹100,000.00
		bets:            make(map[string]*Bet),
		userBetsInRound: make(map[string][]*Bet),
		idempotentBets:  make(map[string]cachedBetResult),
		history:         make([]RoundHistoryItem, 0),
	}

	// Seed initial history
	e.seedInitialHistory()

	// Register WebSocket Message & Connect Hooks
	if hub != nil {
		hub.SetMessageHandler(e.handleClientMessage)
		hub.SetConnectHandler(e.handleClientConnect)
	}

	return e
}

func (e *DragonTigerEngine) Start() {
	go e.runLoop()
}

func (e *DragonTigerEngine) seedInitialHistory() {
	sampleWinners := []string{"T", "D", "T", "T", "D", "D", "T", "D", "T", "D"}
	for i, w := range sampleWinners {
		winner := "TIGER"
		if w == "D" {
			winner = "DRAGON"
		}
		e.history = append(e.history, RoundHistoryItem{
			RoundID:   fmt.Sprintf("DT-SEED-%02d", i+1),
			Winner:    winner,
			Timestamp: time.Now().Unix() - int64((len(sampleWinners)-i)*25),
		})
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. State Machine (Ticker Loop)
// ─────────────────────────────────────────────────────────────────────────────

func (e *DragonTigerEngine) runLoop() {
	for {
		// ──────────────────────────────
		// STEP 1: BETTING PHASE
		// ──────────────────────────────
		e.mu.Lock()
		now := time.Now()
		e.roundID = fmt.Sprintf("DT-%d", now.Unix()%100000000)
		e.phase = PhaseBetting
		e.timerSeconds = e.bettingDuration
		e.dragonCard = nil
		e.tigerCard = nil
		e.winner = ""
		e.startedAt = now
		e.bets = make(map[string]*Bet)
		e.userBetsInRound = make(map[string][]*Bet)
		e.idempotentBets = make(map[string]cachedBetResult)
		e.totalDragon = 0
		e.totalTiger = 0
		e.totalTie = 0
		e.bettingLocked.Store(false)

		currentRoundID := e.roundID
		e.mu.Unlock()

		// Persist round start in DB
		if e.dbBundle != nil && e.dbBundle.DB != nil {
			_ = e.dbBundle.DB.Create(&models.DtRound{
				ID:        currentRoundID,
				Phase:     string(PhaseBetting),
				StartedAt: now,
			})
		}

		log.Printf("[DRAGON_TIGER] Round %s: Phase BETTING started (%ds)", currentRoundID, e.bettingDuration)

		for t := e.bettingDuration; t >= 1; t-- {
			e.mu.Lock()
			e.timerSeconds = t
			stateMsg := e.buildRoundStateMsgLocked()
			e.mu.Unlock()

			e.broadcastJSON(stateMsg)
			time.Sleep(1 * time.Second)
		}

		// Lock betting before DEALING starts
		e.bettingLocked.Store(true)

		// ──────────────────────────────
		// STEP 2: DEALING PHASE (3s)
		// ──────────────────────────────
		e.mu.Lock()
		e.phase = PhaseDealing
		e.timerSeconds = e.dealingDuration
		dealingStateMsg := e.buildRoundStateMsgLocked()
		e.mu.Unlock()

		// Draw cards using crypto/rand
		dCard := getRandomCard()
		tCard := getRandomCard()
		for dCard.Rank == tCard.Rank && dCard.Suit == tCard.Suit {
			tCard = getRandomCard()
		}

		e.broadcastJSON(dealingStateMsg)

		// Persist drawn cards to DB
		if e.dbBundle != nil && e.dbBundle.DB != nil {
			_ = e.dbBundle.DB.Model(&models.DtRound{}).Where("id = ?", currentRoundID).Updates(map[string]interface{}{
				"phase":       string(PhaseDealing),
				"dragon_rank": dCard.Rank,
				"dragon_suit": dCard.Suit,
				"tiger_rank":  tCard.Rank,
				"tiger_suit":  tCard.Suit,
			})
		}

		time.Sleep(time.Duration(e.dealingDuration) * time.Second)

		// ──────────────────────────────
		// STEP 3: RESULT & SETTLEMENT
		// ──────────────────────────────
		var win string
		if dCard.Rank > tCard.Rank {
			win = "DRAGON"
		} else if tCard.Rank > dCard.Rank {
			win = "TIGER"
		} else {
			win = "TIE"
		}

		e.mu.Lock()
		e.phase = PhaseResult
		e.timerSeconds = e.resultDuration
		e.dragonCard = dCard
		e.tigerCard = tCard
		e.winner = win

		// Append to history
		histItem := RoundHistoryItem{
			RoundID:   currentRoundID,
			Winner:    win,
			Dragon:    dCard,
			Tiger:     tCard,
			Timestamp: time.Now().Unix(),
		}
		e.history = append(e.history, histItem)
		if len(e.history) > 20 {
			e.history = e.history[len(e.history)-20:]
		}

		finishedTime := time.Now()
		allBets := make([]*Bet, 0, len(e.bets))
		for _, b := range e.bets {
			allBets = append(allBets, b)
		}
		totalsSnapshot := Totals{
			Dragon: e.totalDragon,
			Tiger:  e.totalTiger,
			Tie:    e.totalTie,
		}
		e.mu.Unlock()

		// Update DB round finish
		if e.dbBundle != nil && e.dbBundle.DB != nil {
			_ = e.dbBundle.DB.Model(&models.DtRound{}).Where("id = ?", currentRoundID).Updates(map[string]interface{}{
				"phase":       string(PhaseResult),
				"winner":      win,
				"finished_at": finishedTime,
			})
		}

		// Settle all bets atomically & emit user-specific payouts
		e.settleAllBets(currentRoundID, win, dCard, tCard, allBets, totalsSnapshot)

		// General result broadcast (for spectators)
		generalResult := WsRoundResultMsg{
			Type:    "dt_round_result",
			RoundID: currentRoundID,
			Winner:  win,
			Cards: CardsResult{
				Dragon: dCard,
				Tiger:  tCard,
			},
			YourPayout: 0,
			NewBalance: 0,
			Totals:     totalsSnapshot,
		}
		e.broadcastJSON(generalResult)

		time.Sleep(time.Duration(e.resultDuration) * time.Second)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Settlement Logic (Atomic Wallet Credits & DB Updates)
// ─────────────────────────────────────────────────────────────────────────────

func (e *DragonTigerEngine) settleAllBets(
	roundID string,
	winner string,
	dragonCard *Card,
	tigerCard *Card,
	bets []*Bet,
	totals Totals,
) {
	userPayouts := make(map[string]int64)
	userBetsMap := make(map[string][]*Bet)

	for _, bet := range bets {
		userBetsMap[bet.UserID] = append(userBetsMap[bet.UserID], bet)

		var multiplier int64 = 0
		if bet.Target == winner {
			if winner == "TIE" {
				multiplier = 9 // 8:1 payout (9x total return)
			} else {
				multiplier = 2 // 1:1 payout (2x total return)
			}
		}

		if multiplier > 0 {
			payout := bet.Amount * multiplier
			bet.Payout = payout
			userPayouts[bet.UserID] += payout
		}
		bet.Status = "SETTLED"

		// Update bet row in DB
		if e.dbBundle != nil && e.dbBundle.DB != nil {
			_ = e.dbBundle.DB.Model(&models.DtBet{}).Where("id = ?", bet.ID).Updates(map[string]interface{}{
				"payout": bet.Payout,
				"status": "SETTLED",
			})
		}
	}

	// Credit wallet per user and notify all participants
	for userID := range userBetsMap {
		totalPayout := userPayouts[userID]
		var newBal int64 = 0
		if totalPayout > 0 {
			tx, err := e.walletService.CreditWinnings(userID, totalPayout, "Dragon vs Tiger", roundID)
			if err == nil && tx != nil {
				newBal = tx.BalanceAfterChips
			}
		} else {
			if w, err := e.walletService.GetOrCreateWallet(userID); err == nil && w != nil {
				newBal = w.TotalChips()
			}
		}

		// Send direct result message to player
		userResult := WsRoundResultMsg{
			Type:    "dt_round_result",
			RoundID: roundID,
			Winner:  winner,
			Cards: CardsResult{
				Dragon: dragonCard,
				Tiger:  tigerCard,
			},
			YourPayout: totalPayout,
			NewBalance: newBal,
			Totals:     totals,
		}
		if payload, err := json.Marshal(userResult); err == nil {
			e.hub.EmitToUser(userID, payload)
		}
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Bet Placement (Atomic Debit & Validation)
// ─────────────────────────────────────────────────────────────────────────────

func (e *DragonTigerEngine) PlaceBet(userID string, target string, amountChips int64) (*Bet, int64, error) {
	return e.PlaceBetWithIdempotency(userID, target, amountChips, "")
}

// Fix (Issues 2.6 & 10.1): UUID bet ID generation and Idempotency key checking to prevent duplicate bets
func (e *DragonTigerEngine) PlaceBetWithIdempotency(userID string, target string, amountChips int64, idempotencyKey string) (*Bet, int64, error) {
	// 1. Check betting phase lock
	if e.bettingLocked.Load() {
		return nil, 0, fmt.Errorf("LATE_BET: Betting is locked for this round")
	}

	e.mu.Lock()
	if e.phase != PhaseBetting || e.timerSeconds < 1 {
		e.mu.Unlock()
		return nil, 0, fmt.Errorf("LATE_BET: Round is not in betting phase")
	}

	// Check idempotency cache if key was provided
	if idempotencyKey != "" {
		if cached, exists := e.idempotentBets[idempotencyKey]; exists {
			e.mu.Unlock()
			return cached.bet, cached.balance, nil
		}
	}

	// 2. Target validation
	if target != "DRAGON" && target != "TIGER" && target != "TIE" {
		e.mu.Unlock()
		return nil, 0, fmt.Errorf("INVALID_TARGET: Target must be DRAGON, TIGER, or TIE")
	}

	// 3. Limit validation
	if amountChips < e.minBetChips || amountChips > e.maxBetChips {
		e.mu.Unlock()
		return nil, 0, fmt.Errorf("LIMIT_EXCEEDED: Bet must be between %d and %d chips", e.minBetChips, e.maxBetChips)
	}

	currentRoundID := e.roundID
	e.mu.Unlock()

	// 4. Atomic Debit from Wallet
	tx, err := e.walletService.DebitBet(userID, amountChips, "Dragon vs Tiger", currentRoundID)
	if err != nil {
		return nil, 0, fmt.Errorf("INSUFFICIENT_BALANCE: %v", err)
	}

	// 5. Record Bet in Memory & DB with collision-safe UUID
	betID := fmt.Sprintf("BET-%s-%d", uuid.New().String()[:8], time.Now().UnixNano())
	bet := &Bet{
		ID:        betID,
		UserID:    userID,
		Target:    target,
		Amount:    amountChips,
		Status:    "ACCEPTED",
		CreatedAt: time.Now(),
	}

	e.mu.Lock()
	e.bets[betID] = bet
	e.userBetsInRound[userID] = append(e.userBetsInRound[userID], bet)
	if idempotencyKey != "" {
		e.idempotentBets[idempotencyKey] = cachedBetResult{bet: bet, balance: tx.BalanceAfterChips}
	}
	switch target {
	case "DRAGON":
		e.totalDragon += amountChips
	case "TIGER":
		e.totalTiger += amountChips
	case "TIE":
		e.totalTie += amountChips
	}
	e.mu.Unlock()

	if e.dbBundle != nil && e.dbBundle.DB != nil {
		_ = e.dbBundle.DB.Create(&models.DtBet{
			ID:        betID,
			RoundID:   currentRoundID,
			UserID:    userID,
			Target:    target,
			Amount:    amountChips,
			Status:    "ACCEPTED",
			CreatedAt: bet.CreatedAt,
		})
	}

	return bet, tx.BalanceAfterChips, nil
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. WebSocket Handlers (Incoming Actions)
// ─────────────────────────────────────────────────────────────────────────────

func (e *DragonTigerEngine) handleClientMessage(client *ws.Client, msgBytes []byte) {
	var action IncomingWsAction
	if err := json.Unmarshal(msgBytes, &action); err != nil {
		e.sendClientJSON(client, WsErrorMsg{Type: "dt_error", Code: "INVALID_JSON", Message: "Malformed JSON payload"})
		return
	}

	switch action.Action {
	case "dt_place_bet":
		if client.UserID == "" || client.UserID == "guest" {
			e.sendClientJSON(client, WsBetRejectedMsg{Type: "dt_bet_rejected", Code: "UNAUTHORIZED", Message: "Please sign in to place bets"})
			return
		}

		bet, newBal, err := e.PlaceBetWithIdempotency(client.UserID, action.Target, action.Amount, action.IdempotencyKey)
		if err != nil {
			code := "BET_FAILED"
			msg := err.Error()
			if len(msg) > 9 && msg[:9] == "LATE_BET:" {
				code = "LATE_BET"
			} else if len(msg) > 15 && msg[:15] == "INVALID_TARGET:" {
				code = "INVALID_TARGET"
			} else if len(msg) > 15 && msg[:15] == "LIMIT_EXCEEDED:" {
				code = "LIMIT_EXCEEDED"
			} else if len(msg) > 21 && msg[:21] == "INSUFFICIENT_BALANCE:" {
				code = "INSUFFICIENT_BALANCE"
			}
			e.sendClientJSON(client, WsBetRejectedMsg{Type: "dt_bet_rejected", Code: code, Message: msg})
			return
		}

		// Emit accepted
		e.sendClientJSON(client, WsBetAcceptedMsg{
			Type:       "dt_bet_accepted",
			BetID:      bet.ID,
			Target:     bet.Target,
			Amount:     bet.Amount,
			NewBalance: newBal,
		})

	case "dt_get_state":
		e.mu.RLock()
		state := e.buildRoundStateMsgLocked()
		e.mu.RUnlock()
		e.sendClientJSON(client, state)

	case "dt_get_history":
		e.mu.RLock()
		limit := action.Limit
		if limit <= 0 || limit > 50 {
			limit = 20
		}
		hist := e.history
		if len(hist) > limit {
			hist = hist[len(hist)-limit:]
		}
		e.mu.RUnlock()
		e.sendClientJSON(client, WsHistoryMsg{Type: "dt_history", Rounds: hist})
	}
}

func (e *DragonTigerEngine) handleClientConnect(client *ws.Client) {
	// Immediately send round state & history to newly connected client
	e.mu.RLock()
	state := e.buildRoundStateMsgLocked()
	hist := e.history
	e.mu.RUnlock()

	e.sendClientJSON(client, state)
	e.sendClientJSON(client, WsHistoryMsg{Type: "dt_history", Rounds: hist})
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. Snapshot & Helpers
// ─────────────────────────────────────────────────────────────────────────────

func (e *DragonTigerEngine) GetGameID() string {
	return "dragontiger"
}

func (e *DragonTigerEngine) GetSnapshot() WsRoundStateMsg {
	e.mu.RLock()
	defer e.mu.RUnlock()
	return e.buildRoundStateMsgLocked()
}

// Fix Audit 6.6 & 10.3: Satisfy the unified GameEngine interface
func (e *DragonTigerEngine) GetSnapshotState() interface{} {
	return e.GetSnapshot()
}

var _ GameEngine = (*DragonTigerEngine)(nil)

func (e *DragonTigerEngine) GetHistory(limit int) []RoundHistoryItem {
	e.mu.RLock()
	defer e.mu.RUnlock()
	if limit <= 0 || limit > len(e.history) {
		limit = len(e.history)
	}
	return e.history[len(e.history)-limit:]
}

func (e *DragonTigerEngine) buildRoundStateMsgLocked() WsRoundStateMsg {
	return WsRoundStateMsg{
		Type:         "dt_round_state",
		RoundID:      e.roundID,
		Phase:        e.phase,
		TimerSeconds: e.timerSeconds,
		MinBet:       e.minBetChips,
		MaxBet:       e.maxBetChips,
		Totals: Totals{
			Dragon: e.totalDragon,
			Tiger:  e.totalTiger,
			Tie:    e.totalTie,
		},
	}
}

func (e *DragonTigerEngine) broadcastJSON(v interface{}) {
	data, err := json.Marshal(v)
	if err == nil {
		e.hub.Broadcast(data)
	}
}

func (e *DragonTigerEngine) sendClientJSON(client *ws.Client, v interface{}) {
	data, err := json.Marshal(v)
	if err == nil {
		e.hub.SendToClient(client, data)
	}
}

// ─────────────────────────────────────────────────────────────────────────────
// 9. Cryptographically Secure Card Generator
// ─────────────────────────────────────────────────────────────────────────────

func getRandomCard() *Card {
	// Ranks: 2-14 (14 = Ace)
	rBig, _ := rand.Int(rand.Reader, big.NewInt(13))
	rank := int(rBig.Int64()) + 2

	// Suits: "H", "D", "C", "S"
	suits := []string{"H", "D", "C", "S"}
	sBig, _ := rand.Int(rand.Reader, big.NewInt(4))
	suit := suits[sBig.Int64()]

	isRed := (suit == "H" || suit == "D")

	return &Card{
		Rank:  rank,
		Suit:  suit,
		IsRed: isRed,
	}
}
