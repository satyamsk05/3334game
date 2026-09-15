package com.example.app334.core.session

sealed class SessionState {
    object SignedOut : SessionState()
    data class SignedIn(
        val userId: String,
        val username: String,
        val authToken: String
    ) : SessionState()
    object Expired : SessionState()
    object Refreshing : SessionState()
}
