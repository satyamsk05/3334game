package com.example.app334.game.xo.ui

import android.widget.Toast
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.xo.backend.XOGameRepository
import com.example.app334.game.xo.model.XOTier
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

    // Vibrant Royal Purple Background Gradient matching Image 2
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF1E0B38),
            Color(0xFF280C4D),
            Color(0xFF18052E),
            Color(0xFF0F021F)
        )
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(brush = bgGradient)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 1. Top Header Bar (User Avatar, Name, Balance Pill)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(bottom = 12.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                // User Profile Pod
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    modifier = Modifier.weight(1f)
                ) {
                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF4C1D95))
                            .border(1.5.dp, Color(0xFFEAB308), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = (userProfile.username.firstOrNull() ?: 'P').uppercase(),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(
                            text = userProfile.username.ifEmpty { "Player" },
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Account ›",
                            color = Color(0xFF9CA3AF),
                            fontSize = 12.sp
                        )
                    }
                }

                // Balance Pill with '+'
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = Color(0xFF059669),
                    modifier = Modifier.clickable { onAddCashClick() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "💳 ${walletBalance.formattedTotal}",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.25f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Add,
                                contentDescription = "Add Cash",
                                tint = Color.White,
                                modifier = Modifier.size(14.dp)
                            )
                        }
                    }
                }
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
                            .background(Color.White.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Text(text = "Back", color = Color(0xFFD1D5DB), fontSize = 11.sp)
                }

                // Center 3D Style Game Banner
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF4C1D95),
                    modifier = Modifier.shadow(8.dp, RoundedCornerShape(12.dp))
                ) {
                    Box(
                        modifier = Modifier
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(Color(0xFF6D28D9), Color(0xFF9333EA))
                                )
                            )
                            .padding(horizontal = 20.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "⚔️ XO BATTLE",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
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
                            .background(Color.White.copy(alpha = 0.1f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "?",
                            color = Color.White,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Text(text = "Rules", color = Color(0xFFD1D5DB), fontSize = 11.sp)
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // 3. Middle Battle Stake Card (Matching Image 2 Reference)
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
                        containerColor = Color(0xFF5828A8).copy(alpha = 0.85f)
                    ),
                    modifier = Modifier
                        .fillMaxWidth(0.92f)
                        .shadow(16.dp, RoundedCornerShape(24.dp))
                        .border(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.5f), RoundedCornerShape(24.dp))
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
                                text = "⚔️ Battle",
                                color = Color.White,
                                fontSize = 16.sp,
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
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFF3B1578),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 14.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "1st Prize",
                                    color = Color(0xFFC4B5FD),
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium
                                )
                                Spacer(modifier = Modifier.height(2.dp))
                                Text(
                                    text = String.format(Locale.getDefault(), "₹%.2f", currentTier.firstPrizeRupees),
                                    color = Color.White,
                                    fontSize = 28.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        // 2nd Prize Pill Box
                        Surface(
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFF3B1578).copy(alpha = 0.7f),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(vertical = 10.dp),
                                horizontalAlignment = Alignment.CenterHorizontally
                            ) {
                                Text(
                                    text = "2nd Prize",
                                    color = Color(0xFF9CA3AF),
                                    fontSize = 12.sp
                                )
                                Text(
                                    text = "₹0.00",
                                    color = Color(0xFFE5E7EB),
                                    fontSize = 18.sp,
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
                                text = "Players: 👥 2",
                                color = Color(0xFFE5E7EB),
                                fontSize = 14.sp,
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
                            .background(Color(0xFFEAB308), CircleShape)
                    ) {
                        Text(text = "◀", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }

                // Right Arrow Selector
                if (selectedTierIndex < tiers.size - 1) {
                    IconButton(
                        onClick = { selectedTierIndex++ },
                        modifier = Modifier
                            .align(Alignment.CenterEnd)
                            .size(44.dp)
                            .background(Color(0xFFEAB308), CircleShape)
                    ) {
                        Text(text = "▶", color = Color.Black, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }

            // 4. Bonus Usage Tag
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = Color.White.copy(alpha = 0.08f),
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "🎟️ Use ₹${String.format(Locale.getDefault(), "%.2f", currentTier.bonusUsableRupees)} from Bonus",
                        color = Color(0xFFE9D5FF),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Medium
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
                    containerColor = Color(0xFF10B981)
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .shadow(12.dp, RoundedCornerShape(16.dp))
            ) {
                Text(
                    text = "Play for ₹${String.format(Locale.getDefault(), "%.0f", currentTier.entryRupees)}",
                    color = Color.White,
                    fontSize = 18.sp,
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
                Text(text = "📖 XO Battle Rules", fontWeight = FontWeight.Bold, color = Color.White)
            },
            text = {
                Column {
                    Text(
                        text = "1. Turn-based 1v1 multiplayer game.\n" +
                                "2. Player 1 gets 'O' (Purple), Player 2 gets 'X' (White).\n" +
                                "3. Connect 3 symbols in a row, column, or diagonal to WIN.\n" +
                                "4. 15 seconds timer per turn.\n" +
                                "5. Winner takes 1st Prize credited straight to Winnings wallet.",
                        color = Color(0xFFE5E7EB),
                        fontSize = 14.sp,
                        lineHeight = 20.sp
                    )
                }
            },
            confirmButton = {
                TextButton(onClick = { showRulesDialog = false }) {
                    Text(text = "GOT IT", color = Color(0xFF10B981), fontWeight = FontWeight.Bold)
                }
            },
            containerColor = Color(0xFF1F1235)
        )
    }
}
