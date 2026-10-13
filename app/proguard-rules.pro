# General ProGuard / R8 Rules
-ignorewarnings
-dontwarn **
-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod

# Jetpack Room & AndroidX
-keepclassmembers class * extends androidx.room.RoomDatabase {
    public void clearAllTables();
    <methods>;
}
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.**
-keep class androidx.compose.** { *; }

# Kotlinx Serialization & Coroutines
-dontwarn kotlinx.serialization.**
-keepclassmembers class * {
    *** Companion;
}
-keepclasseswithmembers class * {
    kotlinx.serialization.KSerializer serializer(...);
}

# Retrofit, OkHttp, Gson
-dontwarn retrofit2.**
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }
-keep class com.google.gson.** { *; }
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Play Billing
-keep class com.android.billingclient.api.** { *; }
-keep interface com.android.billingclient.api.** { *; }

# Coil 3
-keep class coil3.** { *; }
-dontwarn coil3.**
-keepclassmembers class * implements coil3.request.ImageRequest$Listener { *; }

# Google Mobile Ads
-keep public class com.google.android.gms.ads.** {
   public *;
}
-keep public class com.google.ads.** {
   public *;
}
-keepattributes *JavascriptInterface*

# Glance & WorkManager
-keep class * extends androidx.glance.appwidget.action.ActionCallback { *; }
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# Data Models & DTOs
-keepclassmembers class com.DK.biblewallpapers.** { *; }
-keep class com.DK.biblewallpapers.** { *; }

