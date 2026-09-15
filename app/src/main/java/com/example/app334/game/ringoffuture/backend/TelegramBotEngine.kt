package com.example.app334.game.ringoffuture.backend

import android.util.Log

data class TelegramMessageLog(
    val id: String,
    val title: String,
    val body: String,
    val timestamp: Long = System.currentTimeMillis()
)

/**
 * Local in-memory log tracker for demo events.
 * Network calls stubbed out to avoid leaking tokens or making unauthenticated client HTTP requests.
 */
object TelegramBotEngine {

    private const val TAG = "TelegramBotEngine"
    private val alertLogs = mutableListOf<TelegramMessageLog>()

    var isEnabled: Boolean = true

    fun getLogs(): List<TelegramMessageLog> = alertLogs.toList()

    fun notifyDepositSubmitted(userName: String, userId: String, amount: Double, utr: String) {
        val title = "💳 NEW DEMO DEPOSIT SUBMITTED"
        val body = "User $userName ($userId) deposited ₹$amount (UTR: $utr)"
        logEvent(title, body)
    }

    fun notifyWithdrawalRequested(userName: String, userId: String, amount: Double, upiId: String, winningBalance: Double) {
        val title = "💸 NEW DEMO WITHDRAWAL REQUESTED"
        val body = "User $userName ($userId) requested ₹$amount to UPI: $upiId"
        logEvent(title, body)
    }

    fun notifyJackpotWin(userName: String, roundNumber: Long, amountWon: Double, multiplier: Float) {
        val title = "🎉 JACKPOT WIN ALERT"
        val body = "User $userName won ₹$amountWon on round #$roundNumber (${multiplier}x GREEN)"
        logEvent(title, body)
    }

    fun notifyAdminAction(adminName: String, action: String, details: String) {
        val title = "🛡️ ADMIN ACTION LOGGED"
        val body = "Admin $adminName performed $action ($details)"
        logEvent(title, body)
    }

    private fun logEvent(title: String, body: String) {
        val logItem = TelegramMessageLog(
            id = "LOG-${System.currentTimeMillis().toString().takeLast(6)}",
            title = title,
            body = body
        )
        alertLogs.add(0, logItem)
        Log.d(TAG, "[$title] $body")
    }
}
