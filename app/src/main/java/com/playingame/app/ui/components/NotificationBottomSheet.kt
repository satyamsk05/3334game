package com.playingame.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.playingame.app.R
import com.playingame.app.ui.theme.*

data class AppNotification(
    val id: String,
    val title: String,
    val message: String,
    val time: String,
    val isUnread: Boolean = true
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationBottomSheet(
    onDismissRequest: () -> Unit,
    notifications: List<AppNotification> = listOf(
        AppNotification(
            id = "1",
            title = "Welcome Bonus Credited!",
            message = "Your account has received a welcome bonus. Start playing Ring of Future and 1v1 XO Battles now!",
            time = "Just now",
            isUnread = true
        ),
        AppNotification(
            id = "2",
            title = "1v1 XO Battle Mode Live",
            message = "Challenge real opponents in fast Tic-Tac-Toe matches with instant cash payouts.",
            time = "10m ago",
            isUnread = true
        ),
        AppNotification(
            id = "3",
            title = "Instant UPI Withdrawals",
            message = "Withdrawals are processed 24/7 with zero waiting time directly to your UPI ID.",
            time = "1h ago",
            isUnread = false
        )
    )
) {
    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        containerColor = Color(0xFF161722),
        dragHandle = {
            Box(
                modifier = Modifier
                    .padding(vertical = 10.dp)
                    .width(40.dp)
                    .height(4.dp)
                    .clip(RoundedCornerShape(2.dp))
                    .background(Color.White.copy(alpha = 0.3f))
            )
        },
        shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 32.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Notifications",
                    fontSize = 20.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Text(
                    text = "Mark all as read",
                    fontSize = 13.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Medium,
                    color = Gold500,
                    modifier = Modifier.clickable { onDismissRequest() }
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(notifications, key = { it.id }) { notif ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (notif.isUnread) Color(0xFF232534) else Color(0xFF1C1D2A))
                            .padding(14.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(if (notif.isUnread) Color(0xFF332050) else Color(0xFF2A2B3D)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_notification_bell),
                                contentDescription = null,
                                tint = if (notif.isUnread) Gold500 else Color.White.copy(alpha = 0.6f),
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Column(
                            modifier = Modifier.weight(1f)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = notif.title,
                                    fontSize = 14.sp,
                                    fontFamily = RubikFont,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )

                                Text(
                                    text = notif.time,
                                    fontSize = 11.sp,
                                    fontFamily = RubikFont,
                                    color = Color.White.copy(alpha = 0.5f)
                                )
                            }

                            Spacer(modifier = Modifier.height(4.dp))

                            Text(
                                text = notif.message,
                                fontSize = 12.5.sp,
                                fontFamily = RubikFont,
                                color = Color.White.copy(alpha = 0.75f),
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
