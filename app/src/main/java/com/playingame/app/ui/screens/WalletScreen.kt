package com.playingame.app.ui.screens

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.graphics.Brush
import com.playingame.app.R
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.theme.AppBackground
import com.playingame.app.ui.theme.BrandCasinoGreen
import com.playingame.app.ui.theme.RubikFont
import com.playingame.app.util.noRippleClickable
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.Request
import org.json.JSONObject

@Composable
fun WalletScreen(
    balance: String = "0.00",
    depositBalance: String = "0.00",
    winningsBalance: String = "0.00",
    rewardsBalance: String = "0.00",
    onAddCashClick: () -> Unit = {},
    onWithdrawClick: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onSupportClick: () -> Unit = {},
    onAllTransactionsClick: () -> Unit = {},
    onProfileClick: () -> Unit = {},
    onVipClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val userProfile by WalletLedger.userProfile.collectAsState()

    var vipLevel by remember { mutableStateOf(0) }
    var vipExp by remember { mutableStateOf(0L) }
    var nextExp by remember { mutableStateOf(500L) }
    var expNeeded by remember { mutableStateOf(500L) }
    var progressPercent by remember { mutableStateOf(0f) }

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            try {
                val token = SessionManager.authToken()
                if (!token.isNullOrBlank()) {
                    val req = Request.Builder()
                        .url("${ClientConfig.API_BASE_URL}/vip/status")
                        .header("Authorization", "Bearer $token")
                        .get()
                        .build()
                    val resp = RemoteApiClient.client.newCall(req).execute()
                    if (resp.isSuccessful) {
                        val body = resp.body?.string() ?: ""
                        val json = JSONObject(body)
                        if (json.optBoolean("success", false)) {
                            val data = json.optJSONObject("data")
                            if (data != null) {
                                val lvl = data.optInt("vipLevel", 0)
                                val exp = data.optLong("vipExp", 0L)
                                val nxt = data.optLong("nextLevelExp", 500L)
                                val needed = data.optLong("expNeeded", 500L)
                                val pct = data.optDouble("progressPercent", 0.0).toFloat()
                                withContext(Dispatchers.Main) {
                                    vipLevel = lvl
                                    vipExp = exp
                                    nextExp = nxt
                                    expNeeded = needed
                                    progressPercent = (pct / 100f).coerceIn(0.02f, 1f)
                                }
                            }
                        }
                    }
                }
            } catch (_: Exception) {}
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(AppBackground)
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 120.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // ─────────────────────────────────────────────────────────────────────
        // 1. Top Title: "Account"
        // ─────────────────────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 16.dp, bottom = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Account",
                fontSize = 25.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // ─────────────────────────────────────────────────────────────────────
        // 2. User Profile Header (Avatar + Name + ID + Copy + Chevron)
        // ─────────────────────────────────────────────────────────────────────
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .noRippleClickable { onProfileClick() }
                .padding(vertical = 2.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Circular Mascot Avatar
                Box(
                    modifier = Modifier
                        .size(52.dp)
                        .clip(CircleShape)
                        .background(Color(0xFFE11D48)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = userProfile.avatarRes),
                        contentDescription = "User Avatar",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                Column(
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = userProfile.username.ifBlank { "ozzycrypto_ayx" },
                        fontSize = 17.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        val userIdText = if (userProfile.userId.isNotBlank()) "ID: ${userProfile.userId}" else "ID: 936631092319279"
                        Text(
                            text = userIdText,
                            fontSize = 12.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF)
                        )

                        Icon(
                            painter = painterResource(id = R.drawable.ic_acct_copy),
                            contentDescription = "Copy ID",
                            modifier = Modifier
                                .size(14.dp)
                                .noRippleClickable {
                                    val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                                    val clip = ClipData.newPlainText("User ID", userIdText.replace("ID: ", ""))
                                    clipboard.setPrimaryClip(clip)
                                    Toast.makeText(context, "ID copied to clipboard!", Toast.LENGTH_SHORT).show()
                                },
                            tint = Color(0xFF9CA3AF)
                        )
                    }
                }
            }

            Icon(
                painter = painterResource(id = R.drawable.ic_acct_chevron),
                contentDescription = "View Profile",
                modifier = Modifier.size(16.dp),
                tint = Color(0xFF9CA3AF)
            )
        }

        // ─────────────────────────────────────────────────────────────────────
        // 3. Level / Tier Banner (Dynamic VIP XP System with onVipClick)
        // ─────────────────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(
                    Brush.horizontalGradient(
                        listOf(Color(0xFF26123D), Color(0xFF1B112C), Color(0xFF28133F))
                    )
                )
                .border(
                    1.2.dp,
                    Brush.horizontalGradient(listOf(Color(0xFFFFD700), Color(0xFF9333EA))),
                    RoundedCornerShape(16.dp)
                )
                .noRippleClickable { onVipClick() }
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = if (vipLevel == 0) "BEGINNER VIP" else "VIP $vipLevel",
                            fontSize = 13.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color(0xFFFFD700)
                        )
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(Color(0xFF7C3AED))
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        ) {
                            Text(
                                text = "VIP PRIVILEGES >",
                                fontSize = 9.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }

                    Text(
                        text = if (vipLevel >= 20) "MAX LEVEL REACHED" else "$expNeeded XP to VIP ${vipLevel + 1}",
                        fontSize = 11.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF00FFC2)
                    )
                }

                // Custom XP Progress Track with Neon Gradient
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(9.dp)
                        .clip(RoundedCornerShape(percent = 50))
                        .background(Color(0xFF140D24)),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(progressPercent.coerceIn(0.04f, 1f))
                            .fillMaxHeight()
                            .background(
                                Brush.horizontalGradient(
                                    listOf(Color(0xFF00FFC2), Color(0xFF7C3AED), Color(0xFFFF007A))
                                )
                            )
                    )
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // 4. Total Balance & Quick Actions Card
        // ─────────────────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF2A2D33))
                .border(1.dp, Color(0xFF373A42), RoundedCornerShape(18.dp))
                .padding(16.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                // Total Balance Header Row
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Image(
                            painter = painterResource(id = R.drawable.ic_ui_coin_gold),
                            contentDescription = "Gold Coin",
                            modifier = Modifier.size(22.dp)
                        )
                        Text(
                            text = "Total Balance",
                            fontSize = 13.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF9CA3AF)
                        )
                    }

                    Text(
                        text = balance,
                        fontSize = 18.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )
                }

                // Action Buttons Row: Deposit (Bright Casino Green) & Withdraw (Dark Grey)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Deposit Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(BrandCasinoGreen)
                            .noRippleClickable { onAddCashClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_acct_deposit),
                                contentDescription = "Deposit",
                                modifier = Modifier.size(17.dp),
                                tint = Color.Black
                            )
                            Text(
                                text = "Deposit",
                                fontSize = 14.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.Black
                            )
                        }
                    }

                    // Withdraw Button
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(44.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF383C45))
                            .border(1.dp, Color(0xFF454B55), RoundedCornerShape(12.dp))
                            .noRippleClickable { onWithdrawClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_acct_withdraw),
                                contentDescription = "Withdraw",
                                modifier = Modifier.size(17.dp),
                                tint = Color.White
                            )
                            Text(
                                text = "Withdraw",
                                fontSize = 14.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(2.dp))

                // Quick Action Grid (2 rows x 4 items)
                Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                    // Row 1: Buy, Swap, Vault Pro, Transaction
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_buy,
                            label = "Buy",
                            onClick = { onAddCashClick() },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_swap,
                            label = "Swap",
                            onClick = {
                                Toast.makeText(context, "Swap feature coming soon!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_vault,
                            label = "Vault Pro",
                            onClick = {
                                Toast.makeText(context, "Vault Pro active!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_transaction,
                            label = "Transaction",
                            onClick = { onAllTransactionsClick() },
                            modifier = Modifier.weight(1f)
                        )
                    }

                    // Row 2: Rollover, Bet History, Free Plays, Support
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_rollover,
                            label = "Rollover",
                            onClick = {
                                Toast.makeText(context, "Rollover: 100% completed!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_history,
                            label = "Bet History",
                            onClick = { onAllTransactionsClick() },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_acct_freeplays,
                            label = "Free Plays",
                            onClick = {
                                Toast.makeText(context, "You have 3 Free Plays available!", Toast.LENGTH_SHORT).show()
                            },
                            modifier = Modifier.weight(1f)
                        )
                        AccountGridItem(
                            iconRes = R.drawable.ic_headset,
                            label = "Support",
                            onClick = { onSupportClick() },
                            modifier = Modifier.weight(1f)
                        )
                    }
                }
            }
        }

        // ─────────────────────────────────────────────────────────────────────
        // 5. Settings / Menu Grouped Card
        // ─────────────────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF2A2D33))
                .border(1.dp, Color(0xFF373A42), RoundedCornerShape(18.dp))
        ) {
            Column {
                // 1. Do Not Disturb (with switch)
                AccountMenuItemRow(
                    iconRes = R.drawable.ic_acct_dnd,
                    title = "Do Not Disturb",
                    trailingContent = {
                        var dndEnabled by remember { mutableStateOf(false) }
                        Switch(
                            checked = dndEnabled,
                            onCheckedChange = { dndEnabled = it },
                            colors = SwitchDefaults.colors(
                                checkedThumbColor = Color.White,
                                checkedTrackColor = BrandCasinoGreen,
                                uncheckedThumbColor = Color(0xFF9CA3AF),
                                uncheckedTrackColor = Color(0xFF383C45),
                                uncheckedBorderColor = Color.Transparent
                            ),
                            modifier = Modifier.height(28.dp)
                        )
                    }
                )

                HorizontalDivider(color = Color(0x1AFFFFFF), thickness = 0.5.dp, modifier = Modifier.padding(horizontal = 16.dp))

                // 2. Notification (with Green 11 badge & chevron)
                AccountMenuItemRow(
                    iconRes = R.drawable.ic_notification_bell,
                    title = "Notification",
                    onClick = {
                        Toast.makeText(context, "Notifications", Toast.LENGTH_SHORT).show()
                    },
                    trailingContent = {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(BrandCasinoGreen)
                                    .padding(horizontal = 7.dp, vertical = 2.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "11",
                                    fontSize = 11.5.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.Black
                                )
                            }

                            Icon(
                                painter = painterResource(id = R.drawable.ic_acct_chevron),
                                contentDescription = "Open",
                                modifier = Modifier.size(14.dp),
                                tint = Color(0xFF9CA3AF)
                            )
                        }
                    }
                )

                HorizontalDivider(color = Color(0x1AFFFFFF), thickness = 0.5.dp, modifier = Modifier.padding(horizontal = 16.dp))

                // 3. Refer and Earn
                AccountMenuItemRow(
                    iconRes = R.drawable.ic_acct_refer_earn,
                    title = "Refer and Earn",
                    onClick = {
                        Toast.makeText(context, "Invite friends & earn bonus!", Toast.LENGTH_SHORT).show()
                    },
                    trailingContent = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_acct_chevron),
                            contentDescription = "Open",
                            modifier = Modifier.size(14.dp),
                            tint = Color(0xFF9CA3AF)
                        )
                    }
                )

                HorizontalDivider(color = Color(0x1AFFFFFF), thickness = 0.5.dp, modifier = Modifier.padding(horizontal = 16.dp))

                // 4. Referral / Settings
                AccountMenuItemRow(
                    iconRes = R.drawable.ic_acct_referral,
                    title = "Referral",
                    onClick = {
                        onSettingsClick()
                    },
                    trailingContent = {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_acct_chevron),
                            contentDescription = "Open",
                            modifier = Modifier.size(14.dp),
                            tint = Color(0xFF9CA3AF)
                        )
                    }
                )
            }
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Subcomponents for Account Screen
// ─────────────────────────────────────────────────────────────────────────────

@Composable
private fun AccountGridItem(
    @androidx.annotation.DrawableRes iconRes: Int,
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .noRippleClickable { onClick() },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            painter = painterResource(id = iconRes),
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = Color(0xFFCBD5E1)
        )
        Spacer(modifier = Modifier.height(6.dp))
        Text(
            text = label,
            fontSize = 11.5.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Medium,
            color = Color(0xFFCBD5E1),
            textAlign = TextAlign.Center,
            maxLines = 1
        )
    }
}

@Composable
private fun AccountMenuItemRow(
    @androidx.annotation.DrawableRes iconRes: Int,
    title: String,
    onClick: (() -> Unit)? = null,
    trailingContent: @Composable () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .then(if (onClick != null) Modifier.noRippleClickable { onClick() } else Modifier)
            .padding(horizontal = 16.dp, vertical = 13.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = title,
                modifier = Modifier.size(20.dp),
                tint = Color(0xFFCBD5E1)
            )
            Text(
                text = title,
                fontSize = 14.5.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        trailingContent()
    }
}
