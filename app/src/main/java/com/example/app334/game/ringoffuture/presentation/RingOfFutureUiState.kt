package com.example.app334.game.ringoffuture.presentation

import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.domain.model.GameResult
import com.example.app334.domain.model.WalletState

data class RingOfFutureUiState(
    val currentRoundId: String = "",
    val gamePhase: GamePhase = GamePhase.BETTING,
    val countdownSeconds: Int = 15,
    val isConnected: Boolean = true,
    val targetWheelRotation: Float = 0f,
    val wallet: WalletState = WalletState(mainBalance = 1000.0, winningBalance = 0.0, bonusBalance = 0.0),
    val selectedChipAmount: Double = 10.0,
    val recentResults: List<GameResult> = emptyList(),
    val errorMessage: String? = null
)
