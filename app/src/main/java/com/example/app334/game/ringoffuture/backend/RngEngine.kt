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

        // Index 0 -> Green (30x multiplier for ~95% RTP)
        list.add(WheelSegment(0, ColorType.GREEN, WheelConfig.COLOR_GREEN, WheelConfig.MULTIPLIER_GREEN, "30x"))

        // Index 1..6 -> Red (5.06x)
        for (i in 1..6) {
            list.add(WheelSegment(i, ColorType.RED, WheelConfig.COLOR_RED, WheelConfig.MULTIPLIER_RED, "5.06x"))
        }

        // Index 7..16 -> Purple (3.04x)
        for (i in 7..16) {
            list.add(WheelSegment(i, ColorType.PURPLE, WheelConfig.COLOR_PURPLE, WheelConfig.MULTIPLIER_PURPLE, "3.04x"))
        }

        // Index 17..31 -> Grey (2.03x)
        for (i in 17..31) {
            list.add(WheelSegment(i, ColorType.GREY, WheelConfig.COLOR_GREY, WheelConfig.MULTIPLIER_GREY, "2.03x"))
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
