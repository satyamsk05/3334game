package com.playingame.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.ui.theme.AppBackground

@Composable
fun DepositPaymentScreen(
    amountRupees: Double = 100.0,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val payUrl = remember(amountRupees) {
        val base = "${ClientConfig.PAYMENT_GATEWAY_URL}/pay"
        val amt = String.format(java.util.Locale.US, "%.0f", amountRupees)
        "$base?amount=$amt"
    }

    LaunchedEffect(payUrl) {
        try {
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(payUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)
        } catch (_: Exception) {
            android.widget.Toast.makeText(context, "Redirecting to payment gateway...", android.widget.Toast.LENGTH_SHORT).show()
        }
        onBackClick()
    }

    BackHandler {
        onBackClick()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = Color(0xFFA78BFA),
            modifier = Modifier.size(36.dp)
        )
    }
}
