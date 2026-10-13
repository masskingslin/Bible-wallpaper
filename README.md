# ✝️ Bible Wallpapers & Scripture Changer

> Inspiring Christian scripture wallpapers with multilingual verses, customizable phone lock screen previews, high-definition downloads, Web Speech API audio narration, and automated wallpaper rotation.

---

## 🌟 Key Features

- **📖 Multilingual Scripture Wallpapers**: High-definition curated wallpapers with synchronized Bible verses in 5 languages (English, Spanish, Portuguese, French, and German).
- **🎙️ Web Speech API Narration**: Interactive "Listen to Verse" audio reading with realistic pacing, soothing pitch, and active Dynamic Island audio status.
- **📱 Phone Mockup & Lock Screen Preview**: Real-time lock screen simulator with iOS/Android styles, clock customization, status icons, and customizable verse positioning.
- **☀️ Warm Paper / Dark Theme Toggle**: Reading-optimized warm paper parchment mode (`#fbf8f2`) and dark sanctuary mode.
- **🔄 Hourly & 24h Daily Verse Changer**: 24-hour daily verse for standard users, 1-hour VIP hourly rotation with auto-changer scheduler.
- **⚡ Offline First Support**: In-memory and localStorage cache support for offline reading and wallpaper rotation without an internet connection.
- **🤖 Android Companion App**: Native Jetpack Compose Android client located in `/app` with Room database, WorkManager background rotation, and homescreen widgets.
- **🚀 Automated CI/CD Deployment**: GitHub Actions workflow (`.github/workflows/deploy_closed_track.yml`) and Fastlane pipeline for automated Google Play Store release.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Audio**: Web Speech API (`SpeechSynthesis` & `SpeechSynthesisUtterance`)
- **Backend**: Express on Node.js / `tsx` (serving `/api/wallpapers`, `/api/verify-subscription`, `/api/health`)
- **Android App**: Kotlin, Jetpack Compose, Material 3, Room, WorkManager, Coroutines
- **DevOps**: GitHub Actions, Fastlane, Bundler

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Local Run
```bash
# Clone the repository
git clone <your-github-repo-url>
cd Bible-wallpaper

# Install dependencies
npm install

# Start development server (serves client + API on port 3000)
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 📱 Building Android APKs on GitHub Actions

This repository includes a dedicated workflow (`.github/workflows/build_apk.yml`) that automatically compiles and packages installable Android APKs (`app-debug.apk` and `app-release.apk`) on GitHub:

### 1. Automatic Build on Push
Every time code is pushed to `main` or `master`, GitHub Actions builds both:
- **`BibleWallpapers-Debug-APK`**: Immediately installable on any Android phone (no special signing required).
- **`BibleWallpapers-Release-APK`**: Release-optimized APK (falls back to debug signing if custom keystore secrets are not configured).

### 2. Manual Build via GitHub Web Interface
1. Go to your repository on GitHub.
2. Click the **Actions** tab at the top.
3. Select **"Build Android APK"** from the left sidebar.
4. Click **Run workflow** -> Select branch -> Click **Run workflow**.

### 3. How to Download the APK:
1. Click on the completed workflow run.
2. Scroll to the **Artifacts** section at the bottom of the summary page.
3. Click to download either `BibleWallpapers-Debug-APK` or `BibleWallpapers-Release-APK`.
4. Unzip and transfer the `.apk` file to your Android phone to install!

---

## 🔒 Optional GitHub Secrets

| Secret Name | Purpose | Required for APK build? |
|---|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release `.jks` or `.keystore` | ❌ No (auto falls back to debug signing) |
| `KEYSTORE_PASSWORD` | Keystore password | ❌ No |
| `KEY_ALIAS` | Key alias | ❌ No |
| `KEY_PASSWORD` | Key password | ❌ No |
| `GOOGLE_SERVICES_JSON` | Custom Firebase `google-services.json` | ❌ No (bundled fallback provided) |
| `PLAY_STORE_JSON_KEY` | Google Play Console Service Account JSON | ❌ Only for Play Store deployment |

---

## 📄 License
MIT License. Built with love for spreading encouragement and scripture worldwide.
