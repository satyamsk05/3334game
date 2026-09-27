package com.game3334.play.ui.screens

import android.widget.Toast
import androidx.annotation.DrawableRes
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.game3334.play.R
import com.game3334.play.game.ringoffuture.backend.WalletLedger
import com.game3334.play.ui.components.WalletChip
import com.game3334.play.ui.theme.RubikFont
import kotlinx.coroutines.launch
import java.util.Locale

@Immutable
data class ChipPackItem(
    val id: String,
    val chips: String,
    val price: String,
    val amountPaise: Long,
    @DrawableRes val imageRes: Int
)

@Composable
fun AddCashScreen(
    onOpenDeposit: (Double) -> Unit = {},
    onAddCashSuccess: (String) -> Unit = {},
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val walletBalance by WalletLedger.walletBalance.collectAsState()
    val userProfile by WalletLedger.userProfile.collectAsState()

    LaunchedEffect(Unit) {
        com.game3334.play.data.remote.WalletSyncService.syncBalance(userProfile.userId)
    }

    val chipPacks = remember {
        listOf(
            ChipPackItem(
                id = "pack_100",
                chips = "100",
                price = "₹99.00",
                amountPaise = 10000L,
                imageRes = R.drawable.chip_pack_1
            ),
            ChipPackItem(
                id = "pack_300",
                chips = "300",
                price = "₹299.00",
                amountPaise = 30000L,
                imageRes = R.drawable.chip_pack_2
            ),
            ChipPackItem(
                id = "pack_510",
                chips = "510",
                price = "₹499.00",
                amountPaise = 51000L,
                imageRes = R.drawable.chip_pack_3
            ),
            ChipPackItem(
                id = "pack_1020",
                chips = "1020",
                price = "₹999.00",
                amountPaise = 102000L,
                imageRes = R.drawable.chip_pack_4
            ),
            ChipPackItem(
                id = "pack_2040",
                chips = "2040",
                price = "₹1,999.00",
                amountPaise = 204000L,
                imageRes = R.drawable.chip_pack_5
            ),
            ChipPackItem(
                id = "pack_5150",
                chips = "5150",
                price = "₹4,999.00",
                amountPaise = 515000L,
                imageRes = R.drawable.chip_pack_6
            )
        )
    }

    val chipBalance = if (walletBalance.totalPaise % 100 == 0L) {
        "${walletBalance.totalPaise / 100}"
    } else {
        String.format(Locale.getDefault(), "%.2f", walletBalance.totalRupees)
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(com.game3334.play.ui.theme.AppBackground)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
                .verticalScroll(rememberScrollState())
                .padding(bottom = 120.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // 1. Top Header Bar: "Add Chips" + WalletChip
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding()
                    .padding(top = 12.dp, bottom = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Add Chips",
                    fontSize = 24.sp,
                    fontFamily = RubikFont,
                    fontWeight = FontWeight.Black,
                    color = Color.White
                )

                WalletChip(
                    balance = chipBalance
                )
            }

            // 2. Main Chips Section Outer Container
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(Color(0xFF0F1015))
                    .border(1.dp, Color(0xFF1E2028), RoundedCornerShape(24.dp))
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    // Header Title "Chips"
                    Text(
                        text = "Chips",
                        fontSize = 15.sp,
                        fontFamily = RubikFont,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF8E899B),
                        textAlign = TextAlign.Center,
                        modifier = Modifier.fillMaxWidth()
                    )

                    // 3-Column Grid (Row 1: 0, 1, 2 | Row 2: 3, 4, 5)
                    for (row in 0 until 2) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            for (col in 0 until 3) {
                                val index = row * 3 + col
                                if (index < chipPacks.size) {
                                    val pack = chipPacks[index]
                                    ChipPackCard(
                                        pack = pack,
                                        modifier = Modifier.weight(1f),
                                        onClick = {
                                            val amt = pack.amountPaise / 100.0
                                            onOpenDeposit(amt)
                                        }
                                    )
                                } else {
                                    Spacer(modifier = Modifier.weight(1f))
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
private fun ChipPackCard(
    pack: ChipPackItem,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .clip(RoundedCornerShape(16.dp))
            .background(Color(0xFF23242C))
            .border(1.dp, Color(0xFF32343E), RoundedCornerShape(16.dp))
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null
            ) { onClick() }
            .padding(vertical = 14.dp, horizontal = 6.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            // 3D Chip Pack Asset
            Image(
                painter = painterResource(id = pack.imageRes),
                contentDescription = pack.chips,
                modifier = Modifier
                    .size(56.dp)
                    .padding(bottom = 6.dp),
                contentScale = ContentScale.Fit
            )

            // Chip Amount Text (e.g. 100K, 1M)
            Text(
                text = pack.chips,
                fontSize = 16.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Black,
                color = Color.White
            )

            Spacer(modifier = Modifier.height(2.dp))

            // Price in Gold/Amber (e.g. ₹39.00)
            Text(
                text = pack.price,
                fontSize = 12.5.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Bold,
                color = Color(0xFFFFB800)
            )
        }
    }
}
