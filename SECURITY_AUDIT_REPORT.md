# LAPORAN AUDIT KEAMANAN APLIKASI (SECURITY AUDIT REPORT)
**Aplikasi:** PT PENILAI STANDAR UJI (PSU) — Company Profile & Certificate Tracking System  
**Auditor:** Senior Cybersecurity Engineer & Application Security Specialist  
**Tanggal Audit:** 04 November 2026  
**Status Target:** Source Code Audit (SAST, Architecture, Dependency & Configuration Review)  
**Dokumen Referensi:** OWASP Top 10:2021, OWASP API Security Top 10:2023, OWASP ASVS v4.0.3, CWE  

---

## A. EXECUTIVE SUMMARY (RINGKASAN EKSEKUTIF)

Audit keamanan komprehensif telah dilakukan terhadap source code aplikasi web PT Penilai Standar Uji (PSU) yang berlokasi di `E:\PSU siap Upload\compro-PSU-main`. Aplikasi ini terdiri dari:
1. **Backend**: Node.js v18+ dengan Express.js v4.21.1.
2. **Database**: MySQL (didukung driver `mysql2/promise` v3.11.3) dengan in-memory fallback store.
3. **Autentikasi**: Custom JWT (HMAC-SHA256 via modul `crypto`) dan Password Hashing (Scrypt).
4. **Frontend**: React v19.2.8 SPA dengan Vite v8.3.0 dan React Router DOM v7.18.4.

### Ringkasan Status Keamanan

Pemeriksaan Static Application Security Testing (SAST) dan evaluasi arsitektur mengidentifikasi **14 temuan keamanan** yang terverifikasi secara nyata pada source code. 

| Tingkat Keparahan (Severity) | Jumlah Temuan | Status |
| :--- | :---: | :---: |
| **Critical** | 2 | Open |
| **High** | 3 | Open |
| **Medium** | 5 | Open |
| **Low** | 3 | Open |
| **Informational** | 1 | Open |
| **Total Temuan** | **14** | **Memerlukan Remediasi** |

### Evaluasi Risiko Keseluruhan & Kesiapan Produksi
> **KESIMPULAN: BELUM LAYAK UNTUK PRODUCTION (NOT PRODUCTION READY)**  
> Ditemukan kerentanan berkategori **Critical** dan **High** yang memungkinkan:
> 1. Pemalsuan token otentikasi JWT administrator akibat fallback hardcoded secret key (`psu_compro_super_secret_jwt_key_2026_x9A8b7C6d5E4`).
> 2. Akun bawaan (default credentials) yang di-seed otomatis ke database (`admin` / `AdminP***!`).
> 3. Eskalasi hak akses (*Privilege Escalation* / BFLA) di mana akun dengan level `Author` atau `Editor` dapat mendaftarkan akun baru dengan hak `Super Admin`.
> 4. Potensi *Stored Cross-Site Scripting* (XSS) dan *Unrestricted File Upload* melalui upload gambar base64 tanpa pembatasan ekstensi ketat dan tanpa validasi *magic bytes*, yang dapat mengizinkan upload SVG bermuatan JavaScript atau ekstensi berbahaya.
> 5. Ketiadaan *Rate Limiting* pada seluruh endpoint API (khususnya login dan password update), ketiadaan HTTP Security Headers (Helmet), serta CORS wildcard (`*`).

Aplikasi **wajib dilakukan remediasi keamanan** sebelum dipublikasikan ke server production publik.

---

## B. VULNERABILITY SUMMARY (TABEL TEMUAN)

| No | ID | Vulnerability | Severity | CVSS v4.0 | File / Lokasi | Status |
| :---: | :---: | :--- | :---: | :---: | :--- | :---: |
| 1 | **SEC-001** | Hardcoded JWT Secret Key & Default Seed Credentials | **Critical** | 9.3 | `backend/server.js:12-14, 1071-1089` | Open |
| 2 | **SEC-002** | Arbitrary File Upload via Base64 & Stored SVG XSS | **High** | 8.7 | `backend/server.js:1865-1943` | Open |
| 3 | **SEC-003** | Broken Function Level Authorization (Privilege Escalation) | **High** | 8.5 | `backend/server.js:1471-1535` | Open |
| 4 | **SEC-004** | Missing Rate Limiting on Authentication & Sensitive Endpoints | **High** | 7.6 | `backend/server.js:1183, 1383, 1865` | Open |
| 5 | **SEC-005** | Insecure Password Verification Fallback to Plaintext & Timing Attack | **Medium** | 6.8 | `backend/server.js:528-540` | Open |
| 6 | **SEC-006** | Insecure Token Storage in Browser `localStorage` | **Medium** | 6.2 | `company-profile/src/pages/DashboardArtikel.jsx:7, 224, 564` | Open |
| 7 | **SEC-007** | Permissive Cross-Origin Resource Sharing (CORS `*`) & Missing Security Headers | **Medium** | 6.5 | `backend/server.js:16` | Open |
| 8 | **SEC-008** | Missing Token Invalidation & Inactive User Check in Auth Middleware | **Medium** | 6.1 | `backend/server.js:630-643` | Open |
| 9 | **SEC-009** | Verbose Error Messages & Internal Technical Information Disclosure | **Medium** | 5.3 | `backend/server.js:1278, 2897-2905` | Open |
| 10 | **SEC-010** | Unrestricted Request Body Payload Size (DoS Risk via JSON 25MB) | **Low** | 5.1 | `backend/server.js:17` | Open |
| 11 | **SEC-011** | Production Apache `.htaccess` Missing HTTPS Enforcement & Security Headers | **Low** | 4.8 | `htaccess-production.txt:1-40` | Open |
| 12 | **SEC-012** | Directory Traversal Vulnerability in Custom Vite Dev Middleware | **Low** | 4.5 | `company-profile/vite.config.js:16-28` | Open |
| 13 | **SEC-013** | Residual Backup Archives (`dist.zip`, `backend.zip`) in Workspace Root | **Low** | 3.8 | Workspace Root | Open |
| 14 | **SEC-014** | Accidental / Deprecated Dummy Dependency (`init`) in Root `package.json` | **Informational** | 2.5 | `package.json:25` | Open |

---

## C. DETAILED FINDINGS (RINCIAN TEMUAN KEAMANAN)

---

### ID: SEC-001
**Nama Vulnerability:** Hardcoded JWT Secret Key & Default Seed Credentials  
**Severity:** Critical  
**CVSS Score:** 9.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N)  
**CWE / OWASP Reference:** CWE-798 (Use of Hard-coded Credentials), CWE-1188, OWASP Top 10:2021-A07, OWASP API Security:2023-API2  
**File Location:** `backend/server.js:12-14`, `backend/server.js:655-674`, `backend/server.js:1071-1089`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 12-14
const JWT_SECRET =
  process.env.JWT_SECRET || "psu_compro_super_secret_jwt_key_2026_x9A8b7C6d5E4";

// backend/server.js baris 1077-1088 (Seed akun otomatis saat start)
[
  "admin",
  "admin@penilaistandaruji.com",
  hashPassword("AdminPSU2026!"),
  "Administrator Utama PSU",
  "Super Admin",
  "redaksi",
  "redaksi@penilaistandaruji.com",
  hashPassword("RedaksiPSU2026!"),
  "Tim Redaksi & Humas PSU",
  "Editor",
]
```

**Description:**  
Aplikasi mendefinisikan kunci rahasia (*secret key*) tanda tangan JWT secara hardcoded sebagai fallback jika environment variable `JWT_SECRET` tidak tersedia. Selain itu, database secara otomatis melakukan seeding akun administrator dengan kata sandi default statis (`AdminPSU2026!` dan `RedaksiPSU2026!`). Tidak ditemukan file `.env` pada repositori, sehingga secara default aplikasi langsung menggunakan nilai statis tersebut.

**Security Impact:**  
1. Siapapun yang memperoleh atau membaca source code dapat membuat tanda tangan token JWT palsu secara offline dengan payload `{"role": "Super Admin", "username": "admin"}` dan menandatanganinya menggunakan secret key tersebut. Token tersebut akan diterima sah oleh server (`verifyJwt`).
2. Penyerang dapat langsung melakukan pengambilalihan akun (*account takeover*) administratif penuh pada server production dengan mencoba kredensial default yang telah terdokumentasi.

**Evidence:**  
Verifikasi variabel `JWT_SECRET` pada baris 12-14 menunjukkan string fallback eksplisit. Pemeriksaan file direktori membuktikan tidak adanya `.env`, dan database seed pada baris 1073-1089 menginjeksi password hash yang dihasilkan dari string statis.

**Recommendation:**  
1. Wajibkan server untuk berhenti berjalan (*fail-closed*) saat startup jika `process.env.JWT_SECRET` belum disetel atau panjangnya kurang dari 32 karakter acak. Jangan pernah menggunakan nilai fallback statis.
2. Hapus proses auto-seeding kredensial default dengan password statis ke dalam database. Gunakan skrip migrasi CLI interaktif atau generator acak saat inisialisasi awal server.
3. Buat file `.env.example` sebagai panduan konfigurasi variabel lingkungan yang aman.

**Secure Code Example:**
```javascript
// backend/server.js
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("FATAL ERROR: JWT_SECRET environment variable is missing or insecure (< 32 chars).");
  process.exit(1);
}
```

**Verification:**  
Hapus atau kosongkan variabel lingkungan `JWT_SECRET`, lalu jalankan `node backend/server.js`. Pastikan aplikasi menolak untuk beroperasi dan keluar dengan kode error `1`.

---

### ID: SEC-002
**Nama Vulnerability:** Arbitrary File Upload via Base64 & Stored SVG XSS  
**Severity:** High  
**CVSS Score:** 8.7 (CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:L/SC:H/SI:H/SA:N)  
**CWE / OWASP Reference:** CWE-434 (Unrestricted Upload of File with Dangerous Type), CWE-79 (Cross-Site Scripting - Stored), OWASP Top 10:2021-A03  
**File Location:** `backend/server.js:1865-1943`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 1875-1895
const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
if (!matches) {
  return res.status(400).json({ success: false, message: "Data base64 gambar tidak valid." });
}

let ext = matches[1].toLowerCase();
if (ext === "jpeg") ext = "jpg";
if (ext === "svg+xml") ext = "svg";
const base64Data = matches[2];
const buffer = Buffer.from(base64Data, "base64");

const rawBaseName = path.basename(filename || "berita", path.extname(filename || ""));
const safeBase = slugifyTitle(rawBaseName) || "berita";
const finalName = `${safeBase}-${Date.now()}.${ext}`;

fs.mkdirSync(publicNewsDir, { recursive: true });
fs.writeFileSync(path.join(publicNewsDir, finalName), buffer);
```

**Description:**  
Endpoint `/api/upload-gambar` menerima data base64 dengan pola regex `/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/`. 
Celah ini memiliki 3 kelemahan mendasar:
1. Regex mengizinkan nilai MIME type apapun setelah `data:image/` (misalnya `data:image/html`, `data:image/php`, `data:image/svg+xml`). Ekstensi file yang disimpan langsung mengambil pecahan string tersebut (`finalName = safeBase + '.' + ext`).
2. Format `svg` diperbolehkan secara eksplisit (`ext === "svg+xml"` diubah menjadi `svg`). Format SVG adalah format berbasis XML yang mendukung tag `<script>` dan event handler JavaScript (`onload`). File disimpan dan disajikan langsung melalui Express static handler (`/news`).
3. Tidak ada pemeriksaan tanda tangan biner file (*magic bytes / file signature*) untuk memverifikasi apakah isi buffer biner benar-benar file gambar valid.

**Security Impact:**  
1. **Stored XSS**: Pengguna mengunggah file SVG yang berisi JavaScript jahat. Ketika administrator atau pengunjung membuka tautan file tersebut di `/news/file.svg`, skrip dieksekusi di origin domain aplikasi, memungkinkan pencurian data atau session token.
2. **File Masquerading / RCE**: Jika aplikasi dideploy pada server web Apache dengan PHP aktif (sebagaimana dirujuk oleh file `htaccess-production.txt`), pengunggahan file dengan manipulasi MIME type dapat menyimpan script server-side di direktori publik.

**Evidence:**  
Regex pada baris 1875 tidak melakukan allowlist ekstensi. Baris 1885 mengubah `svg+xml` menjadi `svg` dan menyimpannya ke `publicNewsDir` yang disajikan statis tanpa header `Content-Security-Policy: default-src 'none'` atau `Content-Disposition: attachment`.

**Recommendation:**  
1. Terapkan *strict allowlist* hanya untuk ekstensi gambar raster yang aman: `jpg`, `jpeg`, `png`, `webp`. Tolak format `svg`, `html`, dan skrip lainnya.
2. Validasi *magic bytes* (tanda tangan byte awal) dari buffer biner sebelum menyimpan file:
   - JPEG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A`
   - WebP: `52 49 46 46 ... 57 45 42 50`
3. Berikan nama file acak menggunakan UUID v4 kriptografis (jangan mempertahankan ekstensi atau nama dari input pengguna tanpa sanitasi).
4. Konfigurasikan header `Content-Disposition: inline` atau `attachment` serta hilangkan eksekusi skrip pada folder upload.

**Secure Code Example:**
```javascript
// backend/server.js
const ALLOWED_MIME = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function isValidImageBuffer(buf, ext) {
  if (ext === "jpg" && buf.length > 3) {
    return buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF;
  }
  if (ext === "png" && buf.length > 8) {
    return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47;
  }
  if (ext === "webp" && buf.length > 12) {
    return buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP";
  }
  return false;
}

// Pada route /api/upload-gambar:
const mimeMatch = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/);
if (!mimeMatch) {
  return res.status(400).json({ success: false, message: "Hanya format JPG, PNG, atau WEBP yang diizinkan." });
}

const mimeType = mimeMatch[1];
const ext = ALLOWED_MIME[mimeType];
const buffer = Buffer.from(mimeMatch[2], "base64");

if (!isValidImageBuffer(buffer, ext)) {
  return res.status(400).json({ success: false, message: "Header biner file gambar tidak valid." });
}

const safeUniqueName = `${crypto.randomUUID()}.${ext}`;
fs.writeFileSync(path.join(publicNewsDir, safeUniqueName), buffer);
```

**Verification:**  
Kirim request POST ke `/api/upload-gambar` dengan payload `dataUrl: "data:image/svg+xml;base64,...<script>alert(1)</script>..."`. Pastikan server menolak dengan HTTP 400.

---

### ID: SEC-003
**Nama Vulnerability:** Broken Function Level Authorization (BFLA) / Privilege Escalation  
**Severity:** High  
**CVSS Score:** 8.5 (CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:H/VI:H/VA:N/SC:H/SI:H/SA:N)  
**CWE / OWASP Reference:** CWE-285 (Improper Authorization), OWASP Top 10:2021-A01, OWASP API Security:2023-API5  
**File Location:** `backend/server.js:1471-1535` (`app.post("/api/admin/users")`) & `backend/server.js:1450-1469` (`app.get("/api/admin/users")`)  

**Vulnerable Code:**
```javascript
// backend/server.js baris 1471-1483
app.post("/api/admin/users", requireAdminAuth, async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body || {};
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({ success: false, message: "..." });
    }

    const cleanRole = ["Super Admin", "Editor", "Author"].includes(role) ? role : "Editor";
    const passHash = hashPassword(password);
    // Langsung insert admin_users tanpa mengecek apakah req.adminUser.role === 'Super Admin'
```

**Description:**  
Endpoint untuk membuat pengguna baru (`POST /api/admin/users`) dan melihat daftar seluruh admin (`GET /api/admin/users`) hanya diproteksi dengan middleware `requireAdminAuth`. Middleware ini memverifikasi keabsahan JWT, tetapi **tidak melakukan verifikasi level hak akses (role-based access control / RBAC)** terhadap pengguna yang sedang memanggil endpoint. Akibatnya, setiap pengguna terotentikasi—termasuk yang memiliki peran terendah seperti `Author` atau `Editor`—dapat membuat akun baru dengan hak akses `Super Admin`.

**Security Impact:**  
Eskalasi hak akses penuh (*horizontal and vertical privilege escalation*). Pengguna yang hanya memiliki hak tulis artikel dapat menaikkan haknya menjadi administrator sistem tertinggi, memanipulasi profil pengguna lain, atau menghapus artikel secara sembarangan.

**Evidence:**  
Pada baris 1471 tidak terdapat kondisional pengecekan `if (req.adminUser.role !== 'Super Admin') return res.status(403)`. Objek `role` dari body request pengguna langsung dimasukkan ke database pada baris 1488.

**Recommendation:**  
Buat middleware otorisasi berbasis peran (misalnya `requireRole("Super Admin")`) dan pasang pada endpoint administratif tingkat tinggi (`/api/admin/users`, penghapusan galeri permanen, dsb).

**Secure Code Example:**
```javascript
// backend/server.js
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.adminUser || !allowedRoles.includes(req.adminUser.role)) {
      return res.status(403).json({
        success: false,
        message: "Akses terlarang. Anda tidak memiliki izin untuk tindakan ini.",
      });
    }
    next();
  };
}

// Terapkan pada route:
app.get("/api/admin/users", requireAdminAuth, requireRole("Super Admin"), async (req, res) => { ... });
app.post("/api/admin/users", requireAdminAuth, requireRole("Super Admin"), async (req, res) => { ... });
```

**Verification:**  
Login menggunakan akun dengan role `Author` atau `Editor`. Kirim request `POST /api/admin/users` untuk membuat akun `Super Admin`. Pastikan sistem menolak dengan HTTP 403 Forbidden.

---

### ID: SEC-004
**Nama Vulnerability:** Missing Rate Limiting on Authentication & Sensitive Endpoints  
**Severity:** High  
**CVSS Score:** 7.6 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:H/VA:L/SC:L/SI:L/SA:N)  
**CWE / OWASP Reference:** CWE-307 (Improper Restriction of Excessive Authentication Attempts), OWASP Top 10:2021-A07, OWASP API Security:2023-API4  
**File Location:** `backend/server.js:1183` (`/api/auth/login`), `backend/server.js:1383` (`/api/auth/password`), `backend/server.js:2845` (`/api/sertifikat/:submenu`)  

**Vulnerable Code:**
```javascript
// backend/server.js baris 1183
app.post("/api/auth/login", async (req, res) => {
  // Tidak ada pembatasan frekuensi request (rate limit) atau pelacakan IP gagal login
  ...
});
```

**Description:**  
Tidak terdapat mekanisme pembatasan frekuensi percobaan (*rate limiting*) pada seluruh endpoint aplikasi. Endpoint autentikasi `/api/auth/login` dan pengubahan kata sandi `/api/auth/password` dapat dikirimi ribuan request per detik tanpa adanya mekanisme perlambatan (*throttling*), CAPTCHA, maupun pemblokiran IP sementara.

**Security Impact:**  
1. Serangan *Brute Force* dan *Credential Stuffing* terhadap akun administrator. Penyerang dapat melakukan tebak kata sandi menggunakan daftar *wordlist* (misalnya rockyou.txt) secara otomatis hingga menemukan kata sandi yang valid.
2. Serangan enumerasi nomor sertifikat pelanggan pada `/api/sertifikat/:submenu`.
3. Potensi Denial of Service (DoS) pada database MySQL akibat lonjakan query autentikasi.

**Evidence:**  
Pemeriksaan `backend/package.json` menunjukkan tidak adanya library rate limiting seperti `express-rate-limit`. File `server.js` tidak mengimplementasikan middleware pembatas request sebelum handler login.

**Recommendation:**  
Gunakan modul `express-rate-limit` untuk membatasi percobaan login maksimal 5 kali dalam periode 15 menit per alamat IP, serta batasi request publik umum maksimal 100 request per menit.

**Secure Code Example:**
```javascript
// backend/server.js
const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 5, // Maksimal 5 percobaan gagal per IP
  message: {
    success: false,
    message: "Terlalu banyak percobaan login gagal. Silakan coba lagi setelah 15 menit.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.post("/api/auth/login", loginLimiter, async (req, res) => { ... });
```

**Verification:**  
Jalankan pengujian terkendali dengan mengirim 6 request login salah berturut-turut ke `/api/auth/login`. Pastikan request ke-6 mengembalikan status HTTP 429 Too Many Requests.

---

### ID: SEC-005
**Nama Vulnerability:** Insecure Password Verification Fallback to Plaintext & Timing Attack  
**Severity:** Medium  
**CVSS Score:** 6.8 (CVSS:4.0/AV:N/AC:H/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:L/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-256 (Plaintext Storage of a Password), CWE-208 (Observable Timing Discrepancy), OWASP Top 10:2021-A02  
**File Location:** `backend/server.js:528-540`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 528-540
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
  return String(plainPassword) === storedHash; // <-- Fallback perbandingan plaintext tanpa timingSafeEqual
}
```

**Description:**  
Fungsi `verifyPassword` memiliki fallback logic `return String(plainPassword) === storedHash;`. Jika field `password_hash` pada tabel database berisi teks yang tidak berawalan `scrypt:` (misalnya jika administrator memasukkan data secara manual atau data terkorupsi), sistem akan mengizinkan autentikasi berbasis plaintext murni. Selain itu, operator `===` rentan terhadap *string comparison timing attacks*.

**Security Impact:**  
Jika penyerang berhasil melakukan manipulasi data di database atau mendapati baris dengan kata sandi plaintext, sistem menerima login tanpa hashing. Operator `===` juga memberikan celah analisis perbedaan waktu eksekusi (*side-channel timing leak*).

**Evidence:**  
Baris 539 secara eksplisit mengembalikan `String(plainPassword) === storedHash`.

**Recommendation:**  
Hapus fallback perbandingan plaintext. Wajibkan semua nilai kata sandi di database menggunakan format hash standar yang valid (misalnya `scrypt:` atau gunakan `bcrypt`/`argon2`). Jika format tidak valid, langsung tolak verifikasi secara konsisten.

**Secure Code Example:**
```javascript
// backend/server.js
function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== "string" || !storedHash.startsWith("scrypt:")) {
    return false;
  }
  const parts = storedHash.split(":");
  if (parts.length !== 3) return false;
  const [, salt, keyHex] = parts;
  try {
    const keyBuf = Buffer.from(keyHex, "hex");
    const derived = crypto.scryptSync(String(plainPassword), salt, keyBuf.length);
    return crypto.timingSafeEqual(derived, keyBuf);
  } catch {
    return false;
  }
}
```

**Verification:**  
Uji fungsi `verifyPassword("rahasia", "rahasia")`. Pastikan mengembalikan `false` dan menolak kata sandi non-hash.

---

### ID: SEC-006
**Nama Vulnerability:** Insecure Token Storage in Browser `localStorage`  
**Severity:** Medium  
**CVSS Score:** 6.2 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:H/VI:L/VA:N/SC:L/SI:L/SA:N)  
**CWE / OWASP Reference:** CWE-922 (Insecure Storage of Sensitive Information), OWASP Top 10:2021-A07, OWASP ASVS v4.0.3 Chapter 3  
**File Location:** `company-profile/src/pages/DashboardArtikel.jsx:7, 224, 376, 564`  

**Vulnerable Code:**
```javascript
// company-profile/src/pages/DashboardArtikel.jsx baris 7, 224, 564
const TOKEN_STORAGE_KEY = "psu_admin_jwt_token";
const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || "");
...
localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);
```

**Description:**  
Frontend React menyimpan token sesi login admin (JWT) di dalam `window.localStorage`. Objek `localStorage` dapat diakses oleh skrip JavaScript apapun yang berjalan di origin yang sama. Jika terjadi celah Cross-Site Scripting (XSS) (misalnya melalui file SVG terunggah atau injeksi konten), skrip pihak ketiga yang disusupkan dapat membaca isi `localStorage` dan mencuri token JWT administrator.

**Security Impact:**  
Pencurian token administratif (*Session Hijacking*). Penyerang dapat menggunakan token yang dicuri untuk mengakses API backend tanpa sepengetahuan korban hingga masa berlaku token habis.

**Evidence:**  
Pemeriksaan baris 7, 224, dan 564 pada `DashboardArtikel.jsx` membuktikan penyimpanan token dilakukan melalui `localStorage.setItem(TOKEN_STORAGE_KEY, ...)`.

**Recommendation:**  
Ubah mekanisme transmisi token JWT dari respons JSON menjadi cookie HTTP dengan atribut `HttpOnly; Secure; SameSite=Strict`. Cookie `HttpOnly` kebal terhadap pembacaan via JavaScript di browser (`document.cookie` tidak dapat mengaksesnya).

**Secure Code Example:**
```javascript
// backend/server.js saat login berhasil:
res.cookie("admin_token", token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 8 * 3600 * 1000,
});
return res.json({ success: true, message: "Login berhasil." });
```

**Verification:**  
Jalankan perintah `localStorage.getItem("psu_admin_jwt_token")` pada browser Developer Tools Console saat login. Pastikan token tidak disimpan lagi di `localStorage`.

---

### ID: SEC-007
**Nama Vulnerability:** Permissive Cross-Origin Resource Sharing (CORS `*`) & Missing Security Headers  
**Severity:** Medium  
**CVSS Score:** 6.5 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N)  
**CWE / OWASP Reference:** CWE-942 (Permissive Cross-Domain Policy with Wildcard), CWE-1021, CWE-693, OWASP Top 10:2021-A05  
**File Location:** `backend/server.js:16`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 16
app.use(cors());
```

**Description:**  
Konfigurasi `app.use(cors())` tanpa argumen mengizinkan semua domain asal (`Access-Control-Allow-Origin: *`) untuk melakukan request ke backend API. Selain itu, backend tidak menggunakan middleware pengamanan header seperti `helmet`, sehingga header-header pertahanan dasar browser tidak disetel:
- Tidak ada `X-Frame-Options` atau `Content-Security-Policy: frame-ancestors` (rentan terhadap Clickjacking).
- Tidak ada `X-Content-Type-Options: nosniff` (rentan terhadap MIME sniffing).
- Tidak ada `Strict-Transport-Security` (HSTS).
- Tidak ada `Referrer-Policy`.

**Security Impact:**  
1. Aplikasi rentan terhadap serangan Clickjacking di mana halaman dashboard artikel dapat disematkan ke dalam `<iframe>` di situs jebakan penyerang.
2. Kebocoran data API ke situs pihak ketiga via cross-origin fetch.
3. Potensi eksploitasi MIME sniffing terhadap aset yang diunggah.

**Evidence:**  
Baris 16 `server.js` hanya memanggil `cors()`. Tidak ditemukan modul `helmet` pada `backend/package.json`.

**Recommendation:**  
1. Pasang modul `helmet` untuk mengaktifkan seluruh HTTP security headers esensial.
2. Batasi origin CORS hanya untuk domain resmi yang diizinkan (misalnya `https://penilaistandaruji.com` dan `http://localhost:5173` pada mode development).

**Secure Code Example:**
```javascript
// backend/server.js
const helmet = require("helmet");

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://penilaistandaruji.com")
  .split(",")
  .map(o => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Akses CORS ditolak oleh kebijakan keamanan."));
  },
  credentials: true,
}));
```

**Verification:**  
Kirim request HTTP `curl -I http://127.0.0.1:5000/`. Periksa keberadaan header `X-Frame-Options: SAMEORIGIN`, `X-Content-Type-Options: nosniff`, dan pembatasan origin pada `Access-Control-Allow-Origin`.

---

### ID: SEC-008
**Nama Vulnerability:** Missing Token Invalidation & Inactive User Check in Auth Middleware  
**Severity:** Medium  
**CVSS Score:** 6.1 (CVSS:4.0/AV:N/AC:L/AT:N/PR:L/UI:N/VC:L/VI:H/VA:N/SC:L/SI:L/SA:N)  
**CWE / OWASP Reference:** CWE-613 (Insufficient Session Expiration), OWASP Top 10:2021-A01, OWASP API Security:2023-API2  
**File Location:** `backend/server.js:630-643`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 630-643
function requireAdminAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyJwt(token);
    req.adminUser = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ ... });
  }
}
```

**Description:**  
Middleware `requireAdminAuth` hanya mengecek validitas kriptografis tanda tangan token JWT dan waktu kedaluwarsa (`exp`). Middleware **tidak melakukan pengecekan ke database** untuk memastikan apakah:
1. Akun pengguna masih berstatus aktif (`is_active = 1`).
2. Akun pengguna belum dihapus dari sistem.
3. Kata sandi akun belum diubah sejak token diterbitkan.
4. Token belum dimasukkan ke dalam daftar pencabutan (*revocation blacklist*) saat logout.

**Security Impact:**  
Jika akun seorang administrator dinonaktifkan (`is_active = 0`) atau dipecat oleh Super Admin, token JWT yang sebelumnya dipegang oleh administrator tersebut tetap dapat digunakan untuk mengakses dan mengubah artikel hingga 8 jam ke depan (`JWT_EXPIRES_IN = "8h"`).

**Evidence:**  
Pada baris 630-643 tidak terdapat pemanggilan query database atau cache session state.

**Recommendation:**  
Pada `requireAdminAuth`, jika database terhubung, lakukan query cepat untuk memvalidasi bahwa `id` pengguna yang tercantum di token masih ada dan berstatus `is_active = 1`. Sediakan mekanisme pencabutan token (misalnya menyimpan cap waktu `password_changed_at` di database dan menolak token yang memiliki `iat < password_changed_at`).

**Secure Code Example:**
```javascript
// backend/server.js
async function requireAdminAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyJwt(token);

    if (dbConnected && pool) {
      const [rows] = await pool.execute(
        "SELECT id, username, email, full_name, role, is_active FROM admin_users WHERE id = ? LIMIT 1",
        [decoded.sub]
      );
      if (rows.length === 0 || rows[0].is_active !== 1) {
        return res.status(401).json({
          success: false,
          unauthorized: true,
          message: "Akun Anda telah dinonaktifkan atau tidak ditemukan.",
        });
      }
      req.adminUser = { ...decoded, ...rows[0] };
    } else {
      req.adminUser = decoded;
    }

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      unauthorized: true,
      message: err.message || "Akses ditolak.",
    });
  }
}
```

**Verification:**  
Login untuk mendapatkan token, ubah `is_active = 0` pada akun tersebut di tabel `admin_users`, lalu kirim request ke `/api/admin/stats` membawa token tadi. Pastikan server menolak dengan HTTP 401.

---

### ID: SEC-009
**Nama Vulnerability:** Verbose Error Messages & Internal Technical Information Disclosure  
**Severity:** Medium  
**CVSS Score:** 5.3 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:L/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-209 (Generation of Error Message Containing Sensitive Information), OWASP Top 10:2021-A05  
**File Location:** `backend/server.js:1278, 1378, 1445, 1532, 1860, 2897-2905`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 2896-2905
} catch (error) {
  console.error("Database query error:", error.message);
  return res.status(500).json({
    success: false,
    message:
      "Gagal terhubung ke database MySQL (" +
      error.message +
      "). Pastikan MySQL di XAMPP sudah Start.",
    error: error.message,
  });
}
```

**Description:**  
Ketika terjadi exception pada backend, aplikasi mengembalikan string `error.message` secara mentah ke dalam payload JSON HTTP 500, termasuk detail teknis lingkungan internal seperti "Pastikan MySQL di XAMPP sudah Start", nama tabel database, maupun pesan driver SQL.

**Security Impact:**  
Informasi internal infrastruktur dan stack teknologi bocor ke pihak publik (*Reconnaissance / Information Gathering*), mempermudah penyerang dalam merancang payload serangan yang spesifik terhadap versi perangkat lunak atau lingkungan server.

**Evidence:**  
Pemeriksaan blok `catch` pada baris 1281, 1378, 1445, 1532, dan 2901 membuktikan objek `error: error.message` dikirimkan langsung ke klien.

**Recommendation:**  
Gunakan pesan kesalahan umum (*generic error message*) untuk respons HTTP ke klien publik. Simpan detail teknis kesalahan dan stack trace hanya pada log server internal.

**Secure Code Example:**
```javascript
// backend/server.js
} catch (error) {
  console.error("[ERROR INTERNAL]:", error);
  return res.status(500).json({
    success: false,
    message: "Terjadi kesalahan internal pada server. Silakan hubungi administrator.",
  });
}
```

**Verification:**  
Matikan service database MySQL dan panggil endpoint `/api/sertifikat/kalibrasi?no_sertifikat=123`. Periksa apakah pesan teknis XAMPP dan SQL driver hilang dari respons JSON.

---

### ID: SEC-010
**Nama Vulnerability:** Unrestricted Request Body Payload Size (DoS Risk via JSON 25MB)  
**Severity:** Low  
**CVSS Score:** 5.1 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:N/VI:N/VA:L/SC:N/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-400 (Uncontrolled Resource Consumption), OWASP Top 10:2021-A04  
**File Location:** `backend/server.js:17`  

**Vulnerable Code:**
```javascript
// backend/server.js baris 17
app.use(express.json({ limit: "25mb" }));
```

**Description:**  
Middleware `express.json` disetel dengan batas parsing body sebesar `25mb` secara global untuk seluruh route. Ukuran ini dialokasikan untuk mengakomodasi upload gambar via base64, namun diterapkan ke seluruh request endpoint (termasuk login, search, dan artikel update).

**Security Impact:**  
Penyerang dapat mengirimkan request POST JSON berulang kali dengan payload string berukuran 25MB ke endpoint publik (misalnya login). Parsing JSON berukuran besar membebani CPU Node.js yang bersifat single-threaded, menyebabkan penurunan performa drastis atau out-of-memory crash (*Application-level Denial of Service*).

**Evidence:**  
Baris 17 `server.js` menunjukkan deklarasi global `express.json({ limit: "25mb" })`.

**Recommendation:**  
Batasi `express.json` global pada batas wajar (misalnya `1mb` atau `2mb`). Terapkan batas yang lebih besar (`10mb`) hanya secara spesifik pada route `/api/upload-gambar`.

**Secure Code Example:**
```javascript
// backend/server.js
app.use(express.json({ limit: "1mb" }));

// Khusus untuk route upload gambar:
app.post("/api/upload-gambar", requireAdminAuth, express.json({ limit: "10mb" }), async (req, res) => { ... });
```

**Verification:**  
Kirim request POST ke `/api/auth/login` dengan body berukuran 2MB. Pastikan server menolak dengan HTTP 413 Payload Too Large.

---

### ID: SEC-011
**Nama Vulnerability:** Production Apache `.htaccess` Missing HTTPS Enforcement & Security Headers  
**Severity:** Low  
**CVSS Score:** 4.8 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:A/VC:L/VI:L/VA:N/SC:L/SI:L/SA:N)  
**CWE / OWASP Reference:** CWE-319 (Cleartext Transmission of Sensitive Information), CWE-693  
**File Location:** `htaccess-production.txt:1-40`  

**Vulnerable Code:**
```apache
# htaccess-production.txt
Options -Indexes
DirectoryIndex index.html

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /
  RewriteRule ^api(/|$) - [L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^news/(.*)$ /api/news/$1 [L]
RewriteRule ^ index.html [L]
</IfModule>
```

**Description:**  
File konfigurasi produksi web server Apache (`htaccess-production.txt`) yang disiapkan untuk domain publik:
1. Tidak memiliki konfigurasi *force rewrite* dari HTTP ke HTTPS.
2. Tidak memblokir akses ke file sensitif tersembunyi (seperti `.env`, `.git`).
3. Tidak menyetel security headers web server (`HSTS`, `X-Content-Type-Options`, `X-Frame-Options`).

**Security Impact:**  
Jika pengguna membuka situs melalui protokol tidak terenkripsi (`http://`), transmisi data kredensial login dan konten artikel dapat disadap oleh penyerang di jaringan yang sama (*Man-in-the-Middle / Sniffing*).

**Evidence:**  
File `htaccess-production.txt` tidak memuat aturan `RewriteCond %{HTTPS} off` maupun direktif `<IfModule mod_headers.c>`.

**Recommendation:**  
Tambahkan pengalihan otomatis ke HTTPS, perlindungan file tersembunyi, dan penyetelan header keamanan pada file `.htaccess`.

**Secure Code Example:**
```apache
# htaccess-production.txt
Options -Indexes
DirectoryIndex index.html

# 1. Lindungi file sensitif / dotfiles
<FilesMatch "^\.|\.json$|\.lock$|\.md$|\.sql$|\.zip$">
  Require all denied
</FilesMatch>

<IfModule mod_rewrite.c>
RewriteEngine On
RewriteBase /

# 2. Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

RewriteRule ^api(/|$) - [L]
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^news/(.*)$ /api/news/$1 [L]
RewriteRule ^ index.html [L]
</IfModule>

<IfModule mod_headers.c>
  Header always set X-Frame-Options "SAMEORIGIN"
  Header always set X-Content-Type-Options "nosniff"
  Header always set Referrer-Policy "strict-origin-when-cross-origin"
  Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
</IfModule>
```

**Verification:**  
Deploy ke web server staging dan panggil URL via `http://`. Pastikan browser dialihkan secara otomatis ke `https://` dengan kode status 301.

---

### ID: SEC-012
**Nama Vulnerability:** Directory Traversal Vulnerability in Custom Vite Dev Middleware  
**Severity:** Low  
**CVSS Score:** 4.5 (CVSS:4.0/AV:N/AC:H/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:L/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-22 (Improper Limitation of a Pathname to a Restricted Directory - Path Traversal)  
**File Location:** `company-profile/vite.config.js:16-28`  

**Vulnerable Code:**
```javascript
// company-profile/vite.config.js baris 16-28
const [pathname, query] = req.url.split('?')
const decodedPath = decodeURIComponent(pathname)
if (/\.(png|jpe?g)$/i.test(decodedPath)) {
  const exactFile = path.join(__dirname, 'public', decodedPath)
  if (!fs.existsSync(exactFile)) {
    const webpRelative = decodedPath.replace(/\.(png|jpe?g)$/i, '.webp')
    const webpFile = path.join(__dirname, 'public', webpRelative)
    if (fs.existsSync(webpFile)) {
      req.url = encodeURI(webpRelative) + (query ? `?${query}` : '')
    }
  }
}
```

**Description:**  
Plugin kustom Vite `publicWebpFallbackPlugin` mengambil `decodedPath` langsung dari URL tanpa validasi apakah jalur hasil penggabungan berada di dalam direktori `public/`. Jalur seperti `/../../../something.png` digabungkan menggunakan `path.join(__dirname, 'public', decodedPath)`, memungkinkan traversi keluar direktori untuk melakukan uji keberadaan file (`fs.existsSync`).

**Security Impact:**  
Meskipun hanya aktif pada server pengembangan (*development server*), hal ini dapat dimanfaatkan penyerang di jaringan lokal untuk melakukan enumerasi keberadaan file (*file existence probing*) pada sistem host pengembang.

**Evidence:**  
Baris 19 tidak melakukan perbandingan `exactFile.startsWith(publicDir)`.

**Recommendation:**  
Pastikan jalur yang dinormalisasi selalu diawali dengan direktori root publik (`path.resolve`).

**Secure Code Example:**
```javascript
// company-profile/vite.config.js
const publicRoot = path.resolve(__dirname, 'public')
const exactFile = path.resolve(publicRoot, '.' + decodedPath)
if (!exactFile.startsWith(publicRoot)) {
  return next()
}
```

**Verification:**  
Request URL `http://localhost:5173/../../../../package.json.png` pada dev server dan pastikan jalur ditolak sebelum evaluasi file system.

---

### ID: SEC-013
**Nama Vulnerability:** Residual Backup Archives (`dist.zip`, `backend.zip`) in Workspace Root  
**Severity:** Low  
**CVSS Score:** 3.8 (CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-538 (Insertion of Sensitive Information into Externally Accessible File)  
**File Location:** Workspace Root (`dist.zip` 73 MB, `backend.zip` 40 KB)  

**Description:**  
Terdapat file arsip terkompresi `dist.zip` dan `backend.zip` langsung di root folder proyek. Dalam banyak skenario deployment shared-hosting (cPanel) atau git push, file arsip backup di root web sering kali ikut terunggah ke direktori publik (`public_html`).

**Security Impact:**  
Jika terunggah ke web root, penyerang dapat mengunduh seluruh source code backend dan database schema secara utuh hanya dengan mengakses `https://domain.com/backend.zip`.

**Evidence:**  
Listing root direktori mendeteksi file `backend.zip` (40,605 bytes) dan `dist.zip` (73,270,856 bytes).

**Recommendation:**  
Hapus file arsip zip dari repositori aktif. Masukkan pola `*.zip`, `*.tar.gz`, `*.bak`, `*.sql` ke dalam `.gitignore` untuk mencegah terunggahnya file backup ke server produksi.

**Verification:**  
Pastikan file zip dihapus dari workspace dan perintah `git status` tidak mencantumkan file arsip.

---

### ID: SEC-014
**Nama Vulnerability:** Accidental / Deprecated Dummy Dependency (`init`) in Root `package.json`  
**Severity:** Informational  
**CVSS Score:** 2.5 (CVSS:4.0/AV:L/AC:H/AT:N/PR:N/UI:N/VC:L/VI:N/VA:N/SC:N/SI:N/SA:N)  
**CWE / OWASP Reference:** CWE-1357 (Reliance on Uncontrolled Component)  
**File Location:** `package.json:25`  

**Description:**  
File root `package.json` memuat dependency `"init": "^0.1.2"`. Paket ini merupakan paket kosong/tidak terpakai yang umumnya terpasang akibat salah ketik saat menjalankan perintah npm (`npm install init` alih-alih `npm init`). Paket ini tidak digunakan oleh kode manapun.

**Security Impact:**  
Menambah jejak dependency yang tidak perlu (*supply-chain attack surface*). Paket tidak terawat dapat sewaktu-waktu diambil alih (*account takeover*) di registry npm.

**Evidence:**  
Pemeriksaan baris 25 root `package.json` menunjukkan dependency `"init": "^0.1.2"`. Pencarian kode membuktikan paket tidak diimpor di file manapun.

**Recommendation:**  
Hapus dependency `"init"` dari root `package.json` dan jalankan `npm prune`.

---

## D. SECURITY IMPROVEMENT PLAN (RENCANA PERBAIKAN BERDASARKAN PRIORITAS)

```
[ CRITICAL ] -> Perbaikan Segera Sebelum Testing Lebih Lanjut
  ├── SEC-001: Pindahkan JWT_SECRET ke .env & hapus default credentials hardcoded
  └── Wajibkan proses fail-closed jika JWT_SECRET tidak aman (< 32 karakter)

[ HIGH ] -> Perbaikan Prioritas Tinggi (Tahap 1 Sprint)
  ├── SEC-002: Terapkan allowlist ekstensi (jpg/png/webp) & validasi magic bytes pada upload
  ├── SEC-003: Tambahkan middleware Role-Based Access Control (RBAC) pada route admin
  └── SEC-004: Pasang express-rate-limit pada endpoint login, password, dan upload

[ MEDIUM ] -> Perbaikan Terjadwal (Tahap 2 Sprint)
  ├── SEC-005: Hilangkan fallback plaintext pada fungsi verifikasi password
  ├── SEC-006: Migrasikan penyimpanan JWT dari localStorage ke HttpOnly Cookies
  ├── SEC-007: Pasang library Helmet dan batasi CORS origin secara eksplisit
  ├── SEC-008: Validasi is_active pengguna di middleware autentikasi backend
  └── SEC-009: Bersihkan pesan error teknis SQL/XAMPP dari respons API

[ LOW & INFORMATIONAL ] -> Peningkatan Keamanan Tambahan & Kebersihan Repositori
  ├── SEC-010: Batasi express.json global menjadi 1MB (25MB khusus upload saja)
  ├── SEC-011: Perbarui .htaccess dengan proteksi HTTPS, headers, dan penolakan file sensitif
  ├── SEC-012: Perbaiki path traversal pada plugin fallback Vite dev
  ├── SEC-013: Bersihkan file arsip backend.zip dan dist.zip dari root
  └── SEC-014: Hapus dependency tidak terpakai 'init' dari package.json
```

---

## E. SECURITY HARDENING CHECKLIST

### 1. Backend Node.js & Express
- [ ] Pasang dan konfigurasikan `helmet` dengan CSP dan proteksi frame.
- [ ] Batasi body parser global (`express.json({ limit: '1mb' })`).
- [ ] Pasang `express-rate-limit` pada seluruh endpoint publik dan autentikasi.
- [ ] Hilangkan seluruh pesan `error.message` internal dari respons HTTP 500.
- [ ] Implementasikan centralized error handling middleware.

### 2. Autentikasi & Otorisasi
- [ ] Gunakan secret key JWT acak minimal 32 karakter via environment variable.
- [ ] Tolak startup aplikasi jika `JWT_SECRET` kosong.
- [ ] Buat middleware `requireRole('Super Admin')` untuk endpoint manajemen akun.
- [ ] Verifikasi status akun aktif (`is_active = 1`) pada setiap request terotentikasi.
- [ ] Hapus semua akun default statis pada file seed/migrasi.
- [ ] Hapus perbandingan kata sandi plaintext dan gunakan algoritma hashing yang konsisten.

### 3. Frontend React
- [ ] Pindahkan penyimpanan token dari `localStorage` ke `HttpOnly` Secure Cookies.
- [ ] Pertahankan tidak digunakannya `dangerouslySetInnerHTML` pada konten pengguna.
- [ ] Pastikan seluruh tautan eksternal mempertahankan `rel="noopener noreferrer"`.
- [ ] Hindari pengeksposan API key atau rahasia sensitif dalam build bundle frontend.

### 4. File Upload & Media Storage
- [ ] Batasi ekstensi yang diizinkan hanya: `.jpg`, `.jpeg`, `.png`, `.webp`.
- [ ] Larang keras pengunggahan file `.svg`, `.html`, `.php`, `.js`.
- [ ] Validasi *magic bytes* biner gambar sebelum disimpan ke disk.
- [ ] Berikan nama file acak menggunakan UUID v4.
- [ ] Tambahkan header `X-Content-Type-Options: nosniff` saat menyajikan file statis.

### 5. Database MySQL
- [ ] Pastikan user database bukan `root` tanpa password di lingkungan produksi.
- [ ] Gunakan least privilege principle untuk user database web.
- [ ] Pertahankan parameterized query (`pool.execute(query, params)`) untuk mencegah SQL Injection.
- [ ] Buat indeks pada kolom yang sering dicari (`no_sertifikat`, `slug`, `username`).

### 6. Infrastruktur & Deployment Produksi
- [ ] Terapkan konfigurasi HTTPS wajib dengan sertifikat SSL/TLS valid.
- [ ] Terapkan aturan RewriteCond HTTPS di `.htaccess`.
- [ ] Blokir akses web langsung ke file `.env`, `.git`, `.sql`, dan `.zip`.
- [ ] Hapus file arsip backup (`backend.zip`, `dist.zip`) dari server web.
- [ ] Hapus dependency tidak terpakai dari `package.json`.

---

## F. KESIMPULAN & KESIAPAN PRODUKSI (FINAL SECURITY ASSESSMENT)

| Komponen Audit | Status Kesiapan | Catatan |
| :--- | :---: | :--- |
| **Backend API Security** | **RISIKO TINGGI** | Celah BFLA, ketiadaan rate limit, dan CORS wildcard. |
| **Autentikasi & Sesi** | **KRITIS** | JWT secret hardcoded dan password default statis di database seed. |
| **File Upload Handling** | **RISIKO TINGGI** | Celah upload format berisiko (SVG) tanpa verifikasi magic bytes. |
| **Frontend React Security** | **SEDANG** | Token di localStorage, namun sanitasi teks sudah relatif baik. |
| **Database Query Security** | **BAIK** | Query menggunakan parameterized statements (`pool.execute`). |
| **Server Configuration** | **SEDANG** | Perlu penambahan security headers dan HTTPS enforcement. |

### Rekomendasi Tindakan Akhir:
Aplikasi **BELUM SIAP DIPUBLIKASIKAN KE PRODUCTION**. Manajemen disarankan untuk menyetujui pelaksanaan patch remediasi kode keamanan sesuai urutan prioritas di atas sebelum aplikasi diluncurkan ke domain publik PT Penilai Standar Uji.

---
*Laporan ini disusun secara objektif berdasarkan audit statis source code aplikasi.*

