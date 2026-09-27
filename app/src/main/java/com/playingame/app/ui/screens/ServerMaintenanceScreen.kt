package com.playingame.app.ui.screens

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.ui.theme.RubikFont

@Composable
fun ServerMaintenanceScreen(
    message: String,
    isRetrying: Boolean,
    onRetry: () -> Unit
) {
    val infiniteTransition = rememberInfiniteTransition(label = "pulse_maint")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.05f,
        animationSpec = infiniteRepeatable(
            animation = tween(1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScaleMaint"
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0614))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            // Glowing Server Maintenance Icon Container
            Box(
                modifier = Modifier
                    .size(120.dp)
                    .scale(pulseScale)
                    .clip(CircleShape)
                    .background(
                        Brush.radialGradient(
                            colors = listOf(
                                Color(0xFF8B5CF6).copy(alpha = 0.3f),
                                Color(0xFF1E1634).copy(alpha = 0.8f),
                                Color.Transparent
                            )
                        )
                    )
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_server_maintenance),
                    contentDescription = "Server Maintenance",
                    modifier = Modifier.size(54.dp),
                    tint = Color.Unspecified
                )
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Main Title
            Text(
                text = "Under Maintenance",
                fontSize = 22.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.ExtraBold,
                color = Color.White,
                textAlign = TextAlign.Center
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Subtitle Description
            Text(
                text = message.ifBlank {
                    "We are upgrading our game servers to provide lightning-fast gameplay. We will be back online shortly!"
                },
                fontSize = 13.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Normal,
                color = Color(0xFF948BA8),
                textAlign = TextAlign.Center,
                lineHeight = 19.sp,
                modifier = Modifier.padding(horizontal = 16.dp)
            )

            Spacer(modifier = Modifier.height(36.dp))

            // Check Status Button
            Button(
                onClick = { onRetry() },
                enabled = !isRetrying,
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF7C3AED),
                    disabledContainerColor = Color(0xFF4C1D95)
                ),
                modifier = Modifier
                    .fillMaxWidth(0.8f)
                    .height(52.dp)
            ) {
                if (isRetrying) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(20.dp),
                        color = Color.White,
                        strokeWidth = 2.5.dp
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Checking Server Status...",
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                } else {
                    Text(
                        text = "CHECK SERVER STATUS",
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Black,
                        letterSpacing = 0.5.sp,
                        color = Color.White
                    )
                }
            }
        }
    }
}
