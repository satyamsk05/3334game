package com.example.app334.ui.screens

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
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

import androidx.compose.foundation.shape.CircleShape
import androidx.compose.ui.graphics.Brush

data class OfferItem(
    val amount: String,
    val cashback: String
)

@Composable
fun AddCashScreen(
    totalBalance: String = "₹0.0",
    onAddCashSuccess: (String) -> Unit = {},
    onDepositClick: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    var inputAmount by remember { mutableStateOf("200") }

    val allOffers = remember {
        listOf(
            OfferItem("200", "25"),
            OfferItem("500", "75"),
            OfferItem("50", "4"),
            OfferItem("100", "10")
        )
    }

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
            Text(
                text = "Deposit Cash",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

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
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = totalBalance,
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        // Promo Cashback Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(115.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF7C3AED))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "SPECIAL CASHBACK",
                        fontSize = 10.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFFD700)
                    )
                    Text(
                        text = "100% EXTRA CASH",
                        fontSize = 18.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "Get instant cashback on deposit",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFFE2E8F0)
                    )
                }

                Image(
                    painter = painterResource(id = R.drawable.cashback_wallet_ic),
                    contentDescription = "Cashbag",
                    modifier = Modifier.size(65.dp)
                )
            }
        }

        // Enter Amount Input Card (Matching Image 1 with 3D Depth & Bottom Cashback Bar)
        Box(
            modifier = Modifier.fillMaxWidth()
        ) {
            // 3D Bottom Depth Shadow Layer
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .offset(y = 6.dp)
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color(0xFF220038))
            )

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(22.dp))
                    .background(Color(0xFF380054))
                    .border(1.5.dp, Color(0xFF9D24D6).copy(alpha = 0.5f), RoundedCornerShape(22.dp))
            ) {
                // Top Main Purple Input Box
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp, bottomStart = 14.dp, bottomEnd = 14.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF7B00C7),
                                    Color(0xFF6B00B0)
                                )
                            )
                        )
                        .border(
                            1.dp,
                            Color(0xFFB44FFF),
                            RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp, bottomStart = 14.dp, bottomEnd = 14.dp)
                        )
                        .padding(horizontal = 18.dp, vertical = 14.dp),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "₹ ",
                            fontSize = 24.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )

                        BasicTextField(
                            value = inputAmount,
                            onValueChange = { newValue ->
                                if (newValue.all { it.isDigit() } && newValue.length <= 6) {
                                    inputAmount = newValue
                                }
                            },
                            textStyle = TextStyle(
                                fontSize = 24.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            ),
                            cursorBrush = SolidColor(Color.White),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            singleLine = true,
                            decorationBox = { innerTextField ->
                                Box(contentAlignment = Alignment.CenterStart) {
                                    if (inputAmount.isEmpty()) {
                                        Text(
                                            text = "Enter Amount",
                                            fontSize = 24.sp,
                                            fontFamily = RubikFont,
                                            fontWeight = FontWeight.W800,
                                            color = Color.White.copy(alpha = 0.5f)
                                        )
                                    }
                                    innerTextField()
                                }
                            },
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                }

                // Bottom Cashback Info Bar (Image 1)
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    // Green % Badge Icon
                    Box(
                        modifier = Modifier
                            .size(20.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF00E676)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "%",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF1B0626)
                        )
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Text(
                        text = "Add amount & get ",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Text(
                        text = "Cashback",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00E676)
                    )
                }
            }
        }

        // Offers Section
        Column {
            Text(
                text = "SELECT AMOUNT",
                fontSize = 13.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFA78BFA),
                letterSpacing = 0.5.sp
            )

            Spacer(modifier = Modifier.height(10.dp))

            for (i in allOffers.indices step 2) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    val offer1 = allOffers[i]
                    OfferCard(
                        offer = offer1,
                        isSelected = inputAmount == offer1.amount,
                        onClick = { inputAmount = offer1.amount },
                        modifier = Modifier.weight(1f)
                    )

                    if (i + 1 < allOffers.size) {
                        val offer2 = allOffers[i + 1]
                        OfferCard(
                            offer = offer2,
                            isSelected = inputAmount == offer2.amount,
                            onClick = { inputAmount = offer2.amount },
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
                if (i + 2 < allOffers.size) {
                    Spacer(modifier = Modifier.height(12.dp))
                }
            }
        }

        // Action CTA Button with 3D Depth (Vibrant Green matching reference image)
        val isAmountValid = inputAmount.isNotEmpty() && (inputAmount.toIntOrNull() ?: 0) > 0

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 20.dp)
        ) {
            // 3D Bottom Depth Shadow Layer (Dark Green)
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .offset(y = 5.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(if (isAmountValid) Color(0xFF003D1A) else Color(0xFF1E0030))
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp)
                    .clip(RoundedCornerShape(18.dp))
                    .background(
                        if (isAmountValid) {
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF00E676),
                                    Color(0xFF00B55B)
                                )
                            )
                        } else {
                            SolidColor(Color(0xFF2C0B42))
                        }
                    )
                    .border(
                        width = 1.dp,
                        color = if (isAmountValid) Color(0xFF00FF84).copy(alpha = 0.6f) else Color.Transparent,
                        shape = RoundedCornerShape(18.dp)
                    )
                    .clickable(enabled = isAmountValid) {
                        onAddCashSuccess(inputAmount)
                        onDepositClick(inputAmount)
                    },
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = if (isAmountValid) "ADD ₹$inputAmount" else "ADD CASH",
                    fontSize = 18.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = if (isAmountValid) Color.White else Color(0xFF8B5CF6),
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

@Composable
fun OfferCard(
    offer: OfferItem,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .padding(bottom = 6.dp)
            .clickable { onClick() }
    ) {
        // 3D Bottom Depth Shadow
        Box(
            modifier = Modifier
                .matchParentSize()
                .offset(y = 5.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF220038))
        )

        // Main Surface Card (Matching Image 2)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(86.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(
                    if (isSelected) {
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF7C00C7),
                                Color(0xFF6B00B0)
                            )
                        )
                    } else {
                        Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF4A0078),
                                Color(0xFF3C0063)
                            )
                        )
                    }
                )
                .border(
                    width = if (isSelected) 2.dp else 1.dp,
                    color = if (isSelected) Color(0xFFB44FFF) else Color(0xFF7B00C7).copy(alpha = 0.5f),
                    shape = RoundedCornerShape(18.dp)
                )
                .padding(14.dp)
        ) {
            // Plus '+' icon on top right (Image 2)
            Text(
                text = "+",
                fontSize = 24.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                modifier = Modifier.align(Alignment.TopEnd)
            )

            Column(
                modifier = Modifier.fillMaxSize(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "₹${offer.amount}",
                    fontSize = 22.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White
                )

                Text(
                    text = "₹${offer.cashback} Cashback",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF00E676)
                )
            }
        }
    }
}
