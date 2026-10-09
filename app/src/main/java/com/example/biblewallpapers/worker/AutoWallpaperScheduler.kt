package com.example.biblewallpapers.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object AutoWallpaperScheduler {

    /**
     * Schedules automatic 1-hour rotation of the lock screen wallpaper.
     * Uses WorkManager PeriodicWorkRequestBuilder with 1-hour interval.
     */
    fun scheduleHourlyLockScreenChange(context: Context) {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()

        // 1 hour periodic interval
        val hourlyWorkRequest = PeriodicWorkRequestBuilder<AutoWallpaperWorker>(
            1, TimeUnit.HOURS,
            15, TimeUnit.MINUTES // Flex interval for system power efficiency
        )
            .setConstraints(constraints)
            .addTag("auto_lockscreen_wallpaper")
            .build()

        WorkManager.getInstance(context).enqueueUniquePeriodicWork(
            AutoWallpaperWorker.WORK_NAME,
            ExistingPeriodicWorkPolicy.UPDATE,
            hourlyWorkRequest
        )
    }

    /**
     * Cancels the automatic lock screen wallpaper change schedule.
     */
    fun cancelHourlyLockScreenChange(context: Context) {
        WorkManager.getInstance(context).cancelUniqueWork(AutoWallpaperWorker.WORK_NAME)
    }
}
