package com.example.app334.game.ringoffuture.admin

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.game.ringoffuture.backend.*
import com.example.app334.game.ringoffuture.model.WheelConfig

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardScreen(
    onBackClick: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("📊 Overview", "⚙️ Game Control & RTP", "👥 Users", "💳 Approvals", "🤖 Telegram Logs")

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("👑 SuperAdmin Control Panel", color = Color.White, fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    TextButton(onClick = onBackClick) {
                        Text("❮ Exit Admin", color = WheelConfig.COLOR_GOLD, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color(0xFF130722))
            )
        },
        containerColor = WheelConfig.COLOR_DARK_BACKGROUND
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            // Tab Selector Row
            ScrollableTabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color(0xFF1F0E37),
                contentColor = WheelConfig.COLOR_GOLD
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                title,
                                color = if (selectedTab == index) WheelConfig.COLOR_GOLD else Color.Gray,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal
                            )
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(12.dp)
            ) {
                when (selectedTab) {
                    0 -> AdminOverviewTab()
                    1 -> AdminGameControlTab()
                    2 -> AdminUserManagementTab()
                    3 -> AdminApprovalsTab()
                    4 -> AdminTelegramLogsTab()
                }
            }
        }
    }
}

@Composable
fun AdminOverviewTab() {
    val analytics = remember { AdminEngine.getAnalytics() }

    LazyColumn(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item {
            Text("Real-Time Platform Performance", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Active Players", "${analytics.totalActivePlayers} Live 🟢", Color(0xFF4CAF50), Modifier.weight(1f))
                MetricCard("Net House Profit", "₹${analytics.netHouseProfit}", WheelConfig.COLOR_GOLD, Modifier.weight(1f))
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Total Bets Today", "₹${analytics.totalBetsToday}", Color(0xFF9C27B0), Modifier.weight(1f))
                MetricCard("Total Payouts Today", "₹${analytics.totalPayoutsToday}", Color(0xFFF44336), Modifier.weight(1f))
            }
        }

        item {
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth()) {
                MetricCard("Deposits Today", "₹${analytics.totalDepositsToday}", Color(0xFF2196F3), Modifier.weight(1f))
                MetricCard("Withdrawals Today", "₹${analytics.totalWithdrawalsToday}", Color(0xFFFF9800), Modifier.weight(1f))
            }
        }
    }
}

@Composable
fun MetricCard(title: String, value: String, accentColor: Color, modifier: Modifier = Modifier) {
    Card(
        colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD),
        shape = RoundedCornerShape(12.dp),
        modifier = modifier
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, color = Color.Gray, fontSize = 12.sp)
            Spacer(modifier = Modifier.height(4.dp))
            Text(value, color = accentColor, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun AdminGameControlTab() {
    var selectedRtp by remember { mutableStateOf(AdminEngine.activeRtpMode) }
    var overrideInput by remember { mutableStateOf(AdminEngine.manualOverrideSegmentIndex.toString()) }
    var statusMsg by remember { mutableStateOf("") }

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Game & RTP Controls", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Select Return To Player (RTP) Mode:", color = Color.LightGray, fontSize = 14.sp)
                RtpMode.values().forEach { mode ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedRtp = mode
                                AdminEngine.activeRtpMode = mode
                                statusMsg = "RTP updated to $mode"
                            }
                    ) {
                        RadioButton(selected = selectedRtp == mode, onClick = {
                            selectedRtp = mode
                            AdminEngine.activeRtpMode = mode
                        })
                        Text(mode.name, color = Color.White, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Manual Outcome Segment Override (0 to 31):", color = Color.LightGray, fontSize = 14.sp)
                OutlinedTextField(
                    value = overrideInput,
                    onValueChange = { overrideInput = it },
                    label = { Text("Target Segment Index (e.g. 0 for Green 32x)", color = Color.Gray) },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(focusedTextColor = Color.White, unfocusedTextColor = Color.White),
                    modifier = Modifier.fillMaxWidth()
                )
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = {
                            val idx = overrideInput.toIntOrNull() ?: -1
                            AdminEngine.setManualOverride(idx)
                            statusMsg = "Forced outcome set to Segment #$idx"
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = WheelConfig.COLOR_GOLD),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Set Override", color = Color.Black, fontWeight = FontWeight.Bold)
                    }

                    Button(
                        onClick = {
                            AdminEngine.clearManualOverride()
                            overrideInput = "-1"
                            statusMsg = "Cleared manual override"
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Red),
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Clear", color = Color.White, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        if (statusMsg.isNotEmpty()) {
            Text(statusMsg, color = WheelConfig.COLOR_GOLD, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
fun AdminUserManagementTab() {
    var users by remember { mutableStateOf(AdminEngine.getUsers()) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("User Management (A-to-Z Controls)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(users) { user ->
                Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.padding(14.dp).fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("${user.username} (${user.userId})", color = Color.White, fontWeight = FontWeight.Bold)
                            Text("Phone: ${user.phone}", color = Color.Gray, fontSize = 12.sp)
                            Text("Deposit: ₹${user.depositBalance} | Winnings: ₹${user.winningBalance}", color = WheelConfig.COLOR_GOLD, fontSize = 12.sp)
                        }

                        Button(
                            onClick = {
                                AdminEngine.toggleUserBan(user.userId)
                                users = AdminEngine.getUsers()
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (user.isBanned) Color(0xFF4CAF50) else Color(0xFFF44336)
                            )
                        ) {
                            Text(if (user.isBanned) "UNBAN" else "BAN", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminApprovalsTab() {
    var transactions by remember { mutableStateOf(WalletLedger.getTransactions()) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Pending Approvals (Withdrawals & Deposits)", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        val pendingList = transactions.filter { it.status == TransactionStatus.PENDING }

        if (pendingList.isEmpty()) {
            Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
                Text("No pending approvals right now. ⚡", color = Color.Gray, modifier = Modifier.padding(16.dp))
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(pendingList) { tx ->
                    Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("${tx.type.name} - ₹${tx.amount}", color = Color.White, fontWeight = FontWeight.Bold)
                            Text("User: ${tx.userId} | Ref: ${tx.referenceId}", color = Color.Gray, fontSize = 12.sp)
                            Text(tx.description, color = WheelConfig.COLOR_GOLD, fontSize = 12.sp)

                            Spacer(modifier = Modifier.height(8.dp))

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = {
                                        if (tx.type == TransactionType.DEPOSIT) {
                                            AdminEngine.approveDeposit(tx.id)
                                        } else {
                                            AdminEngine.approveWithdrawal(tx.id)
                                        }
                                        transactions = WalletLedger.getTransactions()
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF4CAF50)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("✅ APPROVE", color = Color.White, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        AdminEngine.rejectWithdrawal(tx.id, "Rejected by Admin")
                                        transactions = WalletLedger.getTransactions()
                                    },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF44336)),
                                    modifier = Modifier.weight(1f)
                                ) {
                                    Text("❌ REJECT", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AdminTelegramLogsTab() {
    val logs = remember { TelegramBotEngine.getLogs() }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Telegram Bot Live Notification Stream", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        if (logs.isEmpty()) {
            Text("No Telegram notification alerts logged yet.", color = Color.Gray)
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(logs) { log ->
                    Card(colors = CardDefaults.cardColors(containerColor = Color(0xFF1E1035)), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Text(log.title, color = WheelConfig.COLOR_GOLD, fontWeight = FontWeight.Bold)
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(log.body, color = Color.White, fontSize = 12.sp)
                        }
                    }
                }
            }
        }
    }
}

