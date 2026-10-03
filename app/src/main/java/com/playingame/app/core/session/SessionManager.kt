package com.playingame.app.core.session

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
        val memoryUid = when (val state = _sessionState.value) {
            is SessionState.SignedIn -> state.userId
            else -> null
        }
        if (!memoryUid.isNullOrEmpty()) return memoryUid
        val repoUid = com.playingame.app.data.repository.AuthRepository.currentSession.value.userId
        return if (repoUid.isNotEmpty()) repoUid else null
    }

    fun authToken(): String? {
        val memoryToken = when (val state = _sessionState.value) {
            is SessionState.SignedIn -> state.authToken
            else -> null
        }
        if (!memoryToken.isNullOrEmpty()) return memoryToken
        val repoToken = com.playingame.app.data.repository.AuthRepository.getAuthToken()
        return if (repoToken.isNotEmpty()) repoToken else null
    }
}
