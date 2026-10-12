package com.DK.biblewallpapers.util

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.compose.ui.hapticfeedback.HapticFeedback
import androidx.compose.ui.hapticfeedback.HapticFeedbackType

/**
 * HapticFeedbackType for Android Jetpack Compose & Native Actuator.
 * Offers distinct, intensity-based tactile patterns for a refined, premium feel:
 *
 * - SELECTION: Crisp, lightweight single tick. Ideal for toggles, bulk item checkboxes,
 *   dropdown option changes, chip selection.
 * - SUCCESS: Distinct rhythmic double-pulse (or EFFECT_DOUBLE_CLICK / CONFIRMATION on Android 12+).
 *   Ideal for bookmarking/favoriting, download completion, and successful actions.
 * - HEAVY: Resonant, weighty pulse (EFFECT_HEAVY_CLICK). Ideal for setting wallpapers and primary actions.
 * - WARNING: Warning cadence (REJECT / STACCATO). Ideal for unselecting all, clearing filters.
 */
enum class AppHapticType {
    SELECTION,
    SUCCESS,
    HEAVY,
    WARNING
}

object HapticUtil {

    fun perform(
        context: Context,
        hapticFeedback: HapticFeedback? = null,
        type: AppHapticType = AppHapticType.SELECTION
    ) {
        try {
            val vibrator = getVibrator(context)
            if (vibrator != null && vibrator.hasVibrator()) {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    when (type) {
                        AppHapticType.SELECTION -> {
                            // Crisp, micro-intensity tick
                            vibrator.vibrate(
                                VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
                            )
                        }
                        AppHapticType.SUCCESS -> {
                            // Android 11+ or 10: distinct double-pulse confirmation
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                                vibrator.vibrate(
                                    VibrationEffect.createPredefined(VibrationEffect.EFFECT_DOUBLE_CLICK)
                                )
                            } else {
                                val timings = longArrayOf(0, 25, 45, 35)
                                val amplitudes = intArrayOf(0, 180, 0, 255)
                                vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                            }
                        }
                        AppHapticType.HEAVY -> {
                            vibrator.vibrate(
                                VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                            )
                        }
                        AppHapticType.WARNING -> {
                            val timings = longArrayOf(0, 30, 40, 30)
                            val amplitudes = intArrayOf(0, 200, 0, 220)
                            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                        }
                    }
                    return
                } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    when (type) {
                        AppHapticType.SELECTION -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(12, 100))
                        }
                        AppHapticType.SUCCESS -> {
                            val timings = longArrayOf(0, 25, 45, 35)
                            val amplitudes = intArrayOf(0, 180, 0, 255)
                            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                        }
                        AppHapticType.HEAVY -> {
                            vibrator.vibrate(VibrationEffect.createOneShot(50, VibrationEffect.DEFAULT_AMPLITUDE))
                        }
                        AppHapticType.WARNING -> {
                            val timings = longArrayOf(0, 30, 40, 30)
                            val amplitudes = intArrayOf(0, 180, 0, 180)
                            vibrator.vibrate(VibrationEffect.createWaveform(timings, amplitudes, -1))
                        }
                    }
                    return
                } else {
                    @Suppress("DEPRECATION")
                    when (type) {
                        AppHapticType.SELECTION -> vibrator.vibrate(12)
                        AppHapticType.SUCCESS -> vibrator.vibrate(longArrayOf(0, 25, 45, 35), -1)
                        AppHapticType.HEAVY -> vibrator.vibrate(50)
                        AppHapticType.WARNING -> vibrator.vibrate(longArrayOf(0, 30, 40, 30), -1)
                    }
                    return
                }
            }
        } catch (_: Throwable) {
            // Fallback to Compose LocalHapticFeedback
        }

        // Fallback
        hapticFeedback?.let {
            when (type) {
                AppHapticType.SELECTION -> it.performHapticFeedback(HapticFeedbackType.TextHandleMove)
                AppHapticType.SUCCESS -> it.performHapticFeedback(HapticFeedbackType.LongPress)
                AppHapticType.HEAVY -> it.performHapticFeedback(HapticFeedbackType.LongPress)
                AppHapticType.WARNING -> it.performHapticFeedback(HapticFeedbackType.LongPress)
            }
        }
    }

    private fun getVibrator(context: Context): Vibrator? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
            vibratorManager?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
        }
    }
}
