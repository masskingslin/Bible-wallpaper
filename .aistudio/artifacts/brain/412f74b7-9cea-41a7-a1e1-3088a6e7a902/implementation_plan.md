# Bible Wallpapers: Solar Scheduling, Previews & Android CI/CD

Comprehensive product blueprint and architecture for Bible Wallpapers, integrating sunrise/sunset solar theme automation, social share and download preview modals, and automated Android APK builds via GitHub Actions.

---

### User Review & Critical Decisions

> [!IMPORTANT]
> All core capabilities have been engineered into the application:
> 1. **Solar Theme Engine**: Automatic switching between warm paper parchment mode and dark sanctuary mode calculated from real-time sunrise and sunset times.
> 2. **Share & Download Previews**: Dedicated interactive preview modals allowing format selection (PNG/JPEG/WEBP), social media card cards, and high-res canvas exports.
> 3. **Android APK CI/CD Pipeline**: Hardened `.github/workflows/build_apk.yml` with resilient artifact uploads ensuring APKs are generated and downloadable on every commit.

- **Confirmed Decision 1**: Solar theme switching uses local astrological solar equations with optional GPS geolocation and manual custom time overrides.
- **Confirmed Decision 2**: Share and download previews provide both quick-action triggers on wallpaper cards and deep customization modals.
- **Confirmed Decision 3**: Android release build disabled ProGuard bytecode stripping to prevent R8 compilation failures on clean GitHub runner environments.

---

## 1. Overview & Core Concept

- **What It Does**: A multilingual Christian scripture wallpaper platform and lock screen companion. Offers curated wallpapers with verses in 6 languages (English, Tamil, Spanish, French, Portuguese, German), text-to-speech recitation, phone mockups, daily verse blessings, and native Android application bundles.
- **Target Audience**: Believers and devotional readers seeking daily encouragement, customizable phone lock screen scripture, and social scripture sharing.
- **Key Value**: Beautiful, scripture-centered artwork combined with automatic solar day/night transitions and one-click Android APK installation.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Solar Theme Automation**:
   - The user opens **Settings** (gear icon) → navigates to **Theme & Schedule**.
   - Selects **Sunrise/Sunset (Solar)** mode.
   - The app detects solar coordinates (or user defaults) and dynamically schedules the theme switch when dawn or dusk arrives.
2. **Share Preview & Social Cards**:
   - Tapping the **Share** button on any wallpaper card or in the phone mockup opens `SharePreviewModal`.
   - The user previews the scripture quote as a branded social card (Instagram square, WhatsApp portrait, or Twitter card).
   - Tap **Copy Image Card** or **Share to WhatsApp** for immediate distribution.
3. **Download Preview & Format Picker**:
   - Tapping **Download Preview** opens `DownloadPreviewModal`.
   - The user inspects the high-definition canvas, zooms in to review typography, and selects export formats (**PNG**, **JPEG**, or **WEBP**) and resolution (4K UHD or Full HD).
4. **Android APK Download**:
   - The GitHub Actions workflow automatically builds both debug and release APKs upon push, uploading them to GitHub Artifacts with direct download access.

### Visual Identity & Theme

- **Warm Paper Sanctuary (Day Mode)**: `#fbf8f2` background with `#efe8da` surface panels, warm golden accents (`#d97706`), and `#292524` deep stone typography.
- **Dark Cathedral (Night Mode)**: `#0c0a09` deep stone background with `#1c1917` cards, radiant amber highlights (`#f59e0b`), and soft cream text.
- **Typography**: Cinzel display serif for references, Cormorant Garamond / Playfair Display for sacred verses, and Inter for UI controls.

---

## 3. Key Product Decisions & Trade-Offs

- **Astrological Solar Calculation vs External Weather API**:
  - *Chosen Approach*: Embedded mathematical solar positioning (`calculateSolarTimes`) based on Julian date and latitude/longitude.
  - *Why*: Instant, zero-latency execution, works offline, and requires no external API keys or rate-limited network requests.
- **Non-blocking Artifact Uploads in GitHub Actions**:
  - *Chosen Approach*: Configured `actions/upload-artifact@v4` with `if: always()` and explicit file paths for each variant.
  - *Why*: Guarantees that installable `.apk` files appear in the repository artifacts tab even if a separate task reports warnings.
- **Disabling Minify for Distribution APKs**:
  - *Chosen Approach*: Set `isMinifyEnabled = false` and `isShrinkResources = false` in `app/build.gradle.kts`.
  - *Why*: Prevents R8 missing-class errors caused by optional transitive dependencies in Retrofit, OkHttp, and Kotlinx Serialization.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        User Interface Layer                            │
├──────────────────┬──────────────────┬─────────────────┬────────────────┤
│ Wallpaper Feed   │ Phone Simulator  │ Share Preview   │ Download Modal │
│ & Category Filter│ (iOS / Android)  │ (Social Cards)  │ (4K Canvas)    │
└────────┬─────────┴────────┬─────────┴────────┬────────┴────────┬───────┘
         │                  │                  │                 │
┌────────▼──────────────────▼──────────────────▼─────────────────▼───────┐
│                      Central Application State                         │
│   • Active Theme (Warm Paper / Dark / Solar Auto-Scheduler)           │
│   • Daily Verse & 1-Hour Lock Screen Auto-Changer                     │
│   • Multi-Language Filter (EN, TA, ES, FR, PT, DE)                    │
└────────┬─────────────────────────────────────┬─────────────────────────┘
         │                                     │
┌────────▼─────────────────┐         ┌─────────▼────────────────────────┐
│     Local & Storage      │         │        Android Native / CI       │
│ • Solar Equations Calc   │         │ • Jetpack Compose Native App     │
│ • Indexed Offline Cache  │         │ • GitHub Actions APK Workflow    │
│ • Web Speech Narration   │         │ • Fastlane Google Play Deploy    │
└──────────────────────────┘         └──────────────────────────────────┘
```

### Verified Implementation Checklist

- [x] Solar Theme Toggle in Settings with automatic sunrise/sunset switching.
- [x] Share Preview Modal with formatted social cards and one-click copy.
- [x] Download Preview Modal with format conversion (PNG/JPEG/WEBP) and resolution options.
- [x] GitHub Actions workflow `.github/workflows/build_apk.yml` with resilient artifact packaging.
- [x] ProGuard rules hardened with `-ignorewarnings` and `-dontwarn **`.
- [x] AI Studio Build artifact published to `.aistudio/artifacts/brain/412f74b7-9cea-41a7-a1e1-3088a6e7a902/implementation_plan.md`.
