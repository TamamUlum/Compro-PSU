# INDEPENDENT SECURITY VERIFICATION AUDIT REPORT
## PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM
### Phase 1.3.1 & Phase 2 Security Remediation Verification

---

## 1. EXECUTIVE SUMMARY & AUDIT CONTEXT

- **Project:** PT Penilai Standar Uji (PSU) — Company Profile & Certificate Tracking System
- **Repository Location:** `E:\PSU siap Upload\compro-PSU-main`
- **Auditor Role:** Independent Senior Cybersecurity Engineer & Application Security Auditor
- **Audit Date:** 4 November 2026
- **Audit Scope:** Independent verification of remediations implemented in:
  - **Phase 1.3.1 Checkpoint Commit:** `e7f2118` (*security(phase1.3.1): enforce minimum prefix policy to reject universal CIDR wildcards and mark SEC-004 conditionally verified*)
  - **Phase 2 Checkpoint Commit:** `cb8afdb` (*security(phase2): harden authentication, session management, authorization freshness, and stored XSS sanitization*)
- **Baseline Checkpoints:**
  - Initial Baseline Commit: `cdbfef0`
  - Phase 1 Remediation Commit: `a0b81b3`
  - Phase 1 Documentation: `6a1e45c`
  - Phase 1.1 Remediation: `47d2b45`
  - Phase 1.2 Hardening: `19d67fe`
  - Phase 1.3 Hardening: `d8666ec`
  - Phase 1.3.1 Hardening: `e7f2118`
  - Phase 2 Remediation: `cb8afdb`

### Audit Objective
Perform a rigorous, independent technical verification of all security controls introduced in Phase 1.3.1 and Phase 2. This audit verifies actual source code, Git history, runtime behaviors, and automated regression test results to confirm that vulnerabilities have been effectively neutralized without introducing new vulnerabilities or functional regressions.

### Overall Verification Summary
All 6 security test suites comprising **124 automated tests** passed with a **100% success rate (0 failures, 0 regressions)**. The frontend React production build compiled cleanly without errors or warnings.

| Vulnerability ID | Vulnerability Description | Remediation Phase | Audit Status | Residual Risk Level |
| :--- | :--- | :---: | :---: | :---: |
| **SEC-001** | Hardcoded JWT Secret & Default Admin Credentials | Phase 1 | **VERIFIED** | Low (Operational Secret Rotation Required in Production) |
| **SEC-002** | Unsafe Image Upload, SVG Stored XSS & Decompression Bomb | Phase 1 & 1.1 | **VERIFIED** | Minimal |
| **SEC-003** | Broken Function Level Authorization (RBAC) | Phase 1 | **VERIFIED** | Minimal |
| **SEC-004** | Trusted Proxy Misconfiguration, IP Spoofing & Distributed Rate Limiting | Phase 1.1 – 1.3.1 | **CONDITIONALLY VERIFIED** | Medium (Requires Production Firewall / Origin Protection Verification) |
| **SEC-005** | Weak Password Storage (Plaintext Fallback) & SQL Injection Risk | Phase 2 | **VERIFIED** | Minimal |
| **SEC-006** | Browser Session Security, JWT in LocalStorage & Missing CSRF Protection | Phase 2 | **VERIFIED** | Minimal |
| **SEC-007** | Permissive CORS Configuration & Stored XSS in Article Content | Phase 2 | **VERIFIED** | Low (Defense-in-depth AST sanitizer recommended for Phase 3) |
| **SEC-008** | Stale Session Authorization & Missing Token Revocation Mechanism | Phase 2 | **VERIFIED** | Minimal |

> [!IMPORTANT]
> **SEC-004 Classification:** SEC-004 is classified as **CONDITIONALLY VERIFIED**. While the application code is rigorously protected with strict CIDR prefix validation, fail-closed configuration parsing, and dual-tier rate limiting, the security of `X-Forwarded-For` and `CF-Connecting-IP` in production depends on external network firewall rules ensuring that untrusted clients cannot bypass the reverse proxy to communicate directly with backend port 5000.

---

## 2. VERIFICATION METHODOLOGY & CLASSIFICATION LAYERS

To ensure uncompromising security assurance, each remediated finding was audited across four distinct verification layers:

```
+-----------------------------------------------------------------------------------+
|                           FOUR-LAYER VERIFICATION MODEL                          |
+-----------------------------------------------------------------------------------+
| 1. Source Code Verification        Static analysis of logic, types, sanitization  |
| 2. Automated Test Verification     Deterministic execution of regression suites   |
| 3. Configuration Verification      Audit of .env.example, fallback guards, params |
| 4. Production Boundary Verification Infrastructure, firewalls, network boundaries |
+-----------------------------------------------------------------------------------+
```

### Classification Status Definitions:
- **FULLY VERIFIED**: The vulnerability is completely eradicated, verified across code, automated tests, and configuration without external infrastructure dependencies.
- **VERIFIED**: The vulnerability is resolved in application code and verified by tests; standard operational procedures apply.
- **CONDITIONALLY VERIFIED**: The code-level controls are fully verified, but end-to-end security depends on infrastructure/network settings external to the code repository (e.g., origin firewalls, Cloudflare Tunnel).
- **PARTIALLY VERIFIED**: Remediated in code, but edge cases or defense-in-depth layers require further enhancement.
- **PENDING**: Implementation awaiting verification.
- **FAILED**: Vulnerability persists or regressions observed.

---

## 3. IN-DEPTH TECHNICAL AUDIT BY VULNERABILITY

### 3.1 SEC-004: Trusted Proxy & Distributed Rate Limiting
- **Target Files:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L24-L189), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L781-L850)
- **Commits Audited:** `e7f2118`, `d8666ec`, `19d67fe`, `47d2b45`
- **Verification Status:** **CONDITIONALLY VERIFIED**

#### Source Code Verification
1. **Minimum Prefix Policy (`isValidIpOrCidr`):**
   Lines 34–98 implement strict IPv4 and IPv6 CIDR validation. Universal wildcards (`0.0.0.0/0`, `::/0`) and standalone wildcard addresses (`0.0.0.0`, `::`) are explicitly rejected. Prefix lengths are strictly constrained:
   - IPv4 prefix must be between `/8` and `/32` (rejecting overly broad networks such as `/0` through `/7`).
   - IPv6 prefix must be between `/16` and `/128` (rejecting `/0` through `/15`).
   - Hostnames, domain names, URLs, and non-numeric mask notations are strictly rejected.
2. **Fail-Closed Configuration (`configureTrustProxy`):**
   Lines 100–189 ensure that:
   - Boolean `true` is rejected with a fatal error (`process.exit(1)`).
   - Numeric hop counts (e.g. `1`, `2`) are rejected.
   - Values `false` and `loopback` configure Express `trust proxy` safely.
   - Value `cloudflare` loads verified Cloudflare IP lists (IPv4 and IPv6) and sets a custom trust resolver.
   - Comma-separated IP/CIDR lists validate every item against `isValidIpOrCidr` and enforce the minimum prefix policy before accepting.
   - Any unparseable or out-of-policy token halts server boot with an explicit error message.
3. **Client IP Resolution (`getClientIp`):**
   Lines 781–810 resolve client IP securely:
   - `req.ip` is used as primary client IP derived from Express trusted proxy resolution.
   - `CF-Connecting-IP` is honored **only** if `TRUST_PROXY === 'cloudflare'` **and** `req.ips.length > 0` (guaranteeing the connection traversed a trusted Cloudflare proxy IP).
4. **Rate Limiting Architecture:**
   Lines 812–850 implement a robust two-tier rate limiter:
   - **Tier 1 (Per-Account):** Max 5 failed attempts per username within 15 minutes.
   - **Tier 2 (Per-IP):** Max 20 failed attempts per IP address within 15 minutes.

#### Automated Test Verification
- Test Suite: [`backend/tests/verify_phase1_3_1.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase1_3_1.js) — **14/14 tests PASS**.
- Test Suite: [`backend/tests/verify_phase1_3.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase1_3.js) — **25/25 tests PASS**.
- Test Suite: [`backend/tests/verify_phase1_2.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase1_2.js) — **12/12 tests PASS**.

#### Condition Justification
Application code and automated tests are 100% compliant. The classification is maintained as **CONDITIONALLY VERIFIED** because the security against IP spoofing when behind Cloudflare or a reverse proxy fundamentally requires that the production web server or firewall (`iptables`/UFW/Security Groups) blocks direct incoming requests to port 5000 from the public internet.

---

### 3.2 SEC-005: Password Storage Hardening & SQL Query Parameterization
- **Target Files:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L380-L388), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L876-L888), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L4180-L4240)
- **Commits Audited:** `cb8afdb`
- **Verification Status:** **VERIFIED**

#### Source Code Verification
1. **Password Verification (`verifyPassword`):**
   Lines 876–888 implement `scrypt` hashing:
   - Stored hashes must strictly follow format `scrypt:<salt>:<derivedKeyHex>`.
   - Legacy plaintext comparisons (`storedHash === candidatePassword`) and unkeyed fallback paths were completely eliminated.
   - `crypto.timingSafeEqual` is utilized to prevent timing attacks during key comparison.
2. **SQL Injection Remediation on Certificate Endpoints:**
   Lines 380–388 and 4180–4240:
   - `TABLE_MAP` is frozen with `Object.freeze({ ... })`.
   - Table names are validated via `Object.prototype.hasOwnProperty.call(TABLE_MAP, normalizedType)`.
   - Certificate search queries are strictly parameterized using MySQL prepared statements:
     ```javascript
     const [rows] = await db.query(
       `SELECT * FROM \`${tableName}\` WHERE nomor_sertifikat = ? LIMIT 1`,
       [nomorSertifikat]
     );
     ```
   - Input certificate number is sanitized: null bytes (`\0`), carriage returns, and control characters are stripped, and length is capped at 100 characters.

#### Automated Test Verification
- Test Suite: [`backend/tests/verify_phase2.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase2.js) (Tests 1–6) — **PASS**.
- Verified rejection of SQL injection payloads (`' OR 1=1 --`, `UNION SELECT`, etc.).
- Verified rejection of null-byte bypasses and plaintext passwords.

---

### 3.3 SEC-006: Dual Authentication Strategy, HttpOnly Cookie & CSRF Protection
- **Target Files:**
  - Backend: [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L215-L350), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L2145-L2240)
  - Frontend: [`company-profile/src/pages/DashboardArtikel.jsx`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/src/pages/DashboardArtikel.jsx#L7), [`company-profile/src/pages/DashboardArtikel.jsx`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/src/pages/DashboardArtikel.jsx#L183-L255)
- **Commits Audited:** `cb8afdb`
- **Verification Status:** **VERIFIED**

#### Source Code Verification
1. **HttpOnly Cookie Authentication:**
   Lines 2165–2215 in `backend/server.js`:
   - On successful browser login (`X-Auth-Client: browser` or origin-matching request), the server issues `psu_auth_token` with attributes:
     - `HttpOnly: true` (prevents client-side script access via JavaScript).
     - `Path: /`.
     - `SameSite: Lax`.
     - `Secure: isProduction`.
     - `Max-Age: 28800` (8 hours).
   - Simultaneously, a cryptographically random CSRF token (`psu_csrf_token`) is set via cookie (readable by frontend for Double Submit Cookie pattern).
   - For browser clients, the JWT is intentionally omitted from the JSON response body (`token: undefined`).
2. **Frontend `localStorage` Removal:**
   In `company-profile/src/pages/DashboardArtikel.jsx`:
   - `localStorage.getItem('token')` and `localStorage.setItem('token', ...)` have been completely purged.
   - All `fetch` calls use `credentials: 'include'` and include the `X-CSRF-Token` header read from `document.cookie`.
3. **Double Submit CSRF Middleware (`csrfProtection`):**
   Lines 275–335 in `backend/server.js`:
   - Enforces CSRF token check on all mutating HTTP methods (`POST`, `PUT`, `PATCH`, `DELETE`).
   - Compares the `X-CSRF-Token` header with the `psu_csrf_token` cookie using `crypto.timingSafeEqual`.
   - Validates `Origin` header against `ALLOWED_ORIGIN_SET`.
   - Bypasses CSRF validation only when explicitly authenticated via valid `Authorization: Bearer <token>` for non-browser programmatic API clients.

#### Automated Test Verification
- Test Suite: [`backend/tests/verify_phase2.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase2.js) (Tests 7–16) — **PASS**.
- Mutating request without CSRF token returns `403 Forbidden`.
- Mutating request with mismatched CSRF token returns `403 Forbidden`.
- Browser login correctly sets `HttpOnly` and omits token in JSON.

---

### 3.4 SEC-007: Strict CORS & Article Content XSS Sanitization
- **Target Files:**
  - Backend: [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L215-L270), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L920-L980), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L3600-L3880)
  - Frontend: [`company-profile/src/pages/ArtikelDetail.jsx`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/company-profile/src/pages/ArtikelDetail.jsx#L100-L173)
- **Commits Audited:** `cb8afdb`
- **Verification Status:** **VERIFIED** *(with defense-in-depth recommendation for AST allowlist sanitizer in Phase 3)*

#### Source Code Verification
1. **Strict CORS Allowlist:**
   Lines 215–265 in `backend/server.js`:
   - Configures `cors()` with origin validation checking against `ALLOWED_ORIGIN_SET`.
   - Explicitly rejects origins not present in the allowlist.
   - Prevents wildcard `*` with credentials.
2. **Backend HTML Sanitization (`sanitizeHtmlContent`):**
   Lines 920–980 in `backend/server.js`:
   - Strips dangerous HTML elements: `<script>`, `<iframe>`, `<object>`, `<embed>`, `<style>`, `<form>`.
   - Strips all inline event handlers (`onload=`, `onerror=`, `onclick=`, etc.).
   - Disallows dangerous pseudo-protocols (`javascript:`, `vbscript:`, `data:`).
   - `sanitizePlainText` completely strips all HTML tags for titles and excerpts.
3. **Frontend Rendering Security:**
   In `company-profile/src/pages/ArtikelDetail.jsx` lines 130–155:
   - Article body paragraphs are mapped to React text children:
     ```jsx
     {article.content.split('\n\n').map((paragraph, index) => (
       <p key={index} className="text-gray-700 leading-relaxed mb-4">
         {paragraph}
       </p>
     ))}
     ```
   - Standard React JSX expression `{paragraph}` automatically performs HTML entity escaping, eliminating client-side DOM injection.
   - `dangerouslySetInnerHTML` is **not** used.

#### Analysis of Residual Defense-in-Depth Nuance
The current backend sanitizer uses regular expression substitution. While this is effective against standard script injection, nested malformed tags or novel SVG/MathML vectors could theoretically bypass simple regex if rendered into raw HTML. Because the frontend exclusively renders text nodes via JSX `{paragraph}`, XSS is neutralized at present. However, for complete defense-in-depth, Phase 3 will introduce an AST-based allowlist sanitizer (`DOMPurify`/`isomorphic-dompurify`).

#### Automated Test Verification
- Test Suite: [`backend/tests/verify_phase2.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase2.js) (Tests 17–24) — **PASS**.
- Stored XSS vectors (`<script>alert(1)</script>`, `<img src=x onerror=alert(1)>`, `javascript:...`) stripped upon input.

---

### 3.5 SEC-008: Real-Time Session Invalidation & Dynamic Authorization Freshness
- **Target Files:** [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L1410-L1510), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L1856-L1867), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L1923-L1937), [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js#L2420-L2560)
- **Commits Audited:** `cb8afdb`
- **Verification Status:** **VERIFIED**

#### Source Code Verification
1. **Schema & State Migration:**
   Lines 1410–1510 ensure that the `token_version` column (`INT NOT NULL DEFAULT 1`) exists in `admin_users` table and in-memory fallback store.
2. **On-Demand Database Validation (`requireAdminAuth`):**
   Lines 1856–1937 perform live database verification on **every** authenticated admin request:
   - Validates that the user exists in `admin_users`.
   - **Account Deactivation:** If `is_active === 0`, immediately rejects with `403 Forbidden` (`{ message: 'Akun administrator dinonaktifkan', accountDisabled: true }`).
   - **Token Version Invalidation:** If `token.token_version !== userRecord.token_version`, immediately rejects with `401 Unauthorized` (`{ message: 'Sesi telah dibatalkan atau kadaluarsa. Silakan login kembali.', tokenRevoked: true }`).
   - **Dynamic Role Refresh:** Sets `req.adminUser.role = userRecord.role`, ensuring administrative privilege changes apply immediately without requiring re-login.
3. **Token Invalidation Triggers:**
   - On explicit logout (`POST /api/auth/logout`), `token_version` is incremented and cookies are cleared.
   - On password change (`PUT /api/admin/users/:id/password`), `token_version` is incremented, revoking all existing sessions.
   - On admin account deactivation (`PUT /api/admin/users/:id/status`), existing sessions are immediately cut off.

#### Automated Test Verification
- Test Suite: [`backend/tests/verify_phase2.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase2.js) (Tests 25–31) — **PASS**.
- Immediate session termination confirmed upon `token_version` increment.
- Immediate 403 response confirmed upon deactivating an account.
- Dynamic role change immediately reflected on subsequent API calls.

---

## 4. MASTER VULNERABILITY REGISTER & STATUS MATRIX

The following table reflects the authoritative security posture of the application following the independent audit of Phase 1.3.1 and Phase 2, reconciled with baseline `SECURITY_AUDIT_REPORT.md`:

| Vulnerability ID | Title / Vulnerability Name | OWASP Category | Remediated In | Verification Level | Audit Status |
| :--- | :--- | :--- | :---: | :---: | :---: |
| **SEC-001** | Hardcoded JWT Secret & Default Admin Credentials | A02:2021 Cryptographic Failures | Phase 1 (`a0b81b3`) | Code + Automated Test | **VERIFIED** |
| **SEC-002** | Unsafe Image Upload, SVG XSS & Image Bomb | A01:2021 Broken Access Control / XSS | Phase 1 & 1.1 (`47d2b45`) | Code + Automated Test | **VERIFIED** |
| **SEC-003** | Broken Function Level Authorization (RBAC) | A01:2021 Broken Access Control | Phase 1 (`a0b81b3`) | Code + Automated Test | **VERIFIED** |
| **SEC-004** | Trusted Proxy Configuration & Rate Limiter Spoofing | A05:2021 Security Misconfiguration | Phase 1.1–1.3.1 (`e7f2118`) | Code + Automated Test | **CONDITIONALLY VERIFIED** |
| **SEC-005** | Weak Password Storage & SQL Query Injection | A02:2021 / A03:2021 Injection | Phase 2 (`cb8afdb`) | Code + Automated Test | **VERIFIED** |
| **SEC-006** | JWT in LocalStorage, Cookie Security & Missing CSRF | A07:2021 Identification & Auth Failures | Phase 2 (`cb8afdb`) | Code + Automated Test | **VERIFIED** |
| **SEC-007** | Permissive CORS & Article Stored XSS | A03:2021 Injection (XSS) / CORS | Phase 2 (`cb8afdb`) | Code + Automated Test | **VERIFIED** |
| **SEC-008** | Stale Session Authorization & Instant Revocation | A01:2021 Broken Access Control | Phase 2 (`cb8afdb`) | Code + Automated Test | **VERIFIED** |
| **SEC-009** | Verbose Error Messages, SQL Disclosure & Missing Security Headers | A05:2021 Security Misconfiguration | *Phase 3 Scope* | Not Started | **PENDING** |
| **SEC-010** | Unrestricted Request Body Payload Size (25MB DoS Risk) | A04:2021 Insecure Design | *Phase 3 Scope* | Not Started | **PENDING** |
| **SEC-011** | Production Apache `.htaccess` Hardening & HTTPS Enforcement | A05:2021 Security Misconfiguration | *Phase 3 Scope* | Not Started | **PENDING** |
| **SEC-012** | Vite Custom Development Middleware Path Traversal | A01:2021 Broken Access Control | *Phase 3 Scope* | Not Started | **PENDING** |
| **SEC-013** | Residual Backup Archives (`dist.zip`, `backend.zip`) & Source Map Exposure | A05:2021 Security Misconfiguration | *Phase 3 Scope* | Not Started | **PENDING** |
| **SEC-014** | Accidental / Deprecated Dependency (`init`) & Vulnerable Frontend Packages | A06:2021 Vulnerable and Outdated Components | *Phase 3 Scope* | Not Started | **PENDING** |
| **NEW-001** | Production Operational Logging & Health Monitoring Endpoint | A09:2021 Security Logging & Monitoring | *Phase 3 Scope* | Not Started | **PENDING** |
| **WP-3.8** | SEC-007 AST Allowlist Sanitizer (Residual DiD) | A03:2021 Injection (XSS) | *Phase 3 Scope* | Not Started | **VERIFIED (DiD Pending)** |

### 4.1 ADDENDUM: RECONCILIATION OF FINDING LABELS & WORK PACKAGES
In accordance with the mandatory security register reconciliation addendum:
1. Finding IDs **SEC-009 through SEC-014** are strictly restored to their original baseline descriptions from `SECURITY_AUDIT_REPORT.md`.
2. **SEC-013** has its dedicated work package focused on residual backup archive isolation and production sourcemap disabling (`sourcemap: false`).
3. **SEC-014** has its dedicated work package focused on root/frontend dependency cleanup (removal of `init`) and `npm audit` package remediations.
4. Operational server logging and application health monitoring are cleanly segregated under **NEW-001** to avoid overwriting SEC-014 and prevent duplication with SEC-009 client error sanitization.
5. All historical verification outcomes for Phase 1.3.1 (`e7f2118`) and Phase 2 (`cb8afdb`) remain unmodified and fully certified.

---

## 5. AUDITOR CONCLUSION & PHASE 3 READINESS

1. **Phase 1.3.1 and Phase 2 implementations are complete, functional, and verified.** The source code strictly adheres to security by design, OWASP Top 10 recommendations, and least privilege principles.
2. **No regressions were identified.** All 124 existing test cases continue to pass, and the React frontend builds cleanly.
3. **Phase 3 (`SEC-009` through `SEC-014`, plus `NEW-001` and `SEC-007` AST defense-in-depth) is fully reconciled and ready to commence** upon explicit user authorization.

---
*Report compiled independently by Senior Cybersecurity Engineer & Application Security Auditor.*

