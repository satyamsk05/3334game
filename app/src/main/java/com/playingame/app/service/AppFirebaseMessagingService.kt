package com.playingame.app.service

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.data.repository.AuthRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

class AppFirebaseMessagingService : FirebaseMessagingService() {

    companion object {
        private const val TAG = "FCMService"

        fun syncTokenWithBackend(token: String) {
            val session = AuthRepository.currentSession.value
            if (!session.isLoggedIn || session.userId.isBlank()) {
                Log.d(TAG, "User not logged in, token saved locally: $token")
                return
            }

            CoroutineScope(Dispatchers.IO).launch {
                try {
                    val baseUrl = ClientConfig.SERVER_BASE_URL.trimEnd('/')
                    val url = "$baseUrl/users/fcm-token"
                    val json = JSONObject().apply {
                        put("userId", session.userId)
                        put("fcmToken", token)
                    }

                    val request = Request.Builder()
                        .url(url)
                        .post(json.toString().toRequestBody("application/json".toMediaType()))
                        .build()

                    val response = RemoteApiClient.httpClient.newCall(request).execute()
                    if (response.isSuccessful) {
                        Log.i(TAG, "FCM token synced with backend for user: ${session.userId}")
                    } else {
                        Log.w(TAG, "FCM token sync returned code: ${response.code}")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to sync FCM token: ${e.message}")
                }
            }
        }
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.i(TAG, "New FCM Registration Token generated: $token")
        syncTokenWithBackend(token)
    }

    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        Log.d(TAG, "Message received from: ${remoteMessage.from}")

        // 1. Extract notification payload or data payload
        val title = remoteMessage.notification?.title
            ?: remoteMessage.data["title"]
            ?: "Game In Play Alert"

        val body = remoteMessage.notification?.body
            ?: remoteMessage.data["body"]
            ?: remoteMessage.data["message"]
            ?: "You have a new update in Game In Play!"

        // 2. Display system notification in Android Tray
        NotificationHelper.showNotification(
            context = applicationContext,
            title = title,
            body = body
        )
    }
}
