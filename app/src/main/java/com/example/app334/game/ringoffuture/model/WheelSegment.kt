package com.example.app334.game.ringoffuture.model

import androidx.compose.ui.graphics.Color

enum class ColorType {
    GREEN,
    RED,
    BLUE,
    BLACK,
    PURPLE,
    GREY
}

data class WheelSegment(
    val index: Int,
    val colorType: ColorType,
    val color: Color,
    val multiplier: Float,
    val label: String
)
