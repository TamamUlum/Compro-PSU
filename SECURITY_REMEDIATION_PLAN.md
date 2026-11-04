# PLAN REMEDIASI KEAMANAN SISTEM (SECURITY REMEDIATION PLAN)
**Proyek:** PT PENILAI STANDAR UJI (PSU) — Company Profile & Certificate Tracking System  
**Dokumen Baseline:** `SECURITY_AUDIT_REPORT.md`  
**Fase Eksekusi:** PHASE 0 — Pre-Remediation Inspection, Validation, & Plan Corrections  
**Tanggal:** 04 November 2026  
**Status Fase 0:** SELESAI DIREVISI (Menunggu Persetujuan Eksplisit Pengguna untuk Memulai Fase 1)  

---

## 1. STATUS LINGKUNGAN, GIT, & WORKING TREE

| Item | Kondisi Saat Ini | Catatan & Rencana Penanganan |
| :--- | :--- | :--- |
| **Repositori Git** | Direktori belum diinisialisasi sebagai repositori Git (`fatal: not a git repository`). | Sebelum mengeksekusi Phase 1, `.gitignore` diamankan terlebih dahulu, lalu diinisialisasi git lokal (`git init`) dan commit baseline agar setiap tahap memiliki checkpoint yang dapat di-*rollback* sewaktu-waktu. |
| **Environment File** | File `.env` tidak ada pada repositori. | Aplikasi mengandalkan nilai fallback statis. Wajib dibuat `.env` lokal untuk development/staging dan `.env.example` dengan placeholder aman. |
| **Berkas `.gitignore`** | Sudah memuat entri `.env`, namun belum mengecualikan file arsip (`*.zip`) dan dump SQL (`*.sql`). | Perlu diperbarui sebelum git staging untuk mencegah kebocoran file backup dan credentials ke riwayat repositori. |
| **Integritas Source Code** | Tidak ada modifikasi source code sejak audit dilakukan (seluruh file berstatus original). | Siap dilakukan penambalan modular bertahap tanpa konflik. |

---

## 2. HASIL VALIDASI 14 TEMUAN AUDIT KEAMANAN

Setiap temuan telah divalidasi langsung terhadap source code terkini:

| No | ID | Nama Temuan | Status Validasi | Tingkat Risiko Aktual | File & Fungsi Terdampak |
| :---: | :---: | :--- | :---: | :---: | :--- |
| 1 | **SEC-001** | Hardcoded JWT Secret Key & Default Seed Credentials | **CONFIRMED** | **Critical** | `backend/server.js:12-14, 655-674, 1071-1089` (`initDatabase`, `signJwt`, `verifyJwt`) |
| 2 | **SEC-002** | Arbitrary File Upload via Base64 & Stored SVG XSS | **CONFIRMED** | **High** | `backend/server.js:1865-1943` (`POST /api/upload-gambar`) |
| 3 | **SEC-003** | Broken Function Level Authorization (Privilege Escalation) | **CONFIRMED** | **High** | `backend/server.js:1471-1535` (`POST /api/admin/users`), `GET /api/admin/users`, `DELETE` operations |
| 4 | **SEC-004** | Missing Rate Limiting on Auth & Sensitive Endpoints | **CONFIRMED** | **High** | `backend/server.js:1183, 1383, 1865, 2845` (`/api/auth/*`, `/api/upload-gambar`, `/api/sertifikat/*`) |
| 5 | **SEC-005** | Insecure Password Verification Fallback to Plaintext & Timing Attack | **CONFIRMED** | **Medium** | `backend/server.js:528-540` (`verifyPassword`) |
| 6 | **SEC-006** | Insecure Token Storage in Browser `localStorage` | **CONFIRMED** | **Medium** | `company-profile/src/pages/DashboardArtikel.jsx:7, 224, 376, 564` |
| 7 | **SEC-007** | Permissive CORS (`*`) & Missing HTTP Security Headers | **CONFIRMED** | **Medium** | `backend/server.js:16` (`cors()`, ketiadaan Helmet) |
| 8 | **SEC-008** | Missing Token Invalidation & Inactive User Check in Auth Middleware | **CONFIRMED** | **Medium** | `backend/server.js:630-643` (`requireAdminAuth`) |
| 9 | **SEC-009** | Verbose Error Messages & Internal Technical Information Disclosure | **CONFIRMED** | **Medium** | `backend/server.js:1278, 1378, 1445, 1532, 1860, 1940, 2262, 2329, 2479, 2634, 2780, 2837, 2897-2905` |
| 10 | **SEC-010** | Unrestricted Global Request Body Payload Size (JSON 25MB) | **CONFIRMED** | **Low** | `backend/server.js:17` (`app.use(express.json({ limit: "25mb" }))`) |
| 11 | **SEC-011** | Production Apache `.htaccess` Missing HTTPS Enforcement & Security Headers | **CONFIRMED** | **Low** | `htaccess-production.txt:1-40` |
| 12 | **SEC-012** | Directory Traversal Vulnerability in Custom Vite Dev Middleware | **CONFIRMED** | **Low** | `company-profile/vite.config.js:16-28` (`publicWebpFallbackPlugin`) |
| 13 | **SEC-013** | Residual Backup Archives (`dist.zip`, `backend.zip`) in Workspace Root | **CONFIRMED** | **Low** | Root directory (`backend.zip`, `dist.zip`) |
| 14 | **SEC-014** | Accidental / Deprecated Dummy Dependency (`init`) in Root `package.json` | **CONFIRMED** | **Informational** | `package.json:25` |

---

## 3. TEMUAN TAMBAHAN (ADDITIONAL SECURITY WEAKNESSES IDENTIFIED)

Hasil inspeksi mendalam pada Phase 0 menemukan 4 kelemahan tambahan:

1. **ADD-001: Ketiadaan Validasi Format Email & Password Complexity Policy pada Akun Admin**
   - **Lokasi:** `backend/server.js:1331` (`PUT /api/auth/profile`), `1383` (`PUT /api/auth/password`), `1471` (`POST /api/admin/users`)
   - **Masalah:** Password hanya diverifikasi dengan panjang minimal 6 karakter tanpa syarat kombinasi angka/huruf/simbol. Email tidak divalidasi format RFC 5322.
2. **ADD-002: Ketiadaan Logging Percobaan Login Gagal (Security Monitoring Failure)**
   - **Lokasi:** `backend/server.js:1225-1230` (`POST /api/auth/login`)
   - **Masalah:** Fungsi `logAdminActivity` hanya mencatat ketika login BERHASIL. Percobaan login gagal tidak dicatat, sehingga serangan brute force tidak terdeteksi dalam tabel log aktivitas.
3. **ADD-003: Kelemahan Validasi Klaim & Algoritma JWT**
   - **Lokasi:** `backend/server.js:593-617` (`verifyJwt`)
   - **Masalah:** Nilai `header.alg` tidak diverifikasi ketat (`alg === "HS256"`), dan klaim standar RFC 7519 (`iss`, `aud`, `nbf`, `token_type`) belum divalidasi.
4. **ADD-004: Penanganan Transisi Token Sesi (Dual Authentication Support Strategy)**
   - **Lokasi:** Integrasi antara `backend` dan `company-profile/src/pages/DashboardArtikel.jsx`
   - **Masalah:** Mengizinkan Bearer fallback tanpa batas waktu berisiko membiarkan token lama yang bocor tetap valid. Perlu strategi migrasi tegas ke HttpOnly Cookie dengan CSRF & Origin validation.

---

## 4. MATRIKS DEPENDENSI & STRATEGI EKSEKUSI BERTAHAP

```
[ FASE 0: PRE-REMEDIATION INSPECTION & PLAN CORRECTION ] (SELESAI DIREVISI)
  │
  ▼ (Setelah persetujuan eksplisit pengguna)
[ FASE 1: CRITICAL & HIGH REMEDIATION ]
  ├── 1. Git Safety: Update .gitignore (abaikan .env, *.zip, *.sql), inisialisasi Git checkpoint baseline
  ├── 2. SEC-001: Pindahkan JWT_SECRET ke .env, pasang startup validator fail-closed (min 32 char), hapus seed credentials statis, buat CLI admin provisioning
  ├── 3. SEC-003: Implementasi RBAC Permission Matrix komprehensif (Super Admin, Editor, Author) pada SELURUH endpoint administratif
  ├── 4. SEC-002: Restriksi upload ke format raster murni, validasi magic bytes + integrity, nama file random UUID v4, tolak SVG
  ├── 5. SEC-004: Pasang rate limiting dengan penghitungan failed attempts (skipSuccessfulRequests), identifikasi komposit IP + username
  └── 6. Pengujian komprehensif Phase 1 & Penyusunan SECURITY_PHASE_1_REPORT.md
  │
  ▼ (Setelah persetujuan pengguna)
[ FASE 2: MEDIUM SECURITY REMEDIATION ]
  ├── 1. SEC-005: Hilangkan plaintext fallback pada verifyPassword
  ├── 2. SEC-007: Pasang Helmet & batasi CORS allowlist resmi (prod + dev)
  ├── 3. SEC-008: Authorization Freshness (validasi DB real-time, token_version / session revocation, fail-closed)
  ├── 4. SEC-009: Centralized error handler & sanitasi respons error teknis (hilangkan SQL/XAMPP error)
  ├── 5. SEC-006: Migrasi penuh browser auth ke HttpOnly Cookie, CSRF protection, Origin validation, pembersihan localStorage
  ├── 6. ADD-003: Penguatan validasi klaim JWT (alg HS256, iss, aud, sub, exp, nbf, token_type)
  └── 7. Pengujian komprehensif Phase 2 & Penyusunan SECURITY_PHASE_2_REPORT.md
  │
  ▼ (Setelah persetujuan pengguna)
[ FASE 3: LOW & INFORMATIONAL REMEDIATION ]
  ├── 1. SEC-010: Perbaiki middleware ordering, pasang global express.json(1MB) dan scoped parser upload (12MB)
  ├── 2. SEC-011: Perbarui htaccess-production.txt (Force HTTPS, Security Headers, Blokir file sensitif .env, .sql, .zip)
  ├── 3. SEC-012: Perbaiki path traversal pada Vite custom dev middleware (path.resolve, path.relative containment)
  ├── 4. SEC-013: Bersihkan file arsip residual dari direktori root (setelah konfirmasi)
  ├── 5. SEC-014: Bersihkan dependency 'init' dari package.json
  └── 6. Final Security Assessment & Verifikasi Akhir
```

---

## 5. TECHNICAL REVIEW & PLAN CORRECTIONS (ADDENDUM REVISIONS)

Bagian ini merangkum seluruh revisi teknis mendalam yang dimasukkan berdasarkan hasil telaah arsitektur dan instruksi addendum:

---

### Koreksi 1: SEC-006 — Revisi Strategi Autentikasi Browser & Penghapusan Bearer Fallback Longgar

1. **Perubahan Rencana:**
   - Menghapus rencana pengembalian JWT di dalam JSON response untuk browser client.
   - Sesi login browser **100% menggunakan Cookie bertanda `HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=28800`**.
   - Frontend `DashboardArtikel.jsx` tidak lagi membaca, menyimpan, atau mempercayai `localStorage.getItem("psu_admin_jwt_token")`.
   - Frontend API client dikonfigurasikan dengan `credentials: "include"`.
   - Mengimplementasikan proteksi CSRF berlapis:
     - Konfigurasi `SameSite=Strict` pada cookie autentikasi.
     - Validasi header `Origin` dan `Referer` pada backend untuk semua request mutasi data (`POST`, `PUT`, `DELETE`, `PATCH`).
     - Header kustom `X-Requested-With: XMLHttpRequest` ditambahkan pada frontend API client (otomatis memblokir serangan simple CSRF form cross-origin).
   - Menolak Bearer token fallback pada browser: Header `Authorization: Bearer` **hanya diizinkan secara terisolasi** untuk integrasi non-browser (misalnya script CLI / automation dengan API key / machine-to-machine terpisah yang terdokumentasi). Browser tidak boleh menggunakan Bearer token untuk menghindari token lama di `localStorage` tetap aktif tanpa batas waktu.
   - Strategi migrasi: Pada inisialisasi pertama frontend, kode akan membersihkan `localStorage.removeItem("psu_admin_jwt_token")` dan mengarahkan pengguna ke alur login HttpOnly cookie. Seluruh token lama langsung diinvalir di backend via rotasi secret atau pembaharuan `token_version`.
2. **Alasan Teknis:**
   - Mengembalikan access token di JSON respons dan menyimpannya di `localStorage` tetap membuka celah pencurian sesi via XSS.
   - Mempertahankan Bearer fallback tanpa batasan memungkinkan token yang pernah tersimpan di browser klien lama terus dieksploitasi oleh penyerang jika pernah tersadap.
3. **File yang Terdampak:**
   - `backend/server.js` (handler `/api/auth/login`, `/api/auth/logout`, middleware `requireAdminAuth`, CSRF/Origin validator).
   - `company-profile/src/pages/DashboardArtikel.jsx` (fungsi `apiRequest`, `handleLogin`, `handleLogout`, inisialisasi state).
4. **Risiko Implementasi:**
   - Jika konfigurasi CORS `credentials: true` dan origin allowlist tidak sinkron, browser akan menolak mengirimkan cookie.
5. **Strategi Pengujian:**
   - Verifikasi melalui DevTools Application Tab bahwa token tidak ada di `localStorage`.
   - Verifikasi bahwa cookie `admin_token` bertanda `HttpOnly`, `Secure`, dan `SameSite=Strict`.
   - Uji serangan simulasi CSRF (cross-origin HTML form submission) -> harus ditolak oleh Origin/SameSite check.
   - Uji logout -> cookie terhapus secara tervalidasi di browser.
6. **Dampak Backward Compatibility:**
   - Administrator diminta melakukan login ulang satu kali saat patch dirilis. Seluruh alur kerja dashboard artikel tetap berjalan normal.

---

### Koreksi 2: SEC-010 — Perbaikan Middleware Ordering & Scoped Parsers

1. **Perubahan Rencana:**
   - Menghapus deklarasi global `app.use(express.json({ limit: "25mb" }))`.
   - Mengatur urutan eksekusi middleware Express secara ketat:
     1. Security Headers (`helmet`).
     2. CORS Origin Allowlist dengan `credentials: true`.
     3. Rate Limiter Middleware.
     4. Global JSON Body Parser berukuran ketat: `express.json({ limit: "1mb" })` untuk seluruh route publik dan administratif biasa.
     5. Endpoint upload gambar (`POST /api/upload-gambar`) didefinisikan dengan scoped body parser terisolasi: `express.json({ limit: "12mb" })` yang dipasang langsung pada route tersebut, **sebelum** handler dijalankan.
   - Perhitungan Overhead Base64: String Base64 memiliki ukuran ~33% lebih besar daripada binary asli. Untuk mengakomodasi batas file binary 8 MB, string Base64 memerlukan ~10.7 MB. Oleh karena itu limit scoped JSON parser disetel ke 12 MB.
   - Batas ukuran buffer biner hasil decode divalidasi ketat maksimal 8 MB (8,388,608 bytes).
2. **Alasan Teknis:**
   - Jika global parser 1 MB diletakkan sebelum route upload, request upload gambar akan langsung gagal dengan HTTP 413 Payload Too Large. Sebaliknya jika parser 25 MB dipasang global, seluruh endpoint (termasuk login dan pencarian) rentan terhadap memory exhaustion DoS.
3. **File yang Terdampak:**
   - `backend/server.js`.
4. **Risiko Implementasi:**
   - Jika ukuran payload base64 melampaui limit scoped parser, upload akan ditolak dengan HTTP 413.
5. **Strategi Pengujian:**
   - Kirim request JSON berukuran 2 MB ke `/api/auth/login` -> Harus ditolak HTTP 413.
   - Kirim request upload gambar berukuran 5 MB ke `/api/upload-gambar` -> Berhasil diproses.
   - Kirim request upload gambar berukuran 15 MB ke `/api/upload-gambar` -> Ditolak HTTP 413.
6. **Dampak Backward Compatibility:**
   - Nol dampak untuk penggunaan normal (upload foto berita normal berukuran < 5 MB).

---

### Koreksi 3: SEC-012 — Penguatan Validasi Path Traversal pada Vite Dev Middleware

1. **Perubahan Rencana:**
   - Menghapus ketergantungan pada validasi tunggal `.startsWith()`.
   - Mengimplementasikan validasi containment multi-layer pada `publicWebpFallbackPlugin`:
     1. Decoding URL dan sanitasi input (menolak null bytes `\0` dan encoded traversal sequences `%2e%2e%2f`).
     2. Normalisasi direktori root: `const publicRoot = path.resolve(__dirname, 'public')`.
     3. Resolusi jalur absolut target: `const resolvedFile = path.resolve(publicRoot, '.' + path.normalize(decodedPath))`.
     4. Validasi Containment menggunakan `path.relative()`:
        ```javascript
        const relative = path.relative(publicRoot, resolvedFile);
        if (relative.startsWith('..') || path.isAbsolute(relative)) {
          return next(); // Ditolak / diabaikan dari penanganan plugin
        }
        ```
     5. Penanganan kompatibilitas separator Windows (`\`) dan POSIX (`/`).
2. **Alasan Teknis:**
   - `.startsWith()` rentan lolos jika penyerang menggunakan nama folder sejenis (misal `/public_secret`) atau perbedaan case-insensitivity pada filesystem Windows. `path.relative` memastikan jalur target benar-benar merupakan anak langsung/subdirektori dari `publicRoot`.
3. **File yang Terdampak:**
   - `company-profile/vite.config.js`.
4. **Risiko Implementasi:**
   - Sangat rendah, plugin hanya aktif pada Vite development server.
5. **Strategi Pengujian:**
   - Uji URL traversal: `/..%2f..%2fpackage.json.png`, `/....//....//server.js.jpg`, `/%2e%2e%2f`.
   - Pastikan request keluar root direktori `public` langsung diabaikan dan tidak membaca file sistem.
6. **Dampak Backward Compatibility:**
   - 100% kompatibel dengan gambar yang sah di dalam folder `public/`.

---

### Koreksi 4: SEC-008 — Penguatan Authorization Freshness & Validasi Data Otoritatif

1. **Perubahan Rencana:**
   - Middleware `requireAdminAuth` tidak hanya memverifikasi keabsahan JWT dan `is_active === 1`.
   - Mengambil data otoritatif real-time dari database:
     1. Memastikan record user masih ada di database.
     2. Memastikan `is_active === 1`.
     3. Menyinkronkan nilai `role` dari database ke `req.adminUser.role` (mencegah privilege lama bertahan jika role pengguna baru saja diturunkan dari Super Admin ke Author oleh administrator lain).
     4. Implementasi Token Versioning: Menambahkan kolom `token_version INT DEFAULT 1` pada tabel `admin_users`. Token JWT membawa klaim `token_version`. Jika `decoded.token_version !== dbUser.token_version`, token dinyatakan tidak berlaku seketika.
     5. Setiap kali terjadi perubahan password, perubahan role, atau penonaktifan akun, `token_version` dinaikkan (`token_version = token_version + 1`).
     6. Operasi administratif bersifat **fail-closed**: jika database MySQL terputus atau status akun tidak dapat diverifikasi, akses ditolak (HTTP 401/503), tidak ada fallback yang memberikan akses Super Admin tanpa verifikasi.
2. **Alasan Teknis:**
   - JWT murni tanpa validasi database memungkinkan pengguna yang telah dipecat, dinonaktifkan, atau diturunkan jabatannya tetap mengeksekusi aksi administratif selama token belum kedaluwarsa.
3. **File yang Terdampak:**
   - `backend/server.js`, `backend/database/psu_sertifikat.sql`.
4. **Risiko Implementasi:**
   - Menambahkan query `SELECT id, role, is_active, token_version FROM admin_users WHERE id = ?` pada setiap request API terotentikasi. Karena pencarian menggunakan Primary Key pada tabel kecil (< 100 user), waktu eksekusi < 2 ms dan tidak membebani database.
5. **Strategi Pengujian:**
   - Skenario 1: Ubah `role` user di DB dari Super Admin ke Author -> Request berikutnya langsung memiliki hak Author.
   - Skenario 2: Ubah password user -> Token lama langsung ditolak HTTP 401.
   - Skenario 3: Nonaktifkan user (`is_active = 0`) -> Token lama langsung ditolak HTTP 401.
6. **Dampak Backward Compatibility:**
   - User sah yang aktif tidak merasakan perbedaan; user yang tidak sah langsung diblokir.

---

### Koreksi 5: SEC-004 — Rate Limiting Berbasis Failed Attempts & Identifikasi Komposit

1. **Perubahan Rencana:**
   - Konfigurasi `authLimiter` wajib menggunakan opsi `skipSuccessfulRequests: true` pada `express-rate-limit`.
   - Request login yang menghasilkan respons sukses (HTTP 200) **tidak mengurangi kuota rate limit**. Hanya respons gagal (HTTP 401, 400) yang dihitung sebagai percobaan gagal.
   - Identifikasi Komposit: `keyGenerator` menggabungkan alamat IP dan identitas username (`${req.ip}_${(req.body?.username || '').toLowerCase().trim()}`).
   - Batas Toleransi: Maksimal 5 kali kegagalan berturut-turut dalam jendela waktu 15 menit. Jika terlampaui, pemblokiran sementara diberlakukan selama 15 menit (bukan lockout permanen).
   - Pengaturan Reverse Proxy: Konfigurasikan `app.set("trust proxy", 1)` secara terkontrol untuk membaca IP asli dari reverse proxy hosting tanpa mempercayai header spoofed.
2. **Alasan Teknis:**
   - Rate limit standar yang menghitung semua request akan memblokir admin yang sah yang sedang bekerja aktif di dashboard.
   - Menggunakan kombinasi IP + username mencegah penyerang mengunci akun admin secara sengaja dari IP penyerang sendiri (*Lockout DoS Attack*).
3. **File yang Terdampak:**
   - `backend/server.js`.
4. **Risiko Implementasi:**
   - Jika pengguna salah memasukkan password 5 kali berturut-turut, pengguna harus menunggu 15 menit sebelum mencoba kembali.
5. **Strategi Pengujian:**
   - Jalankan 10 request login dengan kredensial benar -> Seluruhnya berhasil tanpa hambatan HTTP 429.
   - Jalankan 5 request login dengan kredensial salah -> Request ke-6 ditolak dengan HTTP 429 Too Many Requests.
6. **Dampak Backward Compatibility:**
   - Nol dampak terhadap penggunaan wajar.

---

### Koreksi 6: SEC-002 — Penguatan Validasi Gambar, Integritas Struktur, & Secure Storage

1. **Perubahan Rencana:**
   - Pengamanan multi-tier pada upload media:
     1. *Allowlist Format Ketat*: Hanya `image/jpeg`, `image/png`, `image/webp`. Tolak format `svg`, `html`, `php`, atau format script lainnya.
     2. *Magic Bytes Check*: Memeriksa byte tanda tangan biner buffer gambar.
     3. *Pemeriksaan Integritas Struktur Biner*: Memvalidasi kelengkapan struktur file (misal header SOF/EOF pada JPEG, chunk IHDR/IEND pada PNG) untuk memastikan buffer bukan polyglot file yang menyisipkan kode PHP/HTML di metadata EXIF.
     4. *Sanitasi Filename*: Nama file yang disimpan ke filesystem 100% dihasilkan oleh server menggunakan `crypto.randomUUID() + '.' + ext`. Input `filename` dari user hanya disimpan sebagai teks judul/label di database dan disanitasi.
     5. *Penyajian Statis Aman*: Folder `/news` disajikan dengan header `X-Content-Type-Options: nosniff` dan `Content-Disposition: inline`.
     6. *Preservasi Media Eksisting*: Gambar yang sudah ada di database dan folder `/news` tidak dihapus sembarangan.
2. **Alasan Teknis:**
   - Memeriksa magic bytes saja tidak cukup karena penyerang dapat membuat file polyglot (file biner gambar valid yang disusupi skrip PHP di komentar EXIF). Nama file acak UUID meniadakan risiko tabrakan nama (*file overwriting*) dan manipulasi path.
3. **File yang Terdampak:**
   - `backend/server.js`.
4. **Risiko Implementasi:**
   - File gambar yang rusak atau tidak lengkap akan ditolak dengan pesan kesalahan yang jelas.
5. **Strategi Pengujian:**
   - Upload file SVG -> Ditolak HTTP 400.
   - Upload file teks dinamai `.jpg` -> Ditolak HTTP 400.
   - Upload file JPEG/PNG valid -> Berhasil disimpan dengan nama UUID acak di folder `/news`.
6. **Dampak Backward Compatibility:**
   - Seluruh artikel yang sudah terbit tetap menampilkan gambar sampul dengan normal.

---

### Koreksi 7: SEC-003 — Matriks Otorisasi RBAC Komprehensif

1. **Perubahan Rencana:**
   - Mengaudit dan melindungi seluruh endpoint administratif, bukan hanya endpoint pembuatan user.
   - Menyusun Permission Matrix resmi untuk 3 peran (*roles*):
     - **Super Admin**: Akses penuh ke seluruh fitur (User Management, Authors Management, Bulk Delete Artikel, Delete Media, Delete Tags, Edit/Publish Artikel).
     - **Editor**: Manajemen konten artikel (Create/Edit Artikel, Quick Status Publish/Draft/Featured, Upload Media Galeri, Bulk Status Update). DILARANG mengelola akun admin, DILARANG menghapus permanen media atau artikel secara masal.
     - **Author**: Membuat artikel baru (status dipaksa Draft), mengedit artikel yang ditulis oleh dirinya sendiri, upload media pendukung artikel. DILARANG mempublikasikan artikel secara langsung, DILARANG mengelola akun admin, DILARANG menghapus data sistem.
   - Mengabaikan parameter `role` pada request body jika pemanggil bukan Super Admin.
2. **Alasan Teknis:**
   - Menerapkan prinsip hak akses terendah (*Principle of Least Privilege*). Mencegah Author atau Editor melakukan perubahan administratif sistem yang merusak integritas data.
3. **File yang Terdampak:**
   - `backend/server.js` (seluruh route `/api/admin/*`, `/api/authors/*`, `/api/artikel/*`, `/api/galeri/*`).
4. **Risiko Implementasi:**
   - Pengguna dengan role `Author` yang mencoba mempublikasikan artikel secara langsung akan ditolak (sesuai tata kelola redaksi).
5. **Strategi Pengujian:**
   - Uji setiap endpoint administratif menggunakan token Super Admin, Editor, dan Author.
   - Pastikan akses di luar matriks ditolak dengan HTTP 403 Forbidden.
6. **Dampak Backward Compatibility:**
   - Menyelaraskan logika backend dengan alur kerja dashboard redaksi yang sudah ada.

---

### Koreksi 8: ADD-003 — Penguatan Validasi Klaim JWT & Library Standard

1. **Perubahan Rencana:**
   - Memperkuat implementasi JWT verification:
     1. Memeriksa secara eksplisit `header.alg === "HS256"`. Tolak jika `alg` tidak sesuai.
     2. Memvalidasi seluruh klaim standar:
        - `iss` (*Issuer*): `"psu-auth-service"`
        - `aud` (*Audience*): `"psu-admin-dashboard"`
        - `sub` (*Subject*): User ID
        - `exp` (*Expiration*): Kedaluwarsa token (maks 8 jam)
        - `iat` (*Issued At*): Waktu penerbitan tidak boleh berada di masa depan
        - `nbf` (*Not Before*): Waktu mulai berlaku
        - `token_type`: `"access"`
     3. Menggunakan perbandingan konstan `crypto.timingSafeEqual` untuk tanda tangan kriptografis.
2. **Alasan Teknis:**
   - Mencegah serangan pemalsuan token, manipulasi header algoritma (*Algorithm Confusion / None attack*), dan replay token antar-lingkungan yang berbeda.
3. **File yang Terdampak:**
   - `backend/server.js`.
4. **Risiko Implementasi:**
   - Token lama yang tidak memiliki klaim `iss`/`aud` akan otomatis kedaluwarsa saat patch diterapkan.
5. **Strategi Pengujian:**
   - Uji token dengan `alg: "none"` -> Ditolak.
   - Uji token dengan issuer tidak cocok -> Ditolak.
   - Uji token valid bertanda lengkap -> Diterima.
6. **Dampak Backward Compatibility:**
   - Pengguna melakukan login ulang satu kali.

---

### Koreksi 9: Prosedur Keamanan Git Checkpoint

1. **Perubahan Rencana:**
   - Sebelum menjalankan perintah `git init` dan baseline commit:
     1. Perbarui berkas `.gitignore` terlebih dahulu dengan aturan:
        ```gitignore
        # Environment & Secrets
        .env
        .env.*
        !.env.example

        # Archives & Backups
        *.zip
        *.tar.gz
        *.bak

        # Database dumps with credentials
        backend/database/*.sql

        # Logs & Runtime
        *.log
        node_modules/
        ```
     2. Jalankan `git add .` secara selektif dan lakukan verifikasi staging:
        `git status` wajib diperiksa baris per baris untuk memastikan **TIDAK ADA** file `.env`, file `.sql`, arsip `.zip`, atau file log yang masuk ke commit baseline.
     3. Tidak ada file kerja pengguna yang dihapus pada tahap ini.
2. **Alasan Teknis:**
   - Menjaga repositori git tetap bersih dan mencegah kebocoran credentials atau artefak besar (seperti `dist.zip` 73 MB) ke dalam riwayat komit permanen.
3. **File yang Terdampak:**
   - `.gitignore`.
4. **Risiko Implementasi:**
   - Nol risiko fungsional.
5. **Strategi Pengujian:**
   - Jalankan `git status` sebelum commit pertama dan pastikan status staging bersih dari secret.
6. **Dampak Backward Compatibility:**
   - 100% aman.

---

## 6. STATUS FASE 0 & PERMOHONAN PERSETUJUAN EKSPLISIT

Fase 0 (Pre-Remediation Inspection & Plan Corrections) telah selesai diperbarui secara lengkap:
- 14 temuan audit telah divalidasi dan dikonfirmasi.
- 4 temuan tambahan telah dipetakan solusinya.
- 9 poin telaah teknis dan koreksi addendum telah diintegrasikan secara komprehensif.
- **TIDAK ADA** modifikasi kode sumber, database, file aplikasi, atau dependensi yang dilakukan pada fase ini.

**TINDAKAN BERIKUTNYA:**  
Menunggu konfirmasi dan persetujuan eksplisit dari Pengguna untuk memulai eksekusi **PHASE 1 (Critical & High Remediation: SEC-001, SEC-002, SEC-003, SEC-004)**.
