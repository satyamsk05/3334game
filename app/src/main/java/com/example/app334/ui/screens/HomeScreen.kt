package com.example.app334.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.annotation.DrawableRes
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.dp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.ui.components.*
import com.example.app334.ui.navigation.NavItem
import com.example.app334.ui.theme.*

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
    object DepositPayment : SubScreen
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

    // Sync wallet balance from server whenever user navigates tabs or returns from subscreen
    LaunchedEffect(selectedTab, activeSubScreen) {
        com.example.app334.data.remote.WalletSyncService.syncBalance(userProfile.userId)
    }

    // System Back Navigation Handling
    BackHandler(enabled = activeSubScreen != null || selectedTab != NavItem.HOME) {
        if (activeSubScreen != null) {
            when (activeSubScreen) {
                SubScreen.WithdrawDetails -> activeSubScreen = SubScreen.Withdraw
                SubScreen.DepositPayment -> activeSubScreen = SubScreen.RingOfFuture
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

    val bannerSlides = remember {
        listOf(
            BannerSlide(
                id = "welcome_promo",
                title = "WELCOME BONUS",
                subtitle = "Claim 100% instant cash boost on your first deposit!",
                imageRes = R.drawable.pramotion_banner,
                backgroundGradient = listOf(Color(0xFF5B1FA6), Color(0xFF3B0764)),
                badgeText = "HOT",
                ctaText = "ADD CASH",
                onClick = { selectedTab = NavItem.REWARD }
            ),
            BannerSlide(
                id = "ring_feature",
                title = "RING OF FUTURE",
                subtitle = "Spin the 32-segment wheel for up to 30x instant multiplier!",
                imageRes = R.drawable.logo_rings_of_future,
                backgroundGradient = listOf(Color(0xFF0F766E), Color(0xFF042F2E)),
                badgeText = "NEW",
                ctaText = "PLAY NOW",
                onClick = { activeSubScreen = SubScreen.RingOfFuture }
            ),
            BannerSlide(
                id = "vip_cashback",
                title = "INSTANT CASHOUT",
                subtitle = "24/7 lightning fast UPI withdrawals directly to your bank account.",
                imageRes = R.drawable.cashback_wallet_ic,
                backgroundGradient = listOf(Color(0xFF9D174D), Color(0xFF500724)),
                badgeText = "VIP",
                ctaText = "WITHDRAW",
                onClick = { activeSubScreen = SubScreen.Withdraw }
            )
        )
    }

    fun onGameTileClick(gameId: String, title: String) {
        if (gameId == "rings_of_future") {
            activeSubScreen = SubScreen.RingOfFuture
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
                when (activeSubScreen) {
                    SubScreen.RingOfFuture -> {
                        com.example.app334.game.ringoffuture.ui.RingOfFutureScreen(
                            onBackClick = { activeSubScreen = null },
                            onOpenDepositScreen = { activeSubScreen = SubScreen.DepositPayment }
                        )
                    }
                    SubScreen.DepositPayment -> {
                        com.example.app334.game.ringoffuture.ui.DepositPaymentScreen(
                            onBackClick = { activeSubScreen = SubScreen.RingOfFuture },
                            onSuccess = { activeSubScreen = SubScreen.RingOfFuture }
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
                            onLogoutClick = {}
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
                            username = userProfile.username,
                            phone = userProfile.phone,
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
                                        // Header Section with avatar gold border, online dot, crown pill, and wallet card
                                        TopHeader(
                                            username = userProfile.username,
                                            balance = walletBalance.formattedTotal,
                                            onProfileClick = { activeSubScreen = SubScreen.ProfileDetails },
                                            onWalletClick = { selectedTab = NavItem.PROFILE }
                                        )

                                        LazyColumn(
                                            modifier = Modifier
                                                .weight(1f)
                                                .fillMaxWidth(),
                                            contentPadding = PaddingValues(top = 20.dp, bottom = Dimens.spacingLg),
                                            verticalArrangement = Arrangement.spacedBy(Dimens.sectionSpacing)
                                        ) {
                                            // 4. Hero Banner (HorizontalPager carousel with 3 slides & dot indicators)
                                            item {
                                                HeroBannerCarousel(
                                                    slides = bannerSlides
                                                )
                                            }

                                            // 5. Featured Games Section
                                            item {
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
                                            }

                                            // 6. All Games Section (2 columns, 160:230 Aspect Ratio, 16dp Gutter)
                                            item {
                                                Column(
                                                    modifier = Modifier.padding(horizontal = Dimens.screenHorizontalPadding),
                                                    verticalArrangement = Arrangement.spacedBy(Dimens.spacingSm)
                                                ) {
                                                    SectionHeader(
                                                        title = "All Games",
                                                        icon = painterResource(id = R.drawable.ic_play_arrow),
                                                        modifier = Modifier.padding(horizontal = 0.dp)
                                                    )

                                                    for (i in gridGames.indices step 2) {
                                                        Row(
                                                            modifier = Modifier.fillMaxWidth(),
                                                            horizontalArrangement = Arrangement.spacedBy(Dimens.gridGutter)
                                                        ) {
                                                            GameCard(
                                                                title = gridGames[i].title,
                                                                imageRes = gridGames[i].logoRes,
                                                                backgroundGradient = gridGames[i].gradientColors,
                                                                modifier = Modifier.weight(1f),
                                                                isFeatured = false,
                                                                onPlayClick = { onGameTileClick(gridGames[i].id, gridGames[i].title) }
                                                            )
                                                            if (i + 1 < gridGames.size) {
                                                                GameCard(
                                                                    title = gridGames[i + 1].title,
                                                                    imageRes = gridGames[i + 1].logoRes,
                                                                    backgroundGradient = gridGames[i + 1].gradientColors,
                                                                    modifier = Modifier.weight(1f),
                                                                    isFeatured = false,
                                                                    onPlayClick = { onGameTileClick(gridGames[i + 1].id, gridGames[i + 1].title) }
                                                                )
                                                            } else {
                                                                Spacer(modifier = Modifier.weight(1f))
                                                            }
                                                        }
                                                        if (i + 2 < gridGames.size) {
                                                            Spacer(modifier = Modifier.height(Dimens.gridGutter))
                                                        }
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
                    onTabSelected = { tab ->
                        activeSubScreen = null
                        selectedTab = tab
                    }
                )
            }
        }
    }
}
