import java.util.Properties

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.google.services)
}

val localProperties = Properties()
val localPropertiesFile = rootProject.file("local.properties")
if (localPropertiesFile.exists()) {
    localPropertiesFile.inputStream().use { localProperties.load(it) }
}

android {
    namespace = "com.playingame.app"
    compileSdk = 34

    // Live HTTPS domain with valid Let's Encrypt SSL
    val prodServerUrl = localProperties.getProperty("PROD_SERVER_URL")
        ?: System.getenv("PROD_SERVER_URL")
        ?: "https://bitarcade.duckdns.org"
    val devServerUrl = localProperties.getProperty("DEV_SERVER_URL")
        ?: System.getenv("DEV_SERVER_URL")
        ?: localProperties.getProperty("SERVER_URL")
        ?: "https://bitarcade.duckdns.org"

    val paymentGatewayUrl = localProperties.getProperty("PAYMENT_GATEWAY_URL")
        ?: System.getenv("PAYMENT_GATEWAY_URL")
        ?: "https://bitarcade.duckdns.org"

    // Fix Audit 1.4: Make business support phone configurable via properties or environment
    val businessSupportPhone = localProperties.getProperty("BUSINESS_SUPPORT_PHONE")
        ?: System.getenv("BUSINESS_SUPPORT_PHONE")
        ?: "919989907408"

    // Fix Audit 4.1: Compute dynamic versionCode so release updates can monotonically increment
    val computedVersionCode = localProperties.getProperty("VERSION_CODE")?.toIntOrNull()
        ?: System.getenv("BUILD_NUMBER")?.toIntOrNull()
        ?: (System.currentTimeMillis() / 86400000).toInt()

    defaultConfig {
        applicationId = "com.playingame.app"
        // Fix Audit 4.5: minSdk 26 for modern secure APIs and encryption support
        minSdk = 26
        targetSdk = 34
        versionCode = computedVersionCode
        versionName = "1.0"

        buildConfigField("String", "DEFAULT_SERVER_URL", "\"$devServerUrl\"")
        buildConfigField("String", "PAYMENT_GATEWAY_URL", "\"$paymentGatewayUrl\"")
        buildConfigField("String", "BUSINESS_SUPPORT_PHONE", "\"$businessSupportPhone\"")

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        debug {
            buildConfigField("String", "DEFAULT_SERVER_URL", "\"$devServerUrl\"")
            buildConfigField("String", "PAYMENT_GATEWAY_URL", "\"$paymentGatewayUrl\"")
        }
        release {
            buildConfigField("String", "DEFAULT_SERVER_URL", "\"$prodServerUrl\"")
            buildConfigField("String", "PAYMENT_GATEWAY_URL", "\"$paymentGatewayUrl\"")
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {
    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.coil.compose)
    implementation(libs.coil.gif)
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
    implementation("app.rive:rive-android:8.1.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    // Fix Audit 4.3: Use stable security-crypto release instead of alpha
    implementation("androidx.security:security-crypto:1.0.0")
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
