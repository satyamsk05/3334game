package com.example.app334.data.repository

import android.content.Context
import android.util.Log
import com.example.app334.core.config.ClientConfig
import com.example.app334.core.session.SessionManager
import com.example.app334.game.ringoffuture.backend.WalletLedger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class UserSession(
    val userId: String = "",
    val name: String = "",
    val phone: String = "",
    val isLoggedIn: Boolean = false
)

object AuthRepository {
    private const val PREFS_NAME = "app334_auth_prefs"
    private const val KEY_USER_ID = "auth_user_id"
    private const val KEY_NAME = "auth_name"
    private const val KEY_PHONE = "auth_phone"
    private const val KEY_IS_LOGGED_IN = "auth_is_logged_in"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    private val _currentSession = MutableStateFlow(UserSession())
    val currentSession: StateFlow<UserSession> = _currentSession.asStateFlow()

    private var appContext: Context? = null

    fun init(context: Context) {
        appContext = context.applicationContext
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        if (isLoggedIn) {
            val userId = prefs.getString(KEY_USER_ID, "USR-101") ?: "USR-101"
            val name = prefs.getString(KEY_NAME, "Player") ?: "Player"
            val phone = prefs.getString(KEY_PHONE, "") ?: ""
            _currentSession.value = UserSession(userId, name, phone, true)
            WalletLedger.updateProfile(name = name, phone = phone, userId = userId)
            SessionManager.signIn(userId = userId, username = name, token = "SESSION-$userId")
        } else {
            _currentSession.value = UserSession(isLoggedIn = false)
        }
    }

    suspend fun login(phone: String, name: String, context: Context? = null) = withContext(Dispatchers.IO) {
        val cleanPhone = phone.trim()
        val userName = if (name.isNotBlank()) name else "Player_${cleanPhone.takeLast(4)}"
        var resolvedUserId = "USR-${System.currentTimeMillis() % 10000}"
        var authToken = "SESSION-$resolvedUserId"

        // Sync with live backend server so user is registered and visible in Admin Panel
        try {
            val url = "${ClientConfig.API_BASE_URL}/auth/login"
            val payload = JSONObject().apply {
                put("phone", cleanPhone)
                put("name", userName)
            }
            val body = payload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder().url(url).post(body).build()
            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val resString = response.body?.string() ?: ""
                val json = JSONObject(resString)
                val data = json.optJSONObject("data")
                val user = data?.optJSONObject("user")
                val serverUserId = user?.optString("id")
                if (!serverUserId.isNullOrBlank()) {
                    resolvedUserId = serverUserId
                }
                val token = data?.optString("token")
                if (!token.isNullOrBlank()) {
                    authToken = token
                }
                Log.d("AuthRepository", "Synced login with backend server: $resolvedUserId")
            } else {
                Log.w("AuthRepository", "Backend login returned HTTP ${response.code}")
            }
        } catch (e: Exception) {
            Log.e("AuthRepository", "Server sync failed, using offline fallback", e)
        }

        withContext(Dispatchers.Main) {
            _currentSession.value = UserSession(
                userId = resolvedUserId,
                name = userName,
                phone = cleanPhone,
                isLoggedIn = true
            )

            val targetContext = context ?: appContext
            targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()?.apply {
                putString(KEY_USER_ID, resolvedUserId)
                putString(KEY_NAME, userName)
                putString(KEY_PHONE, cleanPhone)
                putBoolean(KEY_IS_LOGGED_IN, true)
                apply()
            }

            // Keep WalletLedger and SessionManager in exact sync (Rule 3 Invariant)
            WalletLedger.updateProfile(name = userName, phone = cleanPhone, userId = resolvedUserId)
            SessionManager.signIn(userId = resolvedUserId, username = userName, token = authToken)
        }
    }

    fun logout(context: Context? = null) {
        _currentSession.value = UserSession(isLoggedIn = false)
        val targetContext = context ?: appContext
        targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()?.apply {
            clear()
            apply()
        }
        SessionManager.signOut()
    }
}
