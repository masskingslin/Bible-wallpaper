package com.example.biblewallpapers.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "wallpapers")
data class WallpaperEntity(
    @PrimaryKey val id: String,
    val imageUrl: String,
    val verseText: String,
    val verseReference: String,
    val languageCode: String,
    val isPremium: Boolean,
    val createdAt: Long = System.currentTimeMillis()
)
