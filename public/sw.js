// Clean Service Worker - No stale file caching to prevent white screen / 404 script bugs
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
