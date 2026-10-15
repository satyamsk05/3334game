package com.playingame.app.ui.screens

import android.os.Build.VERSION.SDK_INT
import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.ImageLoader
import coil.compose.AsyncImage
import coil.decode.GifDecoder
import coil.decode.ImageDecoderDecoder
import coil.request.ImageRequest
import coil.request.repeatCount
import com.playingame.app.R
import com.playingame.app.data.remote.AppBootstrapService
import com.playingame.app.data.remote.BootstrapState
import com.playingame.app.data.repository.AuthRepository
import com.playingame.app.ui.components.AccountBannedDialog
import com.playingame.app.ui.theme.RubikFont
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val context = LocalContext.current
    val imageLoader = remember {
        ImageLoader.Builder(context)
            .components {
                if (SDK_INT >= 28) {
                    add(ImageDecoderDecoder.Factory())
                } else {
                    add(GifDecoder.Factory())
                }
            }
            .build()
    }

    val contentAlpha = remember { Animatable(0f) }
    val progressAnim = remember { Animatable(0.06f) }
    var isBannedState by remember { mutableStateOf(false) }

    // Idle floating bobbing animation
    val infiniteTransition = rememberInfiniteTransition(label = "splash_idle")
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -5f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(1500, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "float_offset"
    )

    // Subtle sunburst rotation
    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(45000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "sunburst_rotation"
    )

    // Glowing aura pulse
    val auraPulse by infiniteTransition.animateFloat(
        initialValue = 0.6f,
        targetValue = 1.0f,
        animationSpec = infiniteRepeatable(
            animation = tween(1300, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "aura_pulse"
    )

    LaunchedEffect(key1 = true) {
        val splashStartTime = System.currentTimeMillis()

        launch {
            contentAlpha.animateTo(
                targetValue = 1.0f,
                animationSpec = tween(durationMillis = 200)
            )
        }

        // 2. Chunky game progress simulation during bootstrap
        launch {
            progressAnim.animateTo(
                targetValue = 0.85f,
                animationSpec = tween(durationMillis = 2000, easing = LinearOutSlowInEasing)
            )
        }

        // 3. Health handshake
        val bootstrapResult = AppBootstrapService.performBootstrap()
        if (bootstrapResult !is BootstrapState.Ready) {
            return@LaunchedEffect
        }

        // 4. Ban check
        val session = AuthRepository.currentSession.value
        val banned = if (session.userId.isNotBlank()) {
            AuthRepository.checkBanStatus(session.userId, session.phone)
        } else {
            session.isBanned
        }

        if (banned) {
            isBannedState = true
            return@LaunchedEffect
        }

        // 5. Fill loading bar to 100%
        progressAnim.animateTo(
            targetValue = 1.0f,
            animationSpec = tween(durationMillis = 350, easing = FastOutSlowInEasing)
        )

        // Ensure user sees the complete animated logo (~2700ms)
        val elapsed = System.currentTimeMillis() - splashStartTime
        val remaining = 2700L - elapsed
        if (remaining > 0) {
            delay(remaining)
        } else {
            delay(250)
        }
        onSplashFinished()
    }

    if (isBannedState) {
        AccountBannedDialog(onDismiss = {})
    }

    val currentProgress = progressAnim.value

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF1B2C16)),
        contentAlignment = Alignment.Center
    ) {
        // ─────────────────────────────────────────────────────────────────────
        // 1. Lush Forest Explorer Artwork Background
        // ─────────────────────────────────────────────────────────────────────
        Image(
            painter = painterResource(id = R.drawable.bg_splash_forest),
            contentDescription = "Forest Explorer Background",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // ─────────────────────────────────────────────────────────────────────
        // 2. Animated Game Title Logo (Centerpiece)
        // ─────────────────────────────────────────────────────────────────────
        Box(
            modifier = Modifier
                .align(Alignment.TopCenter)
                .statusBarsPadding()
                .offset(y = 50.dp + floatOffset.dp)
                .alpha(contentAlpha.value)
                .fillMaxWidth(0.88f)
                .aspectRatio(980f / 720f),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = ImageRequest.Builder(context)
                    .data(R.drawable.logo_bit_arcade_title)
                    .repeatCount(0)
                    .build(),
                imageLoader = imageLoader,
                contentDescription = "Arcade Game Logo Animation",
                modifier = Modifier.fillMaxSize(),
                contentScale = ContentScale.Fit
            )
        }

        // ─────────────────────────────────────────────────────────────────────
        // 3. Themed Forest Arcade Loading Bar (Matching Reference Artwork)
        // ─────────────────────────────────────────────────────────────────────
        Column(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .navigationBarsPadding()
                .padding(bottom = 46.dp)
                .alpha(contentAlpha.value),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Chunky Dark Wood/Brown Pill Container
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.68f)
                    .height(22.dp)
                    .clip(RoundedCornerShape(11.dp))
                    .background(Color(0xFF2E211B))
                    .border(2.dp, Color(0xFF4A382D), RoundedCornerShape(11.dp))
                    .padding(2.5.dp),
                contentAlignment = Alignment.CenterStart
            ) {
                // Vibrant Neon Green Game Progress Fill
                Box(
                    modifier = Modifier
                        .fillMaxWidth(currentProgress.coerceIn(0.04f, 1f))
                        .fillMaxHeight()
                        .clip(RoundedCornerShape(8.dp))
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(
                                    Color(0xFF00E676),
                                    Color(0xFF22C55E),
                                    Color(0xFF4ADE80)
                                )
                            )
                        )
                ) {
                    // Glossy Top Reflection Line
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .fillMaxHeight(0.38f)
                            .background(Color.White.copy(alpha = 0.35f))
                    )
                }
            }

            // Warm "Loading..." text below bar matching artwork
            Text(
                text = if (currentProgress >= 0.99f) "Starting Game..." else "Loading...",
                fontSize = 12.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFE2D6B5),
                letterSpacing = 0.5.sp
            )
        }
    }
}
