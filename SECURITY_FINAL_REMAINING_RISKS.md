# SECURITY REMAINING RISKS & PHASE 3 ROADMAP
## PT PENILAI STANDAR UJI (PSU) — APPLICATION & INFRASTRUCTURE POSTURE
### Comprehensive Analysis of Residual Risks, Deployment Dependencies, and Phase 3 Scope

---

## 1. RESIDUAL RISK REGISTER & ARCHITECTURAL DEPENDENCIES

Following the completion and technical verification of Phase 1 through Phase 2 remediations, no Critical (CVSS > 9.0) vulnerabilities remain in the application codebase. However, defense-in-depth requires explicit documentation and management of residual risks, particularly those at the intersection of application logic and production infrastructure.

```
+-----------------------------------------------------------------------------------------------+
|                                    RESIDUAL RISK REGISTER                                     |
+-----------------------------------------------------------------------------------------------+
| Risk ID       | Related Finding | Risk Level | Nature of Risk           | Resolution Phase   |
+-----------------------------------------------------------------------------------------------+
| RES-RISK-01   | SEC-004         | Medium     | Origin Direct IP Bypass  | Production Deploy  |
| RES-RISK-02   | SEC-007         | Low        | Regex vs AST Sanitizer   | Phase 3 Scope      |
| RES-RISK-03   | SEC-001         | Low        | Operational Secret Mgmt  | Production Deploy  |
| RES-RISK-04   | SEC-010         | Medium     | 50MB Body Parser DoS     | Phase 3 Scope      |
| RES-RISK-05   | SEC-009         | Low        | Missing Security Headers | Phase 3 Scope      |
| RES-RISK-06   | SEC-011/012     | Low        | Server & Asset Hardening | Phase 3 Scope      |
+-----------------------------------------------------------------------------------------------+
```

---

## 2. DETAILED RESIDUAL RISKS ANALYSIS

### 2.1 RES-RISK-01 (SEC-004): Production Origin Protection & Direct IP Bypass
- **Associated Identifier:** `SEC-004`
- **Current Status:** **CONDITIONALLY VERIFIED**
- **Inherent Risk Level:** Medium
- **Technical Description:**
  The Express application code enforces strict CIDR validation, minimum prefix policies (IPv4 `/8` to `/32`, IPv6 `/16` to `/128`), and conditional validation of `CF-Connecting-IP`. However, when `TRUST_PROXY=cloudflare` or a reverse proxy CIDR is configured, the application assumes that any HTTP request arriving with a proxy peer IP originated through the legitimate CDN/reverse proxy edge.
  
  If the production origin server's public IP address is exposed and port `5000` (or the web server proxy port) is accessible directly from the public internet without firewall restrictions, an attacker could:
  1. Bypass Cloudflare Web Application Firewall (WAF), rate limits, and DDoS protection entirely.
  2. Directly connect to the origin IP, attempting to forge headers if intermediate proxies fail to strip them or if the application is accessed directly.

- **Mandatory Production Infrastructure Controls (Pre-Go-Live Checklist):**
  1. **Loopback Binding:** Ensure Node.js Express binds strictly to `127.0.0.1:5000` (or `localhost`), never directly to `0.0.0.0` or a public IP address.
  2. **Host Firewall Rules (`iptables` / `ufw`):**
     - Drop all direct inbound traffic on port 5000 from public interfaces.
     - For Apache/Nginx reverse proxy, allow incoming HTTP/HTTPS (ports 80/443) **only** from verified Cloudflare IP ranges.
  3. **Cloudflare Authenticated Origin Pulls (AOP):** Enable TLS client certificate verification on the web server (Apache/Nginx) so that only Cloudflare edge servers holding the valid client certificate can establish a connection.
  4. **Cloudflare Tunnel (`cloudflared`):** Alternatively, utilize Cloudflare Tunnel so no public inbound ports need to be open on the origin server at all.

---

### 2.2 RES-RISK-02 (SEC-007): Evolution from Regex Denylist to AST-Based HTML Sanitizer
- **Associated Identifier:** `SEC-007`
- **Current Status:** **VERIFIED** *(with defense-in-depth enhancement recommended)*
- **Inherent Risk Level:** Low
- **Technical Description:**
  The current backend implementation of `sanitizeHtmlContent` uses regular expression pattern matching to strip dangerous tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, `<form>`), inline `on*` event handlers, and `javascript:` pseudo-protocols.
  
  **Current Mitigating Factor:**
  The React frontend (`company-profile/src/pages/ArtikelDetail.jsx`) does **not** render article content using `dangerouslySetInnerHTML`. Instead, it splits content into paragraphs and renders them as standard React JSX text nodes (`<p>{paragraph}</p>`). React automatically escapes all HTML entities in text nodes, preventing DOM injection regardless of raw backend strings.
  
  **Defense-in-Depth Remediation (Scheduled for Phase 3):**
  If rich text rendering (WYSIWYG / HTML formatting) is ever enabled in the future, regex denylists can theoretically be bypassed by nested malformed tags (`<scr<script>ipt>`), SVG/MathML mutations, or complex character encoding anomalies.
  - In Phase 3, backend sanitization will be upgraded using an industry-standard Abstract Syntax Tree (AST) allowlist sanitizer (`DOMPurify` / `isomorphic-dompurify`).

---

### 2.3 RES-RISK-03 (SEC-001): Production Operational Secret Management
- **Associated Identifier:** `SEC-001`
- **Current Status:** **VERIFIED**
- **Inherent Risk Level:** Low
- **Technical Description:**
  The application enforces a minimum 32-character high-entropy secret for `JWT_SECRET` and fails closed on boot if it is missing or set to known default values.
  
  **Operational Requirements:**
  - Production deployments must generate cryptographically strong secrets (`node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`).
  - Never commit `.env` or production credentials to source control.
  - Implement periodic credential and JWT secret rotation procedures.

---

## 3. PHASE 3 COMPREHENSIVE ROADMAP (PLANNED TASKS)

Phase 3 addresses system-wide defense-in-depth hardening, infrastructure configuration, denial-of-service prevention, and dependency lifecycle management. The work packages are reconciled with the original audit baseline:

```
+-------------------------------------------------------------------------------------------------+
|                                     PHASE 3 WORK PACKAGES                                       |
+-------------------------------------------------------------------------------------------------+
| Package ID | Domain                     | Vulnerabilities Addressed  | Target Files             |
+-------------------------------------------------------------------------------------------------+
| WP-3.1     | Error Redaction & Headers  | SEC-009                    | backend/server.js        |
| WP-3.2     | Body Parser DoS Mitigation | SEC-010                    | backend/server.js        |
| WP-3.3     | Apache & Web Server Config | SEC-011                    | public/.htaccess         |
| WP-3.4     | Vite Dev Traversal Defense | SEC-012                    | company-profile/vite.*   |
| WP-3.5     | Backup & Sourcemap Cleanup | SEC-013                    | Workspace, vite.config   |
| WP-3.6     | Dependency Remediation     | SEC-014                    | package.json, lockfiles  |
| WP-3.7     | Operational Logging/Health | NEW-001                    | backend/server.js        |
| WP-3.8     | AST Allowlist Sanitizer    | SEC-007 (Defense in Depth) | backend/server.js        |
+-------------------------------------------------------------------------------------------------+
```

### 3.1 WP-3.1 — SEC-009: Verbose Error Messages, SQL Disclosure & HTTP Security Headers
- **Severity:** Medium (CVSS 5.3)
- **Scope:**
  - Redact and sanitize internal database error details, query statements, and server stack traces across all endpoints.
  - Return standardized, non-revealing error responses in production with correlation IDs.
  - Integrate `helmet` middleware in `backend/server.js` with `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY`, and `Permissions-Policy`.
  - **CSP Implementation Policy:** Start with `Content-Security-Policy-Report-Only` if runtime compatibility is unproven. Full enforcement only after complete resource inventory & regression tests. Avoid `'unsafe-inline'`/`'unsafe-eval'` unless strictly verified.
  - **HSTS Policy:** Header `Strict-Transport-Security` **only served on verified HTTPS responses** (`req.secure || req.headers['x-forwarded-proto'] === 'https'`). Do NOT enforce HSTS on development HTTP. Do NOT include `includeSubDomains` or `preload` without verifying all production subdomains.

### 3.2 WP-3.2 — SEC-010: Body Parser DoS Mitigation & Request Size Throttling
- **Severity:** Low (CVSS 5.1)
- **Scope:**
  - Audit existing `express.json({ limit: '50mb' })` and `express.urlencoded({ limit: '50mb' })`.
  - Reduce global JSON payload limit to **1MB** (more than sufficient for typical REST operations).
  - Restrict large payloads (up to 5MB) strictly to dedicated image upload routes using streaming Multer storage with memory guards.

### 3.3 WP-3.3 — SEC-011: Web Server & Apache Configuration Hardening
- **Severity:** Low (CVSS 4.8)
- **Scope:**
  - Audit and create/update root and public `.htaccess` files.
  - **Cloudflare Topology & Redirect Loop Prevention:** Document SSL/TLS modes (Flexible vs Full vs Full Strict). Prevent infinite redirect loops (`ERR_TOO_MANY_REDIRECTS`) under Cloudflare Flexible SSL by checking proxy headers:
    ```apache
    RewriteCond %{HTTPS} off
    RewriteCond %{HTTP:X-Forwarded-Proto} !https
    RewriteCond %{HTTP:CF-Visitor} !'"scheme":"https"'
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    ```
  - Block access to sensitive files and directories (`.git`, `.env`, `.yml`, `package.json`, backup files `.bak`, `.dump.sql`).
  - Disable directory browsing (`Options -Indexes`).
  - Prevent script execution inside `/uploads/` directory.

### 3.4 WP-3.4 — SEC-012: Vite Custom Dev Middleware Path Traversal Containment
- **Severity:** Low (CVSS 4.5)
- **Scope:**
  - Audit custom dev middleware in `company-profile/vite.config.js`.
  - Ensure path resolution is strictly bounded using `path.resolve` and `path.relative` against the public root.
  - Enforce `server.fs.strict: true` and specify safe `server.fs.allow` boundaries to prevent unauthorized path traversal during local development/preview.

### 3.5 WP-3.5 — SEC-013: Residual Backup Archives & Production Sourcemap Elimination
- **Severity:** Low (CVSS 3.8)
- **Scope:**
  - **Specific SQL Ignore Patterns (Avoid Blanket `*.sql`):** Core application database schema `backend/database/psu_sertifikat.sql` is tracked application code. Do NOT blanket-ignore `*.sql`.
  - Target specific backup patterns in `.gitignore`: `*.dump.sql`, `backup*.sql`, `*_backup.sql`, `*.dump`, `dist.zip`, `backend.zip`, `*.tar.gz`, `*.bak`.
  - Configure Vite production build settings to disable JavaScript/CSS sourcemaps (`build.sourcemap: false`), preventing client-side reconstruction of original source code.

### 3.6 WP-3.6 — SEC-014: Deprecated Dependency 'init' Removal & Frontend Package Audit
- **Severity:** Informational (CVSS 2.5)
- **Scope:**
  - Remove deprecated/accidental dummy dependency `init` from root `package.json`.
  - Execute `npm audit` across root, backend, and frontend dependencies.
  - Remediate vulnerable packages with non-breaking version updates.

### 3.7 WP-3.7 — NEW-001: Production Operational Logging & Health Monitoring Endpoint
- **Severity:** Informational / Operational Best Practice
- **Scope:**
  - Implement standardized structured logging (timestamp, level, client IP, route, response status, duration) without logging credentials, tokens, or sensitive user inputs.
  - Provide a safe `/api/health` monitoring endpoint reporting application status without exposing server internals or database connection strings.

### 3.8 WP-3.8 — Defense-in-Depth: AST Allowlist HTML Sanitizer (SEC-007 Evolution)
- **Severity:** Low (Defense-in-depth)
- **Scope:**
  - Maintain historical status of SEC-007 as **VERIFIED**.
  - Upgrade backend HTML sanitization using an AST-based allowlist sanitizer (`DOMPurify` / `isomorphic-dompurify`) to ensure robust immunity against nested and mutating XSS vectors in article content as an additional defense-in-depth layer.

---

## 4. SIGN-OFF & PREREQUISITES FOR PHASE 3 INITIATION

Before initiating code changes in Phase 3, the following verification gates have been met:

1. [x] **Phase 1 through Phase 2 Code Integrity:** Verified and frozen in commits `e7f2118` and `cb8afdb`.
2. [x] **100% Automated Test Suite Health:** All 124 tests pass without failures or regressions.
3. [x] **Clean Frontend Build:** Production bundle compiles cleanly via Vite.
4. [x] **Residual Risks Explicitly Documented:** SEC-004 origin firewall dependency, SEC-007 AST evolution, and secret operational requirements thoroughly detailed.
5. [ ] **User Formal Authorization:** Awaiting explicit user confirmation to commence Phase 3 implementation.

---
*Document prepared and certified by Independent Senior Cybersecurity Engineer & Application Security Auditor.*

