package com.example.app334.core.config

/**
 * Public Client Configuration for 334Game Android App.
 * Specifies the remote EC2 backend server endpoints.
 */
object ClientConfig {

    /**
     * Set your EC2 public IP or domain here (e.g., "http://13.233.100.50:4000" or "http://10.0.2.2:4000" for emulator)
     * Leave blank or empty string to use local simulated mode.
     */
    var SERVER_BASE_URL: String = "http://10.0.2.2:4000"

    const val APP_VERSION: String = "1.0.0"

    val API_BASE_URL: String
        get() = if (SERVER_BASE_URL.endsWith("/")) "${SERVER_BASE_URL}api/v1" else "$SERVER_BASE_URL/api/v1"

    val WEBSOCKET_URL: String
        get() = SERVER_BASE_URL.replace("http://", "ws://").replace("https://", "wss://") + "/ws"

    val IS_REMOTE_SERVER_ENABLED: Boolean
        get() = SERVER_BASE_URL.isNotBlank() && SERVER_BASE_URL != "OFFLINE"
}
