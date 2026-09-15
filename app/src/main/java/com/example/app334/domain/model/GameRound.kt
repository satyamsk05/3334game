package com.example.app334.domain.model

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
