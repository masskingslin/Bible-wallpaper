package com.DK.biblewallpapers.ui.feed

import android.app.WallpaperManager
import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.ColorMatrixColorFilter
import android.graphics.Paint
import android.graphics.drawable.BitmapDrawable
import android.os.Build
import android.speech.tts.TextToSpeech
import android.widget.Toast
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FormatQuote
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.RadioButtonUnchecked
import androidx.compose.material.icons.filled.Share
import androidx.compose.material.icons.filled.Shuffle
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material.icons.filled.Wallpaper
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ColorFilter
import androidx.compose.ui.graphics.ColorMatrix
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalHapticFeedback
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil3.compose.AsyncImage
import coil3.imageLoader
import coil3.request.ImageRequest
import coil3.request.SuccessResult
import com.DK.biblewallpapers.domain.model.AppLanguage
import com.DK.biblewallpapers.util.AppHapticType
import com.DK.biblewallpapers.util.HapticUtil
import kotlinx.coroutines.Dispatchers
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.graphics.Brush
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.util.Locale

enum class ScriptureFontTheme(val displayName: String, val fontFamily: FontFamily, val isItalic: Boolean) {
    SERIF("Serif", FontFamily.Serif, true),
    SANS("Sans", FontFamily.SansSerif, false),
    CURSIVE("Script", FontFamily.Cursive, false),
    MONOSPACE("Classic", FontFamily.Monospace, false)
}

enum class WallpaperFadeMode(val displayName: String, val subtitle: String) {
    NONE("Natural", "No Fade"),
    SOFT("Vignette", "Soft Edge"),
    DEEP("Cinematic", "Top/Bottom")
}

enum class WallpaperFilter(val displayName: String, val subtitle: String) {
    ORIGINAL("Original", "Color"),
    GRAYSCALE("Grayscale", "B&W"),
    SEPIA("Sepia", "Warm")
}

data class WallpaperItem(
    val id: String,
    val imageUrl: String,
    val verseText: String,
    val verseReference: String,
    val language: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BibleWallpaperFeedScreen(
    onNavigateToPreview: (String) -> Unit = {}
) {
    val context = LocalContext.current
    val haptic = LocalHapticFeedback.current
    val coroutineScope = rememberCoroutineScope()
    var selectedLanguage by remember { mutableStateOf(AppLanguage.ENGLISH) }
    var languageDropdownExpanded by remember { mutableStateOf(false) }
    var previewItem by remember { mutableStateOf<WallpaperItem?>(null) }
    var isSettingWallpaper by remember { mutableStateOf(false) }
    
    // Bookmarks and Bulk Selection State
    var bookmarkedIds by remember { mutableStateOf(setOf<String>()) }
    var selectionMode by remember { mutableStateOf(false) }
    var selectedIds by remember { mutableStateOf(setOf<String>()) }

    // TTS Setup
    var tts by remember { mutableStateOf<TextToSpeech?>(null) }
    DisposableEffect(Unit) {
        val speech = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                // Initialized
            }
        }
        tts = speech
        onDispose {
            speech.stop()
            speech.shutdown()
        }
    }

    // Sample Curated Scripture Wallpapers across languages
    val wallpapers = remember(selectedLanguage) {
        when (selectedLanguage) {
            AppLanguage.TAMIL -> listOf(
                WallpaperItem(
                    id = "ta-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "கர்த்தர் என் வெளிச்சமும் என் இரட்சிப்புமானவர், யாருக்குப் பயப்படுவேன்?",
                    verseReference = "சங்கீதம் 27:1",
                    language = "ta"
                ),
                WallpaperItem(
                    id = "ta-2",
                    imageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
                    verseText = "கர்த்தர் என் மேய்ப்பராயிருக்கிறார்; நான் தாழ்ச்சியடையேன்.",
                    verseReference = "சங்கீதம் 23:1",
                    language = "ta"
                ),
                WallpaperItem(
                    id = "ta-3",
                    imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
                    verseText = "என்னைப் பெலப்படுத்துகிற கிறிஸ்துவினாலே எல்லாவற்றையுஞ்செய்ய எனக்குப் பெலனுண்டு.",
                    verseReference = "பிலிப்பியர் 4:13",
                    language = "ta"
                ),
                WallpaperItem(
                    id = "ta-4",
                    imageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
                    verseText = "அமர்ந்திருந்து, நானே தேவனென்று அறிந்து கொள்ளுங்கள்.",
                    verseReference = "சங்கீதம் 46:10",
                    language = "ta"
                )
            )
            AppLanguage.SPANISH -> listOf(
                WallpaperItem(
                    id = "es-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "Jehová es mi pastor; nada me faltará.",
                    verseReference = "Salmos 23:1",
                    language = "es"
                ),
                WallpaperItem(
                    id = "es-2",
                    imageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
                    verseText = "Todo lo puedo en Cristo que me fortalece.",
                    verseReference = "Filipenses 4:13",
                    language = "es"
                )
            )
            AppLanguage.PORTUGUESE -> listOf(
                WallpaperItem(
                    id = "pt-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "O Senhor é o meu pastor e nada me faltará.",
                    verseReference = "Salmos 23:1",
                    language = "pt"
                )
            )
            AppLanguage.FRENCH -> listOf(
                WallpaperItem(
                    id = "fr-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "L'Éternel est mon berger: je ne manquerai de rien.",
                    verseReference = "Psaume 23:1",
                    language = "fr"
                )
            )
            AppLanguage.GERMAN -> listOf(
                WallpaperItem(
                    id = "de-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "Der Herr ist mein Hirte, mir wird nichts mangeln.",
                    verseReference = "Psalm 23:1",
                    language = "de"
                )
            )
            else -> listOf(
                WallpaperItem(
                    id = "en-1",
                    imageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1080&q=80",
                    verseText = "The Lord is my light and my salvation; whom shall I fear?",
                    verseReference = "Psalm 27:1",
                    language = "en"
                ),
                WallpaperItem(
                    id = "en-2",
                    imageUrl = "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1080&q=80",
                    verseText = "I can do all things through Christ who strengthens me.",
                    verseReference = "Philippians 4:13",
                    language = "en"
                ),
                WallpaperItem(
                    id = "en-3",
                    imageUrl = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1080&q=80",
                    verseText = "The Lord is my shepherd; I shall not want.",
                    verseReference = "Psalm 23:1",
                    language = "en"
                ),
                WallpaperItem(
                    id = "en-4",
                    imageUrl = "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1080&q=80",
                    verseText = "Be still, and know that I am God.",
                    verseReference = "Psalm 46:10",
                    language = "en"
                )
            )
        }
    }

    val dailyVerse = wallpapers.firstOrNull()

    Box(modifier = Modifier.fillMaxSize()) {
        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            "Bible Wallpapers",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 20.sp
                        )
                    },
                    actions = {
                        // Random Scripture Button
                        IconButton(
                            onClick = {
                                if (wallpapers.isNotEmpty()) {
                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                    val randomItem = wallpapers.random()
                                    previewItem = randomItem
                                    onNavigateToPreview(randomItem.id)
                                }
                            }
                        ) {
                            Icon(
                                Icons.Default.Shuffle,
                                contentDescription = "Random Scripture",
                                tint = Color(0xFFF59E0B)
                            )
                        }

                        // Bulk Selection Mode Toggle
                        IconButton(
                            onClick = {
                                val nextMode = !selectionMode
                                selectionMode = nextMode
                                if (nextMode) {
                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                } else {
                                    HapticUtil.perform(context, haptic, AppHapticType.WARNING)
                                    selectedIds = emptySet()
                                }
                            }
                        ) {
                            Icon(
                                imageVector = if (selectionMode) Icons.Default.CheckCircle else Icons.Default.RadioButtonUnchecked,
                                contentDescription = "Toggle Bulk Selection",
                                tint = if (selectionMode) Color(0xFFF59E0B) else Color(0xFF94A3B8)
                            )
                        }

                        // Language Selector
                        Box {
                            TextButton(onClick = {
                                HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                languageDropdownExpanded = true
                            }) {
                                Text(
                                    selectedLanguage.displayName,
                                    color = Color(0xFFF59E0B),
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                            DropdownMenu(
                                expanded = languageDropdownExpanded,
                                onDismissRequest = { languageDropdownExpanded = false }
                            ) {
                                AppLanguage.entries.forEach { lang ->
                                    DropdownMenuItem(
                                        text = { Text(lang.displayName) },
                                        onClick = {
                                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                            selectedLanguage = lang
                                            languageDropdownExpanded = false
                                        }
                                    )
                                }
                            }
                        }
                    },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF0F172A)
                    )
                )
            },
            containerColor = Color(0xFF0F172A)
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .padding(horizontal = 16.dp)
            ) {
                // Bulk Action Bar when Selection Mode is Active
                if (selectionMode) {
                    Surface(
                        color = Color(0xFF1E293B),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 12.dp, vertical = 8.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            TextButton(
                                onClick = {
                                    if (selectedIds.size == wallpapers.size) {
                                        // Deselect all
                                        HapticUtil.perform(context, haptic, AppHapticType.WARNING)
                                        selectedIds = emptySet()
                                    } else {
                                        // Select all
                                        HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                        selectedIds = wallpapers.map { it.id }.toSet()
                                    }
                                }
                            ) {
                                Text(
                                    if (selectedIds.size == wallpapers.size) "Deselect All" else "Select All (${wallpapers.size})",
                                    color = Color(0xFFF59E0B),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.SemiBold
                                )
                            }

                            Button(
                                onClick = {
                                    // Bulk download/action success
                                    HapticUtil.perform(context, haptic, AppHapticType.SUCCESS)
                                    val count = if (selectedIds.isNotEmpty()) selectedIds.size else wallpapers.size
                                    Toast.makeText(context, "Bulk export initiated for $count wallpapers!", Toast.LENGTH_SHORT).show()
                                    selectionMode = false
                                    selectedIds = emptySet()
                                },
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF59E0B)),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp),
                                modifier = Modifier.height(34.dp)
                            ) {
                                Text(
                                    "Export (${if (selectedIds.isNotEmpty()) selectedIds.size else wallpapers.size})",
                                    color = Color.Black,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }

                // Daily Verse Blessing Card
                dailyVerse?.let { verse ->
                    val isBookmarked = bookmarkedIds.contains(verse.id)
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp)
                            .clickable {
                                HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                previewItem = verse
                                onNavigateToPreview(verse.id)
                            },
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color(0xFF1E293B)
                        )
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "DAILY VERSE BLESSING",
                                    color = Color(0xFFF59E0B),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    // Bookmark Button with SUCCESS Haptic pattern
                                    IconButton(
                                        onClick = {
                                            val isNowBookmarked = !isBookmarked
                                            bookmarkedIds = if (isNowBookmarked) {
                                                HapticUtil.perform(context, haptic, AppHapticType.SUCCESS)
                                                Toast.makeText(context, "Added to Bookmarks!", Toast.LENGTH_SHORT).show()
                                                bookmarkedIds + verse.id
                                            } else {
                                                HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                                Toast.makeText(context, "Removed from Bookmarks", Toast.LENGTH_SHORT).show()
                                                bookmarkedIds - verse.id
                                            }
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (isBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                            contentDescription = "Bookmark Verse",
                                            tint = if (isBookmarked) Color(0xFFF43F5E) else Color(0xFF94A3B8)
                                        )
                                    }
                                    Spacer(modifier = Modifier.width(4.dp))
                                    IconButton(
                                        onClick = {
                                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                            val locale = when (selectedLanguage) {
                                                AppLanguage.TAMIL -> Locale("ta", "IN")
                                                AppLanguage.SPANISH -> Locale("es", "ES")
                                                AppLanguage.PORTUGUESE -> Locale("pt", "BR")
                                                AppLanguage.FRENCH -> Locale.FRENCH
                                                AppLanguage.GERMAN -> Locale.GERMAN
                                                else -> Locale.US
                                            }
                                            tts?.language = locale
                                            tts?.speak(
                                                "${verse.verseText} — ${verse.verseReference}",
                                                TextToSpeech.QUEUE_FLUSH,
                                                null,
                                                "daily_verse"
                                            )
                                        },
                                        modifier = Modifier.size(32.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.VolumeUp,
                                            contentDescription = "Listen to Verse",
                                            tint = Color(0xFFF59E0B)
                                        )
                                    }
                                }
                            }
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "\"${verse.verseText}\"",
                                color = Color.White,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Medium
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "— ${verse.verseReference}",
                                color = Color(0xFF94A3B8),
                                fontSize = 13.sp
                            )
                        }
                    }
                }

                // Wallpaper Grid Header
                Text(
                    "Scripture Wallpapers",
                    color = Color.White,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(vertical = 8.dp)
                )

                // Wallpaper Grid with Gentle Cross-Fade Transition
                AnimatedContent(
                    targetState = selectedLanguage,
                    transitionSpec = {
                        fadeIn(animationSpec = tween(durationMillis = 320)) togetherWith
                                fadeOut(animationSpec = tween(durationMillis = 200))
                    },
                    label = "WallpaperCategoryCrossFade"
                ) { _ ->
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(wallpapers) { item ->
                            val isItemSelected = selectedIds.contains(item.id)
                            val isItemBookmarked = bookmarkedIds.contains(item.id)

                            Card(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(280.dp)
                                    .clickable {
                                        if (selectionMode) {
                                            // Crisp SELECTION haptic for bulk download toggle
                                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                            selectedIds = if (isItemSelected) {
                                                selectedIds - item.id
                                            } else {
                                                selectedIds + item.id
                                            }
                                        } else {
                                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                            previewItem = item
                                            onNavigateToPreview(item.id)
                                        }
                                    },
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isItemSelected) Color(0xFF334155) else Color(0xFF1E293B)
                                )
                            ) {
                                Box(modifier = Modifier.fillMaxSize()) {
                                    AsyncImage(
                                        model = item.imageUrl,
                                        contentDescription = item.verseReference,
                                        contentScale = ContentScale.Crop,
                                        modifier = Modifier.fillMaxSize()
                                    )
                                    // Dark gradient overlay for text readability
                                    Box(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .background(
                                                if (isItemSelected) Color(0xFFF59E0B).copy(alpha = 0.25f)
                                                else Color.Black.copy(alpha = 0.45f)
                                            )
                                    )

                                    // Selection checkbox / Bookmark indicator badge at Top
                                    Row(
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(8.dp),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        if (selectionMode) {
                                            Box(
                                                modifier = Modifier
                                                    .size(24.dp)
                                                    .background(
                                                        if (isItemSelected) Color(0xFFF59E0B) else Color.Black.copy(alpha = 0.6f),
                                                        CircleShape
                                                    )
                                                    .clickable {
                                                        HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                                        selectedIds = if (isItemSelected) {
                                                            selectedIds - item.id
                                                        } else {
                                                            selectedIds + item.id
                                                        }
                                                    },
                                                contentAlignment = Alignment.Center
                                            ) {
                                                if (isItemSelected) {
                                                    Icon(
                                                        Icons.Default.Check,
                                                        contentDescription = "Selected",
                                                        tint = Color.Black,
                                                        modifier = Modifier.size(16.dp)
                                                    )
                                                }
                                            }
                                        } else {
                                            Spacer(modifier = Modifier.width(1.dp))
                                        }

                                        // Bookmark quick toggle on card
                                        IconButton(
                                            onClick = {
                                                val isNow = !isItemBookmarked
                                                bookmarkedIds = if (isNow) {
                                                    // Refined SUCCESS haptic pulse for bookmarking
                                                    HapticUtil.perform(context, haptic, AppHapticType.SUCCESS)
                                                    bookmarkedIds + item.id
                                                } else {
                                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                                    bookmarkedIds - item.id
                                                }
                                            },
                                            modifier = Modifier
                                                .size(28.dp)
                                                .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                                        ) {
                                            Icon(
                                                imageVector = if (isItemBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                                contentDescription = "Bookmark",
                                                tint = if (isItemBookmarked) Color(0xFFF43F5E) else Color.White,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }

                                    Column(
                                        modifier = Modifier
                                            .fillMaxSize()
                                            .padding(12.dp),
                                        verticalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Spacer(modifier = Modifier.height(24.dp))
                                        Text(
                                            item.verseReference,
                                            color = Color(0xFFFDE68A),
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Column {
                                            Text(
                                                item.verseText,
                                                color = Color.White,
                                                fontSize = 13.sp,
                                                fontWeight = FontWeight.Medium,
                                                maxLines = 4,
                                                overflow = TextOverflow.Ellipsis
                                            )
                                            Spacer(modifier = Modifier.height(8.dp))
                                            Button(
                                                onClick = {
                                                    // HEAVY haptic pattern on wallpaper application
                                                    HapticUtil.perform(context, haptic, AppHapticType.HEAVY)
                                                    coroutineScope.launch {
                                                        setWallpaper(context, item.imageUrl)
                                                    }
                                                },
                                                colors = ButtonDefaults.buttonColors(
                                                    containerColor = Color(0xFFF59E0B)
                                                ),
                                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp),
                                                modifier = Modifier.fillMaxWidth().height(32.dp)
                                            ) {
                                                Icon(
                                                    Icons.Default.Wallpaper,
                                                    contentDescription = null,
                                                    modifier = Modifier.size(14.dp),
                                                    tint = Color.Black
                                                )
                                                Spacer(modifier = Modifier.width(4.dp))
                                                Text(
                                                    "Set Lock",
                                                    fontSize = 11.sp,
                                                    color = Color.Black,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Fullscreen Interactive Preview Dialog with Distinct Haptics & Image Adjustments
        previewItem?.let { selectedItem ->
            val isPreviewBookmarked = bookmarkedIds.contains(selectedItem.id)
            var selectedFilter by remember(selectedItem.id) { mutableStateOf(WallpaperFilter.ORIGINAL) }
            var selectedFontTheme by remember(selectedItem.id) { mutableStateOf(ScriptureFontTheme.SERIF) }
            var selectedFadeMode by remember(selectedItem.id) { mutableStateOf(WallpaperFadeMode.SOFT) }

            // Dynamic ColorFilter matrix for live preview adjustment
            val composeColorFilter = when (selectedFilter) {
                WallpaperFilter.ORIGINAL -> null
                WallpaperFilter.GRAYSCALE -> ColorFilter.colorMatrix(
                    ColorMatrix().apply { setToSaturation(0f) }
                )
                WallpaperFilter.SEPIA -> ColorFilter.colorMatrix(
                    ColorMatrix(
                        floatArrayOf(
                            0.393f, 0.769f, 0.189f, 0f, 0f,
                            0.349f, 0.686f, 0.168f, 0f, 0f,
                            0.272f, 0.534f, 0.131f, 0f, 0f,
                            0f,     0f,     0f,     1f, 0f
                        )
                    )
                )
            }

            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color.Black.copy(alpha = 0.92f))
                    .clickable(
                        interactionSource = remember { MutableInteractionSource() },
                        indication = null
                    ) {
                        HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                        previewItem = null
                    }
            ) {
                AsyncImage(
                    model = selectedItem.imageUrl,
                    contentDescription = selectedItem.verseReference,
                    contentScale = ContentScale.Crop,
                    colorFilter = composeColorFilter,
                    modifier = Modifier.fillMaxSize()
                )

                // Dynamic Wallpaper Fading Vignette Overlay
                val fadeBrush = when (selectedFadeMode) {
                    WallpaperFadeMode.NONE -> Brush.verticalGradient(
                        listOf(Color.Black.copy(alpha = 0.20f), Color.Black.copy(alpha = 0.35f))
                    )
                    WallpaperFadeMode.SOFT -> Brush.radialGradient(
                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.65f))
                    )
                    WallpaperFadeMode.DEEP -> Brush.verticalGradient(
                        listOf(Color.Black.copy(alpha = 0.72f), Color.Transparent, Color.Black.copy(alpha = 0.88f))
                    )
                }
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(fadeBrush)
                )

                // Top Close & Bookmark buttons
                Row(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(top = 40.dp, end = 20.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    IconButton(
                        onClick = {
                            val isNow = !isPreviewBookmarked
                            bookmarkedIds = if (isNow) {
                                HapticUtil.perform(context, haptic, AppHapticType.SUCCESS)
                                Toast.makeText(context, "Bookmarked!", Toast.LENGTH_SHORT).show()
                                bookmarkedIds + selectedItem.id
                            } else {
                                HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                bookmarkedIds - selectedItem.id
                            }
                        },
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(
                            imageVector = if (isPreviewBookmarked) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                            contentDescription = "Bookmark",
                            tint = if (isPreviewBookmarked) Color(0xFFF43F5E) else Color.White
                        )
                    }

                    IconButton(
                        onClick = {
                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                            previewItem = null
                        },
                        modifier = Modifier
                            .size(44.dp)
                            .background(Color.Black.copy(alpha = 0.5f), CircleShape)
                    ) {
                        Icon(
                            Icons.Default.Close,
                            contentDescription = "Close preview",
                            tint = Color.White
                        )
                    }
                }

                // Centered Scripture Typography with Active Font Theme
                Column(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .padding(horizontal = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        Icons.Default.FormatQuote,
                        contentDescription = null,
                        tint = Color(0xFFF59E0B),
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        text = selectedItem.verseText,
                        color = Color.White,
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        lineHeight = 32.sp,
                        fontFamily = selectedFontTheme.fontFamily,
                        fontStyle = if (selectedFontTheme.isItalic) FontStyle.Italic else FontStyle.Normal
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "— ${selectedItem.verseReference}",
                        color = Color(0xFFFDE68A),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center
                    )
                }

                // Bottom Action buttons with Tactile Haptics, Font Theme, Wallpaper Fading & Filter Toolbars
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(horizontal = 20.dp, vertical = 24.dp)
                        .fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Fonts Theme Selector Toolbar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(14.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        ScriptureFontTheme.values().forEach { theme ->
                            val isSelected = selectedFontTheme == theme
                            Surface(
                                onClick = {
                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                    selectedFontTheme = theme
                                },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Color(0xFFF59E0B) else Color.Transparent,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = theme.displayName,
                                    color = if (isSelected) Color.Black else Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }
                        }
                    }

                    // Wallpaper Fading Toolbar
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(14.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        WallpaperFadeMode.values().forEach { fade ->
                            val isSelected = selectedFadeMode == fade
                            Surface(
                                onClick = {
                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                    selectedFadeMode = fade
                                },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Color(0xFFF59E0B) else Color.Transparent,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = "${fade.displayName} Fade",
                                    color = if (isSelected) Color.Black else Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }
                        }
                    }

                    // Image Adjustment Filter Controls (Original, Grayscale, Sepia)
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color.Black.copy(alpha = 0.65f), RoundedCornerShape(14.dp))
                            .padding(4.dp),
                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                    ) {
                        WallpaperFilter.values().forEach { filter ->
                            val isSelected = selectedFilter == filter
                            Surface(
                                onClick = {
                                    HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                                    selectedFilter = filter
                                },
                                shape = RoundedCornerShape(10.dp),
                                color = if (isSelected) Color(0xFFF59E0B) else Color.Transparent,
                                border = if (isSelected) null else BorderStroke(1.dp, Color.White.copy(alpha = 0.15f)),
                                modifier = Modifier.weight(1f)
                            ) {
                                Text(
                                    text = filter.displayName,
                                    color = if (isSelected) Color.Black else Color.White,
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    textAlign = TextAlign.Center,
                                    modifier = Modifier.padding(vertical = 5.dp)
                                )
                            }
                        }
                    }

                    Button(
                        onClick = {
                            HapticUtil.perform(context, haptic, AppHapticType.HEAVY)
                            coroutineScope.launch {
                                isSettingWallpaper = true
                                setWallpaper(context, selectedItem.imageUrl, selectedFilter, selectedFadeMode)
                                isSettingWallpaper = false
                                previewItem = null
                            }
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFFF59E0B)
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        enabled = !isSettingWallpaper
                    ) {
                        Icon(
                            Icons.Default.Wallpaper,
                            contentDescription = null,
                            tint = Color.Black,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            if (isSettingWallpaper) "Applying Wallpaper..." else "Set as Lock Screen Wallpaper",
                            color = Color.Black,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    OutlinedButton(
                        onClick = {
                            HapticUtil.perform(context, haptic, AppHapticType.SELECTION)
                            val locale = when (selectedLanguage) {
                                AppLanguage.TAMIL -> Locale("ta", "IN")
                                AppLanguage.SPANISH -> Locale("es", "ES")
                                AppLanguage.PORTUGUESE -> Locale("pt", "BR")
                                AppLanguage.FRENCH -> Locale.FRENCH
                                AppLanguage.GERMAN -> Locale.GERMAN
                                else -> Locale.US
                            }
                            tts?.language = locale
                            tts?.speak(
                                "${selectedItem.verseText} — ${selectedItem.verseReference}",
                                TextToSpeech.QUEUE_FLUSH,
                                null,
                                "preview_verse"
                            )
                        },
                        colors = ButtonDefaults.outlinedButtonColors(
                            contentColor = Color.White
                        ),
                        shape = RoundedCornerShape(14.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                    ) {
                        Icon(
                            Icons.Default.VolumeUp,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            "Listen with Audio Verse",
                            color = Color.White,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }
            }
        }
    }
}

private suspend fun setWallpaper(
    context: Context, 
    imageUrl: String, 
    filter: WallpaperFilter = WallpaperFilter.ORIGINAL,
    fadeMode: WallpaperFadeMode = WallpaperFadeMode.SOFT
) {
    withContext(Dispatchers.IO) {
        try {
            val loader = context.imageLoader
            val request = ImageRequest.Builder(context)
                .data(imageUrl)
                .allowHardware(false)
                .build()
            val result = loader.execute(request)
            if (result is SuccessResult) {
                var bitmap = (result.image as? BitmapDrawable)?.bitmap
                if (bitmap != null) {
                    // Apply image adjustment filter (Grayscale / Sepia) or fade to bitmap before setting lock screen
                    if (filter != WallpaperFilter.ORIGINAL || fadeMode != WallpaperFadeMode.NONE) {
                        val filteredBitmap = Bitmap.createBitmap(
                            bitmap.width,
                            bitmap.height,
                            bitmap.config ?: Bitmap.Config.ARGB_8888
                        )
                        val canvas = Canvas(filteredBitmap)
                        val paint = Paint(Paint.ANTI_ALIAS_FLAG)
                        val cm = android.graphics.ColorMatrix()
                        if (filter == WallpaperFilter.GRAYSCALE) {
                            cm.setSaturation(0f)
                            paint.colorFilter = ColorMatrixColorFilter(cm)
                        } else if (filter == WallpaperFilter.SEPIA) {
                            cm.set(
                                floatArrayOf(
                                    0.393f, 0.769f, 0.189f, 0f, 0f,
                                    0.349f, 0.686f, 0.168f, 0f, 0f,
                                    0.272f, 0.534f, 0.131f, 0f, 0f,
                                    0f,     0f,     0f,     1f, 0f
                                )
                            )
                            paint.colorFilter = ColorMatrixColorFilter(cm)
                        }
                        canvas.drawBitmap(bitmap, 0f, 0f, paint)

                        // Apply wallpaper fading vignette if enabled
                        if (fadeMode == WallpaperFadeMode.SOFT) {
                            val fadePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                                shader = android.graphics.RadialGradient(
                                    bitmap.width / 2f,
                                    bitmap.height / 2f,
                                    bitmap.width * 0.85f,
                                    android.graphics.Color.TRANSPARENT,
                                    android.graphics.Color.argb(160, 0, 0, 0),
                                    android.graphics.Shader.TileMode.CLAMP
                                )
                            }
                            canvas.drawRect(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat(), fadePaint)
                        } else if (fadeMode == WallpaperFadeMode.DEEP) {
                            val fadePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
                                shader = android.graphics.LinearGradient(
                                    0f, 0f, 0f, bitmap.height.toFloat(),
                                    intArrayOf(
                                        android.graphics.Color.argb(180, 0, 0, 0),
                                        android.graphics.Color.TRANSPARENT,
                                        android.graphics.Color.argb(220, 0, 0, 0)
                                    ),
                                    floatArrayOf(0f, 0.45f, 1f),
                                    android.graphics.Shader.TileMode.CLAMP
                                )
                            }
                            canvas.drawRect(0f, 0f, bitmap.width.toFloat(), bitmap.height.toFloat(), fadePaint)
                        }
                        bitmap = filteredBitmap
                    }

                    val wm = WallpaperManager.getInstance(context)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                        wm.setBitmap(bitmap, null, true, WallpaperManager.FLAG_LOCK)
                    } else {
                        wm.setBitmap(bitmap)
                    }
                    withContext(Dispatchers.Main) {
                        Toast.makeText(context, "Lock screen wallpaper updated!", Toast.LENGTH_SHORT).show()
                    }
                }
            }
        } catch (e: Exception) {
            withContext(Dispatchers.Main) {
                Toast.makeText(context, "Could not set wallpaper", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
