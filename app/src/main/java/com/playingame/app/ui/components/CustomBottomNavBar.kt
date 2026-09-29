package com.playingame.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.playingame.app.R
import com.playingame.app.ui.navigation.NavItem
import com.playingame.app.ui.theme.Dimens
import com.playingame.app.ui.theme.NavBarBackground
import com.playingame.app.ui.theme.NavBarBorder
import com.playingame.app.ui.theme.TabActiveGold

private val BottomNavShape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)

@Composable
fun CustomBottomNavBar(
    selectedTab: NavItem,
    onTabSelected: (NavItem) -> Unit,
    modifier: Modifier = Modifier,
    isScrolling: Boolean = false
) {
    val items = remember { listOf(NavItem.HOME, NavItem.REWARD, NavItem.PROFILE) }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .shadow(elevation = 16.dp, shape = BottomNavShape, spotColor = Color.Black)
            .clip(BottomNavShape)
            .background(NavBarBackground)
            .border(
                width = 1.dp,
                color = NavBarBorder,
                shape = BottomNavShape
            )
            .height(Dimens.bottomNavHeight + 10.dp)
            .padding(top = 8.dp, bottom = 6.dp)
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
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center,
                        modifier = Modifier.fillMaxHeight()
                    ) {
                        when (item) {
                            NavItem.HOME -> {
                                RiveTabIcon(
                                    rawRes = R.raw.home_riv,
                                    inputName = "Tab Home",
                                    isSelected = isSelected,
                                    size = 30.dp,
                                    isScrolling = isScrolling
                                )
                            }
                            NavItem.REWARD -> {
                                RiveTabIcon(
                                    rawRes = R.raw.addcash_riv,
                                    inputName = "Tab Store",
                                    isSelected = isSelected,
                                    size = 30.dp,
                                    isScrolling = isScrolling
                                )
                            }
                            NavItem.PROFILE -> {
                                RiveTabIcon(
                                    rawRes = R.raw.profile_riv,
                                    inputName = "Tab Profile",
                                    isSelected = isSelected,
                                    size = 30.dp,
                                    isScrolling = isScrolling
                                )
                            }
                            else -> {}
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Active Indicator Bar (Golden line under active tab)
                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .width(28.dp)
                                    .height(3.dp)
                                    .clip(RoundedCornerShape(2.dp))
                                    .background(TabActiveGold)
                            )
                        } else {
                            Spacer(modifier = Modifier.height(3.dp))
                        }
                    }

                    // Clickable overlay over the whole tab column
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                onTabSelected(item)
                            }
                    )
                }
            }
        }
    }
}

