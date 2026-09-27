package com.game3334.play.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.R
import com.game3334.play.ui.theme.RubikFont

@Composable
fun WalletChip(
    balance: String,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    chipHeight: Dp = 38.dp,
    coinSize: Dp = 42.dp,
    fontSize: TextUnit = 18.sp,
    minWidth: Dp = 90.dp,
    backgroundColor: Color = Color(0xFF2C2D35)
) {
    Box(
        modifier = modifier
            .height(maxOf(chipHeight, coinSize))
            .then(
                if (onClick != null) Modifier.clickable { onClick() } else Modifier
            ),
        contentAlignment = Alignment.CenterStart
    ) {
        // Dark Capsule Background
        Row(
            modifier = Modifier
                .padding(start = coinSize / 3)
                .height(chipHeight)
                .defaultMinSize(minWidth = minWidth)
                .clip(RoundedCornerShape(12.dp))
                .background(Color(0xFF1B2230))
                .border(1.dp, Color(0xFF2F394C), RoundedCornerShape(12.dp))
                .padding(start = (coinSize * 2 / 3) - 2.dp, end = 16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = balance,
                fontSize = fontSize,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 0.5.sp
            )
        }

        // 3D Gold Star Coin overlapping left
        Image(
            painter = painterResource(id = R.drawable.ic_gold_chip),
            contentDescription = "Wallet Balance",
            modifier = Modifier
                .size(coinSize)
                .align(Alignment.CenterStart),
            contentScale = ContentScale.Fit
        )
    }
}
