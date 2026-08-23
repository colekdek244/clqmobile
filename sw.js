const CACHE_NAME = "clqmobile-v10"; 

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
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
      
      // FIX: Caching satu-satu agar 1 file error tidak membatalkan semuanya
      for (let asset of ASSETS_TO_CACHE) {
        try {
          const req = new Request(asset, { mode: asset.startsWith('http') ? 'no-cors' : 'cors' });
          await cache.add(req);
        } catch (err) {
          console.warn(`[ServiceWorker] Gagal cache file (Abaikan saja): ${asset}`, err);
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

  // 1. Abaikan API Dinamis (Jangan pernah di-cache)
  if (
    reqUrl.includes("docs.google.com") ||
    reqUrl.includes("script.google.com") ||
    reqUrl.includes("firestore.googleapis.com") ||
    reqUrl.includes("arcgis.com") ||
    reqUrl.includes("nominatim.openstreetmap.org") ||
    reqUrl.includes("bigdatacloud.net")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 2. Cache First Strategy untuk Aset & CDN
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Jika ada di cache, langsung gunakan
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Jika tidak ada di cache, ambil dari internet
      return fetch(event.request).then((networkResponse) => {
        // PERBAIKAN: Mengizinkan response 'opaque' (dari no-cors CDN) untuk disimpan
        if (!networkResponse || (networkResponse.status !== 200 && networkResponse.type !== 'opaque') || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors' && networkResponse.type !== 'opaque')) {
          return networkResponse;
        }
        
        // Simpan salinan ke cache dinamis untuk dipakai offline nanti
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Fallback navigasi offline (Hanya jika sedang membuka halaman utama)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});
