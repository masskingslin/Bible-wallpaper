package com.example.biblewallpapers

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.biblewallpapers.ui.feed.BibleWallpaperFeedScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
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
