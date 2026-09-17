package com.example.app334.core.config

import com.example.app334.BuildConfig

/**
 * Public Client Configuration for 334Game Android App.
 * Specifies the remote EC2 backend server endpoints and environment keys.
 */
object ClientConfig {

    var SERVER_BASE_URL: String = "http://3.7.73.109:4000"

    const val APP_VERSION: String = "1.0.0"

    val LOGGIN_APP_KEY: String
        get() = BuildConfig.LOGGIN_APP_KEY

    val API_BASE_URL: String
        get() = if (SERVER_BASE_URL.endsWith("/")) "${SERVER_BASE_URL}api/v1" else "$SERVER_BASE_URL/api/v1"

    val WEBSOCKET_URL: String
        get() = SERVER_BASE_URL.replace("http://", "ws://").replace("https://", "wss://") + "/ws"

    val IS_REMOTE_SERVER_ENABLED: Boolean
        get() = SERVER_BASE_URL.isNotBlank() && SERVER_BASE_URL != "OFFLINE"
}
