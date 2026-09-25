package com.example.app334.ui.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

// Emerald Green Palette (#0F9D58 range)
val Emerald300 = Color(0xFF34D399)
val Emerald400 = Color(0xFF10B981)
val Emerald500 = Color(0xFF0F9D58)
val Emerald600 = Color(0xFF0B8043)
val Emerald700 = Color(0xFF047857)

// Deep Violet Palette (#5B1FA6 range)
val Violet400 = Color(0xFFA78BFA)
val Violet500 = Color(0xFF8B5CF6)
val Violet600 = Color(0xFF7C3AED)
val Violet700 = Color(0xFF5B1FA6)
val Violet800 = Color(0xFF4C1D95)
val Violet900 = Color(0xFF2E1065)

// Gold Accent Palette (#FFC107 range)
val Gold300 = Color(0xFFFFE082)
val Gold400 = Color(0xFFFFD54F)
val Gold500 = Color(0xFFFFC107)
val Gold600 = Color(0xFFFFB300)
val Gold700 = Color(0xFFFFA000)

// Black Backgrounds (#000000)
val DarkNavyPurpleStart = Color(0xFF000000)
val DarkNavyPurpleEnd = Color(0xFF000000)
val CardNavyBackground = Color(0xFF141414)
val CardSurfaceVariant = Color(0xFF1E1E1E)

// Status & Indicators
val OnlineGreen = Color(0xFF00E676)
val LiveRed = Color(0xFFEF4444)
val HotBadgeOrange = Color(0xFFFF5722)

// Text & Surfaces
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFFD1D5DB)
val TextMuted = Color(0xFF9CA3AF)
val TextDisabled = Color(0xFF6B7280)

// Gradients
val BackgroundGradient = Brush.verticalGradient(
    colors = listOf(Color.Black, Color.Black)
)

val BottomNavGradient = Brush.verticalGradient(
    colors = listOf(Color.Black, Color.Black)
)

val ActiveTabIndicatorGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFF8B5CF6), Color(0xFF5B1FA6))
)

val WalletPillGradient = Brush.verticalGradient(
    colors = listOf(Color(0xFF10B981), Color(0xFF0F9D58))
)

val GoldBadgeGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFFFFD54F), Color(0xFFFFB300))
)

val HotBadgeGradient = Brush.horizontalGradient(
    colors = listOf(Color(0xFFFF5252), Color(0xFFFF1744))
)
