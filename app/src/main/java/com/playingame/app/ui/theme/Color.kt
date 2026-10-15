package com.playingame.app.ui.theme

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

// App Backgrounds & Surface Palette (New Matte Charcoal Theme)
val AppBackground = Color(0xFF212327)
val DarkNavyPurpleStart = Color(0xFF212327)
val DarkNavyPurpleEnd = Color(0xFF1B1D21)

// Bottom Navigation Bar (#1B1D21)
val NavBarBackground = Color(0xFF1B1D21)
val NavBarBorder = Color(0xFF2C2F36)
val TabActiveGold = Color(0xFFFFB800)
val TabInactiveTint = Color(0xFF8E95A2)

// Card Palette (#2A2D33 range)
val CardBorderColor = Color(0xFF353941)
val CardNavyBackground = Color(0xFF2A2D33)
val CardSurfaceVariant = Color(0xFF2E323A)
val CardHeaderBg = Color(0xFF25282E)

// Casino Brand Accent Green & Action Buttons (Image 1)
val BrandCasinoGreen = Color(0xFF00D26A)
val BtnWithdrawBackground = Color(0xFF373B43)

// Play Button Purple
val PlayButtonPurple = Color(0xFF6C47FF)
val PlayButtonPurpleLight = Color(0xFF8B5CF6)

// Status & Indicators
val OnlineGreen = Color(0xFF00D26A)
val LiveRed = Color(0xFFEF4444)
val HotBadgeOrange = Color(0xFFFF5722)

// Text & Surfaces
val TextPrimary = Color(0xFFFFFFFF)
val TextSecondary = Color(0xFF9CA3AF)
val TextMuted = Color(0xFF6B7280)
val TextDisabled = Color(0xFF4B5563)

// Gradients
val BackgroundGradient = Brush.verticalGradient(
    colors = listOf(AppBackground, Color(0xFF1B1D21))
)

val BottomNavGradient = Brush.verticalGradient(
    colors = listOf(NavBarBackground, NavBarBackground)
)

val ActiveTabIndicatorGradient = Brush.horizontalGradient(
    colors = listOf(TabActiveGold, Color(0xFFFFA000))
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
