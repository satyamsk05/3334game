package com.example.app334.game.ringoffuture.backend

import java.util.UUID

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    BET_PLACED,
    WIN_PAYOUT,
    ADMIN_BONUS_CREDIT,
    ADMIN_DEBIT
}

enum class TransactionStatus {
    SUCCESS,
    PENDING,
    FAILED,
    REJECTED
}

data class WalletTransaction(
    val id: String = UUID.randomUUID().toString().take(8).uppercase(),
    val userId: String,
    val type: TransactionType,
    val amount: Double,
    val balanceAfter: Double,
    val status: TransactionStatus,
    val referenceId: String,
    val description: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class WalletBalance(
    val depositBalance: Double = 500.0,
    val winningBalance: Double = 1250.0,
    val bonusBalance: Double = 100.0
) {
    val totalBalance: Double get() = depositBalance + winningBalance + bonusBalance
}

object WalletLedger {
    private var currentBalance = WalletBalance()
    private val transactions = mutableListOf<WalletTransaction>()

    init {
        // Initial sample ledger entry
        transactions.add(
            WalletTransaction(
                id = "TX1001",
                userId = "USR-304",
                type = TransactionType.DEPOSIT,
                amount = 500.0,
                balanceAfter = 1850.0,
                status = TransactionStatus.SUCCESS,
                referenceId = "UPI-49302198421",
                description = "Initial Deposit via PhonePe"
            )
        )
    }

    fun getBalance(): WalletBalance = currentBalance

    fun getTransactions(): List<WalletTransaction> = transactions.toList()

    @Synchronized
    fun processDepositRequest(amount: Double, utr: String): WalletTransaction {
        val tx = WalletTransaction(
            userId = "USR-304",
            type = TransactionType.DEPOSIT,
            amount = amount,
            balanceAfter = currentBalance.totalBalance + amount,
            status = TransactionStatus.PENDING,
            referenceId = utr.ifEmpty { "UTR-${System.currentTimeMillis().toString().takeLast(8)}" },
            description = "Deposit via UPI (Pending Verification)"
        )
        transactions.add(0, tx)
        return tx
    }

    @Synchronized
    fun approveDeposit(txId: String) {
        val index = transactions.indexOfFirst { it.id == txId }
        if (index != -1) {
            val oldTx = transactions[index]
            if (oldTx.status == TransactionStatus.PENDING) {
                currentBalance = currentBalance.copy(
                    depositBalance = currentBalance.depositBalance + oldTx.amount
                )
                transactions[index] = oldTx.copy(
                    status = TransactionStatus.SUCCESS,
                    balanceAfter = currentBalance.totalBalance
                )
            }
        }
    }

    @Synchronized
    fun placeBet(amount: Double): Boolean {
        if (currentBalance.totalBalance < amount) return false

        var remaining = amount
        var newDeposit = currentBalance.depositBalance
        var newWinning = currentBalance.winningBalance

        if (newDeposit >= remaining) {
            newDeposit -= remaining
            remaining = 0.0
        } else {
            remaining -= newDeposit
            newDeposit = 0.0
            newWinning -= remaining
        }

        currentBalance = currentBalance.copy(
            depositBalance = newDeposit,
            winningBalance = newWinning
        )

        transactions.add(
            0,
            WalletTransaction(
                userId = "USR-304",
                type = TransactionType.BET_PLACED,
                amount = amount,
                balanceAfter = currentBalance.totalBalance,
                status = TransactionStatus.SUCCESS,
                referenceId = "BET-${System.currentTimeMillis().toString().takeLast(6)}",
                description = "Bet placed on Ring of Future"
            )
        )
        return true
    }

    @Synchronized
    fun creditWin(amount: Double, multiplier: Float) {
        currentBalance = currentBalance.copy(
            winningBalance = currentBalance.winningBalance + amount
        )
        transactions.add(
            0,
            WalletTransaction(
                userId = "USR-304",
                type = TransactionType.WIN_PAYOUT,
                amount = amount,
                balanceAfter = currentBalance.totalBalance,
                status = TransactionStatus.SUCCESS,
                referenceId = "WIN-${System.currentTimeMillis().toString().takeLast(6)}",
                description = "Win Payout (${multiplier}x)"
            )
        )
    }

    @Synchronized
    fun requestWithdrawal(amount: Double, upiId: String): Pair<Boolean, String> {
        if (amount > currentBalance.winningBalance) {
            return Pair(false, "Insufficient Winnings Balance for Withdrawal")
        }

        currentBalance = currentBalance.copy(
            winningBalance = currentBalance.winningBalance - amount
        )

        val tx = WalletTransaction(
            userId = "USR-304",
            type = TransactionType.WITHDRAWAL,
            amount = amount,
            balanceAfter = currentBalance.totalBalance,
            status = TransactionStatus.PENDING,
            referenceId = "WD-${System.currentTimeMillis().toString().takeLast(6)}",
            description = "Withdrawal to UPI: $upiId"
        )
        transactions.add(0, tx)
        return Pair(true, tx.id)
    }

    @Synchronized
    fun updateTransactionStatus(txId: String, newStatus: TransactionStatus) {
        val index = transactions.indexOfFirst { it.id == txId }
        if (index != -1) {
            val oldTx = transactions[index]
            if (newStatus == TransactionStatus.REJECTED && oldTx.type == TransactionType.WITHDRAWAL) {
                // Refund winnings if rejected
                currentBalance = currentBalance.copy(
                    winningBalance = currentBalance.winningBalance + oldTx.amount
                )
            }
            transactions[index] = oldTx.copy(
                status = newStatus,
                balanceAfter = currentBalance.totalBalance
            )
        }
    }
}
