package com.example.biblewallpapers.data.remote

import com.google.gson.annotations.SerializedName

data class WallpaperResponseDto(
    @SerializedName("id") val id: String,
    @SerializedName("imageUrl") val imageUrl: String,
    @SerializedName("verseText") val verseText: String,
    @SerializedName("verseReference") val verseReference: String,
    @SerializedName("language") val language: String,
    @SerializedName("isPremium") val isPremium: Boolean
)

data class SubscriptionVerifyRequest(
    @SerializedName("purchaseToken") val purchaseToken: String,
    @SerializedName("productId") val productId: String,
    @SerializedName("packageName") val packageName: String
)

data class SubscriptionVerifyResponse(
    @SerializedName("isValid") val isValid: Boolean,
    @SerializedName("expiryTimeMillis") val expiryTimeMillis: Long
)
