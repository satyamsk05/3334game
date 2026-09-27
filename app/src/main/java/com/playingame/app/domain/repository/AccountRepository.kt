package com.playingame.app.domain.repository

import com.playingame.app.domain.model.WalletState
import com.playingame.app.game.ringoffuture.backend.WalletTransaction
import kotlinx.coroutines.flow.Flow

interface AccountRepository {
    fun observeWalletState(): Flow<WalletState>
    fun observeTransactionHistory(): Flow<List<WalletTransaction>>
    suspend fun requestDeposit(amount: Double, paymentMethod: String): Result<WalletTransaction>
    suspend fun requestWithdrawal(amount: Double, upiId: String): Result<WalletTransaction>
}
