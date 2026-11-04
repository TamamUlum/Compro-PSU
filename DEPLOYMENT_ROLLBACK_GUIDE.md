# PANDUAN ROLLBACK DEPLOYMENT & PEMULIHAN BENCANA
## PT PENILAI STANDAR UJI (PT PSU)

**Dokumen:** Prosedur Operasional Standar Rollback Cepat Aplikasi & Database  
**Target:** Lingkungan Produksi cPanel Shared Hosting Jagoanhosting & GitHub  
**Tujuan:** Memulihkan website ke kondisi stabil dalam waktu sesingkat mungkin apabila terjadi kegagalan pasca-deployment

---

## 1. PRINSIP DASAR ROLLBACK

Ketika rilis pembaruan (*release update*) menyebabkan error kritis di produksi (seperti *Error 500/503*, *White Screen of Death*, atau gangguan konektivitas database), prioritaskan **pemulihan ketersediaan layanan (*service availability*)** sebelum melakukan investigasi akar masalah (*root cause analysis*).

> [!WARNING]
> Jangan melakukan *debugging* langsung pada kode produksi yang sedang mengalami gangguan publik. Segera lakukan rollback ke rilis stabil sebelumnya, lalu lakukan perbaikan pada lingkungan lokal.

---

## 2. SKENARIO 1 — ROLLBACK CEPAT FRONTEND (REACT SPA)

Gangguan frontend biasanya ditandai oleh: aset JS/CSS gagal termuat (404), layar putih (*blank page*), atau tampilan berantakan akibat kegagalan build.

### Metode A: Rollback Menggunakan Arsip Backup Build Terakhir (Paling Cepat - < 3 Menit)
1. Login ke cPanel Jagoanhosting -> buka **File Manager**.
2. Masuk ke direktori `/home/USERNAME/public_html/`.
3. Sebelum mengunggah rilis baru, pastikan Anda selalu mengompres rilis stabil yang sedang aktif menjadi file backup, misalnya `backup_frontend_YYYYMMDD_HHMM.zip`.
4. Jika rilis baru bermasalah:
   - Hapus seluruh folder `assets/` dan file `index.html` yang baru.
   - Ekstrak kembali arsip `backup_frontend_YYYYMMDD_HHMM.zip` ke dalam `public_html/`.
5. Buka dashboard Cloudflare (jika menggunakan Cloudflare CDN):
   - Masuk ke menu **Caching** -> **Configuration**.
   - Klik tombol **Purge Everything** untuk membersihkan cache aset lama di edge server.
6. Akses website dalam mode penyamaran (*Incognito Window*) untuk memastikan tampilan stabil telah pulih.

### Metode B: Rollback Menggunakan Git Release Lokal
1. Di komputer lokal Anda, periksa histori commit stabil terakhir:
   ```cmd
   git log --oneline -n 5
   ```
2. Checkout ke commit stabil sebelumnya:
   ```cmd
   git checkout <STABLE_COMMIT_HASH>
   ```
3. Bangun ulang file produksi:
   ```cmd
   cd company-profile
   npm run build
   ```
4. Kompres folder `dist/` dan unggah kembali ke `public_html/` via File Manager cPanel.
5. Kembalikan branch lokal ke `main`:
   ```cmd
   git checkout main
   ```

---

## 3. SKENARIO 2 — ROLLBACK BACKEND NODE.JS (EXPRESS API)

Gangguan backend biasanya ditandai oleh: API merespons *HTTP 503 Service Unavailable*, *Phusion Passenger error screen*, atau crash loop.

### Langkah-Langkah Rollback Backend:
1. Login ke cPanel -> buka **File Manager**.
2. Masuk ke direktori `/home/USERNAME/apps/`.
3. Ganti nama folder rilis yang bermasalah, misalnya `psu-backend` menjadi `psu-backend-failed`.
4. Kembalikan folder backup rilis sebelumnya (misalnya `psu-backend-stable`) menjadi `psu-backend`.
5. Buka menu **Setup Node.js App** di cPanel:
   - Pilih aplikasi `penilaistandaruji.com`.
   - Periksa kembali daftar **Environment Variables** (pastikan `JWT_SECRET`, `DB_PASSWORD`, dan `TRUST_PROXY=loopback` tidak terhapus atau berubah).
   - Klik tombol **Restart Application**.
6. Buka **Terminal** di cPanel atau File Manager, periksa file log error:
   ```bash
   cat /home/USERNAME/apps/psu-backend/passenger.log
   # atau
   tail -n 50 /home/USERNAME/nodevenv/apps/psu-backend/20/bin/stderr.log
   ```
7. Uji endpoint: `https://penilaistandaruji.com/api/health`. Pastikan merespons HTTP 200 `healthy`.

---

## 4. SKENARIO 3 — ROLLBACK DATABASE MYSQL

Gangguan database dapat terjadi apabila migration baru merusak relasi, mengubah tipe data kolom secara keliru, atau merusak integritas tabel.

> [!CAUTION]
> DILARANG melakukan perubahan skema atau struktur tabel tanpa membuat backup database sesaat sebelum eksekusi!

### Prosedur Rollback Database:
1. **Identifikasi File Backup:**
   Pastikan Anda memiliki file backup `.sql` yang diambil sesaat sebelum deployment (misalnya `backup_psu_db_YYYYMMDD_HHMM.sql`).
2. **Restore Melalui phpMyAdmin cPanel:**
   - Buka cPanel -> **phpMyAdmin**.
   - Pilih database produksi Anda (`username_psu_company_profile`).
   - Centang seluruh tabel yang mengalami kerusakan -> pilih opsi dengan dropdown **Drop** (Hanya jika seluruh tabel akan dipulihkan dari backup utuh).
   - Klik tab **Import**.
   - Pilih file `backup_psu_db_YYYYMMDD_HHMM.sql`.
   - Klik tombol **Import**.
3. **Verifikasi Integritas Data:**
   - Jalankan query sederhana untuk memastikan jumlah record dan relasi tabel kembali normal:
     ```sql
     SELECT COUNT(*) FROM sertifikat_produk;
     SELECT COUNT(*) FROM admin_users;
     SELECT COUNT(*) FROM artikel;
     ```
4. Restart aplikasi Node.js di cPanel agar koneksi pool me-reset state cache.

---

## 5. SKENARIO 4 — AKTIVASI HALAMAN PERBAIKAN DARURAT (MAINTENANCE MODE)

Jika perbaikan membutuhkan waktu lebih dari 15 menit dan sistem tidak dapat segera dipulihkan, pasang halaman pemeliharaan sementara (*Maintenance Page*) agar pengunjung mendapatkan informasi resmi dan mesin pencari (SEO) tidak mendeteksi error 500:

### Langkah Aktivasi Maintenance Mode:
1. Di folder `public_html/`, buat file bernama `maintenance.html` berisi pesan resmi PT PSU:
   ```html
   <!DOCTYPE html>
   <html lang="id">
   <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Pemeliharaan Sistem — PT Penilai Standar Uji</title>
     <style>
       body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #071a40; color: #fff; text-align: center; padding: 20px; }
       .box { max-width: 500px; }
       h1 { color: #c5a059; margin-bottom: 12px; }
       p { color: #cbd5e1; line-height: 1.6; }
     </style>
   </head>
   <body>
     <div class="box">
       <h1>Sistem Sedang Dalam Pemeliharaan</h1>
       <p>Website PT Penilai Standar Uji (PT PSU) sedang menjalani pemeliharaan berkala untuk peningkatan mutu layanan. Layanan akan segera kembali normal.</p>
       <p>Untuk kebutuhan mendesak, silakan hubungi kami via WhatsApp resmi di <strong>+62 819-0834-4114</strong>.</p>
     </div>
   </body>
   </html>
   ```
2. Buka file `.htaccess` di `public_html/`, tambahkan aturan pengalihan pemeliharaan di baris paling atas (setelah `RewriteEngine On`):
   ```apache
   RewriteEngine On
   # Jangan redirect IP pengembang Anda (ganti 203.0.113.10 dengan IP Anda)
   RewriteCond %{REMOTE_ADDR} !^203\.0\.113\.10$
   RewriteCond %{REQUEST_URI} !^/maintenance\.html$ [NC]
   RewriteCond %{REQUEST_URI} !\.(css|jpe?g|png|webp|svg|ico)$ [NC]
   RewriteRule ^.*$ /maintenance.html [R=503,L]
   Header always set Retry-After "3600"
   ```
3. Respon `HTTP 503` memberitahu Googlebot dan pengunjung bahwa sistem sedang dalam pemeliharaan sementara tanpa menurunkan ranking SEO.
4. Setelah masalah terselesaikan, hapus atau komentari baris rewrite pemeliharaan tersebut untuk memulihkan akses publik.

---

## 6. POST-MORTEM & CHECKLIST PEMULIHAN

Setelah sistem kembali beroperasi normal pasca-rollback:
- [ ] Catat kronologi kejadian (*timestamp*, pesan error awal, tindakan yang diambil).
- [ ] Salin seluruh file log error dari server sebelum ditimpa.
- [ ] Reproduksi error di lingkungan pengembangan lokal (`localhost`) sampai penyebab utama ditemukan dan diperbaiki.
- [ ] Jalankan seluruh automated test suite:
  ```cmd
  node backend/tests/verify_phase1.js
  node backend/tests/verify_phase2.js
  node backend/tests/verify_phase3.js
  node backend/tests/verify_enhancement.js
  ```
- [ ] Jadwalkan ulang deployment baru pada jam dengan trafik rendah setelah perbaikan divalidasi 100%.

