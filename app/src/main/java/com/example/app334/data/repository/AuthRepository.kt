package com.example.app334.data.repository

import android.content.Context
import android.util.Log
import com.example.app334.R
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
    val avatarId: String = "avatar_1",
    val isLoggedIn: Boolean = false,
    val isBanned: Boolean = false
)

object AuthRepository {
    private const val PREFS_NAME = "app334_auth_prefs"
    private const val KEY_USER_ID = "auth_user_id"
    private const val KEY_NAME = "auth_name"
    private const val KEY_PHONE = "auth_phone"
    private const val KEY_AVATAR = "auth_avatar"
    private const val KEY_IS_LOGGED_IN = "auth_is_logged_in"
    private const val KEY_IS_BANNED = "auth_is_banned"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(5, TimeUnit.SECONDS)
        .build()

    private val _currentSession = MutableStateFlow(UserSession())
    val currentSession: StateFlow<UserSession> = _currentSession.asStateFlow()

    private var appContext: Context? = null

    fun getAvatarDrawable(avatarId: String): Int {
        return when (avatarId) {
            "avatar_1" -> R.drawable.avatar_1
            "avatar_2" -> R.drawable.avatar_2
            "avatar_3" -> R.drawable.avatar_3
            "avatar_4" -> R.drawable.avatar_4
            "avatar_5" -> R.drawable.avatar_5
            "avatar_6" -> R.drawable.avatar_6
            "avatar_7" -> R.drawable.avatar_7
            "avatar_8" -> R.drawable.avatar_8
            else -> R.drawable.avatar_1
        }
    }

    fun init(context: Context) {
        appContext = context.applicationContext
        val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        val isBanned = prefs.getBoolean(KEY_IS_BANNED, false)
        if (isLoggedIn) {
            val userId = prefs.getString(KEY_USER_ID, (1000000..9999999).random().toString()) ?: "1000001"
            val name = prefs.getString(KEY_NAME, "Player") ?: "Player"
            val phone = prefs.getString(KEY_PHONE, "") ?: ""
            val avatarId = prefs.getString(KEY_AVATAR, "avatar_1") ?: "avatar_1"
            _currentSession.value = UserSession(userId, name, phone, avatarId, true, isBanned)
            WalletLedger.updateProfile(
                name = name,
                phone = phone,
                userId = userId,
                avatarRes = getAvatarDrawable(avatarId),
                avatarId = avatarId
            )
            SessionManager.signIn(userId = userId, username = name, token = "SESSION-$userId")
        } else {
            _currentSession.value = UserSession(isLoggedIn = false, isBanned = isBanned)
        }
    }

    fun getSavedUserForPhone(phone: String, context: Context? = null): Triple<String, String, String>? {
        val targetContext = context ?: appContext ?: return null
        val prefs = targetContext.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val cleanPhone = phone.trim()
        val savedPhone = prefs.getString("user_phone_$cleanPhone", null)
        if (savedPhone != null) {
            val savedId = prefs.getString("user_id_$cleanPhone", "") ?: ""
            val savedName = prefs.getString("user_name_$cleanPhone", "") ?: ""
            val savedAvatar = prefs.getString("user_avatar_$cleanPhone", "avatar_1") ?: "avatar_1"
            if (savedId.isNotEmpty()) {
                return Triple(savedId, savedName, savedAvatar)
            }
        }
        return null
    }

    suspend fun checkBanStatus(userId: String, phone: String = ""): Boolean = withContext(Dispatchers.IO) {
        if (userId.isBlank() && phone.isBlank()) return@withContext false
        try {
            val url = "${ClientConfig.API_BASE_URL}/auth/status?userId=$userId&phone=$phone"
            val request = Request.Builder().url(url).get().build()
            val response = httpClient.newCall(request).execute()
            if (response.isSuccessful) {
                val resString = response.body?.string() ?: ""
                val json = JSONObject(resString)
                val data = json.optJSONObject("data")
                val isBanned = data?.optBoolean("isBanned", false) ?: false
                if (isBanned) {
                    withContext(Dispatchers.Main) {
                        _currentSession.value = _currentSession.value.copy(isBanned = true)
                        appContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()?.apply {
                            putBoolean(KEY_IS_BANNED, true)
                            apply()
                        }
                    }
                }
                return@withContext isBanned
            }
        } catch (e: Exception) {
            Log.w("AuthRepository", "Failed to check ban status against server: ${e.message}")
        }
        return@withContext false
    }

    suspend fun login(phone: String, name: String, context: Context? = null): Result<UserSession> = withContext(Dispatchers.IO) {
        val cleanPhone = phone.trim()
        val targetContext = context ?: appContext
        val prefs = targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        // Check if user previously logged in with this phone
        val existingSaved = getSavedUserForPhone(cleanPhone, targetContext)
        val resolvedName = when {
            name.isNotBlank() -> name.trim()
            existingSaved != null && existingSaved.second.isNotBlank() -> existingSaved.second
            else -> "Player_${cleanPhone.takeLast(4).ifEmpty { "101" }}"
        }

        var resolvedUserId = existingSaved?.first ?: (1000000..9999999).random().toString()
        var resolvedAvatar = existingSaved?.third ?: "avatar_1"
        var authToken = "SESSION-$resolvedUserId"

        // Sync with live backend server so user is registered and visible in Admin Panel
        try {
            val url = "${ClientConfig.API_BASE_URL}/auth/login"
            val payload = JSONObject().apply {
                put("phone", cleanPhone)
                put("name", resolvedName)
            }
            val body = payload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder().url(url).post(body).build()
            val response = httpClient.newCall(request).execute()
            val resString = response.body?.string() ?: ""

            if (response.code == 403 || resString.contains("suspended") || resString.contains("banned")) {
                withContext(Dispatchers.Main) {
                    _currentSession.value = _currentSession.value.copy(isBanned = true)
                    prefs?.edit()?.putBoolean(KEY_IS_BANNED, true)?.apply()
                }
                return@withContext Result.failure(Exception("ACCOUNT_BANNED"))
            }

            if (response.isSuccessful) {
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
            Log.e("AuthRepository", "Server sync failed, using persistent offline fallback", e)
        }

        val session = UserSession(
            userId = resolvedUserId,
            name = resolvedName,
            phone = cleanPhone,
            avatarId = resolvedAvatar,
            isLoggedIn = true,
            isBanned = false
        )

        withContext(Dispatchers.Main) {
            _currentSession.value = session

            // Save active session + persist user identity map
            prefs?.edit()?.apply {
                putString(KEY_USER_ID, resolvedUserId)
                putString(KEY_NAME, resolvedName)
                putString(KEY_PHONE, cleanPhone)
                putString(KEY_AVATAR, resolvedAvatar)
                putBoolean(KEY_IS_LOGGED_IN, true)
                putBoolean(KEY_IS_BANNED, false)
                // Cache identity for this phone permanently
                putString("user_phone_$cleanPhone", cleanPhone)
                putString("user_id_$cleanPhone", resolvedUserId)
                putString("user_name_$cleanPhone", resolvedName)
                putString("user_avatar_$cleanPhone", resolvedAvatar)
                apply()
            }

            // Keep WalletLedger and SessionManager in exact sync
            val avatarResId = getAvatarDrawable(resolvedAvatar)
            WalletLedger.updateProfile(
                name = resolvedName,
                phone = cleanPhone,
                userId = resolvedUserId,
                avatarRes = avatarResId,
                avatarId = resolvedAvatar
            )
            SessionManager.signIn(userId = resolvedUserId, username = resolvedName, token = authToken)
        }
        return@withContext Result.success(session)
    }

    suspend fun updateProfile(name: String, avatarId: String = "", context: Context? = null): Result<UserSession> = withContext(Dispatchers.IO) {
        val targetContext = context ?: appContext
        val prefs = targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
        val current = _currentSession.value
        val newName = name.trim().ifEmpty { current.name }
        val newAvatar = avatarId.trim().ifEmpty { current.avatarId }

        val updatedSession = current.copy(name = newName, avatarId = newAvatar)

        // Save locally immediately
        withContext(Dispatchers.Main) {
            _currentSession.value = updatedSession
            prefs?.edit()?.apply {
                putString(KEY_NAME, newName)
                putString(KEY_AVATAR, newAvatar)
                if (current.phone.isNotEmpty()) {
                    putString("user_name_${current.phone}", newName)
                    putString("user_avatar_${current.phone}", newAvatar)
                }
                apply()
            }
            val avatarResId = getAvatarDrawable(newAvatar)
            WalletLedger.updateProfile(
                name = newName,
                phone = current.phone,
                userId = current.userId,
                avatarRes = avatarResId,
                avatarId = newAvatar
            )
            SessionManager.signIn(userId = current.userId, username = newName, token = "SESSION-${current.userId}")
        }

        // Sync to backend API
        try {
            val url = "${ClientConfig.API_BASE_URL}/auth/profile/update"
            val payload = JSONObject().apply {
                put("userId", current.userId)
                put("name", newName)
                put("avatarUrl", newAvatar)
            }
            val body = payload.toString().toRequestBody("application/json".toMediaTypeOrNull())
            val request = Request.Builder().url(url).post(body).build()
            httpClient.newCall(request).execute()
        } catch (e: Exception) {
            Log.w("AuthRepository", "Failed to sync profile update to backend: ${e.message}")
        }

        return@withContext Result.success(updatedSession)
    }

    fun logout(context: Context? = null) {
        _currentSession.value = UserSession(isLoggedIn = false)
        val targetContext = context ?: appContext
        targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()?.apply {
            putBoolean(KEY_IS_LOGGED_IN, false)
            apply()
        }
        SessionManager.signOut()
    }
}
