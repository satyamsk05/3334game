package com.example.app334.domain.model

data class GameResult(
    val roundId: String,
    val winningSegmentIndex: Int,
    val resultTimestamp: Long,
    val fairnessHash: String? = null
)
