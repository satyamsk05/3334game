package com.example.app334.data.repository

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

data class TransactionRecord(
    val id: String,
    val type: String,
    val amountPaise: Long,
    val balanceAfterPaise: Long,
    val status: String,
    val referenceId: String,
    val description: String,
    val timestamp: Long
)

object TransactionRepository {
    private val _transactions = MutableStateFlow<List<TransactionRecord>>(emptyList())
    val transactions: StateFlow<List<TransactionRecord>> = _transactions.asStateFlow()

    fun addTransaction(type: String, amountPaise: Long, balanceAfter: Long, refId: String, desc: String) {
        val record = TransactionRecord(
            id = "TX-${System.currentTimeMillis()}",
            type = type,
            amountPaise = amountPaise,
            balanceAfterPaise = balanceAfter,
            status = "SUCCESS",
            referenceId = refId,
            description = desc,
            timestamp = System.currentTimeMillis()
        )
        _transactions.value = listOf(record) + _transactions.value
    }
}
