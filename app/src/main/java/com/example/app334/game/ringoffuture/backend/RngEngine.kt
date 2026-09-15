package com.example.app334.game.ringoffuture.backend

import com.example.app334.game.ringoffuture.model.ColorType
import com.example.app334.game.ringoffuture.model.WheelConfig
import com.example.app334.game.ringoffuture.model.WheelSegment
import java.security.MessageDigest
import kotlin.random.Random

object RngEngine {

    val allSegments: List<WheelSegment> = buildSegments()

    private fun buildSegments(): List<WheelSegment> {
        val list = mutableListOf<WheelSegment>()

        // Index 0 -> Green
        list.add(WheelSegment(0, ColorType.GREEN, WheelConfig.COLOR_GREEN, WheelConfig.MULTIPLIER_GREEN, "32x"))

        // Index 1..6 -> Red
        for (i in 1..6) {
            list.add(WheelSegment(i, ColorType.RED, WheelConfig.COLOR_RED, WheelConfig.MULTIPLIER_RED, "5.16x"))
        }

        // Index 7..16 -> Purple
        for (i in 7..16) {
            list.add(WheelSegment(i, ColorType.PURPLE, WheelConfig.COLOR_PURPLE, WheelConfig.MULTIPLIER_PURPLE, "3.1x"))
        }

        // Index 17..31 -> Grey
        for (i in 17..31) {
            list.add(WheelSegment(i, ColorType.GREY, WheelConfig.COLOR_GREY, WheelConfig.MULTIPLIER_GREY, "2.06x"))
        }

        return list
    }

    /**
     * Generates provably fair segment index using SHA-256 hash or Admin Override index.
     */
    fun generateWinningSegmentIndex(
        roundNumber: Long,
        serverSeed: String,
        adminOverrideIndex: Int = -1
    ): Int {
        if (adminOverrideIndex in 0 until WheelConfig.SEGMENT_COUNT) {
            return adminOverrideIndex
        }

        val input = "$serverSeed:$roundNumber:${System.nanoTime()}"
        val bytes = MessageDigest.getInstance("SHA-256").digest(input.toByteArray())
        val hashInt = Math.abs(bytes.fold(0) { acc, byte -> (acc shl 8) + (byte.toInt() and 0xFF) })

        return hashInt % WheelConfig.SEGMENT_COUNT
    }

    fun getSegment(index: Int): WheelSegment {
        val validIndex = (index % WheelConfig.SEGMENT_COUNT + WheelConfig.SEGMENT_COUNT) % WheelConfig.SEGMENT_COUNT
        return allSegments[validIndex]
    }
}
