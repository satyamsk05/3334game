package com.playingame.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import com.playingame.app.util.noRippleClickable
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.ui.theme.*
import com.playingame.app.ui.theme.RubikFont

@Composable
fun AboutUsScreen(
    onBackClick: () -> Unit,
    onOpenLegalDoc: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(AppBackground)
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
                    .size(44.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(CardNavyBackground)
                    .border(1.dp, CardBorderColor, RoundedCornerShape(12.dp))
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

            Spacer(modifier = Modifier.width(14.dp))

            Text(
                text = "About Us",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // App Logo & Version Box
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                painter = painterResource(id = R.mipmap.ic_launcher),
                contentDescription = "App Logo",
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(20.dp))
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "Bit Arcade Game",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Version 1.0.0",
                fontSize = 13.sp,
                fontFamily = RubikFont,
                color = Color(0xFFFFB800)
            )
        }

        // Description Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(CardNavyBackground)
                .border(1.dp, CardBorderColor, RoundedCornerShape(14.dp))
                .padding(16.dp)
        ) {
            Column {
                Text(
                    text = "Welcome to Bit Arcade Game",
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "Bit Arcade Game is a skill-based gaming platform with verified UPI payments, transparent ledger accounting, and responsible gaming controls.",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF8E899B),
                    lineHeight = 19.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Info Rows
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(CardNavyBackground)
                .border(1.dp, CardBorderColor, RoundedCornerShape(14.dp))
        ) {
            AboutRowItem(title = "Terms of Service") { onOpenLegalDoc("TERMS") }
            HorizontalDivider(color = CardBorderColor, thickness = 1.dp)
            AboutRowItem(title = "Privacy Policy") { onOpenLegalDoc("PRIVACY") }
            HorizontalDivider(color = CardBorderColor, thickness = 1.dp)
            AboutRowItem(title = "Refund Policy") { onOpenLegalDoc("REFUND") }
            HorizontalDivider(color = CardBorderColor, thickness = 1.dp)
            AboutRowItem(title = "Responsible Gaming") { onOpenLegalDoc("TERMS") }
        }

        Spacer(modifier = Modifier.height(30.dp))

        Text(
            text = "Copyright 2026 Bit Arcade Game. All rights reserved.",
            fontSize = 12.sp,
            fontFamily = RubikFont,
            color = Color(0xFF6B7280),
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun AboutRowItem(title: String, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .noRippleClickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = title,
            fontSize = 15.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "›",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF9CA3AF)
        )
    }
}
