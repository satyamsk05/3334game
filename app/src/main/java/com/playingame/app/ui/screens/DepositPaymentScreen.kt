package com.playingame.app.ui.screens

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.playingame.app.R
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.remote.WalletSyncService
import com.playingame.app.game.ringoffuture.backend.WalletLedger
import com.playingame.app.ui.theme.AppBackground
import com.playingame.app.ui.theme.CardNavyBackground
import com.playingame.app.ui.theme.RubikFont

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun DepositPaymentScreen(
    amountRupees: Double = 100.0,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current
    val userProfile by WalletLedger.userProfile.collectAsState()
    var isLoading by remember { mutableStateOf(true) }
    val sessionToken = SessionManager.authToken() ?: ""

    // Build the secure payment gateway URL
    val payUrl = remember(amountRupees, userProfile.userId) {
        val base = "${ClientConfig.SERVER_BASE_URL}/pay"
        val amt = String.format(java.util.Locale.US, "%.0f", amountRupees)
        if (sessionToken.isNotBlank()) {
            "$base?userId=${userProfile.userId}&amount=$amt&token=$sessionToken"
        } else {
            "$base?userId=${userProfile.userId}&amount=$amt"
        }
    }

    BackHandler {
        onBackClick()
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(AppBackground)
            .statusBarsPadding()
    ) {
        // Top Header Bar
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .background(CardNavyBackground)
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF141923))
                        .clickable {
                            onBackClick()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_arrow_back),
                        contentDescription = "Back",
                        modifier = Modifier.size(18.dp),
                        tint = Color.White
                    )
                }

                Text(
                    text = "Deposit Payment",
                    fontSize = 18.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Text(
                text = "₹${String.format(java.util.Locale.US, "%.0f", amountRupees)}",
                fontSize = 17.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFFB800)
            )
        }

        // Webview Container
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .background(Color(0xFF0F1218))
        ) {
            AndroidView(
                modifier = Modifier.fillMaxSize(),
                factory = { ctx ->
                    WebView(ctx).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.loadWithOverviewMode = true
                        settings.useWideViewPort = true
                        settings.setSupportZoom(true)
                        settings.builtInZoomControls = false
                        settings.allowFileAccess = false
                        settings.allowContentAccess = false
                        settings.setGeolocationEnabled(false)

                        if (ctx.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE == 0) {
                            WebView.setWebContentsDebuggingEnabled(false)
                        }

                        webChromeClient = object : WebChromeClient() {
                            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                                if (newProgress >= 90) {
                                    isLoading = false
                                }
                            }
                        }

                        webViewClient = object : WebViewClient() {
                            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                                val url = request?.url?.toString() ?: return false
                                return handleCustomUri(url)
                            }

                            @Deprecated("Deprecated in Java")
                            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                                if (url == null) return false
                                return handleCustomUri(url)
                            }

                            private fun handleCustomUri(url: String): Boolean {
                                // Intercept UPI deep link schemes (upi://, phonepe://, paytmmp://, gpay://, etc.)
                                if (url.startsWith("upi:") || url.startsWith("phonepe:") ||
                                    url.startsWith("paytmmp:") || url.startsWith("tez:")
                                ) {
                                    return try {
                                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                                        context.startActivity(intent)
                                        true
                                    } catch (e: Exception) {
                                        android.widget.Toast.makeText(
                                            context,
                                            "No supported UPI App found for this link",
                                            android.widget.Toast.LENGTH_SHORT
                                        ).show()
                                        true
                                    }
                                }

                                if (url.startsWith("intent:")) {
                                    return try {
                                        val intent = Intent.parseUri(url, Intent.URI_INTENT_SCHEME)
                                        intent.addCategory(Intent.CATEGORY_BROWSABLE)
                                        intent.component = null
                                        intent.selector = null
                                        context.startActivity(intent)
                                        true
                                    } catch (e: Exception) {
                                        android.widget.Toast.makeText(
                                            context,
                                            "No supported UPI App found for this link",
                                            android.widget.Toast.LENGTH_SHORT
                                        ).show()
                                        true
                                    }
                                }

                                // For standard HTTP/HTTPS, allow navigation
                                val scheme = Uri.parse(url).scheme?.lowercase() ?: ""
                                if (scheme != "http" && scheme != "https") {
                                    return true // block unknown or dangerous schemes (file:, javascript:, etc.)
                                }
                                return false
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                super.onPageFinished(view, url)
                                isLoading = false
                            }
                        }

                        settings.cacheMode = WebSettings.LOAD_NO_CACHE
                        loadUrl(payUrl)
                    }
                },
                onRelease = { webView ->
                    try {
                        webView.stopLoading()
                        webView.clearHistory()
                        webView.clearCache(true)
                        webView.removeAllViews()
                        webView.destroy()
                    } catch (e: Exception) {
                        android.util.Log.w("DepositPayment", "Error releasing WebView: ${e.message}")
                    }
                }
            )

            if (isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        color = Color(0xFFFFB800),
                        modifier = Modifier.size(40.dp)
                    )
                }
            }
        }
    }
}
