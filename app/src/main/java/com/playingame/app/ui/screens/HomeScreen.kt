package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.annotation.DrawableRes
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.playingame.app.R
import com.playingame.app.data.repository.AuthRepository
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.ui.components.*
import com.playingame.app.ui.navigation.NavItem
import com.playingame.app.ui.theme.*

@Immutable
data class FeaturedGame(
    val id: String,
    val title: String,
    @DrawableRes val logoRes: Int,
    val gradientColors: List<Color>
)

@Immutable
data class GridGame(
    val id: String,
    val title: String,
    @DrawableRes val logoRes: Int,
    val gradientColors: List<Color>
)

sealed interface SubScreen {
    object Settings : SubScreen
    object Withdraw : SubScreen
    object WithdrawDetails : SubScreen
    object ProfileDetails : SubScreen
    object TransactionHistory : SubScreen
    object HelpCentre : SubScreen
    object ReportedIssues : SubScreen
    object AboutUs : SubScreen
    object ContactUs : SubScreen
    object FairPlay : SubScreen
    object RingOfFuture : SubScreen
    data class DepositPayment(val amountRupees: Double = 100.0) : SubScreen
    object XOLobby : SubScreen
    data class XOMatchmaking(val tier: com.playingame.app.game.xo.model.XOTier) : SubScreen
    data class XOBattle(val room: com.playingame.app.game.xo.model.XORoomState) : SubScreen
}

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    var selectedTab by remember { mutableStateOf(NavItem.HOME) }
    var activeSubScreen by remember { mutableStateOf<SubScreen?>(null) }
    var withdrawAmountInput by remember { mutableStateOf("500") }

    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()
    var showNotificationSheet by remember { mutableStateOf(false) }
    val homeListState = rememberLazyListState()

    // Sync wallet balance only when returning from active sub-screens or on initial load
    LaunchedEffect(activeSubScreen == null) {
        if (activeSubScreen == null) {
            com.playingame.app.data.remote.WalletSyncService.syncBalance(userProfile.userId)
        }
    }

    // System Back Navigation Handling
    BackHandler(enabled = activeSubScreen != null || selectedTab != NavItem.HOME) {
        if (activeSubScreen != null) {
            when (activeSubScreen) {
                SubScreen.WithdrawDetails -> activeSubScreen = SubScreen.Withdraw
                is SubScreen.DepositPayment -> activeSubScreen = null
                is SubScreen.XOBattle -> activeSubScreen = SubScreen.XOLobby
                is SubScreen.XOMatchmaking -> activeSubScreen = SubScreen.XOLobby
                else -> activeSubScreen = null
            }
        } else if (selectedTab != NavItem.HOME) {
            selectedTab = NavItem.HOME
        }
    }

    val featuredGames = remember {
        listOf(
            FeaturedGame(
                id = "classic_dice",
                title = "Classic Dice",
                logoRes = R.drawable.logo_classic_dice,
                gradientColors = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9))
            ),
            FeaturedGame(
                id = "double",
                title = "Double",
                logoRes = R.drawable.logo_double,
                gradientColors = listOf(Color(0xFFEC4899), Color(0xFFBE185D))
            )
        )
    }

    val gridGames = remember {
        listOf(
            GridGame(
                id = "mines",
                title = "Mines",
                logoRes = R.drawable.logo_mines,
                gradientColors = listOf(Color(0xFF10B981), Color(0xFF047857))
            ),
            GridGame(
                id = "color_dice",
                title = "Color Dice",
                logoRes = R.drawable.logo_color_dice,
                gradientColors = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9))
            ),
            GridGame(
                id = "hilo",
                title = "Hi-Lo",
                logoRes = R.drawable.logo_hilo,
                gradientColors = listOf(Color(0xFF14B8A6), Color(0xFF0F766E))
            ),
            GridGame(
                id = "kino",
                title = "Keno",
                logoRes = R.drawable.logo_kino,
                gradientColors = listOf(Color(0xFF10B981), Color(0xFF047857))
            ),
            GridGame(
                id = "limbo",
                title = "Limbo",
                logoRes = R.drawable.logo_limbo,
                gradientColors = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9))
            ),
            GridGame(
                id = "coinflip",
                title = "Coin Flip",
                logoRes = R.drawable.logo_coinflip,
                gradientColors = listOf(Color(0xFF14B8A6), Color(0xFF0F766E))
            ),
            GridGame(
                id = "perya_color",
                title = "Perya Color",
                logoRes = R.drawable.logo_perya_color,
                gradientColors = listOf(Color(0xFF10B981), Color(0xFF047857))
            ),
            GridGame(
                id = "rings_of_future",
                title = "Ring of Future",
                logoRes = R.drawable.logo_rings_of_future,
                gradientColors = listOf(Color(0xFF14B8A6), Color(0xFF0F766E))
            )
        )
    }

    val serverPromotions by com.playingame.app.data.remote.PromotionSyncService.promotions.collectAsState()

    LaunchedEffect(Unit) {
        com.playingame.app.data.remote.PromotionSyncService.fetchActivePromotions()
    }

    fun openDepositScreen(amountRupees: Double) {
        val sessionToken = com.playingame.app.core.session.SessionManager.authToken()
        if (sessionToken.isNullOrBlank()) {
            Toast.makeText(context, "Please sign in to deposit", Toast.LENGTH_SHORT).show()
            return
        }
        // In-app WebView sends Authorization header — never put JWTs in browser URLs
        activeSubScreen = SubScreen.DepositPayment(amountRupees)
    }

    fun handlePromoRoute(targetRoute: String) {
        when {
            targetRoute.contains("xo", ignoreCase = true) -> activeSubScreen = SubScreen.XOLobby
            targetRoute.contains("ring", ignoreCase = true) -> activeSubScreen = SubScreen.RingOfFuture
            targetRoute.contains("withdraw", ignoreCase = true) -> activeSubScreen = SubScreen.Withdraw
            targetRoute.contains("deposit", ignoreCase = true) || targetRoute.contains("wallet", ignoreCase = true) -> openDepositScreen(500.0)
            else -> selectedTab = NavItem.REWARD
        }
    }

    val bannerSlides = remember(serverPromotions) {
        serverPromotions.map { promo ->
            val startColor = try {
                Color(android.graphics.Color.parseColor(promo.gradientStart))
            } catch (_: Exception) {
                Color(0xFF5B1FA6)
            }
            val endColor = try {
                Color(android.graphics.Color.parseColor(promo.gradientEnd))
            } catch (_: Exception) {
                Color(0xFF3B0764)
            }

            val iconRes = when (promo.iconType) {
                "xo" -> R.drawable.logo_classic_dice
                "ring" -> R.drawable.logo_rings_of_future
                "wallet" -> R.drawable.cashback_wallet_ic
                "welcome" -> R.drawable.pramotion_banner
                else -> {
                    if (promo.targetRoute.contains("xo", ignoreCase = true)) R.drawable.logo_classic_dice
                    else if (promo.targetRoute.contains("ring", ignoreCase = true)) R.drawable.logo_rings_of_future
                    else if (promo.targetRoute.contains("withdraw", ignoreCase = true)) R.drawable.cashback_wallet_ic
                    else R.drawable.pramotion_banner
                }
            }

            BannerSlide(
                id = promo.id,
                title = promo.title,
                subtitle = promo.subtitle,
                imageRes = iconRes,
                backgroundGradient = listOf(startColor, endColor),
                badgeText = promo.badgeText,
                ctaText = promo.ctaText,
                onClick = { handlePromoRoute(promo.targetRoute) }
            )
        }
    }

    fun onGameTileClick(gameId: String, title: String) {
        if (gameId == "rings_of_future") {
            activeSubScreen = SubScreen.RingOfFuture
        } else if (gameId == "classic_dice" || gameId == "xo_battle" || title.contains("Dice", ignoreCase = true) || title.contains("XO", ignoreCase = true)) {
            activeSubScreen = SubScreen.XOLobby
        } else {
            Toast.makeText(context, "$title is Coming Soon!", Toast.LENGTH_SHORT).show()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(brush = BackgroundGradient)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                when (val sub = activeSubScreen) {
                    SubScreen.XOLobby -> {
                        com.playingame.app.game.xo.ui.XOLobbyScreen(
                            onBackClick = { activeSubScreen = null },
                            onPlayClick = { tier -> activeSubScreen = SubScreen.XOMatchmaking(tier) },
                            onAddCashClick = { selectedTab = NavItem.REWARD }
                        )
                    }
                    is SubScreen.XOMatchmaking -> {
                        com.playingame.app.game.xo.ui.XOMatchmakingScreen(
                            tier = sub.tier,
                            onMatchFound = { room -> activeSubScreen = SubScreen.XOBattle(room) }
                        )
                    }
                    is SubScreen.XOBattle -> {
                        com.playingame.app.game.xo.ui.XOBattleScreen(
                            initialRoom = sub.room,
                            onBackClick = { activeSubScreen = SubScreen.XOLobby }
                        )
                    }
                    SubScreen.RingOfFuture -> {
                        com.playingame.app.game.ringoffuture.ui.RingOfFutureScreen(
                            onBackClick = { activeSubScreen = null },
                            onOpenDepositScreen = { openDepositScreen(200.0) }
                        )
                    }
                    is SubScreen.DepositPayment -> {
                        DepositPaymentScreen(
                            amountRupees = sub.amountRupees,
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.TransactionHistory -> {
                        TransactionHistoryScreen(
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.HelpCentre -> {
                        HelpCentreScreen(
                            onBackClick = { activeSubScreen = null },
                            onContactSupportClick = { activeSubScreen = SubScreen.ContactUs }
                        )
                    }
                    SubScreen.ReportedIssues -> {
                        ReportedIssuesScreen(
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.AboutUs -> {
                        AboutUsScreen(
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.ContactUs -> {
                        ContactUsScreen(
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.FairPlay -> {
                        FairPlayScreen(
                            onBackClick = { activeSubScreen = null }
                        )
                    }
                    SubScreen.Settings -> {
                        SettingsScreen(
                            onBackClick = { activeSubScreen = null },
                            onAddCashClick = {
                                activeSubScreen = null
                                selectedTab = NavItem.REWARD
                            },
                            onTransactionHistoryClick = { activeSubScreen = SubScreen.TransactionHistory },
                            onWithdrawalsClick = { activeSubScreen = SubScreen.Withdraw },
                            onCheckUpdatesClick = {},
                            onHelpCentreClick = { activeSubScreen = SubScreen.HelpCentre },
                            onReportedIssuesClick = { activeSubScreen = SubScreen.ReportedIssues },
                            onAboutUsClick = { activeSubScreen = SubScreen.AboutUs },
                            onContactUsClick = { activeSubScreen = SubScreen.ContactUs },
                            onFairPlayClick = { activeSubScreen = SubScreen.FairPlay },
                            onLogoutClick = {
                                activeSubScreen = null
                                AuthRepository.logout(context)
                            }
                        )
                    }
                    SubScreen.WithdrawDetails -> {
                        WithdrawDetailsScreen(
                            withdrawAmount = withdrawAmountInput,
                            onBackClick = { activeSubScreen = SubScreen.Withdraw },
                            onCompleteWithdrawal = { method ->
                                activeSubScreen = null
                                selectedTab = NavItem.PROFILE
                            }
                        )
                    }
                    SubScreen.Withdraw -> {
                        WithdrawScreen(
                            winningsBalance = walletBalance.formattedWinnings,
                            onBackClick = { activeSubScreen = null },
                            onNextClick = { inputAmt ->
                                withdrawAmountInput = inputAmt
                                activeSubScreen = SubScreen.WithdrawDetails
                            }
                        )
                    }
                    SubScreen.ProfileDetails -> {
                        ProfileScreen(
                            userId = userProfile.userId,
                            username = userProfile.username,
                            phone = userProfile.phone,
                            avatarId = userProfile.avatarId,
                            avatarRes = userProfile.avatarRes,
                            balance = walletBalance.formattedTotal,
                            onBackClick = { activeSubScreen = null },
                            onWalletClick = {
                                activeSubScreen = null
                                selectedTab = NavItem.PROFILE
                            },
                            onSupportClick = { activeSubScreen = SubScreen.ContactUs },
                            onTransactionClick = { activeSubScreen = SubScreen.TransactionHistory },
                            onSettingsClick = { activeSubScreen = SubScreen.Settings }
                        )
                    }
                    null -> {
                        when (selectedTab) {
                            NavItem.HOME -> {
                                    Column(
                                        modifier = Modifier.fillMaxSize()
                                    ) {
                                        // Header Section: Minimal avatar + Coin Chip Wallet Capsule + Notification Icon
                                        val chipBalance = if (walletBalance.totalPaise % 100 == 0L) {
                                            "${walletBalance.totalPaise / 100}"
                                        } else {
                                            String.format(java.util.Locale.getDefault(), "%.2f", walletBalance.totalRupees)
                                        }

                                        TopHeader(
                                            balance = chipBalance,
                                            avatarRes = userProfile.avatarRes,
                                            onProfileClick = { activeSubScreen = SubScreen.ProfileDetails },
                                            onWalletClick = { selectedTab = NavItem.PROFILE },
                                            onNotificationClick = { showNotificationSheet = true }
                                        )

                                        val gridGamePairs = remember(gridGames) { gridGames.chunked(2) }

                                        LazyColumn(
                                            state = homeListState,
                                            modifier = Modifier
                                                .weight(1f)
                                                .fillMaxWidth(),
                                            contentPadding = PaddingValues(top = 20.dp, bottom = Dimens.spacingLg)
                                        ) {
                                            // 4. Hero Banner (HorizontalPager carousel with 3 slides & dot indicators)
                                            item(key = "hero_banner") {
                                                HeroBannerCarousel(
                                                    slides = bannerSlides
                                                )
                                                Spacer(modifier = Modifier.height(Dimens.sectionSpacing))
                                            }

                                            // 5. Featured Games Section
                                            item(key = "featured_games") {
                                                Column(
                                                    verticalArrangement = Arrangement.spacedBy(Dimens.spacingSm)
                                                ) {
                                                    SectionHeader(
                                                        title = "Featured Games",
                                                        icon = painterResource(id = R.drawable.ic_vip_pro_crown)
                                                    )

                                                    LazyRow(
                                                        contentPadding = PaddingValues(horizontal = Dimens.screenHorizontalPadding),
                                                        horizontalArrangement = Arrangement.spacedBy(Dimens.gridGutter)
                                                    ) {
                                                        items(featuredGames, key = { it.id }) { game ->
                                                            GameCard(
                                                                title = game.title,
                                                                imageRes = game.logoRes,
                                                                backgroundGradient = game.gradientColors,
                                                                isFeatured = true,
                                                                onPlayClick = { onGameTileClick(game.id, game.title) }
                                                            )
                                                        }
                                                    }
                                                }
                                                Spacer(modifier = Modifier.height(Dimens.sectionSpacing))
                                            }

                                            // 6. All Games Section (2 columns, 160:230 Aspect Ratio, 16dp Gutter)
                                            item(key = "all_games_header") {
                                                SectionHeader(
                                                    title = "All Games",
                                                    icon = painterResource(id = R.drawable.ic_play_arrow),
                                                    modifier = Modifier
                                                        .padding(horizontal = Dimens.screenHorizontalPadding)
                                                        .padding(bottom = Dimens.spacingSm)
                                                )
                                            }

                                            itemsIndexed(
                                                items = gridGamePairs,
                                                key = { _, pair -> "grid_row_${pair.first().id}" }
                                            ) { index, pair ->
                                                Row(
                                                    modifier = Modifier
                                                        .fillMaxWidth()
                                                        .padding(horizontal = Dimens.screenHorizontalPadding)
                                                        .padding(bottom = if (index < gridGamePairs.size - 1) Dimens.gridGutter else 0.dp),
                                                    horizontalArrangement = Arrangement.spacedBy(Dimens.gridGutter)
                                                ) {
                                                    val firstGame = pair[0]
                                                    GameCard(
                                                        title = firstGame.title,
                                                        imageRes = firstGame.logoRes,
                                                        backgroundGradient = firstGame.gradientColors,
                                                        modifier = Modifier.weight(1f),
                                                        isFeatured = false,
                                                        onPlayClick = { onGameTileClick(firstGame.id, firstGame.title) }
                                                    )
                                                    if (pair.size > 1) {
                                                        val secondGame = pair[1]
                                                        GameCard(
                                                            title = secondGame.title,
                                                            imageRes = secondGame.logoRes,
                                                            backgroundGradient = secondGame.gradientColors,
                                                            modifier = Modifier.weight(1f),
                                                            isFeatured = false,
                                                            onPlayClick = { onGameTileClick(secondGame.id, secondGame.title) }
                                                        )
                                                    } else {
                                                        Spacer(modifier = Modifier.weight(1f))
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }

                                NavItem.SHARE -> {
                                    ShareScreen()
                                }

                                NavItem.REWARD -> {
                                    AddCashScreen(
                                        onOpenDeposit = { amount ->
                                            openDepositScreen(amount)
                                        },
                                        onAddCashSuccess = { addedAmount ->
                                            selectedTab = NavItem.PROFILE
                                        }
                                    )
                                }

                                NavItem.PROFILE -> {
                                    WalletScreen(
                                        balance = walletBalance.formattedTotal,
                                        depositBalance = walletBalance.formattedDeposit,
                                        winningsBalance = walletBalance.formattedWinnings,
                                        rewardsBalance = walletBalance.formattedBonus,
                                        onAddCashClick = { selectedTab = NavItem.REWARD },
                                        onWithdrawClick = { activeSubScreen = SubScreen.Withdraw },
                                        onSettingsClick = { activeSubScreen = SubScreen.Settings },
                                        onSupportClick = { activeSubScreen = SubScreen.ContactUs },
                                        onAllTransactionsClick = { activeSubScreen = SubScreen.TransactionHistory }
                                    )
                                }
                            }
                        }
                    }
                }

            // Bottom Navigation Bar
            if (activeSubScreen == null) {
                // Custom Bottom Navigation Bar
                CustomBottomNavBar(
                    selectedTab = selectedTab,
                    isScrolling = homeListState.isScrollInProgress && selectedTab == NavItem.HOME,
                    onTabSelected = { tab ->
                        activeSubScreen = null
                        selectedTab = tab
                    }
                )
            }
        }

        if (showNotificationSheet) {
            NotificationBottomSheet(
                onDismissRequest = { showNotificationSheet = false }
            )
        }
    }
}
