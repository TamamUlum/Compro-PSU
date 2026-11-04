# SECURITY PHASE 3 IMPLEMENTATION REPORT
## PT PENILAI STANDAR UJI (PSU) — APPLICATION & INFRASTRUCTURE HARDENING
### Residual Vulnerability Remediation, Infrastructure Configuration & Defense-in-Depth

---

## 1. EXECUTIVE SUMMARY

- **Project:** PT Penilai Standar Uji (PSU) — Company Profile & Certificate Tracking System
- **Repository Location:** `E:\PSU siap Upload\compro-PSU-main`
- **Auditor & Lead Security Engineer:** Senior Application Security Engineer, Senior Backend Engineer, and Security Auditor
- **Implementation Date:** 4 November 2026
- **Baseline Commit:** `cb8afdb` (*security(phase2): harden authentication, session management, authorization freshness, and stored XSS sanitization*)
- **Phase 3 Scope Addressed:**
  - **WP-3.1 (SEC-009):** HTTP Security Headers, CSP Report-Only, Conditional HSTS, Error Redaction & Central Error Handling.
  - **WP-3.2 (SEC-010):** Global JSON Parser Body Limit Reduction (1 MB) & Dedicated Upload Route Memory Guards (5 MB).
  - **WP-3.3 (SEC-011):** Production Apache `.htaccess` Hardening & Cloudflare Flexible SSL Redirect Loop Prevention.
  - **WP-3.4 (SEC-012):** Vite Custom Dev Middleware Path Traversal Containment.
  - **WP-3.5 (SEC-013):** Production Sourcemap Disabling & Targeted Gitignore (Preserving Core SQL Schema).
  - **WP-3.6 (SEC-014):** Deprecated Package Clean-up (Removal of `init`) & Dependency Inventory.
  - **WP-3.7 (NEW-001):** Structured Operational Logging & Safe Health Monitoring Endpoint (`/api/health`).
  - **WP-3.8 (SEC-007 Residual):** AST-style Allowlist HTML Sanitizer (DOMPurify Defense-in-Depth).

---

## 2. DETAILED IMPLEMENTATION PER WORK PACKAGE

### 2.1 WP-3.1 (SEC-009): HTTP Security Headers, Error Redaction & Central Handling
- **Target File:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L247-L275), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L4410-L4440)
- **Remediation Details:**
  1. **Global Security Headers Middleware:**
     Injected early into the Express middleware pipeline:
     - `X-Content-Type-Options: nosniff` (prevents MIME sniffing).
     - `X-Frame-Options: DENY` (anti-clickjacking defense).
     - `Referrer-Policy: strict-origin-when-cross-origin` (prevents referrer leak).
     - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (disables unused hardware APIs).
     - `Content-Security-Policy-Report-Only`: Starts in Report-Only mode (`default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: /news/; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';`) to guarantee frontend SPA compatibility without breaking user experiences before full resource inventory.
     - **Conditional HSTS Policy:** `Strict-Transport-Security: max-age=31536000` is **only** served on verified HTTPS requests (`req.secure || req.headers['x-forwarded-proto'] === 'https'`). It is omitted on development HTTP connections and strictly avoids `includeSubDomains` or `preload` without prior subdomain certification.
  2. **Information Disclosure & Error Redaction:**
     - Sanitized database error handling in certificate tracker query (`/api/sertifikat/:submenu`). Replaced raw error responses and mentions of `"Pastikan MySQL di XAMPP sudah Start"` with clean, non-revealing messages (`"Gagal memproses pengecekan sertifikat pada database."`).
     - Added centralized Express error handler (`app.use((err, req, res, next) => { ... })`) at the end of the middleware stack to catch unhandled errors, log them securely on the server console, and return generic 500 responses without leaking server stack traces.

---

### 2.2 WP-3.2 (SEC-010): Global Body Parser Throttling & Dedicated Upload Limit
- **Target File:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L355-L375), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L3240-L3270)
- **Remediation Details:**
  1. **Global Body Parser Limits:**
     - Lowered global JSON parser from 25 MB to **1 MB**: `express.json({ limit: "1mb" })`.
     - Lowered global URL-encoded parser to **1 MB**: `express.urlencoded({ limit: "1mb", extended: true })`.
  2. **Isolated Upload Route Configuration:**
     - Requests exceeding 1 MB to standard endpoints return `HTTP 413 Payload Too Large`.
     - `/api/upload-gambar` is routed through a dedicated parser (`express.json({ limit: "10mb" })`) to accept base64 image strings.
     - Inside `/api/upload-gambar`, the binary decoded buffer size is capped strictly at **5 MB** (`if (buffer.length > 5 * 1024 * 1024) return res.status(413)`).

---

### 2.3 WP-3.3 (SEC-011): Production Apache `.htaccess` Hardening & Cloudflare Alignment
- **Target File:** [`htaccess-production.txt`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/htaccess-production.txt#L1-L65)
- **Remediation Details:**
  1. **Cloudflare Reverse Proxy Redirect Loop Mitigation:**
     - Documented topology: Under Cloudflare Flexible SSL, Cloudflare communicates with Apache over HTTP. A naive `RewriteCond %{HTTPS} off` rule causes an infinite redirect loop (`ERR_TOO_MANY_REDIRECTS`).
     - Implemented proxy-aware rewrite rules that verify `X-Forwarded-Proto` and `CF-Visitor`:
       ```apache
       RewriteCond %{HTTPS} off
       RewriteCond %{HTTP:X-Forwarded-Proto} !https [NC]
       RewriteCond %{HTTP:CF-Visitor} !'"scheme":"https"' [NC]
       RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
       ```
  2. **Access Control & Directory Security:**
     - Blocked access to sensitive files (`.env`, `.git`, `.gitignore`, `.sql`, `.dump`, `.bak`, `.zip`, `package.json`).
     - Disabled directory browsing (`Options -Indexes -MultiViews`).
     - Disabled script execution in media directories (`/news/`, `/uploads/`).
     - Added server-level security headers via `mod_headers`.

---

### 2.4 WP-3.4 (SEC-012): Vite Custom Dev Middleware Path Traversal Containment
- **Target File:** [`company-profile/vite.config.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/vite.config.js#L10-L45)
- **Remediation Details:**
  1. **Canonical Path Resolution:**
     - In `publicWebpFallbackPlugin`, replaced naive string concatenation (`path.join(__dirname, 'public', decodedPath)`) with canonical resolution:
       ```javascript
       const normalizedRelative = path.normalize(decodedPath).replace(/^(\.\.[\/\\])+/, '');
       const exactFile = path.resolve(publicDir, '.' + normalizedRelative);
       const relCheck = path.relative(publicDir, exactFile);
       if (relCheck.startsWith('..') || path.isAbsolute(relCheck)) {
         return next(); // Traversal attempt rejected
       }
       ```
  2. **Vite Filesystem Boundary:**
     - Added `server.fs.strict: true` and `server.fs.allow: [__dirname]` to enforce filesystem isolation during development and preview.

---

### 2.5 WP-3.5 (SEC-013): Production Sourcemap Elimination & Targeted Gitignore
- **Target Files:** [`company-profile/vite.config.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/vite.config.js#L50-L55), [`.gitignore`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/.gitignore#L85-L95)
- **Remediation Details:**
  1. **Production Sourcemap Disabling:**
     - Added `build: { sourcemap: false }` to `company-profile/vite.config.js`. Verified that running `npm run build` generates zero `.map` files in `dist/assets`.
  2. **Targeted Gitignore (Preserving Core Database Schema):**
     - Replaced blanket `*.sql` ignore pattern in `.gitignore` with targeted dump and backup patterns (`*.dump.sql`, `backup*.sql`, `*_backup.sql`, `*.dump`, `dump.sql`).
     - Added explicit exception `!backend/database/*.sql` ensuring that the core application schema file [`backend/database/psu_sertifikat.sql`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/database/psu_sertifikat.sql) remains tracked by Git.

---

### 2.6 WP-3.6 (SEC-014): Deprecated Dependency Clean-up & Dependency Inventory
- **Target File:** [`package.json`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/package.json#L24-L31)
- **Remediation Details:**
  1. Removed the accidental/unused dummy dependency `"init": "^0.1.2"` from root `package.json`.
  2. Verified that all required backend dependencies (`express`, `cors`, `dotenv`, `mysql2`, `sharp`) and frontend packages (`react`, `react-dom`, `react-router-dom`, `vite`) are healthy, with zero build or runtime errors.

---

### 2.7 WP-3.7 (NEW-001): Structured Operational Logging & Health Monitoring Endpoint
- **Target File:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L275-L295), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L425-L445)
- **Remediation Details:**
  1. **Structured Operational Logging Middleware:**
     - Formats logs: `[ISO_TIMESTAMP] [CLIENT_IP] METHOD ROUTE STATUS DURATIONms`.
     - Extracts genuine client IP via `getClientIp(req)`.
     - **Redaction Policy:** Strips query strings, request bodies, auth tokens, passwords, and cookie data from logs to prevent credential leakage.
  2. **Health Check Endpoint (`GET /api/health`):**
     - Returns `{ status: "healthy", timestamp, database: "connected" | "fallback_store" }`.
     - Does not leak database credentials, internal hosts, software versions, or system internals.

---

### 2.8 WP-3.8 (SEC-007 Residual): AST-style Allowlist HTML Sanitizer (DOMPurify Defense-in-Depth)
- **Target File:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L990-L1070)
- **Remediation Details:**
  1. Upgraded `sanitizeHtmlContent` with a tokenized allowlist algorithm:
     - Recursive loop stripping nested dangerous tags (`<scr<script>ipt>`).
     - Allowed HTML tag allowlist: `p, br, strong, b, em, i, u, s, h1-h6, ul, ol, li, blockquote, span, div, a, img, hr, table, thead, tbody, tr, th, td`.
     - Explicit removal of `<svg>` and `<math>` vectors.
     - Stripping of all inline `on*` event handlers and HTML comments.
     - Neutralization of dangerous URI schemes (`javascript:`, `vbscript:`, dangerous `data:` URLs).
     - Verified backward-compatible with all Phase 2 and Phase 3 tests.

---

## 3. SUMMARY OF CHANGED FILES

| File Path | Type | Work Package | Description of Changes |
| :--- | :---: | :---: | :--- |
| `backend/server.js` | Backend | WP-3.1, 3.2, 3.7, 3.8 | Added security headers, operational logger, body parser throttling, health endpoint, AST sanitizer, error redaction |
| `company-profile/vite.config.js` | Frontend Build | WP-3.4, 3.5 | Added canonical path containment to dev middleware, `server.fs.strict`, and `build.sourcemap: false` |
| `.gitignore` | Configuration | WP-3.5 | Replaced blanket `*.sql` with specific backup ignore patterns, preserving `backend/database/psu_sertifikat.sql` |
| `htaccess-production.txt` | Apache Config | WP-3.3 | Hardened production `.htaccess` with Cloudflare loop mitigation, sensitive files blocking, and security headers |
| `package.json` | Root Config | WP-3.6 | Removed accidental dummy dependency `init` |
| `backend/tests/verify_phase3.js` | Automated Test | Phase 3 | Created 30-assertion automated test suite for Phase 3 controls |

---
*Report certified by Senior Application Security Engineer & Auditor.*

