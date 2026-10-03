package com.playingame.app.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.ui.theme.RubikFont

@Composable
fun SettingsScreen(
    onBackClick: () -> Unit = {},
    onAddCashClick: () -> Unit = {},
    onTransactionHistoryClick: () -> Unit = {},
    onWithdrawalsClick: () -> Unit = {},
    onCheckUpdatesClick: () -> Unit = {},
    onHelpCentreClick: () -> Unit = {},
    onReportedIssuesClick: () -> Unit = {},
    onAboutUsClick: () -> Unit = {},
    onContactUsClick: () -> Unit = {},
    onFairPlayClick: () -> Unit = {},
    onLogoutClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    BackHandler {
        onBackClick()
    }

    val context = LocalContext.current
    val userProfile by WalletLedger.userProfile.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(Color(0xFF130924), Color(0xFF090412))))
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState())
            .padding(bottom = 80.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        // 1. Top Header Row with Back Button & Title
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 16.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1E1634))
                    .clickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(18.dp),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Text(
                text = "Settings",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // 2. User Profile Summary Card (Avatar + Username + Phone)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF1E1634))
                .border(1.dp, Color(0xFF281C44), RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // 3D Avatar with Gold Border
                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color(0xFFFFB800), CircleShape)
                ) {
                    Image(
                        painter = painterResource(id = userProfile.avatarRes),
                        contentDescription = "User Avatar",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }

                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = userProfile.username.ifEmpty { "Player" },
                        fontSize = 18.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )

                    if (userProfile.phone.isNotEmpty()) {
                        Text(
                            text = if (userProfile.phone.startsWith("+91")) userProfile.phone else "+91 ${userProfile.phone}",
                            fontSize = 13.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF948BA8)
                        )
                    }

                    Text(
                        text = "ID: ${userProfile.userId.take(8)}",
                        fontSize = 11.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFFFB800)
                    )
                }
            }
        }

        // 3. Section: Money
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "MONEY",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF948BA8),
                letterSpacing = 0.5.sp,
                modifier = Modifier.padding(bottom = 6.dp, start = 4.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1E1634))
                    .border(1.dp, Color(0xFF281C44), RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp, vertical = 4.dp)
            ) {
                Column {
                    SettingsRow(
                        title = "Add cash",
                        iconRes = R.drawable.ic_settings_add_cash,
                        onClick = onAddCashClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "Transaction history",
                        iconRes = R.drawable.ic_settings_history,
                        onClick = onTransactionHistoryClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "Withdrawals",
                        iconRes = R.drawable.ic_settings_withdraw,
                        onClick = onWithdrawalsClick
                    )
                }
            }
        }

        // 4. Section: Help & Updates
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "HELP & UPDATES",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF948BA8),
                letterSpacing = 0.5.sp,
                modifier = Modifier.padding(bottom = 6.dp, start = 4.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1E1634))
                    .border(1.dp, Color(0xFF281C44), RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp, vertical = 4.dp)
            ) {
                Column {
                    SettingsRow(
                        title = "Check for updates",
                        iconRes = R.drawable.ic_settings_update,
                        onClick = {
                            Toast.makeText(context, "You are on the latest version (v1.0.0)", Toast.LENGTH_SHORT).show()
                            onCheckUpdatesClick()
                        }
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "Help Centre",
                        iconRes = R.drawable.ic_settings_help,
                        onClick = onHelpCentreClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "My reported issues",
                        iconRes = R.drawable.ic_settings_issues,
                        onClick = onReportedIssuesClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "About us",
                        iconRes = R.drawable.ic_settings_about,
                        onClick = onAboutUsClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "Contact us",
                        iconRes = R.drawable.ic_settings_contact,
                        onClick = onContactUsClick
                    )
                    HorizontalDivider(color = Color(0xFF281C44), thickness = 1.dp)

                    SettingsRow(
                        title = "InGames Fair Play",
                        iconRes = R.drawable.ic_settings_shield,
                        onClick = onFairPlayClick
                    )
                }
            }
        }

        // 5. Section: Account
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "ACCOUNT",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF948BA8),
                letterSpacing = 0.5.sp,
                modifier = Modifier.padding(bottom = 6.dp, start = 4.dp)
            )

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color(0xFF1E1634))
                    .border(1.dp, Color(0xFF281C44), RoundedCornerShape(16.dp))
                    .padding(horizontal = 16.dp, vertical = 4.dp)
            ) {
                SettingsRow(
                    title = "Logout Account",
                    iconRes = R.drawable.ic_settings_logout,
                    onClick = {
                        Toast.makeText(context, "Logged out successfully", Toast.LENGTH_SHORT).show()
                        onLogoutClick()
                    }
                )
            }
        }
        
        Spacer(modifier = Modifier.height(20.dp))
    }
}

@Composable
fun SettingsRow(
    title: String,
    iconRes: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 14.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Icon(
                painter = painterResource(id = iconRes),
                contentDescription = title,
                modifier = Modifier.size(22.dp),
                tint = Color(0xFFA78BFA)
            )

            Text(
                text = title,
                fontSize = 16.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Text(
            text = "›",
            fontSize = 20.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF948BA8)
        )
    }
}

