package com.playingame.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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

data class FaqItem(
    val id: Int,
    val question: String,
    val answer: String
)

@Composable
fun HelpCentreScreen(
    onBackClick: () -> Unit,
    onContactSupportClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    var searchQuery by remember { mutableStateOf("") }
    var expandedFaqId by remember { mutableStateOf<Int?>(null) }

    val faqs = remember {
        listOf(
            FaqItem(1, "How do I add money to my wallet?", "Go to the Add Cash tab from Home or Settings, select the amount, choose your payment method (UPI/Card/NetBanking), and complete the payment."),
            FaqItem(2, "How long does a withdrawal take?", "Instant UPI withdrawals usually take 1-5 minutes. Bank account transfers may take up to 24 hours depending on processing banks."),
            FaqItem(3, "Is my money safe on this platform?", "Yes, 100% safe. We use enterprise-grade SSL encryption and secure banking gateways for all financial transactions."),
            FaqItem(4, "What should I do if a transaction fails?", "If money was deducted from your account, it will be automatically refunded within 24-48 hours. You can also contact support with your TXN ID."),
            FaqItem(5, "How does the Fair Play policy work?", "Our platform uses certified Random Number Generator (RNG) systems ensuring 100% fair and unbiased game outcomes.")
        )
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
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
                text = "Help Centre",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // Search Bar
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search help topics...", color = Color(0xFF9CA3AF), fontSize = 14.sp) },
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF0F1015),
                unfocusedContainerColor = Color(0xFF0F1015),
                focusedBorderColor = Color(0xFF00E676),
                unfocusedBorderColor = Color(0xFF1E2028),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                cursorColor = Color(0xFF00E676)
            ),
            singleLine = true
        )

        // Contact Support Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF0F1015))
                .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                .clickable { onContactSupportClick() }
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "Need direct assistance?",
                        fontSize = 15.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = "Our support team is active 24/7 to help you",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF9CA3AF)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(Color(0xFF00E676))
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Contact Us",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0A0C11)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Frequently Asked Questions Header
        Text(
            text = "Frequently Asked Questions",
            fontSize = 16.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFFFB800),
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // FAQ Items
        faqs.forEach { faq ->
            val isExpanded = expandedFaqId == faq.id
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
                    .clip(RoundedCornerShape(14.dp))
                    .background(Color(0xFF0F1015))
                    .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(14.dp))
                    .clickable {
                        expandedFaqId = if (isExpanded) null else faq.id
                    }
                    .padding(14.dp)
            ) {
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = faq.question,
                            fontSize = 14.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.weight(1f)
                        )
                        Text(
                            text = if (isExpanded) "▲" else "▼",
                            fontSize = 12.sp,
                            color = Color(0xFFFFB800)
                        )
                    }

                    AnimatedVisibility(visible = isExpanded) {
                        Column {
                            Spacer(modifier = Modifier.height(10.dp))
                            Text(
                                text = faq.answer,
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                color = Color(0xFFD1D5DB),
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}
