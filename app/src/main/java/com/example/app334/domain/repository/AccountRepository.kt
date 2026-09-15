package com.example.app334.domain.repository

import com.example.app334.domain.model.WalletState
import com.example.app334.domain.model.Transaction
import kotlinx.coroutines.flow.Flow

interface AccountRepository {
    fun observeWalletState(): Flow<WalletState>
    fun observeTransactionHistory(): Flow<List<Transaction>>
    suspend fun requestDeposit(amount: Double, paymentMethod: String): Result<Transaction>
    suspend fun requestWithdrawal(amount: Double, upiId: String): Result<Transaction>
}
