package com.example.app334.data.repository

import com.example.app334.game.ringoffuture.backend.WalletBalance
import com.example.app334.game.ringoffuture.backend.WalletLedger
import kotlinx.coroutines.flow.StateFlow

/**
 * Bridge delegating directly to the single source of truth: [WalletLedger].
 * Enforces Invariant Rule 1: ONE Wallet Source of Truth.
 */
object WalletRepository {
    val walletState: StateFlow<WalletBalance> = WalletLedger.walletBalance

    fun addDeposit(amountPaise: Long) {
        WalletLedger.addDepositCash(amountPaise)
    }

    fun requestWithdrawal(amountPaise: Long, upiId: String = "user@upi"): Boolean {
        return WalletLedger.requestWithdrawal(amountPaise, upiId).first
    }
}
