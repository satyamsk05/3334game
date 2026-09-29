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
    val targetRoute: String = "/games/xo",
    val gradientStart: String = "#5B1FA6",
    val gradientEnd: String = "#3B0764",
    val iconType: String = "welcome",
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

    // Default bundled fallback banners in case of cold start / offline
    private val defaultPromotions = listOf(
        ServerPromotion(
            id = "promo_welcome",
            title = "WELCOME BONUS",
            subtitle = "Claim 100% instant cash boost on your first deposit!",
            badgeText = "HOT",
            ctaText = "ADD CASH",
            targetRoute = "/wallet/deposit",
            gradientStart = "#5B1FA6",
            gradientEnd = "#3B0764",
            iconType = "welcome",
            displayOrder = 1
        ),
        ServerPromotion(
            id = "promo_xo_battle",
            title = "1v1 XO BATTLE",
            subtitle = "Play Live Tic-Tac-Toe battles with real cash prizes!",
            badgeText = "LIVE",
            ctaText = "PLAY NOW",
            targetRoute = "/games/xo",
            gradientStart = "#6D28D9",
            gradientEnd = "#2E1065",
            iconType = "xo",
            displayOrder = 2
        ),
        ServerPromotion(
            id = "promo_ring_future",
            title = "RING OF FUTURE",
            subtitle = "Spin the 32-segment wheel for up to 30x instant multiplier!",
            badgeText = "NEW",
            ctaText = "PLAY NOW",
            targetRoute = "/games/ring",
            gradientStart = "#0F766E",
            gradientEnd = "#042F2E",
            iconType = "ring",
            displayOrder = 3
        ),
        ServerPromotion(
            id = "promo_instant_cashout",
            title = "INSTANT CASHOUT",
            subtitle = "24/7 lightning fast UPI withdrawals directly to your bank account.",
            badgeText = "VIP",
            ctaText = "WITHDRAW",
            targetRoute = "/wallet/withdraw",
            gradientStart = "#9D174D",
            gradientEnd = "#500724",
            iconType = "wallet",
            displayOrder = 4
        )
    )

    private val _promotions = MutableStateFlow<List<ServerPromotion>>(defaultPromotions)
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
            fetchedList.add(
                ServerPromotion(
                    id = obj.optString("id", "promo_$i"),
                    title = obj.optString("title", ""),
                    subtitle = obj.optString("subtitle", ""),
                    badgeText = obj.optString("badge_text", "HOT"),
                    ctaText = obj.optString("cta_text", "PLAY NOW"),
                    targetRoute = obj.optString("target_route", "/games/xo"),
                    gradientStart = obj.optString("gradient_start", "#5B1FA6"),
                    gradientEnd = obj.optString("gradient_end", "#3B0764"),
                    iconType = obj.optString("icon_type", "welcome"),
                    displayOrder = obj.optInt("display_order", i + 1)
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
