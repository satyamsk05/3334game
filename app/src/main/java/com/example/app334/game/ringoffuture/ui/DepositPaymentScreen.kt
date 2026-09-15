package com.example.app334.game.ringoffuture.ui

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.GameBackendRepository
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.ringoffuture.model.WheelConfig

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DepositPaymentScreen(
    onBackClick: () -> Unit,
    onSuccess: () -> Unit
) {
    var selectedAmount by remember { mutableStateOf("500") }
    var utrInput by remember { mutableStateOf("") }
    var selectedMethod by remember { mutableStateOf("PhonePe") }
    var isSubmitting by remember { mutableStateOf(false) }
    var showSuccessDialog by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val amountPresets = listOf("100", "500", "1000", "2000", "5000")
    val paymentMethods = listOf("PhonePe", "Paytm", "Google Pay", "BHIM UPI / QR")

    val walletBalance by WalletLedger.walletBalance.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Add Cash / Deposit", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    TextButton(onClick = onBackClick) {
                        Text("❮ Back", color = WheelConfig.COLOR_GOLD, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = WheelConfig.COLOR_DARK_BACKGROUND)
            )
        },
        containerColor = WheelConfig.COLOR_DARK_BACKGROUND
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Current Balance Card
            Card(
                colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_SURFACE),
                shape = RoundedCornerShape(16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text("Current Balance", color = Color.Gray, fontSize = 13.sp)
                        Text(
                            walletBalance.formattedTotal,
                            color = Color.White,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Surface(
                        color = Color(0xFF2E7D32),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(
                            "Instant Credit ⚡",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // Select Deposit Amount Section
            Text("Select Deposit Amount", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                amountPresets.forEach { amount ->
                    val isSelected = selectedAmount == amount
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (isSelected) WheelConfig.COLOR_GOLD else WheelConfig.COLOR_CARD)
                            .border(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) Color.White else Color(0xFF4A2A70),
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { selectedAmount = amount },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "₹$amount",
                            color = if (isSelected) Color.Black else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                    }
                }
            }

            // Select Payment Method
            Text("Select Payment Method", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)

            paymentMethods.forEach { method ->
                val isSelected = selectedMethod == method
                Card(
                    colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { selectedMethod = method }
                        .border(
                            width = if (isSelected) 2.dp else 0.dp,
                            color = if (isSelected) WheelConfig.COLOR_GOLD else Color.Transparent,
                            shape = RoundedCornerShape(12.dp)
                        )
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(method, color = Color.White, fontWeight = FontWeight.SemiBold, fontSize = 15.sp)
                        RadioButton(
                            selected = isSelected,
                            onClick = { selectedMethod = method },
                            colors = RadioButtonDefaults.colors(selectedColor = WheelConfig.COLOR_GOLD)
                        )
                    }
                }
            }

            // Demo Chips Banner Info Box
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF2A1545)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Text("🎮 Demo Play Chips Top-up", color = WheelConfig.COLOR_GOLD, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Spacer(modifier = Modifier.height(4.dp))
                    Text("Select your desired amount below to credit instant demo chips to your balance.", color = Color.LightGray, fontSize = 12.sp)
                }
            }

            // UTR Transaction ID Input
            OutlinedTextField(
                value = utrInput,
                onValueChange = { utrInput = it.take(12) },
                label = { Text("Enter 12-Digit UTR / Transaction Ref ID", color = Color.Gray) },
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = WheelConfig.COLOR_GOLD,
                    unfocusedBorderColor = Color(0xFF4A2A70),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                ),
                modifier = Modifier.fillMaxWidth()
            )

            errorMessage?.let {
                Text(it, color = Color.Red, fontSize = 13.sp)
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Pay & Submit Button
            Button(
                onClick = {
                    val amountVal = selectedAmount.toDoubleOrNull() ?: 0.0
                    if (amountVal <= 0) {
                        errorMessage = "Invalid amount"
                        return@Button
                    }
                    if (utrInput.length < 6) {
                        errorMessage = "Please enter valid UTR Transaction ID"
                        return@Button
                    }

                    errorMessage = null
                    isSubmitting = true

                    GameBackendRepository.submitDepositRequest(amountVal, utrInput)
                    isSubmitting = false
                    showSuccessDialog = true
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                if (isSubmitting) {
                    CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                } else {
                    Text("SUBMIT DEPOSIT (₹$selectedAmount)", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }

    if (showSuccessDialog) {
        AlertDialog(
            onDismissRequest = {},
            containerColor = WheelConfig.COLOR_SURFACE,
            title = { Text("Deposit Request Submitted! 🎉", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("Your deposit request of ₹$selectedAmount has been submitted.", color = Color.LightGray)
                    Text("⚡ Demo chips credited to your wallet balance.", color = WheelConfig.COLOR_GOLD, fontSize = 13.sp)
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        showSuccessDialog = false
                        onSuccess()
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = WheelConfig.COLOR_GOLD)
                ) {
                    Text("OK", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
