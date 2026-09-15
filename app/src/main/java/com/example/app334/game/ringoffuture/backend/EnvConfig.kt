package com.example.app334.game.ringoffuture.backend

import com.example.app334.core.config.ClientConfig

/**
 * Legacy environment config accessor.
 * Refactored: Sensitive DB passwords, JWT secrets, and private keys stripped from Android client.
 */
object EnvConfig {

    val apiBaseUrl: String
        get() = ClientConfig.API_BASE_URL

    val appVersion: String
        get() = ClientConfig.APP_VERSION

    // Legacy placeholders retained for transition without exposing backend secrets
    var isTelegramEnabled: Boolean = false
        private set
}
