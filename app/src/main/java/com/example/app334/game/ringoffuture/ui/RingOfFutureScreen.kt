package com.example.app334.game.ringoffuture.ui

import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.example.app334.core.config.ClientConfig
import com.example.app334.ui.theme.RubikFont

import androidx.activity.compose.BackHandler
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import com.example.app334.game.ringoffuture.backend.WalletLedger

@Composable
fun RingOfFutureScreen(
    onBackClick: () -> Unit = {},
    onOpenDepositScreen: () -> Unit = {}
) {
    BackHandler {
        onBackClick()
    }

    val userProfile by WalletLedger.userProfile.collectAsState()
    val gameUrl = "${ClientConfig.SERVER_BASE_URL}/game/ring-of-future?userId=${userProfile.userId}"

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF2A2A2A))
    ) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true

                    addJavascriptInterface(object {
                        @JavascriptInterface
                        fun closeGame() {
                            post { onBackClick() }
                        }
                    }, "AndroidBridge")

                    webViewClient = WebViewClient()
                    loadUrl(gameUrl)
                }
            },
            onRelease = { webView ->
                webView.stopLoading()
                webView.destroy()
            },
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Composable
fun DepositPaymentScreen(
    onBackClick: () -> Unit = {},
    onSuccess: () -> Unit = {}
) {
    BackHandler {
        onBackClick()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF13001C))
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Deposit Payment",
            fontSize = 24.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Spacer(modifier = Modifier.height(16.dp))
        Box(
            modifier = Modifier
                .clickable { onBackClick() }
                .padding(12.dp)
        ) {
            Text(
                text = "← Back",
                fontSize = 16.sp,
                fontFamily = RubikFont,
                color = Color(0xFFA78BFA)
            )
        }
    }
}
