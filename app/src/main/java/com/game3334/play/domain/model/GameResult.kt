package com.game3334.play.domain.model

data class GameResult(
    val roundId: String,
    val winningSegmentIndex: Int,
    val resultTimestamp: Long,
    val fairnessHash: String? = null
)
