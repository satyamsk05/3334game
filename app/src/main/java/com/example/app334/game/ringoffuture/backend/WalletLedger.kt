package com.example.app334.game.ringoffuture.backend

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.UUID

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    BET_PLACED,
    BET_REFUND,
    WIN_PAYOUT,
    BONUS_CREDIT
}

enum class TransactionStatus {
    SUCCESS,
    PENDING,
    FAILED,
    REJECTED
}

data class UserProfile(
    val userId: String = "USR-304",
    val username: String = "Satyam Kumar",
    val phone: String = "+91 98765 43210",
    val avatarResId: Int = 0
)

data class WalletTransaction(
    val id: String = "TX-${UUID.randomUUID().toString().replace("-", "").take(10).uppercase()}",
    val userId: String,
    val type: TransactionType,
    val amountPaise: Long,
    val balanceAfterPaise: Long,
    val status: TransactionStatus,
    val referenceId: String,
    val description: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    val amountRupeesFormatted: String
        get() {
            val rupees = amountPaise / 100.0
            val prefix = if (type == TransactionType.WITHDRAWAL || type == TransactionType.BET_PLACED) "-" else "+"
            return "$prefix₹${String.format("%.2f", rupees)}"
        }
}

data class WalletBalance(
    val depositPaise: Long = 50000L,   // ₹500.00 demo deposit
    val winningPaise: Long = 125000L,  // ₹1250.00 demo winnings
    val bonusPaise: Long = 10000L      // ₹100.00 demo bonus
) {
    val totalPaise: Long get() = depositPaise + winningPaise + bonusPaise

    val depositRupees: Double get() = depositPaise / 100.0
    val winningRupees: Double get() = winningPaise / 100.0
    val bonusRupees: Double get() = bonusPaise / 100.0
    val totalRupees: Double get() = totalPaise / 100.0

    val formattedTotal: String get() = WalletLedger.formatPaiseToRupees(totalPaise)
    val formattedDeposit: String get() = WalletLedger.formatPaiseToRupees(depositPaise)
    val formattedWinnings: String get() = WalletLedger.formatPaiseToRupees(winningPaise)
    val formattedBonus: String get() = WalletLedger.formatPaiseToRupees(bonusPaise)
}

data class BetDebitBreakdown(
    val depositDebited: Long = 0L,
    val winningDebited: Long = 0L,
    val bonusDebited: Long = 0L,
    val totalDebited: Long = 0L,
    val success: Boolean = false
)

object WalletLedger {

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _walletBalance = MutableStateFlow(WalletBalance())
    val walletBalance: StateFlow<WalletBalance> = _walletBalance.asStateFlow()

    private val _transactions = MutableStateFlow<List<WalletTransaction>>(
        listOf(
            WalletTransaction(
                id = "TX1001",
                userId = "USR-304",
                type = TransactionType.DEPOSIT,
                amountPaise = 50000L,
                balanceAfterPaise = 185000L,
                status = TransactionStatus.SUCCESS,
                referenceId = "UPI-49302198421",
                description = "Demo Initial Deposit via UPI"
            ),
            WalletTransaction(
                id = "TX1000",
                userId = "USR-304",
                type = TransactionType.BONUS_CREDIT,
                amountPaise = 10000L,
                balanceAfterPaise = 135000L,
                status = TransactionStatus.SUCCESS,
                referenceId = "BONUS-WELCOME",
                description = "Welcome Demo Bonus"
            )
        )
    )
    val transactions: StateFlow<List<WalletTransaction>> = _transactions.asStateFlow()

    fun formatPaiseToRupees(paise: Long): String {
        val rupees = paise / 100.0
        return if (paise % 100L == 0L) {
            "₹${paise / 100}"
        } else {
            "₹${String.format("%.2f", rupees)}"
        }
    }

    fun rupeesToPaise(rupees: Double): Long {
        return kotlin.math.round(rupees * 100).toLong()
    }

    @Synchronized
    fun placeBet(amountPaise: Long): BetDebitBreakdown {
        val current = _walletBalance.value
        if (current.totalPaise < amountPaise || amountPaise <= 0L) {
            return BetDebitBreakdown(success = false)
        }

        var remaining = amountPaise
        var dep = current.depositPaise
        var win = current.winningPaise
        var bon = current.bonusPaise

        var depDebited = 0L
        var winDebited = 0L
        var bonDebited = 0L

        // Order of debit: deposit -> winnings -> bonus
        if (dep >= remaining) {
            depDebited = remaining
            dep -= remaining
            remaining = 0L
        } else {
            depDebited = dep
            remaining -= dep
            dep = 0L

            if (win >= remaining) {
                winDebited = remaining
                win -= remaining
                remaining = 0L
            } else {
                winDebited = win
                remaining -= win
                win = 0L

                if (bon >= remaining) {
                    bonDebited = remaining
                    bon -= remaining
                    remaining = 0L
                } else {
                    return BetDebitBreakdown(success = false)
                }
            }
        }

        val newBalance = WalletBalance(depositPaise = dep, winningPaise = win, bonusPaise = bon)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.BET_PLACED,
            amountPaise = amountPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = "BET-${UUID.randomUUID()}",
            description = "Bet placed on Ring of Future"
        )

        _transactions.update { listOf(tx) + it }

        return BetDebitBreakdown(
            depositDebited = depDebited,
            winningDebited = winDebited,
            bonusDebited = bonDebited,
            totalDebited = amountPaise,
            success = true
        )
    }

    @Synchronized
    fun refundBet(depositRefund: Long, winningRefund: Long, bonusRefund: Long) {
        val current = _walletBalance.value
        val newBalance = WalletBalance(
            depositPaise = current.depositPaise + depositRefund,
            winningPaise = current.winningPaise + winningRefund,
            bonusPaise = current.bonusPaise + bonusRefund
        )
        _walletBalance.value = newBalance

        val totalRefund = depositRefund + winningRefund + bonusRefund
        if (totalRefund > 0L) {
            val tx = WalletTransaction(
                userId = _userProfile.value.userId,
                type = TransactionType.BET_REFUND,
                amountPaise = totalRefund,
                balanceAfterPaise = newBalance.totalPaise,
                status = TransactionStatus.SUCCESS,
                referenceId = "REF-${UUID.randomUUID()}",
                description = "Bet refunded on Ring of Future"
            )
            _transactions.update { listOf(tx) + it }
        }
    }

    @Synchronized
    fun creditWin(winPayoutPaise: Long, multiplierLabel: String) {
        val current = _walletBalance.value
        // Wins credit winnings ONLY
        val newBalance = current.copy(winningPaise = current.winningPaise + winPayoutPaise)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.WIN_PAYOUT,
            amountPaise = winPayoutPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = "WIN-${UUID.randomUUID()}",
            description = "Win Payout ($multiplierLabel)"
        )
        _transactions.update { listOf(tx) + it }
    }

    @Synchronized
    fun addDemoCash(amountPaise: Long, utr: String = ""): WalletTransaction {
        val current = _walletBalance.value
        val newBalance = current.copy(depositPaise = current.depositPaise + amountPaise)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.DEPOSIT,
            amountPaise = amountPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = utr.ifEmpty { "DEMO-UPI-${UUID.randomUUID()}" },
            description = "Demo Play Chips Added"
        )
        _transactions.update { listOf(tx) + it }
        return tx
    }

    @Synchronized
    fun requestWithdrawal(amountPaise: Long, upiId: String): Pair<Boolean, String> {
        val current = _walletBalance.value
        
        // Rule: Min ₹25 (2500 paise), Max ₹5000 (500000 paise)
        val minPaise = 2500L
        val maxPaise = 500000L

        if (amountPaise < minPaise) {
            return Pair(false, "Minimum withdrawal amount is ₹25")
        }
        if (amountPaise > maxPaise) {
            return Pair(false, "Maximum withdrawal amount is ₹5,000 per request")
        }
        if (amountPaise > current.winningPaise) {
            return Pair(false, "Insufficient Winnings Balance (Available: ${current.formattedWinnings})")
        }

        val newBalance = current.copy(winningPaise = current.winningPaise - amountPaise)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.WITHDRAWAL,
            amountPaise = amountPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = "WD-${UUID.randomUUID()}",
            description = "Demo Withdrawal to UPI: $upiId"
        )
        _transactions.update { listOf(tx) + it }
        return Pair(true, "Withdrawal of ${formatPaiseToRupees(amountPaise)} processed successfully!")
    }

    fun updateProfile(name: String, phone: String) {
        _userProfile.update { it.copy(username = name, phone = phone) }
    }

    fun resetDemoBalance() {
        _walletBalance.value = WalletBalance()
        _transactions.value = listOf(
            WalletTransaction(
                id = "TX1001",
                userId = "USR-304",
                type = TransactionType.DEPOSIT,
                amountPaise = 50000L,
                balanceAfterPaise = 185000L,
                status = TransactionStatus.SUCCESS,
                referenceId = "UPI-49302198421",
                description = "Demo Initial Deposit via UPI"
            ),
            WalletTransaction(
                id = "TX1000",
                userId = "USR-304",
                type = TransactionType.BONUS_CREDIT,
                amountPaise = 10000L,
                balanceAfterPaise = 135000L,
                status = TransactionStatus.SUCCESS,
                referenceId = "BONUS-WELCOME",
                description = "Welcome Demo Bonus"
            )
        )
    }
}
