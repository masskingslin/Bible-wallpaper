package com.example.biblewallpapers.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.example.biblewallpapers.data.local.entity.WallpaperEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface WallpaperDao {
    @Query("SELECT * FROM wallpapers WHERE languageCode = :languageCode ORDER BY createdAt DESC")
    fun getWallpapersByLanguage(languageCode: String): Flow<List<WallpaperEntity>>

    @Query("SELECT * FROM wallpapers WHERE id = :id LIMIT 1")
    suspend fun getWallpaperById(id: String): WallpaperEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertWallpapers(wallpapers: List<WallpaperEntity>)

    @Query("DELETE FROM wallpapers")
    suspend fun clearAll()
}
