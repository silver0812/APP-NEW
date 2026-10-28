# PackDay

## Open PackDay

**[Open the PackDay website](https://silver0812.github.io/APP-NEW/)**

PackDay is an installable Progressive Web App (PWA). On Android, open the site in Chrome and choose **Install app** or **Add to Home screen**. On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. Checklist items and packing progress are saved on your device.

The website's layout and styling are bundled. Google Fonts, Material Symbols, and a sample image may still need an internet connection.

Campus locations, schedules, and notification content are sample data; there is no campus backend or account synchronization.

## Android APK

If you prefer the Android app download, [download the APK](./PackDay.apk). Android may ask you to allow installs from your browser.

## Run locally

Serve this folder over HTTP, for example: `py -m http.server 8000`, then open `http://localhost:8000`.

When updating the app shell, increment `CACHE_NAME` in `sw.js` so installed copies replace the previous cached files.

GitHub Pages is published from the `main` branch using the `Deploy PackDay website` workflow in `.github/workflows/deploy-pages.yml`.
