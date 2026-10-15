package game

// GameEngine represents a unified contract for all multiplayer & real-time casino engines
// (e.g., Dragon vs Tiger, Roulette, Andar Bahar, Aviator).
// Fix Audit 6.6 & 10.3: Explicitly define the unified engine contract implemented across game loops.
type GameEngine interface {
	GetGameID() string
	Start()
	GetSnapshotState() interface{}
}
