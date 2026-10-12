import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Vibrate, Clock, HardDrive, 
  Check, Smartphone, RefreshCw, Wifi, WifiOff, 
  Sliders, Zap, Battery, BatteryCharging, BatteryWarning, 
  BatteryLow, BatteryMedium, Gauge, Power, ShieldAlert, AlertTriangle,
  Sun, Moon, Sunrise, Sunset, MapPin, Compass
} from 'lucide-react';
import { Wallpaper, ThemePreference, SolarThemeConfig } from '../types';
import { 
  AutoChangerConfig, 
  BatterySaverAction,
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
import { useBatteryStatus } from '../utils/useBatteryStatus';
import { 
  calculateSolarTimes, 
  getSavedSolarConfig, 
  saveSolarConfig, 
  defaultSolarThemeConfig 
} from '../utils/solarTheme';

export type SettingsTab = 'theme' | 'autochanger' | 'battery' | 'haptics' | 'storage';

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
  autoConfig?: AutoChangerConfig;
  onUpdateAutoConfig?: (config: AutoChangerConfig) => void;
  solarConfig?: SolarThemeConfig;
  onUpdateSolarConfig?: (config: SolarThemeConfig) => void;
  onRequestGeolocation?: () => Promise<{ success: boolean; message: string }>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'theme',
  wallpapers,
  currentLockscreenWallpaper,
  onSelectLockscreenWallpaper,
  isOfflineMode,
  onToggleOfflineMode,
  isLight = false,
  autoConfig: externalAutoConfig,
  onUpdateAutoConfig,
  solarConfig: externalSolarConfig,
  onUpdateSolarConfig,
  onRequestGeolocation,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
  const { settings: hapticSettings, updateSettings: updateHapticSettings } = useHapticSettings();
  
  // Auto-changer state synced with external config if available
  const [localAutoConfig, setLocalAutoConfig] = useState<AutoChangerConfig>(() => externalAutoConfig || getAutoChangerConfig());
  const autoConfig = externalAutoConfig || localAutoConfig;

  // Solar Theme schedule state
  const [localSolarConfig, setLocalSolarConfig] = useState<SolarThemeConfig>(() => externalSolarConfig || getSavedSolarConfig());
  const solarConfig = externalSolarConfig || localSolarConfig;
  const [geoLocating, setGeoLocating] = useState<boolean>(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  // Real-time battery status & adaptive saver calculation
  const batteryState = useBatteryStatus(autoConfig);
  const { batteryInfo, isSaverTriggered, effectiveAction, effectiveIntervalMinutes, statusBadge } = batteryState;

  // Real-time Solar calculation
  const solarCalculation = useMemo(() => {
    return calculateSolarTimes(solarConfig);
  }, [solarConfig]);

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

  useEffect(() => {
    if (externalAutoConfig) {
      setLocalAutoConfig(externalAutoConfig);
    }
  }, [externalAutoConfig]);

  useEffect(() => {
    if (externalSolarConfig) {
      setLocalSolarConfig(externalSolarConfig);
    }
  }, [externalSolarConfig]);

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

  // Countdown timer for auto-changer (taking battery saver into account)
  useEffect(() => {
    if (!isOpen || (activeTab !== 'autochanger' && activeTab !== 'battery')) return;

    if (effectiveAction === 'paused') {
      setRemainingSeconds(0);
      return;
    }

    const currentInterval = effectiveIntervalMinutes || autoConfig.intervalMinutes || 60;
    const intervalMs = currentInterval * 60 * 1000;

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
  }, [isOpen, activeTab, autoConfig, wallpapers, effectiveAction, effectiveIntervalMinutes]);

  if (!isOpen) return null;

  const supported = isHapticsSupported();

  // Central config updater for auto-changer
  const updateConfig = (nextConfig: AutoChangerConfig) => {
    setLocalAutoConfig(nextConfig);
    saveAutoChangerConfig(nextConfig);
    onUpdateAutoConfig?.(nextConfig);

    fetch('/api/auto-change-settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nextConfig),
    }).catch(console.warn);
  };

  // Central config updater for solar theme
  const updateSolar = (updates: Partial<SolarThemeConfig>) => {
    const nextSolar: SolarThemeConfig = { ...solarConfig, ...updates };
    setLocalSolarConfig(nextSolar);
    saveSolarConfig(nextSolar);
    onUpdateSolarConfig?.(nextSolar);
  };

  // Handle Solar Theme Mode changes
  const handleSetThemeMode = (mode: ThemePreference) => {
    triggerWebHaptic('selection');
    updateSolar({ mode });
  };

  const handleToggleCustomSchedule = () => {
    triggerWebHaptic('selection');
    updateSolar({ customScheduleEnabled: !solarConfig.customScheduleEnabled });
  };

  const handleCustomSunriseChange = (val: string) => {
    updateSolar({ customSunrise: val });
  };

  const handleCustomSunsetChange = (val: string) => {
    updateSolar({ customSunset: val });
  };

  const handleSimulateDayNight = (isDaytime: boolean) => {
    triggerWebHaptic('selection');
    updateSolar({
      manualSimulation: {
        active: true,
        isDaytime,
      },
    });
  };

  const handleResetSimulation = () => {
    triggerWebHaptic('selection');
    updateSolar({
      manualSimulation: {
        active: false,
        isDaytime: true,
      },
    });
  };

  const handleDetectLocation = async () => {
    triggerWebHaptic('selection');
    setGeoLocating(true);
    setGeoMessage(null);
    try {
      if (onRequestGeolocation) {
        const res = await onRequestGeolocation();
        setGeoMessage(res.message);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = parseFloat(pos.coords.latitude.toFixed(4));
            const lon = parseFloat(pos.coords.longitude.toFixed(4));
            updateSolar({
              useGeolocation: true,
              latitude: lat,
              longitude: lon,
              locationName: `GPS (${lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`})`,
            });
            setGeoMessage(`GPS location acquired (${lat}, ${lon}). Solar times refreshed.`);
            triggerWebHaptic('success');
          },
          () => {
            setGeoMessage('Location permission denied. Using local astronomical model.');
          }
        );
      }
    } catch {
      setGeoMessage('Unable to acquire location.');
    } finally {
      setGeoLocating(false);
    }
  };

  // Handle Haptic Toggle
  const handleToggleHaptic = (enabled: boolean) => {
    updateHapticSettings({ enabled });
    if (enabled) {
      triggerWebHaptic('success', hapticSettings.intensity);
    }
  };

  // Handle Haptic Intensity
  const handleSetIntensity = (intensity: HapticIntensity) => {
    updateHapticSettings({ intensity });
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
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  const handleIntervalChange = (minutes: number) => {
    const nextConfig = {
      ...autoConfig,
      intervalMinutes: minutes,
      lastChanged: Date.now(),
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  // Battery saver mode helpers
  const handleToggleBatterySaver = () => {
    const nextConfig: AutoChangerConfig = {
      ...autoConfig,
      batterySaver: {
        ...autoConfig.batterySaver,
        enabled: !autoConfig.batterySaver?.enabled,
      },
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  const handleSetBatterySaverAction = (action: BatterySaverAction) => {
    const nextConfig: AutoChangerConfig = {
      ...autoConfig,
      batterySaver: {
        ...autoConfig.batterySaver,
        action,
      },
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  const handleSetLowBatteryThreshold = (threshold: number) => {
    const nextConfig: AutoChangerConfig = {
      ...autoConfig,
      batterySaver: {
        ...autoConfig.batterySaver,
        lowBatteryThreshold: threshold,
      },
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  const handleTogglePauseWhenNotCharging = () => {
    const nextConfig: AutoChangerConfig = {
      ...autoConfig,
      batterySaver: {
        ...autoConfig.batterySaver,
        pauseWhenNotCharging: !autoConfig.batterySaver?.pauseWhenNotCharging,
      },
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
  };

  const handleSetSimulation = (active: boolean, level: number = 15, charging: boolean = false) => {
    const nextConfig: AutoChangerConfig = {
      ...autoConfig,
      batterySaver: {
        ...autoConfig.batterySaver,
        manualSimulation: {
          active,
          level,
          charging,
        },
      },
    };
    updateConfig(nextConfig);
    triggerWebHaptic('selection');
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
    updateConfig(updatedConfig);
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
    if (effectiveAction === 'paused') {
      return 'Paused';
    }
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Battery icon based on status
  const renderBatteryIcon = (level: number, charging: boolean, className = 'w-4 h-4') => {
    if (charging) return <BatteryCharging className={`${className} text-emerald-400`} />;
    if (level <= 20) return <BatteryLow className={`${className} text-rose-500`} />;
    if (level <= 50) return <BatteryMedium className={`${className} text-amber-500`} />;
    return <Battery className={`${className} text-emerald-400`} />;
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
              Customize solar theme scheduling, auto lock screen rotation, battery saver, and tactile haptics.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className={`grid grid-cols-2 sm:grid-cols-5 gap-1 p-1 rounded-2xl border mb-6 ${
          isLight ? 'bg-[#ede5d4]/70 border-[#dfd5c3]' : 'bg-stone-950/80 border-stone-800'
        }`}>
          {/* TAB 1: THEME & SOLAR SCHEDULE */}
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('theme');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'theme'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            {solarConfig.mode === 'auto_sun' ? (
              <Sunrise className="w-3.5 h-3.5 shrink-0" />
            ) : solarConfig.mode === 'light' ? (
              <Sun className="w-3.5 h-3.5 shrink-0 text-amber-500" />
            ) : (
              <Moon className="w-3.5 h-3.5 shrink-0" />
            )}
            <span>Theme & Solar</span>
            {solarConfig.mode === 'auto_sun' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 animate-pulse" />
            )}
          </button>

          {/* TAB 2: AUTO LOCK SCREEN */}
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('autochanger');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'autochanger'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Auto Lock</span>
            {autoConfig.enabled && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            )}
          </button>

          {/* TAB 3: BATTERY SAVER */}
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('battery');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition relative ${
              activeTab === 'battery'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            {renderBatteryIcon(batteryInfo.level, batteryInfo.charging, 'w-3.5 h-3.5 shrink-0')}
            <span>Battery Saver</span>
            {isSaverTriggered ? (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 ml-0.5 animate-pulse" />
            ) : autoConfig.batterySaver?.enabled ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            ) : null}
          </button>

          {/* TAB 4: HAPTICS */}
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('haptics');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'haptics'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <Vibrate className="w-3.5 h-3.5 shrink-0" />
            <span>Haptics</span>
            {hapticSettings.enabled ? (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 ml-0.5" />
            ) : null}
          </button>

          {/* TAB 5: OFFLINE */}
          <button
            onClick={() => {
              triggerWebHaptic('selection');
              setActiveTab('storage');
            }}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs sm:text-sm font-semibold transition ${
              activeTab === 'storage'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-bold'
                : isLight
                  ? 'text-stone-700 hover:text-stone-950 hover:bg-white/50'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5 shrink-0" />
            <span>Offline</span>
          </button>
        </div>

        {/* TAB 1: THEME & SUNRISE/SUNSET SCHEDULE */}
        {activeTab === 'theme' && (
          <div className="space-y-4 animate-fade-in">
            {/* Mode Selector Section */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500 block mb-1">
                  Appearance & Solar Theme Schedule
                </span>
                <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  Choose fixed Dark or Warm Paper mode, or schedule automatic light/dark switching based on local sunrise and sunset.
                </p>
              </div>

              {/* 3 Theme Options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {/* 1. Dark Mode */}
                <button
                  type="button"
                  onClick={() => handleSetThemeMode('dark')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    solarConfig.mode === 'dark'
                      ? 'bg-amber-600/15 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Moon className="w-4 h-4 text-amber-400" />
                      <span>Always Dark</span>
                    </div>
                    {solarConfig.mode === 'dark' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] text-amber-500/90 font-mono block mb-1">Deep Sanctuary Stone</span>
                  <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Dark theme with amber highlights. Optimal for low-light reading and OLED battery savings.
                  </p>
                </button>

                {/* 2. Light Mode */}
                <button
                  type="button"
                  onClick={() => handleSetThemeMode('light')}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    solarConfig.mode === 'light'
                      ? 'bg-amber-600/15 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span>Always Light</span>
                    </div>
                    {solarConfig.mode === 'light' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] text-amber-500/90 font-mono block mb-1">Warm Paper Papyrus</span>
                  <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Warm parchment aesthetic with crisp typography. Ideal for daylight scripture reading.
                  </p>
                </button>

                {/* 3. Automatic Sunrise / Sunset */}
                <button
                  type="button"
                  onClick={() => handleSetThemeMode('auto_sun')}
                  className={`p-3.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                    solarConfig.mode === 'auto_sun'
                      ? 'bg-amber-600/20 border-amber-500 text-amber-300 shadow-md shadow-amber-600/15'
                      : isLight
                        ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                        : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <Sunrise className="w-4 h-4 text-amber-500" />
                      <span>Automatic Solar</span>
                    </div>
                    {solarConfig.mode === 'auto_sun' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono block mb-1 font-semibold">
                    Sunrise & Sunset
                  </span>
                  <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Activates Warm Paper at sunrise and transitions to Dark mode at sunset automatically.
                  </p>
                </button>
              </div>

              {/* Automatic Solar Schedule Details (Shown when auto_sun is active or for reference) */}
              <div className={`p-4 rounded-xl border transition-all space-y-3 ${
                solarConfig.mode === 'auto_sun'
                  ? isLight ? 'bg-[#ede5d4] border-amber-600/30' : 'bg-stone-900 border-amber-500/30'
                  : 'opacity-70 bg-stone-900/40 border-stone-800'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      {solarCalculation.isDaytime ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">
                          {solarCalculation.isDaytime ? 'Daytime Active (Light Mode)' : 'Nighttime Active (Dark Mode)'}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                          solarCalculation.isDaytime 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' 
                            : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                        }`}>
                          {solarCalculation.isDaytime ? '☀️ Sun Up' : '🌙 Sun Down'}
                        </span>
                      </div>
                      <span className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {solarCalculation.nextTransitionText}
                      </span>
                    </div>
                  </div>

                  {/* Geolocation Button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoLocating}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition self-start sm:self-auto ${
                      isLight
                        ? 'bg-[#f4ecdf] hover:bg-[#eae2d2] border-[#ded4c1] text-stone-800'
                        : 'bg-stone-850 hover:bg-stone-800 border-stone-750 text-stone-200'
                    }`}
                    title="Detect exact coordinates via GPS for minute-precise sunrise & sunset"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-500" />
                    <span>{geoLocating ? 'Detecting...' : 'Detect GPS Location'}</span>
                  </button>
                </div>

                {geoMessage && (
                  <p className="text-[11px] text-amber-400 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                    {geoMessage}
                  </p>
                )}

                {/* Sunrise / Sunset Times Grid */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#fbf7ee] border-[#dfd5c3]' : 'bg-stone-950 border-stone-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sunrise className="w-5 h-5 text-amber-500 shrink-0" />
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Local Sunrise
                        </span>
                        <span className="text-sm sm:text-base font-bold font-mono text-amber-400">
                          {solarCalculation.sunriseFormatted}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
                      Light On
                    </span>
                  </div>

                  <div className={`p-3 rounded-xl border flex items-center justify-between ${
                    isLight ? 'bg-[#fbf7ee] border-[#dfd5c3]' : 'bg-stone-950 border-stone-800'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Sunset className="w-5 h-5 text-indigo-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                          Local Sunset
                        </span>
                        <span className="text-sm sm:text-base font-bold font-mono text-indigo-300">
                          {solarCalculation.sunsetFormatted}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] text-indigo-300 bg-indigo-500/10 px-1.5 py-0.5 rounded font-mono">
                      Dark On
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Compass className="w-3.5 h-3.5 text-amber-500" />
                    <span>Source: {solarConfig.locationName}</span>
                  </span>
                  <span>Evaluated continuously</span>
                </div>
              </div>

              {/* Custom Schedule Times Override Section */}
              <div className={`pt-3 border-t space-y-3 ${isLight ? 'border-[#e4dac6]' : 'border-stone-850'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold block">
                      Custom Sunrise & Sunset Schedule Times
                    </span>
                    <span className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      Override astronomical times with specific hours of your choosing
                    </span>
                  </div>

                  <input
                    type="checkbox"
                    checked={solarConfig.customScheduleEnabled}
                    onChange={handleToggleCustomSchedule}
                    className="w-4 h-4 text-amber-600 rounded border-stone-700 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                {solarConfig.customScheduleEnabled && (
                  <div className={`p-3 rounded-xl border grid grid-cols-1 sm:grid-cols-2 gap-3 animate-fade-in ${
                    isLight ? 'bg-[#ede5d4] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
                  }`}>
                    <div>
                      <label className="text-[11px] font-semibold text-amber-500 block mb-1">
                        Custom Sunrise Time (Light Mode On):
                      </label>
                      <input
                        type="time"
                        value={solarConfig.customSunrise}
                        onChange={(e) => handleCustomSunriseChange(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border outline-none ${
                          isLight ? 'bg-white border-[#dfd5c3] text-stone-900' : 'bg-stone-950 border-stone-800 text-amber-400'
                        }`}
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-indigo-400 block mb-1">
                        Custom Sunset Time (Dark Mode On):
                      </label>
                      <input
                        type="time"
                        value={solarConfig.customSunset}
                        onChange={(e) => handleCustomSunsetChange(e.target.value)}
                        className={`w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg border outline-none ${
                          isLight ? 'bg-white border-[#dfd5c3] text-stone-900' : 'bg-stone-950 border-stone-800 text-indigo-300'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Solar Simulator Playground */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-[#ede5d4] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Interactive Solar Simulator (Test Bed)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {solarConfig.manualSimulation?.active ? 'Simulation Active' : 'Live Solar Clock'}
                  </span>
                </div>

                <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  Preview how the application switches between daytime Warm Paper and nighttime Dark mode at any moment:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateDayNight(true)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border-amber-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>Simulate Daytime (Light)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateDayNight(false)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Simulate Nighttime (Dark)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleResetSimulation}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Live Solar Clock</span>
                  </button>
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
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-stone-400 font-semibold block">
                        Next Lock Screen Change In
                      </span>
                      {isSaverTriggered && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          effectiveAction === 'paused'
                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {effectiveAction === 'paused' ? 'Paused (Battery Saver)' : 'Extended Cadence'}
                        </span>
                      )}
                    </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                    Base Rotation Interval:
                  </label>
                  {isSaverTriggered && effectiveAction === 'reduced' && (
                    <span className="text-[11px] text-amber-400 font-mono font-semibold">
                      Effective interval: {effectiveIntervalMinutes}m (due to Battery Saver)
                    </span>
                  )}
                </div>
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

              {/* Battery Saver Quick Peek Banner in AutoChanger Tab */}
              <div className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                isLight ? 'bg-[#ede5d4] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
              }`}>
                <div className="flex items-center gap-2.5">
                  {renderBatteryIcon(batteryInfo.level, batteryInfo.charging)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold">Battery Saver Mode</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                        autoConfig.batterySaver?.enabled
                          ? isSaverTriggered 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-stone-700 text-stone-300'
                      }`}>
                        {autoConfig.batterySaver?.enabled 
                          ? isSaverTriggered ? 'Triggered' : 'Armed' 
                          : 'Disabled'}
                      </span>
                    </div>
                    <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {statusBadge.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    triggerWebHaptic('selection');
                    setActiveTab('battery');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 transition shrink-0"
                >
                  Configure
                </button>
              </div>

              {/* Active Wallpaper Preview */}
              {currentLockscreenWallpaper && (
                <div className={`flex items-center gap-3 pt-3 border-t ${isLight ? 'border-[#e4dac6]' : 'border-stone-850'}`}>
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

        {/* TAB 3: BATTERY SAVER MODE */}
        {activeTab === 'battery' && (
          <div className="space-y-4 animate-fade-in">
            {/* Live Battery Hardware State Card */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
                    {renderBatteryIcon(batteryInfo.level, batteryInfo.charging, 'w-6 h-6')}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base font-bold">Device Power & Battery Status</span>
                      {batteryInfo.charging ? (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30 font-semibold flex items-center gap-1">
                          <Zap className="w-2.5 h-2.5" /> Charging
                        </span>
                      ) : (
                        <span className="text-[10px] bg-stone-700 text-stone-300 px-2 py-0.5 rounded-full font-semibold">
                          On Battery
                        </span>
                      )}
                    </div>
                    <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {batteryInfo.isSupported ? 'Hardware Battery API connected' : 'Simulated / Protected Desktop Mode'}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-amber-400">
                    {batteryInfo.level}%
                  </span>
                </div>
              </div>

              {/* Visual Battery Level Bar */}
              <div className="space-y-1.5">
                <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border shadow-inner ${
                  isLight ? 'bg-[#e8decb] border-[#d8ccb6]' : 'bg-stone-900 border-stone-800'
                }`}>
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      batteryInfo.charging
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : batteryInfo.level <= 20
                          ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                          : 'bg-gradient-to-r from-amber-600 to-amber-400'
                    }`}
                    style={{ width: `${Math.max(4, batteryInfo.level)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                  <span>0% (Empty)</span>
                  <span className="text-amber-500 font-semibold">{statusBadge.label}</span>
                  <span>100% (Full)</span>
                </div>
              </div>
            </div>

            {/* Master Battery Saver Toggle */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-4 ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm sm:text-base font-bold block">
                    Enable Battery Saver Mode
                  </span>
                  <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Reduces CPU, GPU, and network usage by altering auto-rotation frequency when on battery
                  </span>
                </div>

                <button
                  type="button"
                  role="switch"
                  aria-checked={Boolean(autoConfig.batterySaver?.enabled)}
                  onClick={handleToggleBatterySaver}
                  className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                    autoConfig.batterySaver?.enabled ? 'bg-amber-600' : isLight ? 'bg-stone-300' : 'bg-stone-800'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      autoConfig.batterySaver?.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Behavior Selector: Reduce Frequency VS Pause Completely */}
              <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-[#e4dac6]' : 'border-stone-850'} ${
                !autoConfig.batterySaver?.enabled ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                  Power Saving Behavior When Triggered:
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: Reduce Frequency */}
                  <button
                    type="button"
                    onClick={() => handleSetBatterySaverAction('reduce')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      autoConfig.batterySaver?.action === 'reduce'
                        ? 'bg-amber-600/15 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10'
                        : isLight
                          ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Gauge className="w-3.5 h-3.5 text-amber-500" />
                        <span>Reduce Rotation Frequency</span>
                      </span>
                      {autoConfig.batterySaver?.action === 'reduce' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <span className="text-[10px] font-mono text-amber-500 font-bold block mb-1">
                      Multiplies interval by 3x (e.g. 1h → 3h)
                    </span>
                    <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      Slows down background rotation to save battery while continuing periodic scripture updates.
                    </p>
                  </button>

                  {/* Option 2: Pause Auto-Rotation */}
                  <button
                    type="button"
                    onClick={() => handleSetBatterySaverAction('pause')}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      autoConfig.batterySaver?.action === 'pause'
                        ? 'bg-amber-600/15 border-amber-500 text-amber-300 shadow-md shadow-amber-600/10'
                        : isLight
                          ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                          : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Power className="w-3.5 h-3.5 text-rose-400" />
                        <span>Pause Auto-Rotation</span>
                      </span>
                      {autoConfig.batterySaver?.action === 'pause' && <Check className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                    <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
                      Halts background updates completely
                    </span>
                    <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      Freezes automatic wallpaper changes to preserve remaining battery. Automatically resumes when plugged into power.
                    </p>
                  </button>
                </div>
              </div>

              {/* Threshold Selection */}
              <div className={`space-y-2 pt-2 border-t ${isLight ? 'border-[#e4dac6]' : 'border-stone-850'} ${
                !autoConfig.batterySaver?.enabled ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <label className="text-xs font-bold uppercase tracking-wider text-amber-500 block">
                  Trigger When Battery Drops Below:
                </label>

                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => handleSetLowBatteryThreshold(pct)}
                      className={`py-2 px-1 text-center rounded-xl text-xs font-semibold border transition ${
                        autoConfig.batterySaver?.lowBatteryThreshold === pct
                          ? 'bg-amber-600/20 border-amber-500 text-amber-400 font-bold'
                          : isLight
                            ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800'
                            : 'bg-stone-900 border-stone-800 text-stone-400'
                      }`}
                    >
                      {pct}% {pct === 20 ? '(Default)' : ''}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional trigger: Pause anytime running on battery */}
              <div className={`flex items-center justify-between pt-2 border-t ${isLight ? 'border-[#e4dac6]' : 'border-stone-850'} ${
                !autoConfig.batterySaver?.enabled ? 'opacity-50 pointer-events-none' : ''
              }`}>
                <div>
                  <span className="text-xs font-bold block">
                    Trigger whenever unplugged (Not Charging)
                  </span>
                  <span className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                    Activates immediately whenever device is running on battery, regardless of percentage
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={Boolean(autoConfig.batterySaver?.pauseWhenNotCharging)}
                  onChange={handleTogglePauseWhenNotCharging}
                  className="w-4 h-4 text-amber-600 rounded border-stone-700 focus:ring-amber-500 cursor-pointer"
                />
              </div>

              {/* Interactive Test / Emulation Playground */}
              <div className={`p-3.5 rounded-xl border space-y-2.5 ${
                isLight ? 'bg-[#ede5d4] border-[#dfd5c3]' : 'bg-stone-900 border-stone-800'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                    Interactive Battery Simulator (Test Bed)
                  </span>
                  <span className="text-[10px] text-stone-400 font-mono">
                    {autoConfig.batterySaver?.manualSimulation?.active ? 'Simulation Active' : 'Live Hardware'}
                  </span>
                </div>

                <p className={`text-[11px] ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                  Test how the app adapts to low battery or unplugged states even when testing on desktop or fully charged devices:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSetSimulation(true, 15, false)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <BatteryLow className="w-3.5 h-3.5 text-rose-400" />
                    <span>Simulate 15% Unplugged</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetSimulation(true, 90, true)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                  >
                    <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Simulate Charging (90%)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSetSimulation(false)}
                    className="px-2.5 py-1.5 rounded-lg border text-xs font-semibold bg-stone-800 hover:bg-stone-750 text-stone-300 border-stone-700 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reset to Live Hardware</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: HAPTIC FEEDBACK SETTINGS */}
        {activeTab === 'haptics' && (
          <div className="space-y-4 animate-fade-in">
            {/* Master Toggle Banner */}
            <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'
            }`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    hapticSettings.enabled
                      ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30'
                      : isLight ? 'bg-stone-200 text-stone-400' : 'bg-stone-850 text-stone-500'
                  }`}>
                    <Vibrate className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-sm sm:text-base font-bold block">
                      Tactile Haptic Feedback
                    </span>
                    <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                      {hapticSettings.enabled ? 'Enabled — Tactile pulses on button taps and milestones' : 'Disabled'}
                    </span>
                  </div>
                </div>

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
                    Choose the tactile depth of each tap:
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-amber-400 capitalize bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/20">
                  {hapticSettings.intensity}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  { id: 'light' as HapticIntensity, title: 'Subtle / Light', durationLabel: '~6ms Micro-Tick', desc: 'Whisper-quiet micro vibrations.' },
                  { id: 'medium' as HapticIntensity, title: 'Medium (Default)', durationLabel: '~12ms Balanced', desc: 'Optimized tactile punch.' },
                  { id: 'strong' as HapticIntensity, title: 'Strong / Heavy', durationLabel: '~24ms Resonant', desc: 'Deep, firm vibration pulses.' },
                ].map((item) => {
                  const isSelected = hapticSettings.intensity === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSetIntensity(item.id)}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-amber-600/15 border-amber-500 text-amber-400 shadow-md shadow-amber-600/10'
                          : isLight
                            ? 'bg-[#ede5d4] border-[#dfd5c3] text-stone-800 hover:border-[#cfc4b0]'
                            : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">{item.title}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-amber-500" />}
                      </div>
                      <span className="text-[10px] font-mono text-amber-500 font-bold block mb-0.5">
                        {item.durationLabel}
                      </span>
                      <p className={`text-[11px] leading-tight ${isLight ? 'text-stone-600' : 'text-stone-400'}`}>
                        {item.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Bed */}
            <div className={`p-4 rounded-2xl border ${isLight ? 'bg-[#f4ecdf] border-[#ded4c1]' : 'bg-stone-950 border-stone-800'}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-500">Interactive Test Bed</span>
                <span className="text-[10px] font-mono text-stone-400">
                  {lastPulseInfo ? `${lastPulseInfo.pattern} pulse fired` : 'Ready'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { pattern: 'selection' as HapticPattern, label: 'Selection', detail: 'Crisp tap' },
                  { pattern: 'success' as HapticPattern, label: 'Success', detail: 'Double pulse' },
                  { pattern: 'heavy' as HapticPattern, label: 'Lockscreen', detail: 'Firm pulse' },
                  { pattern: 'warning' as HapticPattern, label: 'Warning', detail: 'Staccato' },
                ].map((test) => (
                  <button
                    key={test.pattern}
                    onClick={() => handleTestPattern(test.pattern)}
                    disabled={!hapticSettings.enabled}
                    className={`px-3 py-2 rounded-xl border text-center transition flex flex-col items-center justify-center gap-0.5 ${
                      !hapticSettings.enabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-amber-500'
                    } ${isLight ? 'bg-[#ede5d4] border-[#d8cca8] text-stone-900' : 'bg-stone-900 border-stone-800 text-stone-200'}`}
                  >
                    <span className="text-xs font-bold">{test.label}</span>
                    <span className="text-[10px] text-amber-500 font-mono">{test.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: OFFLINE SERVER & STORAGE */}
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
