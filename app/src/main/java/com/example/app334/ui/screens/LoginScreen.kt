package com.example.app334.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.core.config.ClientConfig
import com.example.app334.data.repository.AuthRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

import com.example.app334.data.remote.LogginAuthService
import kotlinx.coroutines.Job

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var showPhoneSheet by remember { mutableStateOf(false) }
    var phoneInput by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var activeSlide by remember { mutableStateOf(0) }
    var verificationJob by remember { mutableStateOf<Job?>(null) }

    val appKey = ClientConfig.LOGGIN_APP_KEY.ifBlank { "J2T8R6YN" }

    // Auto rotate slide every 4 seconds
    LaunchedEffect(Unit) {
        while (true) {
            delay(4000)
            activeSlide = (activeSlide + 1) % 3
        }
    }

    fun completeLogin(phone: String, name: String) {
        isLoading = true
        scope.launch {
            AuthRepository.login(phone = phone, name = name, context = context)
            delay(400)
            isLoading = false
            onLoginSuccess()
        }
    }

    fun handleWhatsAppLogin() {
        isLoading = true
        statusMessage = "Opening WhatsApp..."

        try {
            val token = LogginAuthService.generateToken(appKey)
            val waLink = LogginAuthService.createWhatsAppLink(token)

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(waLink)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            context.startActivity(intent)

            statusMessage = "Waiting for WhatsApp verification...\nPlease tap Send in WhatsApp"

            verificationJob?.cancel()
            verificationJob = scope.launch {
                val result = LogginAuthService.waitForVerification(token)
                result.onSuccess { verifiedPhone ->
                    statusMessage = "Verified! Logging in..."
                    completeLogin(verifiedPhone, "WhatsApp User")
                }.onFailure {
                    isLoading = false
                    statusMessage = null
                    showPhoneSheet = true
                }
            }
        } catch (e: Exception) {
            // If WhatsApp is not installed on device/emulator, fallback to phone prompt
            isLoading = false
            statusMessage = null
            showPhoneSheet = true
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.radialGradient(
                    colors = listOf(
                        Color(0xFF330B5C),
                        Color(0xFF1B0533),
                        Color(0xFF0C0217)
                    ),
                    center = Offset(700f, 200f),
                    radius = 1200f
                )
            )
    ) {
        // Main Container matching the screenshot layout
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 28.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.Bottom,
            horizontalAlignment = Alignment.Start
        ) {

            // Hero Typography Section matching screenshot
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                when (activeSlide) {
                    0 -> {
                        Text(
                            text = "Play",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Instantly",
                            color = Color(0xFFA270F5),
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Win Bigger",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Fast. Secure. More Fun.",
                            color = Color(0xFFC4B5D6),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    1 -> {
                        Text(
                            text = "Ring of",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Future",
                            color = Color(0xFFA270F5),
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Multipliers",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Real-time fair RNG game engine.",
                            color = Color(0xFFC4B5D6),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    else -> {
                        Text(
                            text = "Instant",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Withdrawals",
                            color = Color(0xFFA270F5),
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Text(
                            text = "Direct UPI",
                            color = Color.White,
                            fontSize = 44.sp,
                            fontWeight = FontWeight.Black,
                            letterSpacing = (-1).sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "Double-entry verified wallet ledger.",
                            color = Color(0xFFC4B5D6),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            // Continue with WhatsApp Black Pill Button
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clip(RoundedCornerShape(32.dp))
                    .background(Color.Black)
                    .border(1.dp, Color(0xFF2A1C3E), RoundedCornerShape(32.dp))
                    .clickable(enabled = !isLoading) {
                        handleWhatsAppLogin()
                    },
                contentAlignment = Alignment.Center
            ) {
                if (isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(22.dp),
                        color = Color(0xFFA270F5),
                        strokeWidth = 2.5.dp
                    )
                } else {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.Center
                    ) {
                        Text(
                            text = "Continue with WhatsApp",
                            color = Color.White,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        // Clean White WhatsApp Chat Bubble Icon
                        WhatsAppIcon(modifier = Modifier.size(20.dp))
                    }
                }
            }

            if (isLoading && statusMessage != null) {
                Spacer(modifier = Modifier.height(10.dp))
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = statusMessage ?: "",
                        color = Color(0xFFA270F5),
                        fontSize = 12.sp,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                        fontWeight = FontWeight.Medium
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Cancel",
                        color = Color(0xFFC4B5D6),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.clickable {
                            verificationJob?.cancel()
                            isLoading = false
                            statusMessage = null
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Subtle fallback text for phone number entry
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { showPhoneSheet = true },
                horizontalArrangement = Arrangement.Center
            ) {
                Text(
                    text = "Or continue with phone number",
                    color = Color(0xFF8E7AAB),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Normal
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Bottom 3 Carousel Indicators matching screenshot
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                for (index in 0 until 3) {
                    if (index == activeSlide) {
                        Box(
                            modifier = Modifier
                                .width(22.dp)
                                .height(4.dp)
                                .clip(RoundedCornerShape(2.dp))
                                .background(Color(0xFFA270F5))
                        )
                    } else {
                        Box(
                            modifier = Modifier
                                .size(5.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF4A3563))
                        )
                    }
                    if (index < 2) Spacer(modifier = Modifier.width(6.dp))
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
        }

        // Quick Direct Phone Login Modal Sheet
        AnimatedVisibility(
            visible = showPhoneSheet,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.8f))
                    .clickable { showPhoneSheet = false },
                contentAlignment = Alignment.Center
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF1B0730))
                        .border(1.dp, Color(0xFF3F196B), RoundedCornerShape(16.dp))
                        .clickable(enabled = false) {}
                        .padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Phone Number Login",
                        color = Color.White,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(6.dp))
                    Text(
                        text = "Enter your 10-digit mobile number to enter the arena",
                        color = Color(0xFFB8A9CC),
                        fontSize = 12.sp
                    )

                    Spacer(modifier = Modifier.height(18.dp))

                    OutlinedTextField(
                        value = phoneInput,
                        onValueChange = { if (it.length <= 10) phoneInput = it },
                        placeholder = { Text("e.g. 9876543210", color = Color(0xFF7A6890), fontSize = 13.sp) },
                        prefix = { Text("+91  ", color = Color(0xFFA270F5), fontWeight = FontWeight.Bold) },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            focusedBorderColor = Color(0xFFA270F5),
                            unfocusedBorderColor = Color(0xFF3F196B),
                            focusedContainerColor = Color(0xFF110321),
                            unfocusedContainerColor = Color(0xFF110321)
                        ),
                        modifier = Modifier.fillMaxWidth()
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            if (phoneInput.trim().length >= 10) {
                                completeLogin(phoneInput.trim(), "Player_${phoneInput.takeLast(4)}")
                                showPhoneSheet = false
                            }
                        },
                        enabled = phoneInput.trim().length >= 10 && !isLoading,
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFA270F5)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Text(
                            text = "Enter Platform",
                            color = Color.Black,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp
                        )
                    }
                }
            }
        }
    }
}

/**
 * Crisp WhatsApp icon drawing matching the screenshot pill
 */
@Composable
fun WhatsAppIcon(modifier: Modifier = Modifier) {
    Canvas(modifier = modifier) {
        val w = size.width
        val h = size.height

        // WhatsApp Speech Bubble
        val path = Path().apply {
            // Main circle centered at w/2, h/2
            addOval(androidx.compose.ui.geometry.Rect(w * 0.05f, h * 0.05f, w * 0.95f, h * 0.95f))
            // Small pointer tail on bottom left
            moveTo(w * 0.22f, h * 0.78f)
            lineTo(w * 0.05f, h * 0.95f)
            lineTo(w * 0.38f, h * 0.88f)
            close()
        }
        drawPath(path = path, color = Color.White)

        // Inside phone handset silhouette cut in black/dark
        drawCircle(
            color = Color.Black,
            radius = w * 0.18f,
            center = Offset(w * 0.5f, h * 0.5f)
        )
    }
}
