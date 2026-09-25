package com.example.app334.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.ui.theme.Dimens
import com.example.app334.ui.theme.RubikFont
import com.example.app334.ui.theme.TextSecondary

@Composable
fun GameCard(
    title: String,
    @DrawableRes imageRes: Int,
    backgroundGradient: List<Color>,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    isFeatured: Boolean = false,
    onPlayClick: () -> Unit = {}
) {
    val cardShape = RoundedCornerShape(Dimens.radiusCard)
    val gradientBrush = Brush.verticalGradient(
        colors = if (backgroundGradient.size >= 2) backgroundGradient else listOf(Color(0xFF2E1065), Color(0xFF1E0A2E))
    )

    if (isFeatured) {
        // Featured Game Card (Horizontal Carousel/Row Item)
        Box(
            modifier = modifier
                .size(width = 240.dp, height = 150.dp)
                .clip(cardShape)
                .background(brush = gradientBrush)
                .clickable { onPlayClick() }
        ) {
            // Artwork container with 12dp inner padding
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(Dimens.innerArtworkPadding),
                contentAlignment = Alignment.CenterStart
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = title,
                    modifier = Modifier
                        .size(110.dp)
                        .clip(RoundedCornerShape(Dimens.radiusSm)),
                    contentScale = ContentScale.Fit
                )
            }

            // Info & Play Action on right
            Column(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = Dimens.spacingMd),
                horizontalAlignment = Alignment.End,
                verticalArrangement = Arrangement.spacedBy(Dimens.spacingSm)
            ) {
                Text(
                    text = title,
                    fontSize = 16.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        fontSize = 11.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Normal,
                        color = TextSecondary,
                        maxLines = 1
                    )
                }

                PlayButton(
                    onClick = onPlayClick
                )
            }
        }
    } else {
        // Grid Game Card (160:230 Aspect Ratio, 2 columns, No Footer Overlap)
        Column(
            modifier = modifier
                .fillMaxWidth()
                .aspectRatio(160f / 230f)
                .clip(cardShape)
                .background(brush = gradientBrush)
                .clickable { onPlayClick() }
        ) {
            // Top Artwork section with 12dp inner padding - does not touch card edges
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(Dimens.innerArtworkPadding),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }

            // Bottom Footer section: Title, optional subtitle, and full-width Play button
            val footerBg = backgroundGradient.lastOrNull() ?: Color(0xFF1E0A2E)
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(footerBg)
                    .padding(horizontal = Dimens.spacingSm, vertical = Dimens.spacingSm),
                verticalArrangement = Arrangement.spacedBy(Dimens.spacingXs),
                horizontalAlignment = Alignment.Start
            ) {
                Text(
                    text = title,
                    fontSize = 13.5.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )

                if (subtitle != null) {
                    Text(
                        text = subtitle,
                        fontSize = 11.sp,
                        fontFamily = RubikFont,
                        color = TextSecondary,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                PlayButton(
                    modifier = Modifier.fillMaxWidth(),
                    onClick = onPlayClick
                )
            }
        }
    }
}
