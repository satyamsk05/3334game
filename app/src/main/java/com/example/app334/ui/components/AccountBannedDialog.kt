package com.example.app334.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.example.app334.ui.theme.RubikFont

@Composable
fun AccountBannedDialog(
    onDismiss: () -> Unit = {}
) {
    val context = LocalContext.current

    Dialog(
        onDismissRequest = { /* Modal is non-dismissible */ },
        properties = DialogProperties(dismissOnBackPress = false, dismissOnClickOutside = false)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .background(Color(0xFF141414))
                .border(1.5.dp, Color(0xFFEF4444).copy(alpha = 0.8f), RoundedCornerShape(24.dp))
                .padding(24.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Red Warning Icon Badge
                Box(
                    modifier = Modifier
                        .size(68.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF7F1D1D).copy(alpha = 0.4f))
                        .border(1.dp, Color(0xFFEF4444), CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(text = "🚫", fontSize = 32.sp)
                }

                Text(
                    text = "Account Suspended",
                    fontSize = 22.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "Aapka account administrator dwara security & policy violation ke karan BAN kar diya gaya hai. Aap 334Game me login ya play nahi kar sakte.",
                    fontSize = 13.5.sp,
                    fontFamily = RubikFont,
                    color = Color(0xFF9CA3AF),
                    textAlign = TextAlign.Center,
                    lineHeight = 19.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                // WhatsApp Support Button
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .clip(RoundedCornerShape(24.dp))
                        .background(Color(0xFF25D366))
                        .clickable {
                            val msg = "Hello Admin, my 334Game account has been suspended. Please check."
                            val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse("https://wa.me/919989907408?text=${Uri.encode(msg)}"))
                            context.startActivity(waIntent)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "💬 Contact Support on WhatsApp",
                        fontSize = 14.5.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                // Close / Dismiss
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(44.dp)
                        .clip(RoundedCornerShape(22.dp))
                        .background(Color(0xFF222222))
                        .clickable {
                            onDismiss()
                        },
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "Close",
                        fontSize = 14.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF9CA3AF)
                    )
                }
            }
        }
    }
}
