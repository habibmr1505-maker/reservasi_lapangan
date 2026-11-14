# Sistem Reservasi & Sewa Lapangan — Next.js

Aplikasi awal untuk Champions Sports Arena menggunakan Next.js App Router, TypeScript, Tailwind CSS v4, Prisma, dan MySQL/XAMPP.

## Fitur
- Login dengan role ADMIN/KASIR dan cookie sesi HttpOnly.
- Dashboard KPI dan transaksi terbaru.
- Booking lapangan, pengecekan bentrok, tarif reguler/malam, diskon, item tambahan, DP dan sisa pembayaran.
- Detail booking, riwayat pembayaran, perubahan status, pembatalan dengan alasan.
- Master lapangan, perlengkapan, pengguna (admin).
- Laporan dengan filter dan ekspor CSV.

## Persyaratan
- Node.js 20.9 atau lebih baru
- XAMPP dengan MySQL/MariaDB berjalan
- npm

## Instalasi Windows
1. Ekstrak ZIP ini.
2. Buka XAMPP Control Panel lalu jalankan **MySQL**. Apache tidak wajib untuk Next.js.
3. Buka `http://localhost/phpmyadmin`, buat database bernama `reservasi_lapangan` dengan collation `utf8mb4_unicode_ci`.
4. Salin `.env.example` menjadi `.env`.
5. Pastikan `DATABASE_URL` sesuai MySQL lokal. Default XAMPP umum: `mysql://root:@localhost:3306/reservasi_lapangan`. Jika root memiliki password, isi setelah `root:`.
6. Ubah `SESSION_SECRET` menjadi string acak minimal 32 karakter.
7. Jalankan terminal pada folder proyek:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   ```
8. Jalankan seed. Tambahkan konfigurasi sementara di `package.json` jika diperlukan:
   ```json
   "prisma": { "seed": "tsx prisma/seed.ts" }
   ```
   Kemudian pasang tsx dan jalankan:
   ```bash
   npm install -D tsx
   npx prisma db seed
   ```
   Alternatif: jalankan `npx tsx prisma/seed.ts`.
9. Jalankan aplikasi:
   ```bash
   npm run dev
   ```
10. Buka `http://localhost:3000`.

## Akun demo (hanya untuk pengembangan lokal)
- Admin: `admin` / `Admin123!`
- Kasir: `kasir` / `Kasir123!`

Segera ganti/hapus akun demo sebelum aplikasi digunakan sungguhan. Jangan deploy dengan SESSION_SECRET default.

## Catatan
- Jam malam pada contoh kode dihitung pukul 18.00–06.00. Sesuaikan aturan bisnis sebenarnya.
- Jam operasional contoh 06.00–22.00 untuk validasi booking.
- KPI okupansi dashboard memakai asumsi operasional 06.00–20.00 dan belum memperhitungkan jadwal perawatan.
- Master data yang dibuat mengikuti struktur dasar; tarif dapat disesuaikan dengan kondisi venue.
- Sebelum dipakai produksi, tambahkan CSRF/origin protection, rate limit login, audit log, penguncian slot yang lebih kuat untuk beban tinggi, dan kebijakan refund.
- Pembayaran di sini dicatat manual oleh kasir; belum terhubung ke payment gateway.
- PDF/print voucher dapat dicetak dari browser. Ekspor laporan tersedia dalam CSV.
