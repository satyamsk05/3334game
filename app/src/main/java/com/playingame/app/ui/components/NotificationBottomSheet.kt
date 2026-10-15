package com.playingame.app.ui.components

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
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
import com.playingame.app.util.noRippleClickable
import kotlinx.coroutines.launch

data class AppNotification(
    val id: String,
    val title: String,
    val message: String,
    val time: String,
    val isUnread: Boolean = true
)

private val FallbackNotifications = listOf(
    AppNotification(
        id = "notif_welcome",
        title = "Welcome to Bit Arcade! 🎁",
        message = "Your account is active. Enjoy playing Dragon vs Tiger and exciting casino games!",
        time = "Just now",
        isUnread = true
    ),
    AppNotification(
        id = "notif_safety",
        title = "Instant UPI Withdrawals ⚡",
        message = "100% verified and secure payouts directly to your linked UPI address.",
        time = "1h ago",
        isUnread = false
    ),
    AppNotification(
        id = "notif_support",
        title = "24x7 Player Support 🛡️",
        message = "Need help with deposits or gameplay? Reach out to support anytime.",
        time = "1d ago",
        isUnread = false
    )
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationBottomSheet(
    onDismissRequest: () -> Unit,
    notifications: List<AppNotification> = emptyList()
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val scope = rememberCoroutineScope()
    val displayNotifications = remember(notifications) {
        if (notifications.isNotEmpty()) notifications else FallbackNotifications
    }

    fun dismissSheet() {
        scope.launch {
            try {
                sheetState.hide()
            } catch (_: Exception) {}
        }.invokeOnCompletion {
            onDismissRequest()
        }
    }

    BackHandler {
        dismissSheet()
    }

    ModalBottomSheet(
        onDismissRequest = onDismissRequest,
        sheetState = sheetState,
        containerColor = CardNavyBackground,
        scrimColor = Color.Black.copy(alpha = 0.55f),
        dragHandle = {
            BottomSheetDefaults.DragHandle(
                color = Color.White.copy(alpha = 0.3f)
            )
        },
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 36.dp)
        ) {
            // Header Row: Title + Mark All + Close Button
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

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(14.dp)
                ) {
                    Text(
                        text = "Mark all as read",
                        fontSize = 13.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Gold500,
                        modifier = Modifier.noRippleClickable {
                            dismissSheet()
                        }
                    )

                    // Dedicated Close Button
                    Box(
                        modifier = Modifier
                            .size(28.dp)
                            .clip(CircleShape)
                            .background(Color(0xFF383C45))
                            .noRippleClickable { dismissSheet() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            painter = painterResource(id = R.drawable.ic_close),
                            contentDescription = "Close",
                            tint = Color.White,
                            modifier = Modifier.size(14.dp)
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                items(displayNotifications, key = { it.id }) { notif ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(if (notif.isUnread) Color(0xFF333842) else Color(0xFF23262C))
                            .padding(14.dp),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(38.dp)
                                .clip(CircleShape)
                                .background(if (notif.isUnread) BrandCasinoGreen.copy(alpha = 0.18f) else Color(0xFF353941)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_notification_bell),
                                contentDescription = null,
                                tint = if (notif.isUnread) BrandCasinoGreen else Color.White.copy(alpha = 0.6f),
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
                                color = Color(0xFF9CA3AF),
                                lineHeight = 17.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
