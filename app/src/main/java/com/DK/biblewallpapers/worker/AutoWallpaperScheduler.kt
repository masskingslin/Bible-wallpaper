package com.DK.biblewallpapers.worker

import android.content.Context
import androidx.work.Constraints
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.NetworkType
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import java.util.concurrent.TimeUnit

object AutoWallpaperScheduler {

    /**
     * Schedules automatic rotation of the lock screen wallpaper.
     * Uses WorkManager PeriodicWorkRequestBuilder with battery constraints and adaptive cadence.
     */
    fun scheduleHourlyLockScreenChange(
        context: Context,
        intervalHours: Long = 1,
        requiresCharging: Boolean = false,
        requiresBatteryNotLow: Boolean = true
    ) {
        val constraints = Constraints.Builder()
            .setRequiresBatteryNotLow(requiresBatteryNotLow)
            .setRequiresCharging(requiresCharging)
            .build()

        // Adaptive periodic interval with flex interval for system power efficiency
        val hourlyWorkRequest = PeriodicWorkRequestBuilder<AutoWallpaperWorker>(
            intervalHours, TimeUnit.HOURS,
            15, TimeUnit.MINUTES
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
