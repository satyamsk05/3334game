package com.example.app334.game.ringoffuture.ui

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.core.withInfiniteAnimationFrameMillis
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.GameBackendRepository
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.ringoffuture.components.SpinController
import com.example.app334.game.ringoffuture.components.WheelCanvas
import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.GamePhase
import com.example.app334.game.ringoffuture.model.WheelConfig

@OptIn(ExperimentalMaterial3Api::class)
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

    // Engine Lifecycle: Starts on enter, stops on dispose (refunds active bets if in BETTING)
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
    var showRulesModal by remember { mutableStateOf(false) }
    var showWithdrawModal by remember { mutableStateOf(false) }
    var withdrawInput by remember { mutableStateOf("500") }
    var upiInput by remember { mutableStateOf("user@upi") }
    var withdrawMsg by remember { mutableStateOf<String?>(null) }

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

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Ring of Future", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 18.sp)

                        // Wallet Pill Button
                        Surface(
                            color = WheelConfig.COLOR_SURFACE,
                            shape = RoundedCornerShape(20.dp),
                            modifier = Modifier.clickable { onOpenDepositScreen() }
                        ) {
                            Row(
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("💰 ", fontSize = 14.sp)
                                Text(
                                    walletBalance.formattedTotal,
                                    color = WheelConfig.COLOR_GOLD,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("+", color = Color.Green, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            }
                        }
                    }
                },
                navigationIcon = {
                    TextButton(onClick = onBackClick) {
                        Text("❮ Home", color = WheelConfig.COLOR_GOLD, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                },
                actions = {
                    IconButton(onClick = { showRulesModal = true }) {
                        Text("❓", fontSize = 18.sp)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = WheelConfig.COLOR_DARK_BACKGROUND)
            )
        },
        containerColor = WheelConfig.COLOR_DARK_BACKGROUND
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Live Status Banner
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = when (gameState.phase) {
                        GamePhase.BETTING -> Color(0xFF2E1547)
                        GamePhase.LOCKED -> Color(0xFF512DA8)
                        GamePhase.SPINNING -> Color(0xFFC2185B)
                        GamePhase.RESULT_SHOW -> Color(0xFF2E7D32)
                    }
                ),
                shape = RoundedCornerShape(20.dp),
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    val statusText = when (gameState.phase) {
                        GamePhase.BETTING -> "PLACE YOUR BETS: ${gameState.secondsRemaining}s"
                        GamePhase.LOCKED -> "BETS LOCKED 🔒"
                        GamePhase.SPINNING -> "WHEEL SPINNING... 🎡"
                        GamePhase.RESULT_SHOW -> if (gameState.lastWinAmount > 0) "YOU WON ₹${String.format("%.2f", gameState.lastWinAmount)}! 🎉" else "ROUND #${gameState.roundNumber} RESULT"
                    }
                    Text(statusText, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }

            // Wheel Canvas (Height 260dp)
            WheelCanvas(
                rotationAngle = rotationAngle,
                modifier = Modifier.size(260.dp)
            )

            // Recent History Row
            Column(modifier = Modifier.fillMaxWidth()) {
                Text("RECENT OUTCOMES", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(4.dp))
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(6.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    items(gameState.history) { item ->
                        Surface(
                            color = when (item.winningColor) {
                                ColorType.GREEN -> WheelConfig.COLOR_GREEN
                                ColorType.RED -> WheelConfig.COLOR_RED
                                ColorType.PURPLE -> WheelConfig.COLOR_PURPLE
                                ColorType.GREY -> WheelConfig.COLOR_GREY
                            },
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text(
                                item.multiplier.toString() + "x",
                                color = Color.White,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                            )
                        }
                    }
                }
            }

            // Color Betting Grid (~95% RTP multipliers: Green 30x, Red 5.06x, Purple 3.04x, Grey 2.03x)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BetSpotCard(
                    title = "GREEN",
                    multiplier = "30x",
                    color = WheelConfig.COLOR_GREEN,
                    betAmount = gameState.userBets.greenBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.GREEN, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient chips for bet!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                BetSpotCard(
                    title = "RED",
                    multiplier = "5.06x",
                    color = WheelConfig.COLOR_RED,
                    betAmount = gameState.userBets.redBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.RED, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient chips for bet!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                BetSpotCard(
                    title = "PURPLE",
                    multiplier = "3.04x",
                    color = WheelConfig.COLOR_PURPLE,
                    betAmount = gameState.userBets.purpleBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.PURPLE, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient chips for bet!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )

                BetSpotCard(
                    title = "GREY",
                    multiplier = "2.03x",
                    color = WheelConfig.COLOR_GREY,
                    betAmount = gameState.userBets.greyBet,
                    enabled = gameState.phase == GamePhase.BETTING,
                    onClick = {
                        val success = GameBackendRepository.placeBet(ColorType.GREY, gameState.selectedChip.toDouble())
                        if (!success) Toast.makeText(context, "Insufficient chips for bet!", Toast.LENGTH_SHORT).show()
                    },
                    modifier = Modifier.weight(1f)
                )
            }

            // Chips Selection Bar
            Text("SELECT CHIP AMOUNT", color = Color.Gray, fontSize = 11.sp, fontWeight = FontWeight.Bold)
            val chips = listOf(10, 50, 100, 500, 1000)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                chips.forEach { chip ->
                    val isSelected = gameState.selectedChip == chip
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(if (isSelected) WheelConfig.COLOR_GOLD else WheelConfig.COLOR_CARD)
                            .border(width = if (isSelected) 2.dp else 1.dp, color = Color.White, shape = CircleShape)
                            .clickable { GameBackendRepository.setSelectedChip(chip) },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            "₹$chip",
                            color = if (isSelected) Color.Black else Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 12.sp
                        )
                    }
                }
            }

            // Action Buttons (Clear, 2X Double, Withdraw)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = { GameBackendRepository.clearBets() },
                    enabled = gameState.phase == GamePhase.BETTING && gameState.userBets.totalBet > 0,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF546E7A)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("CLEAR", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = {
                        val success = GameBackendRepository.doubleBets()
                        if (!success) Toast.makeText(context, "Insufficient chips to double bets!", Toast.LENGTH_SHORT).show()
                    },
                    enabled = gameState.phase == GamePhase.BETTING && gameState.userBets.totalBet > 0,
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF8E24AA)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("2X DOUBLE", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = { showWithdrawModal = true },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFD81B60)),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier.weight(1f)
                ) {
                    Text("WITHDRAW", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }

            Spacer(modifier = Modifier.height(16.dp))
        }
    }

    // Rules Modal
    if (showRulesModal) {
        AlertDialog(
            onDismissRequest = { showRulesModal = false },
            containerColor = WheelConfig.COLOR_SURFACE,
            title = { Text("Ring of Future Rules 📖", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("• 32 Total Wheel Segments.", color = Color.LightGray)
                    Text("• 🟢 GREEN (1 Segment): 30x Multiplier Payout", color = WheelConfig.COLOR_GREEN, fontWeight = FontWeight.Bold)
                    Text("• 🔴 RED (6 Segments): 5.06x Multiplier Payout", color = WheelConfig.COLOR_RED, fontWeight = FontWeight.Bold)
                    Text("• 🟣 PURPLE (10 Segments): 3.04x Multiplier Payout", color = WheelConfig.COLOR_PURPLE, fontWeight = FontWeight.Bold)
                    Text("• ⚪ GREY (15 Segments): 2.03x Multiplier Payout", color = WheelConfig.COLOR_GREY, fontWeight = FontWeight.Bold)
                    Text("• Target ~95% RTP Fair Play Mode.", color = Color.Gray, fontSize = 12.sp)
                }
            },
            confirmButton = {
                Button(onClick = { showRulesModal = false }, colors = ButtonDefaults.buttonColors(containerColor = WheelConfig.COLOR_GOLD)) {
                    Text("CLOSE", color = Color.Black, fontWeight = FontWeight.Bold)
                }
            }
        )
    }

    // Withdraw Modal
    if (showWithdrawModal) {
        AlertDialog(
            onDismissRequest = { showWithdrawModal = false },
            containerColor = WheelConfig.COLOR_SURFACE,
            title = { Text("Request Withdrawal 💸", color = Color.White, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("Available Winnings: ${walletBalance.formattedWinnings}", color = WheelConfig.COLOR_GOLD, fontWeight = FontWeight.Bold)

                    OutlinedTextField(
                        value = withdrawInput,
                        onValueChange = { withdrawInput = it },
                        label = { Text("Amount to Withdraw (₹)", color = Color.Gray) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = upiInput,
                        onValueChange = { upiInput = it },
                        label = { Text("Enter Your UPI ID", color = Color.Gray) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                        modifier = Modifier.fillMaxWidth()
                    )

                    withdrawMsg?.let {
                        Text(it, color = Color.Red, fontSize = 12.sp)
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        val amount = withdrawInput.toDoubleOrNull() ?: 0.0
                        val res = GameBackendRepository.submitWithdrawalRequest(amount, upiInput)
                        if (res.first) {
                            showWithdrawModal = false
                            withdrawMsg = null
                            Toast.makeText(context, res.second, Toast.LENGTH_SHORT).show()
                        } else {
                            withdrawMsg = res.second
                        }
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50))
                ) {
                    Text("SUBMIT", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showWithdrawModal = false }) {
                    Text("CANCEL", color = Color.Gray)
                }
            }
        )
    }
}

@Composable
fun BetSpotCard(
    title: String,
    multiplier: String,
    color: Color,
    betAmount: Long,
    enabled: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD),
        shape = RoundedCornerShape(14.dp),
        modifier = modifier
            .border(width = if (betAmount > 0) 2.dp else 1.dp, color = if (betAmount > 0) color else Color(0xFF3D235C), shape = RoundedCornerShape(14.dp))
            .clickable(enabled = enabled, onClick = onClick)
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Surface(
                color = color,
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    title,
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(multiplier, color = WheelConfig.COLOR_GOLD, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                if (betAmount > 0) "Bet: ${WalletLedger.formatPaiseToRupees(betAmount)}" else "Tap to Bet",
                color = if (betAmount > 0) Color.White else Color.Gray,
                fontSize = 11.sp
            )
        }
    }
}
