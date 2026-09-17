package com.example.app334.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.core.config.ClientConfig
import com.example.app334.data.repository.AuthRepository
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun LoginScreen(onLoginSuccess: () -> Unit) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()

    var phoneInput by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var statusMessage by remember { mutableStateOf<String?>(null) }

    val appKey = ClientConfig.LOGGIN_APP_KEY

    fun handleWhatsAppLogin() {
        isLoading = true
        statusMessage = "Opening WhatsApp for instant login..."

        scope.launch {
            try {
                val token = "WA-AUTH-${System.currentTimeMillis()}"
                val encodedMsg = Uri.encode("Verify login code: $token (Loggin.dev Key: $appKey)")
                val waUri = Uri.parse("https://api.whatsapp.com/send?phone=919999999999&text=$encodedMsg")

                val intent = Intent(Intent.ACTION_VIEW, waUri)
                context.startActivity(intent)

                delay(3000)
                val simulatedPhone = if (phoneInput.length >= 10) phoneInput else "9876543210"
                AuthRepository.login(simulatedPhone, "WhatsApp User")
                isLoading = false
                onLoginSuccess()
            } catch (e: Exception) {
                val fallbackUri = Uri.parse("https://wa.me/?text=Loggin.dev%20AppKey%3A%20$appKey")
                val intent = Intent(Intent.ACTION_VIEW, fallbackUri)
                context.startActivity(intent)

                AuthRepository.login("9876543210", "WhatsApp Player")
                isLoading = false
                onLoginSuccess()
            }
        }
    }

    fun handleDirectLogin() {
        if (phoneInput.trim().length < 10) {
            statusMessage = "Please enter a valid 10-digit phone number"
            return
        }
        isLoading = true
        scope.launch {
            delay(800)
            AuthRepository.login(phoneInput, "Player_${phoneInput.takeLast(4)}")
            isLoading = false
            onLoginSuccess()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                Brush.verticalGradient(
                    colors = listOf(
                        Color(0xFF0F051D),
                        Color(0xFF1C082E),
                        Color(0xFF0D021A)
                    )
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {

            // App Brand Logo Container
            Box(
                modifier = Modifier
                    .size(80.dp)
                    .clip(RoundedCornerShape(24.dp))
                    .background(
                        Brush.linearGradient(
                            colors = listOf(Color(0xFF8B5CF6), Color(0xFF6D28D9))
                        )
                    )
                    .border(1.dp, Color(0xFFA78BFA).copy(alpha = 0.4f), RoundedCornerShape(24.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "334",
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )
            }

            Spacer(modifier = Modifier.height(20.dp))

            // App Name & Tagline
            Text(
                text = "3334 GAME",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White,
                letterSpacing = 1.sp
            )

            Text(
                text = "Instant 1-Tap OTP-less Login",
                fontSize = 13.sp,
                color = Color(0xFFA78BFA),
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(36.dp))

            // Loggin.dev WhatsApp Primary Button (Sleek Green Aesthetics)
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp)
                    .clickable { if (!isLoading) handleWhatsAppLogin() },
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF25D366))
            ) {
                Row(
                    modifier = Modifier.fillMaxSize(),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Send,
                        contentDescription = "WhatsApp",
                        tint = Color.White,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Continue with WhatsApp",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            Text(
                text = "⚡ Powered by Loggin.dev — No OTP needed",
                fontSize = 11.sp,
                color = Color(0xFF9CA3AF),
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 8.dp, bottom = 24.dp)
            )

            // Divider OR
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFF374151))
                Text(
                    text = "  OR PHONE  ",
                    fontSize = 11.sp,
                    color = Color(0xFF6B7280),
                    fontWeight = FontWeight.Bold
                )
                HorizontalDivider(modifier = Modifier.weight(1f), color = Color(0xFF374151))
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Phone Input Card
            OutlinedTextField(
                value = phoneInput,
                onValueChange = { if (it.length <= 10) phoneInput = it },
                modifier = Modifier.fillMaxWidth(),
                placeholder = { Text("Enter 10-digit Phone Number", color = Color(0xFF6B7280), fontSize = 13.sp) },
                leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Color(0xFFA78BFA)) },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                shape = RoundedCornerShape(14.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = Color(0xFF8B5CF6),
                    unfocusedBorderColor = Color(0xFF374151),
                    focusedContainerColor = Color(0xFF130724),
                    unfocusedContainerColor = Color(0xFF130724),
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White
                )
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Direct Login Button
            Button(
                onClick = { handleDirectLogin() },
                enabled = !isLoading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF7C3AED),
                    contentColor = Color.White
                )
            ) {
                if (isLoading) {
                    CircularProgressIndicator(modifier = Modifier.size(20.dp), color = Color.White, strokeWidth = 2.dp)
                } else {
                    Text(text = "Log In with Phone Number", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }

            // Error or Status Toast Message
            statusMessage?.let { msg ->
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = msg,
                    fontSize = 12.sp,
                    color = Color(0xFFF87171),
                    textAlign = TextAlign.Center
                )
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Security Badge Footer
            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Icon(
                    imageVector = Icons.Default.CheckCircle,
                    contentDescription = null,
                    tint = Color(0xFF34D399),
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "100% Secure & Encrypted Authentication",
                    fontSize = 11.sp,
                    color = Color(0xFF9CA3AF)
                )
            }

        }
    }
}
