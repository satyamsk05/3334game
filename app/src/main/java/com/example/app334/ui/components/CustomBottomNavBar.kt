package com.example.app334.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.navigation.NavItem
import com.example.app334.ui.theme.*

@Composable
fun CustomBottomNavBar(
    selectedTab: NavItem,
    onTabSelected: (NavItem) -> Unit,
    modifier: Modifier = Modifier
) {
    val items = remember { NavItem.entries.toTypedArray() }
    val selectedIndex = items.indexOf(selectedTab).coerceAtLeast(0)

    val animatedIndex by animateFloatAsState(
        targetValue = selectedIndex.toFloat(),
        animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
        label = "TabIndicatorAnimation"
    )

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(Dimens.bottomNavHeight)
            .background(brush = BottomNavGradient)
            .padding(vertical = Dimens.spacing2xs)
    ) {
        BoxWithConstraints(
            modifier = Modifier.fillMaxSize()
        ) {
            val totalWidth = maxWidth
            val tabWidth = totalWidth / items.size
            val density = LocalDensity.current
            val tabWidthPx = with(density) { tabWidth.toPx() }

            // Sliding Active Solid Rounded Purple-Gradient Pill Indicator
            Box(
                modifier = Modifier
                    .graphicsLayer {
                        translationX = tabWidthPx * animatedIndex
                    }
                    .width(tabWidth)
                    .fillMaxHeight(),
                contentAlignment = Alignment.Center
            ) {
                Box(
                    modifier = Modifier
                        .width(Dimens.bottomNavIndicatorWidth)
                        .height(Dimens.bottomNavIndicatorHeight)
                        .background(
                            brush = ActiveTabIndicatorGradient,
                            shape = RoundedCornerShape(Dimens.radiusCard)
                        )
                )
            }

            // Tab Items Row
            Row(
                modifier = Modifier.fillMaxSize(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                items.forEach { item ->
                    val isSelected = item == selectedTab
                    val iconTint = if (isSelected) Color.White else Color.White.copy(alpha = 0.45f)
                    val fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium

                    val iconRes = when (item) {
                        NavItem.HOME -> R.drawable.ic_nav_home
                        NavItem.SHARE -> R.drawable.ic_nav_share
                        NavItem.REWARD -> R.drawable.ic_nav_reward
                        NavItem.PROFILE -> R.drawable.ic_nav_profile
                    }

                    val interactionSource = remember { MutableInteractionSource() }

                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .fillMaxHeight()
                            .clickable(
                                interactionSource = interactionSource,
                                indication = null
                            ) {
                                onTabSelected(item)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.Center
                        ) {
                            Icon(
                                painter = painterResource(id = iconRes),
                                contentDescription = item.title,
                                modifier = Modifier.size(22.dp),
                                tint = iconTint
                            )

                            Spacer(modifier = Modifier.height(2.dp))

                            Text(
                                text = item.title,
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                fontWeight = fontWeight,
                                color = iconTint
                            )
                        }
                    }
                }
            }
        }
    }
}
