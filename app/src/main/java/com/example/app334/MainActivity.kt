package com.example.app334

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
import com.example.app334.data.repository.AuthRepository
import com.example.app334.ui.screens.HomeScreen
import com.example.app334.ui.screens.LoginScreen
import com.example.app334.ui.screens.SplashScreen
import com.example.app334.ui.theme.App334Theme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        // Initialize persistent user auth session
        AuthRepository.init(this)

        // Enable true immersive full screen mode (hides status bar and bottom navigation bar)
        val windowInsetsController = WindowCompat.getInsetsController(window, window.decorView)
        windowInsetsController.systemBarsBehavior =
            WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
        windowInsetsController.hide(WindowInsetsCompat.Type.systemBars())

        setContent {
            App334Theme {
                var isSplashFinished by remember { mutableStateOf(false) }
                val session by AuthRepository.currentSession.collectAsState()

                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF150529)
                ) {
                    if (!isSplashFinished) {
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
}
