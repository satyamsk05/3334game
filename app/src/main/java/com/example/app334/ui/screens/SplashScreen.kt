package com.example.app334.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont
import kotlinx.coroutines.delay

@Composable
fun SplashScreen(
    onSplashFinished: () -> Unit
) {
    val scale = remember { Animatable(0.75f) }
    val alpha = remember { Animatable(0f) }

    LaunchedEffect(key1 = true) {
        scale.animateTo(
            targetValue = 1.0f,
            animationSpec = spring(
                dampingRatio = Spring.DampingRatioMediumBouncy,
                stiffness = Spring.StiffnessLow
            )
        )
        alpha.animateTo(
            targetValue = 1.0f,
            animationSpec = tween(durationMillis = 400)
        )
        delay(1400)
        onSplashFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(horizontal = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        // Centered Content (Rounded Logo Box + Title)
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.scale(scale.value)
        ) {
            // Rounded App Logo Box (Matching Screenshot 1)
            Box(
                modifier = Modifier
                    .size(110.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(Color.White)
                    .padding(18.dp),
                contentAlignment = Alignment.Center
            ) {
                Image(
                    painter = painterResource(id = R.drawable.ic_launcher),
                    contentDescription = "App Logo",
                    modifier = Modifier.fillMaxSize()
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Bold Title
            Text(
                text = "334Game",
                fontSize = 32.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = (-0.5).sp
            )
        }

        // Bottom Subtitle (Matching Screenshot 1)
        Text(
            text = "Play, win and withdraw with ease.",
            fontSize = 13.sp,
            fontFamily = RubikFont,
            fontWeight = FontWeight.Normal,
            color = Color.White.copy(alpha = 0.6f),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 48.dp)
        )
    }
}

