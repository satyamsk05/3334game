package com.playingame.app.data.remote

import android.util.Log
import com.playingame.app.core.config.ClientConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONArray
import org.json.JSONObject
import java.util.concurrent.TimeUnit

data class ServerPromotion(
    val id: String,
    val title: String,
    val subtitle: String,
    val badgeText: String = "HOT",
    val ctaText: String = "PLAY NOW",
    val targetRoute: String = "/wallet/deposit",
    val gradientStart: String = "#5B1FA6",
    val gradientEnd: String = "#3B0764",
    val iconType: String = "welcome",
    val imageUrl: String = "",
    val displayOrder: Int = 1
)

/**
 * PromotionSyncService - 100% Server-Driven App Hero Banners
 * Fetches real-time promotions from EC2 Backend API (/promotions/active)
 * and provides reactive StateFlow to HomeScreen.
 */
object PromotionSyncService {

    private const val TAG = "PromotionSyncService"
    private val httpClient get() = RemoteApiClient.client

    private const val PREFS_PROMOTIONS_CACHE = "app334_promotions_cache"
    private const val KEY_CACHED_PROMOTIONS = "cached_promotions_json"
    private var appContext: android.content.Context? = null

    // Dynamic server-driven promotions list (populated live from backend API)
    private val _promotions = MutableStateFlow<List<ServerPromotion>>(emptyList())
    val promotions: StateFlow<List<ServerPromotion>> = _promotions.asStateFlow()

    fun init(context: android.content.Context) {
        appContext = context.applicationContext
        loadCachedPromotions()
    }

    private fun loadCachedPromotions() {
        val ctx = appContext ?: return
        try {
            val prefs = ctx.getSharedPreferences(PREFS_PROMOTIONS_CACHE, android.content.Context.MODE_PRIVATE)
            val cachedJson = prefs.getString(KEY_CACHED_PROMOTIONS, null) ?: return
            val list = parsePromotionsJson(cachedJson)
            if (list.isNotEmpty()) {
                _promotions.value = list.sortedBy { it.displayOrder }
                Log.d(TAG, "Loaded ${list.size} cached promotions from app-specific storage")
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to load cached promotions from disk: ${e.message}")
        }
    }

    private fun parsePromotionsJson(jsonString: String): List<ServerPromotion> {
        val json = JSONObject(jsonString)
        val dataArray = json.optJSONArray("data") ?: JSONArray()
        val fetchedList = mutableListOf<ServerPromotion>()
        for (i in 0 until dataArray.length()) {
            val obj = dataArray.getJSONObject(i)
            val badge = obj.optString("badgeText").ifEmpty { obj.optString("badge_text", "HOT") }
            val cta = obj.optString("ctaText").ifEmpty { obj.optString("cta_text", "PLAY NOW") }
            val route = obj.optString("targetRoute").ifEmpty { obj.optString("target_route", "/wallet/deposit") }
            val gStart = obj.optString("gradientStart").ifEmpty { obj.optString("gradient_start", "#5B1FA6") }
            val gEnd = obj.optString("gradientEnd").ifEmpty { obj.optString("gradient_end", "#3B0764") }
            val icon = obj.optString("iconType").ifEmpty { obj.optString("icon_type", "welcome") }
            val imgUrl = obj.optString("imageUrl").ifEmpty { obj.optString("image_url", "") }
            val order = if (obj.has("displayOrder")) obj.optInt("displayOrder", i + 1) else obj.optInt("display_order", i + 1)

            fetchedList.add(
                ServerPromotion(
                    id = obj.optString("id", "promo_$i"),
                    title = obj.optString("title", ""),
                    subtitle = obj.optString("subtitle", ""),
                    badgeText = badge,
                    ctaText = cta,
                    targetRoute = route,
                    gradientStart = gStart,
                    gradientEnd = gEnd,
                    iconType = icon,
                    imageUrl = imgUrl,
                    displayOrder = order
                )
            )
        }
        return fetchedList
    }

    /**
     * Fetches active promotions from backend server asynchronously
     */
    suspend fun fetchActivePromotions(): Boolean = withContext(Dispatchers.IO) {
        if (!ClientConfig.IS_REMOTE_SERVER_ENABLED) return@withContext false

        try {
            val url = "${ClientConfig.API_BASE_URL}/promotions/active"
            val request = Request.Builder().url(url).get().build()

            val response = httpClient.newCall(request).execute()
            if (!response.isSuccessful) {
                Log.w(TAG, "Promotions fetch HTTP error: ${response.code}")
                return@withContext false
            }

            val body = response.body?.string() ?: return@withContext false
            val fetchedList = parsePromotionsJson(body)

            if (fetchedList.isNotEmpty()) {
                val sorted = fetchedList.sortedBy { it.displayOrder }
                _promotions.value = sorted
                // Persist latest valid promotions to app-specific disk cache for offline launch
                appContext?.getSharedPreferences(PREFS_PROMOTIONS_CACHE, android.content.Context.MODE_PRIVATE)
                    ?.edit()
                    ?.putString(KEY_CACHED_PROMOTIONS, body)
                    ?.apply()
                Log.d(TAG, "Successfully synced and cached ${sorted.size} dynamic promotions")
                return@withContext true
            }

            return@withContext false
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching promotions: ${e.message}")
            return@withContext false
        }
    }
}
