package com.game3334.play.domain.model

enum class GamePhase {
    BETTING,
    LOCKED,
    SPINNING,
    RESULT_SHOW
}

data class GameRound(
    val id: String,
    val sequenceNumber: Long,
    val phase: GamePhase,
    val bettingOpenAt: Long,
    val bettingCloseAt: Long,
    val spinStartedAt: Long? = null,
    val resultAt: Long? = null,
    val result: GameResult? = null
)
