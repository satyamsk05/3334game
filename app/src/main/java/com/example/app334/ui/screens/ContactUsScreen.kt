package com.example.app334.ui.screens

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
fun ContactUsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
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
                text = "Contact Us",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // Subtitle
        Text(
            text = "We are here to help you 24/7. Reach out via any channel below.",
            fontSize = 13.5.sp,
            fontFamily = RubikFont,
            color = Color(0xFFD1D5DB)
        )

        // Contact Option 1: Email Support
        ContactCard(
            title = "Email Support",
            detail = "support@ingames334.com",
            subtext = "Average response time: 2 hours",
            iconRes = R.drawable.ic_settings_contact
        )

        // Contact Option 2: Telegram
        ContactCard(
            title = "Telegram Channel",
            detail = "@InGames334Support",
            subtext = "Instant support & community announcements",
            iconRes = R.drawable.ic_settings_help
        )

        // Contact Option 3: WhatsApp
        ContactCard(
            title = "WhatsApp Support",
            detail = "+91 98765 43210",
            subtext = "Available 9:00 AM - 11:00 PM IST",
            iconRes = R.drawable.ic_headset
        )

        Spacer(modifier = Modifier.height(30.dp))
    }
}

@Composable
private fun ContactCard(
    title: String,
    detail: String,
    subtext: String,
    iconRes: Int
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color(0xFF1E0A30))
            .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(14.dp))
            .clickable { }
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(44.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(Color(0xFF2E0F45)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = iconRes),
                    contentDescription = title,
                    modifier = Modifier.size(24.dp),
                    tint = Color(0xFFA78BFA)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = detail,
                    fontSize = 14.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.SemiBold,
                    color = Color(0xFF10B981)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = subtext,
                    fontSize = 11.5.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF9CA3AF)
                )
            }
        }
    }
}
