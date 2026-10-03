package com.playingame.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.playingame.app.R
import com.playingame.app.ui.theme.RubikFont

data class IssueTicket(
    val ticketId: String,
    val subject: String,
    val category: String,
    val date: String,
    val status: String
)

@Composable
fun ReportedIssuesScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val sampleTickets = remember {
        listOf(
            IssueTicket("TCK-8821", "Payment deducted but wallet not updated", "Deposit Issue", "12 Sep 2026", "RESOLVED"),
            IssueTicket("TCK-9014", "Withdrawal processing delay", "Withdrawal Issue", "14 Sep 2026", "IN PROGRESS")
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
            .padding(horizontal = 16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 12.dp, bottom = 16.dp),
            verticalAlignment = Alignment.CenterVertically
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

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = "My Reported Issues",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        if (sampleTickets.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No reported issues found",
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
                items(sampleTickets, key = { it.ticketId }) { ticket ->
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFF0F1015))
                            .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                            .padding(16.dp)
                    ) {
                        Column {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = ticket.ticketId,
                                    fontSize = 13.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFFFFB800)
                                )

                                val isResolved = ticket.status == "RESOLVED"
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isResolved) Color(0xFF00E676).copy(alpha = 0.15f) else Color(0xFFFFB800).copy(alpha = 0.15f))
                                        .border(1.dp, if (isResolved) Color(0xFF00E676).copy(alpha = 0.4f) else Color(0xFFFFB800).copy(alpha = 0.4f), RoundedCornerShape(6.dp))
                                        .padding(horizontal = 8.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = ticket.status,
                                        fontSize = 10.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isResolved) Color(0xFF00E676) else Color(0xFFFFB800)
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Text(
                                text = ticket.subject,
                                fontSize = 15.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )

                            Spacer(modifier = Modifier.height(6.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = ticket.category,
                                    fontSize = 12.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF9CA3AF)
                                )
                                Text(
                                    text = ticket.date,
                                    fontSize = 12.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF6B7280)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
