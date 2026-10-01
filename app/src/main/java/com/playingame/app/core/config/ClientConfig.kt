package com.playingame.app.core.config

import com.playingame.app.BuildConfig

/**
 * Public Client Configuration for 334Game Android App.
 * Specifies the remote EC2 backend server endpoints and environment keys.
 */
object ClientConfig {

    /**
     * DEBUG → emulator loopback. Release → EC2.
     * Cleartext is allowlisted only for known hosts in network_security_config.xml.
     * Prefer HTTPS once TLS is terminated on the server.
     */
    var SERVER_BASE_URL: String = "http://3.7.73.109:4001"

    val APP_VERSION: String
        get() = try {
            BuildConfig.VERSION_NAME
        } catch (_: Exception) {
            "1.0"
        }

    val API_BASE_URL: String
        get() = if (SERVER_BASE_URL.endsWith("/")) "${SERVER_BASE_URL}api/v1" else "$SERVER_BASE_URL/api/v1"

    val WEBSOCKET_URL: String
        get() = SERVER_BASE_URL.replace("http://", "ws://").replace("https://", "wss://") + "/ws"

    val IS_REMOTE_SERVER_ENABLED: Boolean
        get() = SERVER_BASE_URL.isNotBlank() && SERVER_BASE_URL != "OFFLINE"
}
