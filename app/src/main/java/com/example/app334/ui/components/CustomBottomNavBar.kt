package com.example.app334.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.example.app334.R
import com.example.app334.ui.navigation.NavItem
import com.example.app334.ui.theme.Dimens

@Composable
fun CustomBottomNavBar(
    selectedTab: NavItem,
    onTabSelected: (NavItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val items = remember { listOf(NavItem.HOME, NavItem.REWARD, NavItem.PROFILE) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .background(Color.Black)
            .height(Dimens.bottomNavHeight)
            .padding(vertical = Dimens.spacing2xs)
    ) {
        Row(
            modifier = Modifier.fillMaxSize(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            items.forEach { item ->
                val isSelected = item == selectedTab
                val interactionSource = remember { MutableInteractionSource() }

                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight(),
                    contentAlignment = Alignment.Center
                ) {
                    when (item) {
                        NavItem.HOME -> {
                            RiveTabIcon(
                                rawRes = R.raw.home_riv,
                                inputName = "Tab Home",
                                isSelected = isSelected,
                                size = 32.dp
                            )
                        }
                        NavItem.REWARD -> {
                            RiveTabIcon(
                                rawRes = R.raw.addcash_riv,
                                inputName = "Tab Store",
                                isSelected = isSelected,
                                size = 32.dp
                            )
                        }
                        NavItem.PROFILE -> {
                            RiveTabIcon(
                                rawRes = R.raw.profile_riv,
                                inputName = "Tab Profile",
                                isSelected = isSelected,
                                size = 32.dp
                            )
                        }
                        else -> {}
                    }

                    // Clickable overlay over the icon
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                android.util.Log.d("CustomBottomNav", "Tab clicked: $item, wasSelected: $isSelected")
                                onTabSelected(item)
                            }
                    )
                }
            }
        }
    }
}

