package com.playingame.app.game.ringoffuture.ui

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
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.ui.theme.RubikFont
import androidx.activity.compose.BackHandler
import androidx.compose.runtime.remember

@Composable
fun RingOfFutureScreen(
    onBackClick: () -> Unit = {},
    onOpenDepositScreen: () -> Unit = {}
) {
    BackHandler {
        onBackClick()
    }

    androidx.compose.runtime.LaunchedEffect(Unit) {
        com.playingame.app.data.remote.WalletSyncService.syncBalance()
    }

    val sessionToken = com.playingame.app.core.session.SessionManager.authToken() ?: ""
    val gameUrl = "${ClientConfig.SERVER_BASE_URL}/game/ring-of-future"
    val authHeaders = remember(sessionToken) {
        if (sessionToken.isNotBlank()) {
            mapOf("Authorization" to "Bearer $sessionToken")
        } else {
            emptyMap()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0C11))
            .statusBarsPadding()
            .navigationBarsPadding()
    ) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    // Enable GPU Hardware Acceleration Layer
                    setLayerType(android.view.View.LAYER_TYPE_HARDWARE, null)

                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.databaseEnabled = true
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true
                    settings.allowFileAccess = true
                    settings.allowContentAccess = true
                    settings.allowFileAccessFromFileURLs = true
                    settings.allowUniversalAccessFromFileURLs = true
                    settings.setGeolocationEnabled(false)
                    settings.cacheMode = android.webkit.WebSettings.LOAD_DEFAULT

                    // Disable WebView debugging in production
                    if (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE == 0) {
                        WebView.setWebContentsDebuggingEnabled(false)
                    }

                    addJavascriptInterface(object {
                        @JavascriptInterface
                        fun closeGame() {
                            post { onBackClick() }
                        }

                        @JavascriptInterface
                        fun openDeposit() {
                            post { onOpenDepositScreen() }
                        }

                        @JavascriptInterface
                        fun getAuthToken(): String {
                            val token = com.playingame.app.data.repository.AuthRepository.getAuthToken()
                            if (token.isNotEmpty()) return token
                            return com.playingame.app.core.session.SessionManager.authToken() ?: ""
                        }

                        @JavascriptInterface
                        fun getUserId(): String {
                            val uid = com.playingame.app.data.repository.AuthRepository.currentSession.value.userId
                            if (uid.isNotEmpty()) return uid
                            val sessionUid = com.playingame.app.core.session.SessionManager.currentUserId()
                            if (!sessionUid.isNullOrEmpty()) return sessionUid
                            val ledgerUid = com.playingame.app.game.ringoffuture.backend.WalletLedger.userProfile.value.userId
                            if (ledgerUid.isNotEmpty()) return ledgerUid
                            return "player_guest"
                        }

                        @JavascriptInterface
                        fun getLocalWalletBalancePaise(): Long {
                            return com.playingame.app.game.ringoffuture.backend.WalletLedger.walletBalance.value.totalPaise
                        }

                        @JavascriptInterface
                        fun placeLocalBet(amountPaise: Long): Boolean {
                            val result = com.playingame.app.game.ringoffuture.backend.WalletLedger.placeBet(amountPaise)
                            return result.success
                        }

                        @JavascriptInterface
                        fun creditLocalWinnings(amountPaise: Long, multiplierLabel: String) {
                            com.playingame.app.game.ringoffuture.backend.WalletLedger.creditWin(amountPaise, multiplierLabel)
                        }

                        @JavascriptInterface
                        fun syncWalletBalance(paise: Long) {
                            if (paise <= 0L) return
                            post {
                                com.playingame.app.game.ringoffuture.backend.WalletLedger.syncBalance(
                                    depositPaise = paise,
                                    winningPaise = 0L,
                                    bonusPaise = 0L
                                )
                            }
                        }

                        @JavascriptInterface
                        fun getServerUrl(): String = ClientConfig.SERVER_BASE_URL
                    }, "AndroidBridge")

                    webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(view: WebView?, request: android.webkit.WebResourceRequest?): Boolean {
                            val url = request?.url?.toString() ?: return true
                            return isDisallowedNavigation(url)
                        }

                        @Deprecated("Deprecated in Java")
                        override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                            if (url == null) return true
                            return isDisallowedNavigation(url)
                        }

                        private fun isDisallowedNavigation(url: String): Boolean {
                            if (url.startsWith("file:///android_asset/")) return false
                            val parsedUri = android.net.Uri.parse(url)
                            val baseUri = android.net.Uri.parse(ClientConfig.SERVER_BASE_URL)
                            val scheme = parsedUri.scheme?.lowercase() ?: ""

                            if (scheme == "https" || scheme == "http") {
                                if (parsedUri.host.equals(baseUri.host, ignoreCase = true) &&
                                    parsedUri.port == baseUri.port) {
                                    return false // Allow internal game navigation
                                }
                            }
                            android.util.Log.w("RingOfFuture", "Blocked unauthorized WebView navigation to: $url")
                            return true // Block external navigation
                        }
                    }

                    // Load offline-first local game bundle (Instant 0-lag launch)
                    loadUrl("file:///android_asset/games/ring_of_future/index.html")
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
