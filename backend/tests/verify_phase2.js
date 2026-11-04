/**
 * ============================================================================
 * PHASE 2 SECURITY REMEDIATION — AUTOMATED VERIFICATION TEST SUITE
 * PT PENILAI STANDAR UJI (PSU)
 * ============================================================================
 * 
 * Verifies:
 * - SEC-005: Plaintext Password Verification Fallback Elimination & Certificate Tracker Hardening
 * - SEC-008: Inactive User Access Rejection & Real-time Token Revocation via token_version
 * - SEC-006: Insecure Session Management Remediation (HttpOnly Cookie, CSRF, No localStorage JWT)
 * - SEC-007: Stored XSS Neutralization & Strict Origin Whitelist CORS Configuration
 */

const http = require("http");
const { PassThrough } = require("stream");
const path = require("path");
const crypto = require("crypto");

// Ensure environment is loaded
const envPath = path.resolve(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });

const {
  app,
  initDatabase,
  TABLE_MAP,
  verifyPassword,
  hashPassword,
  sanitizeHtmlContent,
  sanitizePlainText,
  isOriginAllowed,
  ALLOWED_ORIGIN_SET,
  fallbackStore,
  signJwt,
  verifyJwt,
  extractToken,
} = require("../server");

// Helper HTTP In-Memory Client for Express
function makeRequest(appInstance, options) {
  return new Promise((resolve, reject) => {
    const {
      method = "GET",
      url = "/",
      headers = {},
      body = null,
      ip = "127.0.0.1",
    } = options;

    let bodyBuf = null;
    if (body !== null && body !== undefined) {
      bodyBuf = Buffer.isBuffer(body)
        ? body
        : Buffer.from(typeof body === "object" ? JSON.stringify(body) : String(body));
    }

    const socket = new PassThrough();
    socket.remoteAddress = ip;
    socket.encrypted = false;

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.ip = ip;
    req.headers = {
      host: "localhost",
      "user-agent": "security-verifier-harness/2.0",
      ...headers,
    };

    if (bodyBuf) {
      if (!req.headers["content-length"]) {
        req.headers["content-length"] = String(bodyBuf.length);
      }
      if (!req.headers["content-type"] && typeof body === "object") {
        req.headers["content-type"] = "application/json";
      }
    }

    const resSocket = new PassThrough();
    const res = new http.ServerResponse(req);
    res.assignSocket(resSocket);

    const chunks = [];
    resSocket.on("data", (chunk) => chunks.push(chunk));

    res.on("finish", () => {
      const fullBuffer = Buffer.concat(chunks);
      const str = fullBuffer.toString("utf8");
      const splitIdx = str.indexOf("\r\n\r\n");
      const rawBody = splitIdx >= 0 ? str.slice(splitIdx + 4) : str;
      let json = null;
      try {
        json = JSON.parse(rawBody);
      } catch {}

      resolve({
        status: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        body: rawBody,
        json,
      });
    });

    req.on("error", reject);
    resSocket.on("error", reject);

    appInstance.handle(req, res);

    if (bodyBuf) {
      req.push(bodyBuf);
    }
    req.push(null);
  });
}

const results = [];
function recordTest(id, name, passed, detail) {
  results.push({ id, name, passed, detail });
  const statusStr = passed ? "[PASS]" : "[FAIL]";
  console.log(`${statusStr} ${id}: ${name}`);
  if (!passed || process.env.VERBOSE) {
    console.log(`       Detail: ${detail}`);
  }
}

async function runTestSuite() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) — VERIFIKASI KEAMANAN PHASE 2");
  console.log("Application Security Hardening & Vulnerability Remediation");
  console.log("====================================================================\n");

  await initDatabase();

  // =========================================================================
  // GROUP 1: SEC-005 (Plaintext Password Fallback & Certificate SQLi Hardening)
  // =========================================================================
  console.log("--- [SEC-005] Verifikasi Password Verification & Certificate Tracker Hardening ---");

  // 1.1 Plaintext password check MUST fail closed
  const plainMatch = verifyPassword("PlaintextPass123!", "PlaintextPass123!");
  recordTest(
    "SEC-005-01",
    "Fungsi verifyPassword menolak komparasi plaintext password secara mutlak (Fail-Closed)",
    plainMatch === false,
    `verifyPassword('PlaintextPass123!', 'PlaintextPass123!') returned: ${plainMatch} (expected false)`
  );

  // 1.2 Non-scrypt hashes or malformed hashes fail closed
  const md5Match = verifyPassword("Secret123!", "md5:c3284d0f94606de1fd2af172abb1550e");
  const nullMatch = verifyPassword("Secret123!", null);
  const emptyMatch = verifyPassword("Secret123!", "");
  recordTest(
    "SEC-005-02",
    "Fungsi verifyPassword menolak format hash non-scrypt, string kosong, atau null",
    md5Match === false && nullMatch === false && emptyMatch === false,
    `md5: ${md5Match}, null: ${nullMatch}, empty: ${emptyMatch}`
  );

  // 1.3 Genuine scrypt hash verification
  const validHash = hashPassword("ValidScryptPass2026!");
  const genuineMatch = verifyPassword("ValidScryptPass2026!", validHash);
  const wrongMatch = verifyPassword("WrongPassword123!", validHash);
  recordTest(
    "SEC-005-03",
    "Fungsi verifyPassword memverifikasi scrypt hash sah dengan timing-safe equality",
    genuineMatch === true && wrongMatch === false,
    `Genuine: ${genuineMatch}, Wrong: ${wrongMatch}`
  );

  // 1.4 TABLE_MAP is frozen against prototype tampering
  const isMapFrozen = Object.isFrozen(TABLE_MAP);
  recordTest(
    "SEC-005-04",
    "TABLE_MAP dibekukan secara permanen (Object.isFrozen === true)",
    isMapFrozen === true,
    `Object.isFrozen(TABLE_MAP): ${isMapFrozen}`
  );

  // 1.5 Certificate Tracker rejects invalid or prototyped submenu
  const invalidSubmenuRes = await makeRequest(app, {
    method: "GET",
    url: "/api/sertifikat/constructor?no_sertifikat=PSU-123",
  });
  const protoSubmenuRes = await makeRequest(app, {
    method: "GET",
    url: "/api/sertifikat/__proto__?no_sertifikat=PSU-123",
  });
  recordTest(
    "SEC-005-05",
    "Endpoint sertifikat menolak submenu yang tidak sah atau manipulasi prototype (HTTP 400)",
    invalidSubmenuRes.status === 400 && protoSubmenuRes.status === 400,
    `constructor: ${invalidSubmenuRes.status}, __proto__: ${protoSubmenuRes.status}`
  );

  // 1.6 Certificate Tracker rejects empty or missing certificate number
  const emptyCertRes = await makeRequest(app, {
    method: "GET",
    url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=",
  });
  recordTest(
    "SEC-005-06",
    "Endpoint sertifikat menolak parameter nomor sertifikat kosong (HTTP 400)",
    emptyCertRes.status === 400,
    `Status: ${emptyCertRes.status}, Message: ${emptyCertRes.json?.message}`
  );

  // 1.7 Certificate Tracker rejects overly long certificate numbers (> 100 chars)
  const longCert = "A".repeat(101);
  const longCertRes = await makeRequest(app, {
    method: "GET",
    url: `/api/sertifikat/sertifikasi-produk?no_sertifikat=${longCert}`,
  });
  recordTest(
    "SEC-005-07",
    "Endpoint sertifikat menolak nomor sertifikat melampaui batas maksimal 100 karakter (HTTP 400)",
    longCertRes.status === 400 && String(longCertRes.json?.message).includes("100 karakter"),
    `Status: ${longCertRes.status}, Message: ${longCertRes.json?.message}`
  );

  // 1.8 Certificate Tracker rejects null bytes and control characters
  const nullByteCertRes = await makeRequest(app, {
    method: "GET",
    url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=PSU%00123",
  });
  recordTest(
    "SEC-005-08",
    "Endpoint sertifikat menolak karakter terlarang / null bytes (HTTP 400)",
    nullByteCertRes.status === 400,
    `Status: ${nullByteCertRes.status}, Message: ${nullByteCertRes.json?.message}`
  );

  // =========================================================================
  // GROUP 2: SEC-008 (Inactive User Access & Token Revocation via token_version)
  // =========================================================================
  console.log("\n--- [SEC-008] Verifikasi Penolakan Akun Nonaktif & Token Revocation ---");

  // Siapkan akun pengujian di fallback store
  const testUserId = 998877;
  const testUsername = "user_sec008_test";
  const testPassword = "PasswordSec008!";
  const testUserHash = hashPassword(testPassword);

  // Tambahkan pengguna pengujian dengan is_active: 1 dan token_version: 1
  fallbackStore.users = fallbackStore.users.filter((u) => u.id !== testUserId && u.username !== testUsername);
  fallbackStore.users.push({
    id: testUserId,
    username: testUsername,
    email: "sec008@penilaistandaruji.com",
    password_hash: testUserHash,
    full_name: "Test Sec008 User",
    role: "Super Admin",
    is_active: 1,
    token_version: 1,
    last_login: null,
    created_at: new Date().toISOString(),
  });

  // 2.1 Terbitkan token JWT dengan token_version: 1
  const { token: testTokenV1 } = signJwt({
    sub: testUserId,
    username: testUsername,
    email: "sec008@penilaistandaruji.com",
    full_name: "Test Sec008 User",
    role: "Super Admin",
    token_version: 1,
  });

  // Uji akses awal: harus diizinkan (HTTP 200)
  const initialAccessRes = await makeRequest(app, {
    method: "GET",
    url: "/api/auth/me",
    headers: { authorization: `Bearer ${testTokenV1}` },
  });
  recordTest(
    "SEC-008-01",
    "Akun aktif dengan token_version valid berhasil mengakses /api/auth/me (HTTP 200)",
    initialAccessRes.status === 200 && initialAccessRes.json?.user?.username === testUsername,
    `Status: ${initialAccessRes.status}`
  );

  // 2.2 Nonaktifkan akun (is_active: 0): Akses harus SEGERA DITOLAK (HTTP 403 Forbidden)
  const targetUserInStore = fallbackStore.users.find((u) => u.id === testUserId);
  targetUserInStore.is_active = 0;

  const deactivatedAccessRes = await makeRequest(app, {
    method: "GET",
    url: "/api/auth/me",
    headers: { authorization: `Bearer ${testTokenV1}` },
  });
  recordTest(
    "SEC-008-02",
    "Akun yang dinonaktifkan (is_active = 0) langsung DITOLAK mengakses API (HTTP 403 Forbidden)",
    deactivatedAccessRes.status === 403,
    `Status: ${deactivatedAccessRes.status}, Message: ${deactivatedAccessRes.json?.message}`
  );

  // 2.3 Aktifkan kembali akun, tetapi inkrementasi token_version menjadi 2 (Revocation test)
  targetUserInStore.is_active = 1;
  targetUserInStore.token_version = 2; // Token lama (v1) sekarang revoked

  const revokedTokenRes = await makeRequest(app, {
    method: "GET",
    url: "/api/auth/me",
    headers: { authorization: `Bearer ${testTokenV1}` },
  });
  recordTest(
    "SEC-008-03",
    "Token lama dengan token_version usang langsung DITOLAK (HTTP 401 Unauthorized / tokenRevoked)",
    revokedTokenRes.status === 401 && revokedTokenRes.json?.tokenRevoked === true,
    `Status: ${revokedTokenRes.status}, tokenRevoked: ${revokedTokenRes.json?.tokenRevoked}`
  );

  // 2.4 Token baru dengan token_version: 2 berhasil mengakses API
  const { token: testTokenV2 } = signJwt({
    sub: testUserId,
    username: testUsername,
    email: "sec008@penilaistandaruji.com",
    full_name: "Test Sec008 User",
    role: "Super Admin",
    token_version: 2,
  });
  const newTokenAccessRes = await makeRequest(app, {
    method: "GET",
    url: "/api/auth/me",
    headers: { authorization: `Bearer ${testTokenV2}` },
  });
  recordTest(
    "SEC-008-04",
    "Token baru dengan token_version mutakhir (v2) berhasil mengakses API secara normal",
    newTokenAccessRes.status === 200,
    `Status: ${newTokenAccessRes.status}`
  );

  // 2.5 Role Freshness: Demosi peran di database langsung berlaku tanpa menunggu exp token
  targetUserInStore.role = "Author"; // Turunkan dari Super Admin ke Author
  const demotedRoleRes = await makeRequest(app, {
    method: "GET",
    url: "/api/admin/users", // Butuh Super Admin
    headers: { authorization: `Bearer ${testTokenV2}` },
  });
  recordTest(
    "SEC-008-05",
    "Perubahan hak akses peran (role) langsung berlaku real-time tanpa menunggu token kedaluwarsa (HTTP 403)",
    demotedRoleRes.status === 403,
    `Status: ${demotedRoleRes.status}, Message: ${demotedRoleRes.json?.message}`
  );

  // =========================================================================
  // GROUP 3: SEC-006 (HttpOnly Cookie Authentication & CSRF Protection)
  // =========================================================================
  console.log("\n--- [SEC-006] Verifikasi HttpOnly Cookie Authentication & CSRF Protection ---");

  // 3.1 Login via browser client (X-Auth-Client: browser)
  targetUserInStore.role = "Super Admin";
  const browserLoginRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    headers: { "x-auth-client": "browser" },
    body: { username: testUsername, password: testPassword },
  });

  const setCookieHeaders = browserLoginRes.headers["set-cookie"] || [];
  const cookieStr = Array.isArray(setCookieHeaders) ? setCookieHeaders.join("; ") : String(setCookieHeaders);
  const hasHttpOnlyAuthCookie =
    cookieStr.includes("psu_auth_token=") && cookieStr.includes("HttpOnly");
  const hasCsrfCookie = cookieStr.includes("psu_csrf_token=");
  const jsonOmitsToken = browserLoginRes.json?.token === undefined;

  recordTest(
    "SEC-006-01",
    "Browser Login menerbitkan psu_auth_token sebagai HttpOnly cookie dan psu_csrf_token",
    browserLoginRes.status === 200 && hasHttpOnlyAuthCookie && hasCsrfCookie,
    `HttpOnly Auth Cookie: ${hasHttpOnlyAuthCookie}, CSRF Cookie: ${hasCsrfCookie}`
  );

  recordTest(
    "SEC-006-02",
    "Browser Login TIDAK mengembalikan token di JSON response (mencegah penyimpanan di localStorage)",
    jsonOmitsToken,
    `Token property in JSON: ${browserLoginRes.json?.token}`
  );

  // 3.2 Non-browser login (CLI/API) tetap mengembalikan token di JSON untuk backward compatibility
  const apiLoginRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    body: { username: testUsername, password: testPassword },
  });
  recordTest(
    "SEC-006-03",
    "Non-browser API login tetap menyediakan token di JSON untuk kompatibilitas CLI & automated tests",
    apiLoginRes.status === 200 && Boolean(apiLoginRes.json?.token),
    `Status: ${apiLoginRes.status}, Has Token: ${Boolean(apiLoginRes.json?.token)}`
  );

  // Ekstrak cookies dari browser login
  const authTokenMatch = cookieStr.match(/psu_auth_token=([^;]+)/);
  const csrfTokenMatch = cookieStr.match(/psu_csrf_token=([^;]+)/);
  const clientAuthCookie = authTokenMatch ? authTokenMatch[1] : "";
  const clientCsrfToken = csrfTokenMatch ? csrfTokenMatch[1] : "";

  // 3.3 State-changing request via cookie auth TANPA CSRF token ditolak (HTTP 403)
  const noCsrfPostRes = await makeRequest(app, {
    method: "POST",
    url: "/api/authors",
    headers: {
      cookie: `psu_auth_token=${clientAuthCookie}; psu_csrf_token=${clientCsrfToken}`,
      // X-CSRF-Token sengaja tidak dikirim
    },
    body: { name: "Penulis Uji No CSRF" },
  });
  recordTest(
    "SEC-006-04",
    "Permintaan mutasi (POST) dengan cookie autentikasi TANPA X-CSRF-Token DITOLAK (HTTP 403 Forbidden)",
    noCsrfPostRes.status === 403,
    `Status: ${noCsrfPostRes.status}, Message: ${noCsrfPostRes.json?.message}`
  );

  // 3.4 State-changing request dengan CSRF token palsu ditolak (HTTP 403)
  const fakeCsrfPostRes = await makeRequest(app, {
    method: "POST",
    url: "/api/authors",
    headers: {
      cookie: `psu_auth_token=${clientAuthCookie}; psu_csrf_token=${clientCsrfToken}`,
      "x-csrf-token": "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
    body: { name: "Penulis Uji Fake CSRF" },
  });
  recordTest(
    "SEC-006-05",
    "Permintaan mutasi dengan X-CSRF-Token palsu / mismatch DITOLAK (HTTP 403 Forbidden)",
    fakeCsrfPostRes.status === 403,
    `Status: ${fakeCsrfPostRes.status}, Message: ${fakeCsrfPostRes.json?.message}`
  );

  // 3.5 State-changing request dengan CSRF token valid & cookie auth berhasil (HTTP 201)
  const validCsrfPostRes = await makeRequest(app, {
    method: "POST",
    url: "/api/authors",
    headers: {
      cookie: `psu_auth_token=${clientAuthCookie}; psu_csrf_token=${clientCsrfToken}`,
      "x-csrf-token": clientCsrfToken,
      origin: "http://localhost:5173",
    },
    body: { name: `Penulis Valid CSRF ${Date.now()}` },
  });
  recordTest(
    "SEC-006-06",
    "Permintaan mutasi dengan cookie auth dan X-CSRF-Token valid DITERIMA (HTTP 201 Created)",
    validCsrfPostRes.status === 201,
    `Status: ${validCsrfPostRes.status}`
  );

  // 3.6 Endpoint POST /api/auth/logout membatalkan sesi dan menghapus cookie
  const logoutRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/logout",
    headers: {
      cookie: `psu_auth_token=${clientAuthCookie}; psu_csrf_token=${clientCsrfToken}`,
      "x-csrf-token": clientCsrfToken,
    },
  });
  const logoutCookies = logoutRes.headers["set-cookie"] || [];
  const logoutCookieStr = Array.isArray(logoutCookies) ? logoutCookies.join("; ") : String(logoutCookies);
  const authCookieCleared = logoutCookieStr.includes("psu_auth_token=;") || logoutCookieStr.includes("Max-Age=0") || logoutCookieStr.includes("Expires=");
  recordTest(
    "SEC-006-07",
    "Endpoint POST /api/auth/logout membersihkan cookie psu_auth_token dan membatalkan sesi",
    logoutRes.status === 200 && authCookieCleared,
    `Status: ${logoutRes.status}, Cookie Cleared: ${authCookieCleared}`
  );

  // =========================================================================
  // GROUP 4: SEC-007 (Stored XSS Sanitization & Strict Origin Whitelist CORS)
  // =========================================================================
  console.log("\n--- [SEC-007] Verifikasi Sanitasi HTML Stored XSS & Strict CORS ---");

  // 4.1 Unit Test: sanitizeHtmlContent membuang dangerous script tags
  const dirtyScript = "<p>Paragraf Berita</p><script>alert('XSS Attack')</script>";
  const cleanScript = sanitizeHtmlContent(dirtyScript);
  recordTest(
    "SEC-007-01",
    "Fungsi sanitizeHtmlContent membuang tag <script> beserta seluruh isinya",
    !cleanScript.includes("<script") && cleanScript.includes("<p>Paragraf Berita</p>"),
    `Result: '${cleanScript}'`
  );

  // 4.2 Unit Test: sanitizeHtmlContent membuang event handler attributes (onload, onerror, onclick)
  const dirtyHandler = '<img src="valid.png" onerror="alert(1)" onload="evil()" />';
  const cleanHandler = sanitizeHtmlContent(dirtyHandler);
  recordTest(
    "SEC-007-02",
    "Fungsi sanitizeHtmlContent membuang atribut event handler (onerror, onload, onclick)",
    !cleanHandler.includes("onerror") && !cleanHandler.includes("onload") && cleanHandler.includes('src="valid.png"'),
    `Result: '${cleanHandler}'`
  );

  // 4.3 Unit Test: sanitizeHtmlContent menetralkan javascript: pseudo-protocol
  const dirtyHref = '<a href="javascript:alert(document.cookie)">Klik Hadiah</a>';
  const cleanHref = sanitizeHtmlContent(dirtyHref);
  recordTest(
    "SEC-007-03",
    "Fungsi sanitizeHtmlContent menetralkan link dengan protokol javascript: menjadi href='#'",
    !cleanHref.includes("javascript:") && cleanHref.includes('href="#"'),
    `Result: '${cleanHref}'`
  );

  // 4.4 Unit Test: sanitizeHtmlContent membuang iframe, object, embed
  const dirtyIframe = '<p>Sebelum</p><iframe src="//evil.com"></iframe><embed src="flash.swf"><p>Sesudah</p>';
  const cleanIframe = sanitizeHtmlContent(dirtyIframe);
  recordTest(
    "SEC-007-04",
    "Fungsi sanitizeHtmlContent membuang tag dangerous framing (iframe, embed, object)",
    !cleanIframe.includes("<iframe") && !cleanIframe.includes("<embed") && cleanIframe.includes("Sebelum") && cleanIframe.includes("Sesudah"),
    `Result: '${cleanIframe}'`
  );

  // 4.5 Unit Test: sanitizePlainText membuang seluruh tag HTML untuk judul & kutipan
  const dirtyTitle = "<script>steal()</script><b>Judul Resmi SNI</b>";
  const cleanTitle = sanitizePlainText(dirtyTitle);
  recordTest(
    "SEC-007-05",
    "Fungsi sanitizePlainText membuang seluruh tag HTML pada field judul dan kutipan",
    cleanTitle === "Judul Resmi SNI",
    `Result: '${cleanTitle}'`
  );

  // 4.6 Integration Test: POST /api/artikel dengan payload XSS tersimpan dalam bentuk bersih
  // Dapatkan token Super Admin untuk membuat artikel
  const superAdmin = fallbackStore.users.find((u) => u.role === "Super Admin");
  const { token: superToken } = signJwt({
    sub: superAdmin.id,
    username: superAdmin.username,
    email: superAdmin.email,
    full_name: superAdmin.full_name,
    role: "Super Admin",
    token_version: superAdmin.token_version || 1,
  });

  const xssArticleRes = await makeRequest(app, {
    method: "POST",
    url: "/api/artikel",
    headers: { authorization: `Bearer ${superToken}` },
    body: {
      title_id: "<script>alert('Title XSS')</script>Berita Standar Pengujian SNI Terkini",
      content_id: "<p>Konten berita SNI.</p><img src='news.jpg' onerror='alert(\"XSS\")' /><script>evil()</script>",
      category: "News",
    },
  });

  const createdData = xssArticleRes.json?.data;
  const isTitleSafe =
    createdData?.title_id &&
    !createdData.title_id.includes("<script") &&
    createdData.title_id.includes("Berita Standar Pengujian");
  const isContentSafe =
    createdData?.content_id &&
    !createdData.content_id.includes("<script") &&
    !createdData.content_id.includes("onerror");

  recordTest(
    "SEC-007-06",
    "Endpoint POST /api/artikel secara otomatis membersihkan muatan Stored XSS sebelum disimpan",
    xssArticleRes.status === 201 && isTitleSafe && isContentSafe,
    `Title: '${createdData?.title_id}', Content: '${createdData?.content_id}'`
  );

  // 4.7 Strict Origin Whitelist CORS: Origin terdaftar diizinkan dengan kredensial
  const allowedOriginRes = await makeRequest(app, {
    method: "OPTIONS",
    url: "/api/artikel",
    headers: {
      origin: "http://localhost:5173",
      "access-control-request-method": "POST",
    },
  });
  const allowOriginHeader = allowedOriginRes.headers["access-control-allow-origin"];
  const allowCredsHeader = allowedOriginRes.headers["access-control-allow-credentials"];
  recordTest(
    "SEC-007-07",
    "Origin terdaftar (http://localhost:5173) diizinkan oleh CORS dengan Access-Control-Allow-Credentials: true",
    allowOriginHeader === "http://localhost:5173" && String(allowCredsHeader) === "true",
    `Allow-Origin: ${allowOriginHeader}, Allow-Credentials: ${allowCredsHeader}`
  );

  // 4.8 Strict Origin Whitelist CORS: Origin penyerang TIDAK diberikan izin CORS
  const evilOriginRes = await makeRequest(app, {
    method: "OPTIONS",
    url: "/api/artikel",
    headers: {
      origin: "https://evil-attacker.com",
      "access-control-request-method": "POST",
    },
  });
  const evilAllowOrigin = evilOriginRes.headers["access-control-allow-origin"];
  recordTest(
    "SEC-007-08",
    "Origin tidak dikenal (https://evil-attacker.com) DITOLAK CORS (Access-Control-Allow-Origin tidak disetel)",
    !evilAllowOrigin,
    `evilAllowOrigin: ${evilAllowOrigin || "None (Rejected cleanly)"}`
  );

  // =========================================================================
  // GROUP 5: REGRESI DAN INTEGRITAS FITUR
  // =========================================================================
  console.log("\n--- [REGRESSION] Integritas Layanan Aplikasi PT PENILAI STANDAR UJI ---");

  // 5.1 Endpoint publik /api/artikel tetap dapat diakses
  const publicArtRes = await makeRequest(app, { method: "GET", url: "/api/artikel" });
  recordTest(
    "REG-02-01",
    "Endpoint publik /api/artikel berjalan lancar tanpa regresi (HTTP 200)",
    publicArtRes.status === 200 && Array.isArray(publicArtRes.json?.data),
    `Status: ${publicArtRes.status}, Total Artikel: ${publicArtRes.json?.data?.length}`
  );

  // 5.2 Endpoint publik /api/galeri tetap dapat diakses
  const publicGalRes = await makeRequest(app, { method: "GET", url: "/api/galeri" });
  recordTest(
    "REG-02-02",
    "Endpoint publik /api/galeri berjalan lancar tanpa regresi (HTTP 200)",
    publicGalRes.status === 200,
    `Status: ${publicGalRes.status}`
  );

  // 5.3 Endpoint admin stats tetap dapat diakses oleh admin
  const adminStatsRes = await makeRequest(app, {
    method: "GET",
    url: "/api/admin/stats",
    headers: { authorization: `Bearer ${superToken}` },
  });
  recordTest(
    "REG-02-03",
    "Endpoint statistik dashboard /api/admin/stats berjalan lancar (HTTP 200)",
    adminStatsRes.status === 200 && Boolean(adminStatsRes.json?.data?.totalArticles),
    `Status: ${adminStatsRes.status}, Articles count: ${adminStatsRes.json?.data?.totalArticles}`
  );

  // =========================================================================
  // RINGKASAN AKHIR
  // =========================================================================
  console.log("\n====================================================================");
  console.log("PHASE 2 SECURITY REMEDIATION VERIFICATION SUMMARY");
  console.log("====================================================================");
  const total = results.length;
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;

  console.log(`Total Pengujian Phase 2 : ${total}`);
  console.log(`Lolos (PASS)            : ${passed}`);
  console.log(`Gagal (FAIL)            : ${failed}`);

  if (failed === 0) {
    console.log("\n[VERIFICATION SUCCESS] SELURUH PENGUJIAN KEAMANAN PHASE 2 LOLOS DENGAN SEMPURNA (100% PASS)!");
    process.exit(0);
  } else {
    console.error(`\n[VERIFICATION FAILURE] Ditemukan ${failed} pengujian yang gagal.`);
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error("Test execution fatal error:", err);
  process.exit(1);
});

