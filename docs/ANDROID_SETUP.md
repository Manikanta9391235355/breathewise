# Munim — Android Packaging & Deployment Guide

This guide describes how the Munim Merchant Growth AI assistant is packaged as an Android application using Capacitor and how to build, install, and run it on Android devices or emulators.

---

## 1. Architecture & Capabilities

- **Engine:** Capacitor 7.x Android bridge wrapping the production React + Vite + TypeScript frontend.
- **Application ID:** `com.paytm.munim`
- **Application Name:** `Munim Merchant AI`
- **Launcher Icon:** Custom official Munim logo configured across all density mipmaps (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`).
- **Permissions:**
  - `android.permission.INTERNET`: Required to communicate with the Munim backend and Sarvam AI models.
  - `android.permission.RECORD_AUDIO`: Required for microphone voice queries in Telugu, Hindi, and Indian English.
  - `android.permission.MODIFY_AUDIO_SETTINGS`: Required for clean audio playback of spoken answers.
- **Local Dev Server Support:** `usesCleartextTraffic="true"` configured to allow debugging against local backend endpoints (e.g., `http://10.0.2.2:8000` from Android Emulator or your local IP address).

---

## 2. Prerequisites

1. **Java Development Kit (JDK):** Version 17 or 21 (`java -version`).
2. **Android SDK / Android Studio:** Android SDK Platform 34 or 35 installed.
   - If using the Google Antigravity `android` CLI:
     ```bash
     curl -fsSL https://dl.google.com/android/cli/latest/windows_x86_64/install.cmd -o "%TEMP%\i.cmd" && "%TEMP%\i.cmd"
     android sdk install platforms/android-34 build-tools/34.0.0
     ```

---

## 3. Build & Sync Commands

### Step 1: Rebuild Web Assets
```bash
npm run build --prefix frontend
```

### Step 2: Sync Web Assets to Android Project
```bash
cd frontend
npx cap sync android
```

### Step 3: Build Debug APK
Using Gradle wrapper:
```bash
cd frontend/android
./gradlew assembleDebug
```
(On Windows Command Prompt / PowerShell, run: `.\gradlew.bat assembleDebug`)

The generated debug APK will be located at:
`frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## 4. Run on Device / Emulator

### Option A: Via Capacitor CLI
```bash
cd frontend
npx cap run android
```

### Option B: Via ADB
Ensure your phone or emulator is connected (`adb devices`):
```bash
adb install -r frontend/android/app/build/outputs/apk/debug/app-debug.apk
adb shell am start -n com.paytm.munim/.MainActivity
```

---

## 5. Voice & Permissions Flow on Device

1. When the merchant taps the **Speak (Microphone)** button for the first time, Android displays the runtime permission prompt:
   *"Allow Munim Merchant AI to record audio?"*
2. Once granted, audio is captured using the standard HTML5 `navigator.mediaDevices.getUserMedia` API, encoded in WAV format, and processed through Sarvam AI's speech pipeline.
3. If denied, the app gracefully switches to the typed input field and localized quick questions chips without crashing.
