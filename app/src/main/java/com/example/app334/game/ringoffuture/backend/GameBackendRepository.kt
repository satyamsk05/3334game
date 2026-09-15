package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.RingOfFutureGameState
import kotlinx.coroutines.flow.StateFlow

object GameBackendRepository {

    val gameState: StateFlow<RingOfFutureGameState> get() = GameTimerEngine.gameState

    fun initEngine() {
        GameTimerEngine.startEngine()
    }

    fun getWalletBalance(): WalletBalance = WalletLedger.getBalance()

    fun getWalletTransactions(): List<WalletTransaction> = WalletLedger.getTransactions()

    fun placeBet(colorType: ColorType, amount: Double): Boolean {
        return GameTimerEngine.placeBet(colorType, amount)
    }

    fun clearBets() {
        GameTimerEngine.clearBets()
    }

    fun doubleBets(): Boolean {
        return GameTimerEngine.doubleBets()
    }

    fun setSelectedChip(chip: Int) {
        GameTimerEngine.setSelectedChip(chip)
    }

    fun submitDepositRequest(amount: Double, utr: String): Boolean {
        val tx = WalletLedger.processDepositRequest(amount, utr)
        TelegramBotEngine.notifyDepositSubmitted("Satyam Kumar", "USR-304", amount, tx.referenceId)
        return true
    }

    fun submitWithdrawalRequest(amount: Double, upiId: String): Pair<Boolean, String> {
        val riskCheck = RiskEngine.validateWithdrawalEligibility("USR-304", amount, 500.0, 3200.0)
        if (!riskCheck.first) {
            return Pair(false, riskCheck.second)
        }

        val result = WalletLedger.requestWithdrawal(amount, upiId)
        if (result.first) {
            val balance = WalletLedger.getBalance()
            TelegramBotEngine.notifyWithdrawalRequested("Satyam Kumar", "USR-304", amount, upiId, balance.winningBalance)
        }
        return result
    }

    fun getTelegramLogs() = TelegramBotEngine.getLogs()
}
