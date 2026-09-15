package com.example.app334.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

@Composable
fun TopHeader(
    username: String = "satyamog",
    balance: String = "₹0.00",
    onProfileClick: () -> Unit = {},
    onWalletClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(top = 45.dp, bottom = 4.dp, start = 14.dp, end = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Left Profile Section
        Row(
            modifier = Modifier
                .clickable { onProfileClick() },
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Avatar Box Container
            Box(
                modifier = Modifier
                    .size(60.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF200038))
                    .border(2.dp, Color(0xFFFFD700), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.avatar_1),
                    contentDescription = "Avatar",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // User Info Column
            Column(
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = username,
                    fontSize = 17.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = 0.2.sp
                )

                Spacer(modifier = Modifier.height(2.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Gold Level",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFFD700)
                    )
                    Spacer(modifier = Modifier.width(3.dp))
                    Icon(
                        painter = painterResource(id = R.drawable.ic_gold_arrow),
                        contentDescription = "Arrow",
                        modifier = Modifier.size(9.dp),
                        tint = Color(0xFFFFD700)
                    )
                }
            }
        }

        // Right Wallet Balance Pill
        val displayBalance = if (balance == "₹0.00") "₹0" else balance

        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(12.dp))
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF00B57F),
                            Color(0xFF009A69)
                        )
                    )
                )
                .clickable { onWalletClick() }
                .padding(horizontal = 14.dp, vertical = 9.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_wallet),
                contentDescription = "Wallet",
                modifier = Modifier.size(22.dp),
                tint = Color.White
            )

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = displayBalance,
                fontSize = 18.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White,
                letterSpacing = 0.3.sp
            )

            Spacer(modifier = Modifier.width(10.dp))

            // Vertical Divider Line
            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(18.dp)
                    .background(Color.White.copy(alpha = 0.35f))
            )

            Spacer(modifier = Modifier.width(10.dp))

            Text(
                text = "+",
                fontSize = 18.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
        }
    }
}
