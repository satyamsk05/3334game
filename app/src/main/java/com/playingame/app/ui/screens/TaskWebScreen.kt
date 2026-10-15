package com.playingame.app.ui.screens

import android.annotation.SuppressLint
import android.graphics.Bitmap
import android.view.ViewGroup
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.data.wallet.WalletLedger
import com.playingame.app.ui.theme.RubikFont
import com.playingame.app.ui.theme.TabActiveGold
import java.net.URLEncoder

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun TaskWebScreen(
    modifier: Modifier = Modifier
) {
    val userProfile by WalletLedger.userProfile.collectAsState()
    var isLoading by remember { mutableStateOf(true) }

    val serverUrl = remember(userProfile.userId) {
        val base = if (ClientConfig.SERVER_BASE_URL.isNotBlank()) {
            ClientConfig.SERVER_BASE_URL.removeSuffix("/")
        } else {
            "http://10.0.2.2:8080"
        }
        val token = SessionManager.authToken() ?: ""
        val encodedToken = try {
            URLEncoder.encode(token, "UTF-8")
        } catch (_: Exception) {
            token
        }
        "$base/tasks?token=$encodedToken&userId=${userProfile.userId}"
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF12131A))
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Screen Top Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Daily Tasks & Rewards",
                    fontSize = 18.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f)
            ) {
                AndroidView(
                    factory = { context ->
                        WebView(context).apply {
                            layoutParams = ViewGroup.LayoutParams(
                                ViewGroup.LayoutParams.MATCH_PARENT,
                                ViewGroup.LayoutParams.MATCH_PARENT
                            )
                            setBackgroundColor(android.graphics.Color.parseColor("#12131A"))

                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                loadWithOverviewMode = true
                                useWideViewPort = true
                                cacheMode = WebSettings.LOAD_DEFAULT
                                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                            }

                            webViewClient = object : WebViewClient() {
                                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                                    super.onPageStarted(view, url, favicon)
                                    isLoading = true
                                }

                                override fun onPageFinished(view: WebView?, url: String?) {
                                    super.onPageFinished(view, url)
                                    isLoading = false
                                }
                            }

                            webChromeClient = WebChromeClient()
                            loadUrl(serverUrl)
                        }
                    },
                    update = { webView ->
                        // Refresh when url changes
                    },
                    modifier = Modifier.fillMaxSize()
                )

                if (isLoading) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            color = TabActiveGold,
                            strokeWidth = 3.dp,
                            modifier = Modifier.size(36.dp)
                        )
                    }
                }
            }
        }
    }
}
