package com.example.app334.game.ringoffuture.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.unit.dp
import com.example.app334.game.ringoffuture.backend.RngEngine
import com.example.app334.game.ringoffuture.model.WheelConfig
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun WheelCanvas(
    rotationAngle: Float,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier,
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2f, size.height / 2f)
            val outerRadius = minOf(size.width, size.height) / 2f - 24f
            val wheelRadius = outerRadius - 20f

            // 1. Draw Outer Glowing Rim
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF3B185F), Color(0xFF1E0A36)),
                    center = center,
                    radius = outerRadius + 20f
                ),
                radius = outerRadius + 10f,
                center = center
            )

            // Outer Metallic Ring
            drawCircle(
                color = Color(0xFFFFD700),
                radius = outerRadius,
                center = center,
                style = Stroke(width = 12f)
            )

            // 2. Draw 32 Segments Rotated by current angle
            rotate(degrees = rotationAngle, pivot = center) {
                RngEngine.allSegments.forEach { segment ->
                    val startAngle = segment.index * WheelConfig.SEGMENT_ANGLE - 90f

                    drawArc(
                        color = segment.color,
                        startAngle = startAngle,
                        sweepAngle = WheelConfig.SEGMENT_ANGLE,
                        useCenter = true,
                        topLeft = Offset(center.x - wheelRadius, center.y - wheelRadius),
                        size = Size(wheelRadius * 2f, wheelRadius * 2f)
                    )

                    // Draw Segment Dividing Line
                    val rad = Math.toRadians(startAngle.toDouble())
                    val lineEnd = Offset(
                        (center.x + wheelRadius * cos(rad)).toFloat(),
                        (center.y + wheelRadius * sin(rad)).toFloat()
                    )
                    drawLine(
                        color = Color(0x66FFFFFF),
                        start = center,
                        end = lineEnd,
                        strokeWidth = 2f
                    )
                }

                // Inner Circle Border for segments
                drawCircle(
                    color = Color(0xFF1A0A2A),
                    radius = wheelRadius * 0.45f,
                    center = center
                )
            }

            // 3. Draw Outer Glowing LED Pegs (32 pegs)
            for (i in 0 until WheelConfig.SEGMENT_COUNT) {
                val pegAngle = Math.toRadians((i * WheelConfig.SEGMENT_ANGLE).toDouble())
                val pegPos = Offset(
                    (center.x + (outerRadius - 6f) * cos(pegAngle)).toFloat(),
                    (center.y + (outerRadius - 6f) * sin(pegAngle)).toFloat()
                )
                drawCircle(
                    color = if (i % 2 == 0) Color(0xFFFFE082) else Color(0xFFFFF9C4),
                    radius = 5f,
                    center = pegPos
                )
            }

            // 4. Draw Center Metallic Hub
            val hubRadius = wheelRadius * 0.38f
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFFFFD700), Color(0xFFB8860B), Color(0xFF10051D)),
                    center = center,
                    radius = hubRadius
                ),
                radius = hubRadius,
                center = center
            )

            drawCircle(
                color = Color(0xFFFFD700),
                radius = hubRadius * 0.95f,
                center = center,
                style = Stroke(width = 4f)
            )

            // Center Golden Ring
            drawCircle(
                color = Color(0xFF10051D),
                radius = hubRadius * 0.65f,
                center = center
            )

            // 5. Top Center Golden Pointer Arrow
            drawTopPointer(center, outerRadius)
        }
    }
}

private fun DrawScope.drawTopPointer(center: Offset, outerRadius: Float) {
    val pointerTop = center.y - outerRadius - 12f
    val pointerWidth = 28f
    val pointerHeight = 38f

    val path = Path().apply {
        moveTo(center.x, pointerTop + pointerHeight) // Bottom tip pointing downwards
        lineTo(center.x - pointerWidth / 2f, pointerTop) // Top left
        lineTo(center.x + pointerWidth / 2f, pointerTop) // Top right
        close()
    }

    // Shadow
    drawPath(
        path = path,
        color = Color(0xFF000000),
        alpha = 0.4f
    )

    // Golden Pointer
    drawPath(
        path = path,
        brush = Brush.verticalGradient(
            colors = listOf(Color(0xFFFFF59D), Color(0xFFFFD700), Color(0xFFFF8F00))
        )
    )

    // Pointer Border
    drawPath(
        path = path,
        color = Color(0xFFFFFFFF),
        style = Stroke(width = 3f)
    )
}
