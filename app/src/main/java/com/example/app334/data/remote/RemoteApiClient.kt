package com.example.app334.data.remote

import android.util.Log
import com.example.app334.core.config.ClientConfig
import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.game.ringoffuture.model.RingOfFutureGameState
import com.example.app334.game.ringoffuture.model.UserBets
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import org.json.JSONObject
import java.io.IOException
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

    private val _remoteGameState = MutableStateFlow<RingOfFutureGameState?>(null)
    val remoteGameState: StateFlow<RingOfFutureGameState?> = _remoteGameState.asStateFlow()

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

                override fun onMessage(webSocket: WebSocket, text: String) {
                    parseWebSocketMessage(text)
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

    private fun parseWebSocketMessage(jsonText: String) {
        try {
            val json = JSONObject(jsonText)
            val type = json.optString("type")
            if (type == "GAME_STATE") {
                val payload = json.getJSONObject("payload")
                val roundId = payload.optString("roundId", "RD-1001")
                val roundNumber = payload.optLong("roundNumber", 1001L)
                val phaseStr = payload.optString("phase", "BETTING")
                val phase = when (phaseStr) {
                    "LOCKED" -> GamePhase.LOCKED
                    "SPINNING" -> GamePhase.SPINNING
                    "RESULT_SHOW" -> GamePhase.RESULT_SHOW
                    else -> GamePhase.BETTING
                }
                val secondsRemaining = payload.optInt("secondsRemaining", 15)
                val winningSegmentIndex = payload.optInt("winningSegmentIndex", 0)
                val lastWinAmount = payload.optLong("lastWinAmount", 0L)

                val userBetsObj = payload.optJSONObject("userBets")
                val greenBet = userBetsObj?.optLong("greenBet", 0L) ?: 0L
                val redBet = userBetsObj?.optLong("redBet", 0L) ?: 0L
                val purpleBet = userBetsObj?.optLong("purpleBet", 0L) ?: 0L
                val greyBet = userBetsObj?.optLong("greyBet", 0L) ?: 0L

                val recentArray = payload.optJSONArray("recentResults")
                val recentList = mutableListOf<Int>()
                if (recentArray != null) {
                    for (i in 0 until recentArray.length()) {
                        recentList.add(recentArray.getInt(i))
                    }
                }

                val newState = RingOfFutureGameState(
                    roundNumber = roundNumber,
                    phase = phase,
                    secondsRemaining = secondsRemaining,
                    winningSegmentIndex = winningSegmentIndex,
                    userBets = UserBets(blackBet = greyBet, redBet = redBet, blueBet = purpleBet, greenBet = greenBet),
                    lastWinAmount = lastWinAmount
                )

                _remoteGameState.value = newState
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing WS message: ${e.message}")
        }
    }

    fun placeBetRemote(colorType: ColorType, amountPaise: Long, callback: (Boolean) -> Unit) {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) {
            callback(false)
            return
        }

        scope.launch {
            try {
                val json = JSONObject().apply {
                    put("userId", "USR-304")
                    put("color", colorType.name)
                    put("amountPaise", amountPaise)
                }

                val mediaType = "application/json".toMediaTypeOrNull()
                val body = RequestBody.create(mediaType, json.toString())
                val request = Request.Builder()
                    .url("${ClientConfig.API_BASE_URL}/game/place-bet")
                    .post(body)
                    .build()

                client.newCall(request).execute().use { response ->
                    callback(response.isSuccessful)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Remote placeBet error: ${e.message}")
                callback(false)
            }
        }
    }
}
