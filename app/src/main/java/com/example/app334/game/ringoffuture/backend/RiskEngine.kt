package com.example.app334.game.ringoffuture.backend

object RiskEngine {

    private val bannedDevices = mutableSetOf<String>()
    private val bannedUsers = mutableSetOf<String>()
    
    // Minimum wagering multiplier (50% of deposit must be wagered before withdrawal)
    const val MIN_WAGERING_PERCENT = 0.50

    fun isUserBanned(userId: String): Boolean {
        return bannedUsers.contains(userId)
    }

    fun banUser(userId: String) {
        bannedUsers.add(userId)
    }

    fun unbanUser(userId: String) {
        bannedUsers.remove(userId)
    }

    fun validateWithdrawalEligibility(
        userId: String,
        amount: Double,
        totalDeposited: Double,
        totalWagered: Double
    ): Pair<Boolean, String> {
        if (isUserBanned(userId)) {
            return Pair(false, "User account is suspended. Contact Support.")
        }

        val requiredWager = totalDeposited * MIN_WAGERING_PERCENT
        if (totalWagered < requiredWager) {
            val remaining = requiredWager - totalWagered
            return Pair(
                false,
                "Wagering requirement not met. Please wager ₹${String.format("%.2f", remaining)} more before withdrawing."
            )
        }

        return Pair(true, "Eligible for withdrawal")
    }
}
