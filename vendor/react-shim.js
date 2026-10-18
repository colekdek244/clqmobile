/**
 * Jembatan ESM untuk React yang dimuat sebagai script UMD dari /vendor.
 *
 * KENAPA: aplikasi ini memakai importmap + `import ... from 'react'`. Dulu modul
 * itu diambil dari esm.sh (CDN). Bila CDN diblokir — biasa terjadi di jaringan
 * kantor — SELURUH aplikasi gagal dimuat dan halaman tampil PUTIH KOSONG tanpa
 * pesan apa pun. Sekarang berkas React disimpan di server sendiri.
 *
 * Urutan muat: react.min.js dan react-dom.min.js (UMD) dimuat lebih dulu lewat
 * <script defer> di index.html, lalu modul ini membaca hasilnya dari window.
 */
const R = window.React;
const RD = window.ReactDOM;

if (!R || !RD) {
  document.body.innerHTML =
    '<div style="font-family:sans-serif;padding:32px;text-align:center;color:#b91c1c">' +
    '<h2>Aplikasi gagal dimuat</h2>' +
    '<p>Pustaka React tidak ditemukan. Muat ulang halaman (tarik ke bawah).</p></div>';
  throw new Error('React belum termuat');
}

export default R;
// Ekspor SELURUH API React secara otomatis dari objek UMD. Dulu daftarnya ditulis
// tangan dan forwardRef terlewat, sehingga lucide gagal dimuat dan aplikasi
// mati dengan layar putih. Daftar otomatis ini tidak bisa ketinggalan.
const namaApi = Object.keys(R).filter(n => n !== 'default');
const api = {};
for (const n of namaApi) api[n] = R[n];

export const {
  useState, useEffect, useMemo, useRef, useCallback, useReducer,
  useContext, createContext, useLayoutEffect, Fragment, StrictMode,
  createElement, Children, cloneElement, forwardRef, memo, createRef,
} = api;

export const React = R;
export const createRoot = RD.createRoot;
export const ReactDOM = RD;

// lucide-react UMD menyediakan window.LucideReact
export const L = window.LucideReact || {};
