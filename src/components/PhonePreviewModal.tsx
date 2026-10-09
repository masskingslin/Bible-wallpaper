import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Download, Copy, Heart, Check, Smartphone, 
  Layers, Sliders, Sparkles, Moon, Sun, 
  Camera, Flashlight, ChevronRight, ChevronLeft, 
  Share2, Crown, MoveHorizontal, Volume2, VolumeX
} from 'lucide-react';
import { Wallpaper, PreviewMode, CustomizationSettings, FontStyle, TextPosition, TextColor } from '../types';
import { generateAndDownloadWallpaper } from '../utils/canvasExporter';
import { shareWallpaper } from '../utils/shareUtils';
import { isSpeechSynthesisSupported, narrateScripture, stopScriptureNarration } from '../utils/speechUtils';

interface PhonePreviewModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isPremiumUser: boolean;
  onOpenUpgradeModal: () => void;
  allWallpapers?: Wallpaper[];
  onNavigateWallpaper?: (wallpaper: Wallpaper) => void;
}

export const PhonePreviewModal: React.FC<PhonePreviewModalProps> = ({
  wallpaper,
  onClose,
  isFavorite,
  onToggleFavorite,
  isPremiumUser,
  onOpenUpgradeModal,
  allWallpapers = [],
  onNavigateWallpaper,
}) => {
  const [mode, setMode] = useState<PreviewMode>('lockscreen');
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  // Initialize Web Speech API detection
  useEffect(() => {
    setSpeechSupported(isSpeechSynthesisSupported());
  }, []);

  // Stop speech narration whenever user navigates or switches wallpapers
  useEffect(() => {
    stopScriptureNarration();
    setIsSpeaking(false);
  }, [wallpaper.id]);

  // Clean up any playing audio when modal closes/unmounts
  useEffect(() => {
    return () => {
      stopScriptureNarration();
    };
  }, []);

  // Toggle narration on or off via Web Speech API
  const handleToggleSpeech = () => {
    if (!speechSupported) return;

    if (isSpeaking) {
      stopScriptureNarration();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      narrateScripture(wallpaper.verseText, wallpaper.verseReference, wallpaper.language, {
        onStart: () => setIsSpeaking(true),
        onEnd: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  const currentIndex = allWallpapers.findIndex((w) => w.id === wallpaper.id);
  const hasMultiple = allWallpapers.length > 1;

  const handlePrev = () => {
    if (!onNavigateWallpaper || !hasMultiple) return;
    const prevIdx = (currentIndex - 1 + allWallpapers.length) % allWallpapers.length;
    onNavigateWallpaper(allWallpapers[prevIdx]);
  };

  const handleNext = () => {
    if (!onNavigateWallpaper || !hasMultiple) return;
    const nextIdx = (currentIndex + 1) % allWallpapers.length;
    onNavigateWallpaper(allWallpapers[nextIdx]);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allWallpapers]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Mouse Drag Swipe Handlers for desktop
  const [mouseDownX, setMouseDownX] = useState<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setMouseDownX(e.clientX);
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (mouseDownX === null) return;
    const distance = mouseDownX - e.clientX;
    if (distance > 45) {
      handleNext();
    } else if (distance < -45) {
      handlePrev();
    }
    setMouseDownX(null);
  };

  const handleMouseLeave = () => {
    setMouseDownX(null);
  };

  const handleShare = async () => {
    const result = await shareWallpaper(wallpaper);
    if (result.shared) {
      setShared(true);
      setTimeout(() => setShared(false), 2500);
    }
  };

  const [settings, setSettings] = useState<CustomizationSettings>({
    fontStyle: 'playfair',
    fontSize: 'md',
    textPosition: 'center',
    overlayDarkness: 35,
    textColor: 'white',
    showShadow: true,
  });

  const [currentTime, setCurrentTime] = useState({
    time: '09:41',
    date: 'Sunday, October 11',
  });

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      const dateStr = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
      setCurrentTime({ time: timeStr, date: dateStr });
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(`"${wallpaper.verseText}" — ${wallpaper.verseReference}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (wallpaper.isPremium && !isPremiumUser) {
      onOpenUpgradeModal();
      return;
    }
    setDownloading(true);
    try {
      await generateAndDownloadWallpaper(wallpaper, settings);
    } catch (e) {
      console.error(e);
    } finally {
      setDownloading(false);
    }
  };

  const getFontFamilyClass = (style: FontStyle) => {
    switch (style) {
      case 'playfair': return 'font-serif-scripture italic';
      case 'cinzel': return 'font-cinzel tracking-wider';
      case 'script': return 'font-script text-3xl md:text-4xl leading-tight';
      case 'sans': return 'font-sans font-semibold';
    }
  };

  const getTextColorClass = (color: TextColor) => {
    switch (color) {
      case 'gold': return 'text-yellow-300 drop-shadow-[0_4px_12px_rgba(234,179,8,0.5)]';
      case 'ivory': return 'text-amber-100';
      case 'white': return 'text-white';
    }
  };

  const getFontSizeClass = (size: 'sm' | 'md' | 'lg' | 'xl') => {
    switch (size) {
      case 'sm': return 'text-sm md:text-base leading-relaxed';
      case 'md': return 'text-base md:text-lg leading-relaxed';
      case 'lg': return 'text-lg md:text-xl font-medium leading-relaxed';
      case 'xl': return 'text-xl md:text-2xl font-semibold leading-relaxed';
    }
  };

  const getPositionClass = (pos: TextPosition) => {
    switch (pos) {
      case 'top': return 'justify-start pt-28';
      case 'center': return 'justify-center';
      case 'bottom': return 'justify-end pb-28';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[94vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 p-2.5 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white transition shadow-lg"
          title="Close preview (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Realistic Smartphone Frame with Swipe Gestures */}
        <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-stone-800/80 relative">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-800 mb-4 shadow-inner">
            <button
              onClick={() => setMode('lockscreen')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 ${
                mode === 'lockscreen'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              Lock Screen
            </button>
            <button
              onClick={() => setMode('homescreen')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 ${
                mode === 'homescreen'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Home Screen
            </button>
            <button
              onClick={() => setMode('clean')}
              className={`px-3 py-1.5 text-xs font-medium rounded-xl transition flex items-center gap-1.5 ${
                mode === 'clean'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Clean
            </button>
          </div>

          {/* Swipe Controls Wrapper */}
          <div className="relative flex items-center justify-center w-full">
            
            {/* Previous Wallpaper Arrow (Desktop & Mobile) */}
            {hasMultiple && (
              <button
                onClick={handlePrev}
                className="absolute left-2 sm:-left-2 z-30 p-2.5 rounded-full bg-stone-900/80 hover:bg-amber-600 text-stone-300 hover:text-white border border-stone-700 shadow-xl transition backdrop-blur-md active:scale-90"
                title="Previous wallpaper (Left arrow or swipe right)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Smartphone Hardware Frame with Touch & Mouse Drag Swipe Events */}
            <div 
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              className="relative w-[280px] sm:w-[315px] aspect-[9/19] rounded-[44px] p-3 bg-stone-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] ring-1 ring-stone-700/60 ring-inset cursor-grab active:cursor-grabbing select-none"
            >
              
              {/* Phone Screen Outer Bezel */}
              <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black">
                
                {/* Wallpaper Background Image */}
                <img
                  src={wallpaper.imageUrl}
                  alt={wallpaper.verseReference}
                  className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300"
                  draggable={false}
                />

                {/* Adjustable Darkness Overlay */}
                <div
                  className="absolute inset-0 transition-opacity pointer-events-none"
                  style={{
                    backgroundColor: `rgba(0, 0, 0, ${settings.overlayDarkness / 100})`,
                  }}
                />

                {/* Gradient Vignette for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />

                {/* Dynamic Island / Notch with Audio Activity indicator */}
                <div className={`absolute top-2.5 left-1/2 -translate-x-1/2 transition-all duration-300 ${
                  isSpeaking ? 'w-36 h-5.5 px-2.5 bg-stone-950 border border-amber-500/50 shadow-md' : 'w-24 h-5 px-2.5 bg-black'
                } rounded-full z-20 flex items-center justify-between pointer-events-none`}>
                  {isSpeaking ? (
                    <>
                      <Volume2 className="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                      <span className="text-[9px] font-semibold text-amber-300 tracking-tight">Speaking...</span>
                      <span className="flex items-center gap-0.5">
                        <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-bounce"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-900/60" />
                    </>
                  )}
                </div>

                {/* LOCK SCREEN OVERLAY */}
                {mode === 'lockscreen' && (
                  <div className="absolute inset-0 flex flex-col justify-between p-5 text-white z-10 pointer-events-none">
                    {/* Lock Screen Header: Clock & Date */}
                    <div className="pt-8 text-center flex flex-col items-center">
                      <span className="text-xs font-medium text-stone-200 tracking-wide">
                        {currentTime.date}
                      </span>
                      <h1 className="text-6xl font-extralight tracking-tight text-white drop-shadow-md">
                        {currentTime.time}
                      </h1>
                    </div>

                    {/* Lock Screen Bottom Actions */}
                    <div className="pb-2">
                      <div className="flex items-center justify-between px-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-stone-900/60 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/10 shadow-lg">
                          <Flashlight className="w-4 h-4" />
                        </div>
                        <div className="w-10 h-10 rounded-full bg-stone-900/60 backdrop-blur-md flex items-center justify-center text-white/90 border border-white/10 shadow-lg">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                      {/* Home Indicator */}
                      <div className="w-28 h-1 bg-white/70 rounded-full mx-auto" />
                    </div>
                  </div>
                )}

                {/* HOME SCREEN OVERLAY */}
                {mode === 'homescreen' && (
                  <div className="absolute inset-0 flex flex-col justify-between p-4 z-10 pointer-events-none">
                    {/* Top Status & Widget */}
                    <div className="pt-8">
                      <div className="bg-stone-900/70 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-white shadow-lg mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-amber-400 font-semibold tracking-wider uppercase">Verse of the Day</span>
                          <span className="text-[10px] text-stone-300">{wallpaper.category}</span>
                        </div>
                        <p className="text-xs text-stone-100 line-clamp-2 italic font-serif">
                          "{wallpaper.verseText}"
                        </p>
                      </div>

                      {/* App Grid Mockup */}
                      <div className="grid grid-cols-4 gap-3 text-center">
                        {[
                          { name: 'Bible', color: 'bg-amber-600' },
                          { name: 'Prayers', color: 'bg-indigo-600' },
                          { name: 'Photos', color: 'bg-rose-500' },
                          { name: 'Notes', color: 'bg-amber-500' },
                          { name: 'Audio', color: 'bg-emerald-600' },
                          { name: 'Daily', color: 'bg-blue-600' },
                          { name: 'Music', color: 'bg-purple-600' },
                          { name: 'Settings', color: 'bg-stone-700' },
                        ].map((app, i) => (
                          <div key={i} className="flex flex-col items-center">
                            <div className={`w-11 h-11 rounded-xl ${app.color} flex items-center justify-center text-white text-xs font-bold shadow-md border border-white/10`}>
                              {app.name.charAt(0)}
                            </div>
                            <span className="text-[9px] text-white/90 mt-1 font-medium drop-shadow">
                              {app.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Dock Mockup */}
                    <div className="pb-2">
                      <div className="bg-stone-900/60 backdrop-blur-lg rounded-2xl p-2.5 border border-white/10 grid grid-cols-4 gap-2 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center text-white text-xs font-bold shadow">
                          📞
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white text-xs font-bold shadow">
                          💬
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white text-xs font-bold shadow">
                          🧭
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white text-xs font-bold shadow">
                          ✝️
                        </div>
                      </div>
                      <div className="w-28 h-1 bg-white/70 rounded-full mx-auto" />
                    </div>
                  </div>
                )}

                {/* SCRIPTURE TEXT DISPLAY */}
                <div
                  className={`absolute inset-0 px-6 flex flex-col text-center pointer-events-none z-10 ${getPositionClass(
                    settings.textPosition
                  )}`}
                >
                  <div
                    className={`transition-all duration-200 ${
                      settings.showShadow ? 'drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]' : ''
                    }`}
                  >
                    <p
                      className={`${getFontFamilyClass(settings.fontStyle)} ${getTextColorClass(
                        settings.textColor
                      )} ${getFontSizeClass(settings.fontSize)}`}
                    >
                      "{wallpaper.verseText}"
                    </p>
                    <p
                      className={`mt-2 font-cinzel text-xs tracking-widest uppercase font-semibold ${
                        settings.textColor === 'gold' ? 'text-yellow-400' : 'text-stone-200'
                      }`}
                    >
                      — {wallpaper.verseReference} —
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Wallpaper Arrow (Desktop & Mobile) */}
            {hasMultiple && (
              <button
                onClick={handleNext}
                className="absolute right-2 sm:-right-2 z-30 p-2.5 rounded-full bg-stone-900/80 hover:bg-amber-600 text-stone-300 hover:text-white border border-stone-700 shadow-xl transition backdrop-blur-md active:scale-90"
                title="Next wallpaper (Right arrow or swipe left)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Swipe Hint Banner */}
          {hasMultiple && (
            <div className="mt-3.5 flex items-center gap-1.5 text-[11px] text-stone-400 bg-stone-900/60 px-3 py-1 rounded-full border border-stone-800">
              <MoveHorizontal className="w-3.5 h-3.5 text-amber-500" />
              <span>Swipe left / right or use arrows to browse ({currentIndex + 1} of {allWallpapers.length})</span>
            </div>
          )}
        </div>

        {/* Right Side: Customization & Actions Panel */}
        <div className="w-full lg:w-[420px] p-6 lg:p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            {/* Header info */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                    {wallpaper.category}
                  </span>
                  {wallpaper.isPremium && (
                    <span className="flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 rounded-full">
                      <Crown className="w-3 h-3 fill-current" />
                      VIP
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white font-cinzel">
                  {wallpaper.verseReference}
                </h2>
              </div>

              {/* Share, Audio & Favorite Actions */}
              <div className="flex items-center gap-2">
                {/* Header Audio Toggle */}
                {speechSupported && (
                  <button
                    onClick={handleToggleSpeech}
                    className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                      isSpeaking
                        ? 'bg-amber-500 border-amber-400 text-stone-950 shadow-md shadow-amber-500/20'
                        : 'bg-stone-800 border-stone-700 text-amber-400 hover:text-amber-300 hover:bg-stone-750'
                    }`}
                    title={isSpeaking ? 'Stop narration' : 'Listen to scripture verse aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 shrink-0" />
                        <span className="hidden sm:inline">Listen</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleShare}
                  className={`p-2.5 rounded-xl border transition flex items-center gap-1.5 text-xs font-semibold ${
                    shared
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-stone-800 border-stone-700 text-stone-300 hover:text-white'
                  }`}
                  title="Share scripture & wallpaper to social media"
                >
                  {shared ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-amber-400" />}
                  <span className="hidden sm:inline">{shared ? 'Shared!' : 'Share'}</span>
                </button>

                <button
                  onClick={() => onToggleFavorite(wallpaper.id)}
                  className={`p-2.5 rounded-xl border transition ${
                    isFavorite
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                      : 'bg-stone-800 border-stone-700 text-stone-400 hover:text-white'
                  }`}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>

            {/* Scripture quote card */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 mb-6">
              <p className="text-stone-300 font-serif-scripture italic text-sm leading-relaxed mb-3">
                "{wallpaper.verseText}"
              </p>
              
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-400 border-t border-stone-800/80 pt-3">
                <span>Theme: <strong className="text-stone-200">{wallpaper.visualTheme || 'Nature'}</strong></span>
                
                <div className="flex items-center gap-2">
                  {/* Dedicated 'Listen to Verse' Button with Web Speech API & Toggle */}
                  {speechSupported && (
                    <button
                      onClick={handleToggleSpeech}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition shadow-sm ${
                        isSpeaking
                          ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-amber-500/25 ring-2 ring-amber-400/40 animate-pulse'
                          : 'bg-stone-850 hover:bg-stone-800 border border-amber-500/30 text-amber-300 hover:text-amber-200'
                      }`}
                      title={isSpeaking ? 'Stop listening to verse' : 'Listen to scripture verse read aloud'}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3.5 h-3.5 shrink-0" />
                          <span>Stop Audio</span>
                          <span className="flex items-center gap-0.5 ml-1">
                            <span className="w-0.5 h-2 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-0.5 h-3.5 bg-stone-950 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-0.5 h-2 bg-stone-950 rounded-full animate-bounce"></span>
                          </span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Listen to Verse</span>
                        </>
                      )}
                    </button>
                  )}

                  {/* Copy Verse */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-300 hover:text-amber-300 transition font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <span className="text-xs font-semibold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-amber-500" />
                  Wallpaper Settings
                </span>
                <button
                  onClick={() =>
                    setSettings({
                      fontStyle: 'playfair',
                      fontSize: 'md',
                      textPosition: 'center',
                      overlayDarkness: 35,
                      textColor: 'white',
                      showShadow: true,
                    })
                  }
                  className="text-[11px] text-stone-400 hover:text-amber-400 transition"
                >
                  Reset Defaults
                </button>
              </div>

              {/* Typography */}
              <div>
                <label className="text-xs text-stone-300 font-medium block mb-2">
                  Scripture Typography
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'playfair', label: 'Playfair Serif' },
                    { id: 'cinzel', label: 'Cinzel Classic' },
                    { id: 'script', label: 'Calligraphy Script' },
                    { id: 'sans', label: 'Modern Sans' },
                  ].map((font) => (
                    <button
                      key={font.id}
                      onClick={() =>
                        setSettings({ ...settings, fontStyle: font.id as FontStyle })
                      }
                      className={`py-2 px-3 rounded-xl text-xs font-medium border text-left transition ${
                        settings.fontStyle === font.id
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                          : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:bg-stone-750'
                      }`}
                    >
                      {font.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Position */}
              <div>
                <label className="text-xs text-stone-300 font-medium block mb-2">
                  Vertical Placement
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['top', 'center', 'bottom'] as TextPosition[]).map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSettings({ ...settings, textPosition: pos })}
                      className={`py-1.5 rounded-xl text-xs font-medium capitalize border transition ${
                        settings.textPosition === pos
                          ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                          : 'bg-stone-800/80 border-stone-700/80 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Color & Size */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-2">
                    Text Tone
                  </label>
                  <div className="flex gap-2">
                    {[
                      { id: 'white', label: 'White', color: 'bg-white' },
                      { id: 'ivory', label: 'Ivory', color: 'bg-amber-100' },
                      { id: 'gold', label: 'Gold', color: 'bg-yellow-400' },
                    ].map((tone) => (
                      <button
                        key={tone.id}
                        onClick={() =>
                          setSettings({ ...settings, textColor: tone.id as TextColor })
                        }
                        className={`w-8 h-8 rounded-full ${tone.color} flex items-center justify-center transition ring-offset-2 ring-offset-stone-900 ${
                          settings.textColor === tone.id ? 'ring-2 ring-amber-500 scale-110' : 'opacity-70'
                        }`}
                        title={tone.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-stone-300 font-medium block mb-2">
                    Font Scale
                  </label>
                  <div className="flex gap-1 bg-stone-800/80 p-1 rounded-xl border border-stone-700/80">
                    {(['sm', 'md', 'lg', 'xl'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSettings({ ...settings, fontSize: s })}
                        className={`flex-1 py-1 text-xs font-bold rounded-lg uppercase transition ${
                          settings.fontSize === s
                            ? 'bg-amber-600 text-white shadow'
                            : 'text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Overlay Darkness Slider */}
              <div>
                <div className="flex items-center justify-between text-xs text-stone-300 mb-1.5">
                  <span>Photo Darkness Filter</span>
                  <span className="font-mono text-amber-400">{settings.overlayDarkness}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  value={settings.overlayDarkness}
                  onChange={(e) =>
                    setSettings({ ...settings, overlayDarkness: parseInt(e.target.value, 10) })
                  }
                  className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-8 pt-4 border-t border-stone-800 space-y-3">
            {wallpaper.isPremium && !isPremiumUser ? (
              <button
                onClick={onOpenUpgradeModal}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition hover:scale-[1.01]"
              >
                <Crown className="w-4 h-4 fill-current" />
                Unlock VIP Wallpaper
              </button>
            ) : (
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 transition hover:scale-[1.01]"
              >
                {downloading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloading ? 'Rendering HD Wallpaper...' : 'Download HD Phone Wallpaper (1080×1920)'}</span>
              </button>
            )}

            <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
              <span>9:16 Portrait Aspect Ratio</span>
              <span>Full HD Resolution</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
