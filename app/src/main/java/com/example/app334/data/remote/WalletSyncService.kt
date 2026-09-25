package com.example.app334.data.remote

import android.util.Log
import com.example.app334.core.config.ClientConfig
import com.example.app334.core.session.SessionManager
import com.example.app334.game.ringoffuture.backend.WalletLedger
import kotlinx.coroutines.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Live Wallet Synchronization Service.
 * Periodically and on-demand synchronizes player integer paise balances
 * (depositPaise, winningPaise, bonusPaise) with the authoritative EC2 backend server.
 * Enforces Invariant Rule 1: ONE Wallet Source of Truth across Home, Profile, Wallet, Add Cash, Withdraw.
 */
object WalletSyncService {

    private const val TAG = "WalletSyncService"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    private var syncJob: Job? = null

    /**
     * Executes an immediate asynchronous balance fetch and updates [WalletLedger].
     */
    suspend fun syncBalance(userId: String? = null): Boolean = withContext(Dispatchers.IO) {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return@withContext false

        val targetUserId = userId
            ?: SessionManager.currentUserId()
            ?: WalletLedger.userProfile.value.userId

        if (targetUserId.isBlank()) return@withContext false

        try {
            val url = "${ClientConfig.API_BASE_URL}/wallet/balance?userId=${targetUserId}"
            val requestBuilder = Request.Builder().url(url).get()

            val token = SessionManager.authToken()
            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = httpClient.newCall(requestBuilder.build()).execute()
            if (!response.isSuccessful) {
                Log.w(TAG, "Balance sync returned HTTP ${response.code}")
                return@withContext false
            }

            val body = response.body?.string() ?: return@withContext false
            val json = JSONObject(body)
            if (!json.optBoolean("success", false)) return@withContext false

            val data = json.optJSONObject("data") ?: return@withContext false
            val dep = data.optLong("depositPaise", 0L)
            val win = data.optLong("winningPaise", 0L)
            val bon = data.optLong("bonusPaise", 0L)

            withContext(Dispatchers.Main) {
                WalletLedger.syncBalance(dep, win, bon)
            }
            Log.d(TAG, "Wallet synced live from server: dep=₹${dep/100.0}, win=₹${win/100.0}, bon=₹${bon/100.0}")
            
            // Also fetch transactions
            fetchTransactions(targetUserId)
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to sync wallet with server: ${e.message}")
            return@withContext false
        }
    }

    /**
     * Fetches user's transaction history from the backend server.
     */
    suspend fun fetchTransactions(userId: String? = null): List<com.example.app334.game.ringoffuture.backend.WalletTransaction> = withContext(Dispatchers.IO) {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return@withContext emptyList()

        val targetUserId = userId
            ?: SessionManager.currentUserId()
            ?: WalletLedger.userProfile.value.userId

        if (targetUserId.isBlank()) return@withContext emptyList()

        try {
            val url = "${ClientConfig.API_BASE_URL}/wallet/transactions?userId=${targetUserId}"
            val requestBuilder = Request.Builder().url(url).get()

            val token = SessionManager.authToken()
            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = httpClient.newCall(requestBuilder.build()).execute()
            if (!response.isSuccessful) {
                Log.w(TAG, "Transactions fetch returned HTTP ${response.code}")
                return@withContext emptyList()
            }

            val body = response.body?.string() ?: return@withContext emptyList()
            val json = JSONObject(body)
            if (!json.optBoolean("success", false)) return@withContext emptyList()

            val dataArray = json.optJSONArray("data") ?: return@withContext emptyList()
            val list = mutableListOf<com.example.app334.game.ringoffuture.backend.WalletTransaction>()

            for (i in 0 until dataArray.length()) {
                val item = dataArray.getJSONObject(i)
                val typeStr = item.optString("type", "DEPOSIT").uppercase()
                val type = when {
                    typeStr.contains("DEP") -> com.example.app334.game.ringoffuture.backend.TransactionType.DEPOSIT
                    typeStr.contains("WITHDRAW") -> com.example.app334.game.ringoffuture.backend.TransactionType.WITHDRAWAL
                    typeStr.contains("BET") || typeStr.contains("DEBIT") -> com.example.app334.game.ringoffuture.backend.TransactionType.BET_PLACED
                    typeStr.contains("WIN") || typeStr.contains("PAYOUT") || typeStr.contains("CREDIT") -> com.example.app334.game.ringoffuture.backend.TransactionType.WIN_PAYOUT
                    typeStr.contains("REFUND") -> com.example.app334.game.ringoffuture.backend.TransactionType.BET_REFUND
                    else -> com.example.app334.game.ringoffuture.backend.TransactionType.DEPOSIT
                }

                val statusStr = item.optString("status", "SUCCESS").uppercase()
                val status = when {
                    statusStr == "SUCCESS" || statusStr == "COMPLETED" -> com.example.app334.game.ringoffuture.backend.TransactionStatus.SUCCESS
                    statusStr == "PENDING" -> com.example.app334.game.ringoffuture.backend.TransactionStatus.PENDING
                    statusStr == "PROCESSING" -> com.example.app334.game.ringoffuture.backend.TransactionStatus.PROCESSING
                    else -> com.example.app334.game.ringoffuture.backend.TransactionStatus.REJECTED
                }

                val tx = com.example.app334.game.ringoffuture.backend.WalletTransaction(
                    id = item.optString("id", "TX-$i"),
                    userId = item.optString("userId", targetUserId),
                    type = type,
                    amountPaise = item.optLong("amountPaise", 0L),
                    balanceAfterPaise = item.optLong("balanceAfterPaise", 0L),
                    status = status,
                    referenceId = item.optString("referenceId", item.optString("id", "")),
                    description = item.optString("description", "$typeStr Transaction"),
                    timestamp = item.optLong("timestamp", System.currentTimeMillis())
                )
                list.add(tx)
            }

            withContext(Dispatchers.Main) {
                WalletLedger.setTransactions(list)
            }
            return@withContext list
        } catch (e: Exception) {
            Log.e(TAG, "Failed to fetch transactions from server: ${e.message}")
            return@withContext emptyList()
        }
    }

    /**
     * Starts continuous background polling every [intervalMs] milliseconds
     * while the app is active in the foreground.
     */
    fun startLiveSync(scope: CoroutineScope, intervalMs: Long = 4000L) {
        stopLiveSync()
        syncJob = scope.launch(Dispatchers.IO) {
            while (isActive) {
                try {
                    syncBalance()
                } catch (e: Exception) {
                    Log.e(TAG, "Error during live sync interval", e)
                }
                delay(intervalMs)
            }
        }
    }

    /**
     * Sends withdrawal request to backend server.
     */
    suspend fun requestWithdrawal(amountRupees: Double, upiId: String): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        val targetUserId = SessionManager.currentUserId()
            ?: WalletLedger.userProfile.value.userId

        if (targetUserId.isBlank()) return@withContext Pair(false, "User not authenticated")

        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) {
            // Local fallback
            val paise = WalletLedger.rupeesToPaise(amountRupees)
            return@withContext WalletLedger.requestWithdrawal(paise, upiId)
        }

        try {
            val url = "${ClientConfig.API_BASE_URL}/payments/withdraw/request"
            val payload = JSONObject().apply {
                put("amountRupees", amountRupees)
                put("upiId", upiId)
            }
            val requestBody = payload.toString().toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())

            val requestBuilder = Request.Builder()
                .url(url)
                .post(requestBody)

            val token = SessionManager.authToken()
            if (!token.isNullOrBlank()) {
                requestBuilder.header("Authorization", "Bearer $token")
            }

            val response = httpClient.newCall(requestBuilder.build()).execute()
            val body = response.body?.string() ?: ""
            val json = if (body.isNotBlank()) JSONObject(body) else JSONObject()

            val success = json.optBoolean("success", response.isSuccessful)
            val message = json.optString("message", if (success) "Withdrawal request submitted" else "Request failed")

            if (success) {
                val dataObj = json.optJSONObject("data")
                val wdId = dataObj?.optString("withdrawalId")
                val paise = WalletLedger.rupeesToPaise(amountRupees)
                withContext(Dispatchers.Main) {
                    WalletLedger.requestWithdrawal(paise, upiId, wdId)
                }
                // Refresh balance from server to stay perfectly in sync
                syncBalance(targetUserId)
                return@withContext Pair(true, message)
            } else {
                return@withContext Pair(false, message)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Withdrawal network request error: ${e.message}")
            // Fallback to local ledger so user isn't hard-blocked if offline demo
            val paise = WalletLedger.rupeesToPaise(amountRupees)
            val localRes = withContext(Dispatchers.Main) {
                WalletLedger.requestWithdrawal(paise, upiId)
            }
            return@withContext localRes
        }
    }

    /**
     * Stops the periodic sync job (e.g. when app moves to background).
     */
    fun stopLiveSync() {
        syncJob?.cancel()
        syncJob = null
    }
}
