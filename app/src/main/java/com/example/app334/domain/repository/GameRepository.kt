package com.example.app334.domain.repository

import com.example.app334.domain.model.GameRound
import com.example.app334.domain.model.GameResult
import kotlinx.coroutines.flow.Flow

interface GameRepository {
    fun observeCurrentRound(): Flow<GameRound>
    fun observeRecentResults(): Flow<List<GameResult>>
    suspend fun placeBet(roundId: String, segmentIndices: List<Int>, amount: Double): Result<Unit>
    suspend fun fetchCurrentRound(): Result<GameRound>
}
