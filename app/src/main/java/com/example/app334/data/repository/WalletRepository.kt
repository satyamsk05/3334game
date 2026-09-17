package com.example.app334.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class WalletState(
    val depositPaise: Long = 0,
    val winningPaise: Long = 0,
    val bonusPaise: Long = 0,
    val totalPaise: Long = 0
)

object WalletRepository {
    private val _walletState = MutableStateFlow(WalletState())
    val walletState: StateFlow<WalletState> = _walletState.asStateFlow()

    fun updateBalance(depositPaise: Long, winningPaise: Long, bonusPaise: Long) {
        val total = depositPaise + winningPaise + bonusPaise
        _walletState.value = WalletState(
            depositPaise = depositPaise,
            winningPaise = winningPaise,
            bonusPaise = bonusPaise,
            totalPaise = total
        )
    }

    fun addDeposit(amountPaise: Long) {
        val cur = _walletState.value
        val newDep = cur.depositPaise + amountPaise
        updateBalance(newDep, cur.winningPaise, cur.bonusPaise)
    }

    fun requestWithdrawal(amountPaise: Long): Boolean {
        val cur = _walletState.value
        if (amountPaise > cur.winningPaise) return false
        val newWin = cur.winningPaise - amountPaise
        updateBalance(cur.depositPaise, newWin, cur.bonusPaise)
        return true
    }
}
