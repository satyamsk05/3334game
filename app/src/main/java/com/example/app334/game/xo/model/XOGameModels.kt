package com.example.app334.game.xo.model

data class XOTier(
    val id: String,
    val name: String,
    val entryRupees: Double,
    val firstPrizeRupees: Double,
    val secondPrizeRupees: Double = 0.0,
    val bonusUsableRupees: Double = 0.0,
    val playersCount: Int = 2
)

data class XOPlayer(
    val userId: String,
    val name: String,
    val avatarUrl: String = "",
    val symbol: String, // "O" or "X"
    val score: Int = 0,
    val isBot: Boolean = false
)

data class XORoomState(
    val roomId: String,
    val tier: XOTier,
    val player1: XOPlayer,
    val player2: XOPlayer?,
    val board: List<String?>, // 9 cells
    val currentTurnUserId: String,
    val status: String, // "MATCHMAKING", "IN_GAME", "COMPLETED", "CANCELLED"
    val turnSecondsRemaining: Int = 15,
    val totalGameSecondsRemaining: Int = 180,
    val winnerUserId: String? = null,
    val isDraw: Boolean = false,
    val winningIndices: List<Int>? = null
)
