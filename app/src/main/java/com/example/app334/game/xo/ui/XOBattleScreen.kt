package com.example.app334.game.xo.ui

import androidx.compose.animation.*
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.WalletLedger
import com.example.app334.game.xo.backend.XOGameRepository
import com.example.app334.game.xo.model.XORoomState
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.util.Locale

@Composable
fun XOBattleScreen(
    initialRoom: XORoomState,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val coroutineScope = rememberCoroutineScope()
    val userProfile by WalletLedger.userProfile.collectAsState()

    var roomState by remember { mutableStateOf(initialRoom) }
    var board by remember { mutableStateOf(initialRoom.board) }
    var currentTurnUserId by remember { mutableStateOf(initialRoom.currentTurnUserId) }
    var isGameOver by remember { mutableStateOf(false) }
    var winnerUserId by remember { mutableStateOf<String?>(null) }
    var isDraw by remember { mutableStateOf(false) }
    var winningIndices by remember { mutableStateOf<List<Int>?>(null) }

    var gameSecondsRemaining by remember { mutableIntStateOf(163) } // 02:43 timer
    var turnSecondsRemaining by remember { mutableIntStateOf(15) }

    val myUserId = userProfile.userId
    val isMyTurn = currentTurnUserId == myUserId

    // Pulsing animation for active player turn ring
    val infiniteTransition = rememberInfiniteTransition(label = "TurnPulse")
    val turnBorderAlpha by infiniteTransition.animateFloat(
        initialValue = 0.4f,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "turnBorderAlpha"
    )

    // Game Timer Loop (Total Time + 15s Turn Timer)
    LaunchedEffect(isGameOver) {
        while (!isGameOver && gameSecondsRemaining > 0) {
            delay(1000)
            gameSecondsRemaining--
            turnSecondsRemaining--

            if (turnSecondsRemaining <= 0) {
                turnSecondsRemaining = 15
                // Switch turn
                currentTurnUserId = if (currentTurnUserId == myUserId) {
                    roomState.player2?.userId ?: "BOT"
                } else {
                    myUserId
                }
            }
        }
    }

    // Bot Auto-Move Simulation
    LaunchedEffect(currentTurnUserId, isGameOver) {
        if (!isGameOver && currentTurnUserId != myUserId && roomState.player2?.isBot == true) {
            delay((1200..2200L).random())
            if (!isGameOver) {
                val emptyCells = board.indices.filter { board[it] == null }
                if (emptyCells.isNotEmpty()) {
                    // Try smart move: win or block, else random
                    val botMove = findSmartMove(board, "X", "O") ?: emptyCells.random()
                    val newBoard = board.toMutableList().apply { set(botMove, "X") }
                    board = newBoard

                    // Check Win/Draw
                    val win = checkWinLines(newBoard)
                    if (win != null) {
                        winningIndices = win
                        winnerUserId = roomState.player2?.userId
                        isGameOver = true
                    } else if (newBoard.all { it != null }) {
                        isDraw = true
                        isGameOver = true
                        WalletLedger.creditWin(Math.round(roomState.tier.entryRupees * 100), "XO Draw Refund")
                    } else {
                        currentTurnUserId = myUserId
                        turnSecondsRemaining = 15
                    }
                }
            }
        }
    }

    // Handle User Tile Click
    fun onCellClicked(index: Int) {
        if (!isMyTurn || isGameOver || board[index] != null) return

        val newBoard = board.toMutableList().apply { set(index, "O") }
        board = newBoard
        turnSecondsRemaining = 15

        coroutineScope.launch {
            XOGameRepository.submitMove(roomState.roomId, index, myUserId)
        }

        // Check Win/Draw
        val win = checkWinLines(newBoard)
        if (win != null) {
            winningIndices = win
            winnerUserId = myUserId
            isGameOver = true
            // Credit Winnings straight to wallet
            val prizePaise = Math.round(roomState.tier.firstPrizeRupees * 100)
            WalletLedger.creditWin(prizePaise, "Won 1v1 ${roomState.tier.name}")
        } else if (newBoard.all { it != null }) {
            isDraw = true
            isGameOver = true
            WalletLedger.creditWin(Math.round(roomState.tier.entryRupees * 100), "XO Draw Refund")
        } else {
            currentTurnUserId = roomState.player2?.userId ?: "BOT"
        }
    }

    // Modern Dark Sleek Theme Matching Image 1
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF14151B)) // Deep dark matte slate
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .statusBarsPadding()
                .navigationBarsPadding()
                .padding(horizontal = 20.dp, vertical = 12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // 1. Top Header (< Back, Game, ✕ Close)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                IconButton(onClick = { onBackClick() }) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back",
                        tint = Color.White
                    )
                }

                Text(
                    text = "Game",
                    color = Color.White,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                IconButton(onClick = { onBackClick() }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Close",
                        tint = Color.White
                    )
                }
            }

            // 2. Large Centered Countdown Timer (02:43)
            val minutes = gameSecondsRemaining / 60
            val seconds = gameSecondsRemaining % 60
            val timerText = String.format(Locale.getDefault(), "%02d:%02d", minutes, seconds)

            Text(
                text = timerText,
                color = if (gameSecondsRemaining <= 15) Color(0xFFEF4444) else Color.White,
                fontSize = 38.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(vertical = 4.dp)
            )

            // 3. Dual Player Battle Podiums (Matching Image 1)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Left Player (You - 'O' Purple)
                val isP1Turn = currentTurnUserId == myUserId
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Card(
                        shape = RoundedCornerShape(28.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1E26)),
                        modifier = Modifier
                            .width(100.dp)
                            .then(
                                if (isP1Turn) Modifier.border(
                                    2.5.dp,
                                    Color(0xFF10B981).copy(alpha = turnBorderAlpha),
                                    RoundedCornerShape(28.dp)
                                ) else Modifier
                            )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Circular Avatar
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF4C1D95)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = (userProfile.username.firstOrNull() ?: 'P').uppercase(),
                                    color = Color.White,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            // Purple 'O' Symbol
                            Text(
                                text = "O",
                                color = Color(0xFFC084FC),
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black
                            )
                            // Score Indicator
                            Text(
                                text = "3",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF1E202B),
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
                        Text(
                            text = userProfile.username.ifEmpty { "Ayush kumar" },
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }

                // Right Player (Opponent - 'X' White)
                val isP2Turn = currentTurnUserId != myUserId
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Card(
                        shape = RoundedCornerShape(28.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF1C1E26)),
                        modifier = Modifier
                            .width(100.dp)
                            .then(
                                if (isP2Turn) Modifier.border(
                                    2.5.dp,
                                    Color(0xFF10B981).copy(alpha = turnBorderAlpha),
                                    RoundedCornerShape(28.dp)
                                ) else Modifier
                            )
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 12.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            // Circular Avatar
                            Box(
                                modifier = Modifier
                                    .size(60.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF0F766E)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = (roomState.player2?.name?.firstOrNull() ?: 'A').uppercase(),
                                    color = Color.White,
                                    fontSize = 24.sp,
                                    fontWeight = FontWeight.Black
                                )
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            // White 'X' Symbol
                            Text(
                                text = "✕",
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Black
                            )
                            // Score Indicator
                            Text(
                                text = "1",
                                color = Color.White,
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Surface(
                        shape = RoundedCornerShape(16.dp),
                        color = Color(0xFF1E202B),
                        modifier = Modifier.padding(horizontal = 4.dp)
                    ) {
                        Text(
                            text = roomState.player2?.name ?: "Anika Donin",
                            color = Color.White,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }
            }

            // 4. Main 3x3 Tactile Game Board (Matching Image 1)
            Surface(
                shape = RoundedCornerShape(32.dp),
                color = Color(0xFF1E202B), // Smooth dark matte container
                modifier = Modifier
                    .fillMaxWidth(0.95f)
                    .aspectRatio(1f)
                    .padding(8.dp)
                    .shadow(16.dp, RoundedCornerShape(32.dp))
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(14.dp),
                    verticalArrangement = Arrangement.SpaceBetween
                ) {
                    for (row in 0..2) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            for (col in 0..2) {
                                val cellIndex = row * 3 + col
                                val cellValue = board[cellIndex]
                                val isWinningCell = winningIndices?.contains(cellIndex) == true

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .fillMaxHeight()
                                        .padding(5.dp)
                                        .clip(RoundedCornerShape(18.dp))
                                        .background(
                                            if (isWinningCell) Color(0xFF10B981).copy(alpha = 0.35f)
                                            else Color(0xFF15161D)
                                        )
                                        .clickable { onCellClicked(cellIndex) },
                                    contentAlignment = Alignment.Center
                                ) {
                                    if (cellValue == "O") {
                                        // Thick Neon Purple Ring
                                        Canvas(modifier = Modifier.size(44.dp)) {
                                            drawCircle(
                                                color = Color(0xFFC084FC),
                                                radius = size.minDimension / 2.5f,
                                                style = Stroke(width = 11.dp.toPx(), cap = StrokeCap.Round)
                                            )
                                        }
                                    } else if (cellValue == "X") {
                                        // Crisp Bold White Cross
                                        Canvas(modifier = Modifier.size(38.dp)) {
                                            val strokeWidth = 11.dp.toPx()
                                            drawLine(
                                                color = Color.White,
                                                start = Offset(0f, 0f),
                                                end = Offset(size.width, size.height),
                                                strokeWidth = strokeWidth,
                                                cap = StrokeCap.Round
                                            )
                                            drawLine(
                                                color = Color.White,
                                                start = Offset(size.width, 0f),
                                                end = Offset(0f, size.height),
                                                strokeWidth = strokeWidth,
                                                cap = StrokeCap.Round
                                            )
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // 5. Turn Status Bar
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = if (isMyTurn) Color(0xFF059669) else Color(0xFF374151),
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Text(
                    text = if (isMyTurn) "👉 YOUR TURN (${turnSecondsRemaining}s)" else "⏳ OPPONENT'S TURN (${turnSecondsRemaining}s)",
                    color = Color.White,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 20.dp, vertical = 8.dp)
                )
            }
        }
    }

    // Victory / Defeat / Draw Result Modal
    if (isGameOver) {
        AlertDialog(
            onDismissRequest = { },
            title = {
                Text(
                    text = when {
                        winnerUserId == myUserId -> "🎉 VICTORY!"
                        isDraw -> "🤝 MATCH DRAW"
                        else -> "💔 DEFEAT"
                    },
                    fontWeight = FontWeight.Black,
                    fontSize = 24.sp,
                    color = when {
                        winnerUserId == myUserId -> Color(0xFF10B981)
                        isDraw -> Color(0xFFFBBF24)
                        else -> Color(0xFFEF4444)
                    },
                    textAlign = TextAlign.Center,
                    modifier = Modifier.fillMaxWidth()
                )
            },
            text = {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = when {
                            winnerUserId == myUserId -> "Congratulations! You won ₹${String.format(Locale.getDefault(), "%.2f", roomState.tier.firstPrizeRupees)}"
                            isDraw -> "Entry fee of ₹${String.format(Locale.getDefault(), "%.2f", roomState.tier.entryRupees)} refunded."
                            else -> "Better luck next time!"
                        },
                        color = Color.White,
                        fontSize = 16.sp,
                        textAlign = TextAlign.Center
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { onBackClick() },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = "BACK TO LOBBY", color = Color.White, fontWeight = FontWeight.Bold)
                }
            },
            containerColor = Color(0xFF1E202B),
            shape = RoundedCornerShape(24.dp)
        )
    }
}

// Helpers
private fun checkWinLines(b: List<String?>): List<Int>? {
    val lines = listOf(
        listOf(0, 1, 2), listOf(3, 4, 5), listOf(6, 7, 8),
        listOf(0, 3, 6), listOf(1, 4, 7), listOf(2, 5, 8),
        listOf(0, 4, 8), listOf(2, 4, 6)
    )
    for (line in lines) {
        val (a, bIdx, c) = line
        if (b[a] != null && b[a] == b[bIdx] && b[a] == b[c]) {
            return line
        }
    }
    return null
}

private fun findSmartMove(b: List<String?>, botSym: String, playerSym: String): Int? {
    val lines = listOf(
        listOf(0, 1, 2), listOf(3, 4, 5), listOf(6, 7, 8),
        listOf(0, 3, 6), listOf(1, 4, 7), listOf(2, 5, 8),
        listOf(0, 4, 8), listOf(2, 4, 6)
    )
    // 1. Win
    for (l in lines) {
        val (x, y, z) = l
        if (b[x] == botSym && b[y] == botSym && b[z] == null) return z
        if (b[x] == botSym && b[z] == botSym && b[y] == null) return y
        if (b[y] == botSym && b[z] == botSym && b[x] == null) return x
    }
    // 2. Block
    for (l in lines) {
        val (x, y, z) = l
        if (b[x] == playerSym && b[y] == playerSym && b[z] == null) return z
        if (b[x] == playerSym && b[z] == playerSym && b[y] == null) return y
        if (b[y] == playerSym && b[z] == playerSym && b[x] == null) return x
    }
    // 3. Center
    if (b[4] == null) return 4
    return null
}
