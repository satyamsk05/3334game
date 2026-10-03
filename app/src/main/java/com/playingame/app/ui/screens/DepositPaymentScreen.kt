package com.playingame.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.playingame.app.core.config.ClientConfig
import com.playingame.app.core.session.SessionManager
import com.playingame.app.ui.theme.AppBackground

import android.widget.Toast
import com.playingame.app.data.remote.RemoteApiClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.net.URLEncoder

@Composable
fun DepositPaymentScreen(
    amountRupees: Double = 100.0,
    onBackClick: () -> Unit = {}
) {
    val context = LocalContext.current

    LaunchedEffect(amountRupees) {
        val sessionToken = SessionManager.authToken()
        if (sessionToken.isNullOrBlank()) {
            Toast.makeText(context, "Please sign in to deposit", Toast.LENGTH_SHORT).show()
            onBackClick()
            return@LaunchedEffect
        }

        Toast.makeText(context, "Redirecting to payment gateway...", Toast.LENGTH_SHORT).show()
        kotlinx.coroutines.CoroutineScope(Dispatchers.IO).launch {
            val paymentUrl = try {
                val url = "${ClientConfig.API_BASE_URL}/deposits/initiate"
                val jsonBody = JSONObject().apply {
                    put("amountRupees", amountRupees)
                }
                val req = Request.Builder()
                    .url(url)
                    .header("Authorization", "Bearer $sessionToken")
                    .header("Content-Type", "application/json")
                    .post(jsonBody.toString().toRequestBody("application/json".toMediaTypeOrNull()))
                    .build()
                val resp = RemoteApiClient.client.newCall(req).execute()
                val respStr = resp.body?.string() ?: ""
                val respJson = JSONObject(respStr)
                val dataObj = respJson.optJSONObject("data")
                val candidateUrl = dataObj?.optString("paymentUrl")?.takeIf { it.isNotBlank() }
                    ?: dataObj?.optString("payUrl")?.takeIf { it.isNotBlank() }

                if (!candidateUrl.isNullOrBlank()) {
                    if (candidateUrl.startsWith("http://") || candidateUrl.startsWith("https://")) {
                        candidateUrl
                    } else {
                        val path = if (candidateUrl.startsWith("/")) candidateUrl else "/$candidateUrl"
                        "${ClientConfig.PAYMENT_GATEWAY_URL}$path"
                    }
                } else {
                    null
                }
            } catch (_: Exception) {
                null
            } ?: run {
                val encodedToken = URLEncoder.encode(sessionToken, "UTF-8")
                "${ClientConfig.PAYMENT_GATEWAY_URL}/pay?token=$encodedToken&amount=${amountRupees.toInt()}"
            }

            withContext(Dispatchers.Main) {
                try {
                    val intent = Intent(Intent.ACTION_VIEW, Uri.parse(paymentUrl)).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(intent)
                } catch (e: Exception) {
                    Toast.makeText(context, "Unable to open browser: ${e.message}", Toast.LENGTH_SHORT).show()
                }
                onBackClick()
            }
        }
    }

    BackHandler {
        onBackClick()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                androidx.compose.ui.graphics.Brush.verticalGradient(
                    listOf(Color(0xFF130924), Color(0xFF090412))
                )
            ),
        contentAlignment = Alignment.Center
    ) {
        CircularProgressIndicator(
            color = Color(0xFFA78BFA),
            modifier = Modifier.size(36.dp)
        )
    }
}
