package com.game3334.play.domain.repository

import com.game3334.play.domain.model.WalletState
import com.game3334.play.game.ringoffuture.backend.WalletTransaction
import kotlinx.coroutines.flow.Flow

interface AccountRepository {
    fun observeWalletState(): Flow<WalletState>
    fun observeTransactionHistory(): Flow<List<WalletTransaction>>
    suspend fun requestDeposit(amount: Double, paymentMethod: String): Result<WalletTransaction>
    suspend fun requestWithdrawal(amount: Double, upiId: String): Result<WalletTransaction>
}
