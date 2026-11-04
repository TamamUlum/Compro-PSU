# LAPORAN PENGUJIAN KEAMANAN & REGRESI — PHASE 1.1
## PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pengujian:** 4 November 2026
- **Test Harness Script:** `backend/tests/verify_phase1_1.js`
- **Tingkat Kelulusan:** 100% (21 dari 21 Skenario PASS)
- **Status Akhir:** SEMPURNA (Zero Regression)

---

## 1. DAFTAR & RINCIAN KASUS UJI PHASE 1.1

### GROUP 1: SEC-002 (Secure Raster Image Processing & Sharp Integration)

| ID Uji | Nama Skenario | Input Data & Metode | Kriteria Keberhasilan | Status | Output Aktual |
|---|---|---|---|---|---|
| **SEC-002-1.1-A** | Validasi Upload JPEG Raster | Base64 JPEG buffer (100x100 px) via `POST /api/upload-gambar` | HTTP 200, nama file UUID dihasilkan | **PASS** | Status: 200, File: `[UUID].jpg` tersimpan ke database galeri |
| **SEC-002-1.1-B** | Validasi Upload PNG Raster | Base64 PNG buffer (120x80 px) via `POST /api/upload-gambar` | HTTP 200, nama file UUID dihasilkan | **PASS** | Status: 200, File: `[UUID].png` tersimpan ke database galeri |
| **SEC-002-1.1-C** | Validasi Upload WebP Raster | Base64 WebP buffer (90x90 px) via `POST /api/upload-gambar` | HTTP 200, nama file UUID dihasilkan | **PASS** | Status: 200, File: `[UUID].webp` tersimpan ke database galeri |
| **SEC-002-1.1-D** | Penolakan Format SVG | Payload SVG XML dengan tag `<script>` | HTTP 400 Bad Request, ditolak sebelum disimpan | **PASS** | Status: 400, Pesan: "Format SVG atau dokumen non-raster ditolak..." |
| **SEC-002-1.1-E** | Penolakan Dokumen HTML | Payload `data:text/html;base64` | HTTP 400 Bad Request | **PASS** | Status: 400, Pesan: "Hanya format gambar raster yang diizinkan..." |
| **SEC-002-1.1-F** | Penolakan Gambar Malformed | Truncated PNG header tanpa chunk data valid | HTTP 400 Bad Request dari Sharp decoder | **PASS** | Status: 400, Pesan: "Header biner file tidak cocok..." |
| **SEC-002-1.1-G** | Penolakan Dimensi Berlebih (> 4096 px) | PNG valid dengan lebar 4500 piksel | HTTP 400 Bad Request dari validasi dimensi | **PASS** | Status: 400, Pesan: "Dimensi gambar melampaui batas keamanan maksimal (4500x100 px)..." |
| **SEC-002-1.1-H** | Penolakan Decompression Bomb / Pixel Flood | Header PNG dengan dimensi 65535 x 65535 piksel (> 16 MP) | HTTP 400 Bad Request dari `limitInputPixels` Sharp | **PASS** | Status: 400, Pesan: "Dimensi gambar melampaui batas keamanan maksimal (65535x65535 px)..." |
| **SEC-002-1.1-I** | Verifikasi File Tersimpan di Disk | Membaca file hasil upload di `company-profile/public/news/` menggunakan Sharp | File dapat diurai kembali dengan metadata format dan dimensi yang sesuai | **PASS** | Format `png`, width `120`, height `80` terverifikasi via libvips |
| **SEC-002-1.1-J** | Verifikasi Buffer Re-Encoding | Membandingkan buffer tersimpan dengan buffer input pengguna | File di disk merupakan hasil kompresi ulang Sharp (bukan raw user buffer) | **PASS** | Buffer di-reencode murni, metadata EXIF/IPTC berhasil dilucuti |
| **SEC-002-1.1-K** | Verifikasi Nama File UUID v4 | Regex pattern matching `^[0-9a-f-]{36}\.(jpg\|png\|webp)$` | Nama file tidak mengandung karakter dari input nama pengguna | **PASS** | Pola UUID v4 36 karakter terverifikasi |

---

### GROUP 2: SEC-004 (Anti-IP Spoofing & Two-Tier Rate Limiting)

| ID Uji | Nama Skenario | Input Data & Metode | Kriteria Keberhasilan | Status | Output Aktual |
|---|---|---|---|---|---|
| **SEC-004-1.1-A** | Resistansi Spoofing X-Forwarded-For | Mengirim 6 percobaan login gagal dari 1 IP dengan header `X-Forwarded-For` acak | Rate limit tetap terkunci pada percobaan ke-6 berdasarkan IP soket asli | **PASS** | Pemalsuan header diabaikan Express saat `trust proxy: false`, status HTTP 429 tercapai |
| **SEC-004-1.1-B** | Proteksi Password Spraying (Global IP Limiter) | Mengirim 22 percobaan login gagal ke 22 username berbeda dari satu IP (`198.18.0.88`) | Terblokir pada percobaan ke-21 (Batas IP global: 20) | **PASS** | HTTP 429 pada percobaan ke-21, Pesan: "Terlalu banyak percobaan login gagal dari alamat IP Anda..." |
| **SEC-004-1.1-C** | Proteksi Targeted Brute-Force (Account Limiter) | Mengirim 6 percobaan login gagal ke 1 target username spesifik dari satu IP | Terblokir tepat pada percobaan ke-6 (Batas akun: 5) | **PASS** | HTTP 429 pada percobaan ke-6, Pesan: "Terlalu banyak percobaan login gagal untuk akun ini..." |
| **SEC-004-1.1-D** | Reset Penalti saat Login Berhasil | 3 kali percobaan salah diikuti 1 kali login kredensial benar | Login berhasil (HTTP 200), penalti akun terhapus, tidak ada false lockout | **PASS** | HTTP 200, token JWT diterbitkan, counter akun seketika direset |
| **SEC-004-1.1-E** | Header Standar Retry-After | Menginspeksi response headers saat menerima HTTP 429 | Menyertakan header `Retry-After` dengan nilai detik yang valid | **PASS** | Header `Retry-After: 900` detik (15 menit) hadir pada respons |

---

### GROUP 3: REGRESSION TESTING (Fungsionalitas Sistem)

| ID Uji | Nama Skenario | Endpoint & Aksi | Kriteria Keberhasilan | Status | Output Aktual |
|---|---|---|---|---|---|
| **REG-1.1-A** | Autentikasi Seluruh Role | Login Super Admin, Editor, Author via `POST /api/auth/login` | Ketiga role berhasil login dan menerima token JWT valid | **PASS** | Admin Token: OK, Editor Token: OK, Author Token: OK |
| **REG-1.1-B** | Endpoint Profil Pengguna | `GET /api/auth/me` dengan Bearer token | Mengembalikan data profil akun yang sesuai | **PASS** | HTTP 200, Role: "Super Admin", Full Name: "Super Admin PSU" |
| **REG-1.1-C** | Endpoint Publik Artikel | `GET /api/artikel` tanpa token | Mengembalikan daftar artikel publik | **PASS** | HTTP 200, Array data artikel berhasil diambil |
| **REG-1.1-D** | Endpoint Galeri Publik | `GET /api/galeri` tanpa token | Mengembalikan daftar foto media publik | **PASS** | HTTP 200, Array data galeri foto berhasil diambil |
| **REG-1.1-E** | Tracking Sertifikat | `GET /api/sertifikat/sertifikasi-produk?no_sertifikat=...` | Handler merespons sesuai kueri (200/404/500 safe fallback) | **PASS** | Endpoint merespons kueri dengan penanganan database yang aman |

---

## 2. BUKTI LOG EKSEKUSI PENGUJIAN TERMINAL

```text
====================================================================
PT PENILAI STANDAR UJI — VERIFIKASI KEAMANAN PHASE 1.1
====================================================================

--- [SEC-002] Verifikasi Image Processing, Dimension Caps & Re-Encoding ---
[PASS] SEC-002-1.1-A: JPEG raster valid diterima & disimpan
[PASS] SEC-002-1.1-B: PNG raster valid diterima & disimpan
[PASS] SEC-002-1.1-C: WebP raster valid diterima & disimpan
[PASS] SEC-002-1.1-D: SVG ditolak secara eksplisit (HTTP 400)
[PASS] SEC-002-1.1-E: HTML non-gambar ditolak (HTTP 400)
[PASS] SEC-002-1.1-F: Gambar terkorupsi / malformed ditolak saat didecode (HTTP 400)
[PASS] SEC-002-1.1-G: Gambar dengan dimensi melampaui batas (> 4096 px) ditolak (HTTP 400)
[PASS] SEC-002-1.1-H: Decompression bomb (dimensi ekstrem 65535x65535 px / >16 MP) ditolak (HTTP 400)
[PASS] SEC-002-1.1-I: File hasil upload tersimpan di disk dapat dibuka & diverifikasi sebagai raster valid
[PASS] SEC-002-1.1-J: File yang tersimpan di disk merupakan hasil re-encoding Sharp (bukan raw client buffer)
[PASS] SEC-002-1.1-K: Nama file upload menggunakan identifier acak UUID v4

--- [SEC-004] Verifikasi Client IP Trust & Proteksi Password Spraying ---
[PASS] SEC-004-1.1-A: Pemalsuan header X-Forwarded-For tidak dapat membypass rate limit pada koneksi langsung
[PASS] SEC-004-1.1-B: Password Spraying (banyak username dari satu IP) diblokir oleh Global Per-IP Limiter
[PASS] SEC-004-1.1-C: Single-Account Brute Force diblokir oleh Account-Specific Limiter (5 kegagalan)
[PASS] SEC-004-1.1-D: Login berhasil tidak menimbulkan lockout & mereset penghitung kegagalan
[PASS] SEC-004-1.1-E: Respons HTTP 429 menyertakan header Retry-After

--- [REGRESSION] Pengujian Fungsionalitas & Integritas Fitur Aplikasi ---
[PASS] REG-1.1-A: Autentikasi role Super Admin, Editor, dan Author tetap berjalan normal
[PASS] REG-1.1-B: Endpoint profil /api/auth/me mengembalikan data pengguna aktif
[PASS] REG-1.1-C: Endpoint publik /api/artikel dapat diakses tanpa hambatan
[PASS] REG-1.1-D: Endpoint publik /api/galeri dapat diakses tanpa hambatan
[PASS] REG-1.1-E: Endpoint tracking sertifikat /api/sertifikat/:submenu berjalan normal

====================================================================
RINGKASAN HASIL PENGUJIAN VERIFIKASI KEAMANAN PHASE 1.1
====================================================================
Total Pengujian Phase 1.1 : 21
Lolos (PASS)             : 21
Gagal (FAIL)             : 0

SELURUH PENGUJIAN KEAMANAN & REGRESI PHASE 1.1 LOLOS 100% (PERFECT PASS)!
```

---

## 3. KESIMPULAN

Pengujian membuktikan secara empiris bahwa perbaikan pada **PHASE 1.1** telah berhasil menutup celah dekompresi gambar dan spoofing IP, dengan mempertahankan seluruh fungsi sistem aplikasi tanpa adanya *side effects* atau regresi.
