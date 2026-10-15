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
import com.playingame.app.R
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.theme.AppBackground
import com.playingame.app.ui.theme.BrandCasinoGreen
import com.playingame.app.ui.theme.RubikFont
import com.playingame.app.util.noRippleClickable

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
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val userProfile by WalletLedger.userProfile.collectAsState()

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
        // 3. Level / Tier Banner (BEGINNER - 957 XP to BRONZE I)
        // ─────────────────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF2B2E34))
                .border(1.dp, Color(0xFF383C44), RoundedCornerShape(16.dp))
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
                    Text(
                        text = "BEGINNER",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White
                    )

                    Text(
                        text = "957 XP to BRONZE I",
                        fontSize = 11.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF9CA3AF)
                    )
                }

                // Custom XP Progress Track with Knob Indicator
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(percent = 50))
                        .background(Color(0xFF1F2227)),
                    contentAlignment = Alignment.CenterStart
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth(0.18f)
                            .fillMaxHeight()
                            .background(Color(0xFF6B7280))
                    )
                    // Floating circular knob
                    Box(
                        modifier = Modifier
                            .padding(start = 10.dp)
                            .size(12.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF9CA3AF))
                            .border(1.5.dp, Color(0xFFD1D5DB), CircleShape)
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
