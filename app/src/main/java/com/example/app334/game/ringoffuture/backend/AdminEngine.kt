package com.example.app334.game.ringoffuture.backend

enum class RtpMode {
    FAIR_RNG,
    TARGET_RTP_95
}

data class AdminAnalytics(
    val totalActivePlayers: Int = 1,
    val totalBetsToday: Double = 0.0,
    val totalPayoutsToday: Double = 0.0,
    val netHouseProfit: Double = 0.0
)

data class UserProfileAdmin(
    val userId: String,
    val username: String,
    val phone: String,
    val depositBalance: Double,
    val winningBalance: Double,
    val isBanned: Boolean
)

object AdminEngine {

    var activeRtpMode: RtpMode = RtpMode.FAIR_RNG
    var minBetAmount: Double = 10.0
    var maxBetAmount: Double = 10000.0

    fun getAnalytics(): AdminAnalytics = AdminAnalytics()

    fun getUsers(): List<UserProfileAdmin> {
        val user = WalletLedger.userProfile.value
        val wallet = WalletLedger.walletBalance.value
        return listOf(
            UserProfileAdmin(
                userId = user.userId,
                username = user.username,
                phone = user.phone,
                depositBalance = wallet.depositRupees,
                winningBalance = wallet.winningRupees,
                isBanned = false
            )
        )
    }
}
