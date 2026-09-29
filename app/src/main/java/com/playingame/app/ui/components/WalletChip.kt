package com.playingame.app.ui.components

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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.playingame.app.R
import com.playingame.app.ui.theme.CardBorderColor
import com.playingame.app.ui.theme.CardNavyBackground
import com.playingame.app.ui.theme.RubikFont

private val ChipPillShape = RoundedCornerShape(percent = 50)

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
    val context = LocalContext.current

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
                .shadow(elevation = 4.dp, shape = ChipPillShape, spotColor = Color.Black)
                .clip(ChipPillShape)
                .background(CardNavyBackground)
                .border(width = 1.dp, color = CardBorderColor, shape = ChipPillShape)
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
        AsyncImage(
            model = ImageRequest.Builder(context)
                .data(R.drawable.ic_gold_chip)
                .crossfade(false)
                .build(),
            contentDescription = "Wallet Balance",
            modifier = Modifier
                .size(coinSize)
                .align(Alignment.CenterStart),
            contentScale = ContentScale.Fit
        )
    }
}
