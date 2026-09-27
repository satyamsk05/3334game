package com.game3334.play.domain.repository

import com.game3334.play.domain.model.GameRound
import com.game3334.play.domain.model.GameResult
import kotlinx.coroutines.flow.Flow

interface GameRepository {
    fun observeCurrentRound(): Flow<GameRound>
    fun observeRecentResults(): Flow<List<GameResult>>
    suspend fun placeBet(roundId: String, segmentIndices: List<Int>, amount: Double): Result<Unit>
    suspend fun fetchCurrentRound(): Result<GameRound>
}
