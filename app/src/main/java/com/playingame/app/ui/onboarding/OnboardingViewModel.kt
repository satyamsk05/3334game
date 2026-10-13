package com.playingame.app.ui.onboarding

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class OnboardingViewModel(application: Application) : AndroidViewModel(application) {

    private val _isCompleted = MutableStateFlow(
        OnboardingPreferences.isOnboardingCompleted(application)
    )
    val isCompleted: StateFlow<Boolean> = _isCompleted.asStateFlow()

    private val _currentPage = MutableStateFlow(0)
    val currentPage: StateFlow<Int> = _currentPage.asStateFlow()

    fun setCurrentPage(page: Int) {
        _currentPage.value = page
    }

    fun completeOnboarding() {
        OnboardingPreferences.setOnboardingCompleted(getApplication(), true)
        _isCompleted.value = true
    }
}
