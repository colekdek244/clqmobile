const CACHE_NAME = "clqmobile-v4"; // Naikkan versi cache

const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png" // Tambahkan icon 512
];

// Instalasi: Cache aset utama SAJA agar cepat dan tidak gampang error
self.addEventListener("install", (event) => {
  self.skipWaiting(); // Paksa SW langsung aktif
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching HTML dan Aset Dasar...");
      // Jangan pakai addAll untuk CDN eksternal, rawan gagal install
      return cache.addAll(ASSETS_TO_CACHE).catch(err => console.error("Cache addAll error:", err)); 
    })
  );
});

// Aktivasi: Bersihkan cache versi lama
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("[ServiceWorker] Menghapus cache lama:", cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Ambil dari Cache, kalau tidak ada ambil dari Jaringan
self.addEventListener("fetch", (event) => {
  const reqUrl = event.request.url;

  // JANGAN cache API dinamis
  if (
    reqUrl.includes("script.google.com") ||
    reqUrl.includes("firestore.googleapis.com") ||
    reqUrl.includes("arcgis.com") ||
    reqUrl.includes("nominatim.openstreetmap.org") ||
    reqUrl.includes("bigdatacloud.net")
  ) {
    return; // Biarkan browser menangani secara default (jaringan)
  }

  // Strategi Cache First, Network Fallback
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Jangan cache jika error atau tidak sah
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            if(networkResponse && networkResponse.type === 'cors' && reqUrl.includes('esm.sh')) {
               // Boleh cache CDN React
            } else {
               return networkResponse;
            }
        }
        
        // Simpan ke cache untuk akses offline berikutnya
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return networkResponse;
      }).catch(() => {
        // Fallback offline (jika gagal fetch HTML)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});