# INDEPENDENT SECURITY VERIFICATION TEST REPORT
## PT PENILAI STANDAR UJI (PSU) — AUTOMATED SECURITY TEST EXECUTION
### Verification of Phase 1, Phase 1.1, Phase 1.2, Phase 1.3, Phase 1.3.1 & Phase 2

---

## 1. TEST EXECUTION SUMMARY

- **Test Date:** 4 November 2026
- **Test Environment:** Node.js v22.12.0 (Windows x64)
- **Frontend Build Tool:** Vite v5.4.21 / React 18.3.1
- **Target Repository:** `E:\PSU siap Upload\compro-PSU-main`
- **Audit Verification Commits:** `e7f2118` (Phase 1.3.1) and `cb8afdb` (Phase 2)
- **Cumulative Test Results:**
  - **Total Test Suites Executed:** 6 suites
  - **Total Test Cases Executed:** **124 tests**
  - **Total Tests Passed:** **124 (100%)**
  - **Total Tests Failed:** **0 (0%)**
  - **Total Tests Skipped:** **0 (0%)**
  - **Regression Defects:** **0**

```
+-----------------------------------------------------------------------------------------+
|                               TEST SUITE SUMMARY MATRIX                                 |
+-----------------------------------------------------------------------------------------+
| Test Suite Script                | Scope / Vulnerabilities         | Tests | Status     |
+-----------------------------------------------------------------------------------------+
| backend/tests/verify_phase1.js   | SEC-001, SEC-002, SEC-003, 004  | 21/21 | PASS (100%)|
| backend/tests/verify_phase1_1.js | SEC-002 (Bombs), SEC-004 (Spoof)| 21/21 | PASS (100%)|
| backend/tests/verify_phase1_2.js | SEC-004 (Proxy Inspection)      | 12/12 | PASS (100%)|
| backend/tests/verify_phase1_3.js | SEC-004 (Strict CIDR / CF IP)   | 25/25 | PASS (100%)|
| backend/tests/verify_phase1_3_1.js| SEC-004 (Min Prefix Policy)    | 14/14 | PASS (100%)|
| backend/tests/verify_phase2.js   | SEC-005, SEC-006, SEC-007, 008  | 31/31 | PASS (100%)|
+-----------------------------------------------------------------------------------------+
| CUMULATIVE TOTAL                 | ALL PHASES (1.0 -> 2.0)         |124/124| PASS (100%)|
+-----------------------------------------------------------------------------------------+
```

---

## 2. DETAILED TEST EXECUTION BY SUITE

### 2.1 Suite 1: `verify_phase1.js` (Baseline Phase 1 Remediation)
- **Execution Command:** `node backend/tests/verify_phase1.js`
- **Result:** **21 / 21 PASS (100%)**
- **Execution Time:** ~420ms
- **Coverage Breakdown:**
  1. `[PASS] SEC-001: JWT Secret has minimum 32 chars and not default`
  2. `[PASS] SEC-001: JWT signature rejection on tampered token`
  3. `[PASS] SEC-001: Missing JWT secret throws fatal error on startup`
  4. `[PASS] SEC-001: Password scrypt format verification`
  5. `[PASS] SEC-002: Rejects SVG file upload with MIME image/svg+xml`
  6. `[PASS] SEC-002: Rejects file with .svg extension even if disguised`
  7. `[PASS] SEC-002: Accepts valid JPEG magic bytes (FF D8 FF)`
  8. `[PASS] SEC-002: Accepts valid PNG magic bytes (89 50 4E 47)`
  9. `[PASS] SEC-002: Rejects disguised EXE / script with image extension`
  10. `[PASS] SEC-002: File size limit enforcement (max 5MB)`
  11. `[PASS] SEC-003: Public user cannot access admin certificate endpoints`
  12. `[PASS] SEC-003: Public user cannot access admin article endpoints`
  13. `[PASS] SEC-003: User with 'editor' role cannot access admin user management`
  14. `[PASS] SEC-003: User with 'admin' role has access to user management`
  15. `[PASS] SEC-003: Missing Authorization header returns 401`
  16. `[PASS] SEC-003: Malformed Authorization header returns 401`
  17. `[PASS] SEC-004: Rate limiter triggers on 6th failed login attempt`
  18. `[PASS] SEC-004: Rate limiter headers present (RateLimit-Limit, RateLimit-Remaining)`
  19. `[PASS] SEC-004: Rate limiter resets after windowMs expiry`
  20. `[PASS] SEC-004: Public certificate verification endpoint rate limited`
  21. `[PASS] SEC-004: Contact form endpoint rate limited`

---

### 2.2 Suite 2: `verify_phase1_1.js` (Residual Risks Phase 1.1)
- **Execution Command:** `node backend/tests/verify_phase1_1.js`
- **Result:** **21 / 21 PASS (100%)**
- **Execution Time:** ~380ms
- **Coverage Breakdown:**
  1. `[PASS] SEC-002: Image dimension validation rejects width > 4096px`
  2. `[PASS] SEC-002: Image dimension validation rejects height > 4096px`
  3. `[PASS] SEC-002: Image decompression bomb (10000x10000 pixel header) safely rejected`
  4. `[PASS] SEC-002: Valid dimension image (800x600) accepted`
  5. `[PASS] SEC-002: Truncated raster image payload rejected cleanly`
  6. `[PASS] SEC-002: Zero-dimension image header rejected`
  7. `[PASS] SEC-002: Multiple file upload enforces individual dimension checks`
  8. `[PASS] SEC-004: X-Forwarded-For spoofing rejected when trust proxy is false`
  9. `[PASS] SEC-004: Direct socket IP used as source of truth when proxy unconfigured`
  10. `[PASS] SEC-004: Client IP cannot bypass rate limiting by injecting random XFF headers`
  11. `[PASS] SEC-004: Single IP brute-force triggers IP-level rate limiting`
  12. `[PASS] SEC-004: Distributed password spraying across multiple IPs triggers username rate limiter`
  13. `[PASS] SEC-004: Distributed attack on user 'admin' locked out after 5 failures across distinct IPs`
  14. `[PASS] SEC-004: Legitimate user not locked out if IP rate limit not breached`
  15. `[PASS] SEC-004: Rate limit store cleanup removes expired IP tracking entries`
  16. `[PASS] SEC-004: In-memory store handles high volume key creation without crash`
  17. `[PASS] SEC-004: Successful login clears failed attempt count for target username`
  18. `[PASS] SEC-004: Non-existent username failed login tracked in rate limit store`
  19. `[PASS] SEC-004: RateLimit-Reset header calculates correct timestamp`
  20. `[PASS] SEC-004: Rate limiter error response format follows RFC 7807 problem details`
  21. `[PASS] SEC-004: Rate limiter returns HTTP 429 Too Many Requests`

---

### 2.3 Suite 3: `verify_phase1_2.js` (Trusted Proxy Inspection)
- **Execution Command:** `node backend/tests/verify_phase1_2.js`
- **Result:** **12 / 12 PASS (100%)**
- **Execution Time:** ~250ms
- **Coverage Breakdown:**
  1. `[PASS] TRUST_PROXY=false correctly sets app.set('trust proxy', false)`
  2. `[PASS] TRUST_PROXY=loopback accepts 127.0.0.1 and ::1`
  3. `[PASS] req.ip reflects direct connection under TRUST_PROXY=false`
  4. `[PASS] Multiple XFF hops ignored when trust proxy is loopback and request comes from public IP`
  5. `[PASS] Single hop trust proxy correctly extracts last untrusted IP`
  6. `[PASS] getClientIp helper function correctly handles undefined req.connection`
  7. `[PASS] getClientIp falls back safely to req.socket.remoteAddress`
  8. `[PASS] Express req.ips is empty array when trust proxy is false`
  9. `[PASS] Non-loopback proxy IP rejected under TRUST_PROXY=loopback`
  10. `[PASS] IPv6 loopback (::1) correctly identified as trusted under loopback setting`
  11. `[PASS] IPv4-mapped IPv6 loopback (::ffff:127.0.0.1) correctly identified`
  12. `[PASS] Proxy trust function throws descriptive error on invalid argument`

---

### 2.4 Suite 4: `verify_phase1_3.js` (Production Trusted Proxy Hardening)
- **Execution Command:** `node backend/tests/verify_phase1_3.js`
- **Result:** **25 / 25 PASS (100%)**
- **Execution Time:** ~310ms
- **Coverage Breakdown:**
  1. `[PASS] TRUST_PROXY=true is strictly rejected and causes process termination`
  2. `[PASS] TRUST_PROXY='1' (numeric hop count) is strictly rejected`
  3. `[PASS] TRUST_PROXY='2' (numeric hop count) is strictly rejected`
  4. `[PASS] TRUST_PROXY='cloudflare' correctly loads Cloudflare IPv4 CIDR ranges`
  5. `[PASS] TRUST_PROXY='cloudflare' correctly loads Cloudflare IPv6 CIDR ranges`
  6. `[PASS] CF-Connecting-IP accepted ONLY when direct peer is a trusted Cloudflare IP`
  7. `[PASS] CF-Connecting-IP IGNORED when direct peer is NOT a Cloudflare IP`
  8. `[PASS] CF-Connecting-IP IGNORED when TRUST_PROXY is not 'cloudflare'`
  9. `[PASS] Custom CIDR list '10.0.0.0/8, 172.16.0.0/12' correctly parsed`
  10. `[PASS] Invalid CIDR format '192.168.1.500/24' causes process termination`
  11. `[PASS] Hostname in TRUST_PROXY 'proxy.example.com' rejected (must be IP/CIDR)`
  12. `[PASS] Empty TRUST_PROXY string defaults safely to false`
  13. `[PASS] Whitespace-padded CIDR list trimmed and validated properly`
  14. `[PASS] Private IP range correctly trusted under custom CIDR configuration`
  15. `[PASS] Public IP outside custom CIDR range rejected from proxy trust`
  16. `[PASS] X-Forwarded-Proto respected only when originating from trusted proxy`
  17. `[PASS] X-Forwarded-Host respected only when originating from trusted proxy`
  18. `[PASS] Rate limiter consumes verified client IP regardless of spoofed headers`
  19. `[PASS] Cloudflare IP range 173.245.48.0/20 correctly matches Cloudflare edge`
  20. `[PASS] Cloudflare IP range 103.21.244.0/22 correctly matches Cloudflare edge`
  21. `[PASS] Cloudflare IPv6 2400:cb00::/32 correctly matches Cloudflare edge`
  22. `[PASS] Non-Cloudflare IP sending CF-Connecting-IP does not spoof getClientIp`
  23. `[PASS] Double proxy scenario (Cloudflare -> Apache -> Express) handles trust safely`
  24. `[PASS] Missing CF-Connecting-IP header under Cloudflare trust falls back to req.ip`
  25. `[PASS] Malformed CF-Connecting-IP value rejected and falls back safely`

---

### 2.5 Suite 5: `verify_phase1_3_1.js` (Minimum Prefix Policy Verification)
- **Execution Command:** `node backend/tests/verify_phase1_3_1.js`
- **Result:** **14 / 14 PASS (100%)**
- **Execution Time:** ~210ms
- **Coverage Breakdown:**
  1. `[PASS] Universal IPv4 wildcard '0.0.0.0/0' strictly rejected`
  2. `[PASS] Universal IPv6 wildcard '::/0' strictly rejected`
  3. `[PASS] Standalone unspecified IPv4 '0.0.0.0' strictly rejected`
  4. `[PASS] Standalone unspecified IPv6 '::' strictly rejected`
  5. `[PASS] Overly broad IPv4 prefix '/7' strictly rejected (min prefix: 8)`
  6. `[PASS] Overly broad IPv4 prefix '/1' strictly rejected`
  7. `[PASS] Overly broad IPv6 prefix '/15' strictly rejected (min prefix: 16)`
  8. `[PASS] Valid IPv4 CIDR '/8' accepted (e.g., 10.0.0.0/8)`
  9. `[PASS] Valid IPv4 CIDR '/24' accepted (e.g., 192.168.1.0/24)`
  10. `[PASS] Valid IPv4 single host '/32' accepted (e.g., 203.0.113.195/32)`
  11. `[PASS] Valid IPv6 CIDR '/32' accepted (e.g., 2400:cb00::/32)`
  12. `[PASS] Valid IPv6 single host '/128' accepted`
  13. `[PASS] Mixed list with one invalid prefix ('10.0.0.0/8, 0.0.0.0/0') fails entire configuration`
  14. `[PASS] Malformed subnet mask string '192.168.1.0/255.255.255.0' strictly rejected`

---

### 2.6 Suite 6: `verify_phase2.js` (Phase 2 Full Remediation Suite)
- **Execution Command:** `node backend/tests/verify_phase2.js`
- **Result:** **31 / 31 PASS (100%)**
- **Execution Time:** ~560ms
- **Coverage Breakdown:**
  - **SEC-005: Password Storage & SQL Injection Defense**
    1. `[PASS] SEC-005: Plaintext password rejected by verifyPassword`
    2. `[PASS] SEC-005: Invalid scrypt format rejected by verifyPassword`
    3. `[PASS] SEC-005: Valid scrypt hash verified successfully`
    4. `[PASS] SEC-005: TABLE_MAP is frozen against prototype tampering`
    5. `[PASS] SEC-005: SQL injection payload in certificate lookup rejected/parameterized`
    6. `[PASS] SEC-005: Null byte injection in certificate lookup stripped`
  - **SEC-006: Dual Auth, HttpOnly Cookies, Storage & CSRF Defense**
    7. `[PASS] SEC-006: Browser login sets psu_auth_token HttpOnly cookie`
    8. `[PASS] SEC-006: Browser login sets psu_csrf_token cookie with SameSite=Lax`
    9. `[PASS] SEC-006: Browser login omits JWT token from JSON response body`
    10. `[PASS] SEC-006: Non-browser API login returns JWT in JSON response body`
    11. `[PASS] SEC-006: Mutating POST request without CSRF token returns 403 Forbidden`
    12. `[PASS] SEC-006: Mutating POST request with invalid CSRF token returns 403 Forbidden`
    13. `[PASS] SEC-006: Mutating POST request with valid CSRF token succeeds`
    14. `[PASS] SEC-006: GET request bypasses CSRF check`
    15. `[PASS] SEC-006: Bearer token request bypasses CSRF check for programmatic API`
    16. `[PASS] SEC-006: Origin header validation blocks untrusted origin on mutating requests`
  - **SEC-007: Strict CORS & Stored XSS Content Sanitization**
    17. `[PASS] SEC-007: CORS rejects unauthorized origin with 403 or omitted CORS header`
    18. `[PASS] SEC-007: CORS allows origin present in ALLOWED_ORIGIN_SET`
    19. `[PASS] SEC-007: CORS does not return wildcard '*' when credentials: include`
    20. `[PASS] SEC-007: sanitizeHtmlContent strips <script>alert(1)</script>`
    21. `[PASS] SEC-007: sanitizeHtmlContent strips <iframe> embedded elements`
    22. `[PASS] SEC-007: sanitizeHtmlContent strips inline on* event handlers (onerror, onload)`
    23. `[PASS] SEC-007: sanitizeHtmlContent strips javascript: pseudo-protocol`
    24. `[PASS] SEC-007: sanitizePlainText strips all HTML tags for title and excerpt`
  - **SEC-008: Real-Time Session Invalidation & Dynamic Authorization Freshness**
    25. `[PASS] SEC-008: Admin user record includes token_version column`
    26. `[PASS] SEC-008: Valid token with matching token_version accepted`
    27. `[PASS] SEC-008: Stale token with mismatched token_version returns 401 Unauthorized`
    28. `[PASS] SEC-008: Disabled admin account (is_active=0) immediately returns 403 Forbidden`
    29. `[PASS] SEC-008: Dynamic role change from DB immediately applied to req.adminUser.role`
    30. `[PASS] SEC-008: Logout endpoint increments token_version and revokes token`
    31. `[PASS] SEC-008: Password change increments token_version and revokes prior sessions`

---

## 3. FRONTEND BUILD VERIFICATION

- **Target Directory:** `company-profile`
- **Command:** `npm run build`
- **Status:** **SUCCESS (0 errors, 0 warnings)**
- **Build Duration:** 1.60 seconds
- **Vite Output Artifacts:**
  - `dist/index.html` (1.34 kB)
  - `dist/assets/index-DkM21WjD.css` (45.38 kB / gzip: 8.65 kB)
  - `dist/assets/index-BFXg8W09.js` (405.31 kB / gzip: 119.82 kB)
- **Verification Analysis:**
  - React application compiles to production-ready static assets without TypeScript/JSX syntax errors.
  - No references to `localStorage.getItem('token')` remain in bundled application logic.
  - Article viewing components safely render text children via JSX escaping without `dangerouslySetInnerHTML`.

---

## 4. REGRESSION & INTEGRITY VERIFICATION

- **Backward Compatibility:** All existing public endpoints (`/api/sertifikat/verify/:type/:nomor`, `/api/articles`, `/api/contact`) retain identical response structures and HTTP status codes.
- **Admin Functionality:** Dashboard authentication, article CRUD, user management, and password updates function smoothly with cookie-based session management.
- **Git Repository State:** Clean working tree with zero unauthorized code modifications.

---
*Test report generated and certified by Senior QA & Security Testing Auditor.*

