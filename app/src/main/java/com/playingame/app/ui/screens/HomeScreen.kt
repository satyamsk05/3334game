package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.data.repository.AuthRepository
import com.playingame.app.data.wallet.WalletLedger
import android.content.Intent
import android.net.Uri
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.data.remote.RemoteApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import com.playingame.app.ui.components.*
import com.playingame.app.ui.navigation.NavItem
import com.playingame.app.ui.theme.*

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
    data class DepositPayment(val amountRupees: Double = 100.0) : SubScreen
}

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
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
                else -> activeSubScreen = null
            }
        } else if (selectedTab != NavItem.HOME) {
            selectedTab = NavItem.HOME
        }
    }

    fun openDepositScreen(amountRupees: Double) {
        val sessionToken = com.playingame.app.core.session.SessionManager.authToken()
        if (sessionToken.isNullOrBlank()) {
            Toast.makeText(context, "Please sign in to deposit", Toast.LENGTH_SHORT).show()
            return
        }

        Toast.makeText(context, "Redirecting to payment gateway...", Toast.LENGTH_SHORT).show()
        scope.launch(Dispatchers.IO) {
            val paymentUrl = try {
                val url = "${ClientConfig.API_BASE_URL}/deposits/initiate"
                val jsonBody = JSONObject().apply {
                    put("amountRupees", amountRupees)
                }
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $sessionToken")
                    .header("Content-Type", "application/json")
                    .post(jsonBody.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val respStr = resp.body?.string() ?: ""
                val respJson = JSONObject(respStr)
                val dataObj = respJson.optJSONObject("data")
                val candidateUrl = dataObj?.optString("paymentUrl")?.takeIf { it.isNotBlank() }
                    ?: dataObj?.optString("payUrl")?.takeIf { it.isNotBlank() }

                if (!candidateUrl.isNullOrBlank()) {
                    if (candidateUrl.startsWith("http://") || candidateUrl.startsWith("https://")) {
                        candidateUrl
                    } else {
                        val path = if (candidateUrl.startsWith("/")) candidateUrl else "/$candidateUrl"
                        "${ClientConfig.PAYMENT_GATEWAY_URL}$path"
                    }
                } else {
                    null
                }
            } catch (_: Exception) {
                null
            } ?: run {
                val encodedToken = java.net.URLEncoder.encode(sessionToken, "UTF-8")
                "${ClientConfig.PAYMENT_GATEWAY_URL}/pay?token=$encodedToken&amount=${amountRupees.toInt()}"
            }

            withContext(Dispatchers.Main) {
                try {
                    val browserIntent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl)).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(browserIntent)
                } catch (e: Exception) {
                    Toast.makeText(context, "Unable to open browser: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
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
                    is SubScreen.DepositPayment -> {
                        val sub = activeSubScreen as SubScreen.DepositPayment
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
                            onCompleteWithdrawal = {
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

                                    LazyColumn(
                                        state = homeListState,
                                        modifier = Modifier
                                            .weight(1f)
                                            .fillMaxWidth(),
                                        contentPadding = PaddingValues(horizontal = Dimens.screenHorizontalPadding, vertical = 20.dp)
                                    ) {
                                        item(key = "games_placeholder") {
                                            Box(
                                                modifier = Modifier
                                                    .fillMaxWidth()
                                                    .clip(RoundedCornerShape(20.dp))
                                                    .background(
                                                        brush = Brush.verticalGradient(
                                                            colors = listOf(
                                                                Color(0xFF261245),
                                                                Color(0xFF16092A)
                                                            )
                                                        )
                                                    )
                                                    .border(
                                                        width = 1.dp,
                                                        color = Color(0x33A855F7),
                                                        shape = RoundedCornerShape(20.dp)
                                                    )
                                                    .padding(28.dp),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Column(
                                                    horizontalAlignment = Alignment.CenterHorizontally,
                                                    verticalArrangement = Arrangement.Center
                                                ) {
                                                    Text(
                                                        text = "🎮",
                                                        fontSize = 44.sp
                                                    )
                                                    Spacer(modifier = Modifier.height(12.dp))
                                                    Text(
                                                        text = "Gaming Arena",
                                                        fontFamily = RubikFont,
                                                        fontWeight = FontWeight.Bold,
                                                        fontSize = 20.sp,
                                                        color = Color.White
                                                    )
                                                    Spacer(modifier = Modifier.height(6.dp))
                                                    Text(
                                                        text = "Exciting new games are coming soon!",
                                                        fontFamily = RubikFont,
                                                        fontWeight = FontWeight.Normal,
                                                        fontSize = 14.sp,
                                                        color = Color(0xFFB4A8D6),
                                                        textAlign = TextAlign.Center
                                                    )
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
                                    onAddCashSuccess = {
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
