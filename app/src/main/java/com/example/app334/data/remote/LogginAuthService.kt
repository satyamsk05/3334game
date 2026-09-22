package com.example.app334.data.remote

import android.net.Uri
import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.util.concurrent.TimeUnit
import kotlin.random.Random

/**
 * Official Loggin.dev WhatsApp Authentication Integration for 334Game.
 * Implements token generation, wa.me deep linking, and SSE verification stream.
 * Docs: https://loggin.dev/docs
 */
object LogginAuthService {

    private const val TAG = "LogginAuthService"
    private const val API_BASE = "https://loggin.dev"
    private const val BUSINESS_PHONE = "919989907408"
    private const val CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"

    private val client = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(0, TimeUnit.MILLISECONDS) // Indefinite for SSE streaming
        .build()

    /**
     * Generates a 6-character random token in format: ${appKey}-${RANDOM6}
     */
    fun generateToken(appKey: String): String {
        val rand = StringBuilder(6)
        for (i in 0 until 6) {
            val idx = Random.nextInt(CHARS.length)
            rand.append(CHARS[idx])
        }
        return "$appKey-$rand"
    }

    /**
     * Builds official WhatsApp deep link with the required pre-filled verification message.
     */
    fun createWhatsAppLink(token: String): String {
        val msg = "Please do not edit this message.\nLOGGIN $token"
        return "https://wa.me/$BUSINESS_PHONE?text=${Uri.encode(msg)}"
    }

    /**
     * Listens to loggin.dev Server-Sent Events (SSE) stream until verified or cancelled.
     * Endpoint: https://loggin.dev/api/subscribe?token=${token}
     */
    suspend fun waitForVerification(token: String): Result<String> = withContext(Dispatchers.IO) {
        val url = "$API_BASE/api/subscribe?token=${Uri.encode(token)}"
        val request = Request.Builder()
            .url(url)
            .header("Accept", "text/event-stream")
            .header("Cache-Control", "no-cache")
            .build()

        var response: Response? = null
        try {
            response = client.newCall(request).execute()
            if (!response.isSuccessful) {
                return@withContext Result.failure(Exception("Loggin SSE error: HTTP ${response.code}"))
            }

            val body = response.body ?: return@withContext Result.failure(Exception("Empty SSE body"))
            val reader = BufferedReader(InputStreamReader(body.byteStream()))

            var line: String?
            while (reader.readLine().also { line = it } != null) {
                val currentLine = line?.trim() ?: continue
                if (currentLine.startsWith("data:")) {
                    val jsonStr = currentLine.removePrefix("data:").trim()
                    Log.d(TAG, "SSE event data: $jsonStr")
                    try {
                        val json = JSONObject(jsonStr)
                        val status = json.optString("status")
                        if (status == "verified") {
                            val phone = json.optString("phone")
                            if (phone.isNotBlank()) {
                                return@withContext Result.success(phone)
                            }
                        } else if (status == "blocked") {
                            return@withContext Result.failure(Exception("Loggin verification blocked"))
                        }
                    } catch (e: Exception) {
                        Log.e(TAG, "Failed to parse SSE payload", e)
                    }
                }
            }
            Result.failure(Exception("Stream closed without verification"))
        } catch (e: Exception) {
            Log.e(TAG, "SSE stream error", e)
            Result.failure(e)
        } finally {
            try {
                response?.close()
            } catch (_: Exception) {}
        }
    }
}
