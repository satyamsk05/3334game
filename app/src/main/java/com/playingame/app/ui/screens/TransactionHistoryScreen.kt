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
            .background(Color(0xFF0D0D11))
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
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1E1E28))
                            .border(1.dp, Color(0xFF2E2E3E), RoundedCornerShape(12.dp))
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
                            text = "Verified wallet transactions",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                }

                // Balance summary pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF1E1E28))
                        .border(1.dp, Color(0xFF3B82F6).copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = walletBalance.formattedTotal,
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF60A5FA)
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
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                if (isSelected) Brush.horizontalGradient(
                                    listOf(Color(0xFF10B981), Color(0xFF059669))
                                ) else Brush.horizontalGradient(
                                    listOf(Color(0xFF181822), Color(0xFF181822))
                                )
                            )
                            .border(
                                1.dp,
                                if (isSelected) Color(0xFF34D399) else Color(0xFF262638),
                                RoundedCornerShape(12.dp)
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
                                            if (isSelected) Color.White.copy(alpha = 0.25f) else Color(0xFF2E2E40)
                                        )
                                        .padding(horizontal = 5.dp, vertical = 1.dp)
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
                                .background(Color(0xFF181824)),
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
                    verticalArrangement = Arrangement.spacedBy(10.dp),
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
                                modifier = Modifier.padding(top = 8.dp, bottom = 4.dp, start = 4.dp)
                            )
                        }

                        items(txns, key = { it.id }) { txn ->
                            ModernTransactionCard(
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
private fun ModernTransactionCard(
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

    // Contextual icon and background styling
    val (iconRes, iconTint, iconBg) = when (txn.type) {
        TransactionType.DEPOSIT -> Triple(R.drawable.ic_wallet, Color(0xFF34D399), Color(0xFF064E3B).copy(alpha = 0.6f))
        TransactionType.WITHDRAWAL -> Triple(R.drawable.ic_settings_withdraw, Color(0xFFF87171), Color(0xFF450A0A).copy(alpha = 0.6f))
        TransactionType.BET_PLACED -> {
            if (txn.description.contains("XO", ignoreCase = true)) {
                Triple(R.drawable.logo_classic_dice, Color(0xFFF59E0B), Color(0xFF451A03).copy(alpha = 0.6f))
            } else {
                Triple(R.drawable.logo_rings_of_future, Color(0xFF818CF8), Color(0xFF1E1B4B).copy(alpha = 0.6f))
            }
        }
        TransactionType.WIN_PAYOUT -> Triple(R.drawable.ic_vip_pro_crown, Color(0xFFFBBF24), Color(0xFF451A03).copy(alpha = 0.6f))
        TransactionType.BET_REFUND -> Triple(R.drawable.ic_history, Color(0xFF38BDF8), Color(0xFF082F49).copy(alpha = 0.6f))
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF14141E))
            .border(1.dp, Color(0xFF222232), RoundedCornerShape(16.dp))
            .clickable { onClick() }
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left Icon + Details
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(42.dp)
                        .clip(RoundedCornerShape(12.dp))
                        .background(iconBg)
                        .border(1.dp, iconTint.copy(alpha = 0.3f), RoundedCornerShape(12.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = iconRes),
                        contentDescription = txn.type.name,
                        tint = iconTint,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = txn.description,
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1
                    )

                    Spacer(modifier = Modifier.height(3.dp))

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = timeStr,
                            fontSize = 11.5.sp,
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

            // Right Amount + Status
            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "$amountPrefix${String.format(Locale.getDefault(), "%.2f", txn.amountRupees)}",
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.ExtraBold,
                    color = amountColor
                )

                Spacer(modifier = Modifier.height(4.dp))

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
                            fontSize = 9.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = statusTxt
                        )
                    }
                } else if (txn.balanceAfterPaise > 0) {
                    Text(
                        text = "Bal: ₹${String.format(Locale.getDefault(), "%.2f", txn.balanceAfterPaise / 100.0)}",
                        fontSize = 10.sp,
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
                    fontSize = 16.sp,
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
                Divider(color = Color(0xFF262636))

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
