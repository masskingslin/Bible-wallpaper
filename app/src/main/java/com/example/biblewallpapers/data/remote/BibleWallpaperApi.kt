package com.example.biblewallpapers.data.remote

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Query

interface BibleWallpaperApi {
    @GET("api/wallpapers")
    suspend fun fetchWallpapers(
        @Query("language") language: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): List<WallpaperResponseDto>

    @POST("api/verify-subscription")
    suspend fun verifySubscription(
        @Body request: SubscriptionVerifyRequest
    ): SubscriptionVerifyResponse
}
