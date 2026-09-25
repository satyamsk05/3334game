package com.example.app334.backend

import com.example.app334.game.ringoffuture.backend.WalletLedger
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test

class WalletLedgerTest {

    @Before
    fun setup() {
        WalletLedger.setTestBalance(50000L, 125000L, 10000L)
    }

    @Test
    fun testInitialBalanceBucketsSum() {
        val balance = WalletLedger.walletBalance.value
        assertEquals(50000L, balance.depositPaise)  // ₹500
        assertEquals(125000L, balance.winningPaise) // ₹1250
        assertEquals(10000L, balance.bonusPaise)    // ₹100
        assertEquals(185000L, balance.totalPaise)   // ₹1850
    }

    @Test
    fun testBetDebitOrderDepositFirst() {
        // Bet 20000 paise (₹200) -> should draw entirely from deposit (50000 -> 30000)
        val debit = WalletLedger.placeBet(20000L)
        assertTrue(debit.success)
        assertEquals(20000L, debit.depositDebited)
        assertEquals(0L, debit.winningDebited)
        assertEquals(0L, debit.bonusDebited)

        val newBalance = WalletLedger.walletBalance.value
        assertEquals(30000L, newBalance.depositPaise)
        assertEquals(125000L, newBalance.winningPaise)
        assertEquals(10000L, newBalance.bonusPaise)
    }

    @Test
    fun testRefundRestoresExactBuckets() {
        val debit = WalletLedger.placeBet(20000L)
        assertTrue(debit.success)

        // Clear bet -> refund depositDebited, winningDebited, bonusDebited
        WalletLedger.refundBet(debit.depositDebited, debit.winningDebited, debit.bonusDebited)

        val restoredBalance = WalletLedger.walletBalance.value
        assertEquals(50000L, restoredBalance.depositPaise)
        assertEquals(125000L, restoredBalance.winningPaise)
        assertEquals(10000L, restoredBalance.bonusPaise)
    }

    @Test
    fun testWinsCreditWinningsOnly() {
        WalletLedger.creditWin(5000L, "30x") // ₹50
        val balance = WalletLedger.walletBalance.value
        assertEquals(50000L, balance.depositPaise)
        assertEquals(130000L, balance.winningPaise) // 125000 + 5000 = 130000 (₹1300)
        assertEquals(10000L, balance.bonusPaise)
    }

    @Test
    fun testWithdrawalValidatesMinRuleAndWinnings() {
        // Attempt withdrawal below min ₹25 (2500 paise)
        val lowRes = WalletLedger.requestWithdrawal(1000L, "user@upi")
        assertFalse(lowRes.first)

        // Valid withdrawal ₹500 (50000 paise)
        val validRes = WalletLedger.requestWithdrawal(50000L, "user@upi")
        assertTrue(validRes.first)
        assertEquals(75000L, WalletLedger.walletBalance.value.winningPaise) // 125000 - 50000 = 75000
    }
}
