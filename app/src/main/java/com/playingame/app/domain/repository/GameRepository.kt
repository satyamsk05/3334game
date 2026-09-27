package com.playingame.app.domain.repository

import com.playingame.app.domain.model.GameRound
import com.playingame.app.domain.model.GameResult
import kotlinx.coroutines.flow.Flow

interface GameRepository {
    fun observeCurrentRound(): Flow<GameRound>
    fun observeRecentResults(): Flow<List<GameResult>>
    suspend fun placeBet(roundId: String, segmentIndices: List<Int>, amount: Double): Result<Unit>
    suspend fun fetchCurrentRound(): Result<GameRound>
}
