package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.ColorType

enum class RtpMode {
    FAIR_RNG,
    TARGET_RTP_95,
    PROFIT_MODE
}

data class AdminAnalytics(
    val totalActivePlayers: Int = 142,
    val totalBetsToday: Double = 45800.0,
    val totalPayoutsToday: Double = 38200.0,
    val netHouseProfit: Double = 7600.0,
    val totalDepositsToday: Double = 52000.0,
    val totalWithdrawalsToday: Double = 31000.0
)

data class UserProfileAdmin(
    val userId: String,
    val username: String,
    val phone: String,
    val depositBalance: Double,
    val winningBalance: Double,
    val isBanned: Boolean,
    val totalWagered: Double
)

object AdminEngine {

    var activeRtpMode: RtpMode = RtpMode.FAIR_RNG
    var manualOverrideSegmentIndex: Int = -1 // -1 means no override
    var minBetAmount: Double = 10.0
    var maxBetAmount: Double = 10000.0

    private val userProfiles = mutableMapOf<String, UserProfileAdmin>(
        "USR-304" to UserProfileAdmin("USR-304", "Satyam Kumar", "+91 9876543210", 500.0, 1250.0, false, 3200.0),
        "USR-892" to UserProfileAdmin("USR-892", "Amit Sharma", "+91 9123456789", 200.0, 500.0, false, 800.0),
        "USR-1042" to UserProfileAdmin("USR-1042", "Rahul Verma", "+91 9988776655", 1000.0, 0.0, false, 1500.0)
    )

    fun getAnalytics(): AdminAnalytics = AdminAnalytics()

    fun getUsers(): List<UserProfileAdmin> = userProfiles.values.toList()

    fun setManualOverride(segmentIndex: Int) {
        manualOverrideSegmentIndex = segmentIndex
        TelegramBotEngine.notifyAdminAction("SuperAdmin", "SET_MANUAL_OVERRIDE", "Override segment set to $segmentIndex")
    }

    fun clearManualOverride() {
        manualOverrideSegmentIndex = -1
    }

    fun toggleUserBan(userId: String): Boolean {
        val user = userProfiles[userId] ?: return false
        val newStatus = !user.isBanned
        userProfiles[userId] = user.copy(isBanned = newStatus)

        if (newStatus) {
            RiskEngine.banUser(userId)
            TelegramBotEngine.notifyAdminAction("SuperAdmin", "BAN_USER", "Banned user $userId (${user.username})")
        } else {
            RiskEngine.unbanUser(userId)
            TelegramBotEngine.notifyAdminAction("SuperAdmin", "UNBAN_USER", "Unbanned user $userId (${user.username})")
        }
        return newStatus
    }

    fun approveDeposit(txId: String) {
        WalletLedger.approveDeposit(txId)
        TelegramBotEngine.notifyAdminAction("SuperAdmin", "APPROVE_DEPOSIT", "Approved deposit transaction $txId")
    }

    fun approveWithdrawal(txId: String) {
        WalletLedger.updateTransactionStatus(txId, TransactionStatus.SUCCESS)
        TelegramBotEngine.notifyAdminAction("SuperAdmin", "APPROVE_WITHDRAWAL", "Approved withdrawal transaction $txId")
    }

    fun rejectWithdrawal(txId: String, reason: String) {
        WalletLedger.updateTransactionStatus(txId, TransactionStatus.REJECTED)
        TelegramBotEngine.notifyAdminAction("SuperAdmin", "REJECT_WITHDRAWAL", "Rejected withdrawal $txId: $reason")
    }
}
