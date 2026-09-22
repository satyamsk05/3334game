package com.example.app334.data.repository

import android.content.Context
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

import com.example.app334.core.session.SessionManager
import com.example.app334.game.ringoffuture.backend.WalletLedger

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

    fun login(phone: String, name: String, context: Context? = null) {
        val cleanPhone = phone.trim()
        val userName = if (name.isNotBlank()) name else "Player_${cleanPhone.takeLast(4)}"
        val newUserId = "USR-${System.currentTimeMillis() % 10000}"

        _currentSession.value = UserSession(
            userId = newUserId,
            name = userName,
            phone = cleanPhone,
            isLoggedIn = true
        )

        val targetContext = context ?: appContext
        targetContext?.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)?.edit()?.apply {
            putString(KEY_USER_ID, newUserId)
            putString(KEY_NAME, userName)
            putString(KEY_PHONE, cleanPhone)
            putBoolean(KEY_IS_LOGGED_IN, true)
            apply()
        }

        // Keep WalletLedger and SessionManager in exact sync (Rule 3 Invariant)
        WalletLedger.updateProfile(name = userName, phone = cleanPhone, userId = newUserId)
        SessionManager.signIn(userId = newUserId, username = userName, token = "WA-SESSION-$newUserId")
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
