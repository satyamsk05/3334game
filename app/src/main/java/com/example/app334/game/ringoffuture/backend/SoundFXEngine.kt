package com.example.app334.game.ringoffuture.backend

import android.media.AudioManager
import android.media.ToneGenerator
import android.util.Log

object SoundFXEngine {

    private const val TAG = "SoundFXEngine"
    private var toneGenerator: ToneGenerator? = null
    var isMuted: Boolean = false

    init {
        try {
            toneGenerator = ToneGenerator(AudioManager.STREAM_MUSIC, 70)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to initialize ToneGenerator: ${e.message}")
        }
    }

    fun playTick() {
        if (isMuted) return
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_BEEP, 30)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing tick tone: ${e.message}")
        }
    }

    fun playWinSound() {
        if (isMuted) return
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_CDMA_ALERT_CALL_GUARD, 200)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing win tone: ${e.message}")
        }
    }

    fun playChipClick() {
        if (isMuted) return
        try {
            toneGenerator?.startTone(ToneGenerator.TONE_PROP_ACK, 25)
        } catch (e: Exception) {
            Log.e(TAG, "Error playing chip click tone: ${e.message}")
        }
    }

    fun release() {
        toneGenerator?.release()
        toneGenerator = null
    }
}
