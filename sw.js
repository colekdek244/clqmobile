// v13: pustaka dipindah ke /vendor (tidak lagi dari CDN). Naikkan versi ini
// setiap deploy agar cache lama di HP terhapus dan versi baru terpakai.
const CACHE_NAME = "clqmobile-v21";

// Hanya berkas dari server sendiri. Dulu daftar ini berisi CDN pihak ketiga;
// bila salah satunya diblokir, cache gagal terisi dan aplikasi tampil putih.
// Precache dibatasi pada berkas inti + pustaka lokal.
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/vendor/react.min.js",
  "/vendor/react-dom.min.js",
  "/vendor/react-shim.js",
  "/vendor/lucide-shim.js",
  "/vendor/lucide.min.mjs",
  "/vendor/tailwind.js",
  "/vendor/babel.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Pre-caching app shell & CDNs...");
      return cache.addAll(ASSETS_TO_CACHE);
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

  if (
    // Halaman aplikasi ITU SENDIRI (navigasi browser) tidak boleh dilayani dari
    // cache. Kalau di-cache, petugas bisa terjebak memakai versi lama: versi
    // baru sudah di-deploy, tetapi HP masih menyajikan index.html lama dan
    // service worker baru tidak pernah terpasang.
    reqUrl.includes("index.html") ||
    reqUrl.endsWith("/") ||
    event.request.mode === "navigate" ||

    reqUrl.includes("docs.google.com") ||
    reqUrl.includes("script.google.com") ||
    reqUrl.includes("firestore.googleapis.com") ||
    // API baru (Cloudflare Workers + D1). WAJIB dikecualikan: kalau respons API
    // ikut ter-cache, petugas akan melihat data kunjungan/tugas yang lama.
    reqUrl.includes("workers.dev") ||
    reqUrl.includes("arcgis.com") ||
    reqUrl.includes("nominatim.openstreetmap.org") ||
    reqUrl.includes("bigdatacloud.net")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      }).catch(() => {
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html') || caches.match('/');
        }
      });
    })
  );
});