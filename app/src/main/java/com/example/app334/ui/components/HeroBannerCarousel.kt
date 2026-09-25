package com.example.app334.ui.components

import androidx.annotation.DrawableRes
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.*

data class BannerSlide(
    val id: String,
    val title: String,
    val subtitle: String,
    @DrawableRes val imageRes: Int,
    val backgroundGradient: List<Color>,
    val badgeText: String? = null,
    val ctaText: String = "PLAY NOW",
    val onClick: () -> Unit = {}
)

@Composable
fun HotBadge(
    text: String = "HOT",
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(topEnd = Dimens.radiusCard, bottomStart = Dimens.radiusSm))
            .background(brush = HotBadgeGradient)
            .padding(horizontal = Dimens.spacingSm, vertical = Dimens.spacing2xs),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = text,
            fontSize = 10.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Black,
            color = Color.White,
            letterSpacing = 0.5.sp
        )
    }
}

@Composable
fun HeroBannerCarousel(
    slides: List<BannerSlide>,
    modifier: Modifier = Modifier,
    onSlideClick: (BannerSlide) -> Unit = {}
) {
    if (slides.isEmpty()) return

    val pagerState = rememberPagerState(pageCount = { slides.size })

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = Dimens.screenHorizontalPadding),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(Dimens.heroBannerHeight)
        ) {
            HorizontalPager(
                state = pagerState,
                modifier = Modifier.fillMaxSize()
            ) { page ->
                val slide = slides[page]
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .clip(RoundedCornerShape(Dimens.radiusCard))
                        .background(brush = Brush.horizontalGradient(slide.backgroundGradient))
                        .clickable {
                            slide.onClick()
                            onSlideClick(slide)
                        }
                ) {
                    // Artwork / Graphic background
                    Image(
                        painter = painterResource(id = slide.imageRes),
                        contentDescription = slide.title,
                        modifier = Modifier
                            .fillMaxHeight()
                            .align(Alignment.CenterEnd)
                            .padding(end = Dimens.spacingSm),
                        contentScale = ContentScale.Fit
                    )

                    // Overlay Gradient for readable text
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        slide.backgroundGradient.first().copy(alpha = 0.95f),
                                        slide.backgroundGradient.first().copy(alpha = 0.65f),
                                        Color.Transparent
                                    )
                                )
                            )
                    )

                    // Text Content & CTA
                    Column(
                        modifier = Modifier
                            .fillMaxHeight()
                            .fillMaxWidth(0.68f)
                            .padding(horizontal = Dimens.spacingMd, vertical = Dimens.spacingMd),
                        verticalArrangement = Arrangement.SpaceBetween,
                        horizontalAlignment = Alignment.Start
                    ) {
                        Column {
                            Text(
                                text = slide.title,
                                fontSize = 17.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                lineHeight = 21.sp
                            )
                            Spacer(modifier = Modifier.height(Dimens.spacing2xs))
                            Text(
                                text = slide.subtitle,
                                fontSize = 11.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Normal,
                                color = TextSecondary,
                                lineHeight = 15.sp
                            )
                        }

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(Dimens.radiusPill))
                                .background(Gold500)
                                .padding(horizontal = Dimens.spacingMd, vertical = Dimens.spacingXs),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = slide.ctaText,
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Black,
                                color = Color.Black,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }

                    // Optional HOT Badge ribbon in top-right corner
                    if (slide.badgeText != null) {
                        HotBadge(
                            text = slide.badgeText,
                            modifier = Modifier.align(Alignment.TopEnd)
                        )
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(Dimens.spacingSm))

        // Pagination Dots Indicator
        Row(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            repeat(slides.size) { index ->
                val isSelected = pagerState.currentPage == index
                val width by animateDpAsState(
                    targetValue = if (isSelected) 18.dp else 6.dp,
                    label = "DotWidthAnimation"
                )
                Box(
                    modifier = Modifier
                        .height(6.dp)
                        .width(width)
                        .clip(CircleShape)
                        .background(if (isSelected) Color.White else Color.White.copy(alpha = 0.35f))
                )
            }
        }
    }
}
