package com.example.app334.ui.components

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.painter.Painter
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.Dimens
import com.example.app334.ui.theme.Gold500
import com.example.app334.ui.theme.RubikFont
import com.example.app334.ui.theme.Violet400

@Composable
fun SectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    icon: Painter? = null,
    onSeeAllClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.screenHorizontalPadding, vertical = Dimens.spacingXs),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(Dimens.spacingSm)
        ) {
            if (icon != null) {
                Icon(
                    painter = icon,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp),
                    tint = Gold500
                )
            }

            Text(
                text = title.uppercase(),
                fontSize = 13.5.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Violet400,
                letterSpacing = 0.8.sp
            )
        }

        if (onSeeAllClick != null) {
            Row(
                modifier = Modifier.clickable { onSeeAllClick() },
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                Text(
                    text = "See All",
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.SemiBold,
                    color = Gold500
                )
                Icon(
                    painter = painterResource(id = R.drawable.ic_gold_arrow),
                    contentDescription = "See All",
                    modifier = Modifier.size(8.dp),
                    tint = Gold500
                )
            }
        }
    }
}
