// Monetag / PropellerAds Website Verification and Service Worker
// Verification Token: 6accf775626665883e95741b

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch
});
