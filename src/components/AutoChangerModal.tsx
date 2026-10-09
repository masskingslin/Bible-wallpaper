import React, { useState, useEffect } from 'react';
import { 
  X, Clock, RefreshCw, Smartphone, ShieldCheck, 
  Wifi, WifiOff, HardDrive, Check, Sparkles, AlertCircle 
} from 'lucide-react';
import { Wallpaper } from '../types';
import { 
  AutoChangerConfig, 
  getAutoChangerConfig, 
  saveAutoChangerConfig, 
  saveOfflineWallpapers,
  getOfflineWallpapers
} from '../utils/offlineStorage';

interface AutoChangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallpapers: Wallpaper[];
  currentLockscreenWallpaper: Wallpaper | null;
  onSelectLockscreenWallpaper: (wallpaper: Wallpaper) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
}

export const AutoChangerModal: React.FC<AutoChangerModalProps> = ({
  isOpen,
  onClose,
  wallpapers,
  currentLockscreenWallpaper,
  onSelectLockscreenWallpaper,
  isOfflineMode,
  onToggleOfflineMode,
}) => {
  const [config, setConfig] = useState<AutoChangerConfig>(getAutoChangerConfig);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [cachedCount, setCachedCount] = useState<number>(() => {
    const cached = getOfflineWallpapers();
    return cached ? cached.length : 0;
  });
  const [isCaching, setIsCaching] = useState(false);
  const [justChanged, setJustChanged] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const intervalMs = config.intervalMinutes * 60 * 1000;
    const calculateRemaining = () => {
      const now = Date.now();
      const elapsed = (now - config.lastChanged) % intervalMs;
      const left = Math.max(0, Math.floor((intervalMs - elapsed) / 1000));
      setRemainingSeconds(left);

      // Auto trigger if interval has rolled over
      if (left <= 1 && config.enabled && wallpapers.length > 0) {
        triggerManualRotation();
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [isOpen, config, wallpapers]);

  if (!isOpen) return null;

  const handleToggleEnabled = () => {
    const newConfig: AutoChangerConfig = {
      ...config,
      enabled: !config.enabled,
      lastChanged: Date.now(),
    };
    setConfig(newConfig);
    saveAutoChangerConfig(newConfig);

    // Sync with server
    fetch('/api/auto-change-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    }).catch(console.warn);
  };

  const handleIntervalChange = (minutes: number) => {
    const newConfig: AutoChangerConfig = {
      ...config,
      intervalMinutes: minutes,
      lastChanged: Date.now(),
    };
    setConfig(newConfig);
    saveAutoChangerConfig(newConfig);

    fetch('/api/auto-change-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newConfig),
    }).catch(console.warn);
  };

  const triggerManualRotation = () => {
    if (wallpapers.length === 0) return;
    const currentIndex = currentLockscreenWallpaper
      ? wallpapers.findIndex((w) => w.id === currentLockscreenWallpaper.id)
      : 0;
    const nextIndex = (currentIndex + 1) % wallpapers.length;
    const nextWallpaper = wallpapers[nextIndex];
    onSelectLockscreenWallpaper(nextWallpaper);

    const updatedConfig = { ...config, lastChanged: Date.now() };
    setConfig(updatedConfig);
    saveAutoChangerConfig(updatedConfig);

    setJustChanged(true);
    setTimeout(() => setJustChanged(false), 2000);
  };

  const handleCacheAllForOffline = async () => {
    setIsCaching(true);
    try {
      const res = await fetch('/api/offline-pack');
      const data = await res.json();
      if (data.wallpapers) {
        saveOfflineWallpapers(data.wallpapers);
        setCachedCount(data.wallpapers.length);
      }
    } catch {
      // Fallback: cache current state
      saveOfflineWallpapers(wallpapers);
      setCachedCount(wallpapers.length);
    } finally {
      setIsCaching(false);
    }
  };

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-stone-900 border border-stone-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-800 text-stone-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-cinzel">
              Automatic Lock Screen Changer
            </h2>
            <p className="text-xs text-stone-400">
              Rotates your lock screen wallpaper automatically with inspiring scriptures.
            </p>
          </div>
        </div>

        {/* Main Auto-Changer Section */}
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/80 mb-6 space-y-4">
          
          {/* Enable / Disable Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-5 h-5 text-amber-500" />
              <div>
                <span className="text-sm font-semibold text-white block">
                  1-Hour Auto Rotation
                </span>
                <span className="text-xs text-stone-400">
                  {config.enabled ? 'Active — Automatically changes lock screen' : 'Disabled'}
                </span>
              </div>
            </div>

            <button
              onClick={handleToggleEnabled}
              className={`w-12 h-6 rounded-full transition-colors relative ${
                config.enabled ? 'bg-amber-600' : 'bg-stone-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  config.enabled ? 'right-1' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Countdown & Next Change Info */}
          {config.enabled && (
            <div className="p-3 bg-stone-900 rounded-xl border border-stone-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase tracking-wider text-stone-400 font-semibold block">
                  Next Lock Screen Change In
                </span>
                <span className="text-xl font-bold font-mono text-amber-400">
                  {formatCountdown(remainingSeconds)}
                </span>
              </div>

              <button
                onClick={triggerManualRotation}
                className="px-3.5 py-2 bg-stone-800 hover:bg-stone-750 border border-stone-700 rounded-xl text-xs font-semibold text-stone-200 hover:text-white flex items-center gap-1.5 transition active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${justChanged ? 'animate-spin text-amber-400' : ''}`} />
                <span>Change Now</span>
              </button>
            </div>
          )}

          {/* Interval Selector */}
          <div>
            <label className="text-xs text-stone-300 font-medium block mb-2">
              Rotation Interval:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { mins: 60, label: '1 Hour (Recommended)' },
                { mins: 30, label: '30 Minutes' },
                { mins: 720, label: '12 Hours' },
              ].map((item) => (
                <button
                  key={item.mins}
                  onClick={() => handleIntervalChange(item.mins)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border text-center transition ${
                    config.intervalMinutes === item.mins
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                      : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Currently Set Lock Screen Thumbnail */}
          {currentLockscreenWallpaper && (
            <div className="flex items-center gap-3 pt-2 border-t border-stone-800/80">
              <img
                src={currentLockscreenWallpaper.imageUrl}
                alt="Active wallpaper"
                className="w-10 h-16 object-cover rounded-lg border border-amber-500/30 shrink-0"
              />
              <div className="overflow-hidden">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">
                  Current Lock Screen Wallpaper
                </span>
                <p className="text-xs text-stone-200 font-serif italic truncate">
                  "{currentLockscreenWallpaper.verseText}"
                </p>
                <p className="text-[11px] text-stone-400 font-cinzel font-semibold">
                  {currentLockscreenWallpaper.verseReference}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Offline Server & Storage Section */}
        <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Offline Server & Local Storage
              </span>
            </div>
            <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Offline Capable
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            The server and app operate fully offline. You can save all wallpaper sets and scriptures locally so rotation continues even without an internet connection.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
            <button
              onClick={handleCacheAllForOffline}
              disabled={isCaching}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 text-xs font-semibold text-stone-200 flex items-center justify-center gap-1.5 transition border border-stone-700"
            >
              <HardDrive className="w-3.5 h-3.5 text-amber-400" />
              <span>{isCaching ? 'Caching...' : `Download Offline Pack (${cachedCount || wallpapers.length} items)`}</span>
            </button>

            {/* Offline Simulation Toggle */}
            <button
              onClick={() => onToggleOfflineMode(!isOfflineMode)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border ${
                isOfflineMode
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-stone-850 border-stone-750 text-stone-300 hover:text-white'
              }`}
            >
              {isOfflineMode ? <WifiOff className="w-3.5 h-3.5 text-rose-400" /> : <Wifi className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{isOfflineMode ? 'Offline Mode Active' : 'Test Offline Mode'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition shadow-md"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
