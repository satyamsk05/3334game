package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.ui.theme.RubikFont

import kotlinx.coroutines.launch
import com.playingame.app.data.remote.WalletSyncService

@Composable
fun WithdrawDetailsScreen(
    withdrawAmount: String = "500",
    onBackClick: () -> Unit = {},
    onCompleteWithdrawal: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var upiId by remember { mutableStateOf("user@upi") }
    var showEditUpiDialog by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    val amountNum = withdrawAmount.toDoubleOrNull() ?: 500.0
    val upiFee = (amountNum * 0.02).coerceAtMost(10.0) // 2% fee max 10
    val finalNet = (amountNum - upiFee).coerceAtLeast(0.0)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // 1. Top Header Row: Back Arrow + "Withdraw Summary"
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp, bottom = 10.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF0F1015))
                    .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(10.dp))
                    .align(Alignment.CenterStart)
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

            Text(
                text = "Withdraw Summary",
                fontSize = 20.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        // 2. You Are Withdrawing Summary Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF0F1015))
                .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                .padding(vertical = 18.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
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
                    text = "₹${withdrawAmount.ifEmpty { "500" }}",
                    fontSize = 36.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White
                )
            }
        }

        // 3. Option Card: Withdraw via UPI
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF0F1015))
                .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(20.dp))
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
                        text = "Edit UPI ID",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFFB800),
                        textDecoration = TextDecoration.Underline,
                        modifier = Modifier.clickable { showEditUpiDialog = true }
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Processing Fee",
                        fontSize = 13.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF8E899B)
                    )
                    Text(
                        text = "- ₹${String.format("%.2f", upiFee)}",
                        fontSize = 14.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
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
                        color = Color(0xFF8E899B)
                    )
                    Text(
                        text = "- ₹0.00",
                        fontSize = 14.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                HorizontalDivider(color = Color(0xFF1E2028), thickness = 1.dp)

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
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF161922))
                                .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(8.dp)),
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
                                text = upiId,
                                fontSize = 11.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF8E899B)
                            )
                        }
                    }

                    // Get Action Button (Amber Gold matching WalletScreen Withdraw)
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0xFFFFB800),
                                        Color(0xFFFF9100)
                                    )
                                )
                            )
                            .clickable(enabled = !isSubmitting) {
                                if (upiId.isBlank() || !upiId.contains("@")) {
                                    Toast.makeText(context, "Please enter a valid UPI ID", Toast.LENGTH_SHORT).show()
                                    return@clickable
                                }
                                isSubmitting = true
                                coroutineScope.launch {
                                    try {
                                        val result = WalletSyncService.requestWithdrawal(amountNum, upiId)
                                        Toast.makeText(context, result.second, Toast.LENGTH_SHORT).show()
                                        if (result.first) {
                                            onCompleteWithdrawal("UPI")
                                        }
                                    } catch (e: Exception) {
                                        Toast.makeText(context, "Withdrawal failed: ${e.message}", Toast.LENGTH_SHORT).show()
                                    } finally {
                                        isSubmitting = false
                                    }
                                }
                            }
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = Color(0xFF0A0C11),
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Get ₹${String.format("%.2f", finalNet)}",
                                fontSize = 14.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color(0xFF0A0C11)
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }

    // Edit UPI ID Dialog
    if (showEditUpiDialog) {
        var tempUpi by remember { mutableStateOf(upiId) }
        AlertDialog(
            onDismissRequest = { showEditUpiDialog = false },
            containerColor = Color(0xFF0F1015),
            titleContentColor = Color.White,
            textContentColor = Color(0xFF8E899B),
            title = { Text("Edit UPI ID", fontWeight = FontWeight.Bold, fontFamily = RubikFont) },
            text = {
                OutlinedTextField(
                    value = tempUpi,
                    onValueChange = { tempUpi = it },
                    label = { Text("Enter UPI ID", color = Color(0xFF8E899B)) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedContainerColor = Color(0xFF161922),
                        unfocusedContainerColor = Color(0xFF161922),
                        focusedBorderColor = Color(0xFFFFB800),
                        unfocusedBorderColor = Color(0xFF282E3E),
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White
                    )
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (tempUpi.contains("@")) {
                            upiId = tempUpi
                            showEditUpiDialog = false
                        } else {
                            Toast.makeText(context, "Invalid UPI ID format", Toast.LENGTH_SHORT).show()
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFB800))
                ) {
                    Text("SAVE", color = Color(0xFF0A0C11), fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditUpiDialog = false }) {
                    Text("CANCEL", color = Color(0xFF8E899B))
                }
            }
        )
    }
}
