import { useState, useEffect, useCallback } from 'react';

/**
 * Web Haptic Feedback Utility & Configuration
 * 
 * Provides distinct, intensity-based tactile vibration patterns for web interactions
 * using the HTML5 Vibration API (navigator.vibrate) with graceful fallbacks.
 *
 * Supported Patterns:
 * - 'selection': Crisp, light single tick - for bulk download checkboxes, toggling wallpaper selection, filter chips.
 * - 'success': Uplifting double-pulse pattern - for bookmarking, saves, downloads, streak celebrations.
 * - 'heavy': Firm resonant tactile pulse - lock screen activation, set wallpaper, milestone achievements.
 * - 'warning': Warning cadence - deselect all, clear filters, reset.
 */

export type HapticPattern = 'selection' | 'success' | 'heavy' | 'warning';
export type HapticIntensity = 'light' | 'medium' | 'strong';

export interface HapticSettings {
  enabled: boolean;
  intensity: HapticIntensity;
}

const HAPTIC_STORAGE_KEY = 'bible_wallpapers_haptic_settings';

export const DEFAULT_HAPTIC_SETTINGS: HapticSettings = {
  enabled: true,
  intensity: 'medium',
};

/**
 * Check if the browser supports physical vibration
 */
export const isHapticsSupported = (): boolean => {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * Read current haptic settings from LocalStorage
 */
export const getHapticSettings = (): HapticSettings => {
  if (typeof window === 'undefined') {
    return DEFAULT_HAPTIC_SETTINGS;
  }
  try {
    const stored = localStorage.getItem(HAPTIC_STORAGE_KEY);
    if (!stored) return DEFAULT_HAPTIC_SETTINGS;
    const parsed = JSON.parse(stored);
    return {
      enabled: typeof parsed.enabled === 'boolean' ? parsed.enabled : true,
      intensity: ['light', 'medium', 'strong'].includes(parsed.intensity) ? parsed.intensity : 'medium',
    };
  } catch {
    return DEFAULT_HAPTIC_SETTINGS;
  }
};

/**
 * Save haptic settings to LocalStorage and broadcast change
 */
export const saveHapticSettings = (updates: Partial<HapticSettings>): HapticSettings => {
  const current = getHapticSettings();
  const next: HapticSettings = {
    ...current,
    ...updates,
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(HAPTIC_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent('haptic-settings-changed', { detail: next }));
    } catch (e) {
      console.warn('Failed to persist haptic settings:', e);
    }
  }

  return next;
};

/**
 * React hook to listen to and modify haptic settings across components
 */
export function useHapticSettings() {
  const [settings, setSettingsState] = useState<HapticSettings>(getHapticSettings);

  useEffect(() => {
    const handleSettingsChange = (e: Event) => {
      const customEvent = e as CustomEvent<HapticSettings>;
      if (customEvent.detail) {
        setSettingsState(customEvent.detail);
      } else {
        setSettingsState(getHapticSettings());
      }
    };

    window.addEventListener('haptic-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('haptic-settings-changed', handleSettingsChange);
    };
  }, []);

  const updateSettings = useCallback((updates: Partial<HapticSettings>) => {
    const next = saveHapticSettings(updates);
    setSettingsState(next);
  }, []);

  return { settings, updateSettings };
}

/**
 * Duration matrices for patterns across intensity levels (in ms)
 */
const PATTERN_TIMINGS: Record<HapticIntensity, Record<HapticPattern, number | number[]>> = {
  light: {
    selection: 6,
    success: [12, 35, 18],
    heavy: 24,
    warning: [15, 30, 15, 30, 20],
  },
  medium: {
    selection: 12,
    success: [24, 45, 36],
    heavy: 48,
    warning: [30, 40, 30, 40, 45],
  },
  strong: {
    selection: 24,
    success: [45, 50, 60],
    heavy: 85,
    warning: [50, 40, 50, 40, 70],
  },
};

/**
 * Trigger web vibration according to current user preferences
 * 
 * @param pattern - Pattern type ('selection' | 'success' | 'heavy' | 'warning')
 * @param overrideIntensity - Optional temporary intensity override (e.g. for preview testing)
 */
export const triggerWebHaptic = (
  pattern: HapticPattern = 'selection',
  overrideIntensity?: HapticIntensity
): boolean => {
  const settings = getHapticSettings();

  // If disabled and not explicitly overridden for preview, do nothing
  if (!settings.enabled && !overrideIntensity) {
    return false;
  }

  const intensity = overrideIntensity || settings.intensity;
  const timing = PATTERN_TIMINGS[intensity][pattern] || 12;

  // Broadcast event for UI visual feedback (e.g., in settings tester or indicators)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('haptic-pulse', {
        detail: { pattern, intensity, timing, enabled: settings.enabled },
      })
    );
  }

  if (!isHapticsSupported()) {
    return false;
  }

  try {
    return navigator.vibrate(timing);
  } catch {
    return false;
  }
};
