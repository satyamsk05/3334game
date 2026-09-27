package com.game3334.play.game.xo.ui

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
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
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.R
import com.game3334.play.game.ringoffuture.backend.WalletLedger
import com.game3334.play.game.xo.backend.XOGameRepository
import com.game3334.play.game.xo.model.XORoomState
import com.game3334.play.game.xo.model.XOTier
import com.game3334.play.ui.theme.AppBackground
import com.game3334.play.ui.theme.RubikFont
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
    val sampleOpponentAvatars = remember {
        listOf(
            R.drawable.avatar_2,
            R.drawable.avatar_3,
            R.drawable.avatar_4,
            R.drawable.avatar_5,
            R.drawable.avatar_6,
            R.drawable.avatar_7,
            R.drawable.avatar_8
        )
    }

    var currentOpponentName by remember { mutableStateOf("Searching...") }
    var currentOpponentAvatar by remember { mutableIntStateOf(R.drawable.avatar_2) }

    LaunchedEffect(Unit) {
        // Fast cycling name effect
        val startTime = System.currentTimeMillis()
        while (System.currentTimeMillis() - startTime < 3500) {
            val name = sampleOpponents.random()
            currentOpponentName = name
            currentOpponentAvatar = sampleOpponentAvatars.random()
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
            currentOpponentAvatar = sampleOpponentAvatars.random()
            delay(1000)
            onMatchFound(room)
        }
    }

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
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Top Game Logo Banner
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.padding(top = 16.dp)
            ) {
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
                        fontSize = 18.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 1.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Battle Stake Capsule
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF0F1015))
                        .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(16.dp))
                        .padding(horizontal = 20.dp, vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Battle ₹${String.format(Locale.getDefault(), "%.1f", tier.entryRupees)}",
                        color = Color.White,
                        fontSize = 15.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // 2. Middle 1v1 Battle Radar Arena
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Player Pod (You with Real 3D Avatar)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(76.dp)
                            .clip(CircleShape)
                            .border(3.dp, Color(0xFFFFB800), CircleShape)
                    ) {
                        Image(
                            painter = painterResource(id = userProfile.avatarRes),
                            contentDescription = "My Avatar",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = userProfile.username.ifEmpty { "Player" },
                        color = Color.White,
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    com.game3334.play.ui.components.WalletChip(
                        balance = "${walletBalance.totalPaise / 100}",
                        chipHeight = 24.dp,
                        coinSize = 26.dp,
                        fontSize = 12.sp,
                        minWidth = 60.dp
                    )
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
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black
                    )
                }

                // Right Player Pod (Animated Radar Opponent with 3D Avatar)
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier.size(84.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        // Spinning Outer Glow Ring
                        Box(
                            modifier = Modifier
                                .size(84.dp)
                                .rotate(rotation)
                                .border(
                                    2.dp,
                                    Brush.sweepGradient(
                                        listOf(Color(0xFFFFB800), Color.Transparent, Color(0xFF00E676))
                                    ),
                                    CircleShape
                                )
                        )

                        // Opponent 3D Avatar Circle
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .border(2.dp, Color(0xFF282E3E), CircleShape)
                        ) {
                            Image(
                                painter = painterResource(id = currentOpponentAvatar),
                                contentDescription = "Opponent Avatar",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = currentOpponentName,
                        color = Color.White,
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
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
                    text = "Starting Live Match...",
                    color = Color(0xFF00E676),
                    fontSize = 18.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(10.dp))

                Text(
                    text = "You'll lose the game & entry fee if you\nleave now or close the app.",
                    color = Color(0xFF9CA3AF),
                    fontSize = 12.sp,
                    fontFamily = RubikFont,
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp
                )
            }
        }
    }
}

