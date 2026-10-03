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
import androidx.compose.ui.draw.rotate
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

private val TransactionDateFormatter = object : ThreadLocal<SimpleDateFormat>() {
    override fun initialValue(): SimpleDateFormat {
        return SimpleDateFormat("dd MMM, hh:mm a", Locale.getDefault())
    }
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
    var expandedTxnId by remember { mutableStateOf<String?>(null) }

    val filteredTransactions = remember(selectedFilter, transactionsState) {
        val base = when (selectedFilter) {
            TransactionFilterCategory.ALL -> transactionsState
            TransactionFilterCategory.DEPOSITS -> transactionsState.filter { it.type == TransactionType.DEPOSIT }
            TransactionFilterCategory.WITHDRAWALS -> transactionsState.filter { it.type == TransactionType.WITHDRAWAL }
            TransactionFilterCategory.BETS -> transactionsState.filter { it.type == TransactionType.BET_PLACED }
            TransactionFilterCategory.WINNINGS -> transactionsState.filter { 
                it.type == TransactionType.WIN_PAYOUT || it.type == TransactionType.BET_REFUND 
            }
        }

        val consolidated = mutableListOf<WalletTransaction>()
        val seenBets = mutableMapOf<String, Int>()

        for (tx in base) {
            if (tx.type == TransactionType.BET_PLACED) {
                val roundKey = if (tx.referenceId.startsWith("BET-ROF-")) {
                    tx.referenceId.split("-").take(3).joinToString("-")
                } else if (tx.description.contains("Ring of Future", ignoreCase = true) || tx.description.contains("Round", ignoreCase = true)) {
                    // Group same-minute Ring of Future bets if no explicit round id in ref
                    val minute = tx.timestamp / 60000L
                    "ROF-$minute"
                } else {
                    null
                }

                if (roundKey != null) {
                    if (seenBets.containsKey(roundKey)) {
                        val idx = seenBets[roundKey]!!
                        val existing = consolidated[idx]
                        consolidated[idx] = existing.copy(
                            amountPaise = existing.amountPaise + tx.amountPaise,
                            balanceAfterPaise = minOf(existing.balanceAfterPaise, tx.balanceAfterPaise)
                        )
                    } else {
                        seenBets[roundKey] = consolidated.size
                        consolidated.add(tx)
                    }
                } else {
                    consolidated.add(tx)
                }
            } else {
                consolidated.add(tx)
            }
        }
        consolidated
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
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
                    .padding(top = 46.dp, bottom = 16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF0F1015))
                            .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(10.dp))
                            .clickable { onBackClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_arrow_back),
                            contentDescription = "Back",
                            modifier = Modifier.size(20.dp),
                            tint = Color.White
                        )
                    }

                    Column {
                        Text(
                            text = "Transaction History",
                            fontSize = 20.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "All wallet passbook records",
                            fontSize = 11.5.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF8E899B)
                        )
                    }
                }

                // Balance summary
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(Color(0xFF0F1015))
                        .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(20.dp))
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = walletBalance.formattedTotal,
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E676)
                    )
                }
            }

            // Filter Category Tabs
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(bottom = 12.dp)
            ) {
                items(TransactionFilterCategory.entries.toTypedArray()) { filter ->
                    val isSelected = filter == selectedFilter
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(20.dp))
                            .background(if (isSelected) Color(0xFF161922) else Color(0xFF0F1015))
                            .border(
                                1.dp,
                                if (isSelected) Color(0xFFFFB800) else Color(0xFF1E2028),
                                RoundedCornerShape(20.dp)
                            )
                            .clickable { selectedFilter = filter }
                            .padding(horizontal = 14.dp, vertical = 7.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = filter.label,
                            fontSize = 12.sp,
                            fontFamily = RubikFont,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                            color = if (isSelected) Color(0xFFFFB800) else Color(0xFF9CA3AF)
                        )
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
                        Icon(
                            painter = painterResource(id = R.drawable.ic_rush_refund),
                            contentDescription = "Empty",
                            tint = Color(0xFF6B7280),
                            modifier = Modifier.size(36.dp)
                        )

                        Text(
                            text = "No Transactions Found",
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE5E7EB)
                        )
                        Text(
                            text = "Your game entries, winnings and refunds will appear here.",
                            fontSize = 12.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )
                    }
                }
            } else {
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    contentPadding = PaddingValues(bottom = 32.dp)
                ) {
                    items(filteredTransactions, key = { it.id }) { txn ->
                        val isExpanded = expandedTxnId == txn.id
                        RushStyleTransactionRow(
                            txn = txn,
                            isExpanded = isExpanded,
                            onToggle = {
                                expandedTxnId = if (isExpanded) null else txn.id
                            }
                        )
                        HorizontalDivider(
                            color = Color(0xFF1E2028),
                            thickness = 1.dp
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun RushStyleTransactionRow(
    txn: WalletTransaction,
    isExpanded: Boolean,
    onToggle: () -> Unit
) {
    val clipboardManager = LocalClipboardManager.current
    var isCopied by remember { mutableStateOf(false) }

    val dateStr = remember(txn.timestamp) {
        TransactionDateFormatter.get()?.format(Date(txn.timestamp)) ?: ""
    }

    val isPositive = txn.type == TransactionType.DEPOSIT || 
                     txn.type == TransactionType.WIN_PAYOUT || 
                     txn.type == TransactionType.BET_REFUND

    val amountPrefix = if (isPositive) "+ " else "- "
    val amountColor = if (isPositive) Color(0xFF00E676) else Color.White

    // Clean Line-Art Vector Icon (NO colored box, NO background square, NO tint block)
    val iconRes = when (txn.type) {
        TransactionType.DEPOSIT -> R.drawable.ic_rush_deposit
        TransactionType.WITHDRAWAL -> R.drawable.ic_settings_withdraw
        TransactionType.BET_PLACED -> R.drawable.ic_rush_ticket
        TransactionType.WIN_PAYOUT -> R.drawable.ic_rush_trophy
        TransactionType.BET_REFUND -> R.drawable.ic_rush_refund
    }

    // Clean human title (e.g. "Entry Fee : XO Battle", "Refund : XO Battle", "Cash Deposited")
    val titleText = when {
        txn.type == TransactionType.BET_REFUND -> {
            if (txn.description.contains("XO", ignoreCase = true)) "Refund : XO Battle"
            else "Refund : Game Bet"
        }
        txn.type == TransactionType.BET_PLACED -> {
            if (txn.description.contains("XO", ignoreCase = true)) "Entry Fee : XO Battle"
            else "Entry Fee : Ring of Future"
        }
        txn.type == TransactionType.WIN_PAYOUT -> {
            if (txn.description.contains("XO", ignoreCase = true)) "Won : XO Battle"
            else "Won : Ring of Future"
        }
        txn.type == TransactionType.DEPOSIT -> "Cash Deposited"
        txn.type == TransactionType.WITHDRAWAL -> "Cash Withdrawn"
        else -> txn.description
    }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onToggle() }
            .padding(vertical = 14.dp, horizontal = 4.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left: Clean Vector Icon (No Background Box) + Text
            Row(
                modifier = Modifier.weight(1f),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = txn.type.name,
                    tint = Color.White,
                    modifier = Modifier.size(24.dp)
                )

                Column {
                    Text(
                        text = titleText,
                        fontSize = 15.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(3.dp))

                    Text(
                        text = dateStr,
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF8E899B)
                    )
                }
            }

            // Right: Amount + Chevron Dropdown
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

                Icon(
                    painter = painterResource(id = R.drawable.ic_rush_chevron_down),
                    contentDescription = "Expand details",
                    tint = Color(0xFF8E899B),
                    modifier = Modifier
                        .size(16.dp)
                        .rotate(if (isExpanded) 180f else 0f)
                )
            }
        }

        // Expandable Detail Tray
        AnimatedVisibility(
            visible = isExpanded,
            enter = expandVertically() + fadeIn(),
            exit = shrinkVertically() + fadeOut()
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 12.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF161922))
                    .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(text = "Status", fontSize = 12.sp, fontFamily = RubikFont, color = Color(0xFF8E899B))
                    Text(text = txn.status.name, fontSize = 12.sp, fontFamily = RubikFont, fontWeight = FontWeight.Bold, color = Color(0xFF00E676))
                }

                if (txn.balanceAfterPaise > 0) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(text = "Wallet Balance After", fontSize = 12.sp, fontFamily = RubikFont, color = Color(0xFF8E899B))
                        Text(text = String.format(Locale.getDefault(), "%.2f", txn.balanceAfterPaise / 100.0), fontSize = 12.sp, fontFamily = RubikFont, fontWeight = FontWeight.Bold, color = Color.White)
                    }
                }

                // Reference ID with Copy Button
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF0F1015))
                        .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(8.dp))
                        .clickable {
                            clipboardManager.setText(AnnotatedString(txn.referenceId))
                            isCopied = true
                        }
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Ref: ${txn.referenceId}",
                        fontSize = 11.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFFE5E7EB)
                    )
                    Text(
                        text = if (isCopied) "COPIED" else "COPY",
                        fontSize = 10.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = if (isCopied) Color(0xFF00E676) else Color(0xFFFFB800)
                    )
                }
            }
        }
    }
}
