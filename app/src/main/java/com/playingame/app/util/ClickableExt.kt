package com.playingame.app.util

import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed

/**
 * Clickable modifier without ugly rectangular grey boxes, ripples, or touch highlights.
 * Essential for gaming UI, pills, chips, avatars, custom icons, and capsules.
 */
fun Modifier.noRippleClickable(
    enabled: Boolean = true,
    onClick: () -> Unit
): Modifier = composed {
    this.clickable(
        enabled = enabled,
        interactionSource = remember { MutableInteractionSource() },
        indication = null
    ) {
        onClick()
    }
}
