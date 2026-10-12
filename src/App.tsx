import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Heart, Download, Crown, Sparkles, Globe, 
  Smartphone, Filter, BookOpen, ChevronDown, Check,
  RefreshCw, Bookmark, Share2, Star, Clock, Wifi, WifiOff,
  Sliders, Settings2, Sun, Moon, Sunrise, Sunset, CheckSquare, Square, FolderDown,
  Volume2, VolumeX, Play, Pause, ArrowRight, Zap, Hourglass, RotateCw,
  Type, Shuffle, Flame, ArrowUpDown, Battery, BatteryCharging,
  BatteryWarning, BatteryLow, BatteryMedium, Gauge, Power
} from 'lucide-react';
import { 
  Wallpaper, LanguageOption, AppThemeMode, ThemePreference, 
  SolarThemeConfig, FontThemeId, WallpaperFadeMode, WallpaperSortOption,
  CustomizationSettings
} from './types';
import { FONT_THEMES, WALLPAPER_FADE_OPTIONS, getFontTheme } from './utils/fontThemes';
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { SharePreviewModal } from './components/SharePreviewModal';
import { DownloadPreviewModal } from './components/DownloadPreviewModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AutoChangerModal } from './components/AutoChangerModal';
import { SettingsModal, SettingsTab } from './components/SettingsModal';
import { DailyVerseBanner } from './components/DailyVerseBanner';
import { StreakTrackerCard } from './components/StreakTrackerCard';
import { TopicsExplorerModal } from './components/TopicsExplorerModal';
import { DailyVerseQuote } from './components/DailyVerseQuote';
import { StreakData, getStreakData, recordScriptureInteraction } from './utils/streakUtils';
import { ALL_BIBLE_TOPICS, VISUAL_THEMES_DIRECTORY } from './data/bibleTopics';
import { CuratedCollectionsBar } from './components/CuratedCollectionsBar';
import { shareWallpaper } from './utils/shareUtils';
import { narrateScripture, stopScriptureNarration } from './utils/speechUtils';
import { downloadWallpapersAsZip, BulkDownloadProgress } from './utils/bulkDownload';
import { triggerWebHaptic } from './utils/haptics';
import { 
  getOfflineWallpapers, 
  saveOfflineWallpapers, 
  getAutoChangerConfig, 
  saveAutoChangerConfig, 
  AutoChangerConfig 
} from './utils/offlineStorage';
import { useBatteryStatus } from './utils/useBatteryStatus';
import { useSolarTheme } from './utils/solarTheme';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', displayName: 'English', flag: '🇺🇸' },
  { code: 'ta', displayName: 'தமிழ் (Tamil)', flag: '🇮🇳' },
  { code: 'es', displayName: 'Español', flag: '🇪🇸' },
  { code: 'pt', displayName: 'Português', flag: '🇧🇷' },
  { code: 'fr', displayName: 'Français', flag: '🇫🇷' },
  { code: 'de', displayName: 'Deutsch', flag: '🇩🇪' },
];

const SCRIPTURE_TOPICS = [
  'All',
  ...ALL_BIBLE_TOPICS.map((t) => t.name)
];

const VISUAL_THEMES = [
  ...VISUAL_THEMES_DIRECTORY.map((v) => v.name)
];

const SORT_OPTIONS: { id: WallpaperSortOption; label: string; labelTamil: string; subtitle: string }[] = [
  { id: 'newest', label: 'Newest', labelTamil: 'புதியவை', subtitle: 'Curated 4K & latest additions first' },
  { id: 'downloads', label: 'Most Downloaded', labelTamil: 'அதிக பதிவிறக்கம்', subtitle: 'Community favorite wallpapers' },
  { id: 'reference', label: 'Alphabetical by Verse Reference', labelTamil: 'வேத குறிப்பு அகரவரிசை', subtitle: 'A to Z by Book, Chapter & Verse' },
];

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCollection, setSelectedCollection] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVisualTheme, setSelectedVisualTheme] = useState<string>('All Aesthetics');
  const [selectedTestament, setSelectedTestament] = useState<string>('All');
  const [sortOption, setSortOption] = useState<WallpaperSortOption>('newest');
  const [sortDropdownOpen, setSortDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFilterTransitioning, setIsFilterTransitioning] = useState<boolean>(false);
  const [previewingWallpaper, setPreviewingWallpaper] = useState<Wallpaper | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('haptics');
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

  const openSettings = (tab: SettingsTab = 'haptics') => {
    triggerWebHaptic('selection');
    setSettingsTab(tab);
    setIsSettingsOpen(true);
  };

  const setIsAutoChangerOpen = (open: boolean) => {
    if (open) {
      openSettings('autochanger');
    } else {
      setIsSettingsOpen(false);
    }
  };

  const activeTopicInfo = useMemo(() => {
    if (selectedCategory === 'All') return null;
    return ALL_BIBLE_TOPICS.find((t) => t.name.toLowerCase() === selectedCategory.toLowerCase()) || null;
  }, [selectedCategory]);

  const wallpaperCountByTopic = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of wallpapers) {
      map[w.category] = (map[w.category] || 0) + 1;
    }
    return map;
  }, [wallpapers]);
  
  // Solar Theme Engine (Dark, Light, or Scheduled Sunrise/Sunset)
  const solarTheme = useSolarTheme();
  const { 
    config: solarConfig, 
    effectiveTheme: themeMode, 
    isLight, 
    nextTransitionText, 
    sunriseFormatted, 
    sunsetFormatted, 
    updateConfig: updateSolarConfig, 
    setThemePreference,
    requestGeolocation 
  } = solarTheme;

  // Active Fonts Theme state (customizable typography styling)
  const [fontTheme, setFontTheme] = useState<FontThemeId>(() => {
    try {
      const saved = localStorage.getItem('bible_wallpapers_font_theme');
      return (saved as FontThemeId) || 'cathedral';
    } catch {
      return 'cathedral';
    }
  });
  const [fontThemeDropdownOpen, setFontThemeDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('bible_wallpapers_font_theme', fontTheme);
  }, [fontTheme]);

  // Active Wallpaper Fading mode state
  const [wallpaperFade, setWallpaperFade] = useState<WallpaperFadeMode>(() => {
    try {
      const saved = localStorage.getItem('bible_wallpapers_wallpaper_fade');
      return (saved as WallpaperFadeMode) || 'soft';
    } catch {
      return 'soft';
    }
  });
  const [fadeDropdownOpen, setFadeDropdownOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('bible_wallpapers_wallpaper_fade', wallpaperFade);
  }, [wallpaperFade]);

  const currentFontThemeOption = useMemo(() => getFontTheme(fontTheme), [fontTheme]);

  const handleSelectFontTheme = (themeId: FontThemeId) => {
    triggerWebHaptic('selection');
    setFontTheme(themeId);
    setFontThemeDropdownOpen(false);
  };

  const handleSelectWallpaperFade = (fadeMode: WallpaperFadeMode) => {
    triggerWebHaptic('selection');
    setWallpaperFade(fadeMode);
    setFadeDropdownOpen(false);
  };

  // Daily Scripture Reading Streak State
  const [streakData, setStreakData] = useState<StreakData>(() => getStreakData());

  const handleScriptureInteracted = () => {
    const result = recordScriptureInteraction();
    setStreakData(result.data);
    return result;
  };

  // Offline & Auto-changer state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState<boolean>(!navigator.onLine);
  const [autoConfig, setAutoConfig] = useState<AutoChangerConfig>(getAutoChangerConfig);
  const batteryState = useBatteryStatus(autoConfig);
  const [currentLockscreenWallpaper, setCurrentLockscreenWallpaper] = useState<Wallpaper | null>(null);
  const [remainingTimeSeconds, setRemainingTimeSeconds] = useState<number>(3600);
  const [shareToast, setShareToast] = useState<string | null>(null);
  const [sharedWallpaperId, setSharedWallpaperId] = useState<string | null>(null);

  // Bulk Selection and Download State
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBulkDownloading, setIsBulkDownloading] = useState<boolean>(false);
  const [bulkProgress, setBulkProgress] = useState<BulkDownloadProgress | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<string | undefined>(undefined);

  // Share & Download Preview Modal State
  const [sharePreviewWallpaper, setSharePreviewWallpaper] = useState<Wallpaper | null>(null);
  const [downloadPreviewWallpaper, setDownloadPreviewWallpaper] = useState<Wallpaper | null>(null);
  const [downloadPreviewSettings, setDownloadPreviewSettings] = useState<CustomizationSettings | undefined>(undefined);

  const handleOpenSharePreview = (wallpaper: Wallpaper) => {
    triggerWebHaptic('selection');
    setSharePreviewWallpaper(wallpaper);
  };

  const handleOpenDownloadPreview = (wallpaper: Wallpaper, customSettings?: CustomizationSettings) => {
    triggerWebHaptic('selection');
    setDownloadPreviewSettings(customSettings);
    setDownloadPreviewWallpaper(wallpaper);
  };

  // Smooth cross-fade transition handler when changing collections, categories, visual themes, or filters
  const handleCollectionChange = (collection: string) => {
    if (collection === selectedCollection) return;
    triggerWebHaptic('selection');
    setIsFilterTransitioning(true);
    setSelectedCollection(collection);
    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
  };

  const handleSortChange = (option: WallpaperSortOption) => {
    if (option === sortOption) {
      setSortDropdownOpen(false);
      return;
    }
    triggerWebHaptic('selection');
    setIsFilterTransitioning(true);
    setSortOption(option);
    setSortDropdownOpen(false);
    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
  };

  const handleCategoryChange = (category: string) => {
    if (category === selectedCategory) return;
    triggerWebHaptic('selection');
    setIsFilterTransitioning(true);
    setSelectedCategory(category);
    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
  };

  const handleVisualThemeChange = (theme: string) => {
    if (theme === selectedVisualTheme) return;
    triggerWebHaptic('selection');
    setIsFilterTransitioning(true);
    setSelectedVisualTheme(theme);
    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
  };

  const handleTestamentChange = (testament: string) => {
    if (testament === selectedTestament) return;
    triggerWebHaptic('selection');
    setIsFilterTransitioning(true);
    setSelectedTestament(testament);
    setTimeout(() => {
      setIsFilterTransitioning(false);
    }, 280);
  };

  const toggleSelectWallpaper = (id: string) => {
    // Crisp 'selection' intensity pattern for toggling bulk item selection
    triggerWebHaptic('selection');
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedWallpapers.length) {
      // 'warning' intensity pattern when deselecting all
      triggerWebHaptic('warning');
      setSelectedIds([]);
    } else {
      // Crisp 'selection' intensity pattern when selecting all
      triggerWebHaptic('selection');
      setSelectedIds(displayedWallpapers.map((w) => w.id));
    }
  };

  const handleBulkDownload = async () => {
    if (!isPremiumUser) {
      triggerWebHaptic('warning');
      setUpgradeReason("Bulk 1-Click ZIP Collection Download is an exclusive VIP privilege. Upgrade to VIP to export entire wallpaper sets in full HD.");
      setIsUpgradeOpen(true);
      return;
    }

    const itemsToDownload = selectedIds.length > 0
      ? displayedWallpapers.filter((w) => selectedIds.includes(w.id))
      : displayedWallpapers;

    if (itemsToDownload.length === 0) return;

    setIsBulkDownloading(true);
    triggerWebHaptic('heavy');
    try {
      await downloadWallpapersAsZip(itemsToDownload, (p) => setBulkProgress(p));
      // Uplifting 'success' intensity pattern upon successful archive generation
      triggerWebHaptic('success');
      setShareToast(`Downloaded ${itemsToDownload.length} wallpapers in ZIP archive!`);
      setSelectedIds([]);
      setSelectionMode(false);
    } catch (err) {
      console.error('Bulk download error:', err);
    } finally {
      setIsBulkDownloading(false);
      setBulkProgress(null);
    }
  };

  const handleShareWallpaper = async (wallpaper: Wallpaper) => {
    setSharedWallpaperId(wallpaper.id);
    const result = await shareWallpaper(wallpaper);
    if (result.copiedToClipboard) {
      setShareToast(`Copied "${wallpaper.verseReference}" & wallpaper link to clipboard!`);
    } else if (result.shared) {
      setShareToast(`Shared "${wallpaper.verseReference}" successfully!`);
    }
    setTimeout(() => {
      setSharedWallpaperId(null);
      setShareToast(null);
    }, 3000);
  };

  // Select a random wallpaper from the collection and open directly in Phone Preview modal
  const handleRandomScripture = () => {
    const pool = wallpapers.length > 0 ? wallpapers : (getOfflineWallpapers() || []);
    if (pool.length === 0) return;

    triggerWebHaptic('selection');

    // Pick a random wallpaper, ensuring variety when multiple items exist
    let randomIdx = Math.floor(Math.random() * pool.length);
    if (pool.length > 1 && previewingWallpaper && pool[randomIdx].id === previewingWallpaper.id) {
      randomIdx = (randomIdx + 1) % pool.length;
    }

    const picked = pool[randomIdx];
    stopScriptureNarration();
    setSpeakingCardId(null);
    handleScriptureInteracted();
    setPreviewingWallpaper(picked);
  };

  const [speakingCardId, setSpeakingCardId] = useState<string | null>(null);

  const handleToggleCardSpeech = (wallpaper: Wallpaper) => {
    if (speakingCardId === wallpaper.id) {
      stopScriptureNarration();
      setSpeakingCardId(null);
    } else {
      setSpeakingCardId(wallpaper.id);
      narrateScripture(wallpaper.verseText, wallpaper.verseReference, wallpaper.language, {
        onStart: () => setSpeakingCardId(wallpaper.id),
        onEnd: () => setSpeakingCardId(null),
        onError: () => setSpeakingCardId(null),
      });
    }
  };

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bible_wallpapers_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState<boolean>(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState<boolean>(false);

  // Monitor network online/offline events
  useEffect(() => {
    const handleOnline = () => setIsNetworkOffline(false);
    const handleOffline = () => setIsNetworkOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Check saved premium status
  useEffect(() => {
    const savedPremium = localStorage.getItem('bible_wallpapers_premium') === 'true';
    if (savedPremium) setIsPremiumUser(true);
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('bible_wallpapers_favs', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const willBeBookmarked = !prev.includes(id);
      if (willBeBookmarked) {
        // Distinct 'success' pattern when bookmarking/favoriting
        triggerWebHaptic('success');
      } else {
        // Crisp 'selection' pattern when unbookmarking
        triggerWebHaptic('selection');
      }
      return willBeBookmarked ? [...prev, id] : prev.filter((item) => item !== id);
    });
  };

  const handleSubscriptionSuccess = () => {
    setIsPremiumUser(true);
    localStorage.setItem('bible_wallpapers_premium', 'true');
  };

  // Fetch wallpapers (with offline cache support)
  const fetchWallpapers = async () => {
    setLoading(true);
    // If offline mode is toggled or client has no connection:
    if (isOfflineMode || isNetworkOffline) {
      const offlineCached = getOfflineWallpapers();
      if (offlineCached && offlineCached.length > 0) {
        let filtered = offlineCached.filter(w => w.language === selectedLanguage);
        if (filtered.length === 0) filtered = offlineCached.filter(w => w.language === 'en');
        if (selectedCategory !== 'All') filtered = filtered.filter(w => w.category === selectedCategory);
        if (selectedVisualTheme !== 'All Aesthetics') filtered = filtered.filter(w => w.visualTheme === selectedVisualTheme);
        if (selectedTestament !== 'All') filtered = filtered.filter(w => w.testament === selectedTestament);
        setWallpapers(filtered);
        if (!currentLockscreenWallpaper && filtered.length > 0) {
          setCurrentLockscreenWallpaper(filtered[0]);
        }
        setLoading(false);
        return;
      }
    }

    try {
      const params = new URLSearchParams({
        language: selectedLanguage,
        limit: '250',
      });
      if (selectedCollection !== 'All') params.append('collection', selectedCollection);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedVisualTheme !== 'All Aesthetics') params.append('visualTheme', selectedVisualTheme);
      if (selectedTestament !== 'All') params.append('testament', selectedTestament);
      if (sortOption !== 'newest') params.append('sort', sortOption);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/wallpapers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load wallpapers');
      const data = await res.json();
      const loaded = data.data || [];
      setWallpapers(loaded);

      // Cache wallpapers locally for offline server usage
      saveOfflineWallpapers(loaded);

      if (!currentLockscreenWallpaper && loaded.length > 0) {
        setCurrentLockscreenWallpaper(loaded[0]);
      }
    } catch (err) {
      console.warn('Network fetch failed, attempting offline cache', err);
      const cached = getOfflineWallpapers();
      if (cached) {
        setWallpapers(cached);
        if (!currentLockscreenWallpaper && cached.length > 0) {
          setCurrentLockscreenWallpaper(cached[0]);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, [selectedLanguage, selectedCollection, selectedCategory, selectedVisualTheme, selectedTestament, sortOption, isOfflineMode, isNetworkOffline]);

  // ADAPTIVE AUTOMATIC LOCK SCREEN ROTATION ENGINE (POWER & BATTERY AWARE)
  useEffect(() => {
    if (!autoConfig.enabled || wallpapers.length === 0) return;

    // If battery saver paused rotation due to low battery or unplugged state, halt interval
    if (batteryState.effectiveAction === 'paused') {
      return;
    }

    const effectiveMinutes = batteryState.effectiveAction === 'reduced'
      ? batteryState.effectiveIntervalMinutes
      : (autoConfig.intervalMinutes || 60);
    const intervalMs = effectiveMinutes * 60 * 1000;

    const intervalTimer = setInterval(() => {
      const now = Date.now();
      const elapsed = (now - autoConfig.lastChanged) % intervalMs;
      const left = Math.max(0, Math.floor((intervalMs - elapsed) / 1000));
      setRemainingTimeSeconds(left);

      // When interval expires, rotate to next wallpaper!
      if (left <= 1) {
        setCurrentLockscreenWallpaper((prev) => {
          if (!prev) return wallpapers[0];
          const currIdx = wallpapers.findIndex((w) => w.id === prev.id);
          const nextIdx = (currIdx + 1) % wallpapers.length;
          return wallpapers[nextIdx];
        });

        const newConfig = { ...autoConfig, lastChanged: Date.now() };
        setAutoConfig(newConfig);
        saveAutoChangerConfig(newConfig);
      }
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [autoConfig, wallpapers, batteryState.effectiveAction, batteryState.effectiveIntervalMinutes]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWallpapers();
  };

  const displayedWallpapers = useMemo(() => {
    let result = [...wallpapers];
    if (selectedCollection !== 'All') {
      result = result.filter((w) => w.collection === selectedCollection);
    }
    if (filterFavoritesOnly) {
      result = result.filter((w) => favorites.includes(w.id));
    }

    // Apply sorting
    if (sortOption === 'downloads') {
      result.sort((a, b) => (b.downloads || 0) - (a.downloads || 0));
    } else if (sortOption === 'reference') {
      result.sort((a, b) => a.verseReference.localeCompare(b.verseReference, undefined, { numeric: true }));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => {
        const aCurated = Boolean(a.collection);
        const bCurated = Boolean(b.collection);
        if (aCurated && !bCurated) return -1;
        if (!aCurated && bCurated) return 1;
        return b.id.localeCompare(a.id, undefined, { numeric: true });
      });
    }

    return result;
  }, [wallpapers, selectedCollection, filterFavoritesOnly, favorites, sortOption]);

  const featuredWallpaper = wallpapers.find((w) => !w.isPremium) || wallpapers[0];
  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const formatRemainingMinutes = (secs: number) => {
    const mins = Math.ceil(secs / 60);
    return `${mins}m`;
  };

  // Next wallpaper in the automatic rotation queue
  const nextWallpaper = useMemo(() => {
    if (wallpapers.length <= 1) return null;
    const current = currentLockscreenWallpaper || wallpapers[0];
    const currIdx = wallpapers.findIndex((w) => w.id === current.id);
    const nextIdx = (currIdx + 1) % wallpapers.length;
    return wallpapers[nextIdx];
  }, [wallpapers, currentLockscreenWallpaper]);

  // Exact countdown timer formatting (HH:MM:SS or MM:SS)
  const formatCountdownTimer = (secs: number) => {
    if (batteryState.effectiveAction === 'paused') {
      return 'Paused by Battery Saver';
    }
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (hours > 0) {
      return `${hours}h ${mins.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    }
    return `${mins}m ${s.toString().padStart(2, '0')}s`;
  };

  // Immediate manual rotation handler
  const handleRotateNow = () => {
    if (wallpapers.length === 0) return;
    triggerWebHaptic('selection');
    const curr = currentLockscreenWallpaper || wallpapers[0];
    const currIdx = wallpapers.findIndex((w) => w.id === curr.id);
    const nextIdx = (currIdx + 1) % wallpapers.length;
    const nextWp = wallpapers[nextIdx];
    setCurrentLockscreenWallpaper(nextWp);

    const newConfig = { ...autoConfig, lastChanged: Date.now() };
    setAutoConfig(newConfig);
    saveAutoChangerConfig(newConfig);
    const currentActiveMins = batteryState.effectiveAction === 'reduced'
      ? batteryState.effectiveIntervalMinutes
      : (autoConfig.intervalMinutes || 60);
    setRemainingTimeSeconds(currentActiveMins * 60);
  };

  // Quick toggle auto rotation active/paused
  const handleToggleAutoRotation = () => {
    triggerWebHaptic('selection');
    const newConfig = {
      ...autoConfig,
      enabled: !autoConfig.enabled,
      lastChanged: Date.now(),
    };
    setAutoConfig(newConfig);
    saveAutoChangerConfig(newConfig);
    if (!autoConfig.enabled) {
      const currentActiveMins = batteryState.effectiveAction === 'reduced'
        ? batteryState.effectiveIntervalMinutes
        : (autoConfig.intervalMinutes || 60);
      setRemainingTimeSeconds(currentActiveMins * 60);
    }
  };

  const activeIntervalMinutes = batteryState.effectiveAction === 'reduced'
    ? batteryState.effectiveIntervalMinutes
    : (autoConfig.intervalMinutes || 60);

  const totalIntervalSeconds = Math.max(60, activeIntervalMinutes * 60);
  const elapsedIntervalSeconds = Math.max(0, totalIntervalSeconds - remainingTimeSeconds);
  const rotationProgressPercent = batteryState.effectiveAction === 'paused'
    ? 0
    : Math.min(100, Math.max(0, (elapsedIntervalSeconds / totalIntervalSeconds) * 100));

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      isLight 
        ? 'bg-[#f7f3e8] text-stone-900 selection:bg-amber-600 selection:text-white' 
        : 'bg-stone-950 text-stone-100 selection:bg-amber-600 selection:text-white'
    }`}>
      
      {/* Top Navigation */}
      <header className={`sticky top-0 z-40 backdrop-blur-xl border-b transition-colors ${
        isLight
          ? 'bg-[#f7f3e8]/90 border-[#e5dcce] shadow-xs'
          : 'bg-stone-950/85 border-stone-800/80'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-600/20">
              <BookOpen className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className={`font-cinzel text-lg font-bold tracking-wider ${isLight ? 'text-stone-900' : 'text-white'}`}>
                Bible Wallpapers
              </span>
              <span className={`hidden sm:inline-block text-[11px] font-medium ml-2 px-2 py-0.5 rounded-full border ${
                isLight 
                  ? 'text-amber-800 bg-amber-600/10 border-amber-600/20' 
                  : 'text-amber-400/90 bg-amber-500/10 border-amber-500/20'
              }`}>
                Scripture & Faith
              </span>
            </div>
          </div>

          {/* Right Controls: Theme Toggle, Auto-Changer, Offline Status, Language, Bookmarks, VIP */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button (Dark <-> Warm Paper <-> Auto Solar Sunrise/Sunset) */}
            <div className="flex items-center">
              <button
                onClick={() => {
                  triggerWebHaptic('selection');
                  if (solarConfig.mode === 'dark') {
                    setThemePreference('light');
                  } else if (solarConfig.mode === 'light') {
                    setThemePreference('auto_sun');
                  } else {
                    setThemePreference('dark');
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                  isLight
                    ? 'bg-[#ece3d2] hover:bg-[#e4dac6] border-[#d8ccb6] text-amber-950 shadow-xs'
                    : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-200'
                }`}
                title={`Theme Mode: ${
                  solarConfig.mode === 'auto_sun'
                    ? `Auto Solar Schedule (${isLight ? 'Daytime Warm Paper' : 'Nighttime Dark'}) — Click to cycle`
                    : isLight
                      ? 'Warm Paper Light — Click to cycle'
                      : 'Dark Mode — Click to cycle'
                }`}
              >
                {solarConfig.mode === 'auto_sun' ? (
                  <>
                    <Sunrise className="w-3.5 h-3.5 text-amber-500 animate-pulse shrink-0" />
                    <span className="hidden md:inline">Auto ({isLight ? 'Day' : 'Night'})</span>
                  </>
                ) : isLight ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span className="hidden md:inline">Warm Paper</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="hidden md:inline">Dark</span>
                  </>
                )}
              </button>

              <button
                onClick={() => openSettings('theme')}
                className={`ml-1 p-2 rounded-xl text-xs transition border ${
                  isLight
                    ? 'bg-[#ece3d2] hover:bg-[#e4dac6] border-[#d8ccb6] text-stone-700'
                    : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-400 hover:text-stone-200'
                }`}
                title="Configure Sunrise & Sunset Schedule in Settings"
              >
                <Sliders className="w-3.5 h-3.5 text-amber-500" />
              </button>
            </div>

            {/* 1-Hour Lock Screen Auto-Changer Quick Button */}
            <button
              onClick={() => setIsAutoChangerOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition shadow-sm ${
                isLight
                  ? 'bg-[#ede5d4] hover:bg-[#e5dcba] border-amber-600/30 text-amber-900'
                  : 'bg-stone-900 hover:bg-stone-850 border-amber-500/30 text-amber-300'
              }`}
              title="1-Hour Automatic Lock Screen Wallpaper Changer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Auto Lock Screen:</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">1h</span>
              {autoConfig.enabled && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Offline Server Status indicator */}
            <button
              onClick={() => setIsAutoChangerOpen(true)}
              className={`p-2 rounded-xl border transition flex items-center gap-1 text-xs font-semibold ${
                isOfflineMode || isNetworkOffline
                  ? (isLight ? 'bg-rose-500/15 border-rose-500/30 text-rose-800' : 'bg-rose-500/15 border-rose-500/30 text-rose-300')
                  : (isLight ? 'bg-emerald-600/15 border-emerald-600/30 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400')
              }`}
              title={isOfflineMode || isNetworkOffline ? 'Running in Offline Mode' : 'Online & Offline Ready'}
            >
              {isOfflineMode || isNetworkOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Offline</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Ready</span>
                </>
              )}
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  isLight
                    ? 'bg-[#eee7d8] border-[#dfd5c3] hover:border-[#cfc4b0] text-stone-800'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-200'
                }`}
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden md:inline">{currentLangObj.displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {langDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-44 border rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in ${
                  isLight
                    ? 'bg-[#fbf7ee] border-[#dfd5c3]'
                    : 'bg-stone-900 border-stone-800'
                }`}>
                  <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border-b ${
                    isLight ? 'text-stone-500 border-[#e5dcce]' : 'text-stone-400 border-stone-800'
                  }`}>
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition ${
                        isLight ? 'hover:bg-[#eee5d4] text-stone-850' : 'hover:bg-stone-800/80 text-stone-200'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.displayName}</span>
                      </span>
                      {selectedLanguage === lang.code && (
                        <Check className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fonts Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setFontThemeDropdownOpen(!fontThemeDropdownOpen);
                  setFadeDropdownOpen(false);
                  setLangDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  isLight
                    ? 'bg-[#eee7d8] border-[#dfd5c3] hover:border-[#cfc4b0] text-stone-800'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-200'
                }`}
                title="Change Scripture Typography Font Theme"
              >
                <Type className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">Font:</span>
                <span className="font-semibold">{currentFontThemeOption.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {fontThemeDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-64 border rounded-2xl shadow-2xl py-2 z-50 animate-fade-in ${
                  isLight ? 'bg-[#fbf7ee] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
                }`}>
                  <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border-b flex items-center justify-between ${
                    isLight ? 'text-stone-500 border-[#e5dcce]' : 'text-stone-400 border-stone-800'
                  }`}>
                    <span>Fonts Theme</span>
                    <span className="text-[10px] text-amber-500 font-mono">5 styles</span>
                  </div>
                  <div className="py-1">
                    {FONT_THEMES.map((th) => (
                      <button
                        key={th.id}
                        onClick={() => handleSelectFontTheme(th.id)}
                        className={`w-full px-3 py-2 text-xs flex flex-col text-left transition ${
                          fontTheme === th.id
                            ? (isLight ? 'bg-amber-500/15 text-amber-950 font-bold' : 'bg-amber-600/20 text-amber-300 font-bold')
                            : (isLight ? 'hover:bg-[#eee5d4] text-stone-800' : 'hover:bg-stone-800/80 text-stone-200')
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-semibold">{th.name}</span>
                          {fontTheme === th.id && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                        </div>
                        <span className={`text-[11px] truncate opacity-90 mt-0.5 ${th.verseFontClass}`}>
                          "The Lord is my light"
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Wallpaper Fading Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setFadeDropdownOpen(!fadeDropdownOpen);
                  setFontThemeDropdownOpen(false);
                  setLangDropdownOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border transition ${
                  isLight
                    ? 'bg-[#eee7d8] border-[#dfd5c3] hover:border-[#cfc4b0] text-stone-800'
                    : 'bg-stone-900 border-stone-800 hover:border-stone-700 text-stone-200'
                }`}
                title="Change Wallpaper Fading & Edge Vignette"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">Fade:</span>
                <span className="font-semibold">{WALLPAPER_FADE_OPTIONS.find((f) => f.id === wallpaperFade)?.name.split(' ')[0]}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {fadeDropdownOpen && (
                <div className={`absolute right-0 mt-2 w-56 border rounded-2xl shadow-2xl py-2 z-50 animate-fade-in ${
                  isLight ? 'bg-[#fbf7ee] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
                }`}>
                  <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider border-b flex items-center justify-between ${
                    isLight ? 'text-stone-500 border-[#e5dcce]' : 'text-stone-400 border-stone-800'
                  }`}>
                    <span>Wallpaper Fading</span>
                    <span className="text-[10px] text-amber-500 font-mono">Vignette</span>
                  </div>
                  <div className="py-1">
                    {WALLPAPER_FADE_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => handleSelectWallpaperFade(opt.id)}
                        className={`w-full px-3 py-2 text-xs flex items-center justify-between text-left transition ${
                          wallpaperFade === opt.id
                            ? (isLight ? 'bg-amber-500/15 text-amber-950 font-bold' : 'bg-amber-600/20 text-amber-300 font-bold')
                            : (isLight ? 'hover:bg-[#eee5d4] text-stone-800' : 'hover:bg-stone-800/80 text-stone-200')
                        }`}
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{opt.name}</span>
                          <span className="text-[10px] text-stone-400">{opt.subtitle}</span>
                        </div>
                        {wallpaperFade === opt.id && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Random Scripture Button */}
            <button
              onClick={handleRandomScripture}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition shadow-xs hover:scale-[1.02] active:scale-95 ${
                isLight
                  ? 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-600/30 text-amber-900 hover:text-amber-950'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-amber-200'
              }`}
              title="Select a random scripture wallpaper from the collection and open preview"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden md:inline">Random Scripture</span>
              <span className="md:hidden">Random</span>
            </button>

            {/* Daily Scripture Reading Streak Header Quick Badge */}
            <button
              onClick={() => {
                triggerWebHaptic('selection');
                const el = document.getElementById('daily-streak-section');
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold border transition shadow-xs hover:scale-[1.02] active:scale-95 ${
                isLight
                  ? 'bg-amber-600/10 hover:bg-amber-600/20 border-amber-600/30 text-amber-950'
                  : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300'
              }`}
              title={`Daily Scripture Streak: ${streakData.currentStreak} Days! Click to view milestone rewards`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-current animate-pulse" />
              <span className="font-mono">{streakData.currentStreak}d</span>
              <span className="hidden xl:inline text-[11px] font-normal opacity-85">Streak</span>
            </button>

            {/* Favorites Toggle */}
            <button
              onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-medium border transition flex items-center gap-1.5 ${
                filterFavoritesOnly
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-500'
                  : isLight
                    ? 'bg-[#eee7d8] border-[#dfd5c3] text-stone-800 hover:text-stone-950'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Filter bookmarks"
            >
              <Heart className={`w-4 h-4 ${filterFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Bookmarks</span>
              {favorites.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-400 font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Settings & Preferences Menu Button */}
            <button
              onClick={() => openSettings('haptics')}
              className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 shadow-xs hover:scale-[1.02] active:scale-95 ${
                isLight
                  ? 'bg-[#eee7d8] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-850 hover:text-stone-950'
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Open Settings & Preferences (Haptic Feedback toggle & intensity, Auto Lock Screen, Offline Storage)"
            >
              <Settings2 className="w-4 h-4 text-amber-500" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* VIP Pass Button */}
            {isPremiumUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
                <Crown className="w-4 h-4 fill-current text-amber-500" />
                <span className="hidden sm:inline">VIP Active</span>
              </div>
            ) : (
              <button
                onClick={() => setIsUpgradeOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 hover:scale-[1.02] transition"
              >
                <Crown className="w-3.5 h-3.5 fill-current" />
                <span>Get VIP</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Offline Banner Notification if active */}
        {(isOfflineMode || isNetworkOffline) && (
          <div className={`p-3 px-4 rounded-2xl border flex items-center justify-between text-xs ${
            isLight
              ? 'bg-amber-600/10 border-amber-600/30 text-amber-900'
              : 'bg-amber-500/15 border-amber-500/30 text-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Offline Server Active: Operating with local cached scripture wallpapers and offline auto-changer.</span>
            </div>
            <button
              onClick={() => setIsOfflineMode(false)}
              className="text-amber-600 dark:text-amber-400 font-bold underline text-xs"
            >
              Switch Online
            </button>
          </div>
        )}

        {/* Daily Verse of the Day (24h cadence for standard users, 1h cadence for VIP subscribers) */}
        <DailyVerseBanner
          language={selectedLanguage}
          isPremiumUser={isPremiumUser}
          isLight={isLight}
          onPreviewWallpaper={(w) => {
            handleScriptureInteracted();
            setPreviewingWallpaper(w);
          }}
          onSetLockScreen={(w) => {
            handleScriptureInteracted();
            setCurrentLockscreenWallpaper(w);
            setIsAutoChangerOpen(true);
          }}
          onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
          onToggleFavorite={(id) => {
            handleScriptureInteracted();
            toggleFavorite(id);
          }}
          favorites={favorites}
          fontTheme={fontTheme}
          wallpaperFade={wallpaperFade}
          onInteract={handleScriptureInteracted}
          onOpenSharePreview={handleOpenSharePreview}
          onOpenDownloadPreview={handleOpenDownloadPreview}
        />

        {/* Daily Scripture Reading Streak Tracker Module */}
        <div id="daily-streak-section">
          <StreakTrackerCard
            streakData={streakData}
            onStreakUpdate={(updated) => setStreakData(updated)}
            isLight={isLight}
            onReadVerseClick={() => {
              handleScriptureInteracted();
              if (wallpapers.length > 0) {
                setPreviewingWallpaper(wallpapers[0]);
              }
            }}
          />
        </div>

        {/* Hero Section */}
        <div className={`relative rounded-3xl overflow-hidden border p-6 md:p-10 shadow-xl transition-colors ${
          isLight
            ? 'bg-gradient-to-b from-[#f3ece0] to-[#fbf8f2] border-[#e0d6c5] shadow-sm'
            : 'bg-gradient-to-b from-stone-900/90 to-stone-950 border-stone-800/80 shadow-xl'
        }`}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold uppercase tracking-wider mb-4 ${
              isLight
                ? 'bg-amber-600/10 border-amber-600/25 text-amber-800'
                : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5" />
              Daily Scripture Collection & Hourly Changer
            </div>
            <h1 className={`text-3xl sm:text-4xl md:text-5xl font-extrabold font-cinzel leading-tight tracking-tight ${
              isLight ? 'text-stone-950' : 'text-white'
            }`}>
              Carry God's Word Everywhere You Go
            </h1>
            <p className={`mt-3 text-sm sm:text-base leading-relaxed ${
              isLight ? 'text-stone-700' : 'text-stone-300'
            }`}>
              Automatic 1-hour phone lock screen wallpaper rotation, multilingual Bible verses, offline server capabilities, and warm reading paper mode.
            </p>

            {/* Quick Actions & Search */}
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search verse, psalm, or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition ${
                      isLight
                        ? 'bg-white/90 border border-[#d8cca8] text-stone-900 placeholder-stone-500 focus:outline-none focus:border-amber-600 shadow-xs'
                        : 'bg-stone-900 border border-stone-800 text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 shadow-inner'
                    }`}
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition"
                >
                  Search
                </button>
              </form>

              <button
                onClick={() => setIsAutoChangerOpen(true)}
                className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 border ${
                  isLight
                    ? 'bg-[#eee7d8] hover:bg-[#e6dece] border-amber-600/30 text-amber-900'
                    : 'bg-stone-900 hover:bg-stone-850 border-amber-500/30 text-amber-300'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-500" />
                <span>Configure 1-Hr Changer</span>
              </button>
            </div>
          </div>
        </div>

        {/* Automatic Wallpaper Rotation Dashboard Module with Live Visual Progress Bar & Countdown Timer */}
        {(currentLockscreenWallpaper || wallpapers.length > 0) && (() => {
          const activeWallpaper = currentLockscreenWallpaper || wallpapers[0];
          return (
            <div className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 shadow-lg ${
              isLight
                ? 'bg-gradient-to-r from-[#fbf6ec] via-[#f5ede0] to-[#f9f3e9] border-[#d8cca8] shadow-md'
                : 'bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/20 border-amber-500/25 shadow-xl'
            }`}>
              {/* Header: Title, Status Indicator, and Live Countdown Timer Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-800/20 dark:border-stone-800/60">
                <div className="flex items-center flex-wrap gap-2.5">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    autoConfig.enabled
                      ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                      : isLight
                        ? 'bg-stone-300/60 text-stone-700 border border-stone-300'
                        : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${autoConfig.enabled ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
                    {autoConfig.enabled ? 'Automatic Lock Screen Rotation: Active' : 'Automatic Rotation: Paused'}
                  </span>

                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full border ${
                    isLight 
                      ? 'bg-amber-600/10 text-amber-900 border-amber-600/20' 
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}>
                    {batteryState.effectiveAction === 'reduced'
                      ? `Cadence: ${activeIntervalMinutes}m (Extended for Battery Saver)`
                      : batteryState.effectiveAction === 'paused'
                        ? 'Cadence: Paused by Battery Saver'
                        : `Every ${autoConfig.intervalMinutes}m (${autoConfig.intervalMinutes === 60 ? '1 Hour' : `${autoConfig.intervalMinutes} Mins`})`}
                  </span>

                  {/* Battery Saver Status Chip */}
                  <button
                    type="button"
                    onClick={() => openSettings('battery')}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition cursor-pointer hover:opacity-90 ${
                      batteryState.isSaverTriggered
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : autoConfig.batterySaver?.enabled
                          ? isLight
                            ? 'bg-emerald-600/10 text-emerald-800 border-emerald-600/25'
                            : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                          : isLight
                            ? 'bg-stone-200 text-stone-600 border-stone-300'
                            : 'bg-stone-800 text-stone-400 border-stone-700'
                    }`}
                    title="Click to view and configure Battery Saver Mode in Settings"
                  >
                    {batteryState.batteryInfo.charging ? (
                      <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : batteryState.batteryInfo.level <= 20 ? (
                      <BatteryLow className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    ) : (
                      <BatteryMedium className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    )}
                    <span>{batteryState.statusBadge.label}</span>
                  </button>
                </div>

                {/* Digital Live Countdown Timer Badge */}
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-mono text-xs font-bold self-start sm:self-auto shadow-xs ${
                  autoConfig.enabled && batteryState.effectiveAction !== 'paused'
                    ? isLight
                      ? 'bg-amber-600/10 border-amber-600/30 text-amber-950'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                    : isLight
                      ? 'bg-stone-200 border-stone-300 text-stone-600'
                      : 'bg-stone-800 border-stone-700 text-stone-400'
                }`}>
                  <Clock className={`w-3.5 h-3.5 ${autoConfig.enabled && batteryState.effectiveAction !== 'paused' ? 'text-amber-500 animate-spin [animation-duration:10s]' : 'text-stone-400'}`} />
                  <span>
                    {autoConfig.enabled 
                      ? batteryState.effectiveAction === 'paused'
                        ? `Rotation Paused (Battery ${batteryState.batteryInfo.level}%)`
                        : `Next rotation in: ${formatCountdownTimer(remainingTimeSeconds)}` 
                      : 'Rotation paused'}
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar Section */}
              <div className="py-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${isLight ? 'text-stone-800' : 'text-stone-200'}`}>
                      Rotation Cycle Progress
                    </span>
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-bold">
                      {Math.round(rotationProgressPercent)}%
                    </span>
                  </div>
                  <span className={`font-mono text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    {autoConfig.enabled 
                      ? `${formatCountdownTimer(remainingTimeSeconds)} remaining`
                      : 'Paused'}
                  </span>
                </div>

                {/* Progress Track */}
                <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border shadow-inner ${
                  isLight 
                    ? 'bg-[#e8decb] border-[#d8ccb6]' 
                    : 'bg-stone-950 border-stone-800'
                }`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-linear relative ${
                      autoConfig.enabled
                        ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-400 shadow-sm'
                        : 'bg-stone-600'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(2, rotationProgressPercent))}%` }}
                  >
                    {/* Glowing head dot indicator */}
                    {autoConfig.enabled && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)] animate-ping" />
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  <span>Cycle start (0m)</span>
                  <span className="italic">Automatic background wallpaper rotation</span>
                  <span>Target ({autoConfig.intervalMinutes}m)</span>
                </div>
              </div>

              {/* Middle Row: Active Wallpaper + Queue Preview + Interactive Actions */}
              <div className="pt-2 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                {/* Active & Next Wallpapers */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 flex-1">
                  {/* Current Active Wallpaper Item */}
                  <div className="flex items-center gap-3">
                    <div 
                      onClick={() => setPreviewingWallpaper(activeWallpaper)}
                      className="group relative w-14 h-24 sm:w-16 sm:h-28 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 shadow-md cursor-pointer hover:scale-105 transition-transform"
                      title="Click to preview active lock screen"
                    >
                      <img
                        key={activeWallpaper.id}
                        src={activeWallpaper.imageUrl}
                        alt={activeWallpaper.verseReference}
                        className="w-full h-full object-cover animate-wallpaper-fade"
                      />
                      {/* Wallpaper Fading Overlay */}
                      {wallpaperFade === 'soft' && (
                        <div className="absolute inset-0 wallpaper-fade-soft pointer-events-none" />
                      )}
                      {wallpaperFade === 'deep' && (
                        <div className="absolute inset-0 wallpaper-fade-deep pointer-events-none" />
                      )}
                      {wallpaperFade === 'dreamy' && (
                        <div className="absolute inset-0 wallpaper-fade-dreamy pointer-events-none" />
                      )}
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                      <div className="absolute bottom-1 right-1 px-1.5 py-0.2 rounded bg-black/75 text-[8px] text-amber-300 font-mono font-bold tracking-wider">
                        ACTIVE
                      </div>
                    </div>

                    <div className="max-w-xs sm:max-w-sm">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                          Current Lock Screen
                        </span>
                        <span className="text-[10px] text-stone-400">
                          • {activeWallpaper.category}
                        </span>
                      </div>
                      <h4 className={`text-sm ${currentFontThemeOption.verseFontClass} line-clamp-1 ${
                        isLight ? 'text-stone-900 font-medium' : 'text-white'
                      }`}>
                        "{activeWallpaper.verseText}"
                      </h4>
                      <p className={`text-xs ${currentFontThemeOption.refFontClass} font-bold text-amber-700 dark:text-amber-300 mt-0.5`}>
                        — {activeWallpaper.verseReference}
                      </p>
                    </div>
                  </div>

                  {/* Next Up in Rotation Queue */}
                  {nextWallpaper && (
                    <div className={`hidden md:flex items-center gap-3 pl-4 border-l ${
                      isLight ? 'border-stone-300' : 'border-stone-800'
                    }`}>
                      <div className="text-[10px] text-stone-400 font-mono flex flex-col items-center">
                        <span>Rotates</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                      </div>

                      <div 
                        onClick={() => setPreviewingWallpaper(nextWallpaper)}
                        className="group relative w-11 h-18 sm:w-12 sm:h-20 rounded-xl overflow-hidden border border-stone-600/40 shrink-0 opacity-80 hover:opacity-100 cursor-pointer shadow hover:scale-105 transition-all"
                        title="Next wallpaper in rotation queue"
                      >
                        <img
                          src={nextWallpaper.imageUrl}
                          alt={nextWallpaper.verseReference}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/30" />
                        <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 text-[7px] text-stone-200 font-mono">
                          NEXT
                        </div>
                      </div>

                      <div className="max-w-[170px]">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400 block">
                          Next Scripture
                        </span>
                        <p className={`text-xs font-cinzel font-semibold truncate ${isLight ? 'text-stone-800' : 'text-stone-300'}`}>
                          {nextWallpaper.verseReference}
                        </p>
                        <p className="text-[10px] text-stone-400 truncate">
                          {nextWallpaper.visualTheme || nextWallpaper.category}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Control Action Buttons */}
                <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 justify-end w-full lg:w-auto pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-800/20 dark:border-stone-800/60">
                  {/* Manual Rotate Now */}
                  <button
                    onClick={handleRotateNow}
                    className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition hover:scale-[1.02] active:scale-95"
                    title="Advance to next wallpaper immediately and restart countdown timer"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Rotate Now</span>
                  </button>

                  {/* Pause / Resume Button */}
                  <button
                    onClick={handleToggleAutoRotation}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                      autoConfig.enabled
                        ? isLight
                          ? 'bg-[#e8decb] hover:bg-[#dfd4c0] border-[#d5caba] text-stone-800'
                          : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-300'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500'
                    }`}
                    title={autoConfig.enabled ? 'Pause automatic wallpaper rotation' : 'Resume automatic wallpaper rotation'}
                  >
                    {autoConfig.enabled ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Pause</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </>
                    )}
                  </button>

                  {/* Inspect Lock Screen Fullscreen */}
                  <button
                    onClick={() => setPreviewingWallpaper(activeWallpaper)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition ${
                      isLight
                        ? 'bg-[#f0e7d7] hover:bg-[#e7ddcb] border-[#d8cca8] text-amber-950'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-200'
                    }`}
                    title="Open phone frame lock screen preview"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                    <span className="hidden sm:inline">Inspect Phone</span>
                  </button>

                  {/* Changer Settings Modal */}
                  <button
                    onClick={() => setIsAutoChangerOpen(true)}
                    className={`p-2.5 rounded-xl border transition ${
                      isLight
                        ? 'bg-[#ece3d2] hover:bg-[#e3d8c5] border-[#d8cca8] text-stone-800'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300'
                    }`}
                    title="Change rotation interval & configure offline caching"
                  >
                    <Settings2 className="w-4 h-4 text-amber-500" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Curated 4K Scripture Collections (5 Collections x 30 Wallpapers = 150 Dual Language Wallpapers) */}
        <CuratedCollectionsBar
          selectedCollection={selectedCollection}
          onSelectCollection={handleCollectionChange}
          isLight={isLight}
          language={selectedLanguage}
          totalCollectionCount={150}
        />

        {/* Scripture Topics & Visual Themes Filters */}
        <div className="space-y-2.5">
          {/* Scripture Topics Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className={`text-xs font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-2 ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}>
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              Verse Topics:
            </div>
            
            <button
              onClick={() => setIsTopicsModalOpen(true)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border bg-amber-500/15 border-amber-500/40 text-amber-500 hover:bg-amber-500/25 flex items-center gap-1.5 shrink-0 shadow-xs"
              title="Open directory of all Bible topics & theme wallpapers wrt topic"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>All Topics Directory</span>
            </button>

            {SCRIPTURE_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleCategoryChange(topic)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                  selectedCategory === topic
                    ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/20'
                    : isLight
                      ? 'bg-[#eee6d6] border-[#ded3c0] text-stone-800 hover:text-stone-950 hover:bg-[#e6decd]'
                      : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Visual Aesthetic Backgrounds Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <div className={`text-xs font-semibold uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-2 ${
              isLight ? 'text-stone-600' : 'text-stone-400'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Visual Themes:
            </div>
            {VISUAL_THEMES.map((theme) => {
              const isRecommended = activeTopicInfo?.recommendedThemes.includes(theme);
              return (
                <button
                  key={theme}
                  onClick={() => handleVisualThemeChange(theme)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition border flex items-center gap-1.5 ${
                    selectedVisualTheme === theme
                      ? isLight
                        ? 'bg-amber-900 border-amber-800 text-amber-50 font-semibold shadow-xs'
                        : 'bg-stone-800 border-amber-400 text-amber-300 font-semibold shadow-sm'
                      : isRecommended
                        ? isLight
                          ? 'bg-amber-100/70 border-amber-500/60 text-amber-900 font-semibold shadow-xs'
                          : 'bg-stone-900 border-amber-500/60 text-amber-300 font-semibold shadow-xs'
                        : isLight
                          ? 'bg-[#f4eee2] border-[#ded3c0] text-stone-800 hover:text-stone-950 hover:bg-[#eae2cf]'
                          : 'bg-stone-950 border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-750'
                  }`}
                >
                  <span>{theme}</span>
                  {isRecommended && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                      wrt topic
                    </span>
                  )}
                </button>
              );
            })}

            {/* Testament Quick Filter */}
            <div className="ml-auto pl-2 flex items-center gap-1 shrink-0">
              {['All', 'Old', 'New'].map((testament) => (
                <button
                  key={testament}
                  onClick={() => handleTestamentChange(testament)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase transition border ${
                    selectedTestament === testament
                      ? isLight
                        ? 'bg-amber-600/20 border-amber-600 text-amber-950'
                        : 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : isLight
                        ? 'bg-[#eee7d8] border-[#dfd5c3] text-stone-600 hover:text-stone-900'
                        : 'bg-stone-900 border-stone-800 text-stone-500 hover:text-stone-300'
                  }`}
                  title={`${testament} Testament`}
                >
                  {testament === 'All' ? 'All Books' : `${testament} Test.`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Topic Spotlight & Theme wrt Topic Banner */}
        {activeTopicInfo && (
          <div className={`p-4 sm:p-5 rounded-3xl border transition-all ${
            isLight
              ? 'bg-gradient-to-r from-[#f7f0e4] to-[#fbf8f2] border-amber-600/30 shadow-xs'
              : 'bg-gradient-to-r from-stone-900 via-stone-900/90 to-stone-950 border-amber-500/30 shadow-md'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-500 border border-amber-500/30">
                    Topic Spotlight
                  </span>
                  <span className="text-sm font-bold font-cinzel text-amber-600 dark:text-amber-400">
                    {activeTopicInfo.name}
                  </span>
                  <button
                    onClick={() => setIsTopicsModalOpen(true)}
                    className="text-[11px] text-amber-500 hover:underline flex items-center gap-1"
                  >
                    <span>View all topics</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>
                </div>
                <p className={`text-xs ${isLight ? 'text-stone-700' : 'text-stone-300'}`}>
                  {activeTopicInfo.shortDesc}
                </p>
                <div className="text-xs italic font-serif-scripture text-stone-600 dark:text-stone-300">
                  "{activeTopicInfo.keyVerseText}" — <span className="font-cinzel font-bold not-italic text-amber-500">{activeTopicInfo.keyVerseRef}</span>
                </div>
              </div>

              {/* Theme wrt Topic recommendation */}
              <div className={`p-3 rounded-2xl border flex flex-col gap-1.5 shrink-0 md:max-w-xs ${
                isLight ? 'bg-white/80 border-[#ded3be]' : 'bg-stone-950/80 border-stone-800'
              }`}>
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Theme Wallpaper wrt Topic:
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  {activeTopicInfo.recommendedThemes.map((th, i) => (
                    <button
                      key={i}
                      onClick={() => handleVisualThemeChange(th)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border transition ${
                        selectedVisualTheme === th
                          ? 'bg-amber-600 text-white border-amber-500 font-bold'
                          : isLight
                            ? 'bg-stone-100 hover:bg-stone-200 border-stone-200 text-stone-800'
                            : 'bg-stone-900 hover:bg-stone-800 border-stone-750 text-stone-300'
                      }`}
                    >
                      {th}
                    </button>
                  ))}
                </div>
                <p className={`text-[10px] italic ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                  {activeTopicInfo.themeRationale}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Wallpapers Grid */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <h2 className={`text-lg font-bold font-cinzel flex items-center gap-2 ${
                isLight ? 'text-stone-900' : 'text-white'
              }`}>
                <span>Wallpapers</span>
                <span className={`text-xs font-sans font-normal ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  ({displayedWallpapers.length} {displayedWallpapers.length === 1 ? 'item' : 'items'})
                </span>
              </h2>

              {filterFavoritesOnly && (
                <button
                  onClick={() => setFilterFavoritesOnly(false)}
                  className="text-xs text-amber-500 hover:underline"
                >
                  Clear Bookmark Filter
                </button>
              )}
            </div>

            {/* Sorting & Bulk Action Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Sorting Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition flex items-center gap-1.5 shadow-xs ${
                    isLight
                      ? 'bg-[#f4eee2] hover:bg-[#eae2d2] border-[#ded4c3] text-stone-850'
                      : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-200'
                  }`}
                  title="Order wallpapers by Newest, Most Downloaded, or Alphabetical"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline text-stone-400 font-normal">Order:</span>
                  <span className="font-semibold">
                    {selectedLanguage === 'ta'
                      ? SORT_OPTIONS.find((s) => s.id === sortOption)?.labelTamil
                      : SORT_OPTIONS.find((s) => s.id === sortOption)?.label}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                </button>

                {sortDropdownOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setSortDropdownOpen(false)} 
                    />
                    <div className={`absolute right-0 mt-2 w-64 border rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in ${
                      isLight ? 'bg-[#fbf7ee] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
                    }`}>
                      <div className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border-b flex items-center justify-between ${
                        isLight ? 'text-stone-500 border-[#e5dcce]' : 'text-stone-400 border-stone-800'
                      }`}>
                        <span>{selectedLanguage === 'ta' ? 'வரிசைப்படுத்துதல்' : 'Order Wallpapers'}</span>
                        <span className="text-[10px] text-amber-500 font-mono">3 options</span>
                      </div>
                      <div className="py-1">
                        {SORT_OPTIONS.map((opt) => {
                          const isSelected = sortOption === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => handleSortChange(opt.id)}
                              className={`w-full px-3 py-2 text-xs flex flex-col text-left transition ${
                                isSelected
                                  ? (isLight ? 'bg-amber-500/15 text-amber-950 font-bold' : 'bg-amber-600/20 text-amber-300 font-bold')
                                  : (isLight ? 'hover:bg-[#eee5d4] text-stone-800' : 'hover:bg-stone-800/80 text-stone-200')
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <span className="font-semibold">
                                  {selectedLanguage === 'ta' ? opt.labelTamil : opt.label}
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                              </div>
                              <span className={`text-[10px] mt-0.5 ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                                {opt.subtitle}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {selectionMode ? (
                <>
                  <button
                    onClick={handleSelectAll}
                    className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
                      isLight 
                        ? 'bg-[#eee7d8] border-[#ded4c3] text-stone-850 hover:bg-[#e4dcce]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                    }`}
                  >
                    {selectedIds.length === displayedWallpapers.length ? (
                      <>
                        <CheckSquare className="w-3.5 h-3.5 text-amber-500" />
                        <span>Deselect All</span>
                      </>
                    ) : (
                      <>
                        <Square className="w-3.5 h-3.5" />
                        <span>Select All ({displayedWallpapers.length})</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBulkDownload}
                    disabled={isBulkDownloading}
                    className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition disabled:opacity-50"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>
                      {selectedIds.length > 0
                        ? `Download Selected (${selectedIds.length})`
                        : `Download All (${displayedWallpapers.length})`}
                    </span>
                    {!isPremiumUser && <Crown className="w-3 h-3 ml-0.5 fill-current" />}
                  </button>

                  <button
                    onClick={() => {
                      triggerWebHaptic('warning');
                      setSelectionMode(false);
                      setSelectedIds([]);
                    }}
                    className={`px-2.5 py-1.5 text-xs rounded-xl border transition ${
                      isLight ? 'border-stone-300 text-stone-600' : 'border-stone-800 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    triggerWebHaptic('selection');
                    setSelectionMode(true);
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition flex items-center gap-1.5 ${
                    isLight
                      ? 'bg-[#f4eee2] hover:bg-[#eae2d2] border-[#ded4c3] text-stone-800'
                      : 'bg-stone-900/90 hover:bg-stone-850 border-stone-800 text-stone-300 hover:text-white'
                  }`}
                  title="Select multiple wallpapers for 1-click batch download"
                >
                  <FolderDown className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bulk Download</span>
                  {!isPremiumUser && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                      VIP
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="py-24 text-center">
              <div className="w-10 h-10 border-3 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-stone-400">Loading inspiring scripture wallpapers...</p>
            </div>
          ) : displayedWallpapers.length === 0 ? (
            <div className="py-20 text-center bg-stone-900/40 rounded-3xl border border-stone-800 p-8">
              <BookOpen className="w-12 h-12 text-stone-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-stone-200">No wallpapers found</h3>
              <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                {filterFavoritesOnly
                  ? "You haven't added any wallpapers to your bookmarks yet. Tap the heart icon on any wallpaper!"
                  : "Try searching with a different scripture keyword or change the category filter."}
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedVisualTheme('All Aesthetics');
                  setSelectedTestament('All');
                  setSearchQuery('');
                  setFilterFavoritesOnly(false);
                }}
                className="mt-4 px-4 py-2 bg-stone-800 hover:bg-stone-700 text-xs font-medium text-stone-200 rounded-xl transition"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div
              key={`${selectedCategory}-${selectedVisualTheme}-${selectedTestament}`}
              className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 transition-all duration-300 ${
                isFilterTransitioning ? 'opacity-40 scale-[0.995] pointer-events-none' : 'opacity-100 scale-100 animate-cross-fade'
              }`}
            >
              {displayedWallpapers.map((wallpaper) => {
                const isFav = favorites.includes(wallpaper.id);
                const isCurrentLock = currentLockscreenWallpaper?.id === wallpaper.id;
                const isSelected = selectedIds.includes(wallpaper.id);
                return (
                  <div
                    key={wallpaper.id}
                    onClick={() => {
                      if (selectionMode) {
                        toggleSelectWallpaper(wallpaper.id);
                      }
                    }}
                    className={`group relative rounded-3xl overflow-hidden bg-stone-900 border transition-all duration-300 flex flex-col aspect-[9/16] ${
                      selectionMode ? 'cursor-pointer' : ''
                    } ${
                      isSelected
                        ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-2xl shadow-amber-500/20 scale-[1.01]'
                        : 'border-stone-800 hover:border-amber-500/40 hover:shadow-2xl hover:shadow-black/60'
                    }`}
                  >
                    {/* Background Wallpaper Image */}
                    <img
                      key={`${wallpaper.id}-${wallpaperFade}`}
                      src={wallpaper.imageUrl}
                      alt={wallpaper.verseReference}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 animate-wallpaper-fade"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 transition-opacity" />

                    {/* Active Wallpaper Fading Overlay */}
                    {wallpaperFade === 'soft' && (
                      <div className="absolute inset-0 wallpaper-fade-soft pointer-events-none transition-opacity duration-300" />
                    )}
                    {wallpaperFade === 'deep' && (
                      <div className="absolute inset-0 wallpaper-fade-deep pointer-events-none transition-opacity duration-300" />
                    )}
                    {wallpaperFade === 'dreamy' && (
                      <div className="absolute inset-0 wallpaper-fade-dreamy pointer-events-none transition-opacity duration-300" />
                    )}

                    {/* Top Badges */}
                    <div className="relative z-10 p-3.5 flex items-center justify-between">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {selectionMode && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectWallpaper(wallpaper.id);
                            }}
                            className={`p-1.5 rounded-xl flex items-center justify-center transition border shadow-md ${
                              isSelected
                                ? 'bg-amber-500 border-amber-400 text-stone-950 scale-105'
                                : 'bg-black/60 border-white/20 text-white/70 hover:text-white'
                            }`}
                            title={isSelected ? 'Deselect wallpaper' : 'Select wallpaper'}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        )}
                        <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-black/60 backdrop-blur-md rounded-full text-stone-200 border border-white/10 uppercase tracking-wider">
                          {wallpaper.category}
                        </span>
                        {wallpaper.collection && (
                          <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/25 backdrop-blur-md rounded-full text-emerald-300 border border-emerald-500/40">
                            {wallpaper.collection.replace(/_/g, ' ')}
                          </span>
                        )}
                        {wallpaper.resolution === '2160x3840' && (
                          <span className="px-2 py-0.5 text-[9px] font-mono font-bold bg-amber-500/25 backdrop-blur-md rounded-full text-amber-300 border border-amber-500/40">
                            4K UHD
                          </span>
                        )}
                        {wallpaper.visualTheme && (
                          <span className="hidden sm:inline-block px-2 py-0.5 text-[9px] font-medium bg-amber-500/20 backdrop-blur-md rounded-full text-amber-300 border border-amber-500/30">
                            {wallpaper.visualTheme}
                          </span>
                        )}
                        {isCurrentLock && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-stone-950 rounded-full flex items-center gap-1 shadow">
                            <Clock className="w-2.5 h-2.5" />
                            Lock Screen
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5">
                        {wallpaper.isPremium && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 rounded-full shadow-sm">
                            <Crown className="w-3 h-3 fill-current" />
                            VIP
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenSharePreview(wallpaper)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                            sharedWallpaperId === wallpaper.id
                              ? 'bg-emerald-500/40 border-emerald-500 text-emerald-300'
                              : 'bg-black/50 border-white/10 text-white/80 hover:text-indigo-300 hover:bg-black/80'
                          }`}
                          title="Share Preview & Social Cards"
                        >
                          {sharedWallpaperId === wallpaper.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleFavorite(wallpaper.id)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                            isFav
                              ? 'bg-rose-500/40 border-rose-500 text-rose-300'
                              : 'bg-black/50 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
                          }`}
                          title="Bookmark wallpaper"
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-current' : ''}`} />
                        </button>
                      </div>
                    </div>

                    {/* Bottom Verse Details & Actions */}
                    <div className="relative z-10 mt-auto p-4 flex flex-col">
                      {wallpaper.wallpaperQuote && (
                        <span className="text-[11px] font-semibold tracking-wide text-amber-200/95 mb-1 flex items-center gap-1 drop-shadow-sm line-clamp-1">
                          <Sparkles className="w-3 h-3 text-amber-400 shrink-0" />
                          <span className="italic">"{wallpaper.wallpaperQuote}"</span>
                        </span>
                      )}
                      <p className={`${currentFontThemeOption.verseFontClass} text-stone-100 text-sm line-clamp-3 drop-shadow-md leading-relaxed transition-all`}>
                        "{wallpaper.verseText}"
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`${currentFontThemeOption.refFontClass} text-xs font-bold tracking-wider text-amber-300 drop-shadow`}>
                          {wallpaper.verseReference}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          {wallpaper.language}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-1.5 sm:gap-2">
                        <button
                          onClick={() => {
                            stopScriptureNarration();
                            setSpeakingCardId(null);
                            handleScriptureInteracted();
                            setPreviewingWallpaper(wallpaper);
                          }}
                          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Phone Preview</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleCardSpeech(wallpaper);
                          }}
                          className={`p-2 rounded-xl border transition ${
                            speakingCardId === wallpaper.id
                              ? 'bg-amber-500 border-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/25 animate-pulse'
                              : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300 hover:text-amber-400'
                          }`}
                          title={speakingCardId === wallpaper.id ? 'Stop listening' : 'Listen to scripture recitation'}
                        >
                          {speakingCardId === wallpaper.id ? (
                            <VolumeX className="w-3.5 h-3.5 text-stone-950" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5" />
                          )}
                        </button>

                        <button
                          onClick={() => handleOpenDownloadPreview(wallpaper)}
                          className="p-2 rounded-xl border border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-amber-400 transition"
                          title="Download Preview & Format Options"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleOpenSharePreview(wallpaper)}
                          className="p-2 rounded-xl border border-stone-700 bg-stone-850 hover:bg-stone-800 text-stone-300 hover:text-indigo-400 transition"
                          title="Share Preview & Social Media Cards"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            setCurrentLockscreenWallpaper(wallpaper);
                            setIsAutoChangerOpen(true);
                          }}
                          className="p-2 rounded-xl bg-stone-850 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-amber-400 transition"
                          title="Set as 1-Hour Lock Screen Wallpaper"
                        >
                          <Clock className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Inspiring Short Quote & Sermon Excerpt fetched from server API */}
                      <DailyVerseQuote
                        wallpaper={wallpaper}
                        isLight={isLight}
                        onInteracted={handleScriptureInteracted}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className={`border-t py-8 px-4 text-center text-xs space-y-2 transition-colors ${
        isLight
          ? 'border-[#e2d8c7] bg-[#efe8da] text-stone-600'
          : 'border-stone-800 bg-stone-950 text-stone-500'
      }`}>
        <p className={`font-cinzel font-semibold tracking-wider ${isLight ? 'text-stone-900' : 'text-stone-300'}`}>
          Bible Wallpapers • Scripture for Daily Life
        </p>
        <p className="max-w-md mx-auto">
          Offline-ready server with 1-hour automatic lock screen rotation and warm paper reading experience.
        </p>
      </footer>

      {/* Floating Share Toast Notification */}
      {shareToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl bg-stone-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2.5 animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{shareToast}</span>
        </div>
      )}

      {/* Bulk Download Progress Widget */}
      {isBulkDownloading && bulkProgress && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-3xl bg-stone-900/95 border border-amber-500/40 text-white shadow-2xl backdrop-blur-md max-w-xs sm:max-w-sm w-full animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
              <FolderDown className="w-4 h-4 text-amber-400 animate-bounce" />
              Packaging HD Wallpapers ZIP
            </span>
            <span className="text-xs font-mono text-stone-300">
              {bulkProgress.current} / {bulkProgress.total}
            </span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden mb-2">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-200"
              style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
            />
          </div>
          <p className="text-[11px] text-stone-400 truncate">
            Exporting: {bulkProgress.currentName}
          </p>
        </div>
      )}

      {/* Interactive Phone Preview Modal with Swipe Support */}
      {previewingWallpaper && (
        <PhonePreviewModal
          wallpaper={previewingWallpaper}
          onClose={() => setPreviewingWallpaper(null)}
          isFavorite={favorites.includes(previewingWallpaper.id)}
          onToggleFavorite={toggleFavorite}
          isPremiumUser={isPremiumUser}
          allWallpapers={displayedWallpapers}
          onNavigateWallpaper={(w) => setPreviewingWallpaper(w)}
          fontTheme={fontTheme}
          onFontThemeChange={(th) => setFontTheme(th)}
          onOpenUpgradeModal={() => {
            setUpgradeReason(`VIP Gold Scripture Wallpaper "${previewingWallpaper.verseReference}" is an exclusive privilege.`);
            setPreviewingWallpaper(null);
            setIsUpgradeOpen(true);
          }}
          onOpenSharePreview={handleOpenSharePreview}
          onOpenDownloadPreview={handleOpenDownloadPreview}
        />
      )}

      {/* Share Preview Modal (Visual Social Card, Custom Quote, WhatsApp/Instagram/1-Click Share) */}
      <SharePreviewModal
        isOpen={!!sharePreviewWallpaper}
        onClose={() => setSharePreviewWallpaper(null)}
        wallpaper={sharePreviewWallpaper}
        isLight={isLight}
        onOpenDownloadPreview={(w) => {
          setSharePreviewWallpaper(null);
          handleOpenDownloadPreview(w);
        }}
      />

      {/* Download Preview Modal (Render Canvas, Technical Specs, Format Picker, Zoom & Copy) */}
      <DownloadPreviewModal
        isOpen={!!downloadPreviewWallpaper}
        onClose={() => {
          setDownloadPreviewWallpaper(null);
          setDownloadPreviewSettings(undefined);
        }}
        wallpaper={downloadPreviewWallpaper}
        settings={downloadPreviewSettings}
        isLight={isLight}
        isPremiumUser={isPremiumUser}
        onOpenUpgradeModal={() => {
          setDownloadPreviewWallpaper(null);
          setUpgradeReason(`VIP Gold Scripture Wallpaper "${downloadPreviewWallpaper?.verseReference}" is an exclusive privilege.`);
          setIsUpgradeOpen(true);
        }}
        onOpenSharePreview={(w) => {
          setDownloadPreviewWallpaper(null);
          handleOpenSharePreview(w);
        }}
      />

      {/* VIP Upgrade Simulator */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => {
          setIsUpgradeOpen(false);
          setUpgradeReason(undefined);
        }}
        onSubscriptionSuccess={handleSubscriptionSuccess}
        featureReason={upgradeReason}
      />

      {/* Comprehensive Bible Topics & Theme Wallpapers Directory Modal */}
      <TopicsExplorerModal
        isOpen={isTopicsModalOpen}
        onClose={() => setIsTopicsModalOpen(false)}
        selectedTopic={selectedCategory}
        onSelectTopic={(topicName, recommendedTheme) => {
          triggerWebHaptic('selection');
          setIsFilterTransitioning(true);
          setSelectedCategory(topicName);
          if (recommendedTheme) {
            setSelectedVisualTheme(recommendedTheme);
          }
          setTimeout(() => {
            setIsFilterTransitioning(false);
          }, 280);
        }}
        isLight={isLight}
        wallpaperCountByTopic={wallpaperCountByTopic}
      />

      {/* Settings & Preferences Modal (Solar Theme Schedule, Auto-Changer, Battery Saver, Haptics, Offline Storage) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        initialTab={settingsTab}
        wallpapers={wallpapers}
        currentLockscreenWallpaper={currentLockscreenWallpaper}
        onSelectLockscreenWallpaper={(w) => setCurrentLockscreenWallpaper(w)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={(offline) => setIsOfflineMode(offline)}
        isLight={isLight}
        autoConfig={autoConfig}
        onUpdateAutoConfig={(cfg) => setAutoConfig(cfg)}
        solarConfig={solarConfig}
        onUpdateSolarConfig={updateSolarConfig}
        onRequestGeolocation={requestGeolocation}
      />
    </div>
  );
}

export default App;
