package com.DK.biblewallpapers.data.repository

import com.DK.biblewallpapers.data.local.dao.WallpaperDao
import com.DK.biblewallpapers.data.local.entity.WallpaperEntity
import com.DK.biblewallpapers.data.remote.BibleWallpaperApi
import kotlinx.coroutines.flow.Flow

class WallpaperRepository(
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
