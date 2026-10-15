package com.playingame.app.ui.navigation

sealed class Screen(val route: String) {
    object Main : Screen("main")
    object DragonTiger : Screen("game_dragon_tiger")
    object Settings : Screen("settings")
    object Withdraw : Screen("withdraw")
    object WithdrawDetails : Screen("withdraw_details/{amount}") {
        fun createRoute(amount: String) = "withdraw_details/$amount"
    }
    object ProfileDetails : Screen("profile_details")
    object TransactionHistory : Screen("transaction_history")
    object HelpCentre : Screen("help_centre")
    object ReportedIssues : Screen("reported_issues")
    object AboutUs : Screen("about_us")
    object ContactUs : Screen("contact_us")
    object FairPlay : Screen("fair_play")
    object LegalDocs : Screen("legal_docs/{docType}") {
        fun createRoute(docType: String) = "legal_docs/$docType"
    }
    object DepositPayment : Screen("deposit_payment/{amount}") {
        fun createRoute(amount: Double) = "deposit_payment/$amount"
    }
    object VipRewards : Screen("vip_rewards")
}
