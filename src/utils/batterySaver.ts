import { useState, useEffect } from 'react';

const BATTERY_SAVER_STORAGE_KEY = 'bible_wallpapers_battery_saver_config';

export type BatterySaverAction = 'pause' | 'reduce_frequency';

export interface BatterySaverConfig {
  enabled: boolean;
  action: BatterySaverAction; // 'pause' or 'reduce_frequency'
  triggerOnLowBattery: boolean;
  lowBatteryThreshold: number; // 15%, 20%, 30%
  triggerOnUnplugged: boolean; // pause/reduce when running on battery (not charging)
  reducedIntervalMultiplier: number; // e.g., 3 (60m -> 180m)
}

export const defaultBatterySaverConfig: BatterySaverConfig = {
  enabled: true,
  action: 'pause',
  triggerOnLowBattery: true,
  lowBatteryThreshold: 20, // 20%
  triggerOnUnplugged: false, // by default trigger on low battery, optional on unplugged
  reducedIntervalMultiplier: 3,
};

export interface DeviceBatteryStatus {
  isSupported: boolean;
  level: number; // 0 to 100
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export function getBatterySaverConfig(): BatterySaverConfig {
  try {
    const raw = localStorage.getItem(BATTERY_SAVER_STORAGE_KEY);
    return raw ? { ...defaultBatterySaverConfig, ...JSON.parse(raw) } : defaultBatterySaverConfig;
  } catch {
    return defaultBatterySaverConfig;
  }
}

export function saveBatterySaverConfig(config: BatterySaverConfig): void {
  try {
    localStorage.setItem(BATTERY_SAVER_STORAGE_KEY, JSON.stringify(config));
    // Dispatch custom event to notify all components
    window.dispatchEvent(new CustomEvent('battery-saver-config-changed', { detail: config }));
  } catch (err) {
    console.warn('Unable to save battery saver config', err);
  }
}

/**
 * Checks if battery saver conditions are met right now.
 */
export function isBatterySaverActive(
  config: BatterySaverConfig,
  battery: DeviceBatteryStatus
): { active: boolean; reason?: string } {
  if (!config.enabled) {
    return { active: false };
  }

  // If low battery trigger is enabled and battery level is <= threshold (and not charging or charging)
  if (config.triggerOnLowBattery && battery.level <= config.lowBatteryThreshold && !battery.charging) {
    return { 
      active: true, 
      reason: `Low battery (${Math.round(battery.level)}% ≤ ${config.lowBatteryThreshold}%)` 
    };
  }

  // If unplugged trigger is enabled and device is discharging
  if (config.triggerOnUnplugged && !battery.charging) {
    return { 
      active: true, 
      reason: 'Device running on battery (Unplugged)' 
    };
  }

  return { active: false };
}

/**
 * React hook to listen to real device battery status and battery saver triggers
 */
export function useDeviceBattery() {
  const [config, setConfig] = useState<BatterySaverConfig>(getBatterySaverConfig);
  const [battery, setBattery] = useState<DeviceBatteryStatus>({
    isSupported: typeof navigator !== 'undefined' && 'getBattery' in navigator,
    level: 85, // sensible default if unsupported
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity,
  });

  useEffect(() => {
    let batteryObj: any = null;

    const updateBatteryState = (bm: any) => {
      setBattery({
        isSupported: true,
        level: Math.round(bm.level * 100),
        charging: bm.charging,
        chargingTime: bm.chargingTime,
        dischargingTime: bm.dischargingTime,
      });
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery()
        .then((bm: any) => {
          batteryObj = bm;
          updateBatteryState(bm);

          bm.addEventListener('chargingchange', () => updateBatteryState(bm));
          bm.addEventListener('levelchange', () => updateBatteryState(bm));
        })
        .catch(() => {
          // Unsupported or blocked by iframe permissions policy
          setBattery((prev) => ({ ...prev, isSupported: false }));
        });
    }

    const handleConfigChange = (e: Event) => {
      const custom = e as CustomEvent<BatterySaverConfig>;
      if (custom.detail) {
        setConfig(custom.detail);
      } else {
        setConfig(getBatterySaverConfig());
      }
    };

    window.addEventListener('battery-saver-config-changed', handleConfigChange);

    return () => {
      window.removeEventListener('battery-saver-config-changed', handleConfigChange);
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('chargingchange', () => {});
          batteryObj.removeEventListener('levelchange', () => {});
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const updateConfig = (newConfig: BatterySaverConfig) => {
    setConfig(newConfig);
    saveBatterySaverConfig(newConfig);
  };

  const status = isBatterySaverActive(config, battery);

  return {
    battery,
    config,
    updateConfig,
    isSaverActive: status.active,
    activeReason: status.reason,
    // Simulation toggle helper for desktop / testing
    simulateBattery: (level: number, charging: boolean) => {
      setBattery((prev) => ({
        ...prev,
        level,
        charging,
      }));
    }
  };
}
