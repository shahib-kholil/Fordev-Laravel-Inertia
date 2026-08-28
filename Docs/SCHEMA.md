# Database Schema & Models

AI Assistant: Gunakan skema ini untuk membuat migration dan Eloquent Model. Semua tabel pakai `timestamps()` kecuali disebutkan lain.

**1. Table: `users` (Bawaan Laravel)**
- Dipakai murni untuk akses Admin Panel. Untuk v1 cukup satu admin (tidak perlu kolom role).

**2. Table: `settings` (Pengaturan Situs)**
- `id` (PK)
- `key` (string, unique) → e.g. `contact_email`, `contact_whatsapp`, `contact_address`, `social_instagram`
- `value` (text, nullable)
- Dipakai untuk info kontak & sosial media di halaman publik, supaya admin bisa ubah tanpa deploy ulang.

**3. Table: `web_services` (Paket Jasa Web)**
- `id` (PK)
- `name` (string) → e.g. "Paket Basic", "Paket Premium"
- `slug` (string, unique)
- `description` (text)
- `price` (unsignedInteger) → harga dalam Rupiah, tanpa desimal
- `features` (json) → array daftar fitur
- `image` (string, nullable) → path thumbnail
- `is_active` (boolean, default: true)
- `timestamps`
- `softDeletes()` ← **penting**: paket bisa direferensikan oleh `orders` lama, jadi jangan hard-delete.

**4. Table: `domains` (Katalog Ekstensi Domain)**
- `id` (PK)
- `extension` (string, unique) → e.g. ".com", ".co.id"
- `price` (unsignedInteger)
- `is_available` (boolean, default: true)
- `timestamps`

**5. Table: `portfolios` (Portofolio Proyek)**
- `id` (PK)
- `title` (string)
- `slug` (string, unique)
- `description` (text, nullable)
- `image` (string) → path gambar utama
- `project_url` (string, nullable) → link demo/live site
- `category` (string, nullable) → e.g. "Company Profile", "E-Commerce"
- `is_featured` (boolean, default: false) → tampil di homepage
- `order_position` (unsignedInteger, default: 0) → urutan tampil manual
- `timestamps`

**6. Table: `testimonials` (Testimoni Klien)**
- `id` (PK)
- `client_name` (string)
- `client_role` (string, nullable) → e.g. "Owner, Toko ABC"
- `client_photo` (string, nullable)
- `content` (text)
- `rating` (unsignedTinyInteger, nullable) → 1–5
- `is_featured` (boolean, default: true)
- `timestamps`

**7. Table: `orders` (Permintaan Penawaran / Quote Request)**
- `id` (PK)
- `order_number` (string, unique) → dibuat otomatis, e.g. `FRD-20260828-A1B2`, dipakai klien untuk cek status
- `client_name` (string)
- `client_email` (string)
- `client_phone` (string)
- `order_type` (enum: 'website', 'domain', 'both')
- `web_service_id` (nullable, FK → `web_services`, **`nullOnDelete()`**)
- `web_service_price_snapshot` (unsignedInteger, nullable) → salinan harga paket saat order dibuat, supaya tidak berubah kalau harga paket diupdate belakangan
- `domain_id` (nullable, FK → `domains`, **`nullOnDelete()`**) → ekstensi yang diminati
- `domain_name` (string, nullable) → nama domain yang diinginkan klien, e.g. "tokoku" (digabung dengan ekstensi dari `domain_id`)
- `domain_price_snapshot` (unsignedInteger, nullable) → salinan harga ekstensi saat order dibuat
- `status` (enum: 'pending', 'processing', 'completed', 'cancelled', default: 'pending')
- `notes` (text, nullable) → catatan dari klien
- `admin_notes` (text, nullable) → catatan internal admin, tidak tampil ke klien
- `timestamps`
- Index tambahan: `status`.

> Catatan validasi (Form Request, bukan bagian skema): jika `order_type` = `website`/`both`, maka `web_service_id` wajib diisi; jika `domain`/`both`, maka `domain_id` & `domain_name` wajib diisi.
