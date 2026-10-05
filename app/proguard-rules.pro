-keepattributes *Annotation*, Signature, InnerClasses, EnclosingMethod

# Jetpack Room
-keepclassmembers class * extends androidx.room.RoomDatabase {
    public void clearAllTables();
    <methods>;
}
-keep class * extends androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**

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
