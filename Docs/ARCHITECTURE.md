# Arsitektur & Desain Sistem

## 1. Tech Stack & Versi
- **Backend:** Laravel. **Sebelum mulai coding, cek versi aktual di `composer.json`** — jangan asumsikan. Per Agustus 2026, Laravel 12 (security fix sampai Feb 2027) dan Laravel 13 (rilis Maret 2026, butuh PHP 8.3+) sama-sama umum dipakai untuk proyek baru.
- **Frontend:** React (`.jsx`, bukan TypeScript) via Inertia.js. **Cek juga versi Inertia di `package.json`.** Inertia v3 adalah versi default saat ini dan punya beberapa perbedaan dari v2 — misalnya `Inertia::lazy()` sudah dihapus (ganti `Inertia::optional()`), dan Axios tidak lagi dibundle otomatis. Jangan campur syntax dari versi yang berbeda.
- **Bundler:** Vite.
- **Styling:** Tailwind CSS.

## 2. Alur Arsitektur (Inertia Flow)
- Tidak ada REST API terpisah untuk frontend. Semua request dari React ditangani lewat Inertia `useForm` atau `router`, backend membalas dengan `return inertia('PageName', $data)`.
- **Keamanan Admin:** Semua rute panel admin dilindungi middleware `auth`.
- **Rate Limiting:** Rute publik yang menulis data (submit order) dilindungi middleware `throttle` (misal `throttle:5,1`) untuk mencegah spam/abuse.

## 3. Data Sharing & Flash Messages
- Info kontak/sosial media (dari tabel `settings`) dan flash message (`success`/`error`) dibagikan ke semua halaman lewat `HandleInertiaRequests::share()`, supaya tidak perlu di-pass manual di tiap controller.
- Buat komponen `Toast.jsx` / `Alert.jsx` reusable untuk menampilkan flash message di frontend.

## 4. File & Image Upload
- Gambar (thumbnail paket, gambar portofolio, foto testimoni) disimpan lewat Laravel Storage, disk `public`. Jalankan `php artisan storage:link` sekali di awal setup.
- Validasi file (tipe, ukuran maksimal — misal `image|max:2048`) dilakukan di Form Request, bukan di controller.

## 5. Pagination
- Semua tabel index di Admin Panel (Orders, Web Services, Domains, Portfolios, Testimonials) wajib pakai `->paginate(10)` atau `->paginate(15)` di backend, dengan komponen `Pagination.jsx` reusable di frontend. Jangan tarik semua row sekaligus.

## 6. UI/UX & Design System
- Sebelum styling kompleks, pastikan layout sudah dimatangkan (referensi prototipe/Figma bila ada).
- **Komponen Reusable** di `resources/js/Components/`: `Button`, `TextInput`, `Modal`, `Table`, `Pagination`, `Toast`.
- Semua halaman publik wajib responsive (mobile-first).

## 7. Testing (Minimal)
- Sebelum tiap fase dianggap selesai, minimal lakukan smoke test manual. Untuk flow kritis (submit order, CRUD admin), disarankan tambah Feature test dengan Pest sebelum deploy ke production.
