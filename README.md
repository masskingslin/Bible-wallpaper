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

## 🔒 GitHub Actions Secrets (Play Store Closed Track Deploy)

When pushing to `main`, `.github/workflows/deploy_closed_track.yml` runs if configured. To enable Play Store automated builds, configure the following secrets in GitHub Settings -> Secrets and variables -> Actions:

| Secret Name | Description |
|---|---|
| `PLAY_STORE_JSON_KEY` | Google Play Console Service Account Key JSON |
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded release keystore file |
| `KEYSTORE_PASSWORD` | Password for your Android keystore |
| `KEY_ALIAS` | Key alias inside the keystore |
| `KEY_PASSWORD` | Password for the key alias |

---

## 📄 License
MIT License. Built with love for spreading encouragement and scripture worldwide.
