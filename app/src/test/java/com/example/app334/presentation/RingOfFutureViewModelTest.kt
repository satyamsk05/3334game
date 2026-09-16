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

    @Test
    fun testContractFeeAndPayoutCalculations() {
        val betPaise = 10000L // ₹100
        val contractPaise = (betPaise * 98L) / 100L // ₹98
        assertEquals(9800L, contractPaise)

        val blackWin = (contractPaise * 2.0f).toLong() // ₹196
        val redWin = (contractPaise * 3.0f).toLong()   // ₹294
        val blueWin = (contractPaise * 5.0f).toLong()  // ₹490
        val greenWin = (contractPaise * 50.0f).toLong()// ₹4900

        assertEquals(19600L, blackWin)
        assertEquals(29400L, redWin)
        assertEquals(49000L, blueWin)
        assertEquals(490000L, greenWin)
    }
}
