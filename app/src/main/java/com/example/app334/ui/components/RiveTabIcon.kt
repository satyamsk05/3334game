package com.example.app334.ui.components

import android.util.Log
import androidx.annotation.RawRes
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import app.rive.runtime.kotlin.RiveAnimationView
import app.rive.runtime.kotlin.core.Fit

@Composable
fun RiveTabIcon(
    @RawRes rawRes: Int,
    isSelected: Boolean,
    inputName: String,
    modifier: Modifier = Modifier,
    size: Dp = 32.dp,
    stateMachineName: String = "State Machine 1"
) {
    AndroidView(
        modifier = modifier.size(size),
        factory = { context ->
            RiveAnimationView(context).apply {
                isClickable = false
                isFocusable = false
                setRiveResource(
                    rawRes,
                    stateMachineName = stateMachineName,
                    autoplay = true,
                    fit = Fit.CONTAIN
                )
                try {
                    setBooleanState(stateMachineName, inputName, isSelected)
                } catch (e: Throwable) {
                    Log.e("RiveTabIcon", "Failed to set initial state for $inputName: ${e.message}")
                }
            }
        },
        update = { view ->
            try {
                view.setBooleanState(stateMachineName, inputName, isSelected)
            } catch (e: Throwable) {
                Log.e("RiveTabIcon", "Failed to update state for $inputName: ${e.message}")
            }
        }
    )
}

