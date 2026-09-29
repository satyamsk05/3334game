package com.playingame.app.game.xo.backend

import com.playingame.app.core.config.ClientConfig
import com.playingame.app.data.remote.WalletSyncService
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.game.xo.model.XOPlayer
import com.playingame.app.game.xo.model.XORoomState
import com.playingame.app.game.xo.model.XOTier
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import kotlin.random.Random

object XOGameRepository {

    val defaultTiers = listOf(
        XOTier("tier_1", "Battle ₹1", 1.0, 1.5, 0.0, 0.25, 2),
        XOTier("tier_5", "Battle ₹5", 5.0, 9.0, 0.0, 1.0, 2),
        XOTier("tier_10", "Battle ₹10", 10.0, 18.0, 0.0, 2.0, 2),
        XOTier("tier_25", "Battle ₹25", 25.0, 45.0, 0.0, 5.0, 2),
        XOTier("tier_50", "Battle ₹50", 50.0, 90.0, 0.0, 10.0, 2),
        XOTier("tier_100", "Battle ₹100", 100.0, 180.0, 0.0, 20.0, 2)
    )

    suspend fun joinBattle(tier: XOTier, playerName: String, userId: String): Result<XORoomState> = withContext(Dispatchers.IO) {
        var remoteDebited = false
        try {
            val url = URL("${ClientConfig.API_BASE_URL}/games/xo/join")
            val token = com.playingame.app.data.repository.AuthRepository.getAuthToken()
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                readTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                if (token.isNotBlank()) {
                    setRequestProperty("Authorization", "Bearer $token")
                }
            }

            val payload = JSONObject().apply {
                put("userId", userId)
                put("name", playerName)
                put("tierId", tier.id)
            }

            conn.outputStream.use { os ->
                os.write(payload.toString().toByteArray())
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                val responseText = conn.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseText)
                if (json.optBoolean("success")) {
                    remoteDebited = true
                    val roomObj = json.optJSONObject("room")
                    if (roomObj != null) {
                        WalletSyncService.syncBalance(userId)
                        return@withContext Result.success(parseRoom(roomObj, tier))
                    }
                }
            }
        } catch (_: Exception) {
            // Fallback: Local offline/simulated engine if remote backend unreachable
        }

        // Local Instant Matchmaking Simulation
        val botNames = listOf("Anika Donin", "Vikram S.", "Rahul_Gamer", "Pooja Sharma", "Kunal99")
        val botName = botNames[Random.nextInt(botNames.size)]
        
        val localRoom = XORoomState(
            roomId = "LOCAL-XO-${System.currentTimeMillis()}",
            tier = tier,
            player1 = XOPlayer(userId = userId, name = playerName, symbol = "O", score = 0),
            player2 = XOPlayer(userId = "BOT-${Random.nextInt(1000, 9999)}", name = botName, symbol = "X", score = 0, isBot = true),
            board = List(9) { null },
            currentTurnUserId = userId,
            status = "IN_GAME",
            turnSecondsRemaining = 15,
            totalGameSecondsRemaining = 163 // 02:43
        )

        if (remoteDebited) {
            // Sync authoritative balance from server (already debited once on server as XO-BET-...)
            WalletSyncService.syncBalance(userId)
        } else {
            // Offline fallback: Deduct locally only if server did not debit
            val breakdown = WalletLedger.placeBet(Math.round(tier.entryRupees * 100))
            if (!breakdown.success) {
                return@withContext Result.failure(Exception("Insufficient balance"))
            }
        }

        Result.success(localRoom)
    }

    suspend fun submitMove(roomId: String, cellIndex: Int, userId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${ClientConfig.API_BASE_URL}/games/xo/move")
            val token = com.playingame.app.data.repository.AuthRepository.getAuthToken()
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 3000
                readTimeout = 3000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                if (token.isNotBlank()) {
                    setRequestProperty("Authorization", "Bearer $token")
                }
            }

            val payload = JSONObject().apply {
                put("userId", userId)
                put("roomId", roomId)
                put("cellIndex", cellIndex)
            }

            conn.outputStream.use { os ->
                os.write(payload.toString().toByteArray())
            }

            val code = conn.responseCode
            return@withContext Result.success(code in 200..299)
        } catch (_: Exception) {
            return@withContext Result.success(true)
        }
    }

    suspend fun reportGameResult(roomId: String, tier: XOTier, winnerUserId: String?, isDraw: Boolean, userId: String): Result<Boolean> = withContext(Dispatchers.IO) {
        try {
            val url = URL("${ClientConfig.API_BASE_URL}/games/xo/end")
            val token = com.playingame.app.data.repository.AuthRepository.getAuthToken()
            val conn = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                connectTimeout = 4000
                readTimeout = 4000
                doOutput = true
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Accept", "application/json")
                if (token.isNotBlank()) {
                    setRequestProperty("Authorization", "Bearer $token")
                }
            }

            val resultStr = when {
                winnerUserId == userId -> "WIN"
                isDraw -> "DRAW"
                else -> "LOSS"
            }

            val payload = JSONObject().apply {
                put("userId", userId)
                put("roomId", roomId)
                put("tierId", tier.id)
                put("result", resultStr)
            }

            conn.outputStream.use { os ->
                os.write(payload.toString().toByteArray())
            }

            val responseCode = conn.responseCode
            if (responseCode in 200..299) {
                // Immediately refresh user's authoritative balance from server
                WalletSyncService.syncBalance(userId)
                return@withContext Result.success(true)
            }
        } catch (_: Exception) {
            // Local fallback
        }
        return@withContext Result.success(false)
    }

    private fun parseRoom(json: JSONObject, defaultTier: XOTier): XORoomState {
        val p1 = json.getJSONObject("player1")
        val p2 = json.optJSONObject("player2")

        val boardArr = json.getJSONArray("board")
        val board = (0 until boardArr.length()).map { i ->
            if (boardArr.isNull(i)) null else boardArr.getString(i)
        }

        return XORoomState(
            roomId = json.getString("roomId"),
            tier = defaultTier,
            player1 = XOPlayer(
                userId = p1.getString("userId"),
                name = p1.getString("name"),
                symbol = p1.getString("symbol"),
                score = p1.optInt("score", 0)
            ),
            player2 = p2?.let {
                XOPlayer(
                    userId = it.getString("userId"),
                    name = it.getString("name"),
                    symbol = it.getString("symbol"),
                    score = it.optInt("score", 0),
                    isBot = it.optBoolean("isBot", false)
                )
            },
            board = board,
            currentTurnUserId = json.getString("currentTurnUserId"),
            status = json.getString("status"),
            turnSecondsRemaining = json.optInt("turnSecondsRemaining", 15),
            winnerUserId = if (json.isNull("winnerUserId")) null else json.optString("winnerUserId", "").ifEmpty { null },
            isDraw = json.optBoolean("isDraw", false)
        )
    }
}
