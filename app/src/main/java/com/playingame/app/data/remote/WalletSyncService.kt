package com.playingame.app.data.remote

import android.util.Log
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.wallet.*
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
    private val httpClient get() = RemoteApiClient.client

    private var syncJob: Job? = null

    /**
     * Executes an immediate asynchronous balance fetch and updates [WalletLedger].
     */
    suspend fun syncBalance(userId: String? = null): Boolean = withContext(Dispatchers.IO) {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return@withContext false

        // Do not perform remote wallet sync if user is not authenticated yet
        if (!com.playingame.app.data.repository.AuthRepository.currentSession.value.isLoggedIn && userId.isNullOrBlank()) {
            return@withContext false
        }

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
            val dep = if (data.has("depositChips")) data.optLong("depositChips", 0L) else data.optLong("depositPaise", 0L)
            val win = if (data.has("winningChips")) data.optLong("winningChips", 0L) else data.optLong("winningPaise", 0L)
            val bon = if (data.has("bonusChips")) data.optLong("bonusChips", 0L) else data.optLong("bonusPaise", 0L)

            withContext(Dispatchers.Main) {
                WalletLedger.syncBalance(dep, win, bon)
            }
            // Fix (Issue 4.2): Avoid printing exact user balance details in production logcat
            if (com.playingame.app.BuildConfig.DEBUG) {
                Log.d(TAG, "Wallet synced live from server: dep=${dep/100.0}, win=${win/100.0}, bon=${bon/100.0}")
            }
            
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
    suspend fun fetchTransactions(userId: String? = null): List<WalletTransaction> = withContext(Dispatchers.IO) {
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
            val list = mutableListOf<WalletTransaction>()

            for (i in 0 until dataArray.length()) {
                val item = dataArray.getJSONObject(i)
                val rawTypeStr = item.optString("type", "").uppercase()
                val rawTxnType = item.optString("transaction_type", "").uppercase()
                val combinedType = "$rawTypeStr $rawTxnType"
                val rawDesc = item.optString("description", "")
                val descUpper = rawDesc.uppercase()

                val type = when {
                    combinedType.contains("REFUND") || descUpper.contains("REFUND") || combinedType.contains("EQUITY") -> 
                        TransactionType.BET_REFUND
                    combinedType.contains("WIN") || combinedType.contains("PAYOUT") -> 
                        TransactionType.WIN_PAYOUT
                    combinedType.contains("DEP") -> 
                        TransactionType.DEPOSIT
                    combinedType.contains("WITHDRAW") -> 
                        TransactionType.WITHDRAWAL
                    combinedType.contains("BET") || combinedType.contains("DEBIT") -> 
                        TransactionType.BET_PLACED
                    combinedType.contains("CREDIT") -> 
                        TransactionType.WIN_PAYOUT
                    else -> 
                        TransactionType.DEPOSIT
                }

                val normalizedDesc = when {
                    rawDesc.isNotBlank() -> rawDesc
                    type == TransactionType.DEPOSIT -> "Instant UPI Deposit"
                    type == TransactionType.WITHDRAWAL -> "UPI Bank Withdrawal"
                    type == TransactionType.BET_REFUND -> "Bet Refund Returned"
                    type == TransactionType.WIN_PAYOUT -> "Game Win Payout"
                    type == TransactionType.BET_PLACED -> "Game Entry / Bet"
                    else -> "Wallet Transaction"
                }

                val statusStr = item.optString("status", "SUCCESS").uppercase()
                val status = when {
                    statusStr == "SUCCESS" || statusStr == "COMPLETED" || statusStr == "APPROVED" -> TransactionStatus.SUCCESS
                    statusStr == "PENDING" -> TransactionStatus.PENDING
                    statusStr == "PROCESSING" -> TransactionStatus.PROCESSING
                    else -> TransactionStatus.REJECTED
                }

                val amount = if (item.has("amountChips")) item.optLong("amountChips", 0L)
                             else item.optLong("amountPaise", item.optLong("amount", 0L))
                val balanceAfter = if (item.has("balanceAfterChips")) item.optLong("balanceAfterChips", 0L)
                                   else item.optLong("balanceAfterPaise", item.optLong("balance_after", 0L))

                val tx = WalletTransaction(
                    id = item.optString("id", "TX-$i"),
                    userId = item.optString("userId", targetUserId),
                    type = type,
                    amountChips = amount,
                    balanceAfterChips = balanceAfter,
                    status = status,
                    referenceId = item.optString("referenceId", item.optString("reference_id", item.optString("id", ""))),
                    description = normalizedDesc,
                    timestamp = item.optLong("timestamp", item.optLong("created_at_epoch", System.currentTimeMillis()))
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
    fun startLiveSync(scope: CoroutineScope, intervalMs: Long = 15000L) {
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

    /**
     * Fetches permanently bound bank & UPI account details.
     */
    suspend fun getBankDetails(): JSONObject? = withContext(Dispatchers.IO) {
        val token = SessionManager.authToken() ?: return@withContext null
        try {
            val url = "${ClientConfig.API_BASE_URL}/wallet/bank-details"
            val req = Request.Builder().url(url).header("Authorization", "Bearer $token").get().build()
            val resp = httpClient.newCall(req).execute()
            val body = resp.body?.string() ?: return@withContext null
            val json = JSONObject(body)
            if (json.optBoolean("success", false)) {
                return@withContext json.optJSONObject("data")
            }
        } catch (_: Exception) {}
        null
    }

    /**
     * Permanently binds user withdrawal bank/UPI details in the backend database.
     * Once bound, it is locked and cannot be edited by the user.
     */
    suspend fun bindBankAccount(
        upiId: String,
        accountNumber: String = "",
        ifsc: String = "",
        holderName: String = "",
        bankName: String = ""
    ): Pair<Boolean, String> = withContext(Dispatchers.IO) {
        val token = SessionManager.authToken() ?: return@withContext Pair(false, "User not authenticated")
        try {
            val url = "${ClientConfig.API_BASE_URL}/wallet/bind-bank"
            val payload = JSONObject().apply {
                put("upiId", upiId)
                put("accountNumber", accountNumber)
                put("ifsc", ifsc)
                put("accountHolderName", holderName)
                put("bankName", bankName)
            }
            val req = Request.Builder()
                .url(url)
                .header("Authorization", "Bearer $token")
                .header("Content-Type", "application/json")
                .post(payload.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                .build()
            val resp = httpClient.newCall(req).execute()
            val body = resp.body?.string() ?: ""
            val json = JSONObject(body)
            val success = json.optBoolean("success", false)
            val msg = if (success) {
                json.optString("message", "Bank account permanently bound and locked.")
            } else {
                json.optString("error", "Failed to bind bank account")
            }
            Pair(success, msg)
        } catch (e: Exception) {
            Pair(false, e.message ?: "Network error")
        }
    }
}
