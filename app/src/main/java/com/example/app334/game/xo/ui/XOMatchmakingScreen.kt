package com.example.app334.game.xo.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.xo.backend.XOGameRepository
import com.example.app334.game.xo.model.XORoomState
import com.example.app334.game.xo.model.XOTier
import kotlinx.coroutines.delay
import java.util.Locale

@Composable
fun XOMatchmakingScreen(
    tier: XOTier,
    onMatchFound: (XORoomState) -> Unit,
    modifier: Modifier = Modifier
) {
    val userProfile by WalletLedger.userProfile.collectAsState()
    val walletBalance by WalletLedger.walletBalance.collectAsState()

    // Rotating Radar Animation
    val infiniteTransition = rememberInfiniteTransition(label = "RadarSpin")
    val rotation by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "radarRotation"
    )

    // Opponent Avatars Roulette Simulation
    val sampleOpponents = remember {
        listOf("Anika D.", "Vikram S.", "Rahul_Gamer", "Pooja_99", "Kunal_X", "Sneha R.")
    }
    var currentOpponentName by remember { mutableStateOf("Searching...") }
    var currentOpponentInitial by remember { mutableStateOf("?") }

    LaunchedEffect(Unit) {
        // Fast cycling name effect
        val startTime = System.currentTimeMillis()
        while (System.currentTimeMillis() - startTime < 3500) {
            val name = sampleOpponents.random()
            currentOpponentName = name
            currentOpponentInitial = name.first().toString()
            delay(200)
        }

        // Call backend or local matchmaking
        val result = XOGameRepository.joinBattle(
            tier = tier,
            playerName = userProfile.username.ifEmpty { "Player" },
            userId = userProfile.userId
        )

        if (result.isSuccess) {
            val room = result.getOrThrow()
            currentOpponentName = room.player2?.name ?: "Opponent"
            currentOpponentInitial = currentOpponentName.first().toString()
            delay(1000)
            onMatchFound(room)
        }
    }

    // Purple Patterned Gaming Gradient
    val bgGradient = Brush.verticalGradient(
        colors = listOf(
            Color(0xFF220C40),
            Color(0xFF2D1152),
            Color(0xFF1E0A38),
            Color(0xFF120324)
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
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Top Game Logo Banner
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 16.dp)
            ) {
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
                            .padding(horizontal = 24.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "⚔️ XO BATTLE",
                            color = Color.White,
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = 1.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Battle Stake Capsule
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = Color(0xFF43197E),
                    modifier = Modifier.border(1.dp, Color(0xFF8B5CF6).copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 20.dp, vertical = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "⚔️ Battle ₹${String.format(Locale.getDefault(), "%.1f", tier.entryRupees)}",
                            color = Color.White,
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // 2. Middle 1v1 Battle Radar Arena (Matching Image 3)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Player Pod (You)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(76.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF4C1D95))
                            .border(3.dp, Color(0xFFEAB308), CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = (userProfile.username.firstOrNull() ?: 'P').uppercase(),
                            color = Color.White,
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = userProfile.username.ifEmpty { "Ayush kumar" },
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Surface(
                        shape = RoundedCornerShape(10.dp),
                        color = Color.White.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = "💳 ₹${walletBalance.totalRupees.toInt()}",
                            color = Color(0xFFE9D5FF),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                }

                // Golden VS Badge
                Box(
                    modifier = Modifier
                        .size(44.dp)
                        .clip(CircleShape)
                        .background(
                            Brush.linearGradient(
                                colors = listOf(Color(0xFFFBBF24), Color(0xFFD97706))
                            )
                        )
                        .shadow(8.dp, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "VS",
                        color = Color(0xFF451A03),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Black
                    )
                }

                // Right Player Pod (Animated Radar Opponent)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier.size(84.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Spinning Outer Dashed Ring
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .rotate(rotation)
                                .border(
                                    2.dp,
                                    Brush.sweepGradient(
                                        listOf(Color(0xFF8B5CF6), Color.Transparent, Color(0xFF10B981))
                                    ),
                                    CircleShape
                                )
                        )

                        // Opponent Avatar Circle
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF2E1065))
                                .border(2.dp, Color(0xFF8B5CF6).copy(alpha = 0.6f), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = currentOpponentInitial,
                                color = Color.White,
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = currentOpponentName,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // 3. Bottom Status & Warning Disclaimer
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(bottom = 16.dp)
            ) {
                Text(
                    text = "Starting...",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "You'll lose the game & entry fee if you\nleave now or close the app.",
                    color = Color(0xFF9CA3AF),
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp
                )
            }
        }
    }
}
