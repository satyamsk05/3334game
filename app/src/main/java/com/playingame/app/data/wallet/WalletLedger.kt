package com.playingame.app.data.wallet

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import java.util.Locale

// Integer Chips Invariants: 100 chips = 1 unit (formerly paise)
data class WalletBalance(
    val depositChips: Long = 0L,   // 0.00
    val winningChips: Long = 0L,  // 0.00
    val bonusChips: Long = 0L      // 0.00
) {
    // Backward-compatible constructor supporting legacy calls
    constructor(
        depositPaise: Long = 0L,
        winningPaise: Long = 0L,
        bonusPaise: Long = 0L,
        @Suppress("UNUSED_PARAMETER") legacy: Boolean = true
    ) : this(depositChips = depositPaise, winningChips = winningPaise, bonusChips = bonusPaise)

    val totalChips: Long get() = depositChips + winningChips + bonusChips
    val totalRupees: Double get() = totalChips / 100.0
    val depositRupees: Double get() = depositChips / 100.0
    val winningRupees: Double get() = winningChips / 100.0
    val bonusRupees: Double get() = bonusChips / 100.0

    // Backward compatibility aliases
    val totalPaise: Long get() = totalChips
    val depositPaise: Long get() = depositChips
    val winningPaise: Long get() = winningChips
    val bonusPaise: Long get() = bonusChips

    val formattedTotal: String get() = String.format(Locale.getDefault(), "%.2f", totalRupees)
    val formattedDeposit: String get() = String.format(Locale.getDefault(), "%.2f", depositRupees)
    val formattedWinnings: String get() = String.format(Locale.getDefault(), "%.2f", winningRupees)
    val formattedBonus: String get() = String.format(Locale.getDefault(), "%.2f", bonusRupees)
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
    PROCESSING,
    REJECTED
}

data class WalletTransaction(
    val id: String = "TX-${System.currentTimeMillis()}-${(100..999).random()}",
    val userId: String,
    val type: TransactionType,
    val amountChips: Long,
    val balanceAfterChips: Long,
    val status: TransactionStatus,
    val referenceId: String,
    val description: String,
    val timestamp: Long = System.currentTimeMillis()
) {
    // Backward compatibility properties
    val amountPaise: Long get() = amountChips
    val balanceAfterPaise: Long get() = balanceAfterChips

    val amountRupees: Double get() = amountChips / 100.0
    val amountRupeesFormatted: String get() = String.format(Locale.getDefault(), "%.2f", amountRupees)
}

data class UserProfile(
    val userId: String = "",
    val username: String = "Player",
    val phone: String = "",
    val avatarId: String = "avatar_1",
    val avatarRes: Int = com.playingame.app.R.drawable.avatar_1
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

    private var _pendingRoundId: String? = null
    private var _pendingRoundBetChips: Long = 0L
    private var _pendingRoundBetCount: Int = 0
    private var _pendingRoundBalanceBeforeChips: Long = 0L

    init {
        _transactions.value = emptyList()
    }

    fun rupeesToChips(rupees: Double): Long = Math.round(rupees * 100)
    fun formatChipsToRupees(chips: Long): String = String.format(Locale.getDefault(), "%.2f", chips / 100.0)

    // Backward compatibility functions
    fun rupeesToPaise(rupees: Double): Long = rupeesToChips(rupees)
    fun formatPaiseToRupees(paise: Long): String = formatChipsToRupees(paise)

    @Synchronized
    fun setTransactions(newTransactions: List<WalletTransaction>) {
        if (newTransactions.isNotEmpty()) {
            _transactions.value = newTransactions.take(100)
        }
    }

    @Synchronized
    fun addTransaction(tx: WalletTransaction) {
        _transactions.update { listOf(tx) + it }
    }

    @Synchronized
    fun placeBet(amountChips: Long, roundId: String = ""): BetDebitBreakdown {
        val current = _walletBalance.value
        if (amountChips <= 0L || current.totalChips < amountChips) {
            return BetDebitBreakdown(success = false)
        }

        var remaining = amountChips
        var dep = current.depositChips
        var win = current.winningChips
        var bon = current.bonusChips

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

        val newBalance = WalletBalance(depositChips = dep, winningChips = win, bonusChips = bon)
        _walletBalance.value = newBalance

        if (roundId.isNotEmpty()) {
            if (_pendingRoundId != null && _pendingRoundId != roundId) {
                flushPendingRoundBets()
            }
            if (_pendingRoundId == null) {
                _pendingRoundId = roundId
                _pendingRoundBalanceBeforeChips = current.totalChips
            }
            _pendingRoundBetChips += amountChips
            _pendingRoundBetCount += 1
        } else {
            val tx = WalletTransaction(
                userId = _userProfile.value.userId,
                type = TransactionType.BET_PLACED,
                amountChips = amountChips,
                balanceAfterChips = newBalance.totalChips,
                status = TransactionStatus.SUCCESS,
                referenceId = "BET-${System.currentTimeMillis().toString().takeLast(6)}",
                description = "Game Bet Placed"
            )
            _transactions.update { listOf(tx) + it }
        }

        return BetDebitBreakdown(
            depositDebited = depDebited,
            winningDebited = winDebited,
            bonusDebited = bonDebited,
            totalDebited = amountChips,
            success = true
        )
    }

    @Synchronized
    fun commitRoundBets() {
        flushPendingRoundBets()
    }

    private fun flushPendingRoundBets() {
        val rid = _pendingRoundId ?: return
        val total = _pendingRoundBetChips
        val count = _pendingRoundBetCount
        if (total <= 0L) {
            _pendingRoundId = null
            _pendingRoundBetChips = 0L
            _pendingRoundBetCount = 0
            return
        }
        val balanceAfter = _walletBalance.value.totalChips
        val shortId = rid.takeLast(6)
        val desc = if (count > 1) "Game Bet · $count bets · Round #$shortId"
                   else "Game Bet · Round #$shortId"
        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.BET_PLACED,
            amountChips = total,
            balanceAfterChips = balanceAfter,
            status = TransactionStatus.SUCCESS,
            referenceId = "RND-$shortId",
            description = desc
        )
        _transactions.update { listOf(tx) + it }
        _pendingRoundId = null
        _pendingRoundBetChips = 0L
        _pendingRoundBetCount = 0
    }

    @Synchronized
    fun refundBet(depositRefund: Long, winningRefund: Long, bonusRefund: Long) {
        flushPendingRoundBets()
        val current = _walletBalance.value
        val newBalance = WalletBalance(
            depositChips = current.depositChips + depositRefund,
            winningChips = current.winningChips + winningRefund,
            bonusChips = current.bonusChips + bonusRefund
        )
        _walletBalance.value = newBalance

        val totalRefund = depositRefund + winningRefund + bonusRefund
        if (totalRefund > 0L) {
            val tx = WalletTransaction(
                userId = _userProfile.value.userId,
                type = TransactionType.BET_REFUND,
                amountChips = totalRefund,
                balanceAfterChips = newBalance.totalChips,
                status = TransactionStatus.SUCCESS,
                referenceId = "REF-${System.currentTimeMillis().toString().takeLast(6)}",
                description = "Bet Refunded"
            )
            _transactions.update { listOf(tx) + it }
        }
    }

    @Synchronized
    fun creditWin(winPayoutChips: Long, multiplierLabel: String) {
        flushPendingRoundBets()

        val current = _walletBalance.value
        val newBalance = current.copy(winningChips = current.winningChips + winPayoutChips)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            userId = _userProfile.value.userId,
            type = TransactionType.WIN_PAYOUT,
            amountChips = winPayoutChips,
            balanceAfterChips = newBalance.totalChips,
            status = TransactionStatus.SUCCESS,
            referenceId = "WIN-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Win Payout ($multiplierLabel)"
        )
        _transactions.update { listOf(tx) + it }
    }

    fun generateDepositId(): String = "D" + (100000000000L..999999999999L).random()
    fun generateWithdrawalId(): String = "T" + (100000000000L..999999999999L).random()

    @Synchronized
    fun addDepositCash(amountChips: Long, utr: String = ""): WalletTransaction {
        val current = _walletBalance.value
        val newBalance = current.copy(depositChips = current.depositChips + amountChips)
        _walletBalance.value = newBalance

        val tx = WalletTransaction(
            id = generateDepositId(),
            userId = _userProfile.value.userId,
            type = TransactionType.DEPOSIT,
            amountChips = amountChips,
            balanceAfterChips = newBalance.totalChips,
            status = TransactionStatus.SUCCESS,
            referenceId = utr.ifEmpty { generateDepositId() },
            description = "Cash Deposit"
        )
        _transactions.update { listOf(tx) + it }
        return tx
    }

    @Synchronized
    fun recordPendingDeposit(amountChips: Long): WalletTransaction {
        val current = _walletBalance.value
        val depId = generateDepositId()
        val tx = WalletTransaction(
            id = depId,
            userId = _userProfile.value.userId,
            type = TransactionType.DEPOSIT,
            amountChips = amountChips,
            balanceAfterChips = current.totalChips,
            status = TransactionStatus.PENDING,
            referenceId = depId,
            description = "Deposit Request (Awaiting Payment / UTR Approval)"
        )
        _transactions.update { listOf(tx) + it }
        return tx
    }

    @Synchronized
    fun syncBalance(depositChips: Long, winningChips: Long, bonusChips: Long) {
        _walletBalance.value = WalletBalance(depositChips, winningChips, bonusChips)
    }

    @Synchronized
    fun requestWithdrawal(amountChips: Long, upiId: String, referenceId: String? = null): Pair<Boolean, String> {
        val current = _walletBalance.value
        val minChips = 2500L
        val maxChips = 500000L

        if (amountChips < minChips) {
            return Pair(false, "Minimum withdrawal amount is 25 chips")
        }
        if (amountChips > maxChips) {
            return Pair(false, "Maximum withdrawal amount is 5,000 chips per request")
        }
        if (amountChips > current.winningChips) {
            return Pair(false, "Insufficient Winnings Balance (Available: ${current.formattedWinnings})")
        }

        val newBalance = current.copy(winningChips = current.winningChips - amountChips)
        _walletBalance.value = newBalance

        val txId = referenceId ?: generateWithdrawalId()
        val tx = WalletTransaction(
            id = txId,
            userId = _userProfile.value.userId,
            type = TransactionType.WITHDRAWAL,
            amountChips = amountChips,
            balanceAfterChips = newBalance.totalChips,
            status = TransactionStatus.PENDING,
            referenceId = txId,
            description = "Withdrawal to UPI: $upiId"
        )
        _transactions.update { listOf(tx) + it }
        return Pair(true, "Withdrawal request of ${formatChipsToRupees(amountChips)} submitted. Awaiting approval.")
    }

    @Synchronized
    fun updateWithdrawalStatus(referenceId: String, newStatus: TransactionStatus) {
        _transactions.update { txns ->
            txns.map { tx ->
                if (tx.referenceId == referenceId || tx.id == referenceId) {
                    tx.copy(status = newStatus)
                } else {
                    tx
                }
            }
        }
    }

    @Synchronized
    fun refundWithdrawal(referenceId: String, amountChips: Long) {
        val current = _walletBalance.value
        val newBalance = current.copy(winningChips = current.winningChips + amountChips)
        _walletBalance.value = newBalance

        _transactions.update { txns ->
            txns.map { tx ->
                if (tx.referenceId == referenceId || tx.id == referenceId) {
                    tx.copy(status = TransactionStatus.REJECTED, balanceAfterChips = newBalance.totalChips)
                } else {
                    tx
                }
            }
        }
    }

    fun updateProfile(name: String, phone: String, userId: String? = null, avatarRes: Int? = null, avatarId: String? = null) {
        _userProfile.update { current ->
            current.copy(
                username = name,
                phone = phone,
                userId = userId ?: current.userId,
                avatarRes = avatarRes ?: current.avatarRes,
                avatarId = avatarId ?: current.avatarId
            )
        }
    }

    @androidx.annotation.VisibleForTesting
    fun setTestBalance(depositChips: Long, winningChips: Long, bonusChips: Long) {
        _walletBalance.value = WalletBalance(
            depositChips = depositChips,
            winningChips = winningChips,
            bonusChips = bonusChips
        )
    }
}
