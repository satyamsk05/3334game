package com.game3334.play.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.R
import com.game3334.play.ui.theme.AppBackground
import com.game3334.play.ui.theme.RubikFont

@Composable
fun WalletScreen(
    balance: String = "₹33.2",
    depositBalance: String = "₹1.75",
    winningsBalance: String = "₹31.45",
    rewardsBalance: String = "₹1.5",
    onAddCashClick: () -> Unit = {},
    onWithdrawClick: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onSupportClick: () -> Unit = {},
    onAllTransactionsClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .background(AppBackground)
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. Top Header Row: "Wallet" + Support & Settings Buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 12.dp, bottom = 4.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Wallet",
                fontSize = 24.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            Row(
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // Support Action Card
                Box(
                    modifier = Modifier
                        .width(66.dp)
                        .height(66.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF161922))
                        .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(14.dp))
                        .clickable { onSupportClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_headset),
                            contentDescription = "Support",
                            modifier = Modifier.size(22.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Support",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD1D5DB)
                        )
                    }
                }

                // Settings Action Card
                Box(
                    modifier = Modifier
                        .width(66.dp)
                        .height(66.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF161922))
                        .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(14.dp))
                        .clickable { onSettingsClick() },
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_setting),
                            contentDescription = "Settings",
                            modifier = Modifier.size(22.dp),
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "Settings",
                            fontSize = 11.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD1D5DB)
                        )
                    }
                }
            }
        }

        // 2. Balance Summary Header Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Total Balance",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF8E899B)
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = balance,
                    fontSize = 28.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White
                )
            }

            // All Transactions Pill Button
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF161922))
                    .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(12.dp))
                    .clickable { onAllTransactionsClick() }
                    .padding(horizontal = 16.dp, vertical = 10.dp),
                contentAlignment = Alignment.Center
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "All Transactions",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W700,
                        color = Color.White
                    )
                    Text(
                        text = "›",
                        fontSize = 16.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }

        // 3. Main Balance Breakdown Container Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF0F1015))
                .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Deposit Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "Deposit",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF9E97AA)
                            )
                            Text(
                                text = "ⓘ",
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                color = Color(0xFF8E899B)
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = depositBalance,
                            fontSize = 24.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }

                    // Green ADD CASH Button
                    Box(
                        modifier = Modifier
                            .width(155.dp)
                            .height(46.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0xFF00E676),
                                        Color(0xFF00B050)
                                    )
                                )
                            )
                            .clickable { onAddCashClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_wallet),
                                contentDescription = "Add",
                                modifier = Modifier.size(16.dp),
                                tint = Color.White
                            )
                            Text(
                                text = "ADD CASH",
                                fontSize = 14.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }

                HorizontalDivider(color = Color(0xFF1E222D), thickness = 1.dp)

                // Winnings Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "Winnings",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF9E97AA)
                            )
                            Text(
                                text = "ⓘ",
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                color = Color(0xFF8E899B)
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = winningsBalance,
                            fontSize = 24.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }

                    // Amber Gold WITHDRAW Button
                    Box(
                        modifier = Modifier
                            .width(155.dp)
                            .height(46.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0xFFFFB800),
                                        Color(0xFFFF9100)
                                    )
                                )
                            )
                            .clickable { onWithdrawClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "₹ ↓ WITHDRAW",
                            fontSize = 14.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White,
                            letterSpacing = 0.5.sp
                        )
                    }
                }

                HorizontalDivider(color = Color(0xFF1E222D), thickness = 1.dp)

                // Bonus Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "Bonus",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF9E97AA)
                            )
                            Text(
                                text = "ⓘ",
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                color = Color(0xFF8E899B)
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = rewardsBalance,
                            fontSize = 24.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }

                    // Sleek Dark PLAY TO USE Button
                    Box(
                        modifier = Modifier
                            .width(155.dp)
                            .height(46.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF181B24))
                            .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(10.dp))
                            .clickable { /* Play to use */ },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = "PLAY TO USE",
                                fontSize = 12.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White,
                                letterSpacing = 0.5.sp
                            )
                            Text(
                                text = "▶",
                                fontSize = 10.sp,
                                fontFamily = RubikFont,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // 4. Best Deal Special Offer Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 4.dp, bottom = 20.dp)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF0F1015))
                    .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                    .padding(horizontal = 18.dp, vertical = 18.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "₹500",
                            fontSize = 26.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "+ ₹90 Cashback",
                            fontSize = 12.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W700,
                            color = Color(0xFF00E676)
                        )
                    }

                    // Green + ADD Button
                    Box(
                        modifier = Modifier
                            .width(120.dp)
                            .height(46.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(
                                brush = Brush.verticalGradient(
                                    colors = listOf(
                                        Color(0xFF00E676),
                                        Color(0xFF00B050)
                                    )
                                )
                            )
                            .clickable { onAddCashClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "+ ADD",
                            fontSize = 15.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }
                }
            }

            // BEST DEAL Tag Pill Overlay
            Box(
                modifier = Modifier
                    .offset(x = 16.dp, y = 0.dp)
                    .clip(RoundedCornerShape(6.dp))
                    .background(Color(0xFFEF4444))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "BEST DEAL",
                    fontSize = 10.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}
