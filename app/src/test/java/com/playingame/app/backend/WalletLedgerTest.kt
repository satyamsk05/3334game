package com.playingame.app.backend

import com.playingame.app.data.wallet.WalletLedger
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
        assertEquals(50000L, balance.depositChips)
        assertEquals(125000L, balance.winningChips)
        assertEquals(10000L, balance.bonusChips)
        assertEquals(185000L, balance.totalChips)

        // Backward compatibility properties
        assertEquals(50000L, balance.depositPaise)
        assertEquals(125000L, balance.winningPaise)
        assertEquals(10000L, balance.bonusPaise)
        assertEquals(185000L, balance.totalPaise)
    }

    @Test
    fun testBetDebitOrderDepositFirst() {
        // Bet 20000 chips -> should draw entirely from deposit (50000 -> 30000)
        val debit = WalletLedger.placeBet(20000L)
        assertTrue(debit.success)
        assertEquals(20000L, debit.depositDebited)
        assertEquals(0L, debit.winningDebited)
        assertEquals(0L, debit.bonusDebited)

        val newBalance = WalletLedger.walletBalance.value
        assertEquals(30000L, newBalance.depositChips)
        assertEquals(125000L, newBalance.winningChips)
        assertEquals(10000L, newBalance.bonusChips)
    }

    @Test
    fun testRefundRestoresExactBuckets() {
        val debit = WalletLedger.placeBet(20000L)
        assertTrue(debit.success)

        // Clear bet -> refund depositDebited, winningDebited, bonusDebited
        WalletLedger.refundBet(debit.depositDebited, debit.winningDebited, debit.bonusDebited)

        val restoredBalance = WalletLedger.walletBalance.value
        assertEquals(50000L, restoredBalance.depositChips)
        assertEquals(125000L, restoredBalance.winningChips)
        assertEquals(10000L, restoredBalance.bonusChips)
    }

    @Test
    fun testWinsCreditWinningsOnly() {
        WalletLedger.creditWin(5000L, "30x")
        val balance = WalletLedger.walletBalance.value
        assertEquals(50000L, balance.depositChips)
        assertEquals(130000L, balance.winningChips) // 125000 + 5000 = 130000
        assertEquals(10000L, balance.bonusChips)
    }

    @Test
    fun testWithdrawalValidatesMinRuleAndWinnings() {
        // Attempt withdrawal below min 2500 chips
        val lowRes = WalletLedger.requestWithdrawal(1000L, "user@upi")
        assertFalse(lowRes.first)

        // Valid withdrawal 50000 chips
        val validRes = WalletLedger.requestWithdrawal(50000L, "user@upi")
        assertTrue(validRes.first)
        assertEquals(75000L, WalletLedger.walletBalance.value.winningChips) // 125000 - 50000 = 75000
    }
}
