'use strict';

const CACHE_NAME = 'packday-shell-v3';
const APP_FILES = [
  './',
  './index.html',
  './checklist.html',
  './schedule.html',
  './item-finder.html',
  './gear-radar.html',
  './profile.html',
  './app.js',
  './tailwindcss.js',
  './manifest.webmanifest',
  './icons/packday.svg'
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

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) {
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
