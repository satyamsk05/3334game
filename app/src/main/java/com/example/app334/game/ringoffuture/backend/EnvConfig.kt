package com.example.app334.game.ringoffuture.backend

import android.util.Log
import java.io.File
import java.io.FileInputStream
import java.util.Properties

object EnvConfig {

    private const val TAG = "EnvConfig"
    private val envProperties = Properties()

    // Default Fallbacks
    var telegramBotToken: String = "7891234567:AAFx_YourRealTelegramBotToken"
        private set
    var telegramChatId: String = "-100192837465"
        private set
    var isTelegramEnabled: Boolean = true
        private set

    // Supabase Managed PostgreSQL Database Credentials (No Supabase Auth used)
    var supabaseDbUrl: String = "postgresql://postgres.your-project-id:your-password@aws-0-ap-south-1.pooler.supabase.com:6543/postgres"
        private set
    var supabaseRestUrl: String = "https://your-project-id.supabase.co/rest/v1"
        private set
    var supabaseServiceRoleKey: String = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.your_service_role_key_here"
        private set

    var supabaseDbHost: String = "aws-0-ap-south-1.pooler.supabase.com"
        private set
    var supabaseDbPort: Int = 6543
        private set
    var supabaseDbName: String = "postgres"
        private set
    var supabaseDbUser: String = "postgres.your-project-id"
        private set
    var supabaseDbPass: String = "your-db-password"
        private set

    var redisHost: String = "localhost"
        private set
    var redisPort: Int = 6379
        private set

    // Custom App Authentication Secrets
    var jwtSecret: String = "super_secret_jwt_key_334game_production_2026"
        private set
    var adminSecretKey: String = "admin_master_access_key_9988"
        private set

    init {
        loadEnvFile()
        syncToEngines()
    }

    fun loadEnvFile(customPath: String? = null) {
        try {
            val envFile = if (customPath != null) File(customPath) else File(".env")
            if (envFile.exists()) {
                FileInputStream(envFile).use { input ->
                    envProperties.load(input)
                }

                telegramBotToken = envProperties.getProperty("TELEGRAM_BOT_TOKEN", telegramBotToken)
                telegramChatId = envProperties.getProperty("TELEGRAM_CHAT_ID", telegramChatId)
                isTelegramEnabled = envProperties.getProperty("TELEGRAM_ALERTS_ENABLED", "true").toBoolean()

                supabaseDbUrl = envProperties.getProperty("SUPABASE_DB_URL", supabaseDbUrl)
                supabaseRestUrl = envProperties.getProperty("SUPABASE_REST_URL", supabaseRestUrl)
                supabaseServiceRoleKey = envProperties.getProperty("SUPABASE_SERVICE_ROLE_KEY", supabaseServiceRoleKey)

                supabaseDbHost = envProperties.getProperty("SUPABASE_DB_HOST", supabaseDbHost)
                supabaseDbPort = envProperties.getProperty("SUPABASE_DB_PORT", "6543").toIntOrNull() ?: 6543
                supabaseDbName = envProperties.getProperty("SUPABASE_DB_NAME", supabaseDbName)
                supabaseDbUser = envProperties.getProperty("SUPABASE_DB_USER", supabaseDbUser)
                supabaseDbPass = envProperties.getProperty("SUPABASE_DB_PASS", supabaseDbPass)

                redisHost = envProperties.getProperty("REDIS_HOST", redisHost)
                redisPort = envProperties.getProperty("REDIS_PORT", "6379").toIntOrNull() ?: 6379

                jwtSecret = envProperties.getProperty("JWT_SECRET", jwtSecret)
                adminSecretKey = envProperties.getProperty("ADMIN_SECRET_KEY", adminSecretKey)

                Log.d(TAG, "Successfully loaded pure Supabase Database & .env configuration")
                syncToEngines()
            } else {
                Log.w(TAG, ".env file not found at path [${envFile.absolutePath}], using default environment config")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse .env file: ${e.message}")
        }
    }

    fun updateTelegramCredentials(token: String, chatId: String) {
        telegramBotToken = token
        telegramChatId = chatId
        TelegramBotEngine.botToken = token
        TelegramBotEngine.chatId = chatId
    }

    private fun syncToEngines() {
        TelegramBotEngine.botToken = telegramBotToken
        TelegramBotEngine.chatId = telegramChatId
        TelegramBotEngine.isEnabled = isTelegramEnabled
    }
}
