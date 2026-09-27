package com.playingame.app.data.remote

import android.util.Log
import com.playingame.app.core.config.ClientConfig
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import okhttp3.*
import java.util.concurrent.TimeUnit

object RemoteApiClient {

    private const val TAG = "RemoteApiClient"

    val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .writeTimeout(10, TimeUnit.SECONDS)
        .build()

    val httpClient: OkHttpClient
        get() = client

    private var appContext: android.content.Context? = null
    private var webSocket: WebSocket? = null

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    fun init(context: android.content.Context) {
        appContext = context.applicationContext
    }

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

                override fun onMessage(webSocket: WebSocket, text: String) {
                    Log.d(TAG, "WebSocket message received: $text")
                    try {
                        val json = org.json.JSONObject(text)
                        val event = json.optString("event")
                        val data = json.optJSONObject("data")
                        if (event == "SYSTEM_ANNOUNCEMENT" && data != null) {
                            val title = data.optString("title", "Game In Play Alert")
                            val body = data.optString("body", "")
                            if (body.isNotBlank()) {
                                appContext?.let { ctx ->
                                    com.playingame.app.service.NotificationHelper.showNotification(
                                        context = ctx,
                                        title = title,
                                        body = body
                                    )
                                }
                            }
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Error parsing WebSocket message: ${e.message}")
                    }
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
