# PRODUCTION SECURITY CHECKLIST
## PT PENILAI STANDAR UJI (PT PSU)

**Dokumen:** Lembar Verifikasi Keamanan Sebelum & Sesudah Deployment Produksi  
**Target:** Website Company Profile & Portal Tracking Sertifikat  
**Klasifikasi:** Standar Operasional Keamanan Produksi

---

## 1. PRA-DEPLOYMENT: GERBANG REPOSITORY & SOURCE CODE

Sebelum melakukan `git push` ke GitHub maupun pengemasan file upload ke server, seluruh item di bawah ini **WAJIB** diverifikasi:

- [ ] **Tidak Ada File `.env` Produksi di Git:**
  - File `.env` lokal berisikan credential asli tidak terlacak oleh Git (`git check-ignore -v .env` lolos).
  - Hanya template aman [`.env.example`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/.env.example) yang ada di repository.
- [ ] **Tidak Ada Kredensial, Private Key, atau Sertifikat Digital di Repository:**
  - Tidak ada file `*.pem`, `*.key`, `*.pfx`, `*.p12`, atau `id_rsa`.
- [ ] **Tidak Ada Dokumen Audit Keamanan Internal di Repository:**
  - Dokumen `SECURITY_*.md`, laporan pengujian internal, register kerentanan, dan immutability logs telah di-untrack dan diblokir oleh `.gitignore`.
- [ ] **Tidak Ada Database Backup / Dump Produksi di Repository:**
  - File `*.dump`, `*.sql.gz`, `backup*.sql` dikecualikan dari Git.
  - Hanya file DDL skema resmi [`backend/database/psu_sertifikat.sql`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/database/psu_sertifikat.sql) yang dikelola.
- [ ] **Status Git Bersih dari File Sensitif:**
  - Menjalankan `git status` dan `git diff --cached --name-only` memastikan hanya kode sumber aplikasi, aset publik, dan pengujian yang masuk staging.

---

## 2. KONFIGURASI SERVER & LINGKUNGAN HOSTING (CPANEL)

- [ ] **Isolasi Direktori Non-Publik:**
  - Kode backend (`apps/psu-backend`) diletakkan di luar `public_html`.
  - Folder `node_modules`, file database, dan konfigurasi environment backend TIDAK DAPAT diakses langsung melalui browser via HTTP GET.
- [ ] **Sertifikat SSL/TLS Aktif:**
  - Domain `https://penilaistandaruji.com` dan `https://www.penilaistandaruji.com` memiliki sertifikat SSL yang valid tanpa peringatan mixed content.
- [ ] **Proses Binding Terisolasi:**
  - Variabel `HOST` diatur ke `127.0.0.1` agar proses Express hanya merespons koneksi lokal dari reverse proxy Passenger / Apache.
- [ ] **Proteksi Direktori & Dotfiles di `.htaccess`:**
  - Akses ke file sensitif (`.env`, `.git`, `.sql`, `.log`, `.bak`) diblokir mutlak dengan aturan `<FilesMatch>` HTTP 403 Forbidden.
  - *Directory Browsing* dinonaktifkan (`Options -Indexes -MultiViews`).
- [ ] **Pencegahan Eksekusi Skrip pada Folder Upload:**
  - Eksekusi file executable / script (`.php`, `.phtml`, `.cgi`, `.pl`, `.py`, `.sh`) di folder `news/` dan `uploads/` dinonaktifkan via rewrite rule `[F,L]`.

---

## 3. KONFIGURASI DATABASE MYSQL PRODUKSI

- [ ] **Kredensial Database Aman & Unik:**
  - Database user bukan menggunakan user `root` tanpa password.
  - Password database di-generate acak minimal 24 karakter dengan campuran huruf, angka, dan simbol.
- [ ] **Prinsip Least Privilege:**
  - Database user hanya diberikan hak akses ke database aplikasi (`psu_company_profile`), bukan ke seluruh server MySQL.
- [ ] **Akses Jarak Jauh (Remote MySQL) Dinonaktifkan:**
  - Database MySQL hanya mengizinkan koneksi dari `localhost` / `127.0.0.1` (tidak membuka port 3306 ke publik).
- [ ] **Backup Basis Data Awal Tersedia:**
  - Salinan dump database tersimpan di lokasi penyimpanan terenkripsi yang aman sebelum aplikasi dipublikasikan.

---

## 4. KONTROL KEAMANAN APLIKASI (NODE.JS EXPRESS)

- [ ] **Kunci Rahasia JWT Kuat (SEC-001):**
  - `JWT_SECRET` diisi string acak berkekuatan tinggi (minimal 64 karakter hex dari `crypto.randomBytes(32)`).
  - Server otomatis fail-closed (menolak start) jika `JWT_SECRET` kosong atau kurang dari 32 karakter.
- [ ] **Autentikasi Cookie Aman (SEC-006):**
  - Token sesi disimpan di cookie `psu_auth_token` dengan flag `HttpOnly`, `SameSite=Strict`, dan `Secure` aktif saat `NODE_ENV=production`.
  - Token tidak disimpan di `localStorage` browser.
- [ ] **Proteksi Cross-Site Request Forgery (CSRF) Aktif (SEC-006):**
  - Setiap mutasi data (`POST`, `PUT`, `PATCH`, `DELETE`) memvalidasi header `X-CSRF-Token` yang cocok dengan cookie `psu_csrf_token`.
- [ ] **Pembatasan Lintas Asal (CORS) Ketat (SEC-007):**
  - `ALLOWED_ORIGINS` hanya mendaftarkan domain resmi PT PSU (`https://penilaistandaruji.com,https://www.penilaistandaruji.com`).
  - Origin liar (`*`) dilarang keras.
- [ ] **Konfigurasi Trusted Proxy Terverifikasi (SEC-004):**
  - `TRUST_PROXY` diisi `loopback` (untuk Apache/Passenger lokal) atau `cloudflare` (jika menggunakan Cloudflare CIDR).
  - Nilai tidak aman seperti `true`, `1`, `2`, atau wildcard `0.0.0.0/0` ditolak keras oleh validasi fail-closed saat startup.
- [ ] **Proteksi Brute-Force & Rate Limiting Aktif (SEC-004):**
  - Endpoint login membatasi maksimal 5 kegagalan per akun dan 20 kegagalan per IP per 15 menit sebelum mengembalikan HTTP 429.
- [ ] **Sanitasi Input & Pencegahan Stored XSS (SEC-007 / WP-3.8):**
  - Seluruh input artikel disaring menggunakan AST Allowlist Sanitizer yang membuang tag berbahaya (`<script>`, `<iframe>`, atribut `onerror`, protokol `javascript:`).
- [ ] **Validasi Integritas File Upload (SEC-002 / WP-3.2):**
  - Upload file dibatasi maksimal 5 MB.
  - Format SVG, executable, dan dokumen non-gambar ditolak keras.
  - Gambar divalidasi menggunakan Sharp raster decoding & Magic Bytes.
- [ ] **Redaksi Pesan Error Produksi (SEC-009):**
  - Respon kegagalan database tidak membocorkan query SQL, username database, file path server, atau stack trace.

---

## 5. GERBANG JARINGAN, CLOUDFLARE & HTTP SECURITY HEADERS

- [ ] **Mitigasi Infinite Redirect Loop Cloudflare (SEC-011):**
  - Aturan rewrite HTTPS memeriksa `X-Forwarded-Proto` dan `CF-Visitor` agar tidak terjadi looping `ERR_TOO_MANY_REDIRECTS`.
  - Mode SSL Cloudflare diatur ke **Full** atau **Full (Strict)**.
- [ ] **HTTP Security Headers Tersaji pada Setiap Respon (SEC-009):**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- [ ] **HSTS (Strict-Transport-Security):**
  - Header HSTS aktif pada koneksi HTTPS tanpa menyebabkan kegagalan konektivitas.

---

## 6. VERIFIKASI OPERASIONAL PASCA-DEPLOYMENT (SMOKE TEST)

Setelah seluruh file terpasang di hosting, lakukan verifikasi langsung di browser:

- [ ] **Frontend Loading:** Beranda `https://penilaistandaruji.com` dapat diakses, carousel layanan berjalan, dan kartu dapat diklik lancar.
- [ ] **Asset Status 200 OK:** Console browser (F12) bersih dari error 404 (seluruh file JS, CSS, WebP termuat sempurna).
- [ ] **SPA Routing:** Membuka langsung subhalaman (seperti `/layanan/kalibrasi/biaya-sertif`) dan me-refresh halaman tidak menghasilkan error 404.
- [ ] **Health Check API:** Endpoint `https://penilaistandaruji.com/api/health` merespons status `healthy` (HTTP 200).
- [ ] **Sitemap & Robots:** `https://penilaistandaruji.com/sitemap.xml` dan `/robots.txt` tersaji dengan konten XML/text valid.
- [ ] **Sistem Login Admin:** Login dashboard dengan akun admin yang dibuat via CLI berhasil menerbitkan cookie HttpOnly dan mengarahkan ke dashboard.

