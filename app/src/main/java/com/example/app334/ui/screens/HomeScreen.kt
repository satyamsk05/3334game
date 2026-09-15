package com.example.app334.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.annotation.DrawableRes
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.ui.components.CustomBottomNavBar
import com.example.app334.ui.components.TopHeader
import com.example.app334.ui.navigation.NavItem
import com.example.app334.ui.theme.RubikFont

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
    object AdminDashboard : SubScreen
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

    // System Back Navigation Handling
    BackHandler(enabled = activeSubScreen != null || selectedTab != NavItem.HOME) {
        if (activeSubScreen != null) {
            when (activeSubScreen) {
                SubScreen.WithdrawDetails -> activeSubScreen = SubScreen.Withdraw
                SubScreen.AdminDashboard -> activeSubScreen = SubScreen.RingOfFuture
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
            .background(Color(0xFF15001F))
            .windowInsetsPadding(WindowInsets.statusBars)
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
                            onOpenDepositScreen = { activeSubScreen = SubScreen.DepositPayment },
                            onOpenAdminDashboard = { activeSubScreen = SubScreen.AdminDashboard }
                        )
                    }
                    SubScreen.AdminDashboard -> {
                        com.example.app334.game.ringoffuture.admin.AdminDashboardScreen(
                            onBackClick = { activeSubScreen = SubScreen.RingOfFuture }
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
                        Crossfade(
                            targetState = selectedTab,
                            label = "TabCrossfade"
                        ) { tab ->
                            when (tab) {
                                NavItem.HOME -> {
                                    Column(
                                        modifier = Modifier.fillMaxSize()
                                    ) {
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
                                            contentPadding = PaddingValues(top = 10.dp, bottom = 80.dp),
                                            verticalArrangement = Arrangement.spacedBy(18.dp)
                                        ) {
                                            // Promotional Banner Card
                                            item {
                                                Image(
                                                    painter = painterResource(id = R.drawable.pramotion_banner),
                                                    contentDescription = "Promotion Banner",
                                                    modifier = Modifier
                                                        .padding(horizontal = 14.dp)
                                                        .fillMaxWidth()
                                                        .height(140.dp)
                                                        .clip(RoundedCornerShape(16.dp))
                                                        .clickable { selectedTab = NavItem.REWARD },
                                                    contentScale = ContentScale.Crop
                                                )
                                            }

                                            // Featured Games Section
                                            item {
                                                Column {
                                                    Text(
                                                        text = "FEATURED GAMES",
                                                        fontSize = 13.5.sp,
                                                        fontFamily = RubikFont,
                                                        fontWeight = FontWeight.Bold,
                                                        color = Color(0xFFA78BFA),
                                                        letterSpacing = 0.5.sp,
                                                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 4.dp)
                                                    )

                                                    Spacer(modifier = Modifier.height(8.dp))

                                                    LazyRow(
                                                        contentPadding = PaddingValues(horizontal = 14.dp),
                                                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                                                    ) {
                                                        items(featuredGames, key = { it.id }) { game ->
                                                            FeaturedGameCard(
                                                                game = game,
                                                                onPlayClick = { onGameTileClick(game.id, game.title) }
                                                            )
                                                        }
                                                    }
                                                }
                                            }

                                            // All Games Grid Section (160:230 Aspect Ratio, No Overlap)
                                            item {
                                                Column(
                                                    modifier = Modifier.padding(horizontal = 14.dp)
                                                ) {
                                                    Text(
                                                        text = "ALL GAMES",
                                                        fontSize = 13.5.sp,
                                                        fontFamily = RubikFont,
                                                        fontWeight = FontWeight.Bold,
                                                        color = Color(0xFFA78BFA),
                                                        letterSpacing = 0.5.sp,
                                                        modifier = Modifier.padding(vertical = 4.dp)
                                                    )

                                                    Spacer(modifier = Modifier.height(8.dp))

                                                    for (i in gridGames.indices step 2) {
                                                        Row(
                                                            modifier = Modifier.fillMaxWidth(),
                                                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                                                        ) {
                                                            GridGameCard(
                                                                game = gridGames[i],
                                                                modifier = Modifier.weight(1f),
                                                                onPlayClick = { onGameTileClick(gridGames[i].id, gridGames[i].title) }
                                                            )
                                                            if (i + 1 < gridGames.size) {
                                                                GridGameCard(
                                                                    game = gridGames[i + 1],
                                                                    modifier = Modifier.weight(1f),
                                                                    onPlayClick = { onGameTileClick(gridGames[i + 1].id, gridGames[i + 1].title) }
                                                                )
                                                            } else {
                                                                Spacer(modifier = Modifier.weight(1f))
                                                            }
                                                        }
                                                        if (i + 2 < gridGames.size) {
                                                            Spacer(modifier = Modifier.height(14.dp))
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
            }

            // Bottom Navigation Bar
            if (activeSubScreen == null) {
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

@Composable
private fun FeaturedGameCard(
    game: FeaturedGame,
    modifier: Modifier = Modifier,
    onPlayClick: () -> Unit = {}
) {
    Box(
        modifier = modifier
            .size(240.dp)
            .clip(RoundedCornerShape(18.dp))
    ) {
        Image(
            painter = painterResource(id = game.logoRes),
            contentDescription = game.title,
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        Box(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(14.dp)
                .clip(RoundedCornerShape(10.dp))
                .background(Color.White)
                .clickable { onPlayClick() }
                .padding(horizontal = 18.dp, vertical = 8.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "PLAY",
                fontSize = 15.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color(0xFF1E1B4B),
                letterSpacing = 1.0.sp
            )
        }
    }
}

@Composable
private fun GridGameCard(
    game: GridGame,
    modifier: Modifier = Modifier,
    onPlayClick: () -> Unit = {}
) {
    val themeColor = game.gradientColors.last()

    // 160:230 Aspect Ratio with clean non-overlapping image and action footer
    Column(
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(160f / 230f)
            .clip(RoundedCornerShape(20.dp))
            .background(themeColor)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .background(
                    brush = Brush.verticalGradient(
                        colors = listOf(game.gradientColors.first(), themeColor)
                    )
                ),
            contentAlignment = Alignment.Center
        ) {
            Image(
                painter = painterResource(id = game.logoRes),
                contentDescription = game.title,
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Crop
            )
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(themeColor)
                .padding(horizontal = 10.dp, vertical = 8.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp),
            horizontalAlignment = Alignment.Start
        ) {
            Text(
                text = game.title,
                fontSize = 14.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color.White,
                maxLines = 1
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(36.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.White)
                    .clickable { onPlayClick() },
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_play_arrow),
                        contentDescription = "Play",
                        modifier = Modifier.size(14.dp),
                        tint = Color(0xFF7C3AED)
                    )
                    Text(
                        text = "PLAY NOW",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color(0xFF7C3AED),
                        letterSpacing = 0.5.sp,
                        maxLines = 1
                    )
                }
            }
        }
    }
}
