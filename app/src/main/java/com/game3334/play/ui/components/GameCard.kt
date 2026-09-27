package com.game3334.play.ui.components

import androidx.annotation.DrawableRes
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.ui.theme.CardBorderColor
import com.game3334.play.ui.theme.CardNavyBackground
import com.game3334.play.ui.theme.Dimens
import com.game3334.play.ui.theme.RubikFont
import com.game3334.play.ui.theme.TextSecondary

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
    val cardShape = RoundedCornerShape(18.dp)
    val innerArtworkShape = RoundedCornerShape(12.dp)

    if (isFeatured) {
        // Featured Game Card (Horizontal Carousel/Row Item)
        Box(
            modifier = modifier
                .size(width = 240.dp, height = 145.dp)
                .shadow(elevation = 8.dp, shape = cardShape, spotColor = Color.Black)
                .clip(cardShape)
                .background(CardNavyBackground)
                .border(width = 1.dp, color = CardBorderColor, shape = cardShape)
                .clickable { onPlayClick() }
                .padding(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Inner Artwork Container
                Box(
                    modifier = Modifier
                        .size(115.dp)
                        .clip(innerArtworkShape)
                        .background(Color(0xFF141923)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = imageRes),
                        contentDescription = title,
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                // Info & Action
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    Text(
                        text = title,
                        fontSize = 15.sp,
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
                            color = TextSecondary,
                            maxLines = 1
                        )
                    }

                    PlayButton(
                        onClick = onPlayClick
                    )
                }
            }
        }
    } else {
        // Grid Game Card (2 columns, Rounded Card with #2F394C border & inner artwork)
        Column(
            modifier = modifier
                .fillMaxWidth()
                .shadow(elevation = 8.dp, shape = cardShape, spotColor = Color.Black)
                .clip(cardShape)
                .background(CardNavyBackground)
                .border(width = 1.dp, color = CardBorderColor, shape = cardShape)
                .clickable { onPlayClick() }
                .padding(bottom = 10.dp)
        ) {
            // Top Artwork section with rounded inner container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1f)
                    .padding(8.dp)
                    .clip(innerArtworkShape)
                    .background(Color(0xFF141923)),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            // Bottom Section: Game Title
            Text(
                text = title,
                fontSize = 14.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 4.dp)
            )

            // Play Button
            PlayButton(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 10.dp, vertical = 4.dp),
                onClick = onPlayClick
            )
        }
    }
}
