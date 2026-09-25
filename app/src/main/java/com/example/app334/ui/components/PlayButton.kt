package com.example.app334.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import com.example.app334.ui.theme.Dimens
import com.example.app334.ui.theme.RubikFont
import com.example.app334.ui.theme.Violet700

@Composable
fun PlayButton(
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(Dimens.radiusFull))
            .background(Color.White)
            .clickable { onClick() }
            .padding(horizontal = Dimens.spacingMd, vertical = Dimens.spacingSm),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Dimens.spacingXs)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_play_arrow),
                contentDescription = "Play Icon",
                modifier = Modifier.size(13.dp),
                tint = Violet700
            )
            Text(
                text = "PLAY",
                fontSize = 13.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Violet700,
                letterSpacing = 0.5.sp,
                maxLines = 1
            )
        }
    }
}
