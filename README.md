# PackDay

## Open PackDay

**[Open the PackDay website](https://silver0812.github.io/APP-NEW/)**

PackDay is an installable Progressive Web App (PWA). On Android, open the site in Chrome and choose **Install app** or **Add to Home screen**. On iPhone/iPad, open it in Safari, tap **Share**, then **Add to Home Screen**. Checklist items, profile edits, and events you add are saved on your device. On the first visit after the fresh-start update, PackDay clears the previous sample inputs once; later changes are kept.

The calendar uses your device's local date, year, time, and time zone. It includes the weekly class timetable from your schedule: Monday/Thursday (DATAMA2, CLDCOMP, COMSEC1), Tuesday/Friday (WEBPROG, PEMBEDS, MOBPROG), and Friday (PEDUTRI). Classes repeat weekly and appear on the matching calendar dates and dashboard. You can also add device-local events or connect Google Calendar for read-only syncing.

On the checklist, use the pencil button on any item to edit its name, category, badge, details, and note. Changes and custom items are saved on this device.

## Night prep notification

Open **Profile → Night-Before Pack Prep**, choose a daily time, and enable the reminder. Allow notifications when your browser asks. PackDay then displays an operating-system notification at that time, using the device's notification sound and vibration settings.

The website checks the reminder while PackDay is open. Browsers and mobile operating systems may pause web pages in the background, and a web-only app cannot guarantee an alarm after it has been fully closed. For dependable alarms while closed, a native Android/iOS alarm implementation or a configured push-notification service is required. On iPhone/iPad, notification support also depends on the installed home-screen app and iOS version.

## Google sign-in and calendar setup

Google sign-in and calendar sync use the Firebase project configured in `firebase-config.js`. The Firebase Web app's public client configuration is included for the website.

1. In the [Firebase Console](https://console.firebase.google.com/) for project `web-app-2c8c4`, go to **Authentication → Sign-in method** and enable **Google**.
2. Add `silver0812.github.io` and `localhost` under **Authentication → Settings → Authorized domains**.
3. In the linked Google Cloud project, enable the **Google Calendar API**. If the OAuth consent screen is in testing, add the Google account you will use as a test user.
4. Deploy the site and sign in with Google. Approve the requested read-only Calendar permission when syncing.

The config contains public web-app settings, not service-account credentials. Never put a Firebase service-account key or private OAuth client secret in this website.

Google authentication verifies the account with Firebase, but profile customizations and PackDay-created events remain on that browser/device; this static site does not provide cloud backup or cross-device syncing. Calendar access is read-only: edits made on Google Calendar appear after you sync again, and PackDay does not change Google events.

The website's layout and styling are bundled. Google Fonts and Material Symbols may still need an internet connection.

## Android APK

If you prefer the Android app download, [download the APK](./PackDay.apk). Android may ask you to allow installs from your browser.

## Run locally

Serve this folder over HTTP, for example: `py -m http.server 8000`, then open `http://localhost:8000`.

When updating the app shell, increment `CACHE_NAME` in `sw.js` so installed copies replace the previous cached files.

GitHub Pages is published from the `main` branch using the `Deploy PackDay website` workflow in `.github/workflows/deploy-pages.yml`.
