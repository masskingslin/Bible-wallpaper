import { Wallpaper } from '../types';

const OFFLINE_PACK_STORAGE_KEY = 'bible_wallpapers_offline_pack';
const OFFLINE_SETTINGS_KEY = 'bible_wallpapers_auto_change_settings';

export interface AutoChangerConfig {
  enabled: boolean;
  intervalMinutes: number; // default: 60 (1 hour)
  targetScreen: 'lockscreen' | 'both';
  lastChanged: number;
}

export const defaultAutoChangerConfig: AutoChangerConfig = {
  enabled: true,
  intervalMinutes: 60, // 1 hour
  targetScreen: 'lockscreen',
  lastChanged: Date.now(),
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
    return raw ? { ...defaultAutoChangerConfig, ...JSON.parse(raw) } : defaultAutoChangerConfig;
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
