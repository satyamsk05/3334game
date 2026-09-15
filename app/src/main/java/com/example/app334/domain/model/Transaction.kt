package com.example.app334.domain.model

enum class TransactionType {
    DEPOSIT,
    WITHDRAWAL,
    BET_PLACED,
    BET_WON,
    BONUS_CREDIT
}

enum class TransactionStatus {
    PENDING,
    SUCCESS,
    FAILED,
    REJECTED
}

data class Transaction(
    val id: String,
    val userId: String,
    val type: TransactionType,
    val amount: Double,
    val status: TransactionStatus,
    val createdAt: Long,
    val referenceId: String? = null,
    val clientRequestId: String? = null
)
