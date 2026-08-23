const CACHE_NAME = "clqmobile-v9"; 

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  // We keep the external CDNs here, but we will handle them safer below
  "https://cdn.tailwindcss.com",
  "https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;700;900&display=swap",
  "https://unpkg.com/@babel/standalone/babel.min.js",
  "https://esm.sh/react@18.2.0",
  "https://esm.sh/react-dom@18.2.0/client",
  "https://esm.sh/lucide-react@0.263.1?external=react",
  "https://esm.sh/react@18.2.0/jsx-runtime",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js",
  "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log("[ServiceWorker] Pre-caching app shell & CDNs...");
      
      // FIX: Cache files individually so one 404 doesn't crash the whole Service Worker
      for (let asset of ASSETS_TO_CACHE) {
        try {
          // Use 'no-cors' for external CDNs if they block the request during precaching
          const req = new Request(asset, { mode: asset.startsWith('http') ? 'no-cors' : 'cors' });
          await cache.add(req);
        } catch (err) {
          console.warn(`[ServiceWorker] Failed to cache: ${asset}`, err);
          // We just log the warning, but don't stop the loop!
        }
      }
      return;
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] Membersihkan cache lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const reqUrl = event.request.url;

  // Jangan simpan request API dinamik (Google Sheets CSV, Apps Script, Geocoding, Firebase DB) ke Cache SW
  if (
    reqUrl.includes("docs.google.com") ||
    reqUrl.includes("script.google.com") ||
    reqUrl.includes("firestore.googleapis.com") ||
    reqUrl.includes("arcgis.com") ||
    reqUrl.includes("nominatim.openstreetmap.org") ||
    reqUrl.includes("bigdatacloud.net")
  ) {
    // Biarkan langsung mengambil data live dari jaringan (Network Only)
    event.respondWith(fetch(event.request));
    return;
  }

  // Untuk file aplikasi & library CDN: Cache First dengan Offline Navigation Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // PERBAIKAN: Mengizinkan tipe response 'basic' (lokal), 'cors', dan 'opaque' (dari no-cors)
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque') || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors' && networkResponse.type !== 'opaque')) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        // Fallback navigasi jika fetch gagal saat membuka halaman dalam kondisi offline
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});
