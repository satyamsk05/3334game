package com.example.app334.ui.screens

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
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

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
            .background(Color(0xFF15001F))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        // Top Header
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
                .padding(bottom = 20.dp),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = Color(0xFF1E0A30),
                unfocusedContainerColor = Color(0xFF1E0A30),
                focusedBorderColor = Color(0xFF7C3AED),
                unfocusedBorderColor = Color(0xFF3D195B),
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White
            ),
            singleLine = true
        )

        // Contact Support Banner
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF2E0F45))
                .border(1.dp, Color(0xFF6B21A8), RoundedCornerShape(14.dp))
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
                        color = Color(0xFFD1D5DB)
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF7C3AED))
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Contact Us",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Frequently Asked Questions Header
        Text(
            text = "Frequently Asked Questions",
            fontSize = 16.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFA78BFA),
            modifier = Modifier.padding(bottom = 12.dp)
        )

        // FAQ Items
        faqs.forEach { faq ->
            val isExpanded = expandedFaqId == faq.id
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 10.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF1E0A30))
                    .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(12.dp))
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
                            color = Color(0xFFA78BFA)
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
