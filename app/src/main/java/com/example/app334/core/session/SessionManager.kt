package com.example.app334.core.session

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

/**
 * Manages active user authentication session.
 * Replaces hard-coded client user identities.
 */
object SessionManager {

    private val _sessionState = MutableStateFlow<SessionState>(SessionState.SignedOut)
    val sessionState: StateFlow<SessionState> = _sessionState.asStateFlow()

    fun signIn(userId: String, username: String, token: String) {
        _sessionState.value = SessionState.SignedIn(
            userId = userId,
            username = username,
            authToken = token
        )
    }

    fun signOut() {
        _sessionState.value = SessionState.SignedOut
    }

    fun currentUserId(): String? {
        return when (val state = _sessionState.value) {
            is SessionState.SignedIn -> state.userId
            else -> null
        }
    }

    fun authToken(): String? {
        return when (val state = _sessionState.value) {
            is SessionState.SignedIn -> state.authToken
            else -> null
        }
    }
}
