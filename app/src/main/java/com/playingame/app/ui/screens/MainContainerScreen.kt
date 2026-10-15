package com.playingame.app.ui.screens

import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavController
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.components.CustomBottomNavBar
import com.playingame.app.ui.navigation.MainTabController
import com.playingame.app.ui.navigation.NavItem
import com.playingame.app.ui.navigation.Screen
import com.playingame.app.ui.theme.BackgroundGradient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject

@Composable
fun MainContainerScreen(
    navController: NavController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val selectedTab by MainTabController.selectedTab.collectAsState()
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()

    // Sync wallet balance when entering main container
    LaunchedEffect(Unit) {
        com.playingame.app.data.remote.WalletSyncService.syncBalance(userProfile.userId)
    }

    // System Back Navigation Handling
    BackHandler(enabled = selectedTab != NavItem.HOME) {
        MainTabController.selectTab(NavItem.HOME)
    }

    fun openDepositScreen(amountRupees: Double) {
        val sessionToken = SessionManager.authToken()
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
                    val fullUrl = if (candidateUrl.startsWith("http://") || candidateUrl.startsWith("https://")) {
                        candidateUrl
                    } else {
                        val path = if (candidateUrl.startsWith("/")) candidateUrl else "/$candidateUrl"
                        "${ClientConfig.PAYMENT_GATEWAY_URL}$path"
                    }
                    val encodedToken = java.net.URLEncoder.encode(sessionToken, "UTF-8")
                    if (!fullUrl.contains("token=")) {
                        val sep = if (fullUrl.contains("?")) "&" else "?"
                        "$fullUrl${sep}token=$encodedToken"
                    } else {
                        fullUrl
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
                when (selectedTab) {
                    NavItem.HOME -> {
                        HomeScreen(
                            onPlayDragonTiger = {
                                navController.navigate(Screen.DragonTiger.route)
                            },
                            onProfileClick = {
                                navController.navigate(Screen.ProfileDetails.route)
                            },
                            onWalletClick = {
                                MainTabController.selectTab(NavItem.PROFILE)
                            },
                            onAddCashClick = {
                                MainTabController.selectTab(NavItem.REWARD)
                            },
                            onVipClick = {
                                navController.navigate(Screen.VipRewards.route)
                            }
                        )
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
                                MainTabController.selectTab(NavItem.PROFILE)
                            }
                        )
                    }

                    NavItem.TASK -> {
                        TaskWebScreen()
                    }

                    NavItem.PROFILE -> {
                        WalletScreen(
                            balance = walletBalance.formattedTotal,
                            depositBalance = walletBalance.formattedDeposit,
                            winningsBalance = walletBalance.formattedWinnings,
                            rewardsBalance = walletBalance.formattedBonus,
                            onAddCashClick = {
                                MainTabController.selectTab(NavItem.REWARD)
                            },
                            onWithdrawClick = {
                                navController.navigate(Screen.Withdraw.route)
                            },
                            onSettingsClick = {
                                navController.navigate(Screen.Settings.route)
                            },
                            onSupportClick = {
                                navController.navigate(Screen.ContactUs.route)
                            },
                            onAllTransactionsClick = {
                                navController.navigate(Screen.TransactionHistory.route)
                            },
                            onProfileClick = {
                                navController.navigate(Screen.ProfileDetails.route)
                            },
                            onVipClick = {
                                navController.navigate(Screen.VipRewards.route)
                            }
                        )
                    }
                }
            }

            // Bottom Navigation Bar
            CustomBottomNavBar(
                selectedTab = selectedTab,
                isScrolling = false,
                onTabSelected = { tab ->
                    MainTabController.selectTab(tab)
                }
            )
        }
    }
}
