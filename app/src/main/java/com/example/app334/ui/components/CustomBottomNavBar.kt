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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.navigation.NavItem
import com.example.app334.ui.theme.RubikFont
import androidx.compose.ui.graphics.graphicsLayer

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
            .height(65.dp)
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF2C0C3E),
                        Color(0xFF1B0626)
                    )
                )
            )
            .padding(vertical = 2.dp)
    ) {
        BoxWithConstraints(
            modifier = Modifier.fillMaxSize()
        ) {
            val totalWidth = maxWidth
            val tabWidth = totalWidth / items.size
            val density = LocalDensity.current
            val tabWidthPx = with(density) { tabWidth.toPx() }

            // Sliding Active White Box Indicator (GPU Accelerated graphicsLayer)
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
                        .width(66.dp)
                        .height(55.dp)
                        .background(
                            color = Color.White.copy(alpha = 0.18f),
                            shape = RoundedCornerShape(10.dp)
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
                    val iconTint = if (isSelected) Color.White else Color.White.copy(alpha = 0.5f)
                    val fontWeight = if (isSelected) FontWeight.W700 else FontWeight.W500

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
                            .height(55.dp)
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
                            Box(
                                modifier = Modifier.size(30.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = iconRes),
                                    contentDescription = item.title,
                                    modifier = Modifier.size(30.dp),
                                    tint = iconTint
                                )
                            }

                            Spacer(modifier = Modifier.height(0.dp))
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
