package com.DK.biblewallpapers

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.DK.biblewallpapers.ui.feed.BibleWallpaperFeedScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Surface {
                    val navController = rememberNavController()
                    NavHost(navController = navController, startDestination = "feed") {
                        composable("feed") {
                            BibleWallpaperFeedScreen(
                                onNavigateToPreview = { id ->
                                    navController.navigate("preview/$id")
                                }
                            )
                        }
                    }
                }
            }
        }
    }
}
