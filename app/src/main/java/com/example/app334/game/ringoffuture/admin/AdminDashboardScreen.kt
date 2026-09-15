package com.example.app334.game.ringoffuture.admin

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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

    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Game & RTP Controls", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
            Column(modifier = Modifier.padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("Select Return To Player (RTP) Mode:", color = Color.LightGray, fontSize = 14.sp)
                RtpMode.entries.forEach { mode ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                selectedRtp = mode
                                AdminEngine.activeRtpMode = mode
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
    }
}

@Composable
fun AdminUserManagementTab() {
    var users by remember { mutableStateOf(AdminEngine.getUsers()) }

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("User Management", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

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
                    }
                }
            }
        }
    }
}

@Composable
fun AdminApprovalsTab() {
    val transactions by WalletLedger.transactions.collectAsState()

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Transaction Ledger Log", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

        if (transactions.isEmpty()) {
            Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
                Text("No transactions logged yet. ⚡", color = Color.Gray, modifier = Modifier.padding(16.dp))
            }
        } else {
            LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                items(transactions) { tx ->
                    Card(colors = CardDefaults.cardColors(containerColor = WheelConfig.COLOR_CARD), modifier = Modifier.fillMaxWidth()) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text("${tx.type.name} - ${tx.amountRupeesFormatted}", color = Color.White, fontWeight = FontWeight.Bold)
                            Text("User: ${tx.userId} | Ref: ${tx.referenceId}", color = Color.Gray, fontSize = 12.sp)
                            Text(tx.description, color = WheelConfig.COLOR_GOLD, fontSize = 12.sp)
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
        Text("Telegram Event Stream", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)

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
