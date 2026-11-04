# SECURITY PHASE 3 SCOPE RECONCILIATION & REGISTER CORRECTION
## PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Document Version:** 1.0 (Mandatory Reconciliation Addendum)
- **Date:** 4 November 2026
- **Auditor Role:** Senior Cybersecurity Engineer & Application Security Auditor
- **Status:** Baseline Reconciled & Frozen for Phase 3 Planning

---

## 1. LATAR BELAKANG & ANALISIS DISKREPANSI

Dalam penyusunan ringkasan draft roadmap Phase 3 sebelumnya, teridentifikasi adanya pergeseran pelabelan ID dan pengelompokan temuan yang tidak sinkron dengan baseline awal pada `SECURITY_AUDIT_REPORT.md`:

1. **Pergeseran SEC-013:** Pada draf sebelumnya, SEC-013 dilabeli *"Dependency Vulnerabilities & Deprecated Packages"*, padahal pada baseline asli SEC-013 adalah *"Residual Backup Archives (`dist.zip`, `backend.zip`) in Workspace Root & Source Map Exposure"*.
2. **Penggantian SEC-014:** Pada draf sebelumnya, SEC-014 digantikan dengan *"Production Logging, Error Handling & Health Monitoring"*, padahal pada baseline asli SEC-014 adalah *"Accidental / Deprecated Dummy Dependency (`init`) in Root package.json & Vulnerable Frontend Packages"*.
3. **Pencampuran Scope Tambahan:** Kebutuhan operasional mengenai logging terstruktur dan health check endpoint sebelumnya belum memiliki identitas terpisah, sehingga berisiko menimpa temuan kerentanan asli.

Dokumen rekonsiliasi ini diterbitkan untuk memastikan seluruh ID temuan asli tetap utuh, deskripsi akurat, dan tidak ada temuan awal yang tereliminasi.

---

## 2. TABEL MAPPING SEBELUM DAN SESUDAH REKONSILIASI

Berikut adalah perbandingan pemetaan (*mapping*) sebelum dan sesudah rekonsiliasi:

```
+--------------------------------------------------------------------------------------------------------------------+
|                                      MAPPING COMPARISON (BEFORE vs AFTER)                                          |
+--------------------------------------------------------------------------------------------------------------------+
| Finding ID | Previous Draft Label (Non-Compliant)      | Reconciled Authoritative Baseline Label (Compliant)       |
+--------------------------------------------------------------------------------------------------------------------+
| SEC-009    | Missing Security Headers (Helmet, CSP)    | Verbose Error Messages, SQL Disclosure & Security Headers |
| SEC-010    | Unrestricted Body Parser Limit (50MB DoS) | Unrestricted Body Parser Payload Limit (25MB DoS Risk)    |
| SEC-011    | Apache Server Configuration Hardening     | Production Apache .htaccess Hardening & HTTPS Enforcement |
| SEC-012    | Vite Path Traversal Risk                  | Vite Custom Dev Middleware Path Traversal                 |
| SEC-013    | Dependency Vulnerabilities (Shifted!)     | Residual Backup Archives & Source Map Exposure (Restored!)|
| SEC-014    | Production Logging & Health (Overwritten!)| Deprecated Dependency 'init' & Frontend Audit (Restored!) |
| NEW-001    | (Not separated / Mixed into SEC-014)      | Production Operational Logging & Health Monitoring        |
| WP-3.8     | (Not explicitly mapped in early draft)    | SEC-007 AST Allowlist Sanitizer (Residual DiD)            |
+--------------------------------------------------------------------------------------------------------------------+
```

---

## 3. DEMARKASI SCOPE: SEC-009 VS NEW-001

Untuk menghindari duplikasi dan menjaga kejelasan implementasi teknis:

- **SEC-009 (Security & Confidentiality Boundary):**
  - Berfokus pada penolakan kebocoran informasi teknis internal ke client melalui HTTP responses (sanitasi SQL syntax error, stack trace redaction, pesan error generik).
  - Berfokus pada pertahanan sisi browser melalui HTTP Security Headers (`helmet`, CSP, HSTS, X-Content-Type-Options, Referrer-Policy).
- **NEW-001 (Operational Reliability & Monitoring Boundary):**
  - Berfokus pada logging terstruktur sisi server (console/file logging untuk analisis audit operasional: IP terverifikasi, route, response status, duration) dengan filter masking data sensitif (password, JWT token tidak boleh tercatat).
  - Berfokus pada penyediaan endpoint monitoring status aplikasi (`/api/health`) yang terisolasi dan aman untuk pemantauan uptime server.

Pemisahan ini memastikan SEC-009 dan NEW-001 saling melengkapi tanpa tumpang tindih (*zero duplication*), serta tidak mengorbankan SEC-014.

---

## 4. VALIDASI SCOPE RINCI PHASE 3 (WORK PACKAGES 3.1 s/d 3.8)

Setiap item pekerjaan Phase 3 kini telah divalidasi memiliki spesifikasi lengkap:

### WP-3.1 — SEC-009: Verbose Errors, SQL Disclosure & Security Headers
- **Severity:** Medium (CVSS 5.3)
- **Affected Component:** `backend/server.js:1278, 2897-2905, 3340-3350`
- **Remediation Plan:**
  - Sanitasi response error database di seluruh route; implementasikan global centralized error handler yang menyaring seluruh detail teknis database dan server-side stack trace.
  - Integrasikan `helmet` untuk menyuntikkan HTTP security headers esensial: `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, dan `Permissions-Policy`.
  - **Kebijakan CSP:** Mulai dengan `Content-Security-Policy-Report-Only` jika kompatibilitas runtime belum terbukti. Enforcement penuh hanya dilakukan setelah inventarisasi resource eksternal dan compatibility regression test. Hindari `'unsafe-inline'`/`'unsafe-eval'` kecuali ada kebutuhan teknis terbukti.
  - **Kebijakan HSTS:** Header `Strict-Transport-Security` **hanya dikirimkan pada respon HTTPS terverifikasi** (`req.secure || req.headers['x-forwarded-proto'] === 'https'`). Dilarang mewajibkan HSTS pada development HTTP. Dilarang menggunakan `includeSubDomains` atau `preload` tanpa verifikasi menyeluruh pada seluruh subdomain produksi.
- **Test Plan:** Trigger simulated database error -> assert generic error response tanpa stack trace atau SQL tokens; periksa headers HTTP respons via assertions; verifikasi HSTS tidak muncul pada koneksi development HTTP murni.
- **Residual Risk:** Minimal setelah CSP Report-Only dievaluasi.

### WP-3.2 — SEC-010: Global JSON Parser Body Limit Reduction
- **Severity:** Low (CVSS 5.1)
- **Affected Component:** `backend/server.js:32`
- **Remediation Plan:** Turunkan parser global `express.json({ limit: '1mb' })` dan `express.urlencoded({ limit: '1mb' })`. Batas upload besar (hingga 5MB) hanya diterapkan pada route upload media via Multer streaming dengan memory guard.
- **Test Plan:** Kirim JSON payload 2MB -> assert HTTP 413 Payload Too Large; kirim upload gambar valid -> assert diterima normal.
- **Residual Risk:** Minimal.

### WP-3.3 — SEC-011: Apache `.htaccess` Security Hardening & Cloudflare Topology Alignment
- **Severity:** Low (CVSS 4.8)
- **Affected Component:** `public/.htaccess`, `htaccess-production.txt:1-40`
- **Remediation Plan:**
  - **Dokumentasi Topologi & Mitigasi Redirect Loop:**
    - Pada hosting cPanel + Apache + Passenger dengan potensi Cloudflare reverse proxy:
      - Cloudflare Flexible SSL: Browser -> CF (HTTPS), CF -> Origin Apache (HTTP).
      - Cloudflare Full / Full Strict: Browser -> CF (HTTPS), CF -> Origin Apache (HTTPS).
    - Jika aturan `.htaccess` melakukan redirect HTTPS naif (`RewriteCond %{HTTPS} off`), maka pada Cloudflare Flexible mode akan memicu **infinite redirect loop (ERR_TOO_MANY_REDIRECTS)**.
    - Konfigurasi Apache `.htaccess` wajib memvalidasi forwarded headers:
      ```apache
      RewriteCond %{HTTPS} off
      RewriteCond %{HTTP:X-Forwarded-Proto} !https
      RewriteCond %{HTTP:CF-Visitor} !'"scheme":"https"'
      RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
      ```
  - Blokir akses publik ke file sensitif (`.env`, `.git`, file konfigurasi).
  - Nonaktifkan directory browsing (`Options -Indexes`).
  - Cegah eksekusi script di direktori `/uploads/`.
- **Test Plan:** Uji direct access ke file konfigurasi -> pastikan ditolak 403 Forbidden; uji simulasi header forwarded HTTPS -> pastikan tidak terjadi redirect loop.
- **Residual Risk:** Konfigurasi `.htaccess` bersifat template repositori; pengaktifan di server produksi memerlukan review izin modul Apache.

### WP-3.4 — SEC-012: Vite Custom Dev Middleware Path Traversal
- **Severity:** Low (CVSS 4.5)
- **Affected Component:** `company-profile/vite.config.js:16-28`
- **Remediation Plan:** Perbaiki middleware dev custom dengan validasi boundary menggunakan `path.resolve` dan `path.relative` terhadap direktori root publik; aktifkan `server.fs.strict: true` dan batasi `server.fs.allow`.
- **Test Plan:** Kirim request traversal `/@fs/../../../../etc/passwd` pada dev server -> pastikan ditolak 403 Forbidden.
- **Residual Risk:** Minimal. Hanya aktif pada mode dev server Vite.

### WP-3.5 — SEC-013: Residual Backup Archives & Production Sourcemap Elimination
- **Severity:** Low (CVSS 3.8)
- **Affected Component:** Workspace Root, `company-profile/vite.config.js`, `.gitignore`
- **Remediation Plan:**
  - **Pola Ignore Spesifik (Menghindari Blanket `*.sql`):** File schema inti `backend/database/psu_sertifikat.sql` adalah komponen aplikasi yang **wajib tetap terlacak**. Hindari blanket ignore `*.sql`.
  - Gunakan pola spesifik untuk database backup/dump: `*.dump.sql`, `backup*.sql`, `*_backup.sql`, `*.dump`, serta file arsip `dist.zip`, `backend.zip`, `*.tar.gz`, `*.bak`.
  - Konfigurasikan Vite build untuk mematikan source map (`build.sourcemap: false`) agar kode asli frontend tidak diekspos di browser developer tools.
- **Test Plan:** Jalankan `npm run build` -> pastikan folder `dist/assets` tidak menghasilkan file `.map`; verifikasi `backend/database/psu_sertifikat.sql` tetap terlacak di Git.
- **Residual Risk:** Minimal.

### WP-3.6 — SEC-014: Deprecated Dependency Removal & Frontend Security Audit
- **Severity:** Informational (CVSS 2.5)
- **Affected Component:** `package.json:25`, `company-profile/package.json`
- **Remediation Plan:** Hapus dependency tidak terpakai `init` dari root `package.json`. Jalankan `npm audit` pada backend dan frontend, lalu perbarui package rentan yang aman diperbarui tanpa breaking changes.
- **Test Plan:** Verifikasi tree dependensi bersih dari paket `init`; jalankan build regression frontend dan backend.
- **Residual Risk:** Perlu menjaga stabilitas versi dependencies untuk menghindari breaking changes pada library eksternal.

### WP-3.7 — NEW-001: Production Operational Logging & Health Monitoring Endpoint
- **Severity:** Informational / Operational Best Practice
- **Affected Component:** `backend/server.js`
- **Remediation Plan:** Tambahkan middleware structured request logging dengan sanitasi parameter kredensial/token; sediakan endpoint `/api/health` yang aman untuk probe monitoring tanpa membocorkan info internal.
- **Test Plan:** Akses `/api/health` -> menerima respons JSON status sehat tanpa detail sensitif; periksa log server saat request autentikasi -> pastikan data rahasia ter-redact.
- **Residual Risk:** Minimal.

### WP-3.8 — SEC-007 AST Allowlist Sanitizer Defense-in-Depth
- **Severity:** Low (Defense-in-depth)
- **Affected Component:** `backend/server.js:920-980`
- **Status Baseline:** **VERIFIED** (Status historis Phase 2 tetap VERIFIED).
- **Remediation Plan:** Lengkapi sanitasi HTML backend dengan sanitizer berbasis AST (`DOMPurify` / `isomorphic-dompurify`) untuk memastikan perlindungan menyeluruh terhadap mutasi HTML di masa depan sebagai lapisan defense-in-depth.
- **Test Plan:** Uji payload mutasi HTML kompleks (nested tag, MathML/SVG edge cases) -> pastikan tersanitasi aman.
- **Residual Risk:** Minimal.
- **Remediation Plan:** Lengkapi sanitasi HTML backend dengan sanitizer berbasis AST (`DOMPurify` / `isomorphic-dompurify`) untuk memastikan perlindungan menyeluruh terhadap mutasi HTML di masa depan.
- **Test Plan:** Uji payload mutasi HTML kompleks (nested tag, MathML/SVG edge cases) -> pastikan tersanitasi aman.
- **Residual Risk:** Minimal.

---

## 5. PEMERIKSAAN KONSISTENSI SILANG (CROSS-CONSISTENCY CHECK)

Pemeriksaan konsistensi dokumen telah dilakukan di seluruh file repositori:
1. `SECURITY_AUDIT_REPORT.md`: Baseline historis terkonfirmasi (SEC-001 s/d SEC-014 utuh).
2. `SECURITY_MASTER_VULNERABILITY_REGISTER.md`: Telah disinkronkan ke Versi 2.0 (Authoritative Reconciled Baseline).
3. `SECURITY_FINAL_VERIFICATION_REPORT.md`: Ditambahkan Addendum Rekonsiliasi untuk memperbaiki tabel Phase 3 tanpa mengubah hasil historis Phase 1.3.1 dan Phase 2.
4. `SECURITY_FINAL_REMAINING_RISKS.md`: Matriks Work Package Phase 3 diperbarui menjadi WP-3.1 s/d WP-3.8 dengan pelabelan ID yang tepat.
5. `SECURITY_PHASE_3_SCOPE_RECONCILIATION.md`: Diterbitkan sebagai panduan eksekusi resmi Phase 3.

---

## 6. AUDIT GATE STATEMENT

1. **Integritas Historis:** Temuan dan hasil audit Phase 1.3.1 (`e7f2118`) dan Phase 2 (`cb8afdb`) tidak mengalami perubahan apa pun dan tetap berstatus **VERIFIED** / **CONDITIONALLY VERIFIED**.
2. **Kepatuhan Read-Only:** Tidak ada perubahan kode sumber aplikasi (`server.js`, frontend, atau database) yang dilakukan selama proses rekonsiliasi dokumentasi ini.
3. **Kesiapan Eksekusi:** Seluruh 14 temuan asli ditambah 1 temuan operasional baru telah terpetakan secara lengkap ke dalam 8 paket kerja terstruktur.
4. **Instruksi Gate:** Proses dihentikan di sini untuk menunggu persetujuan (*review & approval*) pengguna sebelum implementasi Phase 3 dimulai.

---
*Dokumen rekonsiliasi disusun dan disertifikasi oleh Senior Cybersecurity Engineer & Application Security Auditor.*

