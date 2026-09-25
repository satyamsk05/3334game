package com.example.app334.game.ringoffuture.backend

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.Locale

// Integer Paise Invariants (Rule 1 & 2): 100 paise = ₹1
data class WalletBalance(
    val depositPaise: Long = 0L,   // ₹0.00
    val winningPaise: Long = 0L,  // ₹0.00
    val bonusPaise: Long = 0L      // ₹0.00
) {
    val totalPaise: Long get() = depositPaise + winningPaise + bonusPaise
    val totalRupees: Double get() = totalPaise / 100.0
    val depositRupees: Double get() = depositPaise / 100.0
    val winningRupees: Double get() = winningPaise / 100.0
    val bonusRupees: Double get() = bonusPaise / 100.0

    val formattedTotal: String get() = String.format(Locale.getDefault(), "₹%.2f", totalRupees)
    val formattedDeposit: String get() = String.format(Locale.getDefault(), "₹%.2f", depositRupees)
    val formattedWinnings: String get() = String.format(Locale.getDefault(), "₹%.2f", winningRupees)
    val formattedBonus: String get() = String.format(Locale.getDefault(), "₹%.2f", bonusRupees)
}

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    BET_PLACED,
    WIN_PAYOUT,
    BET_REFUND
}

enum class TransactionStatus {
    SUCCESS,
    PENDING,
    REJECTED
}

data class WalletTransaction(
    val id: String = "TX-${System.currentTimeMillis()}-${(100..999).random()}",
    val userId: String,
    val type: TransactionType,
    val amountPaise: Long,
    val balanceAfterPaise: Long,
    val status: TransactionStatus,
    val referenceId: String,
    val description: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    val amountRupees: Double get() = amountPaise / 100.0
    val amountRupeesFormatted: String get() = String.format(Locale.getDefault(), "₹%.2f", amountRupees)
}

data class UserProfile(
    val userId: String = "",
    val username: String = "Player",
    val phone: String = "",
    val avatarRes: Int = 1
)

data class BetDebitBreakdown(
    val depositDebited: Long = 0L,
    val winningDebited: Long = 0L,
    val bonusDebited: Long = 0L,
    val totalDebited: Long = 0L,
    val success: Boolean = false
)

object WalletLedger {
    private val _walletBalance = MutableStateFlow(WalletBalance())
    val walletBalance: StateFlow<WalletBalance> = _walletBalance.asStateFlow()

    private val _userProfile = MutableStateFlow(UserProfile())
    val userProfile: StateFlow<UserProfile> = _userProfile.asStateFlow()

    private val _transactions = MutableStateFlow<List<WalletTransaction>>(emptyList())
    val transactions: StateFlow<List<WalletTransaction>> = _transactions.asStateFlow()

    init {
        // Initial transaction records empty
        _transactions.value = emptyList()
    }

    fun rupeesToPaise(rupees: Double): Long = Math.round(rupees * 100)
    fun formatPaiseToRupees(paise: Long): String = String.format(Locale.getDefault(), "₹%.2f", paise / 100.0)

    @Synchronized
    fun placeBet(amountPaise: Long): BetDebitBreakdown {
        val current = _walletBalance.value
        if (amountPaise <= 0L || current.totalPaise < amountPaise) {
            return BetDebitBreakdown(success = false)
        }

        var remaining = amountPaise
        var dep = current.depositPaise
        var win = current.winningPaise
        var bon = current.bonusPaise

        var depDebited = 0L
        var winDebited = 0L
        var bonDebited = 0L

        // Debit order: deposit -> winnings -> bonus
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
            referenceId = "BET-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Game Bet Placed"
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
                referenceId = "REF-${System.currentTimeMillis().toString().takeLast(6)}",
                description = "Bet Refunded"
            )
            _transactions.update { listOf(tx) + it }
        }
    }

    @Synchronized
    fun creditWin(winPayoutPaise: Long, multiplierLabel: String) {
        val current = _walletBalance.value
        val newBalance = current.copy(winningPaise = current.winningPaise + winPayoutPaise)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.WIN_PAYOUT,
            amountPaise = winPayoutPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = "WIN-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Win Payout ($multiplierLabel)"
        )
        _transactions.update { listOf(tx) + it }
    }

    @Synchronized
    fun addDepositCash(amountPaise: Long, utr: String = ""): WalletTransaction {
        val current = _walletBalance.value
        val newBalance = current.copy(depositPaise = current.depositPaise + amountPaise)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.DEPOSIT,
            amountPaise = amountPaise,
            balanceAfterPaise = newBalance.totalPaise,
            status = TransactionStatus.SUCCESS,
            referenceId = utr.ifEmpty { "DEP-UPI-${System.currentTimeMillis().toString().takeLast(8)}" },
            description = "Cash Deposit"
        )
        _transactions.update { listOf(tx) + it }
        return tx
    }

    @Synchronized
    fun recordPendingDeposit(amountPaise: Long): WalletTransaction {
        val current = _walletBalance.value
        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.DEPOSIT,
            amountPaise = amountPaise,
            balanceAfterPaise = current.totalPaise,
            status = TransactionStatus.PENDING,
            referenceId = "DEP-REQ-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Deposit Request (Awaiting Payment / UTR Approval)"
        )
        _transactions.update { listOf(tx) + it }
        return tx
    }

    @Synchronized
    fun syncBalance(depositPaise: Long, winningPaise: Long, bonusPaise: Long) {
        _walletBalance.value = WalletBalance(depositPaise, winningPaise, bonusPaise)
    }

    @Synchronized
    fun requestWithdrawal(amountPaise: Long, upiId: String): Pair<Boolean, String> {
        val current = _walletBalance.value
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
            referenceId = "WD-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Withdrawal to UPI: $upiId"
        )
        _transactions.update { listOf(tx) + it }
        return Pair(true, "Withdrawal of ${formatPaiseToRupees(amountPaise)} processed successfully!")
    }

    fun updateProfile(name: String, phone: String, userId: String? = null) {
        _userProfile.update { current ->
            current.copy(
                username = name,
                phone = phone,
                userId = userId ?: current.userId
            )
        }
    }

    @androidx.annotation.VisibleForTesting
    fun setTestBalance(depositPaise: Long, winningPaise: Long, bonusPaise: Long) {
        _walletBalance.value = WalletBalance(
            depositPaise = depositPaise,
            winningPaise = winningPaise,
            bonusPaise = bonusPaise
        )
    }
}
