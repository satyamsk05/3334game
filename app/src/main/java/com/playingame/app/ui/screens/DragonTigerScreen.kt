package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.compose.animation.core.*
import androidx.compose.foundation.*
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import app.rive.runtime.kotlin.RiveAnimationView
import app.rive.runtime.kotlin.core.Fit
import com.playingame.app.R
import com.playingame.app.ui.components.WalletChip
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.data.wallet.WalletLedger
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.Locale

fun mapSuitToRes(suit: String): Int = when (suit.uppercase()) {
    "H", "HEART" -> R.drawable.suit_heart
    "S", "SPADE" -> R.drawable.suit_spade
    "D", "DIAMOND" -> R.drawable.suit_diamond
    "C", "CLUB" -> R.drawable.suit_club
    else -> R.drawable.suit_heart
}

fun mapRankToString(rankInt: Int): String = when (rankInt) {
    14 -> "A"
    13 -> "K"
    12 -> "Q"
    11 -> "J"
    else -> if (rankInt in 2..10) rankInt.toString() else "A"
}

// ─────────────────────────────────────────────────────────────────────────────
// Data Models for Dragon vs Tiger
// ─────────────────────────────────────────────────────────────────────────────

enum class DtBetTarget {
    DRAGON, TIGER, TIE
}

data class DtPlayingCard(
    val rank: String,      // "2", "5", "A", "K", etc.
    val value: Int,        // 2, 5, 14, 13 etc. for comparison
    val suitRes: Int,      // R.drawable.suit_heart, etc.
    val isRed: Boolean
)

val SampleCards = listOf(
    DtPlayingCard("2", 2, R.drawable.suit_heart, true),
    DtPlayingCard("5", 5, R.drawable.suit_spade, false),
    DtPlayingCard("8", 8, R.drawable.suit_diamond, true),
    DtPlayingCard("J", 11, R.drawable.suit_club, false),
    DtPlayingCard("Q", 12, R.drawable.suit_heart, true),
    DtPlayingCard("K", 13, R.drawable.suit_spade, false),
    DtPlayingCard("A", 14, R.drawable.suit_diamond, true)
)

val ChipDenominations = listOf(10L, 50L, 100L, 500L, 1000L, 5000L)

// ─────────────────────────────────────────────────────────────────────────────
// Main Dragon vs Tiger Table Screen
// ─────────────────────────────────────────────────────────────────────────────

@Composable
fun DragonTigerScreen(
    onBackClick: () -> Unit,
    onAddCashClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()

    // Betting states
    var selectedChip by remember { mutableStateOf(100L) }
    var dragonBet by remember { mutableStateOf(0L) }
    var tigerBet by remember { mutableStateOf(0L) }
    var tieBet by remember { mutableStateOf(0L) }

    // History roadmap
    var historyList by remember {
        mutableStateOf(listOf("T", "D", "T", "T", "D", "D", "T", "D", "T", "D"))
    }

    // Game round states
    var gamePhase by remember { mutableStateOf("BETTING") } // BETTING, DEALING, RESULT
    var timerSeconds by remember { mutableStateOf(15) }
    var roundWinner by remember { mutableStateOf<DtBetTarget?>(null) }

    // Cards dealt
    var dragonCard by remember { mutableStateOf(SampleCards[0]) } // 2 of Hearts
    var tigerCard by remember { mutableStateOf(SampleCards[1]) }  // 5 of Spades
    var cardsRevealed by remember { mutableStateOf(false) }

    // Card 3D Flip Animation
    val flipProgress by animateFloatAsState(
        targetValue = if (cardsRevealed) 180f else 0f,
        animationSpec = tween(durationMillis = 650, easing = FastOutSlowInEasing),
        label = "cardFlip"
    )

    // Server-synchronized Game Loop
    var lastProcessedResultRound by remember { mutableStateOf("") }
    var currentServerRoundId by remember { mutableStateOf("") }

    LaunchedEffect(Unit) {
        var lastSeenRoundId = ""
        while (true) {
            try {
                val url = "${ClientConfig.API_BASE_URL}/games/dragontiger/state"
                val req = Request.Builder().url(url).get().build()
                val resp = withContext(Dispatchers.IO) {
                    try {
                        RemoteApiClient.client.newCall(req).execute().use { r ->
                            r.body?.string()
                        }
                    } catch (_: Exception) { null }
                }

                if (!resp.isNullOrBlank()) {
                    val root = JSONObject(resp)
                    val data = root.optJSONObject("data")
                    if (data != null) {
                        val currentRound = data.optString("roundId", "")
                        val serverPhase = data.optString("phase", "BETTING")
                        val serverTimer = data.optInt("timerSeconds", 15)
                        currentServerRoundId = currentRound

                        // When a new round starts, reset user's local round bets
                        if (currentRound.isNotBlank() && currentRound != lastSeenRoundId) {
                            if (lastSeenRoundId.isNotBlank()) {
                                dragonBet = 0L
                                tigerBet = 0L
                                tieBet = 0L
                            }
                            lastSeenRoundId = currentRound
                        }

                        gamePhase = serverPhase
                        timerSeconds = serverTimer

                        // Sync history roadmap from server
                        val historyArr = data.optJSONArray("history")
                        if (historyArr != null && historyArr.length() > 0) {
                            val newHist = mutableListOf<String>()
                            for (i in 0 until historyArr.length()) {
                                newHist.add(historyArr.getString(i))
                            }
                            historyList = newHist
                        }

                        when (serverPhase) {
                            "BETTING" -> {
                                roundWinner = null
                                cardsRevealed = false
                            }
                            "DEALING" -> {
                                cardsRevealed = false
                            }
                            "RESULT" -> {
                                val winnerStr = data.optString("winner", "")
                                val currentWinner = when (winnerStr) {
                                    "DRAGON" -> DtBetTarget.DRAGON
                                    "TIGER" -> DtBetTarget.TIGER
                                    "TIE" -> DtBetTarget.TIE
                                    else -> null
                                }
                                roundWinner = currentWinner

                                val cardsObj = data.optJSONObject("cards")
                                val dObj = cardsObj?.optJSONObject("dragon") ?: data.optJSONObject("dragonCard")
                                if (dObj != null) {
                                    val rankInt = dObj.optInt("rank", 2)
                                    val r = if (dObj.optString("rank", "").isNotBlank() && dObj.optString("rank", "").toIntOrNull() == null) {
                                        dObj.optString("rank", "2")
                                    } else {
                                        mapRankToString(rankInt)
                                    }
                                    val v = if (dObj.has("value")) dObj.optInt("value", rankInt) else rankInt
                                    val s = dObj.optString("suit", "H")
                                    val red = dObj.optBoolean("isRed", s == "H" || s == "D")
                                    dragonCard = DtPlayingCard(r, v, mapSuitToRes(s), red)
                                }

                                val tObj = cardsObj?.optJSONObject("tiger") ?: data.optJSONObject("tigerCard")
                                if (tObj != null) {
                                    val rankInt = tObj.optInt("rank", 5)
                                    val r = if (tObj.optString("rank", "").isNotBlank() && dObj?.optString("rank", "")?.toIntOrNull() == null && tObj.optString("rank", "").toIntOrNull() == null) {
                                        tObj.optString("rank", "5")
                                    } else {
                                        mapRankToString(rankInt)
                                    }
                                    val v = if (tObj.has("value")) tObj.optInt("value", rankInt) else rankInt
                                    val s = tObj.optString("suit", "S")
                                    val red = tObj.optBoolean("isRed", s == "H" || s == "D")
                                    tigerCard = DtPlayingCard(r, v, mapSuitToRes(s), red)
                                }

                                cardsRevealed = true

                                // Settle user payout once per round
                                if (currentRound.isNotBlank() && currentRound != lastProcessedResultRound) {
                                    lastProcessedResultRound = currentRound
                                    val userWinAmount = when (currentWinner) {
                                        DtBetTarget.DRAGON -> dragonBet * 2
                                        DtBetTarget.TIGER -> tigerBet * 2
                                        DtBetTarget.TIE -> tieBet * 9
                                        else -> 0L
                                    }
                                    if (userWinAmount > 0) {
                                        Toast.makeText(context, "🎉 You won ₹$userWinAmount!", Toast.LENGTH_SHORT).show()
                                        WalletLedger.creditWin(userWinAmount * 100L, "Dragon vs Tiger")
                                        scope.launch {
                                            com.playingame.app.data.remote.WalletSyncService.syncBalance()
                                        }
                                    } else {
                                        // Synchronize balance with backend for non-winning / tie rounds as well
                                        scope.launch {
                                            com.playingame.app.data.remote.WalletSyncService.syncBalance()
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (_: Exception) {}

            delay(800)
        }
    }

    fun handlePlaceBet(target: DtBetTarget) {
        if (gamePhase != "BETTING" || timerSeconds < 2) {
            Toast.makeText(context, "Betting is closed for this round!", Toast.LENGTH_SHORT).show()
            return
        }
        val neededChips = selectedChip * 100L
        if (walletBalance.totalChips < neededChips) {
            Toast.makeText(context, "Insufficient balance! Please add cash.", Toast.LENGTH_SHORT).show()
            return
        }

        val debit = WalletLedger.placeBet(neededChips, currentServerRoundId.ifBlank { "DT_ROUND" })
        if (debit.success) {
            when (target) {
                DtBetTarget.DRAGON -> dragonBet += selectedChip
                DtBetTarget.TIGER -> tigerBet += selectedChip
                DtBetTarget.TIE -> tieBet += selectedChip
            }

            // Sync bet with Go backend server
            val sessionToken = SessionManager.authToken()
            if (!sessionToken.isNullOrBlank()) {
                scope.launch(Dispatchers.IO) {
                    try {
                        val body = JSONObject().apply {
                            put("target", target.name)
                            put("amountChips", neededChips)
                        }
                        val req = Request.Builder()
                            .url("${ClientConfig.API_BASE_URL}/games/dragontiger/bet")
                            .header("Authorization", "Bearer $sessionToken")
                            .header("Content-Type", "application/json")
                            .post(body.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                            .build()
                        RemoteApiClient.client.newCall(req).execute()
                    } catch (_: Exception) {}
                }
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    listOf(
                        Color(0xFFF1F5F9),
                        Color(0xFFE8EEF5),
                        Color(0xFFF0F4F8)
                    )
                )
            )
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            // ─────────────────────────────────────────────────────────────────
            // 1. Top Header (Back + Home Screen Wallet)
            // ─────────────────────────────────────────────────────────────────
            TopBarSection(
                balanceChips = walletBalance.totalChips,
                onBackClick = onBackClick,
                onAddCashClick = onAddCashClick
            )

            Spacer(modifier = Modifier.height(10.dp))

            // ─────────────────────────────────────────────────────────────────
            // 2. Playing Cards Arena (Dragon vs Tiger)
            // ─────────────────────────────────────────────────────────────────
            CardsArenaSection(
                dragonCard = dragonCard,
                tigerCard = tigerCard,
                flipProgress = flipProgress,
                gamePhase = gamePhase,
                timerSeconds = timerSeconds,
                roundWinner = roundWinner
            )

            Spacer(modifier = Modifier.height(8.dp))

            // ─────────────────────────────────────────────────────────────────
            // 3. Roadmap / History Dots (T / D / Tie)
            // ─────────────────────────────────────────────────────────────────
            RoadmapRow(history = historyList)

            Spacer(modifier = Modifier.height(10.dp))

            // ─────────────────────────────────────────────────────────────────
            // 4. Betting Areas (Tie on Top, Dragon & Tiger Side-by-Side)
            // ─────────────────────────────────────────────────────────────────
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                // TIE BOX (Wide horizontal card)
                TieBetCard(
                    userBet = tieBet,
                    isWinner = roundWinner == DtBetTarget.TIE,
                    onClick = { handlePlaceBet(DtBetTarget.TIE) }
                )

                // DRAGON & TIGER (Side by side)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    // DRAGON CARD (Left)
                    Box(modifier = Modifier.weight(1f)) {
                        DragonBetCard(
                            userBet = dragonBet,
                            isWinner = roundWinner == DtBetTarget.DRAGON,
                            onClick = { handlePlaceBet(DtBetTarget.DRAGON) }
                        )
                    }

                    // TIGER CARD (Right)
                    Box(modifier = Modifier.weight(1f)) {
                        TigerBetCard(
                            userBet = tigerBet,
                            isWinner = roundWinner == DtBetTarget.TIGER,
                            onClick = { handlePlaceBet(DtBetTarget.TIGER) }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // ─────────────────────────────────────────────────────────────────
            // 5. Casino Chips Bar (10, 50, 100, 500, 1K, 5K)
            // ─────────────────────────────────────────────────────────────────
            CasinoChipsSelectionBar(
                selectedChip = selectedChip,
                onSelectChip = { selectedChip = it },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(68.dp)
            )

            Spacer(modifier = Modifier.height(8.dp))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Top Bar Section
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun TopBarSection(
    balanceChips: Long,
    onBackClick: () -> Unit,
    onAddCashClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 4.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        // Back Button
        IconButton(
            onClick = onBackClick,
            modifier = Modifier
                .size(40.dp)
                .clip(CircleShape)
                .background(Color.White)
                .shadow(2.dp, CircleShape)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_arrow_back),
                contentDescription = "Back",
                tint = Color(0xFF1E293B),
                modifier = Modifier.size(18.dp)
            )
        }

        // Wallet Chip matching Home screen exactly
        val chipBalance = if (balanceChips % 100 == 0L) {
            "${balanceChips / 100}"
        } else {
            String.format(Locale.getDefault(), "%.2f", balanceChips / 100.0)
        }

        WalletChip(
            balance = chipBalance,
            onClick = onAddCashClick
        )
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Cards Arena Section (Dragon vs Tiger)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CardsArenaSection(
    dragonCard: DtPlayingCard,
    tigerCard: DtPlayingCard,
    flipProgress: Float,
    gamePhase: String,
    timerSeconds: Int,
    roundWinner: DtBetTarget?
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        contentAlignment = Alignment.Center
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Dragon Card (Left)
            SinglePlayingCard(
                card = dragonCard,
                rotationY = flipProgress,
                isWinner = roundWinner == DtBetTarget.DRAGON,
                cardBackRes = R.drawable.card_back_purple
            )

            // Tiger Card (Right)
            SinglePlayingCard(
                card = tigerCard,
                rotationY = flipProgress,
                isWinner = roundWinner == DtBetTarget.TIGER,
                cardBackRes = R.drawable.card_back_purple
            )
        }

        // Floating Center "VS" Badge with Timer Overlay
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Surface(
                shape = CircleShape,
                color = Color.White,
                shadowElevation = 6.dp,
                border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
                modifier = Modifier.size(42.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = "VS",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color(0xFF1E293B)
                    )
                }
            }

            // Round countdown / phase badge
            if (gamePhase == "BETTING") {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = if (timerSeconds <= 5) Color(0xFFEF4444) else Color(0xFF0F172A),
                    modifier = Modifier.padding(top = 2.dp)
                ) {
                    Text(
                        text = "${timerSeconds}s",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }
            } else if (gamePhase == "DEALING") {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF2563EB)
                ) {
                    Text(
                        text = "DEALING",
                        color = Color.White,
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Single Playing Card Component with 3D Flip
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun SinglePlayingCard(
    card: DtPlayingCard,
    rotationY: Float,
    isWinner: Boolean,
    cardBackRes: Int
) {
    val isFaceDown = rotationY < 90f

    val cardBorder = if (isWinner) {
        BorderStroke(3.dp, Color(0xFF10B981))
    } else {
        null
    }

    Surface(
        modifier = Modifier
            .width(136.dp)
            .height(188.dp)
            .graphicsLayer {
                this.rotationY = rotationY
                cameraDistance = 12 * density
            }
            .shadow(
                elevation = if (isWinner) 12.dp else 6.dp,
                shape = RoundedCornerShape(18.dp),
                spotColor = if (isWinner) Color(0xFF10B981) else Color(0x33000000)
            ),
        shape = RoundedCornerShape(18.dp),
        color = Color.White,
        border = cardBorder
    ) {
        if (isFaceDown) {
            // Card Back Texture (No padding, no white border)
            Image(
                painter = painterResource(id = cardBackRes),
                contentDescription = "Card Back",
                contentScale = ContentScale.FillBounds,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(18.dp))
            )
        } else {
            // Card Face (Upside-corrected for rotation)
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .graphicsLayer {
                        this.rotationY = 180f
                    }
                    .padding(8.dp)
            ) {
                val textColor = if (card.isRed) Color(0xFFDC2626) else Color(0xFF0F172A)

                // Top-Left Index (Rank + Suit)
                Column(
                    modifier = Modifier.align(Alignment.TopStart),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = card.rank,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = textColor,
                        lineHeight = 20.sp
                    )
                    Image(
                        painter = painterResource(id = card.suitRes),
                        contentDescription = null,
                        modifier = Modifier.size(13.dp)
                    )
                }

                // Center Main Suit Art
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    if (card.rank == "5") {
                        // 5-Spade Pattern matching the screenshot!
                        FivePipPattern(suitRes = card.suitRes)
                    } else {
                        // Large Center Suit
                        Image(
                            painter = painterResource(id = card.suitRes),
                            contentDescription = null,
                            modifier = Modifier.size(54.dp)
                        )
                    }
                }

                // Bottom-Right Inverted Index (Rank + Suit)
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomEnd)
                        .rotate(180f),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = card.rank,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.ExtraBold,
                        color = textColor,
                        lineHeight = 20.sp
                    )
                    Image(
                        painter = painterResource(id = card.suitRes),
                        contentDescription = null,
                        modifier = Modifier.size(13.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun FivePipPattern(suitRes: Int) {
    Column(
        modifier = Modifier.size(68.dp),
        verticalArrangement = Arrangement.SpaceBetween,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Image(painter = painterResource(id = suitRes), contentDescription = null, modifier = Modifier.size(15.dp))
            Image(painter = painterResource(id = suitRes), contentDescription = null, modifier = Modifier.size(15.dp))
        }
        Image(painter = painterResource(id = suitRes), contentDescription = null, modifier = Modifier.size(17.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Image(painter = painterResource(id = suitRes), contentDescription = null, modifier = Modifier.size(15.dp).rotate(180f))
            Image(painter = painterResource(id = suitRes), contentDescription = null, modifier = Modifier.size(15.dp).rotate(180f))
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Roadmap / History Row (T, D, Tie dots)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun RoadmapRow(history: List<String>) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(48.dp),
        shape = RoundedCornerShape(24.dp),
        color = Color(0xFFF8FAFC),
        border = BorderStroke(1.dp, Color(0xFFE2E8F0)),
        shadowElevation = 2.dp
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .horizontalScroll(rememberScrollState()),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceEvenly
        ) {
            history.forEach { item ->
                val (bgColor, label) = when (item) {
                    "T" -> Pair(Color(0xFF059669), "T")
                    "D" -> Pair(Color(0xFFDC2626), "D")
                    else -> Pair(Color(0xFF7C3AED), "T")
                }
                Box(
                    modifier = Modifier
                        .padding(horizontal = 4.dp)
                        .size(28.dp)
                        .clip(CircleShape)
                        .background(bgColor)
                        .shadow(1.dp, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = label,
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Betting Areas (Tie, Dragon, Tiger)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun TieBetCard(
    userBet: Long,
    isWinner: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }

    Surface(
        onClick = onClick,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(20.dp),
        color = Color(0xFFEDE9FE),
        border = BorderStroke(
            width = if (isWinner) 2.5.dp else 1.dp,
            color = if (isWinner) Color(0xFF10B981) else Color(0xFFDDD6FE)
        ),
        shadowElevation = if (isWinner) 6.dp else 2.dp,
        modifier = Modifier
            .fillMaxWidth()
            .height(86.dp)
    ) {
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Tie",
                    fontSize = 42.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF4C1D95),
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "1:8 Payout",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFF6D28D9)
                )
            }

            // User Bet Badge
            if (userBet > 0) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color(0xFF4C1D95),
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(10.dp)
                ) {
                    Text(
                        text = "₹$userBet",
                        color = Color.White,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun DragonBetCard(
    userBet: Long,
    isWinner: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }

    Surface(
        onClick = onClick,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(22.dp),
        border = BorderStroke(
            width = if (isWinner) 3.dp else 0.dp,
            color = if (isWinner) Color(0xFFFBBF24) else Color.Transparent
        ),
        shadowElevation = 8.dp,
        modifier = Modifier
            .fillMaxWidth()
            .height(154.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xFFFF3B30),
                            Color(0xFFE02424)
                        )
                    )
                )
        ) {
            // Watermark Dragon Mascot Art in background (Bottom-Left)
            Image(
                painter = painterResource(id = R.drawable.img_dragon_watermark),
                contentDescription = "Dragon Watermark",
                contentScale = ContentScale.Fit,
                alpha = 0.45f,
                modifier = Modifier
                    .size(130.dp)
                    .align(Alignment.BottomStart)
                    .offset(x = (-8).dp, y = 14.dp)
            )

            // Top Center Letter "D"
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "D",
                    fontSize = 58.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
                Text(
                    text = "1:1 Payout",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFFFCDD2)
                )
            }

            // Placed Bet Chip Badge
            if (userBet > 0) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 10.dp)
                ) {
                    Text(
                        text = "₹$userBet",
                        color = Color(0xFFDC2626),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

@Composable
private fun TigerBetCard(
    userBet: Long,
    isWinner: Boolean,
    onClick: () -> Unit
) {
    val interactionSource = remember { MutableInteractionSource() }

    Surface(
        onClick = onClick,
        interactionSource = interactionSource,
        shape = RoundedCornerShape(22.dp),
        border = BorderStroke(
            width = if (isWinner) 3.dp else 0.dp,
            color = if (isWinner) Color(0xFFFBBF24) else Color.Transparent
        ),
        shadowElevation = 8.dp,
        modifier = Modifier
            .fillMaxWidth()
            .height(154.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(
                            Color(0xFF3B82F6),
                            Color(0xFF1D4ED8)
                        )
                    )
                )
        ) {
            // Watermark Tiger Mascot Art in background (Bottom-Right)
            Image(
                painter = painterResource(id = R.drawable.img_tiger_watermark),
                contentDescription = "Tiger Watermark",
                contentScale = ContentScale.Fit,
                alpha = 0.45f,
                modifier = Modifier
                    .size(130.dp)
                    .align(Alignment.BottomEnd)
                    .offset(x = 8.dp, y = 14.dp)
            )

            // Top Center Letter "T"
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(top = 12.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "T",
                    fontSize = 58.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
                Text(
                    text = "1:1 Payout",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = Color(0xFFBFDBFE)
                )
            }

            // Placed Bet Chip Badge
            if (userBet > 0) {
                Surface(
                    shape = RoundedCornerShape(12.dp),
                    color = Color.White,
                    shadowElevation = 4.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 10.dp)
                ) {
                    Text(
                        text = "₹$userBet",
                        color = Color(0xFF1D4ED8),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.ExtraBold,
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                    )
                }
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Casino Chips Selection Bar (10, 50, 100, 500, 1K, 5K)
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun CasinoChipsSelectionBar(
    selectedChip: Long,
    onSelectChip: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(34.dp),
        color = Color.White,
        shadowElevation = 6.dp,
        border = BorderStroke(1.dp, Color(0xFFE2E8F0))
    ) {
        Row(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 10.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            ChipDenominations.forEach { chipValue ->
                val isSelected = chipValue == selectedChip

                val (mainColor, label) = when (chipValue) {
                    10L -> Pair(Color(0xFF10B981), "10")
                    50L -> Pair(Color(0xFF3B82F6), "50")
                    100L -> Pair(Color(0xFFEF4444), "100")
                    500L -> Pair(Color(0xFF8B5CF6), "500")
                    1000L -> Pair(Color(0xFFF59E0B), "1K")
                    5000L -> Pair(Color(0xFF0F172A), "5K")
                    else -> Pair(Color(0xFF64748B), "$chipValue")
                }

                val scale by animateFloatAsState(
                    targetValue = if (isSelected) 1.15f else 1.0f,
                    animationSpec = spring(stiffness = Spring.StiffnessMediumLow),
                    label = "chipScale"
                )

                Box(
                    modifier = Modifier
                        .graphicsLayer {
                            scaleX = scale
                            scaleY = scale
                        }
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(if (isSelected) Color(0xFFFBBF24).copy(alpha = 0.2f) else Color.Transparent)
                        .clickable { onSelectChip(chipValue) },
                    contentAlignment = Alignment.Center
                ) {
                    Surface(
                        modifier = Modifier.size(if (isSelected) 48.dp else 42.dp),
                        shape = CircleShape,
                        color = mainColor,
                        shadowElevation = if (isSelected) 8.dp else 2.dp,
                        border = BorderStroke(
                            width = if (isSelected) 2.5.dp else 1.dp,
                            color = if (isSelected) Color(0xFFFBBF24) else Color.White.copy(alpha = 0.6f)
                        )
                    ) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            // Exact authentic casino chip frame texture from user's 1002.riv!
                            Image(
                                painter = painterResource(id = R.drawable.ic_casino_chip_frame),
                                contentDescription = null,
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Fit
                            )

                            // Center bold denomination (10, 50, 100, 500, 1K, 5K)
                            Text(
                                text = label,
                                fontSize = if (label.length >= 3) 11.sp else 13.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White,
                                textAlign = TextAlign.Center
                            )
                        }
                    }
                }
            }
        }
    }
}

