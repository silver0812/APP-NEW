'use strict';

const CACHE_NAME = 'packday-shell-v8';
const APP_FILES = [
  './',
  './index.html',
  './checklist.html',
  './schedule.html',
  './item-finder.html',
  './gear-radar.html',
  './profile.html',
  './app.js',
  './firebase-auth.js',
  './firebase-config.js',
  './tailwindcss.js',
  './manifest.webmanifest',
  './icons/packday.svg',
  './icons/profile-placeholder.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith('packday-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || './profile.html#night-prep-reminder', self.registration.scope);
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const existing = clients.find((client) => new URL(client.url).origin === url.origin);
      if (existing) {
        return existing.navigate(url.href).then((client) => client?.focus());
      }
      return self.clients.openWindow(url.href);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
    if (request.headers.has('authorization')) return;
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        try {
          const response = await fetch(request);
          if (response.ok || response.type === 'opaque') {
            await cache.put(request, response.clone());
          }
          return response;
        } catch (error) {
          const cached = await cache.match(request);
          if (cached) return cached;
          throw error;
        }
      })
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        const pageUrl = new URL(request.url);
        pageUrl.search = '';
        pageUrl.hash = '';
        const cachedPage = await caches.match(pageUrl.href);
        try {
          const response = await fetch(request);
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(pageUrl.href, response.clone());
          }
          return response;
        } catch (error) {
          if (cachedPage) return cachedPage;
          const home = await caches.match('./index.html');
          if (home) return home;
          return new Response('PackDay is offline and this page is not cached.', { status: 503 });
        }
      })()
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
