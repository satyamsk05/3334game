package com.playingame.app.game.xo.ui

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.game.xo.backend.XOGameRepository
import com.playingame.app.game.xo.model.XOTier
import com.playingame.app.ui.theme.AppBackground
import com.playingame.app.ui.theme.RubikFont
import java.util.Locale

@Composable
fun XOLobbyScreen(
    onBackClick: () -> Unit,
    onPlayClick: (XOTier) -> Unit,
    onAddCashClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()

    val tiers = remember { XOGameRepository.defaultTiers }
    var selectedTierIndex by remember { mutableIntStateOf(0) }
    val currentTier = tiers[selectedTierIndex]

    var showRulesDialog by remember { mutableStateOf(false) }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(AppBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 1. Top Header Bar (User 3D Avatar, Name, Balance Pill)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // User Profile Pod with Real 3D Avatar
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .border(2.dp, Color(0xFFFFB800), CircleShape)
                    ) {
                        Image(
                            painter = painterResource(id = userProfile.avatarRes),
                            contentDescription = "Profile Avatar",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = userProfile.username.ifEmpty { "Player" },
                            color = Color.White,
                            fontSize = 15.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Account ›",
                            color = Color(0xFF9CA3AF),
                            fontSize = 12.sp,
                            fontFamily = RubikFont
                        )
                    }
                }

                // Balance Chip with 3D Gold Star Coin
                val chipBalance = if (walletBalance.totalPaise % 100 == 0L) {
                    "${walletBalance.totalPaise / 100}"
                } else {
                    String.format(Locale.getDefault(), "%.2f", walletBalance.totalRupees)
                }

                com.playingame.app.ui.components.WalletChip(
                    balance = chipBalance,
                    onClick = onAddCashClick
                )
            }

            // 2. Navigation Actions (< Back, Center Title, ? Rules)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // Back Button
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable { onBackClick() }
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF161922))
                            .border(1.dp, Color(0xFF282E3E), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(text = "Back", color = Color(0xFFD1D5DB), fontSize = 11.sp, fontFamily = RubikFont)
                }

                // Center Game Title Banner
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF161922))
                        .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(14.dp))
                        .padding(horizontal = 24.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "XO BATTLE",
                        color = Color(0xFFFFB800),
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }

                // Rules Button
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.clickable { showRulesDialog = true }
                ) {
                    Box(
                        modifier = Modifier
                            .size(38.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF161922))
                            .border(1.dp, Color(0xFF282E3E), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "?",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(text = "Rules", color = Color(0xFFD1D5DB), fontSize = 11.sp, fontFamily = RubikFont)
                }
            }

            Spacer(modifier = Modifier.height(20.dp))

            // 3. Middle Battle Stake Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                // Battle Card Box
                Card(
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF0F1015)
                    ),
                    modifier = Modifier
                        .fillMaxWidth(0.92f)
                        .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(24.dp))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        // Top Battle Header
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(20.dp, 2.dp)
                                    .background(Color.White.copy(alpha = 0.4f))
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Battle Tier",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Box(
                                modifier = Modifier
                                    .size(20.dp, 2.dp)
                                    .background(Color.White.copy(alpha = 0.4f))
                            )
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        // 1st Prize Pill Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFF181B24))
                                .border(1.dp, Color(0xFF282E3E), RoundedCornerShape(16.dp))
                                .padding(vertical = 14.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "1st Prize",
                                    color = Color(0xFFFFB800),
                                    fontSize = 13.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = String.format(Locale.getDefault(), "₹%.2f", currentTier.firstPrizeRupees),
                                    color = Color.White,
                                    fontSize = 28.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // 2nd Prize Pill Box
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFF12141C))
                                .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "2nd Prize",
                                    color = Color(0xFF9CA3AF),
                                    fontSize = 12.sp,
                                    fontFamily = RubikFont
                                )
                                Text(
                                    text = "₹0.00",
                                    color = Color(0xFFE5E7EB),
                                    fontSize = 18.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Players Count
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Players: 2 (1v1 Live)",
                                color = Color(0xFF9CA3AF),
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    }
                }

                // Left Arrow Selector
                if (selectedTierIndex > 0) {
                    IconButton(
                        onClick = { selectedTierIndex-- },
                        modifier = Modifier
                            .align(Alignment.CenterStart)
                            .size(44.dp)
                            .background(Color(0xFFFFB800), CircleShape)
                    ) {
                        Text(text = "◀", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    }
                }

                // Right Arrow Selector
                if (selectedTierIndex < tiers.size - 1) {
                    IconButton(
                        onClick = { selectedTierIndex++ },
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .size(44.dp)
                            .background(Color(0xFFFFB800), CircleShape)
                    ) {
                        Text(text = "▶", color = Color.Black, fontWeight = FontWeight.Black, fontSize = 16.sp)
                    }
                }
            }

            // 4. Bonus Usage Tag
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color(0xFF161922),
                border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF282E3E)),
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Use ₹${String.format(Locale.getDefault(), "%.2f", currentTier.bonusUsableRupees)} from Bonus",
                        color = Color(0xFF00E676),
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // 5. Big Vibrant Green Play Button
            Button(
                onClick = {
                    if (walletBalance.totalRupees < currentTier.entryRupees) {
                        Toast.makeText(context, "Insufficient balance! Please Add Cash.", Toast.LENGTH_SHORT).show()
                        onAddCashClick()
                    } else {
                        onPlayClick(currentTier)
                    }
                },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF00E676)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
            ) {
                Text(
                    text = "Play for ₹${String.format(Locale.getDefault(), "%.0f", currentTier.entryRupees)}",
                    color = Color.Black,
                    fontSize = 18.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black
                )
            }
        }
    }

    // Rules Dialog
    if (showRulesDialog) {
        AlertDialog(
            onDismissRequest = { showRulesDialog = false },
            title = {
                Text(text = "XO Battle Rules", fontFamily = RubikFont, fontWeight = FontWeight.Bold, color = Color.White)
            },
            text = {
                Column {
                    Text(
                        text = "1. Turn-based 1v1 multiplayer game.\n" +
                                "2. Player 1 gets 'O' (Gold), Player 2 gets 'X' (White).\n" +
                                "3. Connect 3 symbols in a row, column, or diagonal to WIN.\n" +
                                "4. 15 seconds timer per turn.\n" +
                                "5. Winner takes 1st Prize credited straight to Winnings wallet.",
                        color = Color(0xFFD1D5DB),
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        lineHeight = 20.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showRulesDialog = false }) {
                    Text(text = "GOT IT", color = Color(0xFF00E676), fontFamily = RubikFont, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = Color(0xFF0F1015)
        )
    }
}
