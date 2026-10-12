import { useState, useEffect, useMemo, useCallback } from 'react';
import { AutoChangerConfig, BatterySaverConfig } from './offlineStorage';

export interface BatteryInfo {
  isSupported: boolean;
  charging: boolean;
  level: number; // 0 to 100
  chargingTime: number;
  dischargingTime: number;
}

export interface EffectiveBatteryState {
  batteryInfo: BatteryInfo;
  isSaverTriggered: boolean;
  effectiveAction: 'normal' | 'paused' | 'reduced';
  effectiveIntervalMinutes: number;
  statusBadge: {
    label: string;
    variant: 'normal' | 'warning' | 'paused' | 'charging';
    description: string;
  };
}

export function useBatteryStatus(config: AutoChangerConfig) {
  const [hardwareBattery, setHardwareBattery] = useState<BatteryInfo>({
    isSupported: false,
    charging: true, // safe default
    level: 100,
    chargingTime: 0,
    dischargingTime: Infinity,
  });

  // Listen to the Web Battery API if available
  useEffect(() => {
    let batteryInstance: any = null;

    const updateBattery = () => {
      if (!batteryInstance) return;
      setHardwareBattery({
        isSupported: true,
        charging: Boolean(batteryInstance.charging),
        level: Math.round(Number(batteryInstance.level ?? 1) * 100),
        chargingTime: batteryInstance.chargingTime ?? 0,
        dischargingTime: batteryInstance.dischargingTime ?? Infinity,
      });
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery()
        .then((battery: any) => {
          batteryInstance = battery;
          updateBattery();

          battery.addEventListener('chargingchange', updateBattery);
          battery.addEventListener('levelchange', updateBattery);
          battery.addEventListener('chargingtimechange', updateBattery);
          battery.addEventListener('dischargingtimechange', updateBattery);
        })
        .catch(() => {
          setHardwareBattery((prev) => ({ ...prev, isSupported: false }));
        });
    }

    return () => {
      if (batteryInstance) {
        batteryInstance.removeEventListener('chargingchange', updateBattery);
        batteryInstance.removeEventListener('levelchange', updateBattery);
        batteryInstance.removeEventListener('chargingtimechange', updateBattery);
        batteryInstance.removeEventListener('dischargingtimechange', updateBattery);
      }
    };
  }, []);

  // Determine effective battery level and charging status (supporting manual test mode)
  const effectiveBattery: BatteryInfo = useMemo(() => {
    const sim = config.batterySaver?.manualSimulation;
    if (sim?.active) {
      return {
        isSupported: hardwareBattery.isSupported,
        charging: sim.charging,
        level: Math.max(1, Math.min(100, sim.level)),
        chargingTime: sim.charging ? 1800 : 0,
        dischargingTime: sim.charging ? Infinity : 3600,
      };
    }
    return hardwareBattery;
  }, [hardwareBattery, config.batterySaver?.manualSimulation]);

  // Compute if battery saver triggers
  const state: EffectiveBatteryState = useMemo(() => {
    const saver = config.batterySaver;
    const baseInterval = config.intervalMinutes || 60;

    if (!saver || !saver.enabled) {
      return {
        batteryInfo: effectiveBattery,
        isSaverTriggered: false,
        effectiveAction: 'normal',
        effectiveIntervalMinutes: baseInterval,
        statusBadge: {
          label: effectiveBattery.charging ? 'Charging' : `${effectiveBattery.level}% Battery`,
          variant: effectiveBattery.charging ? 'charging' : 'normal',
          description: effectiveBattery.charging
            ? 'Plugged in: Normal rotation active'
            : `Battery at ${effectiveBattery.level}%: Battery Saver inactive`,
        },
      };
    }

    const isCharging = effectiveBattery.charging;
    const level = effectiveBattery.level;
    const isLow = level <= saver.lowBatteryThreshold;
    const isUnplugged = !isCharging;

    // Trigger condition:
    // 1. Device is unplugged AND user requested "pauseWhenNotCharging"
    // 2. OR device is unplugged AND battery level is below threshold
    const shouldTrigger = isUnplugged && (saver.pauseWhenNotCharging || isLow);

    if (!shouldTrigger) {
      return {
        batteryInfo: effectiveBattery,
        isSaverTriggered: false,
        effectiveAction: 'normal',
        effectiveIntervalMinutes: baseInterval,
        statusBadge: {
          label: isCharging ? 'Charging (Full Cadence)' : `${level}% (Normal)`,
          variant: isCharging ? 'charging' : 'normal',
          description: isCharging
            ? 'Connected to charger. Rotating at standard interval.'
            : `Battery healthy at ${level}%. Normal rotation interval (${baseInterval}m).`,
        },
      };
    }

    // Saver is active!
    if (saver.action === 'pause') {
      const reason = saver.pauseWhenNotCharging
        ? 'Unplugged'
        : `Low Battery (${level}%)`;
      return {
        batteryInfo: effectiveBattery,
        isSaverTriggered: true,
        effectiveAction: 'paused',
        effectiveIntervalMinutes: 0,
        statusBadge: {
          label: `Battery Saver Paused (${level}%)`,
          variant: 'paused',
          description: `Auto-rotation paused to conserve power (${reason}). Resumes when plugged in.`,
        },
      };
    }

    // Action is 'reduce'
    const multiplier = Math.max(2, saver.reduceIntervalMultiplier || 3);
    const reducedInterval = baseInterval * multiplier;
    const reason = saver.pauseWhenNotCharging
      ? 'On Battery Power'
      : `Low Battery (${level}%)`;

    return {
      batteryInfo: effectiveBattery,
      isSaverTriggered: true,
      effectiveAction: 'reduced',
      effectiveIntervalMinutes: reducedInterval,
      statusBadge: {
        label: `Battery Saver (${Math.round(reducedInterval / 60)}h Cadence)`,
        variant: 'warning',
        description: `Frequency slowed to every ${reducedInterval >= 60 ? `${reducedInterval / 60}h` : `${reducedInterval}m`} (${reason}).`,
      },
    };
  }, [effectiveBattery, config.batterySaver, config.intervalMinutes]);

  return state;
}
