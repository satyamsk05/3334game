package com.example.app334.wheel

import com.example.app334.game.ringoffuture.wheel.WheelGeometry
import org.junit.Assert.assertEquals
import org.junit.Test

class WheelGeometryTest {

    @Test
    fun testSegmentCountAndAngle() {
        assertEquals(32, WheelGeometry.SEGMENT_COUNT)
        assertEquals(11.25f, WheelGeometry.SEGMENT_ANGLE, 0.001f)
    }

    @Test
    fun testTargetRotationAccuracy() {
        for (i in 0 until 32) {
            val rotation = WheelGeometry.calculateTargetRotation(segmentIndex = i, fullRotations = 4)
            val detectedIndex = WheelGeometry.segmentAtPointer(rotation)
            assertEquals("Detected segment should match target segment $i", i, detectedIndex)
        }
    }

    @Test
    fun testBoundarySegments() {
        val firstRotation = WheelGeometry.calculateTargetRotation(0, fullRotations = 2)
        assertEquals(0, WheelGeometry.segmentAtPointer(firstRotation))

        val lastRotation = WheelGeometry.calculateTargetRotation(31, fullRotations = 2)
        assertEquals(31, WheelGeometry.segmentAtPointer(lastRotation))
    }
}
