package com.example.app334.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.ui.theme.RubikFont

@Composable
fun WithdrawScreen(
    winningsBalance: String = "₹1250",
    onBackClick: () -> Unit = {},
    onNextClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    val walletBalance by WalletLedger.walletBalance.collectAsState()
    var amount by remember { mutableStateOf("") }
    val amountNum = amount.toIntOrNull() ?: 0
    val isAmountValid = amount.isNotEmpty() && amountNum >= 25 && amountNum <= 5000 && amountNum <= walletBalance.winningRupees

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. Top Header Row: Back Arrow + "Withdraw"
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
                text = "Withdraw Winnings",
                fontSize = 20.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        // 2. Winnings Balance Header
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 10.dp, bottom = 14.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "AVAILABLE WINNINGS BALANCE",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFF8E899B),
                letterSpacing = 0.5.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = walletBalance.formattedWinnings,
                fontSize = 36.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White
            )
        }

        // 3. Input Section
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Enter Amount (₹)",
                fontSize = 14.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            // Input Card Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF2E0E46))
                    .border(1.dp, Color(0xFF5A2282), RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "₹ ",
                        fontSize = 18.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )

                    BasicTextField(
                        value = amount,
                        onValueChange = { newValue ->
                            if (newValue.all { it.isDigit() } && newValue.length <= 6) {
                                amount = newValue
                            }
                        },
                        textStyle = TextStyle(
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        ),
                        cursorBrush = SolidColor(Color.White),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        singleLine = true,
                        decorationBox = { innerTextField ->
                            Box(contentAlignment = Alignment.CenterStart) {
                                if (amount.isEmpty()) {
                                    Text(
                                        text = "Enter Amount (Min ₹25)",
                                        fontSize = 18.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.W800,
                                        color = Color.White.copy(alpha = 0.4f)
                                    )
                                }
                                innerTextField()
                            }
                        },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }

            Text(
                text = "Min ₹25 - Max ₹5000 twice a day (Winnings Only)",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF8E899B),
                modifier = Modifier.padding(start = 2.dp, top = 2.dp)
            )
        }

        Spacer(modifier = Modifier.weight(1f))

        // 4. Bottom Instant Withdrawals Guarantee & NEXT Button
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_settings_shield),
                    contentDescription = "Shield",
                    modifier = Modifier.size(15.dp),
                    tint = Color(0xFF8E899B)
                )
                Text(
                    text = "Instant 24x7 UPI Withdrawals",
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF8E899B)
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(if (isAmountValid) Color(0xFF6B42F2) else Color(0xFF38234B))
                    .clickable(enabled = isAmountValid) {
                        onNextClick(amount)
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "NEXT",
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = if (isAmountValid) Color.White else Color(0xFF7A6490),
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}
