package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.RingOfFutureGameState
import kotlinx.coroutines.flow.StateFlow

object GameBackendRepository {

    val gameState: StateFlow<RingOfFutureGameState> get() = GameTimerEngine.gameState

    fun initEngine() {
        GameTimerEngine.startEngine()
        com.example.app334.data.remote.RemoteApiClient.connectWebSocket()
    }

    fun stopEngine() {
        GameTimerEngine.stopEngine()
        com.example.app334.data.remote.RemoteApiClient.disconnectWebSocket()
    }

    fun getWalletBalance(): WalletBalance = WalletLedger.walletBalance.value

    fun getWalletTransactions(): List<WalletTransaction> = WalletLedger.transactions.value

    fun placeBet(colorType: ColorType, amountRupees: Double): Boolean {
        val amountPaise = WalletLedger.rupeesToPaise(amountRupees)
        return GameTimerEngine.placeBet(colorType, amountPaise)
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

    fun submitDepositRequest(amountRupees: Double, utr: String): Boolean {
        val paise = WalletLedger.rupeesToPaise(amountRupees)
        WalletLedger.addDemoCash(paise, utr)
        return true
    }

    fun submitWithdrawalRequest(amountRupees: Double, upiId: String): Pair<Boolean, String> {
        val paise = WalletLedger.rupeesToPaise(amountRupees)
        return WalletLedger.requestWithdrawal(paise, upiId)
    }
}
