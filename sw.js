/* ═══════════════════════════════════════
   MedSphere — Service Worker
   آفلاین کار کولو لپاره
   ═══════════════════════════════════════ */

const CACHE = 'medsphere-v1';

const FILES = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './articles.json',
  './manifest.json'
];

// نصب
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(FILES);
    })
  );
  self.skipWaiting();
});

// فعالول
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

// د غوښتنو نیول
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        return caches.open(CACHE).then(cache => {
          cache.put(event.request, fetchRes.clone());
          return fetchRes;
        });
      });
    }).catch(() => {
      return caches.match('./index.html');
    })
  );
});
