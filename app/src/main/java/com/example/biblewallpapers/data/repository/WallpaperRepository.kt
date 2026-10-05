package com.example.biblewallpapers.data.repository

import com.example.biblewallpapers.data.local.dao.WallpaperDao
import com.example.biblewallpapers.data.local.entity.WallpaperEntity
import com.example.biblewallpapers.data.remote.BibleWallpaperApi
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class WallpaperRepository @Inject constructor(
    private val api: BibleWallpaperApi,
    private val dao: WallpaperDao
) {
    fun getLocalWallpapers(languageCode: String): Flow<List<WallpaperEntity>> =
        dao.getWallpapersByLanguage(languageCode)

    suspend fun refreshWallpapers(languageCode: String) {
        val dtos = api.fetchWallpapers(language = languageCode)
        val entities = dtos.map { dto ->
            WallpaperEntity(
                id = dto.id,
                imageUrl = dto.imageUrl,
                verseText = dto.verseText,
                verseReference = dto.verseReference,
                languageCode = dto.language,
                isPremium = dto.isPremium
            )
        }
        dao.upsertWallpapers(entities)
    }

    suspend fun getWallpaperById(id: String): WallpaperEntity? = dao.getWallpaperById(id)
}
