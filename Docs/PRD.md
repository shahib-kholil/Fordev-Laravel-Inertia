# Product Requirements Document (PRD): Fordev (For Developers 11)

## 1. Visi & Tujuan
Fordev adalah platform penyedia layanan jasa pembuatan website dan penjualan domain. Platform ini berfungsi sebagai etalase publik (company profile, portofolio & katalog layanan) sekaligus sistem manajemen internal (Admin Panel) untuk mengelola pesanan, paket layanan, domain, portofolio, dan testimoni.

## 2. Target Pengguna
- **Klien/Customer:** Individu atau bisnis yang mencari jasa pembuatan website atau ingin membeli domain.
- **Admin (Internal):** Tim Fordev yang mengelola pesanan masuk, memperbarui harga paket web, mengelola inventaris/harga domain, serta konten portofolio dan testimoni.

## 3. Fitur Utama (Core Features)

### A. Sisi Publik (Public Facing)
1. **Landing Page:** Hero section, keunggulan Fordev, ringkasan portofolio unggulan, testimoni unggulan, dan CTA.
2. **Katalog Jasa Website:** Menampilkan tiering paket layanan (misalnya Basic dan Premium) dengan batasan fitur jelas per harga.
3. **Pencarian & Katalog Domain:** Daftar ekstensi domain yang dijual beserta harganya (misal: .com, .id, .dev).
4. **Galeri Portofolio:** Daftar proyek yang sudah dikerjakan Fordev — gambar, deskripsi singkat, kategori, dan link demo jika ada.
5. **Testimoni Klien:** Ditampilkan sebagai bagian dari landing page (yang ditandai *featured*).
6. **Form Permintaan Penawaran (Order/Quote Form):** Klien mengirim permintaan (nama, email, telepon, paket dan/atau domain yang diminati, catatan). **Ini BUKAN checkout dengan pembayaran online** — setelah submit, sistem membuat `order_number` unik dan mengirim notifikasi ke admin. Negosiasi dan pembayaran dilakukan manual oleh admin di luar sistem (telepon/WhatsApp/email/transfer manual).
7. **Cek Status Pesanan:** Halaman publik sederhana — klien memasukkan `order_number` + email untuk melihat status pesanannya (pending/processing/completed/cancelled), tanpa perlu login.

### B. Sisi Admin (Admin Panel)
1. **Autentikasi:** Login khusus admin (Laravel Auth bawaan). Untuk v1 cukup satu admin.
2. **Dashboard:** Ringkasan jumlah pesanan per status, jumlah paket & domain aktif, jumlah portofolio.
3. **Manajemen Paket Layanan (CRUD):** Nama, slug, harga, deskripsi, daftar fitur, gambar thumbnail, status aktif.
4. **Manajemen Domain (CRUD):** Ekstensi domain, harga jual, status ketersediaan.
5. **Manajemen Portofolio (CRUD):** Judul, gambar, deskripsi, kategori, link demo, status unggulan (featured), urutan tampil.
6. **Manajemen Testimoni (CRUD):** Nama klien, jabatan/perusahaan, foto (opsional), isi testimoni, rating, status unggulan.
7. **Manajemen Pesanan (Order Management):** Daftar pesanan (dengan pagination & filter status), detail pesanan termasuk harga saat pesanan dibuat (price snapshot), ubah status, catatan internal admin (tidak terlihat klien).
8. **Pengaturan Umum (Settings):** Kelola info kontak (email, telepon/WhatsApp, alamat) dan link sosial media yang tampil di halaman publik — supaya tidak hardcode di kode.

## 4. Catatan Non-Fungsional
- Form order publik wajib punya proteksi dasar dari spam (honeypot field + rate limiting). Captcha bisa ditambahkan belakangan jika spam masih tinggi.
- Admin mendapat notifikasi email setiap ada order baru masuk.
- Data pribadi klien (nama, email, telepon) hanya digunakan untuk keperluan follow-up pesanan.
- Semua halaman publik wajib responsive (mobile-first) — traffic marketing biasanya dominan dari mobile.

## 5. Di Luar Cakupan v1 (Explicitly Out of Scope)
- Pembayaran online / payment gateway (Midtrans, Xendit, dll).
- Login/akun untuk klien (cek status pesanan pakai `order_number` + email, tanpa akun).
- Multi-admin dengan role/permission berbeda.
