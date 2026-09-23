package com.example.app334.data.remote

import android.util.Log
import com.example.app334.core.config.ClientConfig
import com.example.app334.core.session.SessionManager
import com.example.app334.game.ringoffuture.backend.WalletLedger
import kotlinx.coroutines.*
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
            return@withContext true
        } catch (e: Exception) {
            Log.e(TAG, "Failed to sync wallet with server: ${e.message}")
            return@withContext false
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
     * Stops the periodic sync job (e.g. when app moves to background).
     */
    fun stopLiveSync() {
        syncJob?.cancel()
        syncJob = null
    }
}
