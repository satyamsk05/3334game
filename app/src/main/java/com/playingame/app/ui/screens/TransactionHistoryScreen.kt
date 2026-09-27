package com.playingame.app.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.game.ringoffuture.backend.TransactionStatus
import com.playingame.app.game.ringoffuture.backend.TransactionType
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.game.ringoffuture.backend.WalletTransaction
import com.playingame.app.ui.theme.RubikFont
import java.text.SimpleDateFormat
import java.util.*

enum class TransactionFilterCategory(val label: String) {
    ALL("All"),
    DEPOSITS("Deposits"),
    WITHDRAWALS("Withdrawals"),
    BETS("Game Bets"),
    WINNINGS("Wins & Refunds")
}

@Composable
fun TransactionHistoryScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    LaunchedEffect(Unit) {
        com.playingame.app.data.remote.WalletSyncService.fetchTransactions()
    }

    var selectedFilter by remember { mutableStateOf(TransactionFilterCategory.ALL) }
    val transactionsState by WalletLedger.transactions.collectAsState()
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    var selectedTxnForDetail by remember { mutableStateOf<WalletTransaction?>(null) }

    val filteredTransactions = remember(selectedFilter, transactionsState) {
        when (selectedFilter) {
            TransactionFilterCategory.ALL -> transactionsState
            TransactionFilterCategory.DEPOSITS -> transactionsState.filter { it.type == TransactionType.DEPOSIT }
            TransactionFilterCategory.WITHDRAWALS -> transactionsState.filter { it.type == TransactionType.WITHDRAWAL }
            TransactionFilterCategory.BETS -> transactionsState.filter { it.type == TransactionType.BET_PLACED }
            TransactionFilterCategory.WINNINGS -> transactionsState.filter { 
                it.type == TransactionType.WIN_PAYOUT || it.type == TransactionType.BET_REFUND 
            }
        }
    }

    // Group transactions by formatted date string ("Today", "Yesterday", "27 Sep 2026")
    val groupedTransactions = remember(filteredTransactions) {
        val todayCalendar = Calendar.getInstance()
        val yesterdayCalendar = Calendar.getInstance().apply { add(Calendar.DAY_OF_YEAR, -1) }
        val sdfDate = SimpleDateFormat("dd MMM yyyy", Locale.getDefault())
        val sdfDay = SimpleDateFormat("yyyyMMdd", Locale.getDefault())

        val todayKey = sdfDay.format(todayCalendar.time)
        val yesterdayKey = sdfDay.format(yesterdayCalendar.time)

        filteredTransactions.groupBy { txn ->
            val txnDate = Date(txn.timestamp)
            val txnKey = sdfDay.format(txnDate)
            when (txnKey) {
                todayKey -> "Today"
                yesterdayKey -> "Yesterday"
                else -> sdfDate.format(txnDate)
            }
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0C0C12))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            // Top App Bar
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 46.dp, bottom = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF1C1C28))
                            .border(1.dp, Color(0xFF2E2E40), CircleShape)
                            .clickable { onBackClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_arrow_back),
                            contentDescription = "Back",
                            modifier = Modifier.size(18.dp),
                            tint = Color.White
                        )
                    }

                    Column {
                        Text(
                            text = "Passbook & History",
                            fontSize = 20.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "All debits, credits & refunds",
                            fontSize = 11.5.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                }

                // Balance summary badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF181826))
                        .border(1.dp, Color(0xFF10B981).copy(alpha = 0.3f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = walletBalance.formattedTotal,
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF34D399)
                    )
                }
            }

            // Filter Category Tabs
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 14.dp)
            ) {
                items(TransactionFilterCategory.entries.toTypedArray()) { filter ->
                    val isSelected = filter == selectedFilter
                    val count = when (filter) {
                        TransactionFilterCategory.ALL -> transactionsState.size
                        TransactionFilterCategory.DEPOSITS -> transactionsState.count { it.type == TransactionType.DEPOSIT }
                        TransactionFilterCategory.WITHDRAWALS -> transactionsState.count { it.type == TransactionType.WITHDRAWAL }
                        TransactionFilterCategory.BETS -> transactionsState.count { it.type == TransactionType.BET_PLACED }
                        TransactionFilterCategory.WINNINGS -> transactionsState.count { 
                            it.type == TransactionType.WIN_PAYOUT || it.type == TransactionType.BET_REFUND 
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(
                                if (isSelected) Color(0xFF10B981) else Color(0xFF161622)
                            )
                            .border(
                                1.dp,
                                if (isSelected) Color(0xFF34D399) else Color(0xFF242436),
                                RoundedCornerShape(20.dp)
                            )
                            .clickable { selectedFilter = filter }
                            .padding(horizontal = 14.dp, vertical = 7.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = filter.label,
                                fontSize = 12.sp,
                                fontFamily = RubikFont,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                color = Color.White
                            )
                            if (count > 0) {
                                Box(
                                    modifier = Modifier
                                        .clip(CircleShape)
                                        .background(
                                            if (isSelected) Color.Black.copy(alpha = 0.25f) else Color(0xFF28283C)
                                        )
                                        .padding(horizontal = 6.dp, vertical = 1.dp)
                                ) {
                                    Text(
                                        text = count.toString(),
                                        fontSize = 10.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White else Color(0xFF9CA3AF)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // Transaction List Content
            if (filteredTransactions.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF161624)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_history),
                                contentDescription = "Empty",
                                tint = Color(0xFF6B7280),
                                modifier = Modifier.size(28.dp)
                            )
                        }

                        Text(
                            text = "No Transactions Found",
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE5E7EB)
                        )
                        Text(
                            text = "Transactions under '${selectedFilter.label}' will appear here.",
                            fontSize = 12.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(bottom = 32.dp)
                ) {
                    groupedTransactions.forEach { (dateGroup, txns) ->
                        item {
                            Text(
                                text = dateGroup.uppercase(),
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF6B7280),
                                modifier = Modifier.padding(top = 10.dp, bottom = 4.dp, start = 4.dp)
                            )
                        }

                        items(txns, key = { it.id }) { txn ->
                            CleanSleekTransactionCard(
                                txn = txn,
                                onClick = { selectedTxnForDetail = txn }
                            )
                        }
                    }
                }
            }
        }

        // Transaction Detail Modal
        selectedTxnForDetail?.let { txn ->
            TransactionDetailDialog(
                txn = txn,
                onDismiss = { selectedTxnForDetail = null }
            )
        }
    }
}

@Composable
private fun CleanSleekTransactionCard(
    txn: WalletTransaction,
    onClick: () -> Unit
) {
    val timeStr = remember(txn.timestamp) {
        val sdf = SimpleDateFormat("hh:mm a", Locale.getDefault())
        sdf.format(Date(txn.timestamp))
    }

    val isPositive = txn.type == TransactionType.DEPOSIT || 
                     txn.type == TransactionType.WIN_PAYOUT || 
                     txn.type == TransactionType.BET_REFUND

    val amountPrefix = if (isPositive) "+ ₹" else "- ₹"
    val amountColor = if (isPositive) Color(0xFF10B981) else Color(0xFFEF4444)

    // Crisp dedicated vector icons & circular badge colors
    val (iconRes, iconTint, badgeBg) = when (txn.type) {
        TransactionType.DEPOSIT -> Triple(
            R.drawable.ic_wallet,
            Color(0xFF10B981),
            Color(0xFF064E3B).copy(alpha = 0.35f)
        )
        TransactionType.WITHDRAWAL -> Triple(
            R.drawable.ic_settings_withdraw,
            Color(0xFFEF4444),
            Color(0xFF450A0A).copy(alpha = 0.35f)
        )
        TransactionType.BET_PLACED -> Triple(
            R.drawable.ic_txn_bet,
            Color(0xFFF59E0B),
            Color(0xFF451A03).copy(alpha = 0.35f)
        )
        TransactionType.WIN_PAYOUT -> Triple(
            R.drawable.ic_txn_win,
            Color(0xFFFBBF24),
            Color(0xFF78350F).copy(alpha = 0.35f)
        )
        TransactionType.BET_REFUND -> Triple(
            R.drawable.ic_txn_refund,
            Color(0xFF38BDF8),
            Color(0xFF0C4A6E).copy(alpha = 0.35f)
        )
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF14141E))
            .border(1.dp, Color(0xFF20202E), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(horizontal = 14.dp, vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left Circle Vector Icon + Details
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Sleek borderless circular badge
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(badgeBg),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = txn.type.name,
                        tint = iconTint,
                        modifier = Modifier.size(20.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = txn.description,
                        fontSize = 13.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = timeStr,
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )

                        Text(
                            text = "•",
                            fontSize = 11.sp,
                            color = Color(0xFF4B5563)
                        )

                        val shortRef = if (txn.referenceId.length > 14) {
                            txn.referenceId.take(6) + "..." + txn.referenceId.takeLast(4)
                        } else txn.referenceId

                        Text(
                            text = shortRef,
                            fontSize = 10.5.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF6B7280)
                        )
                    }
                }
            }

            // Right Amount + Net Balance
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "$amountPrefix${String.format(Locale.getDefault(), "%.2f", txn.amountRupees)}",
                    fontSize = 15.5.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.ExtraBold,
                    color = amountColor
                )

                Spacer(modifier = Modifier.height(3.dp))

                if (txn.status != TransactionStatus.SUCCESS) {
                    val (statusBg, statusTxt) = when (txn.status) {
                        TransactionStatus.PENDING -> Pair(Color(0xFF78350F), Color(0xFFFBBF24))
                        TransactionStatus.PROCESSING -> Pair(Color(0xFF0C4A6E), Color(0xFF38BDF8))
                        else -> Pair(Color(0xFF7F1D1D), Color(0xFFF87171))
                    }
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(statusBg)
                            .padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = txn.status.name,
                            fontSize = 9.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = statusTxt
                        )
                    }
                } else if (txn.balanceAfterPaise > 0) {
                    Text(
                        text = "Bal: ₹${String.format(Locale.getDefault(), "%.2f", txn.balanceAfterPaise / 100.0)}",
                        fontSize = 10.5.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF6B7280)
                    )
                }
            }
        }
    }
}

@Composable
private fun TransactionDetailDialog(
    txn: WalletTransaction,
    onDismiss: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }

    val fullDateStr = remember(txn.timestamp) {
        val sdf = SimpleDateFormat("dd MMMM yyyy, hh:mm:ss a", Locale.getDefault())
        sdf.format(Date(txn.timestamp))
    }

    val isPositive = txn.type == TransactionType.DEPOSIT || 
                     txn.type == TransactionType.WIN_PAYOUT || 
                     txn.type == TransactionType.BET_REFUND

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = Color(0xFF14141E),
        shape = RoundedCornerShape(20.dp),
        title = {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = txn.description,
                    fontSize = 15.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    modifier = Modifier.padding(bottom = 6.dp)
                )

                Text(
                    text = (if (isPositive) "+ ₹" else "- ₹") + String.format(Locale.getDefault(), "%.2f", txn.amountRupees),
                    fontSize = 24.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black,
                    color = if (isPositive) Color(0xFF10B981) else Color(0xFFEF4444)
                )
            }
        },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                HorizontalDivider(color = Color(0xFF262636))

                DetailRow(label = "Status", value = txn.status.name, isHighlight = true)
                DetailRow(label = "Date & Time", value = fullDateStr)
                DetailRow(label = "Category", value = txn.type.name)

                if (txn.balanceAfterPaise > 0) {
                    DetailRow(
                        label = "Balance After",
                        value = "₹${String.format(Locale.getDefault(), "%.2f", txn.balanceAfterPaise / 100.0)}"
                    )
                }

                // Reference ID with 1-click copy
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF1A1A28))
                        .clickable {
                            clipboardManager.setText(AnnotatedString(txn.referenceId))
                            isCopied = true
                        }
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Reference ID",
                            fontSize = 10.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )
                        Text(
                            text = txn.referenceId,
                            fontSize = 11.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium,
                            color = Color.White
                        )
                    }

                    Text(
                        text = if (isCopied) "COPIED" else "TAP TO COPY",
                        fontSize = 10.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = if (isCopied) Color(0xFF10B981) else Color(0xFF60A5FA)
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Close",
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }
    )
}

@Composable
private fun DetailRow(label: String, value: String, isHighlight: Boolean = false) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontFamily = RubikFont,
            color = Color(0xFF9CA3AF)
        )
        Text(
            text = value,
            fontSize = 12.5.sp,
            fontFamily = RubikFont,
            fontWeight = if (isHighlight) FontWeight.Bold else FontWeight.Normal,
            color = if (isHighlight) Color(0xFF34D399) else Color.White
        )
    }
}
