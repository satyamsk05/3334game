package com.playingame.app.ui.navigation

import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

object MainTabController {
    private val _selectedTab = MutableStateFlow(NavItem.HOME)
    val selectedTab = _selectedTab.asStateFlow()

    fun selectTab(tab: NavItem) {
        _selectedTab.value = tab
    }
}
