import React, { useState, useEffect } from 'react';
import { 
  X, Download, Copy, Heart, Check, Smartphone, 
  Layers, Sliders, Sparkles, Moon, Sun, 
  Camera, Flashlight, ChevronRight, Share2, Crown
} from 'lucide-react';
import { Wallpaper, PreviewMode, CustomizationSettings, FontStyle, TextPosition, TextColor } from '../types';
import { generateAndDownloadWallpaper } from '../utils/canvasExporter';

interface PhonePreviewModalProps {
  wallpaper: Wallpaper;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  isPremiumUser: boolean;
  onOpenUpgradeModal: () => void;
}

export const PhonePreviewModal: React.FC<PhonePreviewModalProps> = ({
  wallpaper,
  onClose,
  isFavorite,
  onToggleFavorite,
  isPremiumUser,
  onOpenUpgradeModal,
}) => {
  const [mode, setMode] = useState<PreviewMode>('lockscreen');
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'customize'>('preview');

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-5xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row max-h-[92vh]">
        
        {/* Close Button Mobile/Desktop */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-300 hover:text-white transition shadow-lg"
          title="Close preview"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Realistic Smartphone Frame */}
        <div className="flex-1 bg-stone-950 flex flex-col items-center justify-center p-6 border-b lg:border-b-0 lg:border-r border-stone-800/80">
          
          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-stone-900/90 rounded-2xl border border-stone-800 mb-5 shadow-inner">
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

          {/* Smartphone Hardware Frame */}
          <div className="relative w-[280px] sm:w-[320px] aspect-[9/19] rounded-[44px] p-3 bg-stone-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] ring-1 ring-stone-700/60 ring-inset">
            
            {/* Phone Screen Outer Bezel */}
            <div className="relative w-full h-full rounded-[34px] overflow-hidden bg-black select-none">
              
              {/* Wallpaper Background Image */}
              <img
                src={wallpaper.imageUrl}
                alt={wallpaper.verseReference}
                className="absolute inset-0 w-full h-full object-cover"
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

              {/* Dynamic Island / Notch */}
              <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5 bg-black rounded-full z-20 flex items-center justify-between px-2.5 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-stone-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-900/60" />
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
                      Premium
                    </span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white font-cinzel">
                  {wallpaper.verseReference}
                </h2>
              </div>

              {/* Favorite Action */}
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

            {/* Scripture quote card */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 mb-6">
              <p className="text-stone-300 font-serif-scripture italic text-sm leading-relaxed mb-3">
                "{wallpaper.verseText}"
              </p>
              <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2.5">
                <span>Language: <strong className="uppercase text-stone-200">{wallpaper.language}</strong></span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 transition font-medium"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Scripture</span>
                    </>
                  )}
                </button>
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
                Unlock Premium Wallpaper
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
