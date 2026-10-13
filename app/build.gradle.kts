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

    val prodServerUrl = localProperties.getProperty("PROD_SERVER_URL")
        ?: System.getenv("PROD_SERVER_URL")
        ?: "http://3.7.73.109:5050"
    val devServerUrl = localProperties.getProperty("DEV_SERVER_URL")
        ?: System.getenv("DEV_SERVER_URL")
        ?: localProperties.getProperty("SERVER_URL")
        ?: "http://3.7.73.109:5050"

    val paymentGatewayUrl = localProperties.getProperty("PAYMENT_GATEWAY_URL")
        ?: System.getenv("PAYMENT_GATEWAY_URL")
        ?: prodServerUrl

    defaultConfig {
        applicationId = "com.playingame.app"
        minSdk = 24
        targetSdk = 34
        versionCode = 1
        versionName = "1.0"

        buildConfigField("String", "DEFAULT_SERVER_URL", "\"$devServerUrl\"")
        buildConfigField("String", "PAYMENT_GATEWAY_URL", "\"$paymentGatewayUrl\"")
        buildConfigField("String", "BUSINESS_SUPPORT_PHONE", "\"919989907408\"")

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
    implementation(platform(libs.firebase.bom))
    implementation(libs.firebase.messaging)
    implementation("app.rive:rive-android:8.1.3")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}
