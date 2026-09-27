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
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.R
import com.game3334.play.ui.theme.CardBorderColor
import com.game3334.play.ui.theme.CardNavyBackground
import com.game3334.play.ui.theme.RubikFont

@Composable
fun WalletChip(
    balance: String,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    chipHeight: Dp = 36.dp,
    coinSize: Dp = 38.dp,
    fontSize: TextUnit = 16.sp,
    minWidth: Dp = 0.dp
) {
    val pillShape = RoundedCornerShape(percent = 50)

    Box(
        modifier = modifier
            .wrapContentWidth()
            .height(maxOf(chipHeight, coinSize))
            .then(
                if (onClick != null) Modifier.clickable { onClick() } else Modifier
            ),
        contentAlignment = Alignment.CenterStart
    ) {
        // Dynamic Dark Capsule Background (Expands automatically with balance text)
        Row(
            modifier = Modifier
                .padding(start = 12.dp)
                .height(chipHeight)
                .wrapContentWidth()
                .shadow(elevation = 4.dp, shape = pillShape, spotColor = Color.Black)
                .clip(pillShape)
                .background(CardNavyBackground)
                .border(width = 1.dp, color = CardBorderColor, shape = pillShape)
                .padding(start = 30.dp, end = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.Center
        ) {
            Text(
                text = balance,
                fontSize = fontSize,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 0.3.sp,
                maxLines = 1,
                softWrap = false
            )
        }

        // 3D Gold Star Coin (Placed on left edge without overlapping any digits)
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
