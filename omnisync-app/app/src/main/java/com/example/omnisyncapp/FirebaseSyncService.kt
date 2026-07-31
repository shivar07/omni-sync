package com.example.omnisyncapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class FirebaseSyncService : Service() {
    private val client = OkHttpClient()
    
    private val channelId = "omnisync_alerts"
    private val serviceChannelId = "omnisync_service_status"
    
    private var serviceJob: Job? = null
    private val serviceScope = CoroutineScope(Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        startForegroundService()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        if (serviceJob == null) {
            serviceJob = serviceScope.launch {
                while (isActive) {
                    try {
                        pollFirebaseNotifications()
                    } catch (e: Exception) {
                        e.printStackTrace()
                    }
                    delay(10000) // Poll every 10 seconds
                }
            }
        }
        return START_STICKY
    }

    private fun startForegroundService() {
        val notificationIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, notificationIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, serviceChannelId)
            .setContentTitle("OmniSync Sync Active")
            .setContentText("Listening to Firebase Realtime Database in background...")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(99, notification, android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
        } else {
            startForeground(99, notification)
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            
            // Alert Channel
            val alertChannel = NotificationChannel(
                channelId, "OmniSync Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Triggers system reminders for pending tasks and events"
            }
            notificationManager.createNotificationChannel(alertChannel)

            // Service Status Channel
            val serviceChannel = NotificationChannel(
                serviceChannelId, "OmniSync Service Status",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows the active listener status for OmniSync"
            }
            notificationManager.createNotificationChannel(serviceChannel)
        }
    }

    private suspend fun pollFirebaseNotifications() {
        val sharedPref = getSharedPreferences("OmniSyncPrefs", Context.MODE_PRIVATE)
        val uid = sharedPref.getString("saved_user_uid", null) ?: return // Stop polling if not paired yet
        
        // Check if pairing is still active on Firebase
        val userPairUrl = "https://guru-201bf-default-rtdb.firebaseio.com/user_sync_codes/$uid.json"
        val pairReq = Request.Builder().url(userPairUrl).build()
        client.newCall(pairReq).execute().use { pairRes ->
            val pairBody = pairRes.body?.string()
            if (pairBody == "null" || pairBody.isNullOrEmpty()) {
                // Device was unlinked from website! Clear preferences.
                sharedPref.edit().remove("saved_user_uid").remove("saved_sync_code").apply()
                return
            }
        }

        val dbUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users/$uid.json"
        val request = Request.Builder().url(dbUrl).build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return
            
            val body = response.body?.string() ?: return
            if (body == "null" || body.isEmpty()) return

            val userObj = JSONObject(body)
            
            // 1. Process standard pending notifications (same queue mechanism if open browser triggers it)
            val pendingNotifications = userObj.optJSONObject("pending_notifications")
            if (pendingNotifications != null) {
                val keys = pendingNotifications.keys()
                while (keys.hasNext()) {
                    val key = keys.next()
                    val notificationObj = pendingNotifications.getJSONObject(key)
                    val title = notificationObj.optString("title", "OmniSync Alert")
                    val message = notificationObj.optString("message", "Task deadline approaching!")
                    val type = notificationObj.optString("type", "")
                    val link = notificationObj.optString("link", "")
                    val notes = notificationObj.optString("notes", "")
                    
                    // Show notification to user
                    triggerSystemNotification(title, message, type, link, notes)
                    
                    // Delete from Firebase database to acknowledge delivery
                    deleteNotificationFromFirebase(uid, key)
                }
            }

            // 2. Scan all workspace nodes directly to support closed-tab reminders!
            scanNodeForReminders(uid, userObj, "applications", "reminderDate", "Application", "OmniSync Application Reminder", "Your reminder for \"{title}\" is due now!")
            scanNodeForReminders(uid, userObj, "meets", "startDate", "Google Meet", "Google Meet Starting: {title}", "Your meeting \"{title}\" is scheduled now!")
            scanNodeForReminders(uid, userObj, "generalMeets", "startDate", "General Meet", "Event Starting: {title}", "Your event \"{title}\" is scheduled now!")
            scanNodeForReminders(uid, userObj, "calendar", "startDate", "Calendar Event", "Calendar Event: {title}", "Event \"{title}\" is starting now!")
            scanNodeForReminders(uid, userObj, "pending", "", "Pending Task", "Pending Task Due: {title}", "Don't forget to complete \"{title}\"!")
        }
    }

    private fun scanNodeForReminders(
        uid: String,
        userObj: JSONObject,
        nodeName: String,
        dateField: String,
        typeLabel: String,
        titleTemplate: String,
        messageTemplate: String
    ) {
        android.util.Log.d("OmniSyncService", "Scanning node: $nodeName")
        val now = System.currentTimeMillis()
        val maxPastWindow = 60 * 60 * 1000 // 1 hour

        // Try parsing as array first
        val jsonArray = userObj.optJSONArray(nodeName)
        if (jsonArray != null) {
            android.util.Log.d("OmniSyncService", "Node $nodeName is array of size ${jsonArray.length()}")
            for (i in 0 until jsonArray.length()) {
                val item = jsonArray.optJSONObject(i) ?: continue
                checkAndTriggerItem(uid, nodeName, i.toString(), item, dateField, typeLabel, titleTemplate, messageTemplate, now, maxPastWindow)
            }
            return
        }

        // Fallback to object keys
        val jsonObj = userObj.optJSONObject(nodeName)
        if (jsonObj != null) {
            android.util.Log.d("OmniSyncService", "Node $nodeName is object")
            val keys = jsonObj.keys()
            while (keys.hasNext()) {
                val key = keys.next()
                val item = jsonObj.optJSONObject(key) ?: continue
                checkAndTriggerItem(uid, nodeName, key, item, dateField, typeLabel, titleTemplate, messageTemplate, now, maxPastWindow)
            }
            return
        }
        android.util.Log.d("OmniSyncService", "Node $nodeName is null/missing")
    }

    private fun checkAndTriggerItem(
        uid: String,
        nodeName: String,
        key: String,
        item: JSONObject,
        dateField: String,
        typeLabel: String,
        titleTemplate: String,
        messageTemplate: String,
        now: Long,
        maxPastWindow: Int
    ) {
        val title = item.optString("title", "No Title")
        val reminderTriggered = item.optBoolean("reminderTriggered", false)
        android.util.Log.d("OmniSyncService", "Checking item: $title, key: $key, reminderTriggered: $reminderTriggered")
        if (reminderTriggered) return

        // Skip completed pending tasks
        if (nodeName == "pending") {
            val status = item.optString("status", "")
            if (status.equals("Completed", ignoreCase = true)) return
        }

        var dateStr = ""
        if (nodeName == "pending") {
            dateStr = item.optString("dueDate", "")
            if (dateStr.isEmpty()) {
                dateStr = item.optString("deadline", "")
            }
            if (dateStr.isNotEmpty() && !dateStr.contains("T")) {
                dateStr = "${dateStr}T09:00"
            }
        } else {
            dateStr = item.optString(dateField, "")
        }
        android.util.Log.d("OmniSyncService", "Item dateStr: $dateStr")
        if (dateStr.isEmpty()) return

        val scheduledTimeMs = parseDateStringToMillis(dateStr)
        android.util.Log.d("OmniSyncService", "Parsed scheduledTimeMs: $scheduledTimeMs, now: $now")
        if (scheduledTimeMs == null) return
        val diffMs = now - scheduledTimeMs
        android.util.Log.d("OmniSyncService", "diffMs: $diffMs")

        if (diffMs >= 0) {
            android.util.Log.d("OmniSyncService", "Triggering notification for: $title")
            val link = item.optString("link", "")
            val notes = item.optString("notes", "")

            // Trigger notification
            triggerSystemNotification(
                titleTemplate.replace("{title}", title),
                messageTemplate.replace("{title}", title),
                typeLabel,
                link,
                notes
            )

            // Send ACK log
            sendAckLog(uid, key)

            // Mark triggered in Firebase
            markItemTriggered(uid, nodeName, key)
        }
    }

    private fun markItemTriggered(uid: String, nodeName: String, key: String) {
        val patchUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users/$uid/$nodeName/$key.json"
        val patchBody = "{\"reminderTriggered\": true}".toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val request = Request.Builder().url(patchUrl).patch(patchBody).build()
        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) { e.printStackTrace() }
            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) { response.close() }
        })
    }

    private fun sendAckLog(uid: String, key: String) {
        val ackUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users/$uid/delivered_acks/$key.json"
        val jsonPayload = "{\"deliveredAt\": ${System.currentTimeMillis()}, \"status\": \"DELIVERED\"}"
        val ackBody = jsonPayload.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val ackRequest = Request.Builder().url(ackUrl).put(ackBody).build()
        client.newCall(ackRequest).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) { e.printStackTrace() }
            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) { response.close() }
        })
    }

    private fun parseDateStringToMillis(dateStr: String): Long? {
        val formats = arrayOf(
            "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
            "yyyy-MM-dd'T'HH:mm:ss",
            "yyyy-MM-dd'T'HH:mm",
            "yyyy-MM-dd"
        )
        for (format in formats) {
            try {
                val sdf = SimpleDateFormat(format, Locale.US)
                if (format.endsWith("'Z'")) {
                    sdf.timeZone = TimeZone.getTimeZone("UTC")
                } else {
                    sdf.timeZone = TimeZone.getTimeZone("GMT+05:30")
                }
                val date = sdf.parse(dateStr)
                if (date != null) return date.time
            } catch (e: Exception) {
                // Try next format
            }
        }
        return null
    }

    private fun triggerSystemNotification(
        title: String,
        message: String,
        type: String?,
        link: String?,
        notes: String?
    ) {
        val notificationId = System.currentTimeMillis().toInt()

        // Select type-specific vector icon
        val iconRes = when {
            type?.contains("Google Meet", ignoreCase = true) == true -> R.drawable.ic_meet
            type?.contains("Meet", ignoreCase = true) == true || type?.contains("Calendar", ignoreCase = true) == true -> R.drawable.ic_event
            type?.contains("Application", ignoreCase = true) == true -> R.drawable.ic_briefcase
            type?.contains("Task", ignoreCase = true) == true -> R.drawable.ic_task
            else -> android.R.drawable.ic_dialog_info
        }

        // Create PendingIntent to open link in browser if present, otherwise open MainActivity
        val openIntent = if (!link.isNullOrEmpty()) {
            Intent(Intent.ACTION_VIEW, android.net.Uri.parse(link)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
        } else {
            Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            notificationId,
            openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        // Build clean body text without raw type brackets
        val fullContent = StringBuilder().apply {
            append(message)
            if (!notes.isNullOrEmpty()) {
                append("\n\nDetails: ").append(notes)
            }
            if (!link.isNullOrEmpty()) {
                append("\n\nLink: ").append(link)
            }
        }.toString()

        val builder = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(iconRes)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(fullContent))
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        // Add action button to open link directly from notification
        if (!link.isNullOrEmpty()) {
            builder.addAction(
                android.R.drawable.ic_menu_search,
                "Open Link",
                pendingIntent
            )
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(notificationId, builder.build())
    }

    private fun deleteNotificationFromFirebase(uid: String, key: String) {
        // Send ACK signal confirmation to Firebase RTDB
        val ackUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users/$uid/delivered_acks/$key.json"
        val jsonPayload = "{\"deliveredAt\": ${System.currentTimeMillis()}, \"status\": \"DELIVERED\"}"
        val ackBody = jsonPayload.toRequestBody("application/json; charset=utf-8".toMediaTypeOrNull())
        val ackRequest = Request.Builder().url(ackUrl).put(ackBody).build()
        client.newCall(ackRequest).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) { e.printStackTrace() }
            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) { response.close() }
        })

        // Delete from pending_notifications queue
        val deleteUrl = "https://guru-201bf-default-rtdb.firebaseio.com/users/$uid/pending_notifications/$key.json"
        val request = Request.Builder()
            .url(deleteUrl)
            .delete()
            .build()
        
        client.newCall(request).enqueue(object : okhttp3.Callback {
            override fun onFailure(call: okhttp3.Call, e: IOException) {
                e.printStackTrace()
            }
            override fun onResponse(call: okhttp3.Call, response: okhttp3.Response) {
                response.close()
            }
        })
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceJob?.cancel()
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}
