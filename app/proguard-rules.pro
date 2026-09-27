# Add project specific ProGuard rules here.

# ---- Jetpack Compose ----
-keep class androidx.compose.** { *; }
-dontwarn androidx.compose.**

# ---- Kotlin Coroutines ----
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}
-keepclassmembernames class kotlinx.** {
    volatile <fields>;
}
-dontwarn kotlinx.coroutines.**

# ---- Kotlin Metadata ----
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# ---- Data / Model classes (keep for StateFlow) ----
-keep class com.playingame.app.game.ringoffuture.model.** { *; }
-keep class com.playingame.app.game.ringoffuture.backend.WalletBalance { *; }
-keep class com.playingame.app.game.ringoffuture.backend.WalletTransaction { *; }
-keep class com.playingame.app.game.ringoffuture.backend.UserProfile { *; }

# ---- Android standard ----
-keepattributes SourceFile,LineNumberTable
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application
