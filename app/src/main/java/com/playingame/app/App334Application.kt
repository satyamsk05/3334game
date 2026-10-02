package com.playingame.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache
import coil.util.DebugLogger
import com.playingame.app.data.remote.PromotionSyncService
import com.playingame.app.data.remote.RemoteApiClient
import com.playingame.app.data.repository.AuthRepository

open class BitArcadeApplication : Application(), ImageLoaderFactory {

    override fun onCreate() {
        super.onCreate()
        // Initialize repositories and API clients with application context
        RemoteApiClient.init(this)
        AuthRepository.init(this)
        PromotionSyncService.init(this)
    }

    override fun newImageLoader(): ImageLoader {
        return ImageLoader.Builder(this)
            .memoryCache {
                MemoryCache.Builder(this)
                    // Allocate at most 25% of available JVM heap for in-memory image bitmap caching
                    .maxSizePercent(0.25)
                    .build()
            }
            .diskCache {
                DiskCache.Builder()
                    // App-specific internal cache directory (no external storage permissions required)
                    .directory(cacheDir.resolve("image_cache"))
                    // 50 MB disk cache quota with automatic LRU eviction
                    .maxSizeBytes(50L * 1024 * 1024)
                    .build()
            }
            .okHttpClient {
                RemoteApiClient.client
            }
            .crossfade(true)
            .apply {
                if (applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE != 0) {
                    logger(DebugLogger())
                }
            }
            .build()
    }
}

class App334Application : BitArcadeApplication()

