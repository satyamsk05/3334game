package com.example.app334.game.ringoffuture.model

enum class GamePhase {
    BETTING,       // Users can place bets
    LOCKED,        // Bets locked, server calculating RNG
    SPINNING,      // Wheel animation in progress
    RESULT_SHOW    // Winning segment highlighted, win payouts awarded
}

data class UserBets(
    val blackBet: Long = 0L,   // in paise (Black 2x)
    val redBet: Long = 0L,     // in paise (Red 3x)
    val blueBet: Long = 0L,    // in paise (Blue 5x)
    val greenBet: Long = 0L    // in paise (Green 50x)
) {
    val purpleBet: Long get() = blueBet
    val greyBet: Long get() = blackBet

    val totalBet: Long get() = blackBet + redBet + blueBet + greenBet

    fun reset(): UserBets = UserBets()

    fun doubleBets(): UserBets = UserBets(
        blackBet = blackBet * 2,
        redBet = redBet * 2,
        blueBet = blueBet * 2,
        greenBet = greenBet * 2
    )
}

data class SpinResult(
    val roundNumber: Long,
    val segmentIndex: Int,
    val winningColor: ColorType,
    val multiplier: Float,
    val timestamp: Long = System.currentTimeMillis()
)

data class RingOfFutureGameState(
    val phase: GamePhase = GamePhase.BETTING,
    val secondsRemaining: Int = WheelConfig.BETTING_TIME_SECONDS,
    val roundNumber: Long = 1001L,
    val userBets: UserBets = UserBets(),
    val selectedChip: Int = 50,
    val winningSegmentIndex: Int = 0,
    val winningSegment: WheelSegment? = null,
    val lastWinAmount: Long = 0L,  // in paise
    val history: List<SpinResult> = emptyList(),
    val soundEnabled: Boolean = true
)
