package com.example.app334.game.ringoffuture.wheel

import com.example.app334.game.ringoffuture.model.WheelConfig

/**
 * Single source of truth for 32-segment wheel geometry calculations.
 * Ensures consistent target rotation and pointer-detection math across canvas and animation.
 */
object WheelGeometry {

    const val SEGMENT_COUNT: Int = WheelConfig.SEGMENT_COUNT // 32
    const val SEGMENT_ANGLE: Float = 360f / SEGMENT_COUNT // 11.25°

    /**
     * Start angle for a segment index relative to 0° (top of wheel).
     */
    fun segmentStartAngle(index: Int): Float {
        val safeIndex = (index % SEGMENT_COUNT + SEGMENT_COUNT) % SEGMENT_COUNT
        return safeIndex * SEGMENT_ANGLE
    }

    /**
     * Center angle for a segment index relative to 0°.
     */
    fun segmentCenterAngle(index: Int): Float {
        return segmentStartAngle(index) + (SEGMENT_ANGLE / 2f)
    }

    /**
     * Calculates the total rotation degrees needed to align the segment at [segmentIndex]
     * under the pointer at the top (0° / 270° standard top pointer position).
     *
     * @param segmentIndex Target segment index (0..31)
     * @param fullRotations Number of 360° revolutions for spin animation effect
     */
    fun calculateTargetRotation(segmentIndex: Int, fullRotations: Int = 5): Float {
        val safeIndex = (segmentIndex % SEGMENT_COUNT + SEGMENT_COUNT) % SEGMENT_COUNT
        val centerAngle = segmentCenterAngle(safeIndex)
        // To align segment center under top pointer (0 degrees), wheel must rotate backwards by centerAngle
        val targetBaseAngle = (360f - centerAngle) % 360f
        return (fullRotations * 360f) + targetBaseAngle
    }

    /**
     * Detects which segment index is currently positioned under the top pointer given total wheel rotation.
     */
    fun segmentAtPointer(totalRotation: Float): Int {
        val normalizedRotation = (totalRotation % 360f + 360f) % 360f
        // Pointer is fixed at top (0°). The angle of wheel under pointer is (360 - normalizedRotation) % 360
        val angleUnderPointer = (360f - normalizedRotation) % 360f
        val rawIndex = (angleUnderPointer / SEGMENT_ANGLE).toInt()
        return (rawIndex % SEGMENT_COUNT + SEGMENT_COUNT) % SEGMENT_COUNT
    }
}
