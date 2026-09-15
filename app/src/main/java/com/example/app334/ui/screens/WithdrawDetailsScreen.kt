package com.example.app334.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

@Composable
fun WithdrawDetailsScreen(
    withdrawAmount: String = "30",
    onBackClick: () -> Unit = {},
    onCompleteWithdrawal: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val amountNum = withdrawAmount.toDoubleOrNull() ?: 30.0
    val upiFee = (amountNum * 0.03).coerceAtLeast(0.89)
    val finalNet = (amountNum - upiFee).coerceAtLeast(0.0)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F0417))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // 1. Top Header Row: Back Arrow + "Withdraw" + Language Badge
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp, bottom = 10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .align(Alignment.CenterStart)
                    .clickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(24.dp),
                    tint = Color.White
                )
            }

            Text(
                text = "Withdraw",
                fontSize = 20.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White,
                modifier = Modifier.align(Alignment.Center)
            )

            // Language Pill
            Box(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF6B42F2))
                    .clickable { /* Language */ }
                    .padding(horizontal = 12.dp, vertical = 6.dp),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "अ 💬",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        // 2. You Are Withdrawing Summary
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp, bottom = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "YOU ARE WITHDRAWING",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF8E899B),
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = "₹${withdrawAmount.ifEmpty { "30" }}",
                fontSize = 40.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White
            )
        }

        // 3. Option Card: Withdraw via UPI
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF220C38))
                .border(1.dp, Color(0xFF4C1D95), RoundedCornerShape(20.dp))
                .padding(18.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Withdraw via UPI",
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                    Text(
                        text = "✎ Edit UPI ID",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFB485FF),
                        textDecoration = TextDecoration.Underline,
                        modifier = Modifier.clickable { /* Edit UPI */ }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        Text(
                            text = "Withdrawal Fee",
                            fontSize = 13.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFFD1D5DB)
                        )
                        Text(
                            text = "ⓘ",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF8E899B)
                        )
                    }
                    Text(
                        text = "- ₹${String.format("%.2f", upiFee)}",
                        fontSize = 14.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD1D5DB)
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "TDS",
                        fontSize = 13.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFD1D5DB)
                    )
                    Text(
                        text = "- ₹0",
                        fontSize = 14.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD1D5DB)
                    )
                }

                HorizontalDivider(color = Color(0xFF38104F), thickness = 1.dp)

                // Bottom Action Box for UPI Withdrawal
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Colored UPI Triangle Badge Icon
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF1E0935)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "▲",
                                fontSize = 14.sp,
                                color = Color(0xFF00E676)
                            )
                        }

                        Column {
                            Text(
                                text = "UPI",
                                fontSize = 14.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                            Text(
                                text = "7646001480@upi",
                                fontSize = 11.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF9E97AA)
                            )
                        }
                    }

                    // Get ₹29.11 Action Button
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0xFF7C3AED),
                                        Color(0xFF6B42F2)
                                    )
                                )
                            )
                            .clickable { onCompleteWithdrawal("UPI") }
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Get ₹${String.format("%.2f", finalNet)}",
                            fontSize = 14.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}
