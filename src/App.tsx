import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Heart, Download, Crown, Sparkles, Globe, 
  Smartphone, Filter, BookOpen, ChevronDown, Check,
  RefreshCw, Bookmark, Share2, Star, Clock, Wifi, WifiOff,
  Sliders, Settings2, Sun, Moon, CheckSquare, Square, FolderDown,
  Volume2, VolumeX
} from 'lucide-react';
import { Wallpaper, LanguageOption, AppThemeMode } from './types';
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AutoChangerModal } from './components/AutoChangerModal';
import { DailyVerseBanner } from './components/DailyVerseBanner';
import { TopicsExplorerModal } from './components/TopicsExplorerModal';
import { ALL_BIBLE_TOPICS, VISUAL_THEMES_DIRECTORY } from './data/bibleTopics';
import { shareWallpaper } from './utils/shareUtils';
import { narrateScripture, stopScriptureNarration } from './utils/speechUtils';
import { downloadWallpapersAsZip, BulkDownloadProgress } from './utils/bulkDownload';
import { 
  getOfflineWallpapers, 
  saveOfflineWallpapers, 
  getAutoChangerConfig, 
  saveAutoChangerConfig, 
  AutoChangerConfig 
} from './utils/offlineStorage';

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

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedVisualTheme, setSelectedVisualTheme] = useState<string>('All Aesthetics');
  const [selectedTestament, setSelectedTestament] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewingWallpaper, setPreviewingWallpaper] = useState<Wallpaper | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [isAutoChangerOpen, setIsAutoChangerOpen] = useState<boolean>(false);
  const [isTopicsModalOpen, setIsTopicsModalOpen] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);

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
  
  // Theme state: default dark vs warm paper light mode
  const [themeMode, setThemeMode] = useState<AppThemeMode>(() => {
    try {
      const saved = localStorage.getItem('bible_wallpapers_theme_mode');
      return (saved === 'light' || saved === 'dark') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    localStorage.setItem('bible_wallpapers_theme_mode', themeMode);
    if (themeMode === 'light') {
      document.body.classList.add('bg-[#f8f5ee]', 'text-stone-900');
      document.body.classList.remove('bg-stone-950', 'text-stone-100');
    } else {
      document.body.classList.add('bg-stone-950', 'text-stone-100');
      document.body.classList.remove('bg-[#f8f5ee]', 'text-stone-900');
    }
  }, [themeMode]);

  // Offline & Auto-changer state
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [isNetworkOffline, setIsNetworkOffline] = useState<boolean>(!navigator.onLine);
  const [autoConfig, setAutoConfig] = useState<AutoChangerConfig>(getAutoChangerConfig);
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

  const toggleSelectWallpaper = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === displayedWallpapers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(displayedWallpapers.map((w) => w.id));
    }
  };

  const handleBulkDownload = async () => {
    if (!isPremiumUser) {
      setUpgradeReason("Bulk 1-Click ZIP Collection Download is an exclusive VIP privilege. Upgrade to VIP to export entire wallpaper sets in full HD.");
      setIsUpgradeOpen(true);
      return;
    }

    const itemsToDownload = selectedIds.length > 0
      ? displayedWallpapers.filter((w) => selectedIds.includes(w.id))
      : displayedWallpapers;

    if (itemsToDownload.length === 0) return;

    setIsBulkDownloading(true);
    try {
      await downloadWallpapersAsZip(itemsToDownload, (p) => setBulkProgress(p));
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
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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
      });
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (selectedVisualTheme !== 'All Aesthetics') params.append('visualTheme', selectedVisualTheme);
      if (selectedTestament !== 'All') params.append('testament', selectedTestament);
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
  }, [selectedLanguage, selectedCategory, selectedVisualTheme, selectedTestament, isOfflineMode, isNetworkOffline]);

  // 1-HOUR AUTOMATIC LOCK SCREEN ROTATION ENGINE
  useEffect(() => {
    if (!autoConfig.enabled || wallpapers.length === 0) return;

    const intervalMs = autoConfig.intervalMinutes * 60 * 1000;
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
  }, [autoConfig, wallpapers]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWallpapers();
  };

  const displayedWallpapers = useMemo(() => {
    if (filterFavoritesOnly) {
      return wallpapers.filter((w) => favorites.includes(w.id));
    }
    return wallpapers;
  }, [wallpapers, filterFavoritesOnly, favorites]);

  const featuredWallpaper = wallpapers.find((w) => !w.isPremium) || wallpapers[0];
  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  const formatRemainingMinutes = (secs: number) => {
    const mins = Math.ceil(secs / 60);
    return `${mins}m`;
  };

  const isLight = themeMode === 'light';

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
            
            {/* Theme Toggle Button (Dark Mode <-> Warm Paper) */}
            <button
              onClick={() => setThemeMode(isLight ? 'dark' : 'light')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                isLight
                  ? 'bg-[#ece3d2] hover:bg-[#e4dac6] border-[#d8ccb6] text-amber-950 shadow-xs'
                  : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-200'
              }`}
              title={isLight ? "Switch to Dark Mode" : "Switch to Warm Paper (Light Mode)"}
            >
              {isLight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden md:inline">Warm Paper</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden md:inline">Dark</span>
                </>
              )}
            </button>

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
          onPreviewWallpaper={(w) => setPreviewingWallpaper(w)}
          onSetLockScreen={(w) => {
            setCurrentLockscreenWallpaper(w);
            setIsAutoChangerOpen(true);
          }}
          onOpenUpgradeModal={() => setIsUpgradeOpen(true)}
          onToggleFavorite={toggleFavorite}
          favorites={favorites}
        />

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

        {/* 1-Hour Auto-Changer Active Live Lock Screen Card */}
        {currentLockscreenWallpaper && (
          <div className={`p-4 sm:p-5 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
            isLight
              ? 'bg-[#f4ede0] border-amber-600/30 shadow-xs'
              : 'bg-stone-900/90 border-amber-500/30 shadow-md'
          }`}>
            <div className="flex items-center gap-4 w-full sm:w-auto">
              <div className="relative w-14 h-24 sm:w-16 sm:h-28 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 shadow">
                <img
                  src={currentLockscreenWallpaper.imageUrl}
                  alt={currentLockscreenWallpaper.verseReference}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
                <div className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/60 text-[8px] text-amber-300 font-mono">
                  LOCK
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider ${
                    isLight ? 'text-emerald-700' : 'text-emerald-400'
                  }`}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Lock Screen Rotator: Active (1 Hour)
                  </span>
                  <span className={`text-[10px] font-mono ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
                    Next: {formatRemainingMinutes(remainingTimeSeconds)}
                  </span>
                </div>
                <h4 className={`text-sm font-serif-scripture italic line-clamp-1 ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  "{currentLockscreenWallpaper.verseText}"
                </h4>
                <p className="text-xs font-cinzel font-bold text-amber-600 dark:text-amber-300 mt-0.5">
                  — {currentLockscreenWallpaper.verseReference}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setPreviewingWallpaper(currentLockscreenWallpaper)}
                className={`flex-1 sm:flex-initial px-4 py-2 border rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  isLight
                    ? 'bg-[#e9e0cf] hover:bg-[#ded5c4] border-[#d5caba] text-stone-850'
                    : 'bg-stone-800 hover:bg-stone-750 border-stone-700 text-stone-200'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Inspect Lock Screen</span>
              </button>
              <button
                onClick={() => setIsAutoChangerOpen(true)}
                className="flex-1 sm:flex-initial px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Changer Settings</span>
              </button>
            </div>
          </div>
        )}

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
                onClick={() => setSelectedCategory(topic)}
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
                  onClick={() => setSelectedVisualTheme(theme)}
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
                  onClick={() => setSelectedTestament(testament)}
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
                      onClick={() => setSelectedVisualTheme(th)}
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

            {/* Bulk Download & Selection Action Bar */}
            <div className="flex items-center gap-2">
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
                  onClick={() => setSelectionMode(true)}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
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
                      src={wallpaper.imageUrl}
                      alt={wallpaper.verseReference}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/30 transition-opacity" />

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
                          onClick={() => handleShareWallpaper(wallpaper)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
                            sharedWallpaperId === wallpaper.id
                              ? 'bg-emerald-500/40 border-emerald-500 text-emerald-300'
                              : 'bg-black/50 border-white/10 text-white/80 hover:text-white hover:bg-black/80'
                          }`}
                          title="Share wallpaper & scripture"
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
                      <p className="font-serif-scripture italic text-stone-100 text-sm line-clamp-3 drop-shadow-md leading-relaxed">
                        "{wallpaper.verseText}"
                      </p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <span className="font-cinzel text-xs font-bold tracking-wider text-amber-300 drop-shadow">
                          {wallpaper.verseReference}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-stone-400">
                          {wallpaper.language}
                        </span>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <button
                          onClick={() => {
                            stopScriptureNarration();
                            setSpeakingCardId(null);
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
                          onClick={() => handleShareWallpaper(wallpaper)}
                          className={`p-2 rounded-xl border transition ${
                            sharedWallpaperId === wallpaper.id
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300 hover:text-amber-400'
                          }`}
                          title="Share to Social Media"
                        >
                          {sharedWallpaperId === wallpaper.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
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
          onOpenUpgradeModal={() => {
            setUpgradeReason(`VIP Gold Scripture Wallpaper "${previewingWallpaper.verseReference}" is an exclusive privilege.`);
            setPreviewingWallpaper(null);
            setIsUpgradeOpen(true);
          }}
        />
      )}

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
          setSelectedCategory(topicName);
          if (recommendedTheme) {
            setSelectedVisualTheme(recommendedTheme);
          }
        }}
        isLight={isLight}
        wallpaperCountByTopic={wallpaperCountByTopic}
      />

      {/* 1-Hour Automatic Lock Screen Changer & Offline Manager Modal */}
      <AutoChangerModal
        isOpen={isAutoChangerOpen}
        onClose={() => setIsAutoChangerOpen(false)}
        wallpapers={wallpapers}
        currentLockscreenWallpaper={currentLockscreenWallpaper}
        onSelectLockscreenWallpaper={(w) => setCurrentLockscreenWallpaper(w)}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={(offline) => setIsOfflineMode(offline)}
      />
    </div>
  );
}

export default App;
