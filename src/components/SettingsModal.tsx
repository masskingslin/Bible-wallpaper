import React, { useState, useEffect } from 'react';
import { 
  X, Vibrate, VibrateOff, Clock, HardDrive, Sparkles, 
  Check, Smartphone, RefreshCw, Wifi, WifiOff, Volume2, 
  Sliders, ShieldCheck, Zap, Info, ChevronRight
} from 'lucide-react';
import { Wallpaper } from '../types';
import { 
  AutoChangerConfig, 
  getAutoChangerConfig, 
  saveAutoChangerConfig, 
  saveOfflineWallpapers,
  getOfflineWallpapers
} from '../utils/offlineStorage';
import { 
  useHapticSettings, 
  triggerWebHaptic, 
  isHapticsSupported, 
  HapticIntensity, 
  HapticPattern 
} from '../utils/haptics';

export type SettingsTab = 'haptics' | 'autochanger' | 'storage';

export interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: SettingsTab;
  wallpapers: Wallpaper[];
  currentLockscreenWallpaper: Wallpaper | null;
  onSelectLockscreenWallpaper: (wallpaper: Wallpaper) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: (offline: boolean) => void;
  isLight?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'haptics',
  wallpapers,
  currentLockscreenWallpaper,
  onSelectLockscreenWallpaper,
  isOfflineMode,
  onToggleOfflineMode,
  isLight = false,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { settings: hapticSettings, updateSettings: updateHapticSettings } = useHapticSettings();
  
  // Auto-changer state
  const [autoConfig, setAutoConfig] = useState<AutoChangerConfig>(getAutoChangerConfig);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(3600);
  const [cachedCount, setCachedCount] = useState<number>(() => {
    const cached = getOfflineWallpapers();
    return cached ? cached.length : 0;
  });
  const [isCaching, setIsCaching] = useState(false);
  const [justRotated, setJustRotated] = useState(false);

  // Live visual pulse feedback for tester
  const [lastPulseInfo, setLastPulseInfo] = useState<{
    pattern: string;
    intensity: string;
    timing: number | number[];
    timestamp: number;
  } | null>(null);
  const [isPulseRippling, setIsPulseRippling] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  // Listen to haptic-pulse events for visual ripple in modal
  useEffect(() => {
    if (!isOpen) return;

    const handlePulse = (e: Event) => {
      const customEvent = e as CustomEvent<{
        pattern: string;
        intensity: string;
        timing: number | number[];
        enabled: boolean;
      }>;
      if (customEvent.detail) {
        setLastPulseInfo({
          pattern: customEvent.detail.pattern,
          intensity: customEvent.detail.intensity,
          timing: customEvent.detail.timing,
          timestamp: Date.now(),
        });
        setIsPulseRippling(true);
        const timer = setTimeout(() => setIsPulseRippling(false), 500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('haptic-pulse', handlePulse);
    return () => window.removeEventListener('haptic-pulse', handlePulse);
  }, [isOpen]);

  // Countdown timer for auto-changer
  useEffect(() => {
    if (!isOpen || activeTab !== 'autochanger') return;

    const intervalMs = autoConfig.intervalMinutes * 60 * 1000;
    const calculateRemaining = () => {
      const now = Date.now();
      const elapsed = (now - autoConfig.lastChanged) % intervalMs;
      const left = Math.max(0, Math.floor((intervalMs - elapsed) / 1000));
      setRemainingSeconds(left);

      if (left <= 1 && autoConfig.enabled && wallpapers.length > 0) {
        triggerManualRotation();
      }
    };

    calculateRemaining();
    const timer = setInterval(calculateRemaining, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeTab, autoConfig, wallpapers]);

  if (!isOpen) return null;

  const supported = isHapticsSupported();

  // Handle Haptic Toggle
  const handleToggleHaptic = (enabled: boolean) => {
    updateHapticSettings({ enabled });
    if (enabled) {
      // Trigger a sample pulse upon enabling
      triggerWebHaptic('success', hapticSettings.intensity);
    }
  };

  // Handle Haptic Intensity
  const handleSetIntensity = (intensity: HapticIntensity) => {
    updateHapticSettings({ intensity });
    // Trigger preview pulse with new intensity
    triggerWebHaptic('selection', intensity);
  };

  // Test pattern trigger
  const handleTestPattern = (pattern: HapticPattern) => {
    triggerWebHaptic(pattern);
  };

  // Auto changer helpers
  const handleToggleAutoChanger = () => {
    const nextConfig = {
      ...autoConfig,
      enabled: !autoConfig.enabled,
      lastChanged: Date.now(),
    };
    setAutoConfig(nextConfig);
    saveAutoChangerConfig(nextConfig);
    triggerWebHaptic('selection');

    fetch('/api/auto-change-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
    }).catch(console.warn);
  };

  const handleIntervalChange = (minutes: number) => {
    const nextConfig = {
      ...autoConfig,
      intervalMinutes: minutes,
      lastChanged: Date.now(),
    };
    setAutoConfig(nextConfig);
    saveAutoChangerConfig(nextConfig);
    triggerWebHaptic('selection');

    fetch('/api/auto-change-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
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

    const updatedConfig = { ...autoConfig, lastChanged: Date.now() };
    setAutoConfig(updatedConfig);
    saveAutoChangerConfig(updatedConfig);
    triggerWebHaptic('heavy');

    setJustRotated(true);
    setTimeout(() => setJustRotated(false), 2000);
  };

  const handleCacheAllForOffline = async () => {
    setIsCaching(true);
    triggerWebHaptic('selection');
    try {
      const res = await fetch('/api/offline-pack');
      const data = await res.json();
      if (data.wallpapers) {
        saveOfflineWallpapers(data.wallpapers);
        setCachedCount(data.wallpapers.length);
        triggerWebHaptic('success');
      }
    } catch {
      saveOfflineWallpapers(wallpapers);
      setCachedCount(wallpapers.length);
      triggerWebHaptic('success');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div 
        className={`relative w-full max-w-2xl rounded-3xl p-5 sm:p-7 shadow-2xl border transition-all overflow-hidden my-auto ${
          isLight
            ? 'bg-[#fbf7ee] border-[#dfd5c3] text-stone-900'
            : 'bg-stone-900 border-stone-800 text-white'
        }`}
      >
        {/* Amber Ambient Glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            triggerWebHaptic('selection');
            onClose();
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full transition ${
            isLight
              ? 'bg-[#ede5d4] hover:bg-[#e2d8c3] text-stone-600 hover:text-stone-900'
              : 'bg-stone-800 hover:bg-stone-750 text-stone-400 hover:text-white'
          }`}
          title="Close Settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-stone-950 shadow-lg shadow-amber-600/25 shrink-0">
            <Sliders className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-cinzel tracking-wide flex items-center gap-2">
              Settings & Preferences
            </h2>
            <p className={`text-xs sm:text-sm ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
              Customize haptic responses, lock screen auto rotation, and offline storage.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`flex items-center gap-1.5 p-1 rounded-2xl border mb-6 ${
          isLight ? 'bg-[#ede5d4]/70 border-[#dfd5c3]' : 'bg-stone-950/80 border-stone-800'
        }`}>
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('haptics');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'haptics'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Vibrate className="w-4 h-4 shrink-0" />
            <span>Haptic Feedback</span>
            {hapticSettings.enabled ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-stone-500 ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('autochanger');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'autochanger'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Clock className="w-4 h-4 shrink-0" />
            <span>Auto Lock Screen</span>
            {autoConfig.enabled && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 ml-0.5 animate-pulse" />
            )}
          </button>

          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('storage');
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'storage'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <HardDrive className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Offline & Data</span>
            <span className="sm:hidden">Offline</span>
          </button>
        </div>

        {/* TAB 1: HAPTIC FEEDBACK SETTINGS */}
        {activeTab === 'haptics' && (
          <div className="space-y-5 animate-fade-in">
            
            {/* Master Toggle Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isLight
                ? 'bg-[#f4ecdf] border-[#ded4c1]'
                : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hapticSettings.enabled
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : 'bg-stone-800/80 text-stone-400 border border-stone-700'
                  }`}>
                    {hapticSettings.enabled ? (
                      <Vibrate className="w-5 h-5 animate-bounce" />
                    ) : (
                      <VibrateOff className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold">
                        Haptic Feedback
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        hapticSettings.enabled
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-stone-800 border-stone-700 text-stone-400'
                      }`}>
                        {hapticSettings.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {hapticSettings.enabled
                        ? 'Tactile vibrations are triggered on bookmarks, downloads, and celebrations.'
                        : 'All tactile vibrations and haptic responses are completely muted.'}
                    </p>
                  </div>
                </div>

                {/* Big Accessible Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={hapticSettings.enabled}
                  onClick={() => handleToggleHaptic(!hapticSettings.enabled)}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    hapticSettings.enabled ? 'bg-amber-600' : isLight ? 'bg-stone-300' : 'bg-stone-800'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      hapticSettings.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Hardware Capability Info */}
              <div className={`mt-3 pt-3 border-t flex items-center justify-between text-[11px] ${
                isLight ? 'border-[#e4dac6] text-stone-500' : 'border-stone-850 text-stone-400'
              }`}>
                <div className="flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Hardware Status: {supported ? (
                      <span className="text-emerald-500 font-semibold">Vibration API Supported</span>
                    ) : (
                      <span className="text-amber-500 font-semibold">Desktop / Visual Emulation Ready</span>
                    )}
                  </span>
                </div>
                {!supported && (
                  <span className="text-[10px] opacity-80 hidden sm:inline">
                    (Vibration API requires mobile device)
                  </span>
                )}
              </div>
            </div>

            {/* Intensity Selector Section */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              !hapticSettings.enabled ? 'opacity-50 pointer-events-none' : ''
            } ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    Vibration Intensity
                  </span>
                  <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Choose the tactile depth of each tap and confirmation pulse:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 capitalize bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {hapticSettings.intensity}
                </span>
              </div>

              {/* Intensity Options Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  {
                    id: 'light' as HapticIntensity,
                    title: 'Subtle / Light',
                    durationLabel: '~6ms Micro-Tick',
                    desc: 'Delicate, whisper-quiet micro vibrations for quiet environments.',
                    icon: '✦',
                  },
                  {
                    id: 'medium' as HapticIntensity,
                    title: 'Medium (Default)',
                    durationLabel: '~12ms Balanced',
                    desc: 'Optimized tactile punch for crisp, natural button responses.',
                    icon: '✦✦',
                  },
                  {
                    id: 'strong' as HapticIntensity,
                    title: 'Strong / Heavy',
                    durationLabel: '~24ms Resonant',
                    desc: 'Deep, firm vibration pulses for maximum tactile presence.',
                    icon: '✦✦✦',
                  },
                ].map((item) => {
                  const isSelected = hapticSettings.intensity === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSetIntensity(item.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        isSelected
                          ? 'bg-amber-600/15 border-amber-500 text-amber-400 shadow-md shadow-amber-600/10'
                          : isLight
                            ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold flex items-center gap-1.5">
                          <span>{item.title}</span>
                        </span>
                        {isSelected && (
                          <div className="w-4 h-4 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-amber-500 font-bold block mb-1">
                        {item.durationLabel}
                      </span>
                      <p className={`text-[11px] leading-tight ${
                        isLight ? 'text-stone-600' : 'text-stone-400'
                      }`}>
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Interactive Haptic Test Bed */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
                    Interactive Tactile Test Bed
                  </span>
                </div>
                {/* Live Ripple Visualizer indicator */}
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full transition-all ${
                    isPulseRippling
                      ? 'bg-amber-400 scale-150 ring-4 ring-amber-500/30'
                      : 'bg-stone-600 scale-100'
                  }`} />
                  <span className="text-[10px] font-mono text-stone-400">
                    {lastPulseInfo ? `${lastPulseInfo.pattern} (${Array.isArray(lastPulseInfo.timing) ? lastPulseInfo.timing.join(',') : lastPulseInfo.timing}ms)` : 'Ready'}
                  </span>
                </div>
              </div>

              <p className={`text-xs mb-3 ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                Tap each button below to preview how different app interactions feel at your selected intensity:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { pattern: 'selection' as HapticPattern, label: 'Selection Tick', detail: 'Single crisp tap' },
                  { pattern: 'success' as HapticPattern, label: 'Bookmark / Save', detail: 'Double pulse' },
                  { pattern: 'heavy' as HapticPattern, label: 'Lock Screen Set', detail: 'Firm resonant pulse' },
                  { pattern: 'warning' as HapticPattern, label: 'Reset / Warning', detail: 'Staccato cadence' },
                ].map((test) => (
                  <button
                    key={test.pattern}
                    onClick={() => handleTestPattern(test.pattern)}
                    disabled={!hapticSettings.enabled}
                    className={`px-3 py-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 active:scale-95 ${
                      !hapticSettings.enabled
                        ? 'opacity-40 cursor-not-allowed bg-stone-900 border-stone-800'
                        : isLight
                          ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#d8cca8] text-amber-950 hover:border-amber-500'
                          : 'bg-stone-900 hover:bg-stone-850 border-stone-800 text-stone-200 hover:border-amber-500/60'
                    }`}
                  >
                    <span className="text-xs font-bold">{test.label}</span>
                    <span className="text-[10px] text-amber-500 font-mono">{test.detail}</span>
                  </button>
                ))}
              </div>

              {/* Where haptics are active */}
              <div className={`mt-4 pt-3 border-t text-[11px] space-y-1.5 ${
                isLight ? 'border-[#e4dac6] text-stone-600' : 'border-stone-850 text-stone-400'
              }`}>
                <span className="font-semibold text-stone-300 block uppercase tracking-wider text-[10px]">
                  Supported Interactions Throughout App:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px]">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Topic & theme filter switching</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Favoriting & bookmarking verses</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Lock screen wallpaper application</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Daily reading streak milestone confetti</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Bulk HD ZIP packaging & downloads</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-amber-500" />
                    <span>Daily verse audio narration & quotes</span>
                  </span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AUTO LOCK SCREEN ROTATION */}
        {activeTab === 'autochanger' && (
          <div className="space-y-4 animate-fade-in">
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              
              {/* Enable Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-bold block">
                      Automatic Lock Screen Rotation
                    </span>
                    <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {autoConfig.enabled ? 'Active — Automatically changes lock screen' : 'Disabled'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={autoConfig.enabled}
                  onClick={handleToggleAutoChanger}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    autoConfig.enabled ? 'bg-amber-600' : isLight ? 'bg-stone-300' : 'bg-stone-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Countdown & Manual Rotate */}
              {autoConfig.enabled && (
                <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                  isLight ? 'bg-[#ede5d4] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                      Next Lock Screen Change In
                    </span>
                    <span className="text-xl sm:text-2xl font-bold font-mono text-amber-400">
                      {formatCountdown(remainingSeconds)}
                    </span>
                  </div>

                  <button
                    onClick={triggerManualRotation}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition active:scale-95 shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${justRotated ? 'animate-spin' : ''}`} />
                    <span>Change Now</span>
                  </button>
                </div>
              )}

              {/* Interval Options */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-2">
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
                      className={`py-2.5 px-2 rounded-xl text-xs font-semibold border text-center transition ${
                        autoConfig.intervalMinutes === item.mins
                          ? 'bg-amber-600/20 border-amber-500 text-amber-400 font-bold'
                          : isLight
                            ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800'
                            : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Wallpaper Preview */}
              {currentLockscreenWallpaper && (
                <div className={`flex items-center gap-3 pt-3 border-t ${
                  isLight ? 'border-[#e4dac6]' : 'border-stone-850'
                }`}>
                  <img
                    src={currentLockscreenWallpaper.imageUrl}
                    alt="Active wallpaper"
                    className="w-11 h-18 object-cover rounded-xl border border-amber-500/40 shrink-0 shadow-md"
                  />
                  <div className="overflow-hidden">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                      Active Lock Screen Wallpaper
                    </span>
                    <p className="text-xs font-serif italic truncate mt-0.5">
                      "{currentLockscreenWallpaper.verseText}"
                    </p>
                    <p className="text-[11px] font-cinzel font-semibold text-amber-400 mt-0.5">
                      {currentLockscreenWallpaper.verseReference}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: OFFLINE SERVER & STORAGE */}
        {activeTab === 'storage' && (
          <div className="space-y-4 animate-fade-in">
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <HardDrive className="w-5 h-5 text-emerald-400" />
                  <span className="text-sm sm:text-base font-bold">
                    Offline Server & Local Storage
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  Offline Capable
                </span>
              </div>

              <p className={`text-xs leading-relaxed ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                The server and web app operate without mandatory internet connectivity. You can save full wallpaper sets and scriptures locally so daily rotation continues seamlessly anywhere.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
                <button
                  onClick={handleCacheAllForOffline}
                  disabled={isCaching}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                    isLight
                      ? 'bg-[#ede5d4] hover:bg-[#e4dac6] border-[#dfd5c3] text-stone-900'
                      : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                  }`}
                >
                  <HardDrive className="w-4 h-4 text-amber-400" />
                  <span>{isCaching ? 'Caching in progress...' : `Download Offline Pack (${cachedCount || wallpapers.length} items)`}</span>
                </button>

                <button
                  onClick={() => {
                    triggerWebHaptic('selection');
                    onToggleOfflineMode(!isOfflineMode);
                  }}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition border ${
                    isOfflineMode
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:text-stone-950'
                        : 'bg-stone-850 border-stone-750 text-stone-300 hover:text-white'
                  }`}
                >
                  {isOfflineMode ? (
                    <WifiOff className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Wifi className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>{isOfflineMode ? 'Offline Mode Active' : 'Test Offline Mode'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 flex items-center justify-between pt-3 border-t border-stone-800/80">
          <span className={`text-[11px] ${isLight ? 'text-stone-500' : 'text-stone-400'}`}>
            Changes are saved automatically to your device.
          </span>
          <button
            onClick={() => {
              triggerWebHaptic('success');
              onClose();
            }}
            className="px-6 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 rounded-xl text-xs font-bold transition shadow-md shadow-amber-600/20"
          >
            Save & Done
          </button>
        </div>
      </div>
    </div>
  );
};
