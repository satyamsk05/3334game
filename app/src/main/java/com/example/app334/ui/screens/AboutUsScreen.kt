package com.example.app334.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

@Composable
fun AboutUsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
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
                painter = painterResource(id = R.drawable.logo_classic_dice),
                contentDescription = "App Logo",
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(20.dp))
            )

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = "InGames 334",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = "Version 1.0.0 (Build 334)",
                fontSize = 13.sp,
                fontFamily = RubikFont,
                color = Color(0xFFA78BFA)
            )
        }

        // Description Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(14.dp))
                .background(Color(0xFF1E0A30))
                .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(14.dp))
                .padding(16.dp)
        ) {
            Column {
                Text(
                    text = "Welcome to InGames 334",
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(8.dp))

                Text(
                    text = "InGames 334 is a premier real-money gaming platform offering classic dice, mines, color prediction, and skill-based arcade games. Designed with 100% security, instant withdrawals, and certified fair play.",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFFD1D5DB),
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
                .background(Color(0xFF1E0A30))
                .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(14.dp))
        ) {
            AboutRowItem(title = "Terms of Service")
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)
            AboutRowItem(title = "Privacy Policy")
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)
            AboutRowItem(title = "Responsible Gaming")
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)
            AboutRowItem(title = "RNG Certification")
        }

        Spacer(modifier = Modifier.height(30.dp))

        Text(
            text = "Copyright 2026 InGames. All rights reserved.",
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
private fun AboutRowItem(title: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { }
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
