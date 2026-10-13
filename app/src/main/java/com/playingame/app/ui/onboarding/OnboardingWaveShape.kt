package com.playingame.app.ui.onboarding

import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Outline
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.Shape
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.LayoutDirection

/**
 * Custom wave shape matching the reference design.
 * Creates a smooth, organic S-curve at the top of the bottom content container.
 */
class WaveTopShape(
    private val waveHeightPx: Float = 46f
) : Shape {
    override fun createOutline(
        size: Size,
        layoutDirection: LayoutDirection,
        density: Density
    ): Outline {
        val w = size.width
        val h = size.height
        val waveH = waveHeightPx.coerceAtMost(h * 0.2f)

        val path = Path().apply {
            // Start at left edge
            moveTo(0f, waveH * 0.35f)
            // Smooth organic cubic curve matching reference design
            cubicTo(
                x1 = w * 0.28f,
                y1 = -waveH * 0.45f,
                x2 = w * 0.65f,
                y2 = waveH * 1.25f,
                x3 = w,
                y3 = waveH * 0.30f
            )
            lineTo(w, h)
            lineTo(0f, h)
            close()
        }
        return Outline.Generic(path)
    }
}
