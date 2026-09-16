package com.example.app334.game.ringoffuture.model

import androidx.compose.ui.graphics.Color

object WheelConfig {
    const val SEGMENT_COUNT = 32
    const val FULL_CIRCLE = 360f
    const val SEGMENT_ANGLE = FULL_CIRCLE / SEGMENT_COUNT // 11.25 degrees

    // Segment Distribution
    const val GREEN_COUNT = 1
    const val BLUE_COUNT = 6
    const val RED_COUNT = 10
    const val BLACK_COUNT = 15

    // Color Definitions (Matching Board.png)
    val COLOR_BLACK = Color(0xFF2C3240)
    val COLOR_RED = Color(0xFFED4B5E)
    val COLOR_BLUE = Color(0xFF3B93FF)
    val COLOR_GREEN = Color(0xFF5CC62F)

    // Aliases for backwards compatibility
    val COLOR_PURPLE = COLOR_BLUE
    val COLOR_GREY = COLOR_BLACK

    val COLOR_GOLD = Color(0xFFFFD700)
    val COLOR_DARK_BACKGROUND = Color(0xFF140C24)
    val COLOR_SURFACE = Color(0xFF1F1535)
    val COLOR_CARD = Color(0xFF281C44)

    // Multipliers & Service Fee
    const val MULTIPLIER_BLACK = 2.0f
    const val MULTIPLIER_RED = 3.0f
    const val MULTIPLIER_BLUE = 5.0f
    const val MULTIPLIER_GREEN = 50.0f

    // Aliases for backwards compatibility
    const val MULTIPLIER_PURPLE = MULTIPLIER_BLUE
    const val MULTIPLIER_GREY = MULTIPLIER_BLACK

    const val SERVICE_FEE_PERCENT = 0.02f // 2% service fee (₹2 per ₹100 trade)

    // Timers (Seconds)
    const val BETTING_TIME_SECONDS = 20
    const val LOCKED_TIME_SECONDS = 2
    const val SPIN_DURATION_SECONDS = 4.5f
    const val RESULT_SHOW_SECONDS = 3.5f
}
