package com.example.app334.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
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

@Composable
fun FairPlayScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF15001F))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp, bottom = 8.dp),
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
                text = "Fair Play Policy",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // Section 1: Unbiased Random Outcome Generation
        FairPlayCard(
            title = "Unbiased Random Outcome Generation",
            description = "Ring of Future uses cryptographically strong SecureRandom sampling across 32 wheel segments. Outcome probability is purely random with no player manipulation.",
            iconRes = R.drawable.ic_settings_shield
        )

        // Section 2: Balanced ~95% RTP Multipliers
        FairPlayCard(
            title = "Target ~95% Return-To-Player (RTP)",
            description = "Multipliers are mathematically calibrated across all colors (Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x) ensuring a transparent and consistent house edge.",
            iconRes = R.drawable.ic_settings_issues
        )

        // Section 3: Transparent Ledger & Wallet Accounting
        FairPlayCard(
            title = "Transparent Ledger Accounting",
            description = "All bet debits, refunds, wins, and withdrawals are recorded synchronously in the application ledger in integer paise to eliminate rounding discrepancies.",
            iconRes = R.drawable.ic_settings_add_cash
        )

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun FairPlayCard(
    title: String,
    description: String,
    iconRes: Int
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF1E0A30))
            .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(14.dp))
            .padding(16.dp)
    ) {
        Column {
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = title,
                    modifier = Modifier.size(22.dp),
                    tint = Color(0xFF10B981)
                )

                Spacer(modifier = Modifier.width(10.dp))

                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Text(
                text = description,
                fontSize = 13.sp,
                fontFamily = RubikFont,
                color = Color(0xFFD1D5DB),
                lineHeight = 18.sp
            )
        }
    }
}
