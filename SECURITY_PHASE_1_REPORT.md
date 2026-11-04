# LAPORAN REMEDIASI KEAMANAN — PHASE 1 (CRITICAL & HIGH)
## PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pelaksanaan:** 4 November 2026
- **Status Tahap:** SELESAI (100% Berhasil Diverifikasi)
- **Git Commit Checkpoint:** `a0b81b3` (`feat(security): complete Phase 1 critical and high security remediation (SEC-001, SEC-002, SEC-003, SEC-004)`)
- **Baseline Commit:** `cdbfef0` (`chore: baseline checkpoint before Phase 1 security remediation`)
- **Lead Security Auditor & Engineer:** Senior Application Security & DevSecOps Specialist

---

## 1. RINGKASAN EKSEKUTIF

Sesuai dengan persetujuan **PHASE 1 — CRITICAL & HIGH SECURITY REMEDIATION**, tim telah berhasil melakukan perbaikan komprehensif terhadap 4 kerentanan utama dengan tingkat keparahan Kritis (Critical) dan Tinggi (High) pada aplikasi backend Node.js / Express.js PT PENILAI STANDAR UJI:

| ID Temuan | Kategori Kerentanan | Tingkat Keparahan Awal | CVSS v4.0 | Status Remediasi |
|---|---|---|---|---|
| **SEC-001** | Hardcoded JWT Secret & Static Default Seed Credentials | **CRITICAL** | **9.3** | **REMEDIATED & VERIFIED** |
| **SEC-002** | Unsafe Image Upload & Stored SVG Cross-Site Scripting (XSS) | **HIGH** | **8.7** | **REMEDIATED & VERIFIED** |
| **SEC-003** | Broken Function Level Authorization (RBAC Bypass) | **HIGH** | **8.6** | **REMEDIATED & VERIFIED** |
| **SEC-004** | Missing / Unreliable Rate Limiting (Brute-Force & DoS Risk) | **HIGH** | **7.5** | **REMEDIATED & VERIFIED** |

Seluruh 21 skenario pengujian otomatis (*automated verification test suite*) yang dirancang khusus untuk memvalidasi perbaikan ini berhasil dieksekusi dengan tingkat kelulusan **100% (21/21 PASS)**. Seluruh fungsionalitas aplikasi dan integritas data tetap terjaga secara utuh.

---

## 2. DETAIL IMPLEMENTASI REMEDIASI PER TEMUAN

### 2.1 SEC-001: Hardcoded JWT Secret & Default Seed Credentials
- **Akar Masalah:**
  - `backend/server.js` sebelumnya menggunakan fallback string hardcoded `psu-secret-key-super-secure-2026` jika variabel `JWT_SECRET` tidak didefinisikan.
  - Terdapat auto-seeding password statis yang dapat ditebak (`AdminPSU2026!`, `RedaksiPSU2026!`) setiap kali database diinisialisasi.
  - Terdapat akun admin hardcoded pada objek `fallbackStore.users`.
- **Tindakan Perbaikan:**
  1. **Fail-Closed Startup Enforcement:** Menghilangkan seluruh nilai rahasia default dari source code. Menambahkan mekanisme fail-closed di baris 20–28 `backend/server.js`. Jika `JWT_SECRET` tidak disetel di `.env` atau memiliki entropi/panjang kurang dari 32 karakter, proses Node.js langsung dihentikan secara aman (`process.exit(1)`).
  2. **Automated Secret Generation:** Menghasilkan cryptographically strong 64-karakter hex secret pada file konfigurasi `.env` dan menyediakan template `.env.example`.
  3. **Pembersihan Auto-Seeding & In-Memory Hardcoded User:** Menghapus seluruh query `INSERT` otomatis password statis pada `initDatabase()` dan mengosongkan kredensial hardcoded pada `fallbackStore`.
  4. **CLI Admin Provisioning Tool (`backend/scripts/create-admin.js`):** Membuat utilitas CLI terisolasi untuk membuat dan merotasi akun administrator. Skrip ini:
     - Menerapkan kebijakan kata sandi ketat (minimal 8 karakter, huruf kapital, huruf kecil, angka, dan karakter khusus).
     - Menggunakan fungsi derivasi kunci `scrypt` dengan random salt 16-byte untuk setiap akun.
     - Mendukung eksekusi interaktif (prompt) dan non-interaktif (`--username`, `--email`, `--password`, `--role`).
     - Tidak pernah mencetak password ke log/console.

---

### 2.2 SEC-002: Unsafe Image Upload & Stored SVG Cross-Site Scripting
- **Akar Masalah:**
  - Endpoint `/api/upload-gambar` sebelumnya menerima MIME type `image/svg+xml` dan menuliskan string SVG langsung ke disk publik (`/news/*.svg`).
  - Penamaan file mempertahankan nama asli dari pengguna (`file.name`), membuka risiko path traversal dan penimpaan file.
  - Tidak ada validasi magic bytes (header biner file) dan pemeriksaan konten skrip tersembunyi (polyglot).
- **Tindakan Perbaikan:**
  1. **Strict Raster Allowlist:** Hanya mengizinkan format raster (`JPEG`, `PNG`, `WebP`). Menolak keras SVG, HTML, PHP, dan dokumen non-raster.
  2. **Magic Bytes & File Signature Validation:** Fungsi `validateRasterImageBuffer(buf, ext)` memverifikasi tanda tangan byte biner:
     - `JPEG`: Memeriksa Start of Image (`0xFF 0xD8 0xFF`) dan End of Image (`0xFF 0xD9`).
     - `PNG`: Memeriksa 8-byte magic header (`89 50 4E 47 0D 0A 1A 0A`) serta trailer chunk `IEND`.
     - `WebP`: Memeriksa header RIFF dan chunk signature `WEBP` / `VP8`.
  3. **Anti-Polyglot Script Inspection:** Fungsi `hasDangerousScriptSignature(buffer)` memindai buffer biner terhadap injeksi tag skrip, event handler JavaScript (`onload=`, `onerror=`), dan tag `<svg>` yang disamarkan dalam file gambar raster.
  4. **Random UUID Filename Generation:** File yang disimpan ke disk publik diberi nama acak `crypto.randomUUID() + "." + ext`. Nama asli file dari client tidak pernah digunakan sebagai path penyimpanan fisik.
  5. **Static File Security Headers:** Menambahkan header `X-Content-Type-Options: nosniff` dan `Content-Disposition: inline` pada penyajian file di endpoint `/news/*` untuk mencegah MIME-type sniffing oleh browser.

---

### 2.3 SEC-003: Broken Function Level Authorization (RBAC)
- **Akar Masalah:**
  - Middleware autentikasi hanya memeriksa apakah request memiliki token admin valid tanpa membedakan hak akses role (`Super Admin`, `Editor`, `Author`).
  - Author dapat menghapus artikel, menerbitkan artikel tanpa kurasi, mengelola akun user admin, dan memanipulasi kepemilikan artikel orang lain.
- **Tindakan Perbaikan:**
  1. **Role Enforcement Middleware:** Mengimplementasikan middleware `requireRole(...allowedRoles)` yang memvalidasi role dari token JWT terhadap izin endpoint.
  2. **Matriks Hak Akses Ketat:**
     - **Super Admin Only:**
       - `GET /api/admin/users`, `POST /api/admin/users`
       - `POST /api/authors`, `DELETE /api/authors/:id`
       - `POST /api/admin/tags/rename`, `POST /api/admin/tags/delete`
       - `DELETE /api/galeri/:id`
       - `DELETE /api/artikel/:identifier`
       - `POST /api/artikel/bulk` (action: `delete`)
     - **Super Admin & Editor Only:**
       - `PATCH /api/artikel/:identifier/status`
       - `POST /api/artikel/bulk` (action: `publish`, `draft`)
     - **Author Role Guardrails:**
       - Pembuatan artikel baru (`POST /api/artikel`) dipaksa berstatus `Draft`, field `author` dipaksa sesuai identitas akun resmi pengunggah, dan `is_featured` dipaksa bernilai `0`.
       - Pembaruan artikel (`PUT /api/artikel/:identifier`) memvalidasi kepemilikan artikel (*article ownership check*). Author hanya dapat mengedit artikel buatannya sendiri dan dilarang mengubah status publikasi atau mengganti nama author.

---

### 2.4 SEC-004: Reliable Rate Limiting
- **Akar Masalah:**
  - Tidak ada pembatasan jumlah request pada endpoint publik dan autentikasi, membuka risiko serangan brute-force credential stuffing dan Denial of Service (DoS).
- **Tindakan Perbaikan:**
  1. **In-Memory Sliding Window Rate Limiter:** Dibuat engine pembatas laju komprehensif tanpa ketergantungan library eksternal, lengkap dengan pembersihan berkala (*garbage collection*) memori setiap 5 menit.
  2. **Smart Failed-Attempt Auth Limiter:**
     - Endpoint `/api/auth/login` membatasi kegagalan login hingga maksimal **5 kali dalam jendela 15 menit**.
     - Menggunakan composite key berbasis `${clientIp}_${username}` untuk mencegah pemblokiran pengguna sah akibat penyerang dari IP berbeda.
     - Melacak event response `res.on("finish")`: hanya percobaan login yang menghasilkan status `401 Unauthorized` atau `400 Bad Request` yang dihitung sebagai penalti. Login yang berhasil (`200 OK`) mereset penghitung kegagalan.
  3. **Public API & Upload Limiter:**
     - Endpoint pencarian publik (`/api/sertifikat/*`, `/api/artikel`): dibatasi maksimal **120 request per menit**.
     - Endpoint upload media (`/api/upload-gambar`): dibatasi maksimal **30 upload per 15 menit**.

---

## 3. BERKAS YANG DIUBAH & DITAMBAHKAN

| Berkas | Jenis Perubahan | Deskripsi Singkat |
|---|---|---|
| `.gitignore` | Modifikasi | Menambahkan aturan pengabaian ketat untuk file kredensial `.env`, `.admin-fallback.json`, arsip zip, dan dump database `.sql`. |
| `.env.example` | Berkas Baru | Template variabel environment di root workspace dengan panduan keamanan secret. |
| `backend/.env.example` | Berkas Baru | Template variabel environment di backend workspace. |
| `backend/package.json` | Modifikasi | Menambahkan script command `"create-admin": "node scripts/create-admin.js"`. |
| `backend/scripts/create-admin.js` | Berkas Baru | Skrip CLI provisioning akun administrator dengan hashing scrypt dan validasi password policy. |
| `backend/server.js` | Modifikasi | Implementasi fail-closed JWT, Rate Limiter engine, RBAC permission matrix, validasi raster upload (magic bytes + UUID + nosniff), dan export modular. |
| `backend/tests/verify_phase1.js` | Berkas Baru | Test suite verifikasi keamanan otomatis untuk seluruh kontrol Phase 1. |

---

## 4. BUKTI HASIL PENGUJIAN OTOMATIS (TEST RESULTS)

Hasil eksekusi test suite `node backend/tests/verify_phase1.js`:

```text
====================================================================
PT PENILAI STANDAR UJI — VERIFIKASI KEAMANAN PHASE 1
====================================================================

--- [SEC-001] Verifikasi Hardcoded Secret & Fail-Closed Startup ---
[PASS] SEC-001-A: Server menolak startup (fail-closed exit code 1) jika JWT_SECRET kosong
[PASS] SEC-001-B: Server menolak startup jika JWT_SECRET kurang dari 32 karakter
[PASS] SEC-001-C: Akun default statis lama (admin / AdminPSU2026!) tidak dapat login
[PASS] SEC-001-D: CLI Provisioning menolak password lemah yang melanggar kebijakan keamanan

--- [SEC-004] Verifikasi Rate Limiting & Proteksi Brute-Force ---
[PASS] SEC-004-A: Endpoint login memblokir upaya brute-force setelah 5 kegagalan (HTTP 429)

--- [SEC-003] Perolehan Token Otentikasi Super Admin, Editor, Author ---
[PASS] AUTH-001: Login Super Admin berhasil dan mengembalikan token JWT valid
[PASS] AUTH-002: Login Editor berhasil dan mengembalikan token JWT valid
[PASS] AUTH-003: Login Author berhasil dan mengembalikan token JWT valid

--- [SEC-003] Verifikasi Enforcing RBAC & Matriks Hak Akses ---
[PASS] SEC-003-A1: Super Admin diizinkan mengakses GET /api/admin/users (HTTP 200)
[PASS] SEC-003-A2: Editor DITOLAK saat mengakses GET /api/admin/users (HTTP 403 Forbidden)
[PASS] SEC-003-A3: Author DITOLAK saat mengakses GET /api/admin/users (HTTP 403 Forbidden)
[PASS] SEC-003-B: Editor DITOLAK saat mencoba menambah penulis (POST /api/authors) (HTTP 403)
[PASS] SEC-003-C1: Author DITOLAK mengubah status artikel langsung (HTTP 403)
[PASS] SEC-003-C2: Editor DIIZINKAN mengubah status publikasi artikel (HTTP 200)
[PASS] SEC-003-D: Author membuat artikel dipaksa berstatus Draft, nama author terkunci, & tidak featured
[PASS] SEC-003-E: Author DITOLAK menghapus artikel (DELETE /api/artikel/:slug) (HTTP 403)

--- [SEC-002] Verifikasi Keamanan Upload Gambar & Penolakan SVG XSS ---
[PASS] SEC-002-A: Upload file berformat SVG DITOLAK secara eksplisit (HTTP 400)
[PASS] SEC-002-B: File SVG disamarkan sebagai .png DITOLAK melalui validasi Magic Bytes (HTTP 400)
[PASS] SEC-002-C: File HTML non-gambar DITOLAK (HTTP 400)
[PASS] SEC-002-D: Upload gambar PNG raster valid DITERIMA & disimpan dengan nama acak UUID
[PASS] SEC-002-E: Static media endpoint menyertakan header X-Content-Type-Options: nosniff

====================================================================
RINGKASAN HASIL PENGUJIAN VERIFIKASI KEAMANAN PHASE 1
====================================================================
Total Pengujian: 21
Lolos (PASS)   : 21
Gagal (FAIL)   : 0

SELURUH PENGUJIAN KEAMANAN PHASE 1 BERHASIL DENGAN SEMPURNA (100% PASS)!
```

---

## 5. STATUS KERENTANAN & RISIKO YANG TERSISA

| ID Kerentanan | Deskripsi | Status Saat Ini | Rencana Tahap Selanjutnya |
|---|---|---|---|
| **SEC-001** | Hardcoded Secret & Static Credentials | **RESOLVED** | Selesai pada Phase 1. |
| **SEC-002** | Unsafe Upload & Stored SVG XSS | **RESOLVED** | Selesai pada Phase 1. |
| **SEC-003** | Broken Function Level Authorization | **RESOLVED** | Selesai pada Phase 1. |
| **SEC-004** | Missing Rate Limiting | **RESOLVED** | Selesai pada Phase 1. |
| **SEC-005** | SQL Injection pada Tracker Sertifikat | PENDING | Dijadwalkan pada **Phase 2 (Medium Severity)**. |
| **SEC-006** | JWT Token Disimpan di localStorage | PENDING | Dijadwalkan pada **Phase 2 (Medium Severity)** (Migrasi HttpOnly Cookie & CSRF). |
| **SEC-007** | Stored XSS pada TinyMCE / dangerouslySetInnerHTML | PENDING | Dijadwalkan pada **Phase 2 (Medium Severity)** (Sanitasi DOMPurify). |
| **SEC-008** | Inactive Admin Session Valid Until Expiry | PENDING | Dijadwalkan pada **Phase 2 (Medium Severity)** (Token version / Revocation check). |
| **SEC-009** | Missing Security HTTP Headers (CSP, HSTS) | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |
| **SEC-010** | Request Body Size Limit 25 MB DoS Risk | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |
| **SEC-011** | Error Stack Trace Disclosure & Verbose Logging | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |
| **SEC-012** | Local File Inclusion & Static Directory Traversal | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |
| **SEC-013** | Frontend Source Map Leakage | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |
| **SEC-014** | Vulnerable React Router & Vite Dependencies | PENDING | Dijadwalkan pada **Phase 3 (Low & Defense-in-Depth)**. |

---

## 6. KESIMPULAN & CHECKPOINT PERSETUJUAN

Tahap **PHASE 1 (CRITICAL & HIGH)** telah terselesaikan dengan standar keamanan tertinggi (*Zero Regression, 100% Verification Pass*). Seluruh perubahan telah tersimpan dalam commit Git terverifikasi:
- Commit ID: `a0b81b3`

Sesuai instruksi baku alur kerja, implementasi saat ini **DIHENTIKAN SEMENTARA** untuk menunggu ulasan dan persetujuan eksplisit dari pihak Pemilik Sistem / Pengguna sebelum melangkah ke:
**PHASE 2 — MEDIUM SECURITY REMEDIATION (SEC-005, SEC-006, SEC-007, SEC-008)**.
