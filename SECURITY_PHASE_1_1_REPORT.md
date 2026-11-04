# LAPORAN REMEDIASI KEAMANAN — PHASE 1.1
## PENUTUPAN RESIDUAL RISKS (SEC-002 & SEC-004)
### PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pelaksanaan:** 4 November 2026
- **Status Tahap:** SELESAI (100% Berhasil Diterapkan & Diverifikasi)
- **Baseline Commit:** `84b56c8` (`docs: add Phase 1 independent verification audit report and register checkpoint`)
- **Master Vulnerability Register:** [SECURITY_MASTER_VULNERABILITY_REGISTER.md](file:///e:/PSU%20siap%20Upload/compro-PSU-main/SECURITY_MASTER_VULNERABILITY_REGISTER.md)
- **Laporan Pengujian Terperinci:** [SECURITY_PHASE_1_1_TEST_REPORT.md](file:///e:/PSU%20siap%20Upload/compro-PSU-main/SECURITY_PHASE_1_1_TEST_REPORT.md)
- **Lead Security Engineer & Auditor:** Senior Application Security & DevSecOps Specialist

---

## 1. RINGKASAN EKSEKUTIF

Sebagai tindak lanjut dari hasil audit verifikasi independen pada laporan `SECURITY_PHASE_1_VERIFICATION_REPORT.md`, tim telah berhasil menutup dua *critical residual security risks* pada aplikasi PT PENILAI STANDAR UJI:

1. **SEC-002 (Image Processing & Decompression Bomb):**
   - Mengintegrasikan library pemrosesan gambar profesional **Sharp** (`v0.35.5`) dengan mesin decoding performa tinggi libvips.
   - Menetapkan batas dimensi maksimum gambar **4096 x 4096 piksel** dan batas total alokasi piksel input maksimum **16 Megapixels (16,777,216 piksel)** untuk memitigasi serangan *pixel flood* dan *decompression bomb*.
   - Menerapkan **re-encoding raster penuh** (JPEG, PNG, WebP) yang merekonstruksi buffer gambar dari awal dan secara otomatis melucuti (*stripping*) seluruh metadata EXIF, IPTC, dan XMP berbahaya.
   - Menghilangkan penyimpanan buffer mentah dari client: buffer asli pengguna **tidak pernah disimpan ke disk**, hanya buffer hasil re-encoding Sharp yang disimpan dengan penamaan acak UUID v4.

2. **SEC-004 (X-Forwarded-For Spoofing & Password Spraying Protection):**
   - Menghapus pembacaan langsung header `X-Forwarded-For` dari request mentah pada fungsi `getClientIp()`.
   - Mengonfigurasikan Express `trust proxy` secara dinamis dan aman melalui variabel lingkungan `TRUST_PROXY` (default: `false` untuk direct connection, atau `loopback` jika berada di balik reverse proxy lokal).
   - Mengimplementasikan **Two-Tier Authentication Rate Limiter**:
     - **Tingkat 1 (Global IP Limiter):** Membatasi akumulasi kegagalan login dari satu alamat IP maksimal 20 kali per 15 menit untuk memblokir serangan *password spraying* (banyak username berbeda dari satu IP).
     - **Tingkat 2 (Per-Account Limiter):** Membatasi kegagalan login terhadap kombinasi IP dan normalized username maksimal 5 kali per 15 menit untuk memblokir serangan *targeted brute-force*.
   - Menyertakan header standar HTTP `Retry-After` pada respons HTTP `429 Too Many Requests`.

---

## 2. DETAIL PERUBAHAN TEKNIS (TASK A, B, C, D)

### 2.1 SEC-002: Secure Raster Image Processing (Task A)
- **Modul Sharp:** Diintegrasikan ke dalam `backend/server.js` dan ditambahkan ke daftar dependensi `backend/package.json` (`"sharp": "^0.35.5"`).
- **Fungsi `processAndReencodeRasterImage(buffer, requestedExt)`:**
  1. **Resource Limit Guard:** Menggunakan opsi Sharp `limitInputPixels: 16 * 1024 * 1024` saat proses inisialisasi decoder untuk membatasi alokasi RAM.
  2. **Dimension Boundary Verification:** Mengekstrak metadata gambar dan memvalidasi `width <= 4096`, `height <= 4096`, dan `width * height <= 16,777,216`.
  3. **Strict Raster Format Validation:** Memastikan format hasil decode adalah `jpeg`, `png`, atau `webp`.
  4. **Bitmap Re-Encoding & Metadata Stripping:**
     - JPEG: Di-reencode dengan encoder MozJPEG teroptimasi (`quality: 85, mozjpeg: true`).
     - PNG: Di-reencode dengan kompresi deflater murni (`compressionLevel: 8`).
     - WebP: Di-reencode dengan format WebP standar (`quality: 85`).
  5. **Auto-Orientation:** Menerapkan `.rotate()` untuk mempertahankan orientasi visual asli foto sebelum metadata EXIF dibersihkan.
  6. **Disk Storage:** Hanya buffer hasil kompresi Sharp (`finalBuffer`) yang dituliskan ke direktori publik `/news/${uuid}.${ext}`.

### 2.2 SEC-004: Anti-IP Spoofing & Trusted Proxy Architecture (Task B)
- **Eliminasi Raw Header Parsing:**
  Kode lama yang rentan terhadap spoofing:
  ```javascript
  // SEBELUMNYA (RENTAN):
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0].trim();
  }
  ```
  Telah diganti dengan mekanisme terproteksi Express:
  ```javascript
  // SETELAH REMEDIASI (AMAN):
  function getClientIp(req) {
    let ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
    if (typeof ip === "string" && ip.startsWith("::ffff:")) {
      ip = ip.slice(7);
    }
    return ip;
  }
  ```
- **Konfigurasi Express `trust proxy`:**
  Nilai disetel dinamis berdasarkan topologi deployment melalui variabel `TRUST_PROXY`:
  - `false` (default): Untuk koneksi langsung tanpa proxy. Header `X-Forwarded-For` diabaikan sepenuhnya oleh Express.
  - `loopback`: Jika backend berjalan di belakang Apache atau Nginx pada server lokal yang sama (`127.0.0.1`).
  - `1`: Jika backend berada di balik satu hop load balancer (misal AWS ALB / Cloudflare).

### 2.3 SEC-004: Two-Tier Rate Limiting & Anti-Password Spraying (Task C)
- **Normalisasi Username:** Seluruh input username dinormalisasi menggunakan `.trim().toLowerCase()`.
- **Dua Tingkat Limit Login:**
  - `auth_ip_${clientIp}`: Mengakumulasi seluruh kegagalan login dari IP yang sama, terlepas dari username yang dicoba. Ambang batas default: **20 kegagalan / 15 menit**.
  - `auth_acc_${clientIp}_${username}`: Mengakumulasi kegagalan login untuk akun spesifik dari IP tersebut. Ambang batas default: **5 kegagalan / 15 menit**.
- **Konfigurasi Fleksibel melalui Environment Variables:**
  - `AUTH_FAIL_LIMIT_ACCOUNT=5`
  - `AUTH_FAIL_LIMIT_IP=20`
  - `AUTH_FAIL_WINDOW_MINUTES=15`
- **Pembersihan Otomatis:** Saat login berhasil (`HTTP 200`), state kegagalan akun pada IP tersebut seketika dihapus (`loginFailuresAccountMap.delete(accountKey)`).

### 2.4 Rate Limiter Deployment Architecture (Task D)
- **Single-Instance Deployment (Kondisi Saat Ini):**
  Menggunakan in-memory `Map` dengan pembersihan otomatis setiap 5 menit menggunakan timer berkarakteristik `.unref()`. Solusi ini memiliki overhead memori mendekati nol, bebas latensi jaringan, dan tidak memerlukan service eksternal tambahan.
- **Multi-Instance / Clustered Deployment (Kesiapan Masa Depan):**
  Untuk arsitektur PM2 cluster, Docker containerized, atau Kubernetes horizontal pod autoscaling, rate limiter dapat dihubungkan ke Redis store (menggunakan perintah atomik `INCR` dan `PEXPIRE` via `ioredis`) tanpa mengubah contract API aplikasi.

---

## 3. BERKAS YANG DIUBAH & DEPENDENSI

| Berkas | Status | Deskripsi Perubahan |
|---|---|---|
| `backend/server.js` | Modifikasi | Integrasi library Sharp, implementasi decoding raster & dimension limits (4096px / 16MP), fungsi `processAndReencodeRasterImage()`, konfigurasi dinamis `trust proxy`, secure `getClientIp()`, dan Two-Tier Rate Limiter. |
| `backend/package.json` | Modifikasi | Menambahkan dependensi produksi `"sharp": "^0.35.5"`. |
| `backend/.env.example` | Modifikasi | Menambahkan dokumentasi konfigurasi `TRUST_PROXY`, `AUTH_FAIL_LIMIT_ACCOUNT`, `AUTH_FAIL_LIMIT_IP`, dan `AUTH_FAIL_WINDOW_MINUTES`. |
| `.env.example` | Modifikasi | Menambahkan dokumentasi variabel konfigurasi rate limiting dan proxy di root. |
| `backend/tests/verify_phase1_1.js` | Berkas Baru | Test suite verifikasi otomatis untuk seluruh kontrol Phase 1.1 (21 skenario). |
| `backend/tests/verify_phase1.js` | Modifikasi | Penyesuaian fixture buffer PNG agar valid secara raster terhadap decoder libpng Sharp. |
| `SECURITY_MASTER_VULNERABILITY_REGISTER.md` | Modifikasi | Pembaruan status SEC-002 dan SEC-004 menjadi **FULLY VERIFIED**. |

---

## 4. HASIL VERIFIKASI PENGUJIAN OTOMATIS

Seluruh 21 skenario pengujian baru yang diuji melalui `node backend/tests/verify_phase1_1.js` menghasilkan tingkat kelulusan **100% (21/21 PASS)**:

- **SEC-002 Image Processing:**
  - JPEG, PNG, WebP valid berhasil diterima & di-reencode.
  - SVG, HTML, dan gambar terkorupsi berhasil ditolak (HTTP 400).
  - Dimensi melampaui batas (4500px) berhasil ditolak (HTTP 400).
  - Decompression bomb (65535x65535 px / >16 MP) berhasil ditolak (HTTP 400).
  - File hasil upload diverifikasi merupakan hasil re-encoding Sharp dengan nama acak UUID v4.
- **SEC-004 Rate Limiting & Anti-Spoofing:**
  - Pemalsuan `X-Forwarded-For` tidak dapat membypass rate limit pada koneksi langsung.
  - Password spraying (banyak username dari satu IP) berhasil diblokir oleh Global Per-IP Limiter.
  - Targeted brute-force terhadap satu akun berhasil diblokir oleh Account-Specific Limiter.
  - Login berhasil mereset penalti akun tanpa false lockout.
  - Respons HTTP 429 menyertakan header `Retry-After`.
- **Regression:** Seluruh fitur login, profil, artikel publik, galeri, dan tracking sertifikat berjalan normal.

Rincian log eksekusi dapat dilihat pada [SECURITY_PHASE_1_1_TEST_REPORT.md](file:///e:/PSU%20siap%20Upload/compro-PSU-main/SECURITY_PHASE_1_1_TEST_REPORT.md).

---

## 5. KESIMPULAN & STOP CONDITION

Dengan selesainya tahap **PHASE 1.1**, dua *critical residual risks* yang sebelumnya teridentifikasi telah tertutup sepenuhnya:
- **SEC-002:** Status naik menjadi **FULLY VERIFIED** (Sharp decoding, dimension boundary, re-encoding, and metadata stripping).
- **SEC-004:** Status naik menjadi **FULLY VERIFIED** (Secure client IP trust, two-tier rate limiter, anti-password spraying).

Sesuai aturan kerja non-negosiasi:
- **TIDAK MEMULAI** Phase 2 atau Phase 3.
- **TIDAK MENJALANKAN** deployment ke production.
- Pekerjaan dihentikan untuk menunggu persetujuan eksplisit dari pihak Pemilik Sistem.

