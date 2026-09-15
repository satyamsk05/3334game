package com.example.app334.game.ringoffuture.model

import androidx.compose.ui.graphics.Color

object WheelConfig {
    const val SEGMENT_COUNT = 32
    const val FULL_CIRCLE = 360f
    const val SEGMENT_ANGLE = FULL_CIRCLE / SEGMENT_COUNT // 11.25 degrees

    // Segment Distribution
    const val GREEN_COUNT = 1
    const val RED_COUNT = 6
    const val PURPLE_COUNT = 10
    const val GREY_COUNT = 15

    // Color Definitions
    val COLOR_GREEN = Color(0xFF4CAF50)
    val COLOR_RED = Color(0xFFF44336)
    val COLOR_PURPLE = Color(0xFF9C27B0)
    val COLOR_GREY = Color(0xFF9E9E9E)

    val COLOR_GOLD = Color(0xFFFFD700)
    val COLOR_DARK_BACKGROUND = Color(0xFF150A21)
    val COLOR_SURFACE = Color(0xFF231238)
    val COLOR_CARD = Color(0xFF2D1947)

    // Multipliers
    const val MULTIPLIER_GREEN = 32.0f
    const val MULTIPLIER_RED = 5.16f
    const val MULTIPLIER_PURPLE = 3.10f
    const val MULTIPLIER_GREY = 2.06f

    // Timers (Seconds)
    const val BETTING_TIME_SECONDS = 15
    const val LOCKED_TIME_SECONDS = 2
    const val SPIN_DURATION_SECONDS = 4.5f
    const val RESULT_SHOW_SECONDS = 3.5f
}
