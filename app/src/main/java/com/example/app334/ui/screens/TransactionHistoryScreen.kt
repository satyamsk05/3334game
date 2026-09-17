package com.example.app334.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.TransactionType
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.ringoffuture.backend.WalletTransaction
import com.example.app334.ui.theme.RubikFont
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

enum class TransactionFilterCategory {
    ALL, DEPOSITS, WITHDRAWALS, WINNINGS
}

@Composable
fun TransactionHistoryScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    var selectedFilter by remember { mutableStateOf(TransactionFilterCategory.ALL) }
    val transactionsState by WalletLedger.transactions.collectAsState()

    val filteredTransactions = remember(selectedFilter, transactionsState) {
        when (selectedFilter) {
            TransactionFilterCategory.ALL -> transactionsState
            TransactionFilterCategory.DEPOSITS -> transactionsState.filter { it.type == TransactionType.DEPOSIT }
            TransactionFilterCategory.WITHDRAWALS -> transactionsState.filter { it.type == TransactionType.WITHDRAWAL }
            TransactionFilterCategory.WINNINGS -> transactionsState.filter { it.type == TransactionType.WIN_PAYOUT }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF15001F))
            .padding(horizontal = 16.dp)
    ) {
        // Top Header Row with Back Button
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp, bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color(0xFF240E38))
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

            Spacer(modifier = Modifier.width(14.dp))

            Text(
                text = "Transaction History",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // Filter Pills
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            modifier = Modifier.padding(bottom = 16.dp)
        ) {
            items(TransactionFilterCategory.entries.toTypedArray()) { filter ->
                val isSelected = filter == selectedFilter
                val filterText = when (filter) {
                    TransactionFilterCategory.ALL -> "All"
                    TransactionFilterCategory.DEPOSITS -> "Deposits"
                    TransactionFilterCategory.WITHDRAWALS -> "Withdrawals"
                    TransactionFilterCategory.WINNINGS -> "Winnings"
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(if (isSelected) Color(0xFF7C3AED) else Color(0xFF240E38))
                        .border(1.dp, if (isSelected) Color(0xFFA78BFA) else Color(0xFF4C206D), RoundedCornerShape(20.dp))
                        .clickable { selectedFilter = filter }
                        .padding(horizontal = 16.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = filterText,
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = Color.White
                    )
                }
            }
        }

        // Transaction List
        if (filteredTransactions.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No transactions found",
                    fontSize = 15.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF9CA3AF)
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 30.dp)
            ) {
                items(filteredTransactions, key = { it.id }) { txn ->
                    TransactionCardItem(txn = txn)
                }
            }
        }
    }
}

@Composable
private fun TransactionCardItem(txn: WalletTransaction) {
    val dateStr = remember(txn.timestamp) {
        val sdf = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
        sdf.format(Date(txn.timestamp))
    }

    val isPositive = txn.type != TransactionType.WITHDRAWAL && txn.type != TransactionType.BET_PLACED

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF1E0A30))
            .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(14.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = txn.description,
                    fontSize = 15.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = dateStr,
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF9CA3AF)
                )

                Spacer(modifier = Modifier.height(2.dp))

                Text(
                    text = "Ref: ${txn.referenceId}",
                    fontSize = 11.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF6B7280)
                )
            }

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = txn.amountRupeesFormatted,
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.ExtraBold,
                    color = if (isPositive) Color(0xFF10B981) else Color(0xFFEF4444)
                )

                Spacer(modifier = Modifier.height(6.dp))

                val statusBg = when (txn.status.name) {
                    "SUCCESS" -> Color(0xFF065F46)
                    "PENDING" -> Color(0xFF92400E)
                    else -> Color(0xFF991B1B)
                }
                val statusTxt = when (txn.status.name) {
                    "SUCCESS" -> Color(0xFF34D399)
                    "PENDING" -> Color(0xFFFBBF24)
                    else -> Color(0xFFFCA5A5)
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = txn.status.name,
                        fontSize = 10.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = statusTxt
                    )
                }
            }
        }
    }
}
