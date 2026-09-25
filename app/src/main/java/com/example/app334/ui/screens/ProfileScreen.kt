package com.example.app334.ui.screens

import android.widget.Toast
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.app334.R
import com.example.app334.data.repository.AuthRepository
import com.example.app334.ui.theme.RubikFont
import kotlinx.coroutines.launch

data class AvatarItem(
    val id: String,
    val resId: Int
)

@Composable
fun ProfileScreen(
    userId: String = "",
    username: String = "Player",
    phone: String = "+91 98765 43210",
    avatarId: String = "avatar_1",
    avatarRes: Int = R.drawable.avatar_1,
    balance: String = "₹0.00",
    onBackClick: () -> Unit = {},
    onWalletClick: () -> Unit = {},
    onSupportClick: () -> Unit = {},
    onTransactionClick: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val clipboardManager = LocalClipboardManager.current
    val coroutineScope = rememberCoroutineScope()

    var showEditNameDialog by remember { mutableStateOf(false) }
    var showAvatarPicker by remember { mutableStateOf(false) }
    var editedName by remember { mutableStateOf(username) }

    val avatars = remember {
        listOf(
            AvatarItem("avatar_1", R.drawable.avatar_1),
            AvatarItem("avatar_2", R.drawable.avatar_2),
            AvatarItem("avatar_3", R.drawable.avatar_3),
            AvatarItem("avatar_4", R.drawable.avatar_4),
            AvatarItem("avatar_5", R.drawable.avatar_5),
            AvatarItem("avatar_6", R.drawable.avatar_6),
            AvatarItem("avatar_7", R.drawable.avatar_7),
            AvatarItem("avatar_8", R.drawable.avatar_8)
        )
    }

    BackHandler {
        onBackClick()
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.Black)
            .padding(horizontal = 16.dp)
            .verticalScroll(rememberScrollState()),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // 1. Top Header Row with Back Button & Title "Profile"
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .statusBarsPadding()
                .padding(top = 12.dp, bottom = 4.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clickable { onBackClick() },
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_arrow_back),
                    contentDescription = "Back",
                    modifier = Modifier.size(24.dp),
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "Profile",
                fontSize = 24.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        // 2. User Info Profile Header Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF140B28))
                .border(1.dp, Color(0xFF3B1E6D), RoundedCornerShape(20.dp))
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    // Name row with edit pencil icon
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = username.ifEmpty { "Player" },
                            fontSize = 20.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )

                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF2E1065))
                                .border(1.dp, Color(0xFF7C3AED), CircleShape)
                                .clickable {
                                    editedName = username
                                    showEditNameDialog = true
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "✏️",
                                fontSize = 12.sp
                            )
                        }
                    }

                    // 7-Digit User ID Badge with Copy Option
                    if (userId.isNotBlank()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp),
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0xFF1E1B4B))
                                .border(1.dp, Color(0xFF4F46E5), RoundedCornerShape(8.dp))
                                .clickable {
                                    clipboardManager.setText(AnnotatedString(userId))
                                    Toast.makeText(context, "User ID copied: $userId", Toast.LENGTH_SHORT).show()
                                }
                                .padding(horizontal = 8.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "ID: $userId",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFFA5B4FC)
                            )
                            Text(
                                text = "📋",
                                fontSize = 12.sp
                            )
                        }
                    }

                    // Phone Number Display
                    if (phone.isNotBlank()) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            Text(
                                text = "📱 $phone",
                                fontSize = 13.sp,
                                fontFamily = RubikFont,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF9CA3AF)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                // 3D Avatar Image with change badge
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .clickable { showAvatarPicker = true }
                ) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .clip(CircleShape)
                            .border(2.dp, Color(0xFFFFD700), CircleShape)
                    ) {
                        Image(
                            painter = painterResource(id = avatarRes),
                            contentDescription = "User Avatar",
                            modifier = Modifier.fillMaxSize(),
                            contentScale = ContentScale.Crop
                        )
                    }

                    // Change avatar icon pill
                    Box(
                        modifier = Modifier
                            .size(26.dp)
                            .align(Alignment.BottomEnd)
                            .clip(CircleShape)
                            .background(Color(0xFF7C3AED))
                            .border(1.5.dp, Color.Black, CircleShape),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "📸",
                            fontSize = 11.sp
                        )
                    }
                }
            }
        }

        // 3. Wallet Balance Gradient Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(115.dp)
                .clip(RoundedCornerShape(22.dp))
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF260D6B),
                            Color(0xFF2B51E5)
                        )
                    )
                )
                .clickable { onWalletClick() }
                .padding(horizontal = 18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(5.dp)
                    ) {
                        Text(
                            text = "WALLET BALANCE",
                            fontSize = 12.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFCBD5E1),
                            letterSpacing = 0.5.sp
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.ic_reward_badge),
                            contentDescription = "Verified Shield",
                            modifier = Modifier.size(14.dp),
                            tint = Color(0xFFFFD700)
                        )
                    }

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = balance,
                            fontSize = 28.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.ic_play_arrow),
                            contentDescription = "Arrow",
                            modifier = Modifier.size(16.dp),
                            tint = Color.White
                        )
                    }
                }

                // 3D Money Bag Asset
                Image(
                    painter = painterResource(id = R.drawable.ic_refer_addcash),
                    contentDescription = "Money Bag",
                    modifier = Modifier.size(75.dp)
                )
            }
        }

        // 4. Contact Support Gradient Card
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(105.dp)
                .clip(RoundedCornerShape(18.dp))
                .background(
                    brush = Brush.horizontalGradient(
                        colors = listOf(
                            Color(0xFF4C0519),
                            Color(0xFF3B0764)
                        )
                    )
                )
                .clickable { onSupportClick() }
                .padding(horizontal = 16.dp, vertical = 14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxSize(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(4.dp)
                ) {
                    Text(
                        text = "NEED ANY HELP?",
                        fontSize = 12.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFFD1D5DB),
                        letterSpacing = 0.5.sp
                    )

                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "Contact Support",
                            fontSize = 21.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Icon(
                            painter = painterResource(id = R.drawable.ic_play_arrow),
                            contentDescription = "Arrow",
                            modifier = Modifier.size(16.dp),
                            tint = Color.White
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .size(60.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF581C87)),
                    contentAlignment = Alignment.Center
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.avatar_8),
                        contentDescription = "Contact Support",
                        modifier = Modifier.fillMaxSize(),
                        contentScale = ContentScale.Crop
                    )
                }
            }
        }

        // 5. Menu Container Card (Transaction History & Settings)
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF220338))
                .border(1.dp, Color(0xFF4C1D95), RoundedCornerShape(18.dp))
                .padding(16.dp)
        ) {
            Column(
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // Transaction History Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onTransactionClick() }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF380E54))
                                .border(1.dp, Color(0xFF7C3AED), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_settings_history),
                                contentDescription = "Transaction History",
                                modifier = Modifier.size(22.dp),
                                tint = Color.White
                            )
                        }

                        Text(
                            text = "Transaction History",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Text(
                        text = "›",
                        fontSize = 22.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }

                HorizontalDivider(color = Color(0xFF3D105A), thickness = 1.dp)

                // Settings Row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onSettingsClick() }
                        .padding(vertical = 4.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF380E54))
                                .border(1.dp, Color(0xFF7C3AED), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                painter = painterResource(id = R.drawable.ic_setting),
                                contentDescription = "Settings",
                                modifier = Modifier.size(22.dp),
                                tint = Color.White
                            )
                        }

                        Text(
                            text = "Settings",
                            fontSize = 18.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Text(
                        text = "›",
                        fontSize = 22.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }

    // =========================================================================
    // EDIT NAME DIALOG
    // =========================================================================
    if (showEditNameDialog) {
        Dialog(onDismissRequest = { showEditNameDialog = false }) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF1E1035))
                    .border(1.dp, Color(0xFF7C3AED), RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Edit Profile Name",
                        fontSize = 20.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    OutlinedTextField(
                        value = editedName,
                        onValueChange = { if (it.length <= 25) editedName = it },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        placeholder = { Text("Enter your name", color = Color(0xFF6B7280)) },
                        textStyle = TextStyle(
                            color = Color.White,
                            fontSize = 16.sp,
                            fontFamily = RubikFont,
                            fontWeight = FontWeight.Medium
                        ),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = Color(0xFFA855F7),
                            unfocusedBorderColor = Color(0xFF4C1D95),
                            focusedContainerColor = Color(0xFF0F071D),
                            unfocusedContainerColor = Color(0xFF0F071D),
                            cursorColor = Color(0xFFA855F7)
                        ),
                        shape = RoundedCornerShape(12.dp),
                        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
                        keyboardActions = KeyboardActions(
                            onDone = {
                                if (editedName.trim().isNotBlank()) {
                                    coroutineScope.launch {
                                        AuthRepository.updateProfile(name = editedName.trim(), avatarId = avatarId, context = context)
                                        Toast.makeText(context, "Name updated successfully!", Toast.LENGTH_SHORT).show()
                                        showEditNameDialog = false
                                    }
                                }
                            }
                        )
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Button(
                            onClick = { showEditNameDialog = false },
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF374151)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Cancel", color = Color.White, fontFamily = RubikFont, fontWeight = FontWeight.SemiBold)
                        }

                        Button(
                            onClick = {
                                if (editedName.trim().isNotBlank()) {
                                    coroutineScope.launch {
                                        AuthRepository.updateProfile(name = editedName.trim(), avatarId = avatarId, context = context)
                                        Toast.makeText(context, "Name updated successfully!", Toast.LENGTH_SHORT).show()
                                        showEditNameDialog = false
                                    }
                                } else {
                                    Toast.makeText(context, "Name cannot be empty", Toast.LENGTH_SHORT).show()
                                }
                            },
                            modifier = Modifier
                                .weight(1f)
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C3AED)),
                            shape = RoundedCornerShape(12.dp)
                        ) {
                            Text("Save", color = Color.White, fontFamily = RubikFont, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }

    // =========================================================================
    // CHOOSE AVATAR DIALOG
    // =========================================================================
    if (showAvatarPicker) {
        Dialog(onDismissRequest = { showAvatarPicker = false }) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF1E1035))
                    .border(1.dp, Color(0xFF7C3AED), RoundedCornerShape(24.dp))
                    .padding(20.dp)
            ) {
                Column(
                    verticalArrangement = Arrangement.spacedBy(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "Choose Your Avatar",
                        fontSize = 20.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    LazyVerticalGrid(
                        columns = GridCells.Fixed(4),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(180.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        items(avatars) { item ->
                            val isSelected = item.id == avatarId
                            Box(
                                modifier = Modifier
                                    .size(64.dp)
                                    .clip(CircleShape)
                                    .background(if (isSelected) Color(0xFF7C3AED) else Color(0xFF2E1065))
                                    .border(
                                        width = if (isSelected) 3.dp else 1.dp,
                                        color = if (isSelected) Color(0xFFFFD700) else Color(0xFF4C1D95),
                                        shape = CircleShape
                                    )
                                    .clickable {
                                        coroutineScope.launch {
                                            AuthRepository.updateProfile(
                                                name = username,
                                                avatarId = item.id,
                                                context = context
                                            )
                                            Toast.makeText(context, "Avatar updated!", Toast.LENGTH_SHORT).show()
                                            showAvatarPicker = false
                                        }
                                    },
                                contentAlignment = Alignment.Center
                            ) {
                                Image(
                                    painter = painterResource(id = item.resId),
                                    contentDescription = item.id,
                                    modifier = Modifier
                                        .fillMaxSize()
                                        .padding(if (isSelected) 3.dp else 0.dp)
                                        .clip(CircleShape),
                                    contentScale = ContentScale.Crop
                                )
                            }
                        }
                    }

                    Button(
                        onClick = { showAvatarPicker = false },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(46.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF374151)),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Close", color = Color.White, fontFamily = RubikFont, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}
