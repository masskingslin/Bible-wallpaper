package com.example.biblewallpapers.worker

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.example.biblewallpapers.data.local.AppDatabase
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL

class AutoWallpaperWorker(
    private val context: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(context, workerParams) {

    companion object {
        const val TAG = "AutoWallpaperWorker"
        const val WORK_NAME = "hourly_lockscreen_wallpaper_worker"
        const val PREFS_NAME = "auto_wallpaper_prefs"
        const val KEY_LAST_WALLPAPER_INDEX = "last_wallpaper_index"
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "Starting hourly automatic lock screen wallpaper change...")

            // Retrieve wallpaper database or offline fallback list
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val lastIndex = prefs.getInt(KEY_LAST_WALLPAPER_INDEX, 0)

            // In offline or local mode, fetch from database or fallback curated set
            val wallpaperUrls = listOf(
                "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
                "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
                "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
                "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1080&q=80"
            )

            val nextIndex = (lastIndex + 1) % wallpaperUrls.size
            val targetUrl = wallpaperUrls[nextIndex]

            // Download or load image bitmap
            val bitmap = downloadBitmap(targetUrl) ?: return@withContext Result.retry()

            val wallpaperManager = WallpaperManager.getInstance(context)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                // Specifically change LOCK SCREEN wallpaper automatically
                wallpaperManager.setBitmap(
                    bitmap,
                    null,
                    true,
                    WallpaperManager.FLAG_LOCK
                )
                Log.d(TAG, "Successfully changed lock screen wallpaper (Index: $nextIndex)")
            } else {
                wallpaperManager.setBitmap(bitmap)
                Log.d(TAG, "Successfully changed system wallpaper (Index: $nextIndex)")
            }

            // Save new index
            prefs.edit().putInt(KEY_LAST_WALLPAPER_INDEX, nextIndex).apply()

            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "Error changing lock screen wallpaper", e)
            Result.retry()
        }
    }

    private fun downloadBitmap(urlString: String): Bitmap? {
        return try {
            val url = URL(urlString)
            val connection = url.openConnection() as HttpURLConnection
            connection.doInput = true
            connection.connectTimeout = 10000
            connection.readTimeout = 10000
            connection.connect()
            val input: InputStream = connection.inputStream
            BitmapFactory.decodeStream(input)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to download wallpaper bitmap", e)
            null
        }
    }
}
