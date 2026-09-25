package com.example.app334.ui.screens

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.data.remote.LogginAuthService
import com.example.app334.data.repository.AuthRepository
import com.example.app334.ui.theme.RubikFont
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var showNameSetup by remember { mutableStateOf(false) }
    var showPhoneSheet by remember { mutableStateOf(false) }
    var phoneInput by remember { mutableStateOf("") }
    var showBannedModal by remember { mutableStateOf(false) }
    var firstNameInput by remember { mutableStateOf("") }
    var lastNameInput by remember { mutableStateOf("") }
    var verifiedPhoneHolder by remember { mutableStateOf("") }

    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }
    var verificationJob by remember { mutableStateOf<Job?>(null) }

    fun completeLogin(phone: String, name: String) {
        isLoading = true
        scope.launch {
            val result = AuthRepository.login(phone = phone, name = name.ifBlank { "Player" }, context = context)
            isLoading = false
            result.onSuccess {
                onLoginSuccess()
            }.onFailure { error ->
                if (error.message?.contains("ACCOUNT_BANNED") == true) {
                    showBannedModal = true
                } else {
                    statusMessage = error.message ?: "Login failed. Please try again."
                }
            }
        }
    }

    fun processPhoneForLogin(phone: String) {
        val cleanPhone = phone.trim()
        val existing = AuthRepository.getSavedUserForPhone(cleanPhone, context)
        if (existing != null && existing.second.isNotBlank()) {
            // Returning user -> instantly log in with exact same identity & balance
            completeLogin(cleanPhone, existing.second)
        } else {
            // New user -> ask for name on Screen 3
            verifiedPhoneHolder = cleanPhone
            showPhoneSheet = false
            showNameSetup = true
        }
    }

    fun handleWhatsAppLogin() {
        isLoading = true
        statusMessage = "Connecting to WhatsApp..."

        verificationJob?.cancel()
        verificationJob = scope.launch {
            try {
                val initResult = LogginAuthService.initiateAuth()
                if (initResult.isFailure) {
                    isLoading = false
                    statusMessage = null
                    showPhoneSheet = true
                    return@launch
                }

                val session = initResult.getOrThrow()
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(session.waLink)).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                context.startActivity(intent)

                statusMessage = "Waiting for WhatsApp verification...\nPlease tap Send in WhatsApp"

                val result = LogginAuthService.waitForVerification(session.token)
                result.onSuccess { verifiedPhone ->
                    statusMessage = "Verified!"
                    isLoading = false
                    statusMessage = null
                    processPhoneForLogin(verifiedPhone)
                }.onFailure {
                    isLoading = false
                    statusMessage = null
                    showPhoneSheet = true
                }
            } catch (e: Exception) {
                isLoading = false
                statusMessage = null
                showPhoneSheet = true
            }
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        if (showBannedModal) {
            com.example.app334.ui.components.AccountBannedDialog(onDismiss = {
                showBannedModal = false
            })
        }

        if (!showNameSetup) {
            // Screen 2: Login Screen (Matching Screenshot 2 in Pure Black)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                // Top Half: Illustrated Hero Card with Floating Status Pill
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(310.dp)
                        .padding(top = 16.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF141414))
                        .border(1.dp, Color(0xFF262626), RoundedCornerShape(24.dp)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.pramotion_banner),
                        contentDescription = "Game Showcase",
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(RoundedCornerShape(24.dp)),
                        contentScale = ContentScale.Crop
                    )

                    // Floating Cashout Pill (Matching "Delivered in 38 min" in Screenshot 2)
                    Box(
                        modifier = Modifier
                            .align(Alignment.BottomEnd)
                            .padding(end = 16.dp, bottom = 16.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color.Black.copy(alpha = 0.85f))
                            .border(1.dp, Color(0xFF10B981).copy(alpha = 0.6f), RoundedCornerShape(14.dp))
                            .padding(horizontal = 14.dp, vertical = 10.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(26.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF064E3B)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(text = "✓", color = Color(0xFF34D399), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            }
                            Column {
                                Text(
                                    text = "Instant Cashout in 30s",
                                    fontSize = 12.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Direct UPI & Bank Transfer",
                                    fontSize = 10.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF9CA3AF)
                                )
                            }
                        }
                    }
                }

                // Middle Section: Headline & Description
                Column(
                    modifier = Modifier.padding(horizontal = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "Play games,\nwin cash today.",
                        fontSize = 32.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.ExtraBold,
                        color = Color.White,
                        lineHeight = 38.sp
                    )

                    Text(
                        text = "Play exciting games in seconds and withdraw your real cash winnings instantly.",
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF9CA3AF),
                        lineHeight = 20.sp
                    )
                }

                // Bottom Section: Action Buttons & Footer
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    if (isLoading && statusMessage != null) {
                        Text(
                            text = statusMessage ?: "",
                            fontSize = 13.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF10B981),
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                    }

                    // 1. Primary Button: Continue with WhatsApp (Matching Screenshot 2)
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                            .clip(RoundedCornerShape(27.dp))
                            .background(
                                Brush.horizontalGradient(
                                    colors = listOf(
                                        Color(0xFF25D366),
                                        Color(0xFF128C7E)
                                    )
                                )
                            )
                            .clickable(enabled = !isLoading) {
                                handleWhatsAppLogin()
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        if (isLoading) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color.White,
                                strokeWidth = 2.5.dp
                            )
                        } else {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.Center
                            ) {
                                Icon(
                                    painter = painterResource(id = R.drawable.ic_whatsapp),
                                    contentDescription = "WhatsApp",
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                                Spacer(modifier = Modifier.width(10.dp))
                                Text(
                                    text = "Continue with WhatsApp",
                                    fontSize = 16.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }

                    // 2. Secondary Button: Continue with Phone
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                            .clip(RoundedCornerShape(27.dp))
                            .background(Color(0xFF1C1C1C))
                            .border(1.dp, Color(0xFF2E2E2E), RoundedCornerShape(27.dp))
                            .clickable(enabled = !isLoading) {
                                showPhoneSheet = true
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.Center
                        ) {
                            Text(
                                text = "📱 Continue with phone number",
                                fontSize = 15.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Terms Footer
                    Text(
                        text = "By continuing, you agree to our Terms and Privacy Policy",
                        fontSize = 11.5.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF6B7280)
                    )
                }
            }
        } else {
            // Screen 3: "What's your name?" Setup Screen (Matching Screenshot 3)
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 24.dp, vertical = 24.dp),
                verticalArrangement = Arrangement.SpaceBetween
            ) {
                Column {
                    // Back Button
                    Box(
                        modifier = Modifier
                            .padding(top = 16.dp)
                            .size(42.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF1C1C1C))
                            .clickable { showNameSetup = false },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_arrow_back),
                            contentDescription = "Back",
                            tint = Color.White,
                            modifier = Modifier.size(20.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(28.dp))

                    // Title
                    Text(
                        text = "What's your name?",
                        fontSize = 28.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "Other players and leaderboards will see this on the platform.",
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        color = Color(0xFF9CA3AF)
                    )

                    Spacer(modifier = Modifier.height(32.dp))

                    // First Name Field
                    Text(
                        text = "First name",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF9CA3AF)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF141414))
                            .border(1.dp, Color(0xFF2E2E2E), RoundedCornerShape(14.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = firstNameInput,
                            onValueChange = { firstNameInput = it },
                            textStyle = TextStyle(
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            ),
                            cursorBrush = SolidColor(Color(0xFF10B981)),
                            modifier = Modifier.fillMaxWidth(),
                            decorationBox = { innerTextField ->
                                if (firstNameInput.isEmpty()) {
                                    Text("Enter first name", color = Color(0xFF6B7280), fontSize = 15.sp, fontFamily = RubikFont)
                                }
                                innerTextField()
                            }
                        )
                    }

                    Spacer(modifier = Modifier.height(20.dp))

                    // Last Name Field
                    Text(
                        text = "Last name (optional)",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF9CA3AF)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFF141414))
                            .border(1.dp, Color(0xFF2E2E2E), RoundedCornerShape(14.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = lastNameInput,
                            onValueChange = { lastNameInput = it },
                            textStyle = TextStyle(
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.SemiBold,
                                color = Color.White
                            ),
                            cursorBrush = SolidColor(Color(0xFF10B981)),
                            modifier = Modifier.fillMaxWidth(),
                            decorationBox = { innerTextField ->
                                if (lastNameInput.isEmpty()) {
                                    Text("Enter last name", color = Color(0xFF6B7280), fontSize = 15.sp, fontFamily = RubikFont)
                                }
                                innerTextField()
                            }
                        )
                    }
                }

                // Continue Button (Matching Screenshot 3)
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp)
                        .clip(RoundedCornerShape(27.dp))
                        .background(
                            if (firstNameInput.isNotBlank()) Color(0xFF10B981) else Color(0xFF262626)
                        )
                        .clickable(enabled = firstNameInput.isNotBlank() && !isLoading) {
                            val fullName = if (lastNameInput.isNotBlank()) "$firstNameInput $lastNameInput" else firstNameInput
                            completeLogin(verifiedPhoneHolder.ifBlank { "9876543210" }, fullName)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (isLoading) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color.White,
                            strokeWidth = 2.5.dp
                        )
                    } else {
                        Text(
                            text = "Continue",
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = if (firstNameInput.isNotBlank()) Color.White else Color(0xFF6B7280)
                        )
                    }
                }
            }
        }

        // Direct Phone Login Sheet Modal
        if (showPhoneSheet) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.75f))
                    .clickable { showPhoneSheet = false },
                contentAlignment = Alignment.BottomCenter
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                        .background(Color(0xFF141414))
                        .border(1.dp, Color(0xFF262626), RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp))
                        .clickable(enabled = false) {}
                        .padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Enter Phone Number",
                        fontSize = 20.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp)
                            .clip(RoundedCornerShape(12.dp))
                            .background(Color(0xFF1F1F1F))
                            .border(1.dp, Color(0xFF333333), RoundedCornerShape(12.dp))
                            .padding(horizontal = 16.dp),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        BasicTextField(
                            value = phoneInput,
                            onValueChange = { if (it.length <= 10 && it.all { ch -> ch.isDigit() }) phoneInput = it },
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            textStyle = TextStyle(
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            ),
                            cursorBrush = SolidColor(Color(0xFF10B981)),
                            modifier = Modifier.fillMaxWidth(),
                            decorationBox = { innerTextField ->
                                if (phoneInput.isEmpty()) {
                                    Text("10-digit mobile number", color = Color(0xFF6B7280), fontSize = 15.sp, fontFamily = RubikFont)
                                }
                                innerTextField()
                            }
                        )
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp)
                            .clip(RoundedCornerShape(25.dp))
                            .background(if (phoneInput.length >= 10) Color(0xFF10B981) else Color(0xFF262626))
                            .clickable(enabled = phoneInput.length >= 10 && !isLoading) {
                                processPhoneForLogin(phoneInput)
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Next",
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = if (phoneInput.length >= 10) Color.White else Color(0xFF6B7280)
                        )
                    }
                }
            }
        }
    }
}
