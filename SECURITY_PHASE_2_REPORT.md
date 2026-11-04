# LAPORAN REMEDIASI KEAMANAN — PHASE 2
## PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pelaksanaan:** 4 November 2026
- **Status Tahapan:** **PHASE 2 SELESAI (100% TERVERIFIKASI)**
- **Baseline Git:** Commit `e7f2118` (Phase 1.3.1)
- **Komponen Terdampak:** `backend/server.js`, `backend/scripts/create-admin.js`, `company-profile/src/pages/DashboardArtikel.jsx`
- **Suite Pengujian:** `backend/tests/verify_phase2.js` (31 Pengujian, 100% PASS)
- **Regresi Kumulatif:** 124 / 124 Pengujian Otomatis Lolos (Phase 1 + 1.1 + 1.2 + 1.3 + 1.3.1 + Phase 2)

---

## 1. RINGKASAN EKSEKUTIF

Sesuai instruksi pada *Master Prompt Security Remediation Phase 1.3.1 + Phase 2*, implementasi perbaikan keamanan pada **PHASE 2 (Application Security Hardening)** telah berhasil diselesaikan secara menyeluruh tanpa mengubah arsitektur aplikasi, database produksi, atau workflow sertifikasi.

Fokus utama Phase 2 adalah menutup kerentanan keamanan tingkat aplikasi yang mencakup autentikasi, manajemen sesi browser, otorisasi dinamis, sanitasi input terhadap Stored XSS, serta pengerasan antarmuka Cross-Origin Resource Sharing (CORS):

| ID Temuan | Kategori OWASP | Kerentanan Sebelum Remediasi | Status Phase 2 | Ringkasan Tindakan Perbaikan |
|---|---|---|---|---|
| **SEC-005** | Broken Authentication / SQLi | 1. Fallback verifikasi password plaintext (`plainPassword === storedHash`).<br>2. Parameter tracking sertifikat rentan prototype pollution & input tak terbatas. | **VERIFIED** | 1. Fallback plaintext dihapus; hanya format `scrypt:<salt>:<hex>` yang diterima.<br>2. `TABLE_MAP` dibekukan (`Object.freeze`); validasi `hasOwnProperty`; nomor sertifikat dibatasi 100 karakter dan menolak null bytes (`\0`). |
| **SEC-008** | Broken Authorization / Session Management | Token JWT tetap berlaku hingga masa kedaluwarsa (`exp`) meskipun akun admin telah dinonaktifkan (`is_active = 0`) atau peran diturunkan. Tidak ada mekanisme pembatalan sesi (revocation). | **VERIFIED** | 1. Implementasi kolom dan properti `token_version` pada database dan fallback store.<br>2. Middleware `requireAdminAuth` memverifikasi status `is_active` (tolak dengan 403 Forbidden) dan `token_version` (tolak dengan 401 Unauthorized / tokenRevoked).<br>3. Inkrementasi `token_version` otomatis saat logout, ubah password, dan penonaktifan akun. |
| **SEC-006** | Insecure Session Management | Token JWT disimpan di browser `localStorage`, rentan pencurian token melalui serangan Cross-Site Scripting (XSS). | **VERIFIED** | 1. Migrasi sesi browser ke `HttpOnly`, `SameSite=Lax`, `Path=/` Cookie (`psu_auth_token`).<br>2. Browser login (`X-Auth-Client: browser`) tidak mengembalikan token di JSON response.<br>3. `localStorage.removeItem(TOKEN_STORAGE_KEY)` dan seluruh penyimpanan token di browser dihapus total.<br>4. Proteksi CSRF ganda (Double-Submit Cookie `psu_csrf_token` + Origin Whitelist Header).<br>5. Endpoint `POST /api/auth/logout` membersihkan cookies dan membatalkan `token_version`. |
| **SEC-007** | Stored XSS & Permissive CORS | 1. Konten artikel menerima raw HTML tanpa sanitasi tag `<script>`, `<iframe>`, dan atribut event handler `on*`.<br>2. Konfigurasi `app.use(cors())` membuka origin wildcard (`*`) bagi seluruh domain eksternal. | **VERIFIED** | 1. Implementasi fungsi sanitasi `sanitizeHtmlContent` (membuang script, iframe, embed, object, event handlers `on*`, dan protokol `javascript:`) serta `sanitizePlainText` untuk judul & kutipan.<br>2. Konfigurasi CORS ketat berbasis URL-parsed origin whitelist (`ALLOWED_ORIGIN_SET`) dengan `credentials: true`. Origin liar ditolak tanpa header CORS. |

---

## 2. DETAIL TEKNIS REMEDIASI

### 2.1 SEC-005: Eliminasi Fallback Plaintext & Pengerasan Tracker Sertifikat

#### A. Penghapusan Plaintext Password Comparison
Pada implementasi sebelumnya di [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L876-L890):
```javascript
// SEBELUM:
function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  if (storedHash.startsWith("scrypt:")) {
    // ... scrypt verification ...
  }
  return String(plainPassword) === storedHash; // <-- VULNERABILITY: Fallback plaintext!
}

// SESUDAH (REMEDIASI SEC-005):
function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, keyHex] = parts;
    const derived = crypto.scryptSync(String(plainPassword), salt, 64);
    const keyBuf = Buffer.from(keyHex, "hex");
    if (derived.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(derived, keyBuf);
  }
  // SEC-005 Remediasi: Tolak seluruh komparasi password plaintext (Fail Closed)
  return false;
}
```

#### B. Pengerasan Parameter Submenu & Nomor Sertifikat
Pada endpoint `GET /api/sertifikat/:submenu` di [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L4180-L4240):
1. `TABLE_MAP` dibekukan menggunakan `Object.freeze`:
   ```javascript
   const TABLE_MAP = Object.freeze({
     "sertifikasi-produk": "sertifikat_produk",
     pengujian: "sertifikat_pengujian",
     kalibrasi: "sertifikat_kalibrasi",
     "sertifikasi-sistem-manajemen": "sertifikat_sistem_manajemen",
   });
   ```
2. Validasi submenu mencegah prototype pollution:
   ```javascript
   if (
     typeof submenu !== "string" ||
     !Object.prototype.hasOwnProperty.call(TABLE_MAP, submenu)
   ) {
     return res.status(400).json({ success: false, message: "Kategori sub menu client tidak valid." });
   }
   ```
3. Sanitasi & validasi input `no_sertifikat`:
   - Validasi string non-kosong: wajib diisi.
   - Pembatasan panjang maksimum: maksimal 100 karakter.
   - Penolakan karakter kontrol dan null byte (`/[\x00-\x1f\x7f]/`).
   - Query tetap menggunakan parameterized query (`?`) pada prepared statement MySQL.

---

### 2.2 SEC-008: Validasi Akun Aktif & Token Revocation via Token Versioning

#### A. Skema Database & In-Memory Store
1. Kolom `token_version INT NOT NULL DEFAULT 1` ditambahkan ke definisi tabel `admin_users`.
2. Migrasi otomatis dieksekusi saat inisialisasi:
   ```sql
   ALTER TABLE admin_users ADD COLUMN token_version INT NOT NULL DEFAULT 1 AFTER is_active;
   ```
3. In-memory fallback store (`loadFallbackUsers`) memastikan seluruh akun memiliki nilai default `token_version: 1`.

#### B. Real-Time Verification pada Middleware Autentikasi
Middleware `requireAdminAuth` diubah menjadi asynchronous dan melakukan verifikasi status pengguna langsung ke basis data atau fallback store:
```javascript
async function requireAdminAuth(req, res, next) {
  try {
    const { token, source } = extractToken(req);
    // ... verifikasi tanda tangan dan exp JWT ...
    const decoded = verifyJwt(token);

    // Ambil data akun terkini dari DB / Fallback Store
    let userRecord = /* query admin_users */;

    if (!userRecord) {
      return res.status(401).json({ success: false, unauthorized: true, message: "Akun pengguna tidak ditemukan." });
    }

    // 1. Blokir instan akun yang dinonaktifkan (HTTP 403 Forbidden)
    if (Number(userRecord.is_active) === 0) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: "Akun administrator ini telah dinonaktifkan.",
      });
    }

    // 2. Token Revocation Check: Validasi token_version di JWT vs DB (HTTP 401 Unauthorized)
    const currentTokenVersion = typeof userRecord.token_version === "number" ? userRecord.token_version : 1;
    const tokenVersionInJwt = typeof decoded.token_version === "number" ? decoded.token_version : 1;

    if (tokenVersionInJwt !== currentTokenVersion) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        tokenRevoked: true,
        message: "Sesi login telah dibatalkan atau kedaluwarsa. Silakan login kembali.",
      });
    }

    // 3. Hak akses peran (role) selalu terikat pada state terbaru database
    req.adminUser = {
      ...decoded,
      role: userRecord.role,
      is_active: userRecord.is_active,
      token_version: currentTokenVersion,
      authSource: source,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ success: false, unauthorized: true, message: err.message });
  }
}
```

#### C. Titik Pemicu Inkrementasi Token Version
- **Ganti Password (`PUT /api/auth/password`):** Inkrementasi `token_version = token_version + 1` membatalkan seluruh sesi login yang ada di perangkat lain secara instan. Sesi saat ini diberikan token baru dengan versi terbaru.
- **Logout (`POST /api/auth/logout`):** Inkrementasi `token_version = token_version + 1` pada database dan penghapusan cookie sesi di sisi client.
- **Kelola Status Akun (`PATCH /api/admin/users/:id/status`):** Ketika Super Admin menonaktifkan akun atau mengubah status, `token_version` dinaikkan sehingga token yang sedang dipegang pengguna langsung tidak berlaku.

---

### 2.3 SEC-006: Eliminasi Token di LocalStorage, HttpOnly Cookie & Anti-CSRF

#### A. Dual Authentication & Cookie Setting
Pada [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L2145-L2200):
1. Saat client browser melakukan login dengan mengirimkan header `X-Auth-Client: browser`:
   - Backend menetapkan cookie `psu_auth_token` dengan atribut: `HttpOnly; Path=/; SameSite=Lax; Max-Age=28800`.
   - Backend menetapkan cookie `psu_csrf_token` dengan atribut: `Path=/; SameSite=Lax; Max-Age=28800` (dapat dibaca oleh client script untuk disematkan pada header permintaan mutasi).
   - Backend secara tegas **TIDAK menyertakan properti `token` dalam JSON response body** untuk browser client.
2. Untuk klien integrasi non-browser (skrip CLI, automated testing), backend tetap mengembalikan properti `token` dalam JSON demi backward compatibility.

#### B. Proteksi Anti-CSRF (Double-Submit Token & Origin Validation)
Middleware `csrfProtection` di [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L295-L350):
1. Diterapkan pada metode mutasi state: `POST`, `PUT`, `PATCH`, `DELETE` (dikecualikan untuk endpoint publik `/api/auth/login`).
2. Jika permintaan membawa cookie sesi `psu_auth_token`:
   - Header `X-CSRF-Token` dicocokkan dengan cookie `psu_csrf_token` menggunakan `crypto.timingSafeEqual`.
   - Header `Origin` divalidasi terhadap `ALLOWED_ORIGIN_SET`.
   - Jika CSRF token hilang atau tidak cocok, permintaan ditolak dengan HTTP 403 Forbidden.

#### C. Penyesuaian Frontend React (DashboardArtikel.jsx)
Pada [company-profile/src/pages/DashboardArtikel.jsx](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/src/pages/DashboardArtikel.jsx):
1. `const TOKEN_STORAGE_KEY` dan seluruh pemanggilan `localStorage.setItem(TOKEN_STORAGE_KEY, ...)` dihapus total.
2. Fungsi `apiRequest` diperbarui dengan:
   - `credentials: "include"` pada pemanggilan `fetch` untuk selalu menyertakan HttpOnly cookie.
   - Header `X-Auth-Client: "browser"`.
   - Pembacaan cookie `psu_csrf_token` dan penyematan otomatis ke header `X-CSRF-Token` pada metode mutasi state (`POST`, `PUT`, `PATCH`, `DELETE`).
3. Pada saat halaman pertama kali dimuat, `useEffect` memverifikasi sesi melalui `GET /api/auth/me` (credentials include). Jika valid, dashboard langsung aktif; jika tidak valid, form login ditampilkan.
4. Fungsi `handleLogout` memanggil endpoint backend `POST /api/auth/logout`, membersihkan state React, dan menghapus cache identitas non-sensitif di localStorage (`USER_STORAGE_KEY`).

---

### 2.4 SEC-007: Sanitasi Input Anti-Stored XSS & Strict Origin Whitelist CORS

#### A. Sanitasi Input Konten HTML & Plain Text
Implementasi fungsi sanitasi pada [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L920-L980):
1. `sanitizeHtmlContent(htmlInput)`:
   - Membuang tag script dan dangerous containers: `<script>`, `<style>`, `<iframe>`, `<object>`, `<embed>`, `<applet>`, `<meta>`, `<link>`, `<base>`, `<form>`, `<input>`, `<button>`, `<textarea>` beserta seluruh konten di dalamnya.
   - Membuang seluruh atribut event handler JavaScript: `on[a-z0-9_-]+` (seperti `onerror=`, `onload=`, `onclick=`, `onmouseover=`, `onfocus=`).
   - Menetralkan skema pseudo-protocol pada atribut link dan media: `javascript:`, `vbscript:`, serta `data:` (selain `data:image/`).
2. `sanitizePlainText(textInput)`:
   - Membuang seluruh tag HTML pada field berbasis teks murni (seperti `title_id`, `title_en`, `excerpt_id`, `excerpt_en`).
3. Diterapkan langsung pada handler `POST /api/artikel` dan `PUT /api/artikel/:identifier`.

#### B. Strict Origin Whitelist CORS
Pada [backend/server.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L215-L270):
1. Mengganti konfigurasi permisif `app.use(cors())` dengan origin whitelist eksplisit:
   ```javascript
   const DEFAULT_ALLOWED_ORIGINS = [
     "http://localhost:5173",
     "http://127.0.0.1:5173",
     "http://localhost:5000",
     "http://127.0.0.1:5000",
     "https://penilaistandaruji.com",
     "https://www.penilaistandaruji.com",
   ];
   ```
2. Mengizinkan penambahan origin dinamis melalui variabel environment `ALLOWED_ORIGINS` (dipisahkan koma).
3. Mendukung `credentials: true` secara aman. Jika origin yang meminta tidak terdaftar dalam whitelist, server tidak mengirimkan header `Access-Control-Allow-Origin`, sehingga browser secara otomatis memblokir respons lintas-origin.

---

## 3. HASIL VERIFIKASI PENGUJIAN OTOMATIS

Suite pengujian independen baru dibangun di [backend/tests/verify_phase2.js](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase2.js) dengan hasil eksekusi sebagai berikut:

```
====================================================================
PT PENILAI STANDAR UJI (PSU) — VERIFIKASI KEAMANAN PHASE 2
Application Security Hardening & Vulnerability Remediation
====================================================================

--- [SEC-005] Verifikasi Password Verification & Certificate Tracker Hardening ---
[PASS] SEC-005-01: Fungsi verifyPassword menolak komparasi plaintext password secara mutlak (Fail-Closed)
[PASS] SEC-005-02: Fungsi verifyPassword menolak format hash non-scrypt, string kosong, atau null
[PASS] SEC-005-03: Fungsi verifyPassword memverifikasi scrypt hash sah dengan timing-safe equality
[PASS] SEC-005-04: TABLE_MAP dibekukan secara permanen (Object.isFrozen === true)
[PASS] SEC-005-05: Endpoint sertifikat menolak submenu yang tidak sah atau manipulasi prototype (HTTP 400)
[PASS] SEC-005-06: Endpoint sertifikat menolak parameter nomor sertifikat kosong (HTTP 400)
[PASS] SEC-005-07: Endpoint sertifikat menolak nomor sertifikat melampaui batas maksimal 100 karakter (HTTP 400)
[PASS] SEC-005-08: Endpoint sertifikat menolak karakter terlarang / null bytes (HTTP 400)

--- [SEC-008] Verifikasi Penolakan Akun Nonaktif & Token Revocation ---
[PASS] SEC-008-01: Akun aktif dengan token_version valid berhasil mengakses /api/auth/me (HTTP 200)
[PASS] SEC-008-02: Akun yang dinonaktifkan (is_active = 0) langsung DITOLAK mengakses API (HTTP 403 Forbidden)
[PASS] SEC-008-03: Token lama dengan token_version usang langsung DITOLAK (HTTP 401 Unauthorized / tokenRevoked)
[PASS] SEC-008-04: Token baru dengan token_version mutakhir (v2) berhasil mengakses API secara normal
[PASS] SEC-008-05: Perubahan hak akses peran (role) langsung berlaku real-time tanpa menunggu token kedaluwarsa (HTTP 403)

--- [SEC-006] Verifikasi HttpOnly Cookie Authentication & CSRF Protection ---
[PASS] SEC-006-01: Browser Login menerbitkan psu_auth_token sebagai HttpOnly cookie dan psu_csrf_token
[PASS] SEC-006-02: Browser Login TIDAK mengembalikan token di JSON response (mencegah penyimpanan di localStorage)
[PASS] SEC-006-03: Non-browser API login tetap menyediakan token di JSON untuk kompatibilitas CLI & automated tests
[PASS] SEC-006-04: Permintaan mutasi (POST) dengan cookie autentikasi TANPA X-CSRF-Token DITOLAK (HTTP 403 Forbidden)
[PASS] SEC-006-05: Permintaan mutasi dengan X-CSRF-Token palsu / mismatch DITOLAK (HTTP 403 Forbidden)
[PASS] SEC-006-06: Permintaan mutasi dengan cookie auth dan X-CSRF-Token valid DITERIMA (HTTP 201 Created)
[PASS] SEC-006-07: Endpoint POST /api/auth/logout membersihkan cookie psu_auth_token dan membatalkan sesi

--- [SEC-007] Verifikasi Sanitasi HTML Stored XSS & Strict CORS ---
[PASS] SEC-007-01: Fungsi sanitizeHtmlContent membuang tag <script> beserta seluruh isinya
[PASS] SEC-007-02: Fungsi sanitizeHtmlContent membuang atribut event handler (onerror, onload, onclick)
[PASS] SEC-007-03: Fungsi sanitizeHtmlContent menetralkan link dengan protokol javascript: menjadi href='#'
[PASS] SEC-007-04: Fungsi sanitizeHtmlContent membuang tag dangerous framing (iframe, embed, object)
[PASS] SEC-007-05: Fungsi sanitizePlainText membuang seluruh tag HTML pada field judul dan kutipan
[PASS] SEC-007-06: Endpoint POST /api/artikel secara otomatis membersihkan muatan Stored XSS sebelum disimpan
[PASS] SEC-007-07: Origin terdaftar (http://localhost:5173) diizinkan oleh CORS dengan Access-Control-Allow-Credentials: true
[PASS] SEC-007-08: Origin tidak dikenal (https://evil-attacker.com) DITOLAK CORS (Access-Control-Allow-Origin tidak disetel)

--- [REGRESSION] Integritas Layanan Aplikasi PT PENILAI STANDAR UJI ---
[PASS] REG-02-01: Endpoint publik /api/artikel berjalan lancar tanpa regresi (HTTP 200)
[PASS] REG-02-02: Endpoint publik /api/galeri berjalan lancar tanpa regresi (HTTP 200)
[PASS] REG-02-03: Endpoint statistik dashboard /api/admin/stats berjalan lancar (HTTP 200)

====================================================================
PHASE 2 SECURITY REMEDIATION VERIFICATION SUMMARY
====================================================================
Total Pengujian Phase 2 : 31
Lolos (PASS)            : 31
Gagal (FAIL)            : 0

[VERIFICATION SUCCESS] SELURUH PENGUJIAN KEAMANAN PHASE 2 LOLOS DENGAN SEMPURNA (100% PASS)!
```

### 3.1 Ringkasan Regresi Kumulatif Seluruh Proyek
Seluruh suite pengujian dari tahap sebelumnya dijalankan kembali untuk menjamin zero regression:
1. `backend/tests/verify_phase1.js`     : **21 / 21 PASS (100%)**
2. `backend/tests/verify_phase1_1.js`   : **21 / 21 PASS (100%)**
3. `backend/tests/verify_phase1_2.js`   : **12 / 12 PASS (100%)**
4. `backend/tests/verify_phase1_3.js`   : **25 / 25 PASS (100%)**
5. `backend/tests/verify_phase1_3_1.js` : **14 / 14 PASS (100%)**
6. `backend/tests/verify_phase2.js`     : **31 / 31 PASS (100%)**
--------------------------------------------------------------------
**TOTAL KUMULATIF KESELURUHAN**        : **124 / 124 PASS (100% SUCCESS, ZERO REGRESSION)**

---

## 4. DAFTAR BERKAS YANG DIUBAH / DIBUAT

1. `backend/server.js`:
   - Implementasi strict origin whitelist CORS dengan credentials support.
   - Middleware cookie parser & CSRF validation (`csrfProtection`).
   - Pembekuan `TABLE_MAP` (`Object.freeze`) & validasi `hasOwnProperty`.
   - Eliminasi plaintext password comparison pada `verifyPassword`.
   - Penambahan fungsi sanitasi `sanitizeHtmlContent` dan `sanitizePlainText`.
   - Pembaruan skema `admin_users` dengan kolom `token_version` dan migrasi alter otomatis.
   - Pengecekan real-time `is_active` dan `token_version` pada `requireAdminAuth`.
   - Penyematan HttpOnly cookie dan CSRF token pada `POST /api/auth/login`.
   - Penambahan endpoint `POST /api/auth/logout`.
   - Inkrementasi `token_version` pada `PUT /api/auth/password` dan penerbitan sesi baru.
   - Penambahan endpoint `PATCH /api/admin/users/:id/status` dan `DELETE /api/admin/users/:id`.
   - Sanitasi input pada `POST /api/artikel` dan `PUT /api/artikel/:identifier`.
   - Pengerasan validasi input pada `GET /api/sertifikat/:submenu`.
2. `backend/scripts/create-admin.js`:
   - Penambahan kolom `token_version: 1` saat membuat admin via MySQL maupun fallback store.
3. `company-profile/src/pages/DashboardArtikel.jsx`:
   - Penambahan helper `getCookie`.
   - Penyesuaian `apiRequest` dengan `credentials: "include"`, `X-Auth-Client: "browser"`, dan penyematan header `X-CSRF-Token`.
   - Penghapusan `TOKEN_STORAGE_KEY` dan pembacaan/penulisan token ke `localStorage`.
   - Penyesuaian `verifySession`, `handleLogin`, dan `handleLogout` berbasis cookie.
4. `backend/tests/verify_phase2.js`:
   - Berkas suite pengujian otomatis Phase 2 (31 pengujian mencakup SEC-005, SEC-008, SEC-006, SEC-007).
5. `SECURITY_PHASE_2_REPORT.md`:
   - Berkas laporan remediasi teknis Phase 2 (dokumen ini).
6. `SECURITY_PHASE_2_TEST_REPORT.md`:
   - Berkas laporan bukti pengujian teknis detail Phase 2.
7. `SECURITY_MASTER_VULNERABILITY_REGISTER.md`:
   - Pembaruan status rekonsiliasi temuan master (SEC-005, SEC-006, SEC-007, SEC-008 diperbarui ke status **VERIFIED**).

---

## 5. STATUS KERENTANAN SISA (REMAINING RISKS)

Sesuai pembagian batasan instruksi, **Phase 3 (Medium & Low Hardening)** ditangguhkan dan menunggu instruksi persetujuan selanjutnya:
- `SEC-009`: Error message disclosure & HTTP security headers (Helmet CSP/HSTS).
- `SEC-010`: JSON payload limit per endpoint (DoS reduction).
- `SEC-011`: Apache `.htaccess` HTTPS enforcement & security headers di cPanel.
- `SEC-012`: Vite dev server path traversal protection.
- `SEC-013`: Residual backup archives cleanup & source map disabling.
- `SEC-014`: Dependency hygiene & deprecation cleanup.

Implementasi Phase 2 telah selesai 100% dengan status terverifikasi penuh pada level kode sumber.
