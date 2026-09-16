package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.WheelConfig
import com.example.app334.game.ringoffuture.model.WheelSegment
import java.security.SecureRandom

object RngEngine {

    private val secureRandom = SecureRandom()
    val allSegments: List<WheelSegment> = buildSegments()

    private fun buildSegments(): List<WheelSegment> {
        val list = mutableListOf<WheelSegment>()

        // Index 0 -> Green (50x)
        list.add(WheelSegment(0, ColorType.GREEN, WheelConfig.COLOR_GREEN, WheelConfig.MULTIPLIER_GREEN, "50x"))

        // Index 1..6 -> Blue (5x)
        for (i in 1..6) {
            list.add(WheelSegment(i, ColorType.BLUE, WheelConfig.COLOR_BLUE, WheelConfig.MULTIPLIER_BLUE, "5x"))
        }

        // Index 7..16 -> Red (3x)
        for (i in 7..16) {
            list.add(WheelSegment(i, ColorType.RED, WheelConfig.COLOR_RED, WheelConfig.MULTIPLIER_RED, "3x"))
        }

        // Index 17..31 -> Black (2x)
        for (i in 17..31) {
            list.add(WheelSegment(i, ColorType.BLACK, WheelConfig.COLOR_BLACK, WheelConfig.MULTIPLIER_BLACK, "2x"))
        }

        return list
    }

    /**
     * Generates unbiased random segment index (0..31) using SecureRandom.
     */
    fun generateWinningSegmentIndex(): Int {
        return secureRandom.nextInt(WheelConfig.SEGMENT_COUNT)
    }

    fun getSegment(index: Int): WheelSegment {
        val validIndex = (index % WheelConfig.SEGMENT_COUNT + WheelConfig.SEGMENT_COUNT) % WheelConfig.SEGMENT_COUNT
        return allSegments[validIndex]
    }
}
