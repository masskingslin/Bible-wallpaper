package com.DK.biblewallpapers

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.DK.biblewallpapers.worker.AutoWallpaperScheduler

class BibleApp : Application() {
    override fun onCreate() {
        super.onCreate()
        try {
            MobileAds.initialize(this) {}
        } catch (_: Exception) {}

        // Schedule automatic 1-hour lock screen wallpaper rotation
        AutoWallpaperScheduler.scheduleHourlyLockScreenChange(this)
    }
}
