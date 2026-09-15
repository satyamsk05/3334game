package com.example.app334.ui.screens

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
    earnings: String = "₹30",
    onShareClick: () -> Unit = {},
    onWhatsappShareClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val referrals = remember {
        listOf(
            ReferralUser("Dh animation", "09 Dec", "₹15", R.drawable.avatar_1),
            ReferralUser("Harshthakur", "08 Dec", "₹15", R.drawable.avatar_2),
            ReferralUser("RAHUL", "07 Dec", "₹15", R.drawable.avatar_3)
        )
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
            // 1. Top Header Row: "Refer & Earn" + Language Badge
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 45.dp),
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

                // Language Badge
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(14.dp))
                        .background(Color(0xFF6B42F2))
                        .clickable { /* Language */ }
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
                        text = "Your Earnings",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF8E899B)
                    )
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = earnings,
                        fontSize = 32.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.W800,
                        color = Color.White
                    )
                }

                // Money Bag / Rewards Badge
                Image(
                    painter = painterResource(id = R.drawable.ic_sp_referral),
                    contentDescription = "Refer Coin Badge",
                    modifier = Modifier.height(50.dp)
                )
            }

            // 3. Referral Breakdown Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color(0xFF1E0A30))
                    .border(1.dp, Color(0xFF4B206E), RoundedCornerShape(18.dp))
                    .padding(18.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header: 1 Referral = ₹1,000
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "1 Referral = ",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color(0xFFFFD700)
                        )
                        Text(
                            text = "₹1,000",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.W800,
                            color = Color(0xFF00E676)
                        )
                    }

                    // 3 Breakdown Columns with 3D Drawables
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Step 1: Signs Up
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "₹15",
                                fontSize = 18.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                            Text(
                                text = "signs up",
                                fontSize = 11.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF8E899B)
                            )
                            Spacer(modifier = Modifier.height(2.dp))
                            Image(
                                painter = painterResource(id = R.drawable.ic_refer_signup),
                                contentDescription = "Signs Up",
                                modifier = Modifier.size(50.dp)
                            )
                        }

                        Text(
                            text = "+",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF8E899B)
                        )

                        // Step 2: Adds Cash
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "₹55",
                                fontSize = 18.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(2.dp)
                            ) {
                                Text(
                                    text = "adds cash",
                                    fontSize = 11.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF8E899B)
                                )
                                Text(
                                    text = "ⓘ",
                                    fontSize = 10.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF8E899B)
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Image(
                                painter = painterResource(id = R.drawable.ic_refer_addcash),
                                contentDescription = "Adds Cash",
                                modifier = Modifier.size(50.dp)
                            )
                        }

                        Text(
                            text = "+",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF8E899B)
                        )

                        // Step 3: Play Games
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally,
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Text(
                                text = "₹930",
                                fontSize = 18.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(2.dp)
                            ) {
                                Text(
                                    text = "play games",
                                    fontSize = 11.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF8E899B)
                                )
                                Text(
                                    text = "ⓘ",
                                    fontSize = 10.sp,
                                    fontFamily = RubikFont,
                                    color = Color(0xFF8E899B)
                                )
                            }
                            Spacer(modifier = Modifier.height(2.dp))
                            Image(
                                painter = painterResource(id = R.drawable.ic_refer_playgames),
                                contentDescription = "Play Games",
                                modifier = Modifier.size(50.dp)
                            )
                        }
                    }
                }
            }

            // 4. Recent Referrals List Card
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(18.dp))
                    .background(Color(0xFF1E0A30))
                    .border(1.dp, Color(0xFF4B206E), RoundedCornerShape(18.dp))
                    .padding(16.dp)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    for (i in referrals.indices) {
                        val user = referrals[i]
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF380E54))
                                        .border(1.dp, Color(0xFFFFD700), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Image(
                                        painter = painterResource(id = user.avatarRes),
                                        contentDescription = user.name,
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Crop
                                    )
                                }

                                Column {
                                    Text(
                                        text = user.name,
                                        fontSize = 15.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.W800,
                                        color = Color.White
                                    )
                                    Spacer(modifier = Modifier.height(2.dp))
                                    Text(
                                        text = user.date,
                                        fontSize = 12.sp,
                                        fontFamily = RubikFont,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF8E899B)
                                    )
                                }
                            }

                            Text(
                                text = user.amount,
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                        }

                        if (i < referrals.size - 1) {
                            HorizontalDivider(color = Color(0xFF2B1342), thickness = 1.dp)
                        }
                    }

                    HorizontalDivider(color = Color(0xFF2B1342), thickness = 1.dp)

                    // Bottom Link: View all referrals >
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { /* View all referrals */ }
                            .padding(vertical = 4.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = "View all referrals",
                                fontSize = 13.5.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.W800,
                                color = Color.White
                            )
                            Text(
                                text = "›",
                                fontSize = 16.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // 5. Bottom Action Buttons Bar
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
                        .clickable { onShareClick() },
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
                        .clickable { onWhatsappShareClick() },
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
