import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Clock, Smartphone, Crown, Share2, 
  Copy, Check, RefreshCw, Zap, Bookmark, Heart,
  Volume2, VolumeX
} from 'lucide-react';
import { Wallpaper } from '../types';
import { shareWallpaper } from '../utils/shareUtils';
import { isSpeechSynthesisSupported, narrateScripture, stopScriptureNarration } from '../utils/speechUtils';

interface DailyVerseBannerProps {
  language: string;
  isPremiumUser: boolean;
  isLight: boolean;
  onPreviewWallpaper: (wallpaper: Wallpaper) => void;
  onSetLockScreen: (wallpaper: Wallpaper) => void;
  onOpenUpgradeModal: () => void;
  onToggleFavorite: (id: string) => void;
  favorites: string[];
}

export const DailyVerseBanner: React.FC<DailyVerseBannerProps> = ({
  language,
  isPremiumUser,
  isLight,
  onPreviewWallpaper,
  onSetLockScreen,
  onOpenUpgradeModal,
  onToggleFavorite,
  favorites,
}) => {
  const [dailyVerse, setDailyVerse] = useState<Wallpaper | null>(null);
  const [loading, setLoading] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    setSpeechSupported(isSpeechSynthesisSupported());
  }, []);

  useEffect(() => {
    stopScriptureNarration();
    setIsSpeaking(false);
  }, [dailyVerse?.id]);

  useEffect(() => {
    return () => {
      stopScriptureNarration();
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!dailyVerse || !speechSupported) return;
    if (isSpeaking) {
      stopScriptureNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      narrateScripture(dailyVerse.verseText, dailyVerse.verseReference, dailyVerse.language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const fetchDailyVerse = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/verse-of-the-day?language=${language}&isPremium=${isPremiumUser}`);
      if (!res.ok) throw new Error('Failed to load verse of the day');
      const data = await res.json();
      if (data.verse) {
        setDailyVerse(data.verse);
        setRemainingSeconds(data.remainingSeconds || 0);
      }
    } catch (err) {
      console.warn('Error loading verse of the day:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDailyVerse();
  }, [language, isPremiumUser]);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          // Trigger refresh when timer reaches 0
          fetchDailyVerse();
          return isPremiumUser ? 3600 : 86400;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPremiumUser, language]);

  const handleCopy = () => {
    if (!dailyVerse) return;
    navigator.clipboard.writeText(`"${dailyVerse.verseText}" — ${dailyVerse.verseReference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (!dailyVerse) return;
    const result = await shareWallpaper(dailyVerse);
    if (result.shared) {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    fetchDailyVerse();
  };

  const formatCountdown = (secs: number) => {
    const hours = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading && !dailyVerse) {
    return (
      <div className={`p-6 rounded-3xl border animate-pulse flex items-center justify-center min-h-[140px] ${
        isLight ? 'bg-[#f4eee2] border-[#ded3c0]' : 'bg-stone-900/60 border-stone-800'
      }`}>
        <div className="flex items-center gap-3 text-xs text-amber-500 font-semibold">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Fetching today's scripture blessing...</span>
        </div>
      </div>
    );
  }

  if (!dailyVerse) return null;

  return (
    <div className={`relative rounded-3xl overflow-hidden border p-5 sm:p-7 shadow-xl transition-all duration-300 ${
      isLight
        ? 'bg-gradient-to-r from-[#fbf6ec] via-[#f7f0e3] to-[#f4ede0] border-[#d8cca8] shadow-md'
        : 'bg-gradient-to-r from-stone-900 via-stone-900/95 to-amber-950/30 border-amber-500/25 shadow-xl'
    }`}>
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        
        {/* Left Side: Thumbnail Preview + Scripture Quote */}
        <div className="flex items-start sm:items-center gap-4 sm:gap-6 flex-1">
          
          {/* Wallpaper Thumbnail */}
          <div 
            onClick={() => onPreviewWallpaper(dailyVerse)}
            className="group relative w-16 h-28 sm:w-20 sm:h-32 rounded-2xl overflow-hidden border border-amber-500/40 shrink-0 cursor-pointer shadow-lg hover:scale-105 transition-transform"
            title="Click to preview on lock screen"
          >
            <img
              src={dailyVerse.imageUrl}
              alt={dailyVerse.verseReference}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/10 transition-colors" />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Smartphone className="w-5 h-5 text-white drop-shadow" />
            </div>
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded bg-black/70 text-[8px] font-bold text-amber-300 font-mono tracking-wider">
              {dailyVerse.category.split(' ')[0]}
            </div>
          </div>

          {/* Scripture Text & Meta */}
          <div className="space-y-1.5 flex-1 min-w-0">
            
            {/* Header Badges: Cadence Info */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isPremiumUser
                  ? 'bg-amber-500 text-stone-950 shadow-sm font-extrabold'
                  : isLight
                    ? 'bg-amber-600/15 text-amber-900 border border-amber-600/25'
                    : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
              }`}>
                {isPremiumUser ? <Crown className="w-3 h-3 fill-current" /> : <Sparkles className="w-3 h-3" />}
                {isPremiumUser ? 'VIP Hourly Blessing' : 'Daily Verse of the Day'}
              </span>

              {/* Cadence Timer */}
              <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium ${
                isLight ? 'text-stone-600' : 'text-stone-400'
              }`}>
                <Clock className="w-3 h-3 text-amber-500" />
                <span>Next refresh: <strong>{formatCountdown(remainingSeconds)}</strong></span>
                <span className="text-[10px] uppercase font-sans">
                  ({isPremiumUser ? '1h cadence' : '24h cadence'})
                </span>
              </span>

              {/* Free user upgrade prompt */}
              {!isPremiumUser && (
                <button
                  onClick={onOpenUpgradeModal}
                  className={`hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full transition ${
                    isLight 
                      ? 'bg-amber-600/10 text-amber-900 hover:bg-amber-600/20' 
                      : 'bg-amber-500/15 text-amber-300 hover:bg-amber-500/25'
                  }`}
                  title="VIP members get a fresh blessing every 1 hour!"
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>VIPs get 1-Hour refresh!</span>
                </button>
              )}
            </div>

            {/* Main Scripture Text */}
            <blockquote className={`font-serif-scripture italic text-base sm:text-lg leading-snug line-clamp-2 md:line-clamp-3 ${
              isLight ? 'text-stone-900 font-medium' : 'text-stone-100'
            }`}>
              "{dailyVerse.verseText}"
            </blockquote>

            {/* Reference & Language */}
            <div className="flex items-center gap-3 pt-0.5">
              <span className={`font-cinzel text-xs sm:text-sm font-bold tracking-wider ${
                isLight ? 'text-amber-800' : 'text-amber-300'
              }`}>
                — {dailyVerse.verseReference} —
              </span>
              <span className={`text-[10px] font-bold uppercase ${
                isLight ? 'text-stone-500' : 'text-stone-400'
              }`}>
                {dailyVerse.visualTheme || dailyVerse.category}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center flex-wrap sm:flex-nowrap gap-2 w-full lg:w-auto justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-stone-800/30">
          
          {/* Phone Preview */}
          <button
            onClick={() => onPreviewWallpaper(dailyVerse)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-amber-600/20 transition hover:scale-102"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Lock Screen Preview</span>
          </button>

          {/* Web Speech API: Listen to Verse Toggle */}
          {speechSupported && (
            <button
              onClick={handleToggleSpeech}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
                isSpeaking
                  ? 'bg-amber-500 border-amber-400 text-stone-950 font-bold shadow-md shadow-amber-500/20 animate-pulse'
                  : isLight
                    ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-amber-900'
                    : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-amber-400'
              }`}
              title={isSpeaking ? 'Stop narration' : 'Listen to scripture verse aloud'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden sm:inline">Stop Audio</span>
                  <span className="flex items-center gap-0.5 ml-0.5">
                    <span className="w-0.5 h-2.5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-0.5 h-3 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-0.5 h-1.5 bg-stone-950 rounded-full animate-bounce"></span>
                  </span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span className="hidden sm:inline">Listen</span>
                </>
              )}
            </button>
          )}

          {/* Set as 1-Hour Auto Lock Screen Wallpaper */}
          <button
            onClick={() => onSetLockScreen(dailyVerse)}
            className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border ${
              isLight
                ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-amber-950'
                : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-amber-300'
            }`}
            title="Set as current lock screen wallpaper"
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Set Lock</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
              shared
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : isLight
                  ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-stone-800'
                  : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
            title="Share verse to social media"
          >
            {shared ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5 text-amber-500" />}
          </button>

          {/* Favorite */}
          <button
            onClick={() => dailyVerse && onToggleFavorite(dailyVerse.id)}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
              dailyVerse && favorites.includes(dailyVerse.id)
                ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                : isLight
                  ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-stone-800'
                  : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
            title="Bookmark verse"
          >
            <Heart className={`w-3.5 h-3.5 ${dailyVerse && favorites.includes(dailyVerse.id) ? 'fill-current text-rose-500' : ''}`} />
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                : isLight
                  ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-stone-800'
                  : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
            title="Copy scripture quote"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Refresh / Next Blessing */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center transition border ${
              isLight
                ? 'bg-[#ece4d4] hover:bg-[#e4dac6] border-[#d8ccb6] text-stone-800'
                : 'bg-stone-850 hover:bg-stone-800 border-stone-700 text-stone-300'
            }`}
            title="Cycle next random blessing"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};
