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

# ---- Android standard ----
-keepattributes SourceFile,LineNumberTable
-keep public class * extends android.app.Activity
-keep public class * extends android.app.Application

# ---- Rive Animation Runtime (Native JNI & Reflection) ----
-keep class app.rive.runtime.kotlin.** { *; }
-keep interface app.rive.runtime.kotlin.** { *; }
-dontwarn app.rive.runtime.kotlin.**

# ---- OkHttp & Okio ----
-keepattributes Signature
-keepattributes *Annotation*
-keepclassmembers class okhttp3.internal.publicsuffix.PublicSuffixDatabase {
    java.util.concurrent.atomic.AtomicBoolean INITIALIZED;
}
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn javax.annotation.**
-dontwarn org.conscrypt.**

# ---- Firebase Messaging & Google Services ----
-keep class com.google.firebase.** { *; }
-dontwarn com.google.firebase.**

# ---- BitArcade App Models & Session ----
-keep class com.playingame.app.data.** { *; }
-keep class com.playingame.app.core.session.** { *; }
-keep class com.playingame.app.data.repository.** { *; }
