package com.example.app334.ui.screens

import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.RubikFont

data class ReferralUser(
    val name: String,
    val date: String,
    val amount: String,
    val avatarRes: Int
)

@Composable
fun ShareScreen(
    earnings: String = "₹0",
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val referrals = remember { emptyList<ReferralUser>() }

    fun shareAppText(whatsappOnly: Boolean = false) {
        val shareMessage = "Join me on 3334Game and play Ring of Future! Use my Referral Code: REF334 to get bonus chips."
        val sendIntent = Intent(Intent.ACTION_SEND).apply {
            putExtra(Intent.EXTRA_TEXT, shareMessage)
            type = "text/plain"
            if (whatsappOnly) {
                setPackage("com.whatsapp")
            }
        }
        try {
            context.startActivity(if (whatsappOnly) sendIntent else Intent.createChooser(sendIntent, "Share Referral Code"))
        } catch (e: Exception) {
            context.startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                putExtra(Intent.EXTRA_TEXT, shareMessage)
                type = "text/plain"
            }, "Share Referral Code"))
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(Color(0xFF0F0417))
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 140.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Top Header Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(top = 12.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Refer & Earn",
                    fontSize = 24.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.W800,
                    color = Color.White
                )

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF6B42F2))
                        .clickable { Toast.makeText(context, "Language: English", Toast.LENGTH_SHORT).show() }
                        .padding(horizontal = 12.dp, vertical = 6.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "अ 💬",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }

            // 2. Earnings Summary Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "TOTAL EARNINGS",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF8E899B),
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = earnings,
                        fontSize = 28.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                }

                // Copy Code Box
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .background(Color(0xFF240E38))
                        .border(1.dp, Color(0xFF4C206D), RoundedCornerShape(12.dp))
                        .clickable {
                            val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as android.content.ClipboardManager
                            val clip = android.content.ClipData.newPlainText("Referral Code", "REF334")
                            clipboard.setPrimaryClip(clip)
                            Toast.makeText(context, "Referral Code REF334 Copied!", Toast.LENGTH_SHORT).show()
                        }
                        .padding(horizontal = 14.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = "Code: REF334 📋",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFA78BFA)
                    )
                }
            }

            // 3. Referral List Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(20.dp))
                    .background(Color(0xFF1E0A30))
                    .border(1.dp, Color(0xFF3D195B), RoundedCornerShape(20.dp))
                    .padding(16.dp)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "YOUR REFERRED FRIENDS (${referrals.size})",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF8E899B),
                        letterSpacing = 0.5.sp
                    )

                    if (referrals.isEmpty()) {
                        Text(
                            text = "No friends referred yet. Share your code below to invite friends and earn bonus play chips!",
                            fontSize = 13.sp,
                            fontFamily = RubikFont,
                            color = Color(0xFF9CA3AF),
                            modifier = Modifier.padding(vertical = 8.dp)
                        )
                    } else {
                        referrals.forEachIndexed { i, user ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Image(
                                    painter = painterResource(id = user.avatarRes),
                                    contentDescription = user.name,
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop
                                )

                                Column {
                                    Text(
                                        text = user.name,
                                        fontSize = 14.5.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.Bold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = user.date,
                                        fontSize = 11.5.sp,
                                        fontFamily = RubikFont,
                                        color = Color(0xFF8E899B)
                                    )
                                }
                            }

                            Text(
                                text = user.amount,
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color(0xFF10B981)
                            )
                        }

                        if (i < referrals.size - 1) {
                            HorizontalDivider(color = Color(0xFF2B1342), thickness = 1.dp)
                        }
                    }
                }
            }
        }
        }

        // 4. Bottom Action Buttons Bar
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(bottom = 75.dp, start = 16.dp, end = 16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Left Share Button
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF7C3AED),
                                    Color(0xFF6B42F2)
                                )
                            )
                        )
                        .clickable { shareAppText(whatsappOnly = false) },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_share_arrow),
                            contentDescription = "Share",
                            modifier = Modifier.size(16.dp),
                            tint = Color.White
                        )
                        Text(
                            text = "Share",
                            fontSize = 15.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }
                }

                // Right Share on Whatsapp Button
                Box(
                    modifier = Modifier
                        .weight(1.6f)
                        .height(48.dp)
                        .clip(RoundedCornerShape(14.dp))
                        .background(
                            brush = Brush.verticalGradient(
                                colors = listOf(
                                    Color(0xFF00E676),
                                    Color(0xFF00B050)
                                )
                            )
                        )
                        .clickable { shareAppText(whatsappOnly = true) },
                    contentAlignment = Alignment.Center
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_whatsapp),
                            contentDescription = "WhatsApp",
                            modifier = Modifier.size(20.dp),
                            tint = Color.White
                        )
                        Text(
                            text = "Share on Whatsapp",
                            fontSize = 14.5.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
