package com.example.app334.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class UserSession(
    val userId: String = "USR-9001",
    val name: String = "Player",
    val phone: String = "9876543210",
    val isLoggedIn: Boolean = true
)

object AuthRepository {
    private val _currentSession = MutableStateFlow(UserSession())
    val currentSession: StateFlow<UserSession> = _currentSession.asStateFlow()

    fun login(phone: String, name: String) {
        val cleanPhone = phone.trim()
        val userName = if (name.isNotBlank()) name else "Player_${cleanPhone.takeLast(4)}"
        _currentSession.value = UserSession(
            userId = "USR-${System.currentTimeMillis() % 10000}",
            name = userName,
            phone = cleanPhone,
            isLoggedIn = true
        )
    }

    fun logout() {
        _currentSession.value = UserSession(isLoggedIn = false)
    }
}
