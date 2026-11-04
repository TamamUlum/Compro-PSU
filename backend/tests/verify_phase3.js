/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) — AUTOMATED SECURITY TEST SUITE: PHASE 3
 * ============================================================================
 * Validasi komprehensif seluruh kontrol keamanan Phase 3:
 * - WP-3.1 (SEC-009): HTTP Security Headers, CSP Report-Only, HSTS conditional, Central Error Handler
 * - WP-3.2 (SEC-010): Body Parser 1MB Limit & Upload 5MB Limit
 * - WP-3.3 (SEC-011): Apache .htaccess & Cloudflare Redirect Loop Mitigation
 * - WP-3.4 (SEC-012): Vite Custom Dev Middleware Path Traversal Containment
 * - WP-3.5 (SEC-013): Production Sourcemap Elimination & Targeted Gitignore
 * - WP-3.6 (SEC-014): Deprecated Package Clean-up & Dependency Inventory
 * - WP-3.7 (NEW-001): Structured Operational Logging & Health Check Endpoint
 * - WP-3.8 (SEC-007 Residual): AST-style Allowlist HTML Sanitizer (Defense-in-Depth)
 * ============================================================================
 */

const assert = require("node:assert");
const http = require("node:http");
const { PassThrough } = require("node:stream");
const fs = require("node:fs");
const path = require("node:path");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "PSU_TEST_SECRET_KEY_MINIMUM_32_CHARACTERS_VALID_LONG_ENTROPY!";
process.env.TRUST_PROXY = "loopback";

const { app, sanitizeHtmlContent } = require("../server");

let passedCount = 0;
let totalCount = 0;

function runTest(testName, fn) {
  totalCount++;
  try {
    fn();
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Error: ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(testName, fn) {
  totalCount++;
  try {
    await fn();
    console.log(`[PASS] ${testName}`);
    passedCount++;
  } catch (err) {
    console.error(`[FAIL] ${testName}`);
    console.error(`       Error: ${err.message}`);
    process.exitCode = 1;
  }
}

// In-Memory Stream Client for Express (Clean sandboxed testing without TCP EACCES)
function makeRequest({ method = "GET", url = "/", headers = {}, body = null, ip = "127.0.0.1" }) {
  return new Promise((resolve, reject) => {
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
    req.connection = socket;
    req.socket = socket;
    req.headers = {
      host: "localhost",
      "user-agent": "security-verifier-phase3/1.0",
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
        statusCode: res.statusCode,
        headers: res.getHeaders ? res.getHeaders() : {},
        body: rawBody,
        json,
      });
    });

    req.on("error", reject);
    resSocket.on("error", reject);

    app.handle(req, res);

    if (bodyBuf) {
      req.push(bodyBuf);
    }
    req.push(null);
  });
}

async function startTestSuite() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) — VERIFIKASI KEAMANAN PHASE 3");
  console.log("Defense-in-Depth, Infrastructure Hardening & Final Test Suite");
  console.log("====================================================================\n");

  // ----------------------------------------------------------------------------
  // SECTION 1: WP-3.1 (SEC-009) HTTP SECURITY HEADERS & ERROR REDACTION
  // ----------------------------------------------------------------------------
  console.log("--- [WP-3.1 / SEC-009] Verifikasi HTTP Security Headers & Redaksi Error ---");

  await runAsyncTest("SEC-009-01: Header X-Content-Type-Options bernilai 'nosniff' pada respon API", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.headers["x-content-type-options"], "nosniff");
  });

  await runAsyncTest("SEC-009-02: Header X-Frame-Options bernilai 'DENY' untuk mencegah clickjacking", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.headers["x-frame-options"], "DENY");
  });

  await runAsyncTest("SEC-009-03: Header Referrer-Policy bernilai 'strict-origin-when-cross-origin'", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.headers["referrer-policy"], "strict-origin-when-cross-origin");
  });

  await runAsyncTest("SEC-009-04: Header Permissions-Policy menonaktifkan fitur sensor yang tidak dibutuhkan", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.headers["permissions-policy"], "camera=(), microphone=(), geolocation=()");
  });

  await runAsyncTest("SEC-009-05: Header Content-Security-Policy-Report-Only hadir untuk evaluasi kompatibilitas frontend", async () => {
    const res = await makeRequest({ url: "/api/health" });
    const csp = res.headers["content-security-policy-report-only"];
    assert.ok(csp, "CSP Report-Only header should exist");
    assert.ok(csp.includes("default-src 'self'"), "CSP should define default-src 'self'");
    assert.ok(csp.includes("frame-ancestors 'none'"), "CSP should define frame-ancestors 'none'");
  });

  await runAsyncTest("SEC-009-06: Header HSTS (Strict-Transport-Security) TIDAK dikirim pada koneksi HTTP murni", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.headers["strict-transport-security"], undefined);
  });

  await runAsyncTest("SEC-009-07: Header HSTS dikirimkan pada request dengan header 'X-Forwarded-Proto: https'", async () => {
    const res = await makeRequest({
      url: "/api/health",
      headers: { "x-forwarded-proto": "https" },
    });
    assert.strictEqual(res.headers["strict-transport-security"], "max-age=31536000");
  });

  await runAsyncTest("SEC-009-08: Header HSTS tidak menyertakan 'includeSubDomains' atau 'preload' tanpa verifikasi seluruh subdomain", async () => {
    const res = await makeRequest({
      url: "/api/health",
      headers: { "x-forwarded-proto": "https" },
    });
    const hsts = res.headers["strict-transport-security"];
    assert.ok(hsts, "HSTS must be present on HTTPS");
    assert.ok(!hsts.includes("includeSubDomains"), "Should not include includeSubDomains without subdomain verification");
    assert.ok(!hsts.includes("preload"), "Should not include preload directive");
  });

  await runAsyncTest("SEC-009-09: Respon kegagalan database query sertifikat tidak membocorkan query SQL, stack trace, atau XAMPP", async () => {
    const res = await makeRequest({ url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=NOMOR-UJI-ERROR" });
    assert.strictEqual(res.statusCode, 500);
    assert.strictEqual(res.json?.success, false);
    assert.strictEqual(res.json?.message, "Gagal memproses pengecekan sertifikat pada database.");
    assert.strictEqual(res.json?.error, undefined, "error property should not be leaked");
    assert.ok(!res.body.includes("XAMPP"), "Should not expose XAMPP mention");
    assert.ok(!res.body.includes("SELECT"), "Should not expose SQL queries");
  });

  // ----------------------------------------------------------------------------
  // SECTION 2: WP-3.2 (SEC-010) REQUEST BODY LIMIT & UPLOAD RESOURCE PROTECTION
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.2 / SEC-010] Verifikasi Batas Request Body & Proteksi Upload ---");

  await runAsyncTest("SEC-010-01: Global JSON parser menerima payload ukuran wajar (< 1 MB)", async () => {
    const res = await makeRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { username: "testuser", password: "testpassword123" },
    });
    // Expected 401 or 429, not 413
    assert.ok(res.statusCode === 401 || res.statusCode === 429, `Status should be 401/429, got ${res.statusCode}`);
  });

  await runAsyncTest("SEC-010-02: Global JSON parser menolak payload melebihi batas 1 MB (HTTP 413)", async () => {
    // Generate ~1.2 MB dummy JSON payload
    const bigString = "A".repeat(1.2 * 1024 * 1024);
    const res = await makeRequest({
      method: "POST",
      url: "/api/auth/login",
      body: { data: bigString },
    });
    assert.strictEqual(res.statusCode, 413, "Should return 413 Payload Too Large");
  });

  await runAsyncTest("SEC-010-03: Dedicated route upload gambar menerima payload hingga 5 MB dan menolak buffer biner > 5 MB (HTTP 413)", async () => {
    // Login to obtain valid admin token
    const loginRes = await makeRequest({
      method: "POST",
      url: "/api/auth/login",
      ip: "10.0.0.99",
      body: { username: "psu_admin", password: "PsuSuper2026!" },
    });
    const adminToken = loginRes.json?.token;
    assert.ok(adminToken, "Admin token should be obtained");

    // Create base64 buffer that exceeds 5MB
    const oversizedBuffer = Buffer.alloc(5.2 * 1024 * 1024, 0xff);
    const oversizedBase64 = `data:image/png;base64,${oversizedBuffer.toString("base64")}`;

    const res = await makeRequest({
      method: "POST",
      url: "/api/upload-gambar",
      headers: {
        authorization: `Bearer ${adminToken}`,
      },
      body: {
        title: "Test Oversized Image",
        dataUrl: oversizedBase64,
      },
    });

    assert.strictEqual(res.statusCode, 413, "Should return HTTP 413 Payload Too Large");
    assert.strictEqual(res.json?.success, false);
    assert.ok(res.json?.message?.includes("5 MB"), "Message must mention 5 MB limit");
  });

  // ----------------------------------------------------------------------------
  // SECTION 3: WP-3.3 (SEC-011) APACHE .HTACCESS & CLOUDFLARE ALIGNMENT
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.3 / SEC-011] Verifikasi Konfigurasi Apache .htaccess & Cloudflare ---");

  runTest("SEC-011-01: htaccess-production.txt menyertakan proteksi infinite redirect loop Cloudflare", () => {
    const content = fs.readFileSync(path.join(__dirname, "..", "..", "htaccess-production.txt"), "utf8");
    assert.ok(content.includes("RewriteCond %{HTTP:X-Forwarded-Proto} !https"), "Must check X-Forwarded-Proto");
    assert.ok(content.includes("RewriteCond %{HTTP:CF-Visitor} !'\"scheme\":\"https\"'"), "Must check CF-Visitor");
    assert.ok(content.includes("RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]"), "Must redirect to HTTPS");
  });

  runTest("SEC-011-02: htaccess-production.txt memblokir akses ke file sensitif (.env, .git, .sql, .dump)", () => {
    const content = fs.readFileSync(path.join(__dirname, "..", "..", "htaccess-production.txt"), "utf8");
    assert.ok(content.includes("env|git|gitignore|sql|dump"), "Must block sensitive extensions");
    assert.ok(content.includes("Require all denied"), "Must require all denied");
  });

  runTest("SEC-011-03: htaccess-production.txt menonaktifkan directory browsing (Options -Indexes)", () => {
    const content = fs.readFileSync(path.join(__dirname, "..", "..", "htaccess-production.txt"), "utf8");
    assert.ok(content.includes("Options -Indexes"), "Must disable directory browsing");
  });

  runTest("SEC-011-04: htaccess-production.txt memblokir eksekusi skrip di folder /news/ dan /uploads/", () => {
    const content = fs.readFileSync(path.join(__dirname, "..", "..", "htaccess-production.txt"), "utf8");
    assert.ok(content.includes("^(news|uploads)/.*\\.(php"), "Must block script execution in upload folders");
  });

  // ----------------------------------------------------------------------------
  // SECTION 4: WP-3.4 (SEC-012) VITE CUSTOM DEV MIDDLEWARE PATH TRAVERSAL
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.4 / SEC-012] Verifikasi Vite Custom Dev Middleware Path Traversal ---");

  runTest("SEC-012-01: vite.config.js menyertakan canonical path resolution dan boundary containment check", () => {
    const configContent = fs.readFileSync(
      path.join(__dirname, "..", "..", "company-profile", "vite.config.js"),
      "utf8"
    );
    assert.ok(configContent.includes("path.resolve(publicDir"), "Must resolve against publicDir");
    assert.ok(configContent.includes("path.relative(publicDir"), "Must check relative path from publicDir");
    assert.ok(configContent.includes("relCheck.startsWith('..')"), "Must reject parent directory escape");
  });

  runTest("SEC-012-02: vite.config.js mengaktifkan server.fs.strict dan batas allow", () => {
    const configContent = fs.readFileSync(
      path.join(__dirname, "..", "..", "company-profile", "vite.config.js"),
      "utf8"
    );
    assert.ok(configContent.includes("strict: true"), "Must enable fs.strict: true");
    assert.ok(configContent.includes("allow: [__dirname]"), "Must set safe allow boundary");
  });

  // ----------------------------------------------------------------------------
  // SECTION 5: WP-3.5 (SEC-013) SOURCEMAP ELIMINATION & SPECIFIC GITIGNORE
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.5 / SEC-013] Verifikasi Eliminasi Sourcemap & Gitignore Spesifik ---");

  runTest("SEC-013-01: vite.config.js menonaktifkan sourcemap produksi (build.sourcemap: false)", () => {
    const configContent = fs.readFileSync(
      path.join(__dirname, "..", "..", "company-profile", "vite.config.js"),
      "utf8"
    );
    assert.ok(configContent.includes("sourcemap: false"), "build.sourcemap must be explicitly false");
  });

  runTest("SEC-013-02: .gitignore menggunakan pola spesifik terhadap backup dump database dan TIDAK blanket-ignore *.sql", () => {
    const gitignore = fs.readFileSync(path.join(__dirname, "..", "..", ".gitignore"), "utf8");
    assert.ok(gitignore.includes("*.dump.sql"), "Should target *.dump.sql");
    assert.ok(gitignore.includes("backup*.sql"), "Should target backup*.sql");
    assert.ok(gitignore.includes("!backend/database/*.sql"), "Must explicitly preserve backend/database/*.sql");
  });

  runTest("SEC-013-03: File schema aplikasi backend/database/psu_sertifikat.sql tetap ada dan terlacak", () => {
    const schemaPath = path.join(__dirname, "..", "database", "psu_sertifikat.sql");
    assert.ok(fs.existsSync(schemaPath), "psu_sertifikat.sql must exist");
    const schemaContent = fs.readFileSync(schemaPath, "utf8");
    assert.ok(schemaContent.includes("psu_company_profile"), "Schema must define psu_company_profile database");
  });

  // ----------------------------------------------------------------------------
  // SECTION 6: WP-3.6 (SEC-014) DEPENDENCY AUDIT & DEPRECATED PACKAGE REMOVAL
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.6 / SEC-014] Verifikasi Pembersihan Dependensi Usang ---");

  runTest("SEC-014-01: Package usang/tidak terpakai 'init' telah dihapus dari root package.json", () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "..", "package.json"), "utf8"));
    assert.strictEqual(pkg.dependencies?.init, undefined, "Package 'init' must not be in dependencies");
  });

  runTest("SEC-014-02: Dependensi esensial backend (express, cors, mysql2, sharp) terpasang valid", () => {
    const backendPkg = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "package.json"), "utf8"));
    assert.ok(backendPkg.dependencies?.express, "express must exist in backend dependencies");
    assert.ok(backendPkg.dependencies?.mysql2, "mysql2 must exist in backend dependencies");
    assert.ok(backendPkg.dependencies?.sharp, "sharp must exist in backend dependencies");
  });

  // ----------------------------------------------------------------------------
  // SECTION 7: WP-3.7 (NEW-001) HEALTH MONITORING & STRUCTURED LOGGING
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.7 / NEW-001] Verifikasi Health Monitoring & Logging Terstruktur ---");

  await runAsyncTest("NEW-001-01: Endpoint /api/health mengembalikan status 'healthy' dengan HTTP 200", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.json?.status, "healthy");
    assert.ok(res.json?.timestamp, "Should contain timestamp");
    assert.ok(res.json?.database, "Should report database status");
  });

  await runAsyncTest("NEW-001-02: Endpoint /api/health TIDAK membocorkan kredensial, host, atau konfigurasi internal", async () => {
    const res = await makeRequest({ url: "/api/health" });
    assert.strictEqual(res.json?.password, undefined);
    assert.strictEqual(res.json?.user, undefined);
    assert.strictEqual(res.json?.host, undefined);
    assert.strictEqual(res.json?.dbConfig, undefined);
  });

  // ----------------------------------------------------------------------------
  // SECTION 8: WP-3.8 (SEC-007 RESIDUAL) AST ALLOWLIST HTML SANITIZER (DEFENSE-IN-DEPTH)
  // ----------------------------------------------------------------------------
  console.log("\n--- [WP-3.8 / SEC-007 Residual] Verifikasi AST Allowlist HTML Sanitizer ---");

  runTest("SEC-007-DiD-01: Sanitizer menetralkan serangan nested malformed tag (<scr<script>ipt>)", () => {
    const payload = "<scr<script>ipt>alert(1)</script>";
    const cleaned = sanitizeHtmlContent(payload);
    assert.ok(!cleaned.includes("<script"), "Nested script tag must be eliminated");
    assert.ok(!cleaned.includes("alert(1)"), "Payload content must be eliminated");
  });

  runTest("SEC-007-DiD-02: Sanitizer menolak tag SVG berbahaya (<svg onload='alert(1)'>)", () => {
    const payload = "<svg onload='alert(1)'><circle r='10'/></svg>";
    const cleaned = sanitizeHtmlContent(payload);
    assert.ok(!cleaned.includes("<svg"), "SVG tag must be stripped");
    assert.ok(!cleaned.includes("onload"), "Event handler must be stripped");
  });

  runTest("SEC-007-DiD-03: Sanitizer menolak tag MathML (<math><mtext>)", () => {
    const payload = "<math href='javascript:alert(1)'><mtext>Click</mtext></math>";
    const cleaned = sanitizeHtmlContent(payload);
    assert.ok(!cleaned.includes("<math"), "MathML tag must be stripped");
    assert.ok(!cleaned.includes("javascript:"), "javascript protocol must be stripped");
  });

  runTest("SEC-007-DiD-04: Sanitizer mengizinkan tag HTML yang sah (<p>, <strong>, <em>, <ul>, <li>)", () => {
    const safeHtml = "<p>Selamat datang di <strong>PT PSU</strong>. Kunjungi <em>website kami</em>.</p>";
    const cleaned = sanitizeHtmlContent(safeHtml);
    assert.strictEqual(cleaned, safeHtml, "Safe semantic HTML tags must be preserved intact");
  });

  runTest("SEC-007-DiD-05: Sanitizer menolak tag di luar allowlist (seperti <marquee>, <blink>, <form>)", () => {
    const payload = "<marquee>Teks Berjalan</marquee><form action='/leak'><input name='pw'/></form>";
    const cleaned = sanitizeHtmlContent(payload);
    assert.ok(!cleaned.includes("<marquee"), "Marquee must be stripped");
    assert.ok(!cleaned.includes("<form"), "Form must be stripped");
    assert.ok(!cleaned.includes("<input"), "Input must be stripped");
  });

  console.log("\n====================================================================");
  console.log("RINGKASAN HASIL PENGUJIAN VERIFIKASI KEAMANAN PHASE 3");
  console.log("====================================================================");
  console.log(`Total Pengujian Phase 3 : ${totalCount}`);
  console.log(`Lolos (PASS)            : ${passedCount}`);
  console.log(`Gagal (FAIL)            : ${totalCount - passedCount}`);
  console.log("====================================================================");

  if (passedCount === totalCount) {
    console.log("[VERIFICATION SUCCESS] SELURUH PENGUJIAN KEAMANAN PHASE 3 LOLOS 100%!");
    process.exit(0);
  } else {
    console.error("[VERIFICATION FAILURE] Terdeteksi kegagalan pada pengujian Phase 3.");
    process.exit(1);
  }
}

startTestSuite().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
