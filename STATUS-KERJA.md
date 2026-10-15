# STATUS — clqmobile (aplikasi petugas lapangan)

Terakhir diperbarui: 15 Oktober 2026 (malam), sesi lanjutan dari clq-portal.

## Di mana semuanya berada

| | |
|---|---|
| Repo | https://github.com/colekdek244/clqmobile |
| Branch | `main` (branch `ke-d1` sudah di-merge & bisa ditinggalkan) |
| Lokal | `~/projects/clqmobile` |
| Backend | `~/projects/clq-portal` (Worker `clq-portal`, endpoint `/api/mobile/*`) |

## Perubahan besar: pindah dari Apps Script + Firebase ke Cloudflare D1

Dilakukan di branch `ke-d1` (commit `12bca26`). Isi `index.html` sekarang bicara ke
Worker `clq-portal`, bukan lagi Google Apps Script + Firestore.

- **Login** menukar `id_user` + password dengan **token perangkat** (disimpan di HP).
  Password tidak lagi disimpan di HP, dan token statis `APP_SECRET_TOKEN` tidak dipakai.
- **GPS** dikirim ke `/api/mobile/posisi`. Posisi terakhir disimpan di **KV** (ringan),
  jejak rute disaring sebelum masuk D1 (server yang menentukan, maksimal 1 titik per
  interval). Ini menggantikan penulisan ke Firestore yang menumpuk ~8.600 dokumen/hari.
- **Nama aksi lama** (`login`, `get_rindeb`, `get_visit_pending`, `update_visit`,
  `get_dashboard_init`, `get_report`) tetap ada lewat lapisan `callApi()` — jadi bagian
  tampilan aplikasi tidak perlu diubah semua.

## GPS: apa yang sudah dan belum bisa

Sudah: `watchPosition()` aktif selama aplikasi dibuka, dikirim paling cepat 45 detik
sekali, plus pengiriman saat HP kembali dibuka (visibilitychange) dan penanganan
offline (titik terakhir disimpan di HP lalu dikirim saat sinyal ada).

Belum bisa: **melacak saat aplikasi ditutup**. Itu batasan browser, bukan bug — berlaku
sama untuk semua aplikasi web. Kalau manajemen memang memerlukan jejak penuh 8 jam,
pilihannya adalah aplikasi Android asli (Capacitor + background geolocation, lokasi
"selalu aktif", dipasang lewat APK/Play Store). Itu pekerjaan terpisah.

## Sisa pekerjaan (per 15 Okt malam)

1. ~~Merge `ke-d1` → `main` dan push~~ — **SUDAH.** PR
   https://github.com/colekdek244/clqmobile/pull/2 di-merge ke `main` (merge commit
   `041f112`). Diverifikasi lewat API: `sw.js` di `main` sudah `clqmobile-v11` dan
   `index.html` di `main` sudah memuat `updateViaCache`.
2. **Upload `sw.js` ke host aplikasinya — WAJIB, ini yang tersisa.**
   Sampai `sw.js` baru ada di server hosting, mekanisme pembaruan otomatis belum
   bekerja dan HP tetap memakai versi lama. Kalau setelah upload perubahan masih tidak
   terlihat di HP, itu cache — jangan menyalahkan kodenya dulu.
3. **Uji di HP sungguhan** — login, izin GPS "selalu/saat dipakai", kunjungan + foto,
   dan pastikan titik muncul di Monitor.
4. **Foto** masih memakai jalur Drive (thumbnail) di tampilan. Upload baru ke
   `/api/mobile/foto` sudah ada; penataan penyimpanan (R2) belum diputuskan.

## Kalau menguji dari laptop (localhost)

Pakai Chrome tanpa sandbox + Google Maps API key supaya GPS & peta hidup:

```bash
google-chrome --unsafe-debrowsers-enabled --disable-web-security \
  --user-data-dir=/tmp/chrome-uji --unsafe-debrowsers-enabled \
  --unsafe-debrowsers-enabled
```

Backend lokal diuji dengan `./node_modules/.bin/wrangler dev --port 8803` di
`~/projects/clq-portal`, lalu set `window.CLQ_API_UJI = true` agar aplikasi memakai
`http://127.0.0.1:8803` (default-nya server produksi).

## Catatan penting

- **Kuota D1**: beban TULIS clqmobile harus tetap kecil. Jangan tambah endpoint yang
  menulis tiap detik; saring di server seperti sekarang.
- **Service worker menyembunyikan perubahan.** Kalau setelah upload perubahan tidak
  terlihat di HP, itu cache — cek versi `CACHE_NAME`, bukan kodenya.
- Aksi `edit_user` di `callApi()` sekarang mengembalikan sukses kosong (hanya supaya
  pemanggil lama tidak error). Belum ada endpoint profil.
