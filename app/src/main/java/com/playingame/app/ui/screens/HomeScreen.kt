package com.playingame.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
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
import com.playingame.app.R
import com.playingame.app.data.remote.PromotionSyncService
import com.playingame.app.data.remote.ServerPromotion
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.components.NotificationBottomSheet
import com.playingame.app.ui.components.TopHeader
import com.playingame.app.ui.theme.*
import com.playingame.app.util.noRippleClickable

@Composable
fun HomeScreen(
    onPlayDragonTiger: () -> Unit,
    onProfileClick: () -> Unit,
    onWalletClick: () -> Unit,
    onAddCashClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()
    val serverPromotions by PromotionSyncService.promotions.collectAsState()

    var showNotificationSheet by remember { mutableStateOf(false) }
    val homeListState = rememberLazyListState()

    // Fetch active promotions from backend server
    LaunchedEffect(Unit) {
        PromotionSyncService.fetchActivePromotions()
    }

    val chipBalance = if (walletBalance.totalChips % 100 == 0L) {
        "${walletBalance.totalChips / 100}"
    } else {
        String.format(java.util.Locale.getDefault(), "%.2f", walletBalance.totalRupees)
    }

    Column(
        modifier = modifier.fillMaxSize()
    ) {
        TopHeader(
            balance = chipBalance,
            avatarRes = userProfile.avatarRes,
            onProfileClick = onProfileClick,
            onWalletClick = onWalletClick,
            onNotificationClick = { showNotificationSheet = true }
        )

        LazyColumn(
            state = homeListState,
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = Dimens.screenHorizontalPadding, vertical = 20.dp)
        ) {
            // 1. Dynamic Promo Banner (Backend-driven)
            item(key = "promo_banner") {
                PromoBannerCard(
                    promotions = serverPromotions,
                    onCtaClick = onAddCashClick
                )
                Spacer(modifier = Modifier.height(14.dp))
            }

            // 2. Featured Game: Dragon vs Tiger (Exclusive Platform Game)
            item(key = "game_dragon_tiger") {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.Start
                ) {
                    SquareGameCard(
                        title = "Dragon vs Tiger",
                        imageRes = R.drawable.game_colordice,
                        modifier = Modifier.fillMaxWidth(0.5f),
                        onPlayClick = {
                            onPlayDragonTiger()
                        }
                    )
                }
                Spacer(modifier = Modifier.height(20.dp))
            }
        }
    }

    if (showNotificationSheet) {
        NotificationBottomSheet(
            onDismissRequest = { showNotificationSheet = false }
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Custom UI Components for Home Feed
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun PromoBannerCard(
    promotions: List<ServerPromotion>,
    onCtaClick: () -> Unit
) {
    var activePromoIndex by remember { mutableStateOf(0) }
    val promo = promotions.getOrNull(activePromoIndex) ?: ServerPromotion(
        id = "promo_welcome",
        title = "100% First Deposit Bonus",
        subtitle = "Deposit now & get up to ₹500 extra bonus chips!",
        badgeText = "EXTRA CHIPS",
        ctaText = "Claim Bonus",
        gradientStart = "#7C3AED",
        gradientEnd = "#1E1B4B",
        imageUrl = "promo_gold_coin"
    )

    val startColor = safeHexColor(promo.gradientStart, Color(0xFF7C3AED))
    val endColor = safeHexColor(promo.gradientEnd, Color(0xFF1E1B4B))

    val promoImageRes = if (promo.imageUrl.contains("colordice")) {
        R.drawable.game_colordice
    } else {
        R.drawable.promo_gold_coin
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(148.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(Brush.horizontalGradient(listOf(startColor, endColor)))
            .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(20.dp))
            .noRippleClickable {
                if (promotions.size > 1) {
                    activePromoIndex = (activePromoIndex + 1) % promotions.size
                }
            }
            .padding(horizontal = 16.dp, vertical = 12.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(Color(0xFFFFB800))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    ) {
                        Text(
                            text = promo.badgeText.uppercase(),
                            fontSize = 10.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF140D00)
                        )
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = promo.title,
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        maxLines = 1
                    )

                    Spacer(modifier = Modifier.height(2.dp))

                    Text(
                        text = promo.subtitle,
                        fontSize = 11.5.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFFE2E8F0),
                        maxLines = 2,
                        lineHeight = 15.sp
                    )
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color.White)
                        .noRippleClickable { onCtaClick() }
                        .padding(horizontal = 14.dp, vertical = 7.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = promo.ctaText,
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF0F172A)
                    )
                }
            }

            Spacer(modifier = Modifier.width(10.dp))

            Box(
                modifier = Modifier.size(105.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = promoImageRes),
                    contentDescription = "Promo Artwork",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Fit
                )
            }
        }

        if (promotions.size > 1) {
            Row(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 2.dp),
                horizontalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                promotions.forEachIndexed { idx, _ ->
                    Box(
                        modifier = Modifier
                            .size(if (idx == activePromoIndex) 14.dp else 5.dp, 4.dp)
                            .clip(RoundedCornerShape(2.dp))
                            .background(if (idx == activePromoIndex) Color(0xFFFFB800) else Color(0x66FFFFFF))
                    )
                }
            }
        }
    }
}

@Composable
private fun SquareGameCard(
    title: String,
    @androidx.annotation.DrawableRes imageRes: Int,
    modifier: Modifier = Modifier,
    onPlayClick: () -> Unit
) {
    Box(
        modifier = modifier
            .aspectRatio(1f / 1.10f)
            .clip(RoundedCornerShape(20.dp))
            .background(CardNavyBackground)
            .border(1.dp, CardBorderColor, RoundedCornerShape(20.dp))
            .noRippleClickable { onPlayClick() }
            .padding(10.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.Start
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
                    .clip(RoundedCornerShape(14.dp))
                    .background(AppBackground),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = imageRes),
                    contentDescription = title,
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )
            }

            Spacer(modifier = Modifier.height(7.dp))

            Text(
                text = title,
                fontSize = 15.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                maxLines = 1,
                modifier = Modifier.padding(start = 2.dp)
            )

            Spacer(modifier = Modifier.height(7.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(38.dp)
                    .clip(RoundedCornerShape(percent = 50))
                    .background(Color.White)
                    .noRippleClickable { onPlayClick() },
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_play_arrow),
                        contentDescription = "Play",
                        tint = Color(0xFF3B46F1),
                        modifier = Modifier.size(13.dp)
                    )
                    Text(
                        text = "PLAY",
                        fontSize = 13.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        color = Color(0xFF3B46F1),
                        letterSpacing = 0.5.sp
                    )
                }
            }
        }
    }
}



private fun safeHexColor(hex: String, fallback: Color): Color {
    return try {
        Color(android.graphics.Color.parseColor(hex))
    } catch (_: Exception) {
        fallback
    }
}
