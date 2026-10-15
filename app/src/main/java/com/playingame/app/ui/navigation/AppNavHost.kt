package com.playingame.app.ui.navigation

import android.widget.Toast
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.playingame.app.data.repository.AuthRepository
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.screens.*
import kotlinx.coroutines.launch

@Composable
fun AppNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Screen.Main.route,
        modifier = modifier
    ) {
        // Main Screen (Lobby + Bottom Nav: Home, Share, Add Cash, Wallet)
        composable(Screen.Main.route) {
            MainContainerScreen(
                navController = navController
            )
        }

        // Dedicated Fullscreen Dragon vs Tiger Game Destination
        composable(Screen.DragonTiger.route) {
            DragonTigerScreen(
                onBackClick = {
                    navController.popBackStack()
                },
                onAddCashClick = {
                    navController.popBackStack()
                    // Navigate to Main with Reward/AddCash tab
                    MainTabController.selectTab(NavItem.REWARD)
                }
            )
        }

        // Settings Screen
        composable(Screen.Settings.route) {
            SettingsScreen(
                onBackClick = { navController.popBackStack() },
                onAddCashClick = {
                    navController.popBackStack()
                    MainTabController.selectTab(NavItem.REWARD)
                },
                onTransactionHistoryClick = {
                    navController.navigate(Screen.TransactionHistory.route)
                },
                onWithdrawalsClick = {
                    navController.navigate(Screen.Withdraw.route)
                },
                onVipClick = {
                    navController.navigate(Screen.VipRewards.route)
                },
                onCheckUpdatesClick = {},
                onHelpCentreClick = {
                    navController.navigate(Screen.HelpCentre.route)
                },
                onReportedIssuesClick = {
                    navController.navigate(Screen.ReportedIssues.route)
                },
                onAboutUsClick = {
                    navController.navigate(Screen.AboutUs.route)
                },
                onContactUsClick = {
                    navController.navigate(Screen.ContactUs.route)
                },
                onFairPlayClick = {
                    navController.navigate(Screen.FairPlay.route)
                },
                onLogoutClick = {
                    navController.popBackStack(Screen.Main.route, inclusive = false)
                    AuthRepository.logout(context)
                },
                onDeleteAccountClick = {
                    scope.launch {
                        AuthRepository.deleteAccount(context).onSuccess {
                            navController.popBackStack(Screen.Main.route, inclusive = false)
                            AuthRepository.logout(context)
                        }.onFailure { error ->
                            Toast.makeText(
                                context,
                                error.message ?: "Could not delete account. Please try again.",
                                Toast.LENGTH_LONG
                            ).show()
                        }
                    }
                }
            )
        }

        // Withdraw Screen
        composable(Screen.Withdraw.route) {
            WithdrawScreen(
                winningsBalance = walletBalance.formattedWinnings,
                onBackClick = { navController.popBackStack() },
                onNextClick = { amount ->
                    navController.navigate(Screen.WithdrawDetails.createRoute(amount))
                }
            )
        }

        // Withdraw Details Screen
        composable(
            route = Screen.WithdrawDetails.route,
            arguments = listOf(navArgument("amount") { type = NavType.StringType })
        ) { backStackEntry ->
            val amount = backStackEntry.arguments?.getString("amount") ?: "500"
            WithdrawDetailsScreen(
                withdrawAmount = amount,
                onBackClick = { navController.popBackStack() },
                onCompleteWithdrawal = {
                    navController.popBackStack(Screen.Main.route, inclusive = false)
                    MainTabController.selectTab(NavItem.PROFILE)
                }
            )
        }

        // Profile Details Screen
        composable(Screen.ProfileDetails.route) {
            ProfileScreen(
                userId = userProfile.userId,
                username = userProfile.username,
                phone = userProfile.phone,
                avatarId = userProfile.avatarId,
                avatarRes = userProfile.avatarRes,
                balance = walletBalance.formattedTotal,
                onBackClick = { navController.popBackStack() },
                onWalletClick = {
                    navController.popBackStack()
                    MainTabController.selectTab(NavItem.PROFILE)
                },
                onSupportClick = { navController.navigate(Screen.ContactUs.route) },
                onTransactionClick = { navController.navigate(Screen.TransactionHistory.route) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) }
            )
        }

        // Transaction History Screen
        composable(Screen.TransactionHistory.route) {
            TransactionHistoryScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        // Help Centre Screen
        composable(Screen.HelpCentre.route) {
            HelpCentreScreen(
                onBackClick = { navController.popBackStack() },
                onContactSupportClick = { navController.navigate(Screen.ContactUs.route) }
            )
        }

        // Reported Issues Screen
        composable(Screen.ReportedIssues.route) {
            ReportedIssuesScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        // About Us Screen
        composable(Screen.AboutUs.route) {
            AboutUsScreen(
                onBackClick = { navController.popBackStack() },
                onOpenLegalDoc = { docType ->
                    navController.navigate(Screen.LegalDocs.createRoute(docType))
                }
            )
        }

        // Contact Us Screen
        composable(Screen.ContactUs.route) {
            ContactUsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        // Fair Play Screen
        composable(Screen.FairPlay.route) {
            FairPlayScreen(
                onBackClick = { navController.popBackStack() }
            )
        }

        // Legal Documents Screen
        composable(
            route = Screen.LegalDocs.route,
            arguments = listOf(navArgument("docType") { type = NavType.StringType })
        ) { backStackEntry ->
            val docType = backStackEntry.arguments?.getString("docType") ?: "terms"
            LegalDocsScreen(
                docType = docType,
                onBackClick = { navController.popBackStack() }
            )
        }

        // Deposit Payment Screen
        composable(
            route = Screen.DepositPayment.route,
            arguments = listOf(navArgument("amount") { type = NavType.StringType })
        ) { backStackEntry ->
            val amountStr = backStackEntry.arguments?.getString("amount") ?: "100.0"
            val amount = amountStr.toDoubleOrNull() ?: 100.0
            DepositPaymentScreen(
                amountRupees = amount,
                onBackClick = { navController.popBackStack() }
            )
        }

        // VIP Club & Rewards Screen
        composable(Screen.VipRewards.route) {
            VipRewardsScreen(
                onBackClick = { navController.popBackStack() }
            )
        }
    }
}
