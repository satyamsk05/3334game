package com.example.app334.game.ringoffuture.ui

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.withInfiniteAnimationFrameMillis
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.GameBackendRepository
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.ringoffuture.components.SpinController
import com.example.app334.game.ringoffuture.components.WheelCanvas
import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.game.ringoffuture.model.WheelConfig

@Composable
fun RingOfFutureScreen(
    onBackClick: () -> Unit,
    onOpenDepositScreen: () -> Unit
) {
    val context = LocalContext.current

    // System Back Handler
    BackHandler {
        onBackClick()
    }

    // Engine Lifecycle: Starts on enter, stops on dispose
    DisposableEffect(Unit) {
        GameBackendRepository.initEngine()
        onDispose {
            GameBackendRepository.stopEngine()
        }
    }

    val gameState by GameBackendRepository.gameState.collectAsState()
    val walletBalance by WalletLedger.walletBalance.collectAsState()

    val spinController = remember { SpinController() }
    var rotationAngle by remember { mutableStateOf(0f) }

    // Trigger Spin Controller on SPINNING phase
    LaunchedEffect(gameState.phase) {
        if (gameState.phase == GamePhase.SPINNING) {
            spinController.startSpin(gameState.winningSegmentIndex)
        }
    }

    // Frame Loop for Spin Animation
    LaunchedEffect(gameState.phase) {
        if (gameState.phase == GamePhase.SPINNING) {
            var lastTime = System.currentTimeMillis()
            while (spinController.isSpinning) {
                withInfiniteAnimationFrameMillis { frameTime ->
                    val now = System.currentTimeMillis()
                    val delta = (now - lastTime) / 1000f
                    lastTime = now
                    rotationAngle = spinController.update(delta)
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF140929))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState()),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // 1. Top Header Bar (Avatar + Wallet Balance)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(start = 16.dp, top = 40.dp, end = 16.dp, bottom = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // User Avatar (Left)
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color(0xFFFFD700), CircleShape)
                        .clickable { onBackClick() }
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.avatar_1),
                        contentDescription = "Profile Avatar",
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
                    )
                }

                // Balance Pill (Right) - e.g., ₹42.2 +
                Surface(
                    color = Color(0xFF00B050),
                    shape = RoundedCornerShape(20.dp),
                    modifier = Modifier.clickable { onOpenDepositScreen() }
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 14.dp, vertical = 7.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("👛 ", fontSize = 14.sp)
                        Text(
                            walletBalance.formattedTotal,
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("|  +", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    }
                }
            }

            // 2. Period & Count Down Section (Board.png style)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Period Info
                Column {
                    Text("Period", color = Color(0xFFA098B2), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        "20230708${gameState.roundNumber}",
                        color = Color.White,
                        fontSize = 17.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Count Down Info
                Column(horizontalAlignment = Alignment.End) {
                    Text("Count Down", color = Color(0xFFA098B2), fontSize = 12.sp, fontWeight = FontWeight.Medium)
                    Spacer(modifier = Modifier.height(3.dp))

                    val mins = gameState.secondsRemaining / 60
                    val secs = gameState.secondsRemaining % 60
                    val digit1 = (mins / 10).toString()
                    val digit2 = (mins % 10).toString()
                    val digit3 = (secs / 10).toString()
                    val digit4 = (secs % 10).toString()

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(3.dp)
                    ) {
                        DigitBox(digit1)
                        DigitBox(digit2)
                        Text(":", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                        DigitBox(digit3)
                        DigitBox(digit4)
                    }
                }
            }

            // 3. Recent History Pill Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.spacedBy(6.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    items(gameState.history.take(12)) { item ->
                        val pillColor = when (item.winningColor) {
                            ColorType.GREEN -> WheelConfig.COLOR_GREEN
                            ColorType.RED -> WheelConfig.COLOR_RED
                            ColorType.BLUE, ColorType.PURPLE -> WheelConfig.COLOR_BLUE
                            ColorType.BLACK, ColorType.GREY -> WheelConfig.COLOR_BLACK
                        }
                        Surface(
                            color = pillColor,
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.size(20.dp, 28.dp)
                        ) {}
                    }
                }

                // Rightmost active round indicator (?)
                Surface(
                    color = Color(0xFF281C44),
                    shape = RoundedCornerShape(6.dp),
                    border = BorderStroke(1.dp, Color.White),
                    modifier = Modifier.size(20.dp, 28.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text("?", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    }
                }
            }

            // Win Toast / Status Notification
            if (gameState.phase == GamePhase.RESULT_SHOW && gameState.lastWinAmount > 0) {
                Surface(
                    color = Color(0xFF2E7D32),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.padding(vertical = 4.dp)
                ) {
                    Text(
                        "🎉 YOU WON ₹${WalletLedger.formatPaiseToRupees(gameState.lastWinAmount)}!",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                    )
                }
            } else if (gameState.phase == GamePhase.SPINNING) {
                Text(
                    "WHEEL SPINNING...",
                    color = Color(0xFFFFD700),
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(vertical = 4.dp)
                )
            }

            // 4. Wheel Canvas (260dp)
            WheelCanvas(
                rotationAngle = rotationAngle,
                modifier = Modifier
                    .size(260.dp)
                    .padding(vertical = 4.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))

            // 5. Color Betting Cards 2x2 Grid (Board.png style)
            // Row 1: Black (2x) & Red (3x)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ColorBetCard(
                    multiplierText = "2x",
                    backgroundColor = WheelConfig.COLOR_BLACK,
                    betAmount = gameState.userBets.blackBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.BLACK, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient balance!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(95.dp)
                )

                ColorBetCard(
                    multiplierText = "3x",
                    backgroundColor = WheelConfig.COLOR_RED,
                    betAmount = gameState.userBets.redBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.RED, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient balance!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(95.dp)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Row 2: Blue (5x) & Green (50x)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                ColorBetCard(
                    multiplierText = "5x",
                    backgroundColor = WheelConfig.COLOR_BLUE,
                    betAmount = gameState.userBets.blueBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.BLUE, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient balance!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(95.dp)
                )

                ColorBetCard(
                    multiplierText = "50x",
                    backgroundColor = WheelConfig.COLOR_GREEN,
                    betAmount = gameState.userBets.greenBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.GREEN, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient balance!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier
                        .weight(1f)
                        .height(95.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // 6. Bottom Chip Selection Bar (Board.png style)
            Surface(
                color = Color(0xFF1B0E33),
                shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val chipValues = listOf(10 to "10", 50 to "50", 100 to "100", 500 to "500", 1000 to "1K")
                    chipValues.forEach { (value, label) ->
                        val isSelected = gameState.selectedChip == value
                        Surface(
                            color = if (isSelected) Color(0xFF2B374A) else Color(0xFF120826),
                            shape = RoundedCornerShape(8.dp),
                            border = BorderStroke(
                                width = if (isSelected) 2.dp else 1.dp,
                                color = if (isSelected) Color(0xFF3B93FF) else Color(0xFF3B295A)
                            ),
                            modifier = Modifier
                                .size(56.dp, 38.dp)
                                .clickable { GameBackendRepository.setSelectedChip(value) }
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Text(
                                    label,
                                    color = if (isSelected) Color.White else Color(0xFFA098B2),
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun DigitBox(digit: String) {
    Surface(
        color = Color.White,
        shape = RoundedCornerShape(4.dp),
        modifier = Modifier.size(24.dp, 28.dp)
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(
                digit,
                color = Color.Black,
                fontWeight = FontWeight.Bold,
                fontSize = 16.sp
            )
        }
    }
}

@Composable
private fun ColorBetCard(
    multiplierText: String,
    backgroundColor: Color,
    betAmount: Long,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = backgroundColor),
        shape = RoundedCornerShape(16.dp),
        modifier = modifier
            .border(
                width = if (betAmount > 0) 3.dp else 0.dp,
                color = if (betAmount > 0) Color(0xFFFFD700) else Color.Transparent,
                shape = RoundedCornerShape(16.dp)
            )
            .clickable(enabled = enabled, onClick = onClick)
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    multiplierText,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 32.sp
                )
                if (betAmount > 0) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        "Bet: ${WalletLedger.formatPaiseToRupees(betAmount)}",
                        color = Color(0xFFFFD700),
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
