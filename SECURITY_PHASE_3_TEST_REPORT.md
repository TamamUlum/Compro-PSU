# SECURITY PHASE 3 AUTOMATED TEST REPORT
## PT PENILAI STANDAR UJI (PSU) — CUMULATIVE SECURITY REGRESSION TESTING
### Comprehensive Test Execution of Phase 1 through Phase 3 Controls

---

## 1. TEST EXECUTION SUMMARY

- **Execution Date:** 4 November 2026
- **Test Environment:** Node.js v22.12.0 (Windows x64)
- **Frontend Build Tool:** Vite v8.3.1 / React 18.3.1
- **Target Repository:** `E:\PSU siap Upload\compro-PSU-main`
- **Cumulative Test Results:**
  - **Total Test Suites Executed:** 7 suites
  - **Total Automated Test Assertions:** **154 tests**
  - **Total Passed:** **154 (100%)**
  - **Total Failed:** **0 (0%)**
  - **Total Skipped:** **0 (0%)**
  - **Regression Defects:** **0**

```
+-----------------------------------------------------------------------------------------------+
|                                    CUMULATIVE TEST MATRIX                                     |
+-----------------------------------------------------------------------------------------------+
| Test Suite Script                | Phase / Vulnerability Scope        | Assertions | Status   |
+-----------------------------------------------------------------------------------------------+
| backend/tests/verify_phase1.js   | Phase 1: SEC-001, 002, 003, 004    | 21 / 21    | 100% PASS|
| backend/tests/verify_phase1_1.js | Phase 1.1: Sharp & Spraying        | 21 / 21    | 100% PASS|
| backend/tests/verify_phase1_2.js | Phase 1.2: Proxy Inspection        | 12 / 12    | 100% PASS|
| backend/tests/verify_phase1_3.js | Phase 1.3: Strict Proxy CIDR / CF  | 25 / 25    | 100% PASS|
| backend/tests/verify_phase1_3_1.js| Phase 1.3.1: Minimum Prefix Policy| 14 / 14    | 100% PASS|
| backend/tests/verify_phase2.js   | Phase 2: SEC-005, 006, 007, 008    | 31 / 31    | 100% PASS|
| backend/tests/verify_phase3.js   | Phase 3: SEC-009 s/d 014, NEW-001  | 30 / 30    | 100% PASS|
+-----------------------------------------------------------------------------------------------+
| CUMULATIVE AUTOMATED TOTAL       | ALL SECURITY PHASES                | 154 / 154  | 100% PASS|
+-----------------------------------------------------------------------------------------------+
| FRONTEND PRODUCTION BUILD        | company-profile (npm run build)    | 153 mods   | SUCCESS  |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. DETAILED BREAKDOWN OF PHASE 3 TEST SUITE (`verify_phase3.js`)

### 2.1 WP-3.1 (SEC-009): HTTP Security Headers & Error Redaction
1. `[PASS] SEC-009-01: Header X-Content-Type-Options bernilai 'nosniff' pada respon API`
2. `[PASS] SEC-009-02: Header X-Frame-Options bernilai 'DENY' untuk mencegah clickjacking`
3. `[PASS] SEC-009-03: Header Referrer-Policy bernilai 'strict-origin-when-cross-origin'`
4. `[PASS] SEC-009-04: Header Permissions-Policy menonaktifkan fitur sensor yang tidak dibutuhkan`
5. `[PASS] SEC-009-05: Header Content-Security-Policy-Report-Only hadir untuk evaluasi kompatibilitas frontend`
6. `[PASS] SEC-009-06: Header HSTS (Strict-Transport-Security) TIDAK dikirim pada koneksi HTTP murni`
7. `[PASS] SEC-009-07: Header HSTS dikirimkan pada request dengan header 'X-Forwarded-Proto: https'`
8. `[PASS] SEC-009-08: Header HSTS tidak menyertakan 'includeSubDomains' atau 'preload' tanpa verifikasi seluruh subdomain`
9. `[PASS] SEC-009-09: Respon kegagalan database query sertifikat tidak membocorkan query SQL, stack trace, atau XAMPP`

### 2.2 WP-3.2 (SEC-010): Request Body Limit & Upload Resource Protection
10. `[PASS] SEC-010-01: Global JSON parser menerima payload ukuran wajar (< 1 MB)`
11. `[PASS] SEC-010-02: Global JSON parser menolak payload melebihi batas 1 MB (HTTP 413)`
12. `[PASS] SEC-010-03: Dedicated route upload gambar menerima payload hingga 5 MB dan menolak buffer biner > 5 MB (HTTP 413)`

### 2.3 WP-3.3 (SEC-011): Apache `.htaccess` & Cloudflare Alignment
13. `[PASS] SEC-011-01: htaccess-production.txt menyertakan proteksi infinite redirect loop Cloudflare`
14. `[PASS] SEC-011-02: htaccess-production.txt memblokir akses ke file sensitif (.env, .git, .sql, .dump)`
15. `[PASS] SEC-011-03: htaccess-production.txt menonaktifkan directory browsing (Options -Indexes)`
16. `[PASS] SEC-011-04: htaccess-production.txt memblokir eksekusi skrip di folder /news/ dan /uploads/`

### 2.4 WP-3.4 (SEC-012): Vite Custom Dev Middleware Path Traversal
17. `[PASS] SEC-012-01: vite.config.js menyertakan canonical path resolution dan boundary containment check`
18. `[PASS] SEC-012-02: vite.config.js mengaktifkan server.fs.strict dan batas allow`

### 2.5 WP-3.5 (SEC-013): Sourcemap Elimination & Targeted Gitignore
19. `[PASS] SEC-013-01: vite.config.js menonaktifkan sourcemap produksi (build.sourcemap: false)`
20. `[PASS] SEC-013-02: .gitignore menggunakan pola spesifik terhadap backup dump database dan TIDAK blanket-ignore *.sql`
21. `[PASS] SEC-013-03: File schema aplikasi backend/database/psu_sertifikat.sql tetap ada dan terlacak`

### 2.6 WP-3.6 (SEC-014): Dependency Audit & Deprecated Package Removal
22. `[PASS] SEC-014-01: Package usang/tidak terpakai 'init' telah dihapus dari root package.json`
23. `[PASS] SEC-014-02: Dependensi esensial backend (express, cors, mysql2, sharp) terpasang valid`

### 2.7 WP-3.7 (NEW-001): Health Monitoring & Structured Logging
24. `[PASS] NEW-001-01: Endpoint /api/health mengembalikan status 'healthy' dengan HTTP 200`
25. `[PASS] NEW-001-02: Endpoint /api/health TIDAK membocorkan kredensial, host, atau konfigurasi internal`

### 2.8 WP-3.8 (SEC-007 Residual): AST Allowlist HTML Sanitizer
26. `[PASS] SEC-007-DiD-01: Sanitizer menetralkan serangan nested malformed tag (<scr<script>ipt>)`
27. `[PASS] SEC-007-DiD-02: Sanitizer menolak tag SVG berbahaya (<svg onload='alert(1)'>)`
28. `[PASS] SEC-007-DiD-03: Sanitizer menolak tag MathML (<math><mtext>)`
29. `[PASS] SEC-007-DiD-04: Sanitizer mengizinkan tag HTML yang sah (<p>, <strong>, <em>, <ul>, <li>)`
30. `[PASS] SEC-007-DiD-05: Sanitizer menolak tag di luar allowlist (seperti <marquee>, <blink>, <form>)`

---

## 3. FRONTEND PRODUCTION BUILD VALIDATION

- **Directory:** `company-profile`
- **Command:** `npm run build`
- **Result:** **SUCCESS** in 992ms.
- **Artifacts Generated:**
  - `dist/index.html` (0.47 kB)
  - `dist/assets/index-DO-7VbH9.css` (182.34 kB / gzip: 28.63 kB)
  - `dist/assets/index-Ccpgjl2Y.js` (686.10 kB / gzip: 183.60 kB)
- **Sourcemap Verification:** Confirmed **zero `.map` files** generated in `dist/assets/`, preventing source code exposure in browser developer tools.

---

## 4. REGRESSION & INTEGRITY VERIFICATION

- All public endpoints (`/api/artikel`, `/api/galeri`, `/api/sertifikat/:submenu`) continue to operate as expected.
- All admin endpoints (`/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/admin/users`, `/api/upload-gambar`) function with cookie-based CSRF protection and role authorization.
- Zero regressions across 154 automated test cases.

---
*Test report certified by Senior Application Security Engineer & Auditor.*

