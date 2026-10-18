/**
 * Jembatan modul untuk ikon lucide.
 *
 * Bundel lucide.min.mjs hanya memuat 24 ikon yang dipakai aplikasi (293 KB,
 * bukan 11 MB paket penuh) dan diambil dari server sendiri — tidak ada CDN.
 * Berkas ini meneruskannya supaya `import { MapPin } from 'lucide-react'`
 * tetap bekerja.
 */
export * from './lucide.min.mjs';
