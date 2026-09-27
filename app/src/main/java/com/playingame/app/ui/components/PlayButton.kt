package com.playingame.app.ui.components

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
import com.playingame.app.R
import com.playingame.app.ui.theme.Dimens
import com.playingame.app.ui.theme.PlayButtonPurple
import com.playingame.app.ui.theme.RubikFont

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
            .padding(horizontal = 14.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_play_arrow),
                contentDescription = "Play Icon",
                modifier = Modifier.size(13.dp),
                tint = Color(0xFF0A0C11)
            )
            Text(
                text = "PLAY",
                fontSize = 12.5.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color(0xFF0A0C11),
                letterSpacing = 0.5.sp,
                maxLines = 1
            )
        }
    }
}
