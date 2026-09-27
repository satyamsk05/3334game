package com.game3334.play

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.view.WindowCompat
import androidx.core.view.WindowInsetsCompat
import androidx.core.view.WindowInsetsControllerCompat
import androidx.lifecycle.lifecycleScope
import com.game3334.play.data.remote.WalletSyncService
import com.game3334.play.data.repository.AuthRepository
import com.game3334.play.ui.screens.HomeScreen
import com.game3334.play.ui.screens.LoginScreen
import com.game3334.play.ui.screens.SplashScreen
import com.game3334.play.ui.theme.App334Theme
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize persistent user auth session
        AuthRepository.init(this)

        // Initialize Rive runtime
        try {
            app.rive.runtime.kotlin.core.Rive.init(this)
        } catch (e: Exception) {
            android.util.Log.e("MainActivity", "Rive init error: ${e.message}")
        }

        // Configure edge-to-edge system bars appearance for dark gaming theme
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.isAppearanceLightStatusBars = false
        windowInsetsController.isAppearanceLightNavigationBars = false

        setContent {
            App334Theme {
                var isSplashFinished by remember { mutableStateOf(false) }
                val session by AuthRepository.currentSession.collectAsState()

                androidx.compose.runtime.LaunchedEffect(session.isLoggedIn) {
                    if (session.isLoggedIn) {
                        WalletSyncService.startLiveSync(lifecycleScope)
                        WalletSyncService.syncBalance(session.userId)
                    } else {
                        WalletSyncService.stopLiveSync()
                    }
                }

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = com.game3334.play.ui.theme.AppBackground
                ) {
                    if (session.isBanned) {
                        com.game3334.play.ui.components.AccountBannedDialog(onDismiss = {})
                    } else if (!isSplashFinished) {
                        SplashScreen(onSplashFinished = { isSplashFinished = true })
                    } else if (!session.isLoggedIn) {
                        LoginScreen(onLoginSuccess = {
                            // Session isLoggedIn state change automatically transitions to HomeScreen
                        })
                    } else {
                        HomeScreen()
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        // Immediately refresh server wallet balance when app returns to foreground
        lifecycleScope.launch {
            WalletSyncService.syncBalance()
        }
    }

    override fun onStop() {
        super.onStop()
        WalletSyncService.stopLiveSync()
    }
}

