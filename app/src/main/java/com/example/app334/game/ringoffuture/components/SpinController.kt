package com.example.app334.game.ringoffuture.components

import com.example.app334.game.ringoffuture.model.WheelConfig

class SpinController {

    var currentRotation: Float = 0f
        private set

    var isSpinning: Boolean = false
        private set

    private var startRotation: Float = 0f
    private var targetRotation: Float = 0f
    private var elapsedTime: Float = 0f
    private val spinDuration: Float = WheelConfig.SPIN_DURATION_SECONDS

    fun startSpin(winningSegmentIndex: Int) {
        if (isSpinning) return

        isSpinning = true
        elapsedTime = 0f
        startRotation = currentRotation % WheelConfig.FULL_CIRCLE

        val targetBase = com.example.app334.game.ringoffuture.wheel.WheelGeometry.calculateTargetRotation(winningSegmentIndex, fullRotations = 5)
        targetRotation = startRotation + targetBase
    }

    fun update(deltaSeconds: Float): Float {
        if (!isSpinning) return currentRotation

        elapsedTime += deltaSeconds
        val progress = (elapsedTime / spinDuration).coerceIn(0f, 1f)

        // Cubic Ease-Out Deceleration Curve: f(t) = 1 - (1 - t)^3
        val easedProgress = 1f - Math.pow((1f - progress).toDouble(), 3.0).toFloat()

        currentRotation = startRotation + (targetRotation - startRotation) * easedProgress

        if (progress >= 1f) {
            isSpinning = false
            currentRotation = targetRotation % WheelConfig.FULL_CIRCLE
        }

        return currentRotation
    }

    fun reset() {
        isSpinning = false
        elapsedTime = 0f
    }
}
