package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import com.playingame.app.util.noRippleClickable
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
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.theme.*
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
    var upiId by remember { mutableStateOf("") }
    var isBound by remember { mutableStateOf(false) }
    var boundAccountNumber by remember { mutableStateOf("") }
    var boundIfsc by remember { mutableStateOf("") }
    var boundHolderName by remember { mutableStateOf("") }
    var showBindBankDialog by remember { mutableStateOf(false) }
    var isSubmitting by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        val details = WalletSyncService.getBankDetails()
        if (details != null) {
            val u = details.optString("upiId", "")
            val acc = details.optString("accountNumber", "")
            val ifsc = details.optString("ifsc", "")
            val name = details.optString("accountHolderName", "")
            if (u.isNotBlank() || acc.isNotBlank()) {
                isBound = true
                upiId = u.ifBlank { acc }
                boundAccountNumber = acc
                boundIfsc = ifsc
                boundHolderName = name
            }
        }
    }

    val amountNum = withdrawAmount.toDoubleOrNull() ?: 500.0
    val upiFee = (amountNum * 0.02).coerceAtMost(10.0) // 2% fee max 10
    val finalNet = (amountNum - upiFee).coerceAtLeast(0.0)

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(AppBackground)
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
                    .background(CardNavyBackground)
                    .border(1.dp, CardBorderColor, RoundedCornerShape(10.dp))
                    .align(Alignment.CenterStart)
                    .noRippleClickable { onBackClick() },
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
                .background(CardNavyBackground)
                .border(1.dp, CardBorderColor, RoundedCornerShape(16.dp))
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

        // 3. Option Card: Withdraw via Permanent Bound Account
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(CardNavyBackground)
                .border(1.dp, CardBorderColor, RoundedCornerShape(20.dp))
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
                        text = "Withdrawal Destination",
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                    if (isBound) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF0F3B2E))
                                .padding(horizontal = 8.dp, vertical = 3.dp)
                        ) {
                            Text(text = "🔒 BOUND & LOCKED", fontSize = 11.sp, fontFamily = RubikFont, fontWeight = FontWeight.Bold, color = Color(0xFF00FFC2))
                        }
                    } else {
                        Text(
                            text = "+ Bind Account",
                            fontSize = 13.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFFFB800),
                            textDecoration = TextDecoration.Underline,
                            modifier = Modifier.noRippleClickable { showBindBankDialog = true }
                        )
                    }
                }

                // Security Banner if bound or not
                if (isBound) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF13192B))
                            .border(1.dp, Color(0xFF1E3255), RoundedCornerShape(12.dp))
                            .padding(10.dp)
                    ) {
                        Column {
                            Text(
                                text = "Target: ${if (boundAccountNumber.isNotBlank()) "A/C $boundAccountNumber ($boundIfsc)" else upiId}",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                            if (boundHolderName.isNotBlank()) {
                                Text(
                                    text = "Holder: $boundHolderName",
                                    fontSize = 11.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF8E899B)
                                )
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "🔒 Account is permanently locked in database. To change or rebind, contact Customer Support.",
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                color = Color(0xFFFFB800)
                            )
                        }
                    }
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF2C1A14))
                            .border(1.dp, Color(0xFF5A2A1A), RoundedCornerShape(12.dp))
                            .padding(10.dp)
                    ) {
                        Text(
                            text = "⚠️ Notice: First-time bank/UPI binding is PERMANENT. Once bound, it cannot be changed or deleted by users. Please verify details carefully.",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFFFF9100)
                        )
                    }
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

                HorizontalDivider(color = CardBorderColor, thickness = 1.dp)

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
                                .background(Color(0xFF383C45))
                                .border(1.dp, CardBorderColor, RoundedCornerShape(8.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "▲",
                                fontSize = 14.sp,
                                color = BrandCasinoGreen
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
                            .noRippleClickable(enabled = !isSubmitting) {
                                if (!isBound && upiId.isBlank()) {
                                    Toast.makeText(context, "Please bind your withdrawal account first", Toast.LENGTH_SHORT).show()
                                    showBindBankDialog = true
                                } else {
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
                            }
                            .padding(horizontal = 16.dp, vertical = 10.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        if (isSubmitting) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(18.dp),
                                color = AppBackground,
                                strokeWidth = 2.dp
                            )
                        } else {
                            Text(
                                text = "Get ₹${String.format("%.2f", finalNet)}",
                                fontSize = 14.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = AppBackground
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }

    // Permanent Bank / UPI Binding Dialog
    if (showBindBankDialog) {
        var tempUpi by remember { mutableStateOf(upiId) }
        var tempAcc by remember { mutableStateOf(boundAccountNumber) }
        var tempIfsc by remember { mutableStateOf(boundIfsc) }
        var tempName by remember { mutableStateOf(boundHolderName) }
        var isBindingReq by remember { mutableStateOf(false) }

        AlertDialog(
            onDismissRequest = { if (!isBindingReq) showBindBankDialog = false },
            containerColor = CardNavyBackground,
            titleContentColor = Color.White,
            textContentColor = Color(0xFF8E899B),
            title = {
                Text("Bind Withdrawal Account", fontWeight = FontWeight.W800, fontFamily = RubikFont, color = Color(0xFFFFD700))
            },
            text = {
                Column(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
                    modifier = Modifier.verticalScroll(rememberScrollState())
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                            .background(Color(0xFF2C1614))
                            .border(1.dp, Color(0xFF5E2A20), RoundedCornerShape(8.dp))
                            .padding(8.dp)
                    ) {
                        Text(
                            text = "🔒 PERMANENT LOCK: This account will be permanently saved in the database. You CANNOT edit or delete it yourself. Contact Support if you need to rebind.",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFFFF9100)
                        )
                    }

                    OutlinedTextField(
                        value = tempUpi,
                        onValueChange = { tempUpi = it },
                        label = { Text("UPI ID (e.g. name@upi)", color = Color(0xFF8E899B)) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF231C3D),
                            unfocusedContainerColor = Color(0xFF231C3D),
                            focusedBorderColor = Color(0xFFFFB800),
                            unfocusedBorderColor = CardBorderColor,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = tempAcc,
                        onValueChange = { tempAcc = it },
                        label = { Text("Bank Account Number (Optional)", color = Color(0xFF8E899B)) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF231C3D),
                            unfocusedContainerColor = Color(0xFF231C3D),
                            focusedBorderColor = Color(0xFFFFB800),
                            unfocusedBorderColor = CardBorderColor,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = tempIfsc,
                        onValueChange = { tempIfsc = it.uppercase() },
                        label = { Text("Bank IFSC Code (Optional)", color = Color(0xFF8E899B)) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF231C3D),
                            unfocusedContainerColor = Color(0xFF231C3D),
                            focusedBorderColor = Color(0xFFFFB800),
                            unfocusedBorderColor = CardBorderColor,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )

                    OutlinedTextField(
                        value = tempName,
                        onValueChange = { tempName = it },
                        label = { Text("Account Holder Name", color = Color(0xFF8E899B)) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = Color(0xFF231C3D),
                            unfocusedContainerColor = Color(0xFF231C3D),
                            focusedBorderColor = Color(0xFFFFB800),
                            unfocusedBorderColor = CardBorderColor,
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White
                        )
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val upiClean = tempUpi.trim()
                        val accClean = tempAcc.trim()
                        if (upiClean.isBlank() && accClean.isBlank()) {
                            Toast.makeText(context, "Please enter at least a valid UPI ID or Account Number", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        if (upiClean.isNotBlank() && !upiClean.contains("@")) {
                            Toast.makeText(context, "Invalid UPI ID format (must include @)", Toast.LENGTH_SHORT).show()
                            return@Button
                        }
                        isBindingReq = true
                        coroutineScope.launch {
                            val res = WalletSyncService.bindBankAccount(
                                upiId = upiClean,
                                accountNumber = accClean,
                                ifsc = tempIfsc.trim(),
                                holderName = tempName.trim()
                            )
                            isBindingReq = false
                            if (res.first) {
                                isBound = true
                                upiId = upiClean.ifBlank { accClean }
                                boundAccountNumber = accClean
                                boundIfsc = tempIfsc.trim()
                                boundHolderName = tempName.trim()
                                showBindBankDialog = false
                                Toast.makeText(context, "Account permanently bound & locked!", Toast.LENGTH_LONG).show()
                            } else {
                                Toast.makeText(context, res.second, Toast.LENGTH_LONG).show()
                            }
                        }
                    },
                    enabled = !isBindingReq,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFFB800))
                ) {
                    if (isBindingReq) {
                        CircularProgressIndicator(modifier = Modifier.size(16.dp), color = Color.Black, strokeWidth = 2.dp)
                    } else {
                        Text("LOCK & BIND PERMANENTLY", color = AppBackground, fontWeight = FontWeight.Bold)
                    }
                }
            },
            dismissButton = {
                TextButton(onClick = { if (!isBindingReq) showBindBankDialog = false }) {
                    Text("CANCEL", color = Color(0xFF8E899B))
                }
            }
        )
    }
}
