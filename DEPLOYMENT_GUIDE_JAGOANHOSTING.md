# PANDUAN DEPLOYMENT KE JAGOANHOSTING SHARED HOSTING (cPanel)
## PT PENILAI STANDAR UJI (PT PSU)

**Dokumen:** Panduan Resmi Prosedur Deployment Produksi ke Shared Hosting Jagoanhosting via cPanel  
**Target Aplikasi:** React 19 Frontend (Vite) + Node.js Express Backend + MySQL Database  
**Domain Target:** `https://penilaistandaruji.com` (dan `https://www.penilaistandaruji.com`)

---

## 1. ANALISIS ARSITEKTUR & KOMPATIBILITAS HOSTING

Aplikasi web PT PENILAI STANDAR UJI memiliki arsitektur modern *decoupled full-stack*:
- **Frontend:** Single Page Application (SPA) berbasis React 19 dan Vite yang di-compile menjadi static assets (HTML, CSS, JS, WebP/PNG).
- **Backend:** REST API berbasis Node.js dan Express.js (`backend/server.js`) yang membutuhkan runtime process aktif untuk melayani rute `/api/*`, autentikasi JWT, session HttpOnly cookie, dan validasi upload.
- **Database:** MySQL / MariaDB dengan engine InnoDB dan collation `utf8mb4_unicode_ci`.

> [!IMPORTANT]
> **JANGAN PERNAH MENGASUMSIKAN** bahwa seluruh paket Shared Hosting Jagoanhosting mendukung Node.js. Shared Hosting standar/pemula pada umumnya hanya mendukung PHP dan HTML statis.

### Skenario Kompatibilitas Hosting Jagoanhosting:
1. **Skenario A (Paket Mendukung Node.js):** Paket Cloud Hosting / cPanel Hosting Jagoanhosting yang dilengkapi fitur **"Setup Node.js App"** (CloudLinux Node.js Selector via Phusion Passenger). Frontend dan Backend dapat berada pada satu akun hosting yang sama.
2. **Skenario B (Paket PHP-Only / Tanpa Node.js):** Paket Shared Hosting standar yang tidak memiliki runtime Node.js. Frontend dapat di-deploy sebagai static files di `public_html`, namun Backend Express harus di-host pada lingkungan Node.js yang kompatibel (misalnya Cloud VPS Jagoanhosting, VPS KVM, atau Managed Node.js service) dengan subdomain API (contoh: `api.penilaistandaruji.com`).

---

## 2. CHECKLIST KONFIRMASI DENGAN CUSTOMER SUPPORT JAGOANHOSTING

Sebelum memulai deployment, hubungi tim teknis/support Jagoanhosting via Live Chat atau Tiket Bantuan untuk mengonfirmasi spesifikasi paket Anda:

- [ ] **Fitur Node.js:** Apakah paket hosting saya memiliki menu **"Setup Node.js App"** di cPanel?
- [ ] **Versi Node.js:** Apakah tersedia Node.js versi LTS aktif (minimal Node.js v18.x, disarankan **v20.x**)?
- [ ] **Web Server / Application Server:** Apakah server menggunakan Apache/LiteSpeed dengan Phusion Passenger?
- [ ] **Akses Terminal / SSH:** Apakah akun cPanel memiliki akses ke menu **"Terminal"** atau SSH untuk menjalankan `npm install`?
- [ ] **Batasan Resource (LVE Limits):** Berapa limit RAM (Memory Limit), CPU usage, dan Max Entry Processes yang dialokasikan? (Rekomendasi minimal RAM 1 GB).
- [ ] **Versi Database:** Apakah database server menggunakan MySQL versi 8.0+ atau MariaDB 10.4+?

---

## 3. STRUKTUR DIREKTORI REKOMENDASI DI SERVER (CPANEL)

Untuk menjaga keamanan maksimal (*security by design*), kode backend dan file konfigurasi **DILARANG** diletakkan di dalam folder publik `public_html`.

Gunakan pembagian struktur direktori berikut di bawah direktori home akun Anda (`/home/USERNAME/`):

```text
/home/USERNAME/
│
├── apps/
│   └── psu-backend/                    <-- DIREKTORI PRIVATE (Non-Public)
│       ├── database/
│       │   └── psu_sertifikat.sql      <-- Schema DDL database
│       ├── scripts/
│       │   └── create-admin.js         <-- CLI provisioning admin
│       ├── package.json
│       ├── package-lock.json
│       ├── server.js                   <-- Startup file Express Backend
│       └── uploads/                    <-- Media storage terisolasi
│
├── public_html/                        <-- DIREKTORI PUBLIK WEB (Document Root)
│   ├── .htaccess                       <-- Hardened Apache rewrite & security headers
│   ├── index.html                      <-- Entrypoint React SPA hasil build Vite
│   ├── robots.txt                      <-- Crawler directives
│   ├── sitemap.xml                     <-- Sitemap search engine
│   └── assets/                         <-- Bundled CSS, JS, dan Fonts Vite
│       ├── index-*.css
│       └── index-*.js
│
└── etc/ / tmp/ / logs/                 <-- Direktori internal cPanel & Passenger logs
```

---

## 4. LANGKAH-LANGKAH DEPLOYMENT — SKENARIO A (NODE.JS & CPANEL)

### Tahap 1 — Persiapan Domain & SSL di cPanel
1. Login ke cPanel Jagoanhosting (`https://domain-anda.com:2083` atau URL server).
2. Buka menu **Domains** dan pastikan domain utama `penilaistandaruji.com` mengarah ke Document Root `/home/USERNAME/public_html`.
3. Buka menu **SSL/TLS Status**, centang domain Anda, lalu klik **Run AutoSSL** untuk menerbitkan sertifikat SSL gratis (Let's Encrypt / Sectigo). Pastikan status SSL aktif dan gembok hijau menyala.

---

### Tahap 2 — Pembuatan Database MySQL di cPanel
1. Buka menu **MySQL Database Wizard** di cPanel:
   - **Step 1: Create A Database:** Beri nama database, misalnya `psu_company_profile` (nama lengkap menjadi `username_psu_company_profile`).
   - **Step 2: Create Database Users:** Buat username baru, misalnya `psu_user` (nama lengkap: `username_psu_user`), lalu gunakan *Password Generator* untuk membuat password acak minimal 24 karakter. **Catat password ini di tempat yang aman**.
   - **Step 3: Add User to Database:** Berikan hak akses **ALL PRIVILEGES** kepada user tersebut, lalu klik *Make Changes*.
2. Buka menu **phpMyAdmin** di cPanel:
   - Pilih database yang baru dibuat di bilah kiri.
   - Klik tab **Import**.
   - Klik **Choose File** dan pilih file [`backend/database/psu_sertifikat.sql`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/database/psu_sertifikat.sql) dari komputer lokal Anda.
   - Klik tombol **Import** (atau *Go*).
   - Pastikan seluruh tabel (`sertifikat_produk`, `sertifikat_pengujian`, `sertifikat_kalibrasi`, `sertifikat_sistem_manajemen`, `admin_users`, `artikel`, `galeri_artikel`, `penulis_artikel`, `log_aktivitas_artikel`) berhasil terbuat tanpa error.

---

### Tahap 3 — Deployment Backend Node.js
1. Di komputer lokal, pastikan folder `backend/node_modules` **TIDAK** diikutsertakan dalam paket upload (akan diinstall langsung di server).
2. Buat arsip `.zip` berisi file-file backend berikut:
   - `backend/server.js`
   - `backend/package.json`
   - `backend/package-lock.json`
   - `backend/scripts/`
   - `backend/database/`
3. Di cPanel, buka **File Manager**:
   - Masuk ke direktori `/home/USERNAME/`.
   - Buat folder baru bernama `apps`, lalu di dalamnya buat folder `psu-backend`.
   - Upload file zip backend Anda ke `/home/USERNAME/apps/psu-backend/` lalu ekstrak isinya.
4. Buka menu **Setup Node.js App** di cPanel:
   - Klik tombol **Create Application**.
   - **Node.js version:** Pilih versi LTS (misal `20.x` atau `18.x`).
   - **Application mode:** Pilih **Production**.
   - **Application root:** Masukkan `apps/psu-backend`.
   - **Application URL:** Pilih domain utama `penilaistandaruji.com` (atau subdomain `api.penilaistandaruji.com`).
   - **Application startup file:** Masukkan `server.js`.
5. Masukkan **Environment Variables** pada bagian *Environment variables* di cPanel:
   
   | Variable Name | Production Value | Keterangan |
   |---|---|---|
   | `NODE_ENV` | `production` | Mengaktifkan strict security, cookie Secure, error redacting |
   | `PORT` | `5000` | Port aplikasi internal |
   | `HOST` | `127.0.0.1` | Mengikat proses hanya ke localhost |
   | `DB_HOST` | `127.0.0.1` (atau `localhost`) | Socket lokal database MySQL cPanel |
   | `DB_PORT` | `3306` | Port default MySQL |
   | `DB_NAME` | `username_psu_company_profile` | Nama database dari Step 2 |
   | `DB_USER` | `username_psu_user` | Username database dari Step 2 |
   | `DB_PASSWORD` | `[Password_Database_Step_2]` | Password database yang digenerate |
   | `JWT_SECRET` | `[64_Char_Hex_Random_Secret]` | Kunci rahasia minimal 32 hex karakter acak |
   | `JWT_EXPIRES_IN` | `8h` | Masa berlaku sesi token |
   | `ALLOWED_ORIGINS` | `https://penilaistandaruji.com,https://www.penilaistandaruji.com` | Whitelist domain CORS |
   | `TRUST_PROXY` | `loopback` | **Wajib `loopback`** untuk local Passenger/Apache reverse proxy |
   | `AUTH_FAIL_LIMIT_ACCOUNT` | `5` | Proteksi brute force akun |
   | `AUTH_FAIL_LIMIT_IP` | `20` | Proteksi brute force IP |
   | `AUTH_FAIL_WINDOW_MINUTES` | `15` | Jendela waktu rate limit |

6. Klik **Create** untuk menyimpan aplikasi.
7. Di bagian atas halaman Node.js App, salin baris perintah aktivasi virtual environment, misalnya:
   `source /home/USERNAME/nodevenv/apps/psu-backend/20/bin/activate && cd /home/USERNAME/apps/psu-backend`
8. Buka menu **Terminal** di cPanel:
   - Tempel dan jalankan baris perintah aktivasi tersebut.
   - Jalankan instalasi dependency produksi:
     ```bash
     npm install --omit=dev
     ```
   - Buat akun Super Admin pertama secara aman via script provisioning CLI:
     ```bash
     node scripts/create-admin.js
     ```
     Ikuti petunjuk di layar untuk memasukkan username, email, full name, dan password kuat (min. 12 karakter, huruf besar, huruf kecil, angka, simbol).
9. Kembali ke menu **Setup Node.js App** di cPanel lalu klik tombol **Restart Application**.
10. Uji endpoint health check di browser: `https://penilaistandaruji.com/api/health`. Pastikan merespons status `{"status":"healthy",...}` dengan kode HTTP 200.

---

### Tahap 4 — Build & Deployment Frontend React (Vite)
1. Di komputer lokal Anda, buka Command Prompt / Terminal dan jalankan proses build produksi:
   ```cmd
   cd /d "E:\PSU siap Upload\compro-PSU-main\company-profile"
   npm run build
   ```
2. Pastikan build selesai tanpa error dan menghasilkan folder `company-profile/dist/`.
3. Kompres seluruh isi di **dalam** folder `company-profile/dist/` menjadi file `dist.zip` (sehingga file `index.html`, folder `assets/`, `robots.txt`, dan `sitemap.xml` berada di root arsip zip).
4. Buka menu **File Manager** di cPanel:
   - Masuk ke direktori `/home/USERNAME/public_html/`.
   - Jika terdapat file bawaan hosting (seperti `default.html` atau `index.php`), arsipkan atau hapus.
   - Upload file `dist.zip` ke `public_html/` lalu ekstrak isinya.
   - Pastikan `index.html` berada tepat di `/home/USERNAME/public_html/index.html`.

---

### Tahap 5 — Konfigurasi `.htaccess` Hardened di `public_html`
1. Di File Manager cPanel pada folder `public_html/`, klik tombol **Settings** (kanan atas) dan centang **Show Hidden Files (dotfiles)**.
2. Buat atau edit file bernama `.htaccess`.
3. Salin isi template konfigurasi yang sudah diuji dari file lokal [`htaccess-production.txt`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/htaccess-production.txt):

```apache
# ============================================================================
# .htaccess HARDENED PRODUCTION CONFIGURATION (SEC-011)
# PT PENILAI STANDAR UJI (PSU) — React SPA + Node.js (cPanel + Passenger)
# Topologi: Mendukung Direct Origin maupun Reverse Proxy (Cloudflare / Nginx)
# ============================================================================

# 1. Nonaktifkan Directory Browsing
Options -Indexes -MultiViews
DirectoryIndex index.html

# 2. Blokir Akses ke File & Direktori Sensitif
<FilesMatch "^\.|\.(env|git|gitignore|sql|dump|bak|old|orig|log|yml|yaml|json|lock)$">
  <IfModule mod_authz_core.c>
    Require all denied
  </IfModule>
  <IfModule !mod_authz_core.c>
    Order deny,allow
    Deny from all
  </IfModule>
</FilesMatch>

# 3. Blokir Eksekusi Skrip pada Direktori Upload Media
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Cegah eksekusi skrip (PHP, Perl, CGI, Python, Shell) di folder media/uploads
  RewriteRule ^(news|uploads)/.*\.(php[0-9]?|phtml|cgi|pl|py|sh|bash)$ - [F,L,NC]

  # --- 4. Paksa HTTPS dengan Mitigasi Redirect Loop Cloudflare ---
  RewriteCond %{HTTPS} off
  RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
  RewriteCond %{HTTP:CF-Visitor} !'"scheme":"https"' [NC]
  RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

  # --- 5. Routing API & Passenger Node.js ---
  # Teruskan request yang ditujukan ke endpoint backend API
  RewriteRule ^api(/|$) - [L]

  # --- 6. Layani File/Folder Fisik Statis yang Benar-Benar Ada ---
  RewriteCond %{REQUEST_FILENAME} -f [OR]
  RewriteCond %{REQUEST_FILENAME} -d
  RewriteRule ^ - [L]

  # --- 7. URL Rewriting Gambar Uploaded Media ---
  RewriteRule ^news/(.*)$ /api/news/$1 [L]

  # --- 8. Fallback Single Page Application (SPA) React ---
  RewriteRule ^ index.html [L]
</IfModule>

# 9. HTTP Security Headers
<IfModule mod_headers.c>
  Header always set X-Content-Type-Options "nosniff"
  Header always set X-Frame-Options "DENY"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>

# 10. Cache Aset Statis Berbasis Hash
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/webp "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>
```
4. Simpan perubahan file `.htaccess`.

---

## 5. SKENARIO B — JIKA PAKET HOSTING TIDAK MENDUKUNG NODE.JS

Jika hasil konfirmasi dengan Jagoanhosting menunjukkan paket shared hosting Anda tidak memiliki menu *Setup Node.js App*:
1. **Frontend Tetap di Shared Hosting:**
   - Jalankan build Vite di lokal (`npm run build`).
   - Upload isi `company-profile/dist/` ke `public_html/` cPanel Jagoanhosting.
   - Gunakan `.htaccess` untuk fallback SPA dan HTTPS.
2. **Backend di-Deploy ke Node.js Environment:**
   - Deploy backend ke layanan yang mendukung Node.js (misalnya Cloud VPS Jagoanhosting, Railway, Render, atau DigitalOcean App Platform).
   - Arahkan subdomain DNS `api.penilaistandaruji.com` (CNAME atau A record) ke host backend tersebut.
   - Atur `ALLOWED_ORIGINS=https://penilaistandaruji.com` di backend.
   - Pada frontend, atur `VITE_API_URL=https://api.penilaistandaruji.com` sebelum menjalankan `npm run build`.

---

## 6. PANDUAN PEMECAHAN MASALAH (TROUBLESHOOTING)

### A. Error 500 Internal Server Error
- **Penyebab:** Kesalahan sintaks pada `.htaccess` (misalnya modul Apache tertentu tidak aktif di server cPanel).
- **Solusi:** Buka cPanel menu **Errors** di bagian *Metrics*. Komentari sementara baris yang memicu error (misal `<IfModule mod_expires.c>`).

### B. Error 503 Service Unavailable / Passenger App Crash
- **Penyebab:** Backend Node.js gagal startup karena konfigurasi tidak valid (misal `JWT_SECRET` kurang dari 32 karakter, `TRUST_PROXY=true` yang ditolak fail-closed, atau `DB_PASSWORD` salah).
- **Solusi:** Buka File Manager cPanel, periksa file log di `/home/USERNAME/apps/psu-backend/` atau `/home/USERNAME/nodevenv/.../stderr.log`. Pastikan seluruh environment variable telah terisi dengan benar.

### C. Error Database Connection `ECONNREFUSED` / `EACCES`
- **Penyebab:** Nilai `DB_HOST` keliru.
- **Solusi:** Di lingkungan cPanel Shared Hosting, ganti `DB_HOST=127.0.0.1` menjadi `DB_HOST=localhost` atau sebaliknya. Pastikan database user telah diberikan *ALL PRIVILEGES*.

### D. CORS Error pada Browser
- **Penyebab:** Origin domain permintaan tidak terdapat dalam variabel `ALLOWED_ORIGINS`.
- **Solusi:** Pastikan `ALLOWED_ORIGINS` mencakup kedua varian: `https://penilaistandaruji.com,https://www.penilaistandaruji.com`.

### E. Infinite Redirect Loop (ERR_TOO_MANY_REDIRECTS) saat Pakai Cloudflare
- **Penyebab:** Cloudflare SSL mode diset ke *Flexible*, sementara Apache memaksa redirect HTTPS murni.
- **Solusi:** 
  1. Di dashboard Cloudflare (menu SSL/TLS), ubah mode dari *Flexible* menjadi **Full** atau **Full (Strict)**.
  2. Pastikan file `.htaccess` di server Anda menggunakan aturan mitigasi `RewriteCond %{HTTP:CF-Visitor}` seperti tercantum di Tahap 5.

### F. Halaman 404 Saat Refresh Subhalaman (SPA Routing)
- **Penyebab:** Web server mencari direktori fisik dan tidak menemukan fallback ke `index.html`.
- **Solusi:** Pastikan modul `mod_rewrite` aktif dan aturan `RewriteRule ^ index.html [L]` ada di `.htaccess`.

