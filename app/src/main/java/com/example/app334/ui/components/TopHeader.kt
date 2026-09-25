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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.*

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
            .padding(
                top = 45.dp,
                bottom = Dimens.spacingXs,
                start = Dimens.screenHorizontalPadding,
                end = Dimens.screenHorizontalPadding
            ),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Left Profile Section
        Row(
            modifier = Modifier
                .clickable { onProfileClick() },
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Dimens.spacingSm)
        ) {
            // Avatar Box Container with 2dp gold ring and green online status dot
            Box(
                modifier = Modifier.size(Dimens.avatarSize)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(CircleShape)
                        .background(CardNavyBackground)
                        .border(Dimens.avatarBorderStroke, Gold500, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.avatar_1),
                        contentDescription = "Avatar",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                // Green online status dot overlay at bottom-right
                Box(
                    modifier = Modifier
                        .size(Dimens.onlineDotSize)
                        .align(Alignment.BottomEnd)
                        .clip(CircleShape)
                        .background(OnlineGreen)
                        .border(1.5.dp, DarkNavyPurpleStart, CircleShape)
                )
            }

            // User Info Column
            Column(
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = username,
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black,
                    color = Color.White,
                    letterSpacing = 0.2.sp
                )

                Spacer(modifier = Modifier.height(3.dp))

                // 'Gold Level' badge pill with crown icon
                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(Dimens.radiusPill))
                        .background(Color(0xFF28113B))
                        .border(1.dp, Gold500.copy(alpha = 0.6f), RoundedCornerShape(Dimens.radiusPill))
                        .padding(horizontal = 7.dp, vertical = 2.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.ic_vip_pro_crown),
                        contentDescription = "VIP Crown",
                        modifier = Modifier.size(13.dp),
                        contentScale = ContentScale.Fit
                    )
                    Text(
                        text = "Gold Level",
                        fontSize = 10.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Gold500
                    )
                }
            }
        }

        // Right Wallet Balance Card: Emerald green pill, 24dp rounded corners, consistent 8dp padding
        val displayBalance = if (balance == "₹0.00") "₹0" else balance

        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(Dimens.radiusPill))
                .background(brush = WalletPillGradient)
                .clickable { onWalletClick() }
                .padding(Dimens.spacingSm),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_wallet),
                contentDescription = "Wallet",
                modifier = Modifier.size(20.dp),
                tint = Color.White
            )

            Spacer(modifier = Modifier.width(Dimens.spacingSm))

            Text(
                text = displayBalance,
                fontSize = 16.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White,
                letterSpacing = 0.3.sp
            )

            Spacer(modifier = Modifier.width(Dimens.spacingSm))

            // Vertical Divider Line
            Box(
                modifier = Modifier
                    .width(1.dp)
                    .height(16.dp)
                    .background(Color.White.copy(alpha = 0.4f))
            )

            Spacer(modifier = Modifier.width(Dimens.spacingSm))

            // '+' add cash symbol
            Box(
                modifier = Modifier
                    .size(22.dp)
                    .clip(CircleShape)
                    .background(Color.White.copy(alpha = 0.25f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "+",
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            }
        }
    }
}
