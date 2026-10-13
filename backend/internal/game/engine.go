package game

// GameEngine represents a unified contract for all multiplayer & real-time casino engines
// (e.g., Dragon vs Tiger, Teen Patti, Aviator, Roulette).
type GameEngine interface {
	GetGameID() string
	Start()
	GetSnapshot() interface{}
}
