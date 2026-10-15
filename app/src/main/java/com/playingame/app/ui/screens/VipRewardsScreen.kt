package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.ui.theme.*
import com.playingame.app.ui.theme.RubikFont
import com.playingame.app.util.noRippleClickable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.text.NumberFormat
import java.util.Locale

data class VIPTierData(
    val level: Int,
    val requiredExp: Long,
    val upgradeRewardRupees: Double,
    val weeklyRewardRupees: Double,
    val monthlyRewardRupees: Double,
    val signInBuffPercent: Int,
    val weeklyMinDeposit: Double,
    val monthlyMinDeposit: Double
)

val LocalVipTiers = listOf(
    VIPTierData(1, 500L, 10.0, 5.0, 10.0, 5, 50.0, 100.0),
    VIPTierData(2, 5000L, 50.0, 20.0, 50.0, 8, 100.0, 500.0),
    VIPTierData(3, 15000L, 150.0, 50.0, 120.0, 10, 200.0, 800.0),
    VIPTierData(4, 50000L, 500.0, 120.0, 300.0, 12, 300.0, 1500.0),
    VIPTierData(5, 100000L, 1000.0, 250.0, 600.0, 15, 400.0, 2000.0),
    VIPTierData(6, 200000L, 2500.0, 500.0, 1200.0, 18, 500.0, 2500.0),
    VIPTierData(7, 500000L, 6000.0, 1200.0, 3000.0, 21, 800.0, 4000.0),
    VIPTierData(8, 1000000L, 12000.0, 2500.0, 6000.0, 25, 1000.0, 5000.0),
    VIPTierData(9, 2000000L, 25000.0, 5000.0, 12000.0, 28, 1500.0, 8000.0),
    VIPTierData(10, 3500000L, 45000.0, 9000.0, 20000.0, 32, 2000.0, 10000.0),
    VIPTierData(11, 5000000L, 70000.0, 14000.0, 30000.0, 35, 2500.0, 15000.0),
    VIPTierData(12, 7500000L, 100000.0, 20000.0, 45000.0, 38, 3000.0, 20000.0),
    VIPTierData(13, 10000000L, 150000.0, 30000.0, 65000.0, 42, 4000.0, 25000.0),
    VIPTierData(14, 15000000L, 220000.0, 45000.0, 90000.0, 45, 5000.0, 30000.0),
    VIPTierData(15, 20000000L, 300000.0, 60000.0, 130000.0, 50, 6000.0, 4000.0),
    VIPTierData(16, 30000000L, 450000.0, 90000.0, 180000.0, 55, 8000.0, 50000.0),
    VIPTierData(17, 45000000L, 650000.0, 130000.0, 250000.0, 60, 10000.0, 65000.0),
    VIPTierData(18, 65000000L, 950000.0, 190000.0, 350000.0, 65, 15000.0, 80000.0),
    VIPTierData(19, 90000000L, 1350000.0, 270000.0, 500000.0, 70, 20000.0, 100000.0),
    VIPTierData(20, 120000000L, 2000000.0, 400000.0, 800000.0, 80, 25000.0, 150000.0)
)

private fun formatExp(exp: Long): String {
    return when {
        exp >= 1000000L -> String.format(Locale.US, "%.1fM", exp / 1000000.0).replace(".0M", "M")
        exp >= 1000L -> String.format(Locale.US, "%.1fK", exp / 1000.0).replace(".0K", "K")
        else -> exp.toString()
    }
}

private fun formatNumberCommas(num: Long): String {
    return NumberFormat.getNumberInstance(Locale.US).format(num)
}

@Composable
fun VipRewardsScreen(
    onBackClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()

    var vipLevel by remember { mutableStateOf(0) }
    var vipExp by remember { mutableStateOf(0L) }
    var nextLevel by remember { mutableStateOf(1) }
    var nextLevelExp by remember { mutableStateOf(500L) }
    var expNeeded by remember { mutableStateOf(500L) }
    var claimableUpgrades by remember { mutableStateOf<List<Int>>(emptyList()) }
    var canClaimWeekly by remember { mutableStateOf(false) }
    var canClaimMonthly by remember { mutableStateOf(false) }
    var weeklyReward by remember { mutableStateOf(0.0) }
    var monthlyReward by remember { mutableStateOf(0.0) }
    var isLoading by remember { mutableStateOf(true) }

    fun loadVipStatus() {
        val token = SessionManager.authToken()
        if (token.isNullOrBlank()) {
            isLoading = false
            return
        }

        coroutineScope.launch(Dispatchers.IO) {
            try {
                val url = "${ClientConfig.API_BASE_URL}/vip/status"
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $token")
                    .get()
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val body = resp.body?.string() ?: ""
                val json = JSONObject(body)
                if (json.optBoolean("success", false)) {
                    val data = json.optJSONObject("data")
                    if (data != null) {
                        withContext(Dispatchers.Main) {
                            vipLevel = data.optInt("vipLevel", 0)
                            vipExp = data.optLong("vipExp", 0L)
                            nextLevel = data.optInt("nextLevel", 1)
                            nextLevelExp = data.optLong("nextLevelExp", 500L)
                            expNeeded = data.optLong("expNeeded", 500L)
                            canClaimWeekly = data.optBoolean("canClaimWeekly", false)
                            canClaimMonthly = data.optBoolean("canClaimMonthly", false)
                            weeklyReward = data.optDouble("currentWeeklyReward", 0.0)
                            monthlyReward = data.optDouble("currentMonthlyReward", 0.0)

                            val upgArr = data.optJSONArray("claimableUpgrades")
                            val upgList = mutableListOf<Int>()
                            if (upgArr != null) {
                                for (i in 0 until upgArr.length()) {
                                    upgList.add(upgArr.getInt(i))
                                }
                            }
                            claimableUpgrades = upgList
                        }
                    }
                }
            } catch (_: Exception) {
            } finally {
                withContext(Dispatchers.Main) {
                    isLoading = false
                }
            }
        }
    }

    fun claimUpgrade(level: Int) {
        val token = SessionManager.authToken() ?: return
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val url = "${ClientConfig.API_BASE_URL}/vip/claim-upgrade"
                val body = JSONObject().put("level", level).toString()
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $token")
                    .header("Content-Type", "application/json")
                    .post(body.toRequestBody("application/json".toMediaTypeOrNull()))
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val resStr = resp.body?.string() ?: ""
                val json = JSONObject(resStr)
                withContext(Dispatchers.Main) {
                    if (json.optBoolean("success", false)) {
                        Toast.makeText(context, json.optString("message", "Upgrade Bonus Claimed!"), Toast.LENGTH_SHORT).show()
                        loadVipStatus()
                    } else {
                        Toast.makeText(context, json.optString("error", "Claim failed"), Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun claimWeekly() {
        val token = SessionManager.authToken() ?: return
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val url = "${ClientConfig.API_BASE_URL}/vip/claim-weekly"
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $token")
                    .post("{}".toRequestBody("application/json".toMediaTypeOrNull()))
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val resStr = resp.body?.string() ?: ""
                val json = JSONObject(resStr)
                withContext(Dispatchers.Main) {
                    if (json.optBoolean("success", false)) {
                        Toast.makeText(context, json.optString("message", "Weekly Bonus Claimed!"), Toast.LENGTH_SHORT).show()
                        loadVipStatus()
                    } else {
                        Toast.makeText(context, json.optString("error", "Claim failed"), Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    fun claimMonthly() {
        val token = SessionManager.authToken() ?: return
        coroutineScope.launch(Dispatchers.IO) {
            try {
                val url = "${ClientConfig.API_BASE_URL}/vip/claim-monthly"
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $token")
                    .post("{}".toRequestBody("application/json".toMediaTypeOrNull()))
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val resStr = resp.body?.string() ?: ""
                val json = JSONObject(resStr)
                withContext(Dispatchers.Main) {
                    if (json.optBoolean("success", false)) {
                        Toast.makeText(context, json.optString("message", "Monthly Bonus Claimed!"), Toast.LENGTH_SHORT).show()
                        loadVipStatus()
                    } else {
                        Toast.makeText(context, json.optString("error", "Claim failed"), Toast.LENGTH_SHORT).show()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    Toast.makeText(context, "Network error: ${e.message}", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }

    LaunchedEffect(Unit) {
        loadVipStatus()
    }

    val progressFraction = remember(vipExp, nextLevelExp) {
        if (nextLevelExp <= 0L) 1f else (vipExp.toFloat() / nextLevelExp.toFloat()).coerceIn(0f, 1f)
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0A071E))
            .verticalScroll(rememberScrollState())
            .padding(bottom = 30.dp)
    ) {
        // ── TOP APP BAR ──────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 40.dp, start = 16.dp, end = 16.dp, bottom = 12.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(Color(0xFF1E163B))
                    .border(1.dp, Color(0xFF382963), RoundedCornerShape(12.dp))
                    .align(Alignment.CenterStart)
                    .noRippleClickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(20.dp),
                    tint = Color.White
                )
            }

            Text(
                text = "VIP CLUB & PRIVILEGES",
                fontSize = 18.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.W800,
                color = Color(0xFFFFD700),
                letterSpacing = 0.8.sp,
                modifier = Modifier.align(Alignment.Center)
            )
        }

        // ── HERO BANNER: MATCHING PHOTO STRUCTURE ───────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp, vertical = 6.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color(0xFF1F1147),
                            Color(0xFF140A30),
                            Color(0xFF0E0722)
                        )
                    )
                )
                .border(
                    1.5.dp,
                    Brush.horizontalGradient(
                        listOf(Color(0xFFFFD700), Color(0xFFFF007A), Color(0xFF00E5FF))
                    ),
                    RoundedCornerShape(22.dp)
                )
                .padding(vertical = 18.dp, horizontal = 14.dp)
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Header with current VIP vs next VIP
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Current Level Emblem
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(68.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(Color(0xFF00FFC2), Color(0xFF0B6650))
                                    )
                                )
                                .border(2.dp, Color(0xFFFFD700), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "💎",
                                fontSize = 24.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "VIP $vipLevel",
                            fontSize = 15.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W900,
                            color = Color(0xFFFFD700)
                        )
                    }

                    // Center Level Text & Progress
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .padding(horizontal = 10.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "VIP Level: VIP $vipLevel",
                            fontSize = 17.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // Glowing Progress Bar (Matching Photo)
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(26.dp)
                                .clip(RoundedCornerShape(13.dp))
                                .background(Color(0xFF130A29))
                                .border(1.5.dp, Color(0xFF4C308A), RoundedCornerShape(13.dp))
                        ) {
                            Box(
                                modifier = Modifier
                                    .fillMaxHeight()
                                    .fillMaxWidth(progressFraction)
                                    .clip(RoundedCornerShape(13.dp))
                                    .background(
                                        Brush.horizontalGradient(
                                            listOf(Color(0xFF00E5FF), Color(0xFF7928CA), Color(0xFFFF007A))
                                        )
                                    )
                            )
                            Text(
                                text = "${formatNumberCommas(vipExp)} / ${formatNumberCommas(nextLevelExp)}",
                                fontSize = 12.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White,
                                modifier = Modifier.align(Alignment.Center)
                            )
                        }

                        Spacer(modifier = Modifier.height(6.dp))

                        Text(
                            text = if (expNeeded > 0) "You still need ${formatNumberCommas(expNeeded)} EXP to upgrade to VIP $nextLevel" else "Max VIP Level Reached!",
                            fontSize = 11.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.SemiBold,
                            color = Color(0xFFB5A7DF),
                            textAlign = TextAlign.Center
                        )
                    }

                    // Next Level Emblem
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.width(68.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(50.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(Color(0xFFFF007A), Color(0xFF6B0235))
                                    )
                                )
                                .border(2.dp, Color(0xFFFFD700), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "👑",
                                fontSize = 24.sp
                            )
                        }
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = "VIP $nextLevel",
                            fontSize = 15.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W900,
                            color = Color(0xFFFFB800)
                        )
                    }
                }
            }
        }

        // ── CLAIMABLE REWARD TILES ROW ──────────────────────────────────────────
        Text(
            text = "CLAIMABLE VIP REWARDS",
            fontSize = 13.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF9E8DBE),
            modifier = Modifier.padding(start = 18.dp, top = 14.dp, bottom = 6.dp),
            letterSpacing = 0.5.sp
        )

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            // Card 1: Upgrade Reward
            val nextClaimLvl = claimableUpgrades.firstOrNull()
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1B133B))
                    .border(1.dp, if (nextClaimLvl != null) Color(0xFFFFD700) else Color(0xFF33245B), RoundedCornerShape(16.dp))
                    .padding(10.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = "🎁 UPGRADE", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFFD700))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (nextClaimLvl != null) "VIP $nextClaimLvl Bonus" else "LV Bonus",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Button(
                        onClick = { if (nextClaimLvl != null) claimUpgrade(nextClaimLvl) },
                        enabled = nextClaimLvl != null,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFFB800),
                            disabledContainerColor = Color(0xFF2C224D)
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(30.dp)
                    ) {
                        Text(
                            text = if (nextClaimLvl != null) "CLAIM" else "CLAIMED",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (nextClaimLvl != null) Color.Black else Color.Gray
                        )
                    }
                }
            }

            // Card 2: Weekly Reward
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1B133B))
                    .border(1.dp, if (canClaimWeekly) Color(0xFF00FFC2) else Color(0xFF33245B), RoundedCornerShape(16.dp))
                    .padding(10.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = "⚡ WEEKLY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF00FFC2))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (weeklyReward > 0) "₹${weeklyReward.toInt()}" else "₹0.00",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Button(
                        onClick = { claimWeekly() },
                        enabled = canClaimWeekly,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF00FFC2),
                            disabledContainerColor = Color(0xFF2C224D)
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(30.dp)
                    ) {
                        Text(
                            text = if (canClaimWeekly) "CLAIM" else "WAIT",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (canClaimWeekly) Color.Black else Color.Gray
                        )
                    }
                }
            }

            // Card 3: Monthly Reward
            Box(
                modifier = Modifier
                    .weight(1f)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1B133B))
                    .border(1.dp, if (canClaimMonthly) Color(0xFFFF007A) else Color(0xFF33245B), RoundedCornerShape(16.dp))
                    .padding(10.dp)
            ) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(text = "👑 MONTHLY", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFFFF007A))
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = if (monthlyReward > 0) "₹${monthlyReward.toInt()}" else "₹0.00",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Button(
                        onClick = { claimMonthly() },
                        enabled = canClaimMonthly,
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFFF007A),
                            disabledContainerColor = Color(0xFF2C224D)
                        ),
                        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.height(30.dp)
                    ) {
                        Text(
                            text = if (canClaimMonthly) "CLAIM" else "WAIT",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (canClaimMonthly) Color.White else Color.Gray
                        )
                    }
                }
            }
        }

        // ── 20-LEVEL VIP PRIVILEGES TABLE (MATCHING PHOTO) ────────────────────────
        Text(
            text = "20-TIER VIP PRIVILEGE TABLE",
            fontSize = 13.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF9E8DBE),
            modifier = Modifier.padding(start = 18.dp, top = 20.dp, bottom = 8.dp),
            letterSpacing = 0.5.sp
        )

        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 14.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF140D2D))
                .border(1.dp, Color(0xFF32225B), RoundedCornerShape(18.dp))
                .horizontalScroll(rememberScrollState())
        ) {
            Column {
                // Table Header Row
                Row(
                    modifier = Modifier
                        .background(
                            Brush.horizontalGradient(
                                listOf(Color(0xFF2D1660), Color(0xFF4C1D95), Color(0xFF2D1660))
                            )
                        )
                        .padding(vertical = 12.dp, horizontal = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    TableCell(text = "VIP LV", width = 64.dp, isHeader = true)
                    TableCell(text = "EXP", width = 74.dp, isHeader = true)
                    TableCell(text = "UPGRADE\nREWARD", width = 94.dp, isHeader = true)
                    TableCell(text = "WEEKLY\nREWARD", width = 90.dp, isHeader = true)
                    TableCell(text = "MONTHLY\nREWARD", width = 96.dp, isHeader = true)
                    TableCell(text = "SIGN IN\nBUFF", width = 80.dp, isHeader = true)
                    TableCell(text = "Weekly Min\nDeposit", width = 98.dp, isHeader = true)
                    TableCell(text = "Monthly Min\nDeposit", width = 104.dp, isHeader = true)
                }

                HorizontalDivider(color = Color(0xFF4C1D95), thickness = 1.dp)

                // 20 Table Rows
                LocalVipTiers.forEach { tier ->
                    val isCurrent = tier.level == vipLevel
                    val rowBg = if (isCurrent) {
                        Color(0xFF3B1E78)
                    } else if (tier.level % 2 == 0) {
                        Color(0xFF160E33)
                    } else {
                        Color(0xFF110B27)
                    }

                    Row(
                        modifier = Modifier
                            .background(rowBg)
                            .padding(vertical = 10.dp, horizontal = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        TableCell(
                            text = "${tier.level}",
                            width = 64.dp,
                            highlight = isCurrent,
                            textColor = if (isCurrent) Color(0xFFFFD700) else Color.White
                        )
                        TableCell(text = formatExp(tier.requiredExp), width = 74.dp, highlight = isCurrent)
                        TableCell(text = "₹${tier.upgradeRewardRupees.toInt()}", width = 94.dp, highlight = isCurrent, textColor = Color(0xFF00FFC2))
                        TableCell(text = "₹${tier.weeklyRewardRupees.toInt()}", width = 90.dp, highlight = isCurrent)
                        TableCell(text = "₹${tier.monthlyRewardRupees.toInt()}", width = 96.dp, highlight = isCurrent)
                        TableCell(text = "${tier.signInBuffPercent}%", width = 80.dp, highlight = isCurrent, textColor = Color(0xFFFF007A))
                        TableCell(text = "₹${tier.weeklyMinDeposit.toInt()}", width = 98.dp, highlight = isCurrent)
                        TableCell(text = "₹${tier.monthlyMinDeposit.toInt()}", width = 104.dp, highlight = isCurrent)
                    }
                    HorizontalDivider(color = Color(0xFF221644), thickness = 0.5.dp)
                }
            }
        }
    }
}

@Composable
private fun TableCell(
    text: String,
    width: androidx.compose.ui.unit.Dp,
    isHeader: Boolean = false,
    highlight: Boolean = false,
    textColor: Color = Color.White
) {
    Text(
        text = text,
        fontSize = if (isHeader) 11.sp else 12.sp,
        fontFamily = RubikFont,
        fontWeight = if (isHeader || highlight) FontWeight.W800 else FontWeight.Normal,
        color = if (isHeader) Color(0xFFFFD700) else textColor,
        textAlign = TextAlign.Center,
        modifier = Modifier.width(width)
    )
}
