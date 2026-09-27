package com.game3334.play.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.game3334.play.R
import com.game3334.play.ui.theme.*

@Composable
fun TopHeader(
    balance: String = "0",
    avatarRes: Int = R.drawable.avatar_1,
    hasUnreadNotifications: Boolean = true,
    onProfileClick: () -> Unit = {},
    onWalletClick: () -> Unit = {},
    onNotificationClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(
                top = 10.dp,
                bottom = Dimens.spacingSm,
                start = Dimens.screenHorizontalPadding,
                end = Dimens.screenHorizontalPadding
            ),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        // 1. Left Profile Avatar with Online Indicator Dot
        Box(
            modifier = Modifier.padding(2.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(46.dp)
                    .clip(CircleShape)
                    .background(CardNavyBackground)
                    .border(2.dp, Color(0xFFFFB800), CircleShape)
                    .clickable { onProfileClick() },
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = avatarRes),
                    contentDescription = "Profile Avatar",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            // Green Online Status Dot (Bottom Right)
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .clip(CircleShape)
                    .background(OnlineGreen)
                    .border(2.dp, AppBackground, CircleShape)
                    .align(Alignment.BottomEnd)
            )
        }

        // 2. Right Side: Wallet Chip Capsule + Notification Icon
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            WalletChip(
                balance = balance,
                onClick = onWalletClick
            )

            // Notification Bell Button
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .clickable { onNotificationClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_notification_bell),
                    contentDescription = "Notifications",
                    modifier = Modifier.size(26.dp),
                    tint = Color.White
                )
            }
        }
    }
}
