import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Heart, Download, Crown, Sparkles, Globe, 
  Smartphone, Filter, BookOpen, ChevronDown, Check,
  RefreshCw, Bookmark, Share2, Star
} from 'lucide-react';
import { Wallpaper, LanguageOption } from './types';
import { PhonePreviewModal } from './components/PhonePreviewModal';
import { UpgradeModal } from './components/UpgradeModal';

const LANGUAGES: LanguageOption[] = [
  { code: 'en', displayName: 'English', flag: '🇺🇸' },
  { code: 'es', displayName: 'Español', flag: '🇪🇸' },
  { code: 'pt', displayName: 'Português', flag: '🇧🇷' },
  { code: 'fr', displayName: 'Français', flag: '🇫🇷' },
  { code: 'de', displayName: 'Deutsch', flag: '🇩🇪' },
];

const CATEGORIES = [
  'All',
  'Peace & Comfort',
  'Strength',
  'Faith',
  'Hope',
  'Love & Grace',
  'Praise'
];

export function App() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [wallpapers, setWallpapers] = useState<Wallpaper[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [previewingWallpaper, setPreviewingWallpaper] = useState<Wallpaper | null>(null);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState<boolean>(false);
  const [isPremiumUser, setIsPremiumUser] = useState<boolean>(false);
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

  // Fetch wallpapers from API
  const fetchWallpapers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        language: selectedLanguage,
      });
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`/api/wallpapers?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load wallpapers');
      const data = await res.json();
      setWallpapers(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallpapers();
  }, [selectedLanguage, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWallpapers();
  };

  // Filter wallpapers based on local favorites if toggle is active
  const displayedWallpapers = useMemo(() => {
    if (filterFavoritesOnly) {
      return wallpapers.filter((w) => favorites.includes(w.id));
    }
    return wallpapers;
  }, [wallpapers, filterFavoritesOnly, favorites]);

  // Daily featured wallpaper
  const featuredWallpaper = wallpapers.find((w) => !w.isPremium) || wallpapers[0];

  const currentLangObj = LANGUAGES.find((l) => l.code === selectedLanguage) || LANGUAGES[0];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col selection:bg-amber-600 selection:text-white">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-stone-950/85 backdrop-blur-xl border-b border-stone-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-600/20">
              <BookOpen className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className="font-cinzel text-lg font-bold tracking-wider text-white">
                Bible Wallpapers
              </span>
              <span className="hidden sm:inline-block text-[11px] text-amber-400/90 font-medium ml-2 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                Scripture & Faith
              </span>
            </div>
          </div>

          {/* Right Controls: Language Selector, Favorites, VIP Upgrade */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900 border border-stone-800 hover:border-stone-700 text-xs font-medium text-stone-200 transition"
              >
                <span>{currentLangObj.flag}</span>
                <span className="hidden md:inline">{currentLangObj.displayName}</span>
                <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                    Select Language
                  </div>
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setSelectedLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full px-3 py-2 text-xs flex items-center justify-between text-left hover:bg-stone-800/80 transition"
                    >
                      <span className="flex items-center gap-2 text-stone-200">
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
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title="Filter bookmarks"
            >
              <Heart className={`w-4 h-4 ${filterFavoritesOnly ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Bookmarks</span>
              {favorites.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 font-bold">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* VIP Pass Button */}
            {isPremiumUser ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
                <Crown className="w-4 h-4 fill-current text-amber-400" />
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
        
        {/* Hero Section */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900/90 to-stone-950 border border-stone-800/80 p-6 md:p-10 shadow-xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Daily Scripture Collection
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-cinzel leading-tight tracking-tight">
              Carry God's Word Everywhere You Go
            </h1>
            <p className="mt-3 text-stone-300 text-sm sm:text-base leading-relaxed">
              Discover beautiful Christian phone lock screen wallpapers with inspirational Bible verses. Available in 5 languages with customizable typography and instant full HD downloads.
            </p>

            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="mt-6 flex items-center gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search verse, psalm, or topic..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-sm text-stone-100 placeholder-stone-400 focus:outline-none focus:border-amber-500 transition shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-sm font-semibold transition"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <div className="text-xs font-semibold text-stone-400 uppercase tracking-wider shrink-0 flex items-center gap-1.5 mr-2">
            <Filter className="w-3.5 h-3.5 text-amber-500" />
            Themes:
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition border ${
                selectedCategory === cat
                  ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-600/20'
                  : 'bg-stone-900/80 border-stone-800 text-stone-400 hover:text-stone-200 hover:border-stone-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Featured Daily Blessing Banner if available */}
        {featuredWallpaper && !filterFavoritesOnly && !searchQuery && (
          <div className="p-4 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 border border-amber-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-center gap-4">
              <img
                src={featuredWallpaper.imageUrl}
                alt={featuredWallpaper.verseReference}
                className="w-16 h-28 object-cover rounded-2xl border border-amber-500/30 shadow-md shrink-0"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-bold text-amber-400 tracking-wider uppercase">
                    ⭐ Verse of the Day
                  </span>
                  <span className="text-[11px] text-stone-400">• {featuredWallpaper.category}</span>
                </div>
                <h3 className="font-serif-scripture italic text-base sm:text-lg text-white line-clamp-2">
                  "{featuredWallpaper.verseText}"
                </h3>
                <p className="font-cinzel text-xs text-amber-300 font-bold mt-1">
                  — {featuredWallpaper.verseReference}
                </p>
              </div>
            </div>

            <button
              onClick={() => setPreviewingWallpaper(featuredWallpaper)}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition hover:scale-105 shrink-0"
            >
              <Smartphone className="w-4 h-4" />
              <span>Preview on Phone</span>
            </button>
          </div>
        )}

        {/* Wallpapers Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white font-cinzel flex items-center gap-2">
              <span>Wallpapers</span>
              <span className="text-xs text-stone-400 font-sans font-normal">
                ({displayedWallpapers.length} {displayedWallpapers.length === 1 ? 'item' : 'items'})
              </span>
            </h2>

            {filterFavoritesOnly && (
              <button
                onClick={() => setFilterFavoritesOnly(false)}
                className="text-xs text-amber-400 hover:underline"
              >
                Clear Bookmark Filter
              </button>
            )}
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
                return (
                  <div
                    key={wallpaper.id}
                    className="group relative rounded-3xl overflow-hidden bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60 flex flex-col aspect-[9/16]"
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
                      <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-black/60 backdrop-blur-md rounded-full text-stone-200 border border-white/10 uppercase tracking-wider">
                        {wallpaper.category}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {wallpaper.isPremium && (
                          <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 rounded-full shadow-sm">
                            <Crown className="w-3 h-3 fill-current" />
                            VIP
                          </span>
                        )}
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

                      {/* Hover / Tap Action Button */}
                      <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <button
                          onClick={() => setPreviewingWallpaper(wallpaper)}
                          className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow transition"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>Phone Preview</span>
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
      <footer className="border-t border-stone-800 bg-stone-950 py-8 px-4 text-center text-xs text-stone-500 space-y-2">
        <p className="font-cinzel text-stone-300 font-semibold tracking-wider">
          Bible Wallpapers • Scripture for Daily Life
        </p>
        <p className="max-w-md mx-auto">
          High-definition scripture backgrounds curated for mobile devices. Powered by the Bible Wallpapers API.
        </p>
      </footer>

      {/* Interactive Phone Preview & Customizer Modal */}
      {previewingWallpaper && (
        <PhonePreviewModal
          wallpaper={previewingWallpaper}
          onClose={() => setPreviewingWallpaper(null)}
          isFavorite={favorites.includes(previewingWallpaper.id)}
          onToggleFavorite={toggleFavorite}
          isPremiumUser={isPremiumUser}
          onOpenUpgradeModal={() => {
            setPreviewingWallpaper(null);
            setIsUpgradeOpen(true);
          }}
        />
      )}

      {/* VIP Upgrade / Google Play Billing Simulator */}
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        onSubscriptionSuccess={handleSubscriptionSuccess}
      />
    </div>
  );
}

export default App;
