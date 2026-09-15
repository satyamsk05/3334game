package com.example.app334.domain.repository

import com.example.app334.domain.model.WalletState
import com.example.app334.game.ringoffuture.backend.WalletTransaction
import kotlinx.coroutines.flow.Flow

interface AccountRepository {
    fun observeWalletState(): Flow<WalletState>
    fun observeTransactionHistory(): Flow<List<WalletTransaction>>
    suspend fun requestDeposit(amount: Double, paymentMethod: String): Result<WalletTransaction>
    suspend fun requestWithdrawal(amount: Double, upiId: String): Result<WalletTransaction>
}
