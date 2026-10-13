package com.playingame.app.ui.onboarding

import androidx.activity.compose.BackHandler
import androidx.annotation.DrawableRes
import androidx.annotation.StringRes
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import com.playingame.app.util.noRippleClickable
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.snapshotFlow
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.ui.theme.RubikFont
import kotlinx.coroutines.launch
import kotlin.math.absoluteValue

data class OnboardingPageData(
    @StringRes val titleRes: Int,
    @StringRes val descRes: Int,
    @DrawableRes val imageRes: Int,
    @StringRes val contentDescriptionRes: Int
)

val onboardingPages = listOf(
    OnboardingPageData(
        titleRes = R.string.onboarding_title_1,
        descRes = R.string.onboarding_desc_1,
        imageRes = R.drawable.onboarding_1,
        contentDescriptionRes = R.string.cd_onboarding_illustration
    ),
    OnboardingPageData(
        titleRes = R.string.onboarding_title_2,
        descRes = R.string.onboarding_desc_2,
        imageRes = R.drawable.onboarding_2,
        contentDescriptionRes = R.string.cd_onboarding_illustration
    ),
    OnboardingPageData(
        titleRes = R.string.onboarding_title_3,
        descRes = R.string.onboarding_desc_3,
        imageRes = R.drawable.onboarding_3,
        contentDescriptionRes = R.string.cd_onboarding_illustration
    )
)

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun OnboardingScreen(
    onFinish: () -> Unit,
    viewModel: OnboardingViewModel? = null
) {
    val context = LocalContext.current
    val effectiveViewModel = viewModel ?: remember {
        OnboardingViewModel(context.applicationContext as android.app.Application)
    }
    val pagerState = rememberPagerState(pageCount = { onboardingPages.size })
    val coroutineScope = rememberCoroutineScope()
    val isDark = isSystemInDarkTheme()

    // Warm, soft tint top background color matching reference design
    val topCanvasColor = if (isDark) {
        Color(0xFF261D13)
    } else {
        Color(0xFFFED8A6)
    }

    // Bottom container surface color
    val bottomSurfaceColor = if (isDark) {
        Color(0xFF141923)
    } else {
        Color.White
    }

    // Warm coral primary accent matching reference
    val primaryColor = MaterialTheme.colorScheme.primary

    // Handle system back navigation (back on page > 0 smoothly scrolls to page - 1)
    BackHandler(enabled = pagerState.currentPage > 0) {
        coroutineScope.launch {
            pagerState.animateScrollToPage(pagerState.currentPage - 1)
        }
    }

    // Sync page index with ViewModel
    LaunchedEffect(pagerState) {
        snapshotFlow { pagerState.currentPage }.collect { page ->
            effectiveViewModel.setCurrentPage(page)
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(topCanvasColor)
    ) {
        Column(modifier = Modifier.fillMaxSize()) {

            // ==========================================
            // TOP SECTION (~55%): Soft Canvas with Centered Illustration
            // ==========================================
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.55f)
                    .statusBarsPadding(),
                contentAlignment = Alignment.Center
            ) {
                HorizontalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize()
                ) { pageIndex ->
                    val pageData = onboardingPages[pageIndex]

                    // Subtle parallax / scale animation during swipe
                    val pageOffset = (
                        (pagerState.currentPage - pageIndex) + pagerState.currentPageOffsetFraction
                    ).absoluteValue

                    val imageScale = 1f - (pageOffset * 0.15f).coerceIn(0f, 0.25f)
                    val imageAlpha = 1f - (pageOffset * 0.35f).coerceIn(0f, 0.6f)

                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 24.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Image(
                            painter = painterResource(pageData.imageRes),
                            contentDescription = stringResource(pageData.contentDescriptionRes),
                            modifier = Modifier
                                .size(240.dp)
                                .graphicsLayer {
                                    scaleX = imageScale
                                    scaleY = imageScale
                                    alpha = imageAlpha
                                }
                        )
                    }
                }
            }

            // ==========================================
            // BOTTOM SECTION (~45%): Smooth Wave Separator + Content
            // ==========================================
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(0.45f),
                shape = WaveTopShape(waveHeightPx = with(LocalDensity.current) { 42.dp.toPx() }),
                color = bottomSurfaceColor,
                shadowElevation = 8.dp
            ) {
                val currentPage = pagerState.currentPage
                val activeData = onboardingPages[currentPage]

                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 26.dp)
                        .padding(top = 40.dp, bottom = 28.dp)
                        .navigationBarsPadding(),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {

                    // Title & Subtitle Animated Content
                    AnimatedContent(
                        targetState = activeData,
                        transitionSpec = {
                            fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow)) togetherWith
                                fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                        },
                        label = "onboarding_text_transition"
                    ) { page ->
                        Column(modifier = Modifier.fillMaxWidth()) {
                            Text(
                                text = stringResource(page.titleRes),
                                maxLines = 2,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                fontSize = 28.sp,
                                lineHeight = 34.sp,
                                color = MaterialTheme.colorScheme.onSurface
                            )

                            Spacer(modifier = Modifier.height(12.dp))

                            Text(
                                text = stringResource(page.descRes),
                                maxLines = 2,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Normal,
                                fontSize = 15.sp,
                                lineHeight = 21.sp,
                                color = if (isDark) Color(0xFF94A3B8) else Color(0xFF6B7280)
                            )
                        }
                    }

                    // Spacer between text and controls
                    Spacer(modifier = Modifier.weight(1f))

                    // ==========================================
                    // 3-Dot Indicator Row
                    // ==========================================
                    val cdIndicator = stringResource(
                        R.string.cd_onboarding_page_indicator,
                        currentPage + 1,
                        pagerState.pageCount
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .semantics { contentDescription = cdIndicator },
                        horizontalArrangement = Arrangement.Start,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        repeat(pagerState.pageCount) { index ->
                            val isSelected = currentPage == index
                            val dotWidth by animateDpAsState(
                                targetValue = if (isSelected) 24.dp else 8.dp,
                                animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
                                label = "dot_width_$index"
                            )
                            val dotColor = if (isSelected) {
                                primaryColor
                            } else {
                                if (isDark) Color(0xFF334155) else Color(0xFFCBD5E1)
                            }

                            Box(
                                modifier = Modifier
                                    .padding(end = 6.dp)
                                    .height(8.dp)
                                    .width(dotWidth)
                                    .clip(CircleShape)
                                    .background(dotColor)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(26.dp))

                    // ==========================================
                    // Bottom Navigation Action Row
                    // ==========================================
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Pages 0 & 1: Skip (left) + Circular Arrow (right)
                        androidx.compose.animation.AnimatedVisibility(
                            visible = currentPage < pagerState.pageCount - 1,
                            modifier = Modifier.fillMaxWidth(),
                            enter = fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow)),
                            exit = fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                // Skip Button
                                Text(
                                    text = stringResource(R.string.onboarding_btn_skip),
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Medium,
                                    fontSize = 15.sp,
                                    color = if (isDark) Color(0xFF94A3B8) else Color(0xFF6B7280),
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(8.dp))
                                        .noRippleClickable {
                                            effectiveViewModel.completeOnboarding()
                                            onFinish()
                                        }
                                        .padding(horizontal = 8.dp, vertical = 6.dp)
                                )

                                // Circular Next Button with Arrow
                                Box(
                                    modifier = Modifier
                                        .size(54.dp)
                                        .clip(CircleShape)
                                        .background(primaryColor)
                                        .noRippleClickable {
                                            coroutineScope.launch {
                                                pagerState.animateScrollToPage(currentPage + 1)
                                            }
                                        },
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        painter = painterResource(R.drawable.ic_arrow_forward),
                                        contentDescription = stringResource(R.string.cd_onboarding_next_page),
                                        tint = MaterialTheme.colorScheme.onPrimary,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }
                        }

                        // Last Page (Page 2): Full-Width "Get Started" Rounded Button
                        androidx.compose.animation.AnimatedVisibility(
                            visible = currentPage == pagerState.pageCount - 1,
                            modifier = Modifier.fillMaxWidth(),
                            enter = fadeIn(animationSpec = spring(stiffness = Spring.StiffnessMediumLow)),
                            exit = fadeOut(animationSpec = spring(stiffness = Spring.StiffnessMediumLow))
                        ) {
                            Button(
                                onClick = {
                                    effectiveViewModel.completeOnboarding()
                                    onFinish()
                                },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(52.dp),
                                shape = RoundedCornerShape(26.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = primaryColor
                                )
                            ) {
                                Text(
                                    text = stringResource(R.string.onboarding_btn_get_started),
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = MaterialTheme.colorScheme.onPrimary,
                                    textAlign = TextAlign.Center
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
