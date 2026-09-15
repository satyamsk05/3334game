package com.example.app334.ui.navigation

import androidx.annotation.DrawableRes
import com.example.app334.R

enum class NavItem(
    val title: String,
    @DrawableRes val iconRes: Int
) {
    HOME("Home", R.drawable.ic_nav_home),
    SHARE("Share", R.drawable.ic_nav_share),
    REWARD("Reward", R.drawable.ic_nav_reward),
    PROFILE("Account", R.drawable.ic_nav_profile)
}
