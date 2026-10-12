import { Wallpaper } from '../types';

const OFFLINE_PACK_STORAGE_KEY = 'bible_wallpapers_offline_pack';
const OFFLINE_SETTINGS_KEY = 'bible_wallpapers_auto_change_settings';

export type BatterySaverAction = 'pause' | 'reduce';

export interface BatterySaverConfig {
  enabled: boolean;
  action: BatterySaverAction; // 'pause' | 'reduce'
  lowBatteryThreshold: number; // percentage (e.g. 20)
  pauseWhenNotCharging: boolean; // pause auto-rotation anytime the device is not charging
  reduceIntervalMultiplier: number; // multiplier when reducing (e.g. 3x interval)
  manualSimulation?: {
    active: boolean;
    level: number; // 0-100
    charging: boolean;
  };
}

export interface AutoChangerConfig {
  enabled: boolean;
  intervalMinutes: number; // default: 60 (1 hour)
  targetScreen: 'lockscreen' | 'both';
  lastChanged: number;
  batterySaver: BatterySaverConfig;
}

export const defaultBatterySaverConfig: BatterySaverConfig = {
  enabled: true,
  action: 'reduce', // 'reduce' (slow down frequency) or 'pause' (stop when low or unplugged)
  lowBatteryThreshold: 20, // 20%
  pauseWhenNotCharging: false,
  reduceIntervalMultiplier: 3, // 60 mins -> 180 mins (3 hours)
  manualSimulation: {
    active: false,
    level: 15,
    charging: false,
  },
};

export const defaultAutoChangerConfig: AutoChangerConfig = {
  enabled: true,
  intervalMinutes: 60, // 1 hour
  targetScreen: 'lockscreen',
  lastChanged: Date.now(),
  batterySaver: defaultBatterySaverConfig,
};

/**
 * Saves all wallpapers for offline use into local storage
 */
export function saveOfflineWallpapers(wallpapers: Wallpaper[]): void {
  try {
    localStorage.setItem(OFFLINE_PACK_STORAGE_KEY, JSON.stringify(wallpapers));
  } catch (err) {
    console.warn('Unable to cache all wallpapers to localStorage', err);
  }
}

/**
 * Retrieves wallpapers from local offline storage
 */
export function getOfflineWallpapers(): Wallpaper[] | null {
  try {
    const raw = localStorage.getItem(OFFLINE_PACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Gets Auto-Changer configuration
 */
export function getAutoChangerConfig(): AutoChangerConfig {
  try {
    const raw = localStorage.getItem(OFFLINE_SETTINGS_KEY);
    if (!raw) return defaultAutoChangerConfig;
    const parsed = JSON.parse(raw);
    return {
      ...defaultAutoChangerConfig,
      ...parsed,
      batterySaver: {
        ...defaultBatterySaverConfig,
        ...(parsed.batterySaver || {}),
        manualSimulation: {
          ...defaultBatterySaverConfig.manualSimulation,
          ...(parsed.batterySaver?.manualSimulation || {}),
        },
      },
    };
  } catch {
    return defaultAutoChangerConfig;
  }
}

/**
 * Saves Auto-Changer configuration
 */
export function saveAutoChangerConfig(config: AutoChangerConfig): void {
  try {
    localStorage.setItem(OFFLINE_SETTINGS_KEY, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save auto changer config', err);
  }
}
