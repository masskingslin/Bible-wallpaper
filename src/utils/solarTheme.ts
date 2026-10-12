import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppThemeMode, ThemePreference, SolarThemeConfig } from '../types';

export const SOLAR_THEME_STORAGE_KEY = 'bible_wallpapers_solar_theme_config';

export const defaultSolarThemeConfig: SolarThemeConfig = {
  mode: 'dark',
  useGeolocation: false,
  latitude: null,
  longitude: null,
  locationName: 'Astronomical Solar Model',
  customScheduleEnabled: false,
  customSunrise: '06:30',
  customSunset: '18:45',
  manualSimulation: {
    active: false,
    isDaytime: true,
  },
};

/**
 * Retrieves saved Solar Theme Configuration from localStorage
 */
export function getSavedSolarConfig(): SolarThemeConfig {
  try {
    const raw = localStorage.getItem(SOLAR_THEME_STORAGE_KEY);
    if (!raw) {
      // Backwards compatibility with previous bible_wallpapers_theme_mode
      const legacy = localStorage.getItem('bible_wallpapers_theme_mode');
      const legacyMode: ThemePreference = legacy === 'light' ? 'light' : 'dark';
      return { ...defaultSolarThemeConfig, mode: legacyMode };
    }
    const parsed = JSON.parse(raw);
    return {
      ...defaultSolarThemeConfig,
      ...parsed,
      manualSimulation: {
        ...defaultSolarThemeConfig.manualSimulation,
        ...(parsed.manualSimulation || {}),
      },
    };
  } catch {
    return defaultSolarThemeConfig;
  }
}

/**
 * Saves Solar Theme Configuration to localStorage
 */
export function saveSolarConfig(config: SolarThemeConfig): void {
  try {
    localStorage.setItem(SOLAR_THEME_STORAGE_KEY, JSON.stringify(config));
    // Also sync legacy key for backwards compatibility
    const effective = getEffectiveThemeForConfig(config);
    localStorage.setItem('bible_wallpapers_theme_mode', effective);
  } catch (err) {
    console.warn('Failed to save solar config to localStorage', err);
  }
}

export interface SolarCalculationResult {
  sunrise: Date;
  sunset: Date;
  isDaytime: boolean;
  sunriseFormatted: string;
  sunsetFormatted: string;
  nextTransitionText: string;
}

/**
 * Calculates accurate local sunrise and sunset for the user's location or solar model
 */
export function calculateSolarTimes(
  config: SolarThemeConfig,
  currentDate: Date = new Date()
): SolarCalculationResult {
  const d = new Date(currentDate);

  // 1. Custom schedule override
  if (config.customScheduleEnabled && config.customSunrise && config.customSunset) {
    const [sH, sM] = config.customSunrise.split(':').map((n) => parseInt(n, 10) || 0);
    const [eH, eM] = config.customSunset.split(':').map((n) => parseInt(n, 10) || 0);

    const sunrise = new Date(d);
    sunrise.setHours(sH, sM, 0, 0);

    const sunset = new Date(d);
    sunset.setHours(eH, eM, 0, 0);

    let isDay = d >= sunrise && d < sunset;
    if (config.manualSimulation?.active) {
      isDay = config.manualSimulation.isDaytime;
    }

    const sFmt = formatTime(sunrise);
    const eFmt = formatTime(sunset);

    const nextTransitionText = isDay
      ? `Switches to Dark mode at Sunset (${eFmt})`
      : `Switches to Light mode at Sunrise (${sFmt})`;

    return {
      sunrise,
      sunset,
      isDaytime: isDay,
      sunriseFormatted: sFmt,
      sunsetFormatted: eFmt,
      nextTransitionText,
    };
  }

  // 2. Astronomical solar calculation
  const startOfYear = new Date(d.getFullYear(), 0, 0);
  const diff = d.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  const rad = Math.PI / 180;
  // Estimate latitude: if GPS is available use it, otherwise default to mid-latitude ~37.5°
  const effectiveLat = config.latitude !== null ? config.latitude : 37.5;

  // Solar declination (degrees)
  const declination = 23.44 * Math.sin(rad * ((360 / 365) * (dayOfYear - 81)));

  // Hour angle based on official solar zenith (90.833°)
  const zenith = 90.833;
  const cosH =
    (Math.cos(rad * zenith) - Math.sin(rad * effectiveLat) * Math.sin(rad * declination)) /
    (Math.cos(rad * effectiveLat) * Math.cos(rad * declination));

  const clampedCosH = Math.max(-1, Math.min(1, cosH));
  const hourAngle = Math.acos(clampedCosH) / rad;
  const halfDayHours = hourAngle / 15;

  // Approximate solar noon in local standard time
  let solarNoonHours = 12.2;
  if (config.longitude !== null) {
    const tzOffsetHours = -d.getTimezoneOffset() / 60;
    const offsetFromTzCenter = (tzOffsetHours * 15 - config.longitude) / 15;
    solarNoonHours = 12.0 + offsetFromTzCenter;
  }

  const sunriseHours = solarNoonHours - halfDayHours;
  const sunsetHours = solarNoonHours + halfDayHours;

  const sunrise = new Date(d);
  sunrise.setHours(
    Math.floor(sunriseHours),
    Math.floor((sunriseHours % 1) * 60),
    0,
    0
  );

  const sunset = new Date(d);
  sunset.setHours(
    Math.floor(sunsetHours),
    Math.floor((sunsetHours % 1) * 60),
    0,
    0
  );

  let isDay = d >= sunrise && d < sunset;
  if (config.manualSimulation?.active) {
    isDay = config.manualSimulation.isDaytime;
  }

  const sFmt = formatTime(sunrise);
  const eFmt = formatTime(sunset);

  const nextTransitionText = isDay
    ? `Switches to Dark mode at Sunset (${eFmt})`
    : `Switches to Light mode at Sunrise (${sFmt})`;

  return {
    sunrise,
    sunset,
    isDaytime: isDay,
    sunriseFormatted: sFmt,
    sunsetFormatted: eFmt,
    nextTransitionText,
  };
}

function formatTime(date: Date): string {
  try {
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  } catch {
    const h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  }
}

/**
 * Returns current effective AppThemeMode ('light' | 'dark') given a config
 */
export function getEffectiveThemeForConfig(
  config: SolarThemeConfig,
  currentDate: Date = new Date()
): AppThemeMode {
  if (config.mode === 'light') return 'light';
  if (config.mode === 'dark') return 'dark';

  // 'auto_sun' mode:
  const { isDaytime } = calculateSolarTimes(config, currentDate);
  return isDaytime ? 'light' : 'dark';
}

/**
 * React hook for managing scheduled Sunrise/Sunset theme switching
 */
export function useSolarTheme() {
  const [config, setConfigState] = useState<SolarThemeConfig>(getSavedSolarConfig);
  const [now, setNow] = useState<Date>(() => new Date());

  // Keep a periodic heartbeat (every 30s) to evaluate sunrise / sunset boundaries
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  const solarInfo = useMemo(() => {
    return calculateSolarTimes(config, now);
  }, [config, now]);

  const effectiveTheme: AppThemeMode = useMemo(() => {
    if (config.mode === 'light') return 'light';
    if (config.mode === 'dark') return 'dark';
    return solarInfo.isDaytime ? 'light' : 'dark';
  }, [config.mode, solarInfo.isDaytime]);

  // Synchronize CSS class and body theme attributes
  useEffect(() => {
    if (effectiveTheme === 'light') {
      document.body.classList.add('bg-[#f8f5ee]', 'text-stone-900');
      document.body.classList.remove('bg-stone-950', 'text-stone-100');
    } else {
      document.body.classList.add('bg-stone-950', 'text-stone-100');
      document.body.classList.remove('bg-[#f8f5ee]', 'text-stone-900');
    }
  }, [effectiveTheme]);

  const updateConfig = useCallback((updates: Partial<SolarThemeConfig>) => {
    setConfigState((prev) => {
      const next = { ...prev, ...updates };
      saveSolarConfig(next);
      return next;
    });
  }, []);

  const setThemePreference = useCallback((mode: ThemePreference) => {
    updateConfig({ mode });
  }, [updateConfig]);

  // Request browser GPS geolocation for high-precision local sunrise/sunset
  const requestGeolocation = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    if (!navigator.geolocation) {
      return { success: false, message: 'Geolocation is not supported by your browser.' };
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4));
          const lon = parseFloat(pos.coords.longitude.toFixed(4));
          updateConfig({
            useGeolocation: true,
            latitude: lat,
            longitude: lon,
            locationName: `GPS (${lat > 0 ? `${lat}°N` : `${Math.abs(lat)}°S`}, ${lon > 0 ? `${lon}°E` : `${Math.abs(lon)}°W`})`,
          });
          resolve({ success: true, message: `Acquired coordinates (${lat}, ${lon}) for exact solar times.` });
        },
        (err) => {
          console.warn('Geolocation error:', err);
          resolve({ success: false, message: 'Location permission denied. Using local astronomical model.' });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    });
  }, [updateConfig]);

  return {
    config,
    effectiveTheme,
    isLight: effectiveTheme === 'light',
    isDaytime: solarInfo.isDaytime,
    sunriseFormatted: solarInfo.sunriseFormatted,
    sunsetFormatted: solarInfo.sunsetFormatted,
    nextTransitionText: solarInfo.nextTransitionText,
    updateConfig,
    setThemePreference,
    requestGeolocation,
  };
}
