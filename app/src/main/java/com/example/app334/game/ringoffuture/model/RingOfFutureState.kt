package com.example.app334.game.ringoffuture.model

enum class GamePhase {
    BETTING,       // Users can place bets
    LOCKED,        // Bets locked, server calculating RNG
    SPINNING,      // Wheel animation in progress
    RESULT_SHOW    // Winning segment highlighted, win payouts awarded
}

data class UserBets(
    val greenBet: Double = 0.0,
    val redBet: Double = 0.0,
    val purpleBet: Double = 0.0,
    val greyBet: Double = 0.0
) {
    val totalBet: Double get() = greenBet + redBet + purpleBet + greyBet

    fun reset(): UserBets = UserBets()

    fun doubleBets(): UserBets = UserBets(
        greenBet = greenBet * 2,
        redBet = redBet * 2,
        purpleBet = purpleBet * 2,
        greyBet = greyBet * 2
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
    val lastWinAmount: Double = 0.0,
    val history: List<SpinResult> = emptyList(),
    val soundEnabled: Boolean = true,
    val totalPoolBets: Map<ColorType, Double> = mapOf(
        ColorType.GREEN to 1200.0,
        ColorType.RED to 8500.0,
        ColorType.PURPLE to 14200.0,
        ColorType.GREY to 21000.0
    )
)
