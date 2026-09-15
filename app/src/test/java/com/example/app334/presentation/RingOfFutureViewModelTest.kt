package com.example.app334.presentation

import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.game.ringoffuture.presentation.RingOfFutureViewModel
import com.example.app334.game.ringoffuture.wheel.WheelGeometry
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test

class RingOfFutureViewModelTest {

    private lateinit var viewModel: RingOfFutureViewModel

    @Before
    fun setup() {
        viewModel = RingOfFutureViewModel()
    }

    @Test
    fun testSelectChipUpdatesState() {
        viewModel.selectChip(50.0)
        assertEquals(50.0, viewModel.uiState.value.selectedChipAmount, 0.001)
    }

    @Test
    fun testTriggerSpinCalculatesTargetRotation() {
        val winningSegment = 10
        viewModel.triggerSpinToSegment(winningSegment)

        val expectedRotation = WheelGeometry.calculateTargetRotation(winningSegment, fullRotations = 5)
        assertEquals(GamePhase.SPINNING, viewModel.uiState.value.gamePhase)
        assertEquals(expectedRotation, viewModel.uiState.value.targetWheelRotation, 0.001f)
    }
}
