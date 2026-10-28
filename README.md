# PackDay mobile app

The six supplied mobile screens are now connected as an installable Progressive Web App (PWA). The checklist, dashboard packing toggles, and schedule deliverables save on the current device. The app shell and visited pages are cached for offline use.

Campus locations, class details, and notification content are sample data; there is no campus backend or account sync connected yet. Saved interactions stay on this device.

## Android app

An Android Studio/Flutter project is in [`android-app/`](./android-app/). It packages the PackDay screens inside a native Android shell, supports Android back navigation, and saves checklist data on the device.

The ready-to-install Android APK is at [`android-app/build/app/outputs/flutter-apk/app-release.apk`](./android-app/build/app/outputs/flutter-apk/app-release.apk). It is debug-signed for testing and direct installation; configure a release signing key before publishing it to Google Play.

To install it on Android, copy the APK to your phone and tap it. Android may ask you to allow installations from that file source.

Before rebuilding after editing the web screens, run `powershell -NoProfile -ExecutionPolicy Bypass -File .\sync_assets.ps1` from `android-app\` in PowerShell to refresh the bundled screens. Then run `flutter build apk --release` from that folder; the APK is written to `build\app\outputs\flutter-apk\app-release.apk`.

If Flutter reports missing Android SDK tools or licenses on another machine, install the Android SDK Command-line Tools and accept the requested Android SDK licenses through Android Studio's SDK Manager.

## Run locally

From this folder, start a local web server:

```powershell
py -m http.server 8000
```

Open `http://localhost:8000` on the computer. For a phone preview on the same network, use the computer's local network address instead of `localhost`; that HTTP preview does not enable PWA installation or service workers. Install support requires HTTPS on a deployed site; `localhost` is supported for local testing.

## Install

- **Android:** Open the site in Chrome and use the install prompt or browser menu.
- **iPhone/iPad:** Open the site in Safari, tap **Share**, then **Add to Home Screen**.

The layout and Tailwind styles are bundled with the app. Google-hosted fonts, Material Symbols, and a sample image may still need an internet connection; installed app data and checklist state remain on the device.

When publishing updates to the app shell, increment `CACHE_NAME` in `sw.js` so installed copies replace the previous cached files.
