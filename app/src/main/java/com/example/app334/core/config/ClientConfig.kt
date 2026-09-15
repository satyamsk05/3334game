package com.example.app334.core.config

/**
 * Public client-side configuration.
 * Must NOT contain backend database credentials, private keys, admin secrets, or bot tokens.
 */
object ClientConfig {
    const val API_BASE_URL: String = "https://api.3334game.com/v1"
    const val WS_BASE_URL: String = "wss://api.3334game.com/v1/game/ws"
    const val APP_VERSION: String = "1.0.0"
    
    // Public Feature Flags
    const val ENABLE_REALTIME_WS: Boolean = true
    const val ENABLE_FAIRNESS_VERIFICATION: Boolean = true
}
