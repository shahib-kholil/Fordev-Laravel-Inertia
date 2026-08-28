# Execution Plan (Micro-Tasks)

Saat kamu siap mulai coding, berikan instruksi ke AI (Cursor/Claude) satu per satu menggunakan fase ini agar hasilnya akurat dan tidak error bertumpuk.

- [ ] **Phase 0: Project Setup**
  - Cek versi Laravel (`composer.json`) & Inertia/React (`package.json`) yang sudah terpasang di starter kit.
  - Pastikan Tailwind CSS & Wayfinder sudah terpasang dan jalan.
  - Jalankan `php artisan storage:link` untuk persiapan upload gambar.

- [ ] **Phase 1: Database**
  - Buat migration, model, dan factory untuk `settings`, `web_services` (dengan SoftDeletes), `domains`, `portfolios`, `testimonials`, dan `orders` (dengan FK `nullOnDelete`) berdasarkan `SCHEMA.md`.
  - Buat seeder dengan data dummy: minimal 1 Paket Basic + 1 Paket Premium, beberapa ekstensi domain, 3–4 portofolio, 3–4 testimoni, dan beberapa key `settings` default (email, WhatsApp, alamat).

- [ ] **Phase 2: Admin Panel — Auth & Dashboard**
  - Setup routing auth (Login).
  - Buat layout khusus Admin (`AdminLayout.jsx`).
  - Buat halaman Dashboard: total pesanan per status, jumlah paket/domain aktif, jumlah portofolio.

- [ ] **Phase 3: Admin Panel — CRUD Paket & Domain**
  - Resource Controller untuk `WebServicesController` dan `DomainsController`.
  - Halaman Index (Tabel + pagination), Create, Edit untuk masing-masing.
  - Implementasi delete (soft delete untuk `web_services`).

- [ ] **Phase 4: Admin Panel — CRUD Portofolio & Testimoni**
  - Resource Controller untuk `PortfoliosController` dan `TestimonialsController`, termasuk upload gambar.
  - Halaman Index (Tabel + pagination), Create, Edit, delete.

- [ ] **Phase 5: Admin Panel — Settings**
  - Halaman untuk mengelola key-value `settings` (kontak, sosial media).

- [ ] **Phase 6: Public Facing Pages**
  - `PublicLayout.jsx` (Navbar & Footer, ambil info kontak dari `settings` via shared props).
  - Homepage: hero, ringkasan keunggulan, portofolio unggulan, testimoni unggulan, CTA.
  - Halaman Katalog Jasa Web (dari `web_services`).
  - Halaman Katalog Domain (dari `domains`).
  - Halaman Galeri Portofolio (dari `portfolios`).

- [ ] **Phase 7: Order System (Quote Request)**
  - Form permintaan penawaran publik, dengan honeypot field + rate limiting (`throttle`).
  - Generate `order_number` otomatis saat submit, simpan price snapshot.
  - Kirim notifikasi email ke admin saat order baru masuk (Laravel Notification/Mail).
  - Halaman publik "Cek Status Pesanan" (input `order_number` + email).
  - Halaman Admin Order Management: list (pagination + filter status), detail (termasuk price snapshot), ubah status, tambah `admin_notes`.

- [ ] **Phase 8: Polish & QA**
  - Cek responsive di semua halaman publik.
  - Tambah meta tag dasar (title, description) untuk SEO halaman publik.
  - Smoke test manual untuk semua flow utama; opsional tambah Feature test Pest untuk flow order & CRUD admin.
