package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update

object GameTimerEngine {

    private val _gameState = MutableStateFlow(RingOfFutureGameState())
    val gameState: StateFlow<RingOfFutureGameState> = _gameState.asStateFlow()

    private var timerJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    // Tracks bucket debits per placed bet in current round
    private var activeBetDebits = mutableListOf<BetDebitBreakdown>()

    @Synchronized
    fun startEngine() {
        if (timerJob?.isActive == true) return

        timerJob = scope.launch {
            while (isActive) {
                runBettingPhase()
                if (!isActive) break
                runLockedPhase()
                if (!isActive) break
                runSpinningPhase()
                if (!isActive) break
                runResultPhase()
            }
        }
    }

    @Synchronized
    fun stopEngine() {
        // If stopping during BETTING phase, refund open bets back to original buckets
        if (_gameState.value.phase == GamePhase.BETTING) {
            refundAllCurrentBets()
        }
        timerJob?.cancel()
        timerJob = null
    }

    private suspend fun runBettingPhase() {
        activeBetDebits.clear()
        _gameState.update {
            it.copy(
                phase = GamePhase.BETTING,
                secondsRemaining = WheelConfig.BETTING_TIME_SECONDS,
                lastWinAmount = 0.0,
                userBets = UserBets()
            )
        }

        for (sec in WheelConfig.BETTING_TIME_SECONDS downTo 1) {
            if (!scope.isActive) break
            _gameState.update { it.copy(secondsRemaining = sec) }
            delay(1000L)
        }
    }

    private suspend fun runLockedPhase() {
        _gameState.update {
            it.copy(
                phase = GamePhase.LOCKED,
                secondsRemaining = WheelConfig.LOCKED_TIME_SECONDS
            )
        }

        val winningIndex = RngEngine.generateWinningSegmentIndex()
        val winningSegment = RngEngine.getSegment(winningIndex)

        _gameState.update {
            it.copy(
                winningSegmentIndex = winningIndex,
                winningSegment = winningSegment
            )
        }

        delay(WheelConfig.LOCKED_TIME_SECONDS * 1000L)
    }

    private suspend fun runSpinningPhase() {
        _gameState.update {
            it.copy(phase = GamePhase.SPINNING)
        }

        delay((WheelConfig.SPIN_DURATION_SECONDS * 1000L).toLong())
    }

    private suspend fun runResultPhase() {
        val currentState = _gameState.value
        val winningSegment = currentState.winningSegment ?: RngEngine.getSegment(0)

        // Calculate user win payout
        val userBets = currentState.userBets
        val betOnWinningColorRupees = when (winningSegment.colorType) {
            ColorType.GREEN -> userBets.greenBet
            ColorType.RED -> userBets.redBet
            ColorType.PURPLE -> userBets.purpleBet
            ColorType.GREY -> userBets.greyBet
        }

        val winAmountRupees = betOnWinningColorRupees * winningSegment.multiplier
        val winAmountPaise = WalletLedger.rupeesToPaise(winAmountRupees)

        if (winAmountPaise > 0L) {
            WalletLedger.creditWin(winAmountPaise, "${winningSegment.multiplier}x")
        }

        val newHistoryItem = SpinResult(
            roundNumber = currentState.roundNumber,
            segmentIndex = winningSegment.index,
            winningColor = winningSegment.colorType,
            multiplier = winningSegment.multiplier
        )

        val updatedHistory = (listOf(newHistoryItem) + currentState.history).take(10)

        _gameState.update {
            it.copy(
                phase = GamePhase.RESULT_SHOW,
                lastWinAmount = winAmountRupees,
                history = updatedHistory
            )
        }

        delay((WheelConfig.RESULT_SHOW_SECONDS * 1000L).toLong())

        // Clear active debits for completed round
        activeBetDebits.clear()

        // Prepare next round
        _gameState.update {
            it.copy(
                roundNumber = it.roundNumber + 1,
                userBets = UserBets()
            )
        }
    }

    fun placeBet(colorType: ColorType, amountRupees: Double): Boolean {
        if (_gameState.value.phase != GamePhase.BETTING || amountRupees <= 0) return false

        val amountPaise = WalletLedger.rupeesToPaise(amountRupees)
        val debitBreakdown = WalletLedger.placeBet(amountPaise)
        if (!debitBreakdown.success) return false

        activeBetDebits.add(debitBreakdown)

        _gameState.update { current ->
            val oldBets = current.userBets
            val newBets = when (colorType) {
                ColorType.GREEN -> oldBets.copy(greenBet = oldBets.greenBet + amountRupees)
                ColorType.RED -> oldBets.copy(redBet = oldBets.redBet + amountRupees)
                ColorType.PURPLE -> oldBets.copy(purpleBet = oldBets.purpleBet + amountRupees)
                ColorType.GREY -> oldBets.copy(greyBet = oldBets.greyBet + amountRupees)
            }
            current.copy(userBets = newBets)
        }
        return true
    }

    fun clearBets() {
        if (_gameState.value.phase != GamePhase.BETTING) return
        refundAllCurrentBets()
    }

    private fun refundAllCurrentBets() {
        if (activeBetDebits.isEmpty()) return

        var depRefund = 0L
        var winRefund = 0L
        var bonRefund = 0L

        for (debit in activeBetDebits) {
            depRefund += debit.depositDebited
            winRefund += debit.winningDebited
            bonRefund += debit.bonusDebited
        }

        WalletLedger.refundBet(depRefund, winRefund, bonRefund)
        activeBetDebits.clear()

        _gameState.update { it.copy(userBets = UserBets()) }
    }

    fun doubleBets(): Boolean {
        if (_gameState.value.phase != GamePhase.BETTING) return false
        val userBets = _gameState.value.userBets
        if (userBets.totalBet <= 0) return false

        // Attempt doubling each placed bet
        var allSuccess = true
        if (userBets.greenBet > 0) {
            allSuccess = allSuccess && placeBet(ColorType.GREEN, userBets.greenBet)
        }
        if (userBets.redBet > 0) {
            allSuccess = allSuccess && placeBet(ColorType.RED, userBets.redBet)
        }
        if (userBets.purpleBet > 0) {
            allSuccess = allSuccess && placeBet(ColorType.PURPLE, userBets.purpleBet)
        }
        if (userBets.greyBet > 0) {
            allSuccess = allSuccess && placeBet(ColorType.GREY, userBets.greyBet)
        }

        return allSuccess
    }

    fun setSelectedChip(chipValue: Int) {
        _gameState.update { it.copy(selectedChip = chipValue) }
    }
}
