package com.example.app334.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.app334.R
import com.example.app334.ui.theme.Dimens
import com.example.app334.ui.theme.RubikFont
import com.example.app334.ui.theme.TextMuted

@Composable
fun ComplianceBar(
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(Dimens.complianceBarHeight)
            .background(Color(0xFF0E0417)),
        contentAlignment = Alignment.Center
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Icon(
                painter = painterResource(id = R.drawable.ic_settings_shield),
                contentDescription = "Responsible Gaming",
                modifier = Modifier.size(13.dp),
                tint = TextMuted
            )

            Text(
                text = "18+ | Play Responsibly | T&C Apply",
                fontSize = 11.sp,
                fontFamily = RubikFont,
                fontWeight = FontWeight.Medium,
                color = TextMuted,
                letterSpacing = 0.3.sp
            )
        }
    }
}
