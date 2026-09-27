package com.playingame.app

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
import com.playingame.app.data.remote.WalletSyncService
import com.playingame.app.data.repository.AuthRepository
import com.playingame.app.ui.screens.HomeScreen
import com.playingame.app.ui.screens.LoginScreen
import com.playingame.app.ui.screens.SplashScreen
import com.playingame.app.ui.theme.App334Theme
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
                val context = androidx.compose.ui.platform.LocalContext.current

                // Runtime permission launcher for Location + Notification permissions
                val permissionLauncher = androidx.activity.compose.rememberLauncherForActivityResult(
                    contract = androidx.activity.result.contract.ActivityResultContracts.RequestMultiplePermissions()
                ) { permissionsMap ->
                    val fineLocation = permissionsMap[android.Manifest.permission.ACCESS_FINE_LOCATION] ?: false
                    val coarseLocation = permissionsMap[android.Manifest.permission.ACCESS_COARSE_LOCATION] ?: false
                    val notifications = if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.TIRAMISU) {
                        permissionsMap[android.Manifest.permission.POST_NOTIFICATIONS] ?: false
                    } else true

                    android.util.Log.i(
                        "AppPermissions",
                        "Permissions updated -> Location: ${fineLocation || coarseLocation}, Notifications: $notifications"
                    )
                }

                androidx.compose.runtime.LaunchedEffect(Unit) {
                    if (!com.playingame.app.util.PermissionUtils.areAllPermissionsGranted(context)) {
                        permissionLauncher.launch(com.playingame.app.util.PermissionUtils.getRequiredPermissions())
                    }
                }

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
                    color = com.playingame.app.ui.theme.AppBackground
                ) {
                    if (session.isBanned) {
                        com.playingame.app.ui.components.AccountBannedDialog(onDismiss = {})
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

