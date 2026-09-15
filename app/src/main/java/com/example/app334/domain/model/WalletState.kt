package com.example.app334.domain.model

data class WalletState(
    val mainBalance: Double,
    val winningBalance: Double,
    val bonusBalance: Double,
    val totalBalance: Double = mainBalance + winningBalance + bonusBalance
)
