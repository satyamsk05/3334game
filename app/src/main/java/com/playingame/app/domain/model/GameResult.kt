package com.playingame.app.domain.model

data class GameResult(
    val roundId: String,
    val winningSegmentIndex: Int,
    val resultTimestamp: Long,
    val fairnessHash: String? = null
)
