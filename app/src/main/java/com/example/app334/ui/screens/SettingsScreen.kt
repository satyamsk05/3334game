package com.example.app334.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.game.ringoffuture.backend.WalletLedger

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

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(22.dp)
    ) {
        // 1. Top Header Row with Back Button & Title
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 45.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(24.dp),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Text(
                text = "Settings",
                fontSize = 29.sp,
                fontWeight = FontWeight.Black,
                color = Color.White
            )
        }

        // 2. Section: Money
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "Money",
                fontSize = 14.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 6.dp)
            )

            SettingsRow(
                title = "Add cash",
                iconRes = R.drawable.ic_settings_add_cash,
                onClick = onAddCashClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "Transaction history",
                iconRes = R.drawable.ic_settings_history,
                onClick = onTransactionHistoryClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "Withdrawals",
                iconRes = R.drawable.ic_settings_withdraw,
                onClick = onWithdrawalsClick
            )
        }

        // 3. Section: Help & Updates
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "Help & Updates",
                fontSize = 14.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 6.dp)
            )

            SettingsRow(
                title = "Check for updates",
                iconRes = R.drawable.ic_settings_update,
                onClick = {
                    Toast.makeText(context, "You are on the latest version (v1.0.0)", Toast.LENGTH_SHORT).show()
                    onCheckUpdatesClick()
                }
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "Help Centre",
                iconRes = R.drawable.ic_settings_help,
                onClick = onHelpCentreClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "My reported issues",
                iconRes = R.drawable.ic_settings_issues,
                onClick = onReportedIssuesClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "About us",
                iconRes = R.drawable.ic_settings_about,
                onClick = onAboutUsClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "Contact us",
                iconRes = R.drawable.ic_settings_contact,
                onClick = onContactUsClick
            )
            HorizontalDivider(color = Color(0xFF2D0A4E), thickness = 1.dp)

            SettingsRow(
                title = "InGames Fair Play",
                iconRes = R.drawable.ic_settings_shield,
                onClick = onFairPlayClick
            )
        }

        // 4. Section: Account
        Column(
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = "Account",
                fontSize = 14.5.sp,
                fontWeight = FontWeight.ExtraBold,
                color = Color(0xFF9CA3AF),
                modifier = Modifier.padding(bottom = 6.dp)
            )

            SettingsRow(
                title = "Logout Account",
                iconRes = R.drawable.ic_settings_logout,
                onClick = {
                    Toast.makeText(context, "Logged out successfully", Toast.LENGTH_SHORT).show()
                    onLogoutClick()
                }
            )
        }
        
        Spacer(modifier = Modifier.height(60.dp))
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
            .padding(vertical = 12.dp),
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
                tint = Color(0xFFD1D5DB)
            )

            Text(
                text = title,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        Text(
            text = "›",
            fontSize = 22.sp,
            fontWeight = FontWeight.ExtraBold,
            color = Color(0xFF9CA3AF)
        )
    }
}
