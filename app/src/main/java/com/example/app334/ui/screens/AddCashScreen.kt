package com.example.app334.ui.screens

import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.ui.theme.RubikFont

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.graphics.Brush

data class OfferItem(
    val amount: String,
    val cashback: String
)

@Composable
fun AddCashScreen(
    onAddCashSuccess: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var inputAmount by remember { mutableStateOf("200") }
    val walletBalance by WalletLedger.walletBalance.collectAsState()

    val allOffers = remember {
        listOf(
            OfferItem("200", "25"),
            OfferItem("500", "75"),
            OfferItem("50", "4"),
            OfferItem("100", "10")
        )
    }

    val inputNum = inputAmount.toDoubleOrNull() ?: 0.0
    val isAmountValid = inputNum > 0

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF13001C))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Add Cash to Wallet",
                    fontSize = 22.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Text(
                    text = "⚡ INSTANT ADD CASH",
                    fontSize = 10.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF10B981)
                )
            }

            Column(
                horizontalAlignment = Alignment.End
            ) {
                Text(
                    text = "Total Balance",
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF9CA3AF)
                )
                Text(
                    text = walletBalance.formattedTotal,
                    fontSize = 17.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }
        }

        // Amount Input Box
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF220338))
                .border(1.dp, Color(0xFF4C1D95), RoundedCornerShape(16.dp))
                .padding(16.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "ENTER AMOUNT",
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF9CA3AF),
                    letterSpacing = 0.5.sp
                )

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "₹ ",
                        fontSize = 26.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    BasicTextField(
                        value = inputAmount,
                        onValueChange = { inputAmount = it.filter { char -> char.isDigit() } },
                        textStyle = TextStyle(
                            fontSize = 26.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        ),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                        cursorBrush = SolidColor(Color(0xFF7C3AED)),
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
        }

        // Quick Offer Chips
        Text(
            text = "POPULAR CASH OFFERS",
            fontSize = 13.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFA78BFA),
            letterSpacing = 0.5.sp
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            allOffers.forEach { offer ->
                val isSelected = inputAmount == offer.amount
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .background(if (isSelected) Color(0xFF7C3AED) else Color(0xFF220338))
                        .border(1.dp, if (isSelected) Color(0xFFA78BFA) else Color(0xFF4C1D95), RoundedCornerShape(14.dp))
                        .clickable { inputAmount = offer.amount }
                        .padding(vertical = 12.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text(
                            text = "₹${offer.amount}",
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "+₹${offer.cashback} Bonus",
                            fontSize = 10.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF10B981)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // ADD CASH BUTTON
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
                .clip(RoundedCornerShape(14.dp))
                .background(
                    brush = if (isAmountValid) {
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF10B981),
                                Color(0xFF047857)
                            )
                        )
                    } else {
                        Brush.horizontalGradient(
                            colors = listOf(
                                Color(0xFF4B5563),
                                Color(0xFF374151)
                            )
                        )
                    }
                )
                .clickable(enabled = isAmountValid) {
                    val currentUserId = WalletLedger.userProfile.value.userId
                    val payUrl = "${com.example.app334.core.config.ClientConfig.SERVER_BASE_URL}/pay?amount=$inputAmount&userId=$currentUserId"
                    try {
                        val intent = android.content.Intent(android.content.Intent.ACTION_VIEW, android.net.Uri.parse(payUrl))
                        context.startActivity(intent)
                    } catch (e: Exception) {
                        Toast.makeText(context, "Opening deposit page...", Toast.LENGTH_SHORT).show()
                    }
                    val paise = WalletLedger.rupeesToPaise(inputNum)
                    WalletLedger.recordPendingDeposit(paise)
                    Toast.makeText(
                        context,
                        "Payment page opened! Please complete UPI payment & submit UTR for approval.",
                        Toast.LENGTH_LONG
                    ).show()
                    onAddCashSuccess(inputAmount)
                },
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = if (isAmountValid) "ADD ₹$inputAmount" else "ENTER AMOUNT",
                fontSize = 16.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 0.5.sp
            )
        }
    }
}
