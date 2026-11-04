# LAPORAN PENGUJIAN KEAMANAN — PHASE 2
## PT PENILAI STANDAR UJI (PSU) — APPLICATION SECURITY VERIFICATION

- **Tanggal Pelaksanaan:** 4 November 2026
- **Target Pengujian:** Phase 2 (SEC-005, SEC-008, SEC-006, SEC-007) & Cumulative Regression
- **Test Harness:** `backend/tests/verify_phase2.js`
- **Hasil Akhir:** **31 / 31 PENGUJIAN LOLOS (100% PASS, 0 FAIL)**

---

## 1. MATRIKS PENGUJIAN OTOMATIS PHASE 2

### GROUP 1: SEC-005 (Password Verification Fallback & Certificate SQLi Hardening)
| ID Pengujian | Deskripsi Kasus Uji | Metode & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| `SEC-005-01` | Plaintext password check must fail closed | `verifyPassword('PlaintextPass123!', 'PlaintextPass123!')` | `false` | `false` | **PASS** |
| `SEC-005-02` | Reject non-scrypt hash formats (MD5, empty, null) | `verifyPassword('Secret123!', 'md5:...')`, `null`, `""` | `false` untuk seluruh input | `false`, `false`, `false` | **PASS** |
| `SEC-005-03` | Genuine scrypt hash timing-safe verification | `verifyPassword('ValidScryptPass2026!', validHash)` | `true` jika cocok, `false` jika salah | `true` dan `false` | **PASS** |
| `SEC-005-04` | Prototype pollution defense on TABLE_MAP | `Object.isFrozen(TABLE_MAP)` | `true` | `true` | **PASS** |
| `SEC-005-05` | Submenu whitelist rejection | `GET /api/sertifikat/constructor`, `/__proto__` | HTTP 400 Bad Request | HTTP 400, HTTP 400 | **PASS** |
| `SEC-005-06` | Empty certificate parameter rejection | `GET /api/sertifikat/sertifikasi-produk?no_sertifikat=` | HTTP 400 Bad Request | HTTP 400 | **PASS** |
| `SEC-005-07` | Maximum length enforcement (> 100 characters) | `GET /api/sertifikat/sertifikasi-produk?no_sertifikat=A...[101]` | HTTP 400 Bad Request | HTTP 400 | **PASS** |
| `SEC-005-08` | Reject null byte / control chars in certificate number | `GET /api/sertifikat/sertifikasi-produk?no_sertifikat=PSU%00123` | HTTP 400 Bad Request | HTTP 400 | **PASS** |

---

### GROUP 2: SEC-008 (Inactive User Access & Token Revocation via token_version)
| ID Pengujian | Deskripsi Kasus Uji | Metode & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| `SEC-008-01` | Active user access with valid token_version | `GET /api/auth/me` dengan `token_version: 1` | HTTP 200 OK | HTTP 200 OK | **PASS** |
| `SEC-008-02` | Deactivated user (`is_active: 0`) rejected instantly | `GET /api/auth/me` pada akun yang dinonaktifkan | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| `SEC-008-03` | Outdated token version rejected (Revocation Check) | `GET /api/auth/me` membawa token v1 setelah DB dinaikkan ke v2 | HTTP 401 Unauthorized (`tokenRevoked: true`) | HTTP 401 Unauthorized | **PASS** |
| `SEC-008-04` | Up-to-date token version accepted | `GET /api/auth/me` membawa token v2 baru | HTTP 200 OK | HTTP 200 OK | **PASS** |
| `SEC-008-05` | Real-time role demotion enforcement | `GET /api/admin/users` setelah peran di DB diubah dari Super Admin ke Author | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |

---

### GROUP 3: SEC-006 (HttpOnly Cookie Authentication & CSRF Protection)
| ID Pengujian | Deskripsi Kasus Uji | Metode & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| `SEC-006-01` | Browser Login sets HttpOnly auth cookie and CSRF cookie | `POST /api/auth/login` dengan `X-Auth-Client: browser` | Header `Set-Cookie` memuat `psu_auth_token` (HttpOnly) & `psu_csrf_token` | `psu_auth_token` HttpOnly terpasang, `psu_csrf_token` terpasang | **PASS** |
| `SEC-006-02` | Browser Login omits token in JSON response | JSON body inspeksi pada browser login | Properti `token` bernilai `undefined` | `token` tidak ada dalam respons JSON | **PASS** |
| `SEC-006-03` | Non-browser API login provides token in JSON | `POST /api/auth/login` tanpa header browser | JSON body memuat properti `token` | `token` string JWT HS256 valid dikembalikan | **PASS** |
| `SEC-006-04` | State-changing request via cookie auth missing CSRF token | `POST /api/authors` dengan auth cookie tanpa `X-CSRF-Token` | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| `SEC-006-05` | State-changing request with mismatched CSRF token | `POST /api/authors` dengan `X-CSRF-Token` acak / palsu | HTTP 403 Forbidden | HTTP 403 Forbidden | **PASS** |
| `SEC-006-06` | State-changing request with valid CSRF token & cookie auth | `POST /api/authors` dengan auth cookie & `X-CSRF-Token` valid | HTTP 201 Created | HTTP 201 Created | **PASS** |
| `SEC-006-07` | Logout endpoint revokes token and clears cookies | `POST /api/auth/logout` | HTTP 200 OK & cookie dibersihkan (`Max-Age=0`) | HTTP 200 OK, cookie kedaluwarsa seketika | **PASS** |

---

### GROUP 4: SEC-007 (Stored XSS Sanitization & Strict Origin Whitelist CORS)
| ID Pengujian | Deskripsi Kasus Uji | Metode & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| `SEC-007-01` | Strip `<script>` tags from HTML content | `sanitizeHtmlContent('<p>Text</p><script>alert(1)</script>')` | Script dan isinya dihapus total | `<p>Text</p>` | **PASS** |
| `SEC-007-02` | Strip event handler attributes (onerror, onload, etc.) | `sanitizeHtmlContent('<img src="x" onerror="alert(1)" />')` | Atribut onerror dibuang | `<img src="x" />` | **PASS** |
| `SEC-007-03` | Neutralize javascript: pseudo-protocol | `sanitizeHtmlContent('<a href="javascript:alert(1)">Link</a>')` | Protokol dinetralkan menjadi `href="#"` | `<a href="#">Link</a>` | **PASS** |
| `SEC-007-04` | Strip dangerous framing tags (iframe, embed, object) | `sanitizeHtmlContent('<iframe src="//evil.com"></iframe>')` | Tag framing dibuang | String bersih tanpa tag framing | **PASS** |
| `SEC-007-05` | Plain text sanitizer strips all HTML tags | `sanitizePlainText('<script>steal()</script><b>Judul SNI</b>')` | Seluruh markup HTML dihilangkan | `Judul SNI` | **PASS** |
| `SEC-007-06` | Integration: POST /api/artikel auto-sanitizes input | `POST /api/artikel` membawa muatan Stored XSS | Data tersimpan dan respons bersih dari muatan XSS | Tag `<script>` dan atribut event handler hilang | **PASS** |
| `SEC-007-07` | CORS allows registered origin with credentials | `OPTIONS /api/artikel` dengan `Origin: http://localhost:5173` | `Access-Control-Allow-Origin: http://localhost:5173`, `Credentials: true` | Header CORS sah dikembalikan | **PASS** |
| `SEC-007-08` | CORS rejects untrusted / malicious origin | `OPTIONS /api/artikel` dengan `Origin: https://evil-attacker.com` | Tidak menyetel header `Access-Control-Allow-Origin` | Header `Access-Control-Allow-Origin` kosong (diblokir) | **PASS** |

---

### GROUP 5: REGRESI & INTEGRITAS FITUR
| ID Pengujian | Deskripsi Kasus Uji | Metode & Input | Hasil yang Diharapkan | Hasil Aktual | Status |
|---|---|---|---|---|---|
| `REG-02-01` | Public articles list integrity | `GET /api/artikel` | HTTP 200 OK & array data artikel | HTTP 200 OK | **PASS** |
| `REG-02-02` | Public media gallery integrity | `GET /api/galeri` | HTTP 200 OK | HTTP 200 OK | **PASS** |
| `REG-02-03` | Admin dashboard stats integrity | `GET /api/admin/stats` dengan token admin | HTTP 200 OK & metrik artikel lengkap | HTTP 200 OK | **PASS** |

---

## 2. HASIL PENGUJIAN REGRESI KUMULATIF KESELURUHAN

| Tahapan Verifikasi | Berkas Test Suite | Total Pengujian | Lolos (PASS) | Gagal (FAIL) | Tingkat Keberhasilan |
|---|---|---|---|---|---|
| **Phase 1** | `backend/tests/verify_phase1.js` | 21 | 21 | 0 | 100% |
| **Phase 1.1** | `backend/tests/verify_phase1_1.js` | 21 | 21 | 0 | 100% |
| **Phase 1.2** | `backend/tests/verify_phase1_2.js` | 12 | 12 | 0 | 100% |
| **Phase 1.3** | `backend/tests/verify_phase1_3.js` | 25 | 25 | 0 | 100% |
| **Phase 1.3.1** | `backend/tests/verify_phase1_3_1.js` | 14 | 14 | 0 | 100% |
| **Phase 2** | `backend/tests/verify_phase2.js` | 31 | 31 | 0 | 100% |
| **TOTAL KUMULATIF** | **6 Test Suites Terpadu** | **124** | **124** | **0** | **100.0%** |

---

## 3. KESIMPULAN HASIL PENGUJIAN

1. **Zero Vulnerability Regressions:** Seluruh 124 kasus uji lolos tanpa ada satupun kegagalan fungsional maupun keamanan.
2. **Frontend Build Verification:** Aplikasi frontend React + Vite berhasil dikompilasi ke folder `company-profile/dist` (`npm run build`) tanpa error atau peringatan linting.
3. **Defense in Depth Terbukti:**
   - Pencurian token via XSS telah dimitigasi di 2 lapisan: sanitasi input HTML (SEC-007) dan isolasi token pada HttpOnly Cookie (SEC-006).
   - Manipulasi sesi lintas-domain dimitigasi di 2 lapisan: verifikasi origin whitelist CORS (SEC-007) dan double-submit CSRF token (SEC-006).
   - Kebocoran otorisasi pengguna dinonaktifkan dimitigasi secara instan melalui validasi status akun langsung dan versioning token di database (SEC-008).
   - Kegagalan password hash dimitigasi dengan eliminasi total fallback plaintext (SEC-005).
