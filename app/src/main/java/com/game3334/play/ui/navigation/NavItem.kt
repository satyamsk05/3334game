package com.game3334.play.ui.navigation

import androidx.annotation.DrawableRes
import com.game3334.play.R

enum class NavItem(
    val title: String,
    @DrawableRes val iconRes: Int
) {
    HOME("Home", R.drawable.ic_nav_home),
    SHARE("Share", R.drawable.ic_nav_share),
    REWARD("Add Cash", R.drawable.ic_nav_reward),
    PROFILE("Account", R.drawable.ic_nav_profile)
}
