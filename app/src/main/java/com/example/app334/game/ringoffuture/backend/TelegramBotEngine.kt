package com.example.app334.game.ringoffuture.backend

import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

data class TelegramMessageLog(
    val id: String,
    val title: String,
    val body: String,
    val timestamp: Long = System.currentTimeMillis()
)

object TelegramBotEngine {

    private const val TAG = "TelegramBotEngine"
    private val alertLogs = mutableListOf<TelegramMessageLog>()
    private val scope = CoroutineScope(Dispatchers.IO)

    // Configurable Telegram Bot Token & Chat ID
    var botToken: String = "7891234567:AAFx_SimulatedTelegramBotTokenForAdmin"
    var chatId: String = "-100192837465"
    var isEnabled: Boolean = true

    fun getLogs(): List<TelegramMessageLog> = alertLogs.toList()

    fun notifyDepositSubmitted(userName: String, userId: String, amount: Double, utr: String) {
        val title = "💳 NEW DEPOSIT SUBMITTED!"
        val body = """
            💳 *NEW DEPOSIT SUBMITTED*
            👤 *User:* $userName ($userId)
            💵 *Amount:* ₹$amount
            🏷️ *UTR/TxID:* $utr
            ⏰ *Time:* ${formatTime()}
            ⚡ *Status:* ⏳ PENDING APPROVAL
        """.trimIndent()

        sendNotification(title, body)
    }

    fun notifyWithdrawalRequested(userName: String, userId: String, amount: Double, upiId: String, winningBalance: Double) {
        val title = "💸 WITHDRAWAL REQUESTED!"
        val body = """
            💸 *WITHDRAWAL REQUESTED*
            👤 *User:* $userName ($userId)
            💵 *Amount:* ₹$amount
            📲 *UPI ID:* $upiId
            💰 *Remaining Winnings:* ₹$winningBalance
            ⏰ *Time:* ${formatTime()}
            ⚡ *Status:* ⏳ PENDING (Action Required in Admin Panel)
        """.trimIndent()

        sendNotification(title, body)
    }

    fun notifyJackpotWin(userName: String, roundNumber: Long, amountWon: Double, multiplier: Float) {
        val title = "🎉 JACKPOT WIN ALERT!"
        val body = """
            🎉 *JACKPOT WIN ALERT!*
            👤 *User:* $userName
            🎲 *Round:* #$roundNumber
            🔥 *Multiplier:* ${multiplier}x (GREEN)
            💰 *Payout:* ₹$amountWon
            ⏰ *Time:* ${formatTime()}
        """.trimIndent()

        sendNotification(title, body)
    }

    fun notifyAdminAction(adminName: String, action: String, details: String) {
        val title = "🛡️ ADMIN ACTION LOGGED"
        val body = """
            🛡️ *ADMIN ACTION PERFORMED*
            👤 *Admin:* $adminName
            ⚡ *Action:* $action
            📝 *Details:* $details
            ⏰ *Time:* ${formatTime()}
        """.trimIndent()

        sendNotification(title, body)
    }

    private fun sendNotification(title: String, body: String) {
        val logItem = TelegramMessageLog(
            id = "TG-${System.currentTimeMillis().toString().takeLast(6)}",
            title = title,
            body = body
        )
        alertLogs.add(0, logItem)

        if (isEnabled && botToken.isNotEmpty() && chatId.isNotEmpty()) {
            Log.d(TAG, "Queuing Telegram Alert to Chat [$chatId]:\n$body")
            
            // Dispatch live HTTP POST call to Telegram Bot API asynchronously
            scope.launch {
                try {
                    val encodedText = URLEncoder.encode(body, "UTF-8")
                    val urlString = "https://api.telegram.org/bot$botToken/sendMessage?chat_id=$chatId&text=$encodedText&parse_mode=Markdown"
                    val url = URL(urlString)
                    val conn = url.openConnection() as HttpURLConnection
                    conn.requestMethod = "GET"
                    conn.connectTimeout = 5000
                    conn.readTimeout = 5000
                    val responseCode = conn.responseCode
                    Log.d(TAG, "Telegram API Response Code: $responseCode")
                    conn.disconnect()
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to send live Telegram alert: ${e.message}")
                }
            }
        }
    }

    private fun formatTime(): String {
        val sdf = java.text.SimpleDateFormat("dd MMM yyyy, HH:mm:ss", java.util.Locale.getDefault())
        return sdf.format(java.util.Date())
    }
}
