package com.playingame.app.data.remote

import android.util.Log
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.util.NetworkMonitor
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.IOException
import java.util.concurrent.TimeUnit

sealed interface BootstrapState {
    object Idle : BootstrapState
    object Checking : BootstrapState
    object Ready : BootstrapState
    object NoInternet : BootstrapState
    data class ServerMaintenance(val message: String = "Server is under maintenance. Please try again later.") : BootstrapState
}

/**
 * AppBootstrapService - Startup Gate & Health Handshake.
 * Ensures the app only renders core playable content when network and backend are verified ONLINE.
 */
object AppBootstrapService {

    private const val TAG = "AppBootstrapService"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(4, TimeUnit.SECONDS)
        .readTimeout(4, TimeUnit.SECONDS)
        .build()

    private val _bootstrapState = MutableStateFlow<BootstrapState>(BootstrapState.Idle)
    val bootstrapState: StateFlow<BootstrapState> = _bootstrapState.asStateFlow()

    /**
     * Executes the bootstrap handshake during app launch or on retry.
     */
    suspend fun performBootstrap(): BootstrapState = withContext(Dispatchers.IO) {
        _bootstrapState.value = BootstrapState.Checking

        // Step 1: Check device network connectivity
        if (!NetworkMonitor.isOnline.value) {
            Log.w(TAG, "Bootstrap failed: Device is offline")
            _bootstrapState.value = BootstrapState.NoInternet
            return@withContext BootstrapState.NoInternet
        }

        // Step 2: Ping backend health endpoint
        try {
            val url = "${ClientConfig.API_BASE_URL}/health"
            val request = Request.Builder().url(url).get().build()
            val response = httpClient.newCall(request).execute()

            if (response.code == 503) {
                val body = response.body?.string() ?: ""
                val msg = try {
                    JSONObject(body).optString("message", "Server is under scheduled maintenance.")
                } catch (_: Exception) {
                    "Server is under scheduled maintenance."
                }
                _bootstrapState.value = BootstrapState.ServerMaintenance(msg)
                return@withContext _bootstrapState.value
            }

            if (!response.isSuccessful) {
                Log.w(TAG, "Backend health check failed with HTTP ${response.code}")
                _bootstrapState.value = BootstrapState.ServerMaintenance("Server is temporarily unavailable (HTTP ${response.code}).")
                return@withContext _bootstrapState.value
            }

            val body = response.body?.string() ?: ""
            val json = JSONObject(body)
            val status = json.optString("status", "ONLINE")

            if (status.equals("MAINTENANCE", ignoreCase = true) || status.equals("DEGRADED", ignoreCase = true) && json.optString("database") == "OFFLINE") {
                val msg = json.optString("message", "Server maintenance is currently in progress.")
                _bootstrapState.value = BootstrapState.ServerMaintenance(msg)
                return@withContext _bootstrapState.value
            }

            // Step 3: Success! Server is live and healthy
            Log.i(TAG, "Bootstrap succeeded: Server is ONLINE")
            _bootstrapState.value = BootstrapState.Ready
            return@withContext BootstrapState.Ready
        } catch (e: IOException) {
            Log.e(TAG, "Bootstrap network exception: ${e.message}")
            _bootstrapState.value = BootstrapState.NoInternet
            return@withContext BootstrapState.NoInternet
        } catch (e: Exception) {
            Log.e(TAG, "Bootstrap unexpected error: ${e.message}")
            _bootstrapState.value = BootstrapState.ServerMaintenance("Unable to connect to game servers.")
            return@withContext _bootstrapState.value
        }
    }

    /**
     * Resets state to Idle and re-attempts bootstrap handshake.
     */
    suspend fun retry() {
        performBootstrap()
    }
}
