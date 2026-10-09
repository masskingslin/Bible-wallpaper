package com.example.biblewallpapers

import android.app.Application
import com.google.android.gms.ads.MobileAds
import com.example.biblewallpapers.worker.AutoWallpaperScheduler
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class BibleApp : Application() {
    override fun onCreate() {
        super.onCreate()
        MobileAds.initialize(this) {}

        // Schedule automatic 1-hour lock screen wallpaper rotation
        AutoWallpaperScheduler.scheduleHourlyLockScreenChange(this)
    }
}
