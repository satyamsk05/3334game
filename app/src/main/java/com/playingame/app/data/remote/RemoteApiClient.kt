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
    private const val HTTP_CACHE_SIZE_BYTES = 10L * 1024 * 1024 // 10 MB

    private val connectionPool = ConnectionPool(8, 5, TimeUnit.MINUTES)
    private var appContext: android.content.Context? = null
    private var _client: OkHttpClient? = null

    val client: OkHttpClient
        get() = _client ?: synchronized(this) {
            _client ?: buildClient().also { _client = it }
        }

    val httpClient: OkHttpClient
        get() = client

    fun init(context: android.content.Context) {
        val appCtx = context.applicationContext
        appContext = appCtx
        synchronized(this) {
            if (_client == null || _client?.cache == null) {
                _client = buildClient(appCtx)
            }
        }
    }

    private fun buildClient(context: android.content.Context? = appContext): OkHttpClient {
        val builder = OkHttpClient.Builder()
            .connectionPool(connectionPool)
            .connectTimeout(10, TimeUnit.SECONDS)
            .readTimeout(15, TimeUnit.SECONDS)
            .writeTimeout(15, TimeUnit.SECONDS)

        if (context != null) {
            try {
                val cacheDir = context.cacheDir.resolve("http_cache")
                builder.cache(Cache(cacheDir, HTTP_CACHE_SIZE_BYTES))
            } catch (e: Exception) {
                Log.w(TAG, "Failed to initialize OkHttp cache directory", e)
            }
        }
        return builder.build()
    }
    private var webSocket: WebSocket? = null

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()


    fun connectWebSocket() {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return

        val token = com.playingame.app.data.repository.AuthRepository.getAuthToken().ifBlank {
            com.playingame.app.core.session.SessionManager.authToken() ?: ""
        }
        if (token.isBlank()) {
            Log.d(TAG, "WebSocket connection deferred: waiting for user authentication")
            return
        }

        try {
            val encodedToken = java.net.URLEncoder.encode(token, "UTF-8")
            val urlWithToken = if (ClientConfig.WEBSOCKET_URL.contains("?")) {
                "${ClientConfig.WEBSOCKET_URL}&token=$encodedToken"
            } else {
                "${ClientConfig.WEBSOCKET_URL}?token=$encodedToken"
            }

            val request = Request.Builder()
                .url(urlWithToken)
                .header("Authorization", "Bearer $token")
                .build()

            webSocket = client.newWebSocket(request, object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    Log.d(TAG, "Connected to Remote Backend WebSocket: ${ClientConfig.WEBSOCKET_URL}")
                    _isConnected.value = true
                }

                override fun onMessage(webSocket: WebSocket, text: String) {
                    try {
                        val json = org.json.JSONObject(text)
                        val event = json.optString("event")
                        Log.d(TAG, "WebSocket event received: $event")
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
