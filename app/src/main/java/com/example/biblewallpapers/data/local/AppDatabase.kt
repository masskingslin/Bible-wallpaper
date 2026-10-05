package com.example.biblewallpapers.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.biblewallpapers.data.local.dao.WallpaperDao
import com.example.biblewallpapers.data.local.entity.WallpaperEntity

@Database(entities = [WallpaperEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun wallpaperDao(): WallpaperDao
}
