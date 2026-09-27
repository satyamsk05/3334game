package com.game3334.play.core.session

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
