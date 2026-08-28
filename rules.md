# AI Vibe Coding Rules for Fordev

## Context
Project Name: Fordev (For Developers 11).
Description: Web development agency & domain selling platform dengan Admin Panel dan sistem permintaan penawaran publik (bukan checkout/e-commerce).
Stack: Laravel, React `.jsx`, Inertia.js, Tailwind CSS, Vite.

## Strict Rules
1. **Cek Versi Dulu:** Sebelum generate kode apapun, cek versi Laravel aktual di `composer.json` dan versi Inertia/React di `package.json`. Jangan asumsikan versi — Inertia v2 dan v3 punya beberapa perbedaan syntax (contoh: `Inertia::lazy()` dihapus di v3, ganti `Inertia::optional()`).
2. **Frontend:** Gunakan `.jsx` murni, jangan gunakan TypeScript (`.tsx`).
3. **Inertia Protocol:** Jangan gunakan `axios` atau `fetch` untuk mutasi data form. SELALU gunakan helper `useForm` dari `@inertiajs/react`.
4. **Routing:** Di React, gunakan Wayfinder `route('name')` untuk `href` pada komponen `<Link>`, jangan hardcode URL string.
5. **Backend Validation:** Gunakan Form Request untuk semua validasi di Laravel. Pesan error otomatis diteruskan ke frontend via props `errors` Inertia.
6. **Migration:** Migration yang sudah pernah dijalankan/di-commit tidak boleh diedit lagi. Kalau perlu ubah struktur tabel, buat migration baru (alter table).
7. **File Upload:** Gambar disimpan lewat Laravel Storage disk `public` (`storage:link`). Validasi tipe & ukuran file di Form Request.
8. **Pagination:** Semua tabel index di Admin Panel wajib pakai `->paginate()`, jangan tarik semua data sekaligus.
9. **Secrets:** Jangan hardcode API key/secret di kode. Semua kredensial lewat `.env`.
10. **UI Components:** Manfaatkan Tailwind CSS. Kode rapi dan modular, komponen reusable di `resources/js/Components/`.
11. gunakan plugin ini shadcn

## Development Step-by-Step
Jangan membuat semua fitur sekaligus. Kerjakan satu per satu berdasarkan arahan user (mengacu pada `DOCS/EXECUTION_PLAN.md`).
