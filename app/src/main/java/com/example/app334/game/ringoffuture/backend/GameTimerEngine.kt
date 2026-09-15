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

    fun startEngine() {
        if (timerJob?.isActive == true) return

        timerJob = scope.launch {
            while (isActive) {
                runBettingPhase()
                runLockedPhase()
                runSpinningPhase()
                runResultPhase()
            }
        }
    }

    private suspend fun runBettingPhase() {
        _gameState.update {
            it.copy(
                phase = GamePhase.BETTING,
                secondsRemaining = WheelConfig.BETTING_TIME_SECONDS,
                lastWinAmount = 0.0
            )
        }

        for (sec in WheelConfig.BETTING_TIME_SECONDS downTo 1) {
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

        // Calculate winning index via Provably Fair RNG or Admin Override
        val winningIndex = RngEngine.generateWinningSegmentIndex(
            roundNumber = _gameState.value.roundNumber,
            serverSeed = "SEED_SERVER_${System.currentTimeMillis()}",
            adminOverrideIndex = AdminEngine.manualOverrideSegmentIndex
        )

        // Clear manual override after use if set
        AdminEngine.clearManualOverride()

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
        val betOnWinningColor = when (winningSegment.colorType) {
            ColorType.GREEN -> userBets.greenBet
            ColorType.RED -> userBets.redBet
            ColorType.PURPLE -> userBets.purpleBet
            ColorType.GREY -> userBets.greyBet
        }

        val winAmount = betOnWinningColor * winningSegment.multiplier

        if (winAmount > 0) {
            WalletLedger.creditWin(winAmount, winningSegment.multiplier)
            if (winningSegment.colorType == ColorType.GREEN) {
                TelegramBotEngine.notifyJackpotWin("Satyam Kumar", currentState.roundNumber, winAmount, winningSegment.multiplier)
            }
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
                lastWinAmount = winAmount,
                history = updatedHistory
            )
        }

        delay((WheelConfig.RESULT_SHOW_SECONDS * 1000L).toLong())

        // Prepare next round
        _gameState.update {
            it.copy(
                roundNumber = it.roundNumber + 1,
                userBets = UserBets()
            )
        }
    }

    fun placeBet(colorType: ColorType, amount: Double): Boolean {
        if (_gameState.value.phase != GamePhase.BETTING) return false

        val success = WalletLedger.placeBet(amount)
        if (!success) return false

        _gameState.update { current ->
            val oldBets = current.userBets
            val newBets = when (colorType) {
                ColorType.GREEN -> oldBets.copy(greenBet = oldBets.greenBet + amount)
                ColorType.RED -> oldBets.copy(redBet = oldBets.redBet + amount)
                ColorType.PURPLE -> oldBets.copy(purpleBet = oldBets.purpleBet + amount)
                ColorType.GREY -> oldBets.copy(greyBet = oldBets.greyBet + amount)
            }
            current.copy(userBets = newBets)
        }
        return true
    }

    fun clearBets() {
        if (_gameState.value.phase != GamePhase.BETTING) return
        val currentBetTotal = _gameState.value.userBets.totalBet
        if (currentBetTotal > 0) {
            // Refund total bet
            WalletLedger.creditWin(currentBetTotal, 1.0f)
            _gameState.update { it.copy(userBets = UserBets()) }
        }
    }

    fun doubleBets(): Boolean {
        if (_gameState.value.phase != GamePhase.BETTING) return false
        val currentBetTotal = _gameState.value.userBets.totalBet
        if (currentBetTotal <= 0) return false

        val success = WalletLedger.placeBet(currentBetTotal)
        if (!success) return false

        _gameState.update { it.copy(userBets = it.userBets.doubleBets()) }
        return true
    }

    fun setSelectedChip(chipValue: Int) {
        _gameState.update { it.copy(selectedChip = chipValue) }
    }
}
