package com.game3334.play.domain.model

data class WalletState(
    val mainBalance: Double,
    val winningBalance: Double,
    val bonusBalance: Double,
    val totalBalance: Double = mainBalance + winningBalance + bonusBalance
)
