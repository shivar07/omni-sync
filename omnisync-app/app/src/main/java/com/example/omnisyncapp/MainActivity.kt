package com.example.omnisyncapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.content.SharedPreferences
import android.content.pm.PackageManager
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.runtime.getValue
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import com.example.omnisyncapp.theme.OmniSyncAppTheme
import com.example.omnisyncapp.ui.main.MainScreenContent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import okhttp3.MediaType.Companion.toMediaType
import org.json.JSONObject

class MainActivity : ComponentActivity() {
    private val channelId = "omnisync_alerts"

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted: Boolean ->
        // Permission callback
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        createNotificationChannel()
        checkNotificationPermission()

        // Read saved user uid from SharedPreferences
        val sharedPref = getSharedPreferences("OmniSyncPrefs", Context.MODE_PRIVATE)
        var initialUid = sharedPref.getString("saved_user_uid", null)

        enableEdgeToEdge()
        setContent {
            OmniSyncAppTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    var savedUid by remember { mutableStateOf(initialUid) }

                    DisposableEffect(Unit) {
                        val listener = SharedPreferences.OnSharedPreferenceChangeListener { prefs, key ->
                            if (key == "saved_user_uid") {
                                savedUid = prefs.getString("saved_user_uid", null)
                                if (savedUid == null) {
                                    stopSyncService()
                                }
                            }
                        }
                        sharedPref.registerOnSharedPreferenceChangeListener(listener)
                        onDispose {
                            sharedPref.unregisterOnSharedPreferenceChangeListener(listener)
                        }
                    }

                    if (savedUid != null) {
                        // Start polling service
                        startSyncService()

                        MainScreenContent(
                            uid = savedUid!!,
                            onSendNotification = { title, message ->
                                sendNotification(title, message)
                            },
                            onDisconnect = {
                                unpairDevice(savedUid!!) {
                                    stopSyncService()
                                    sharedPref.edit()
                                        .remove("saved_user_uid")
                                        .remove("saved_sync_code")
                                        .apply()
                                    savedUid = null
                                }
                            }
                        )
                    } else {
                        SyncCodeScreen(
                            onVerify = { code, onSuccess, onError ->
                                verifySyncCode(code, onSuccess, onError)
                            },
                            onSuccess = { uid ->
                                savedUid = uid
                            }
                        )
                    }
                }
            }
        }
    }

    private fun checkNotificationPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(
                    this,
                    android.Manifest.permission.POST_NOTIFICATIONS
                ) != PackageManager.PERMISSION_GRANTED
            ) {
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "OmniSync Reminders"
            val descriptionText = "Triggers system reminders for pending tasks and events"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(channelId, name, importance).apply {
                description = descriptionText
            }
            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun sendNotification(title: String, message: String) {
        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)

        val notificationManager: NotificationManager =
            getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(1, builder.build())
    }

    private fun startSyncService() {
        val intent = Intent(this, FirebaseSyncService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun stopSyncService() {
        val intent = Intent(this, FirebaseSyncService::class.java)
        stopService(intent)
    }

    private fun unpairDevice(uid: String, onComplete: () -> Unit) {
        val sharedPref = getSharedPreferences("OmniSyncPrefs", Context.MODE_PRIVATE)
        val code = sharedPref.getString("saved_sync_code", null)
        val client = OkHttpClient()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                if (!code.isNullOrEmpty()) {
                    val codeUrl = "https://omnisync-64ec6-default-rtdb.firebaseio.com/sync_codes/$code.json"
                    val patchBody = JSONObject().apply {
                        put("status", "disconnected")
                        put("deviceId", "")
                    }.toString()
                    val request = Request.Builder()
                        .url(codeUrl)
                        .patch(patchBody.toRequestBody("application/json".toMediaType()))
                        .build()
                    client.newCall(request).execute().close()
                }

                val userCodeUrl = "https://omnisync-64ec6-default-rtdb.firebaseio.com/user_sync_codes/$uid.json"
                val delRequest = Request.Builder().url(userCodeUrl).delete().build()
                client.newCall(delRequest).execute().close()

            } catch (e: Exception) {
                e.printStackTrace()
            } finally {
                withContext(Dispatchers.Main) {
                    onComplete()
                }
            }
        }
    }

    private fun verifySyncCode(
        code: String,
        onSuccess: (String) -> Unit,
        onError: (String) -> Unit
    ) {
        val client = OkHttpClient()
        val url = "https://omnisync-64ec6-default-rtdb.firebaseio.com/sync_codes/$code.json"

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val request = Request.Builder().url(url).build()
                client.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        withContext(Dispatchers.Main) {
                            onError("Server error: ${response.code}")
                        }
                        return@launch
                    }

                    val body = response.body?.string()
                    if (body == "null" || body.isNullOrEmpty()) {
                        withContext(Dispatchers.Main) {
                            onError("Invalid sync code.")
                        }
                        return@launch
                    }

                    val json = JSONObject(body)
                    val status = json.optString("status", "")
                    val uid = json.optString("uid", "")

                    if (uid.isEmpty()) {
                        withContext(Dispatchers.Main) {
                            onError("Invalid sync code format.")
                        }
                        return@launch
                    }

                    if (status != "pending") {
                        withContext(Dispatchers.Main) {
                            onError("This code has already been used.")
                        }
                        return@launch
                    }

                    // Code is valid and pending! Link the device.
                    val deviceId = Settings.Secure.getString(contentResolver, Settings.Secure.ANDROID_ID)

                    // Update sync code status in Firebase to "connected" and save deviceId
                    val patchUrl = "https://omnisync-64ec6-default-rtdb.firebaseio.com/sync_codes/$code.json"
                    val patchBody = JSONObject().apply {
                        put("status", "connected")
                        put("deviceId", deviceId)
                    }.toString()

                    val patchRequest = Request.Builder()
                        .url(patchUrl)
                        .patch(patchBody.toRequestBody("application/json".toMediaType()))
                        .build()

                    client.newCall(patchRequest).execute().use { patchResponse ->
                        if (!patchResponse.isSuccessful) {
                            withContext(Dispatchers.Main) {
                                onError("Failed to update pairing status on server.")
                            }
                            return@launch
                        }
                    }

                    // Success! Save to SharedPreferences on Main thread
                    withContext(Dispatchers.Main) {
                        val sharedPref = getSharedPreferences("OmniSyncPrefs", Context.MODE_PRIVATE)
                        sharedPref.edit()
                            .putString("saved_user_uid", uid)
                            .putString("saved_sync_code", code)
                            .apply()
                        onSuccess(uid)
                    }
                }
            } catch (e: Exception) {
                e.printStackTrace()
                withContext(Dispatchers.Main) {
                    onError("Network error: ${e.message}")
                }
            }
        }
    }
}

@Composable
fun SyncCodeScreen(
    onVerify: (String, (String) -> Unit, (String) -> Unit) -> Unit,
    onSuccess: (String) -> Unit
) {
    var code by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorText by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Link Companion App",
            fontSize = 26.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF3B82F6)
        )

        Text(
            text = "Enter the 6-digit synchronization code from the settings panel on your website to connect your phone.",
            fontSize = 14.sp,
            color = Color.Gray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(top = 8.dp, bottom = 32.dp)
        )

        OutlinedTextField(
            value = code,
            onValueChange = { input ->
                if (input.length <= 6 && input.all { it.isDigit() }) {
                    code = input
                    errorText = ""
                }
            },
            label = { Text("6-Digit Code") },
            placeholder = { Text("e.g. 123456") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = androidx.compose.ui.text.input.KeyboardType.Number
            )
        )

        if (errorText.isNotEmpty()) {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = errorText,
                color = Color.Red,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        if (isLoading) {
            CircularProgressIndicator(
                color = Color(0xFF3B82F6)
            )
        } else {
            Button(
                onClick = {
                    if (code.length != 6) {
                        errorText = "Please enter a valid 6-digit code."
                        return@Button
                    }
                    isLoading = true
                    onVerify(code, { uid ->
                        isLoading = false
                        onSuccess(uid)
                    }, { error ->
                        isLoading = false
                        errorText = error
                    })
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF3B82F6)
                )
            ) {
                Text(
                    text = "Verify & Connect",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp
                )
            }
        }
    }
}
