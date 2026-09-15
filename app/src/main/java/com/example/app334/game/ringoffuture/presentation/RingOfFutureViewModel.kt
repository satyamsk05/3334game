package com.example.app334.game.ringoffuture.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.game.ringoffuture.wheel.WheelGeometry
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

class RingOfFutureViewModel : ViewModel() {

    private val _uiState = MutableStateFlow(RingOfFutureUiState())
    val uiState: StateFlow<RingOfFutureUiState> = _uiState.asStateFlow()

    fun selectChip(amount: Double) {
        _uiState.update { it.copy(selectedChipAmount = amount) }
    }

    fun triggerSpinToSegment(winningIndex: Int) {
        val targetRotation = WheelGeometry.calculateTargetRotation(winningIndex, fullRotations = 5)
        _uiState.update {
            it.copy(
                gamePhase = GamePhase.SPINNING,
                targetWheelRotation = targetRotation
            )
        }
    }

    fun dismissError() {
        _uiState.update { it.copy(errorMessage = null) }
    }
}
