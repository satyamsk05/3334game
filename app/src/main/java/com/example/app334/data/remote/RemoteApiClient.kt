package com.example.app334.data.remote

import android.util.Log
import com.example.app334.core.config.ClientConfig
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import java.util.concurrent.TimeUnit

object RemoteApiClient {

    private const val TAG = "RemoteApiClient"

    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()

    private var webSocket: WebSocket? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    fun connectWebSocket() {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return

        try {
            val request = Request.Builder()
                .url(ClientConfig.WEBSOCKET_URL)
                .build()

            webSocket = client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    Log.d(TAG, "Connected to Remote Backend WebSocket: ${ClientConfig.WEBSOCKET_URL}")
                    _isConnected.value = true
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    Log.e(TAG, "WebSocket failure: ${t.message}")
                    _isConnected.value = false
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    Log.d(TAG, "WebSocket closed: $reason")
                    _isConnected.value = false
                }
            })
        } catch (e: Exception) {
            Log.e(TAG, "WebSocket connect error: ${e.message}")
            _isConnected.value = false
        }
    }

    fun disconnectWebSocket() {
        webSocket?.close(1000, "App closed")
        webSocket = null
        _isConnected.value = false
    }
}
