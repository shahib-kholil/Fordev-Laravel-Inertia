# Security Penetration Test Report

**Generated:** 2026-09-04 09:03:08 UTC

# Executive Summary

# Ringkasan Eksekutif

Audit eksternal terhadap **`https://alfikr.id/`** menemukan **satu kerentanan kritis dan empat kerentanan medium**.

**Risiko keseluruhan: Tinggi.**

**Temuan utama**
- **Kritis — Otorisasi fungsi editorial hilang:** pengguna anonim cukup memperoleh cookie CSRF publik untuk menyembunyikan atau menerbitkan ulang artikel apa pun melalui endpoint publish/takedown. Dampaknya mencakup manipulasi integritas konten dan gangguan ketersediaan publikasi.
- **Medium — Django `DEBUG=True` terekspos:** halaman error teknis anonim membocorkan traceback, source path, URLconf lengkap, versi runtime, serta metadata database/SMTP dan deployment.
- **Medium — PII kontributor dan dokumen belum terbit terekspos:** endpoint JSON anonim mengembalikan nama, nomor telepon, email, alamat, status editorial, dan path file; dokumen submission dapat diunduh.
- **Medium — IDOR pada arsip submission:** ID numerik dapat digunakan tanpa autentikasi untuk mengunduh arsip ZIP berisi DOCX dan foto submission draft, meskipun endpoint pemeriksaan status mengembalikan `403`.
- **Medium — Stored XSS melalui upload SVG:** form kontributor anonim menerima SVG aktif dan menyajikannya inline sebagai `image/svg+xml`; JavaScript tereksekusi ketika URL dibuka di browser.

**Dampak bisnis**
- Artikel dapat diturunkan atau dipublikasikan ulang oleh pihak luar tanpa akun editorial.
- Data pribadi kontributor dan naskah yang belum disetujui dapat diakses publik.
- File upload aktif dapat digunakan untuk serangan skrip terhadap pengguna yang membuka URL tersebut.
- Debug disclosure mempercepat pemetaan internal aplikasi dan membantu eksploitasi lanjutan.

Prioritas pertama adalah menutup otorisasi publish/takedown, membatasi seluruh data dan file kontributor, menonaktifkan `DEBUG` di produksi, serta mengisolasi atau menolak konten upload aktif.

# Methodology

# Metodologi

**Jenis engagement:** gray-box eksternal tanpa kredensial editorial/admin.

**Scope:** `https://alfikr.id/`, termasuk host HTTPS utama, route publik, route editorial/admin yang terungkap, endpoint JSON, form multipart, dan media yang disajikan aplikasi. Port HTTP dan service tambahan yang ditemukan saat recon dicatat sebagai surface, tetapi tidak diberi dampak tanpa bukti layanan yang dapat divalidasi.

**Kerangka kerja:** pengujian mengikuti prinsip **OWASP WSTG**, **PTES**, dan **NIST SP 800-115**.

**Aktivitas:**
- Reconnaissance DNS, port, teknologi, crawling, URLconf discovery, JavaScript/API mapping, serta enumerasi route dan parameter.
- Pengujian autentikasi, CSRF, session boundary, object-level authorization, dan function-level authorization.
- Pengujian SQL injection pada parameter pencarian, filter, tag, path ID, dan endpoint JSON.
- Pengujian XSS reflected/stored/DOM serta upload active-content.
- Pengujian SSRF, XXE, deserialization, command/template injection, path traversal, dan server-side execution.
- Validasi independen menggunakan request anonim, perbandingan sebelum/sesudah, inspeksi arsip, dan eksekusi browser.

**Batasan:** tidak tersedia akun editorial/admin, sehingga rendering pasca-login dan parser yang hanya dapat dicapai dari workflow terautentikasi belum dapat diuji penuh. TCP/2000 terdeteksi terbuka tetapi banner/service tidak dapat diidentifikasi secara konklusif.

# Technical Analysis

# Analisis Teknis

## Temuan terkonfirmasi

1. **Missing function-level authorization pada publish/takedown — Kritis**
   Endpoint perubahan status artikel menerima request anonim yang hanya memiliki CSRF token, bukan identitas atau permission editorial. Artikel publik terbukti hilang dari JSON publik setelah takedown dan kembali setelah publish. CSRF bukan mekanisme autentikasi; kontrol harus memverifikasi session, role, permission, dan otorisasi terhadap artikel pada handler.

2. **Unauthenticated Django DEBUG disclosure — Medium**
   Request anonim ke route yang menghasilkan error dan path acak menampilkan halaman teknis Django, traceback/source location, absolute deployment paths, runtime/framework versions, route inventory, middleware/apps, serta metadata koneksi database/SMTP. Nilai secret sensitif terlihat termasking selama pengujian, tetapi konfigurasi debug produksi tetap memberi informasi internal yang material.

3. **Contributor PII and unpublished document exposure — Medium**
   Endpoint contributor JSON tidak memerlukan autentikasi dan mengembalikan PII serta metadata workflow. Path file yang dikembalikan dapat dipanggil langsung dari `/media/fileTulisan/`, termasuk dokumen DOCX submission yang belum dipublikasikan. Ini adalah kegagalan authorization dan data minimization.

4. **IDOR pada direct contributor download — Medium**
   `/tulisan/download/<id>/` mengandalkan ID yang dikendalikan pengguna dan tidak menerapkan pemeriksaan draft/status atau ownership. Untuk ID draft, endpoint companion mengembalikan `403`, tetapi direct download mengembalikan ZIP `200` berisi DOCX dan foto. Ini menunjukkan workflow authorization tidak konsisten.

5. **Stored XSS melalui upload SVG anonim — Medium**
   Form kontributor menerima file active-content tanpa allowlist server-side yang memadai. SVG disimpan pada media publik dan dikirim inline dengan `image/svg+xml`; browser mengeksekusi event/script yang diunggah. Eksploitasi memerlukan korban membuka URL file, tetapi eksekusi same-origin telah tervalidasi.

## Pengujian tanpa temuan terkonfirmasi

- SQL injection pada search, JSON search, filter, article detail, subcategory, dan route ID tidak menghasilkan error SQL, perubahan predikat, atau timing oracle. Route tag tetap dicatat sebagai proof gap karena selalu gagal pada exception aplikasi sebelum oracle normal tersedia.
- CSRF pada login, contributor submission, save-token, dan search POST diblokir untuk token hilang/invalid/foreign-origin.
- Tidak ditemukan sink SSRF, XXE, deserialization, command injection, template injection, PHP execution, atau path traversal pada surface anonim yang tersedia.
- Reflected XSS pada search/article/category tidak terbukti. Contributor text fields tersimpan verbatim, tetapi rendering dashboard terautentikasi tidak dapat dijangkau tanpa kredensial.

## Rantai dampak yang dipertimbangkan

PII endpoint membocorkan file path dan identifier yang mempermudah direct-download IDOR; keduanya tetap dilaporkan sebagai akar masalah authorization yang berbeda karena masing-masing memiliki endpoint dan dampak langsung. Upload XSS dapat menjadi lebih serius bila file otomatis ditampilkan kepada editor, tetapi embedding otomatis tersebut tidak terbukti. Publish/takedown bypass berdiri sendiri dan tidak memerlukan temuan lain; tidak ada rantai tambahan yang tervalidasi yang mengubah severity di atas dampak kritis yang sudah dibuktikan.

# Recommendations

# Rekomendasi

**Segera**
- Tambahkan autentikasi dan permission editorial wajib pada `/edit/berita/publish/` dan `/edit/berita/takedown/`; lakukan object-level authorization terhadap setiap article ID dan kembalikan `401/403` tanpa role yang sesuai. Tambahkan regression test untuk anonim, user biasa, dan editor berwenang.
- Nonaktifkan `DEBUG` di produksi, gunakan handler 404/500 generik, dan perbaiki exception yang memicu response teknis. Audit konfigurasi yang mungkin telah terekspos dan rotasi secret bila pernah muncul tidak termasking.
- Lindungi `/penulis/data/json/kontributor/`, `/tulisan/download/<id>/`, dan `/media/fileTulisan/` dengan autentikasi, ownership/role checks, state checks, serta deny-by-default. Jangan kirim PII atau path filesystem pada serializer publik.

**Jangka pendek**
- Tolak SVG, HTML, JavaScript, PHP, dan active-content lain pada upload kontributor; gunakan allowlist tipe file berbasis content inspection, bukan hanya ekstensi atau MIME client.
- Simpan upload di luar origin aplikasi atau sajikan selalu sebagai attachment dengan `Content-Disposition: attachment` dan `X-Content-Type-Options: nosniff`. Jika SVG wajib didukung, sanitasi dengan allowlist ketat yang menghapus script, event handler, external reference, dan elemen aktif.
- Gunakan identifier download non-guessable hanya sebagai defense-in-depth; kontrol authorization harus tetap dilakukan sebelum membaca file.
- Terapkan rate limiting dan respons login yang seragam untuk mengurangi enumeration/brute-force risk; item ini belum memiliki bukti takeover sehingga menjadi hardening lanjutan.

**Jangka menengah**
- Sentralisasikan authorization middleware/decorator untuk seluruh route editorial, JSON, contributor, dan media agar sibling endpoint tidak melewati kontrol workflow.
- Tambahkan audit logging dan alert untuk perubahan publish/takedown, download draft, upload active-content, serta akses bulk terhadap data kontributor.
- Berikan akun uji dengan role editorial/admin untuk menguji ulang parser dokumen, rendering contributor fields, seluruh CRUD, dan authorization antar-role.
- Identifikasi service TCP/2000 dan evaluasi secara terpisah setelah fingerprint yang dapat diandalkan tersedia.

**Retest & validasi**
- Ulangi PoC publish/takedown tanpa session untuk memastikan `401/403` dan tidak ada perubahan visibility.
- Uji ulang endpoint PII/download dengan ID draft, ID terbit, ID milik user lain, cookie anonim, dan role editorial berbeda.
- Upload SVG/HTML/PHP dan verifikasi file ditolak atau hanya terunduh sebagai attachment dari origin terpisah.
- Akses route invalid dan trigger error setelah deployment untuk memastikan hanya halaman generik yang dikembalikan serta tidak ada secret/configuration disclosure.

