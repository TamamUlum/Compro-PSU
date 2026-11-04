/**
 * ============================================================================
 * PHASE 1 SECURITY REMEDIATION — AUTOMATED VERIFICATION TEST SUITE
 * PT PENILAI STANDAR UJI (PSU)
 * ============================================================================
 * 
 * Verifies:
 * - SEC-001: Fail-closed JWT_SECRET validation & Secure Provisioning
 * - SEC-002: Secure Image Upload (Magic bytes, extension check, SVG XSS rejection)
 * - SEC-003: Role-Based Access Control (Super Admin vs Editor vs Author)
 * - SEC-004: Rate Limiting on failed authentication & public endpoints
 */

const { spawnSync } = require("child_process");
const http = require("http");
const { PassThrough } = require("stream");
const path = require("path");
const fs = require("fs");

// Pastikan file .env dimuat sebelum mengimpor app
const envPath = path.resolve(__dirname, "..", ".env");
require("dotenv").config({ path: envPath });

const { app, initDatabase } = require("../server");

// Helper HTTP In-Memory Client untuk Express
function makeRequest(appInstance, options) {
  return new Promise((resolve, reject) => {
    const { method = "GET", url = "/", headers = {}, body = null, ip = "127.0.0.1" } = options;

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
      "user-agent": "security-verifier-harness/1.0",
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
    console.log(`   -> Detail: ${detail}`);
  }
}

async function runTestSuite() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI — VERIFIKASI KEAMANAN PHASE 1");
  console.log("====================================================================");

  await initDatabase();

  // -------------------------------------------------------------------------
  // TEST GROUP 1: SEC-001 (Fail-closed JWT_SECRET & Default Credentials)
  // -------------------------------------------------------------------------
  console.log("\n--- [SEC-001] Verifikasi Hardcoded Secret & Fail-Closed Startup ---");

  // 1.1 Startup tanpa JWT_SECRET
  const runNoSecret = spawnSync("node", ["backend/server.js"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, JWT_SECRET: "" },
    encoding: "utf8",
  });
  const noSecretFailedClosed =
    runNoSecret.status === 1 && runNoSecret.stderr.includes("[FATAL SECURITY CONFIGURATION ERROR]");
  recordTest(
    "SEC-001-A",
    "Server menolak startup (fail-closed exit code 1) jika JWT_SECRET kosong",
    noSecretFailedClosed,
    `Exit code: ${runNoSecret.status}, Log output: ${runNoSecret.stderr.slice(0, 150).trim()}`
  );

  // 1.2 Startup dengan JWT_SECRET terlalu pendek (< 32 karakter)
  const runShortSecret = spawnSync("node", ["backend/server.js"], {
    cwd: path.resolve(__dirname, "../.."),
    env: { ...process.env, JWT_SECRET: "weak_and_short" },
    encoding: "utf8",
  });
  const shortSecretFailedClosed =
    runShortSecret.status === 1 && runShortSecret.stderr.includes("insecure (< 32 chars)");
  recordTest(
    "SEC-001-B",
    "Server menolak startup jika JWT_SECRET kurang dari 32 karakter",
    shortSecretFailedClosed,
    `Exit code: ${runShortSecret.status}`
  );

  // 1.3 Verifikasi tidak ada akun default dengan password tertebak
  const loginDefaultAttempt = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    body: { username: "admin", password: "AdminPSU2026!" },
  });
  const defaultAccountRejected = loginDefaultAttempt.status === 401;
  recordTest(
    "SEC-001-C",
    "Akun default statis lama (admin / AdminPSU2026!) tidak dapat login",
    defaultAccountRejected,
    `Status: ${loginDefaultAttempt.status}, Response: ${loginDefaultAttempt.body}`
  );

  // 1.4 Kebijakan password pada CLI create-admin
  const weakPassTest = spawnSync(
    "node",
    [
      "backend/scripts/create-admin.js",
      "--username",
      "test_weak",
      "--email",
      "weak@test.com",
      "--name",
      "Weak User",
      "--password",
      "lemah",
    ],
    {
      cwd: path.resolve(__dirname, "../.."),
      encoding: "utf8",
    }
  );
  const weakPassRejected =
    weakPassTest.status === 1 && weakPassTest.stderr.includes("minimal 8 karakter");
  recordTest(
    "SEC-001-D",
    "CLI Provisioning menolak password lemah yang melanggar kebijakan keamanan",
    weakPassRejected,
    `Exit code: ${weakPassTest.status}, Stderr: ${weakPassTest.stderr.trim()}`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 2: SEC-004 (Reliable Rate Limiting)
  // -------------------------------------------------------------------------
  console.log("\n--- [SEC-004] Verifikasi Rate Limiting & Proteksi Brute-Force ---");

  // Siapkan IP unik untuk pengujian rate limiting
  const testIp = "192.168.99.10";
  let rateLimited = false;
  let finalStatus = 0;

  for (let i = 1; i <= 6; i++) {
    const res = await makeRequest(app, {
      method: "POST",
      url: "/api/auth/login",
      ip: testIp,
      body: { username: "bruteforce_target", password: "WrongPassword123!" },
    });
    if (res.status === 429) {
      rateLimited = true;
      finalStatus = 429;
      break;
    }
    finalStatus = res.status;
  }
  recordTest(
    "SEC-004-A",
    "Endpoint login memblokir upaya brute-force setelah 5 kegagalan (HTTP 429)",
    rateLimited,
    `Percobaan ke-6 menghasilkan HTTP ${finalStatus}`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 3: AUTENTIKASI DAN PEROLEHAN TOKEN ROLE
  // -------------------------------------------------------------------------
  console.log("\n--- [SEC-003] Perolehan Token Otentikasi Super Admin, Editor, Author ---");

  // Login Super Admin
  const loginAdminRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    ip: "10.0.0.1",
    body: { username: "psu_admin", password: "PsuSuper2026!" },
  });
  const adminToken = loginAdminRes.json?.token;
  recordTest(
    "AUTH-001",
    "Login Super Admin berhasil dan mengembalikan token JWT valid",
    loginAdminRes.status === 200 && !!adminToken,
    `Status: ${loginAdminRes.status}, User: ${loginAdminRes.json?.user?.username}`
  );

  // Login Editor
  const loginEditorRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    ip: "10.0.0.2",
    body: { username: "psu_editor", password: "PsuEditor2026!" },
  });
  const editorToken = loginEditorRes.json?.token;
  recordTest(
    "AUTH-002",
    "Login Editor berhasil dan mengembalikan token JWT valid",
    loginEditorRes.status === 200 && !!editorToken,
    `Status: ${loginEditorRes.status}, User: ${loginEditorRes.json?.user?.username}`
  );

  // Login Author
  const loginAuthorRes = await makeRequest(app, {
    method: "POST",
    url: "/api/auth/login",
    ip: "10.0.0.3",
    body: { username: "psu_author", password: "PsuAuthor2026!" },
  });
  const authorToken = loginAuthorRes.json?.token;
  recordTest(
    "AUTH-003",
    "Login Author berhasil dan mengembalikan token JWT valid",
    loginAuthorRes.status === 200 && !!authorToken,
    `Status: ${loginAuthorRes.status}, User: ${loginAuthorRes.json?.user?.username}`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 4: SEC-003 (Role-Based Access Control / Broken Function Level Auth)
  // -------------------------------------------------------------------------
  console.log("\n--- [SEC-003] Verifikasi Enforcing RBAC & Matriks Hak Akses ---");

  // 4.1 Endpoint Super Admin: GET /api/admin/users
  const saUsersRes = await makeRequest(app, {
    method: "GET",
    url: "/api/admin/users",
    headers: { authorization: `Bearer ${adminToken}` },
  });
  recordTest(
    "SEC-003-A1",
    "Super Admin diizinkan mengakses GET /api/admin/users (HTTP 200)",
    saUsersRes.status === 200,
    `Status: ${saUsersRes.status}`
  );

  const editorUsersRes = await makeRequest(app, {
    method: "GET",
    url: "/api/admin/users",
    headers: { authorization: `Bearer ${editorToken}` },
  });
  recordTest(
    "SEC-003-A2",
    "Editor DITOLAK saat mengakses GET /api/admin/users (HTTP 403 Forbidden)",
    editorUsersRes.status === 403,
    `Status: ${editorUsersRes.status}, Message: ${editorUsersRes.json?.message}`
  );

  const authorUsersRes = await makeRequest(app, {
    method: "GET",
    url: "/api/admin/users",
    headers: { authorization: `Bearer ${authorToken}` },
  });
  recordTest(
    "SEC-003-A3",
    "Author DITOLAK saat mengakses GET /api/admin/users (HTTP 403 Forbidden)",
    authorUsersRes.status === 403,
    `Status: ${authorUsersRes.status}, Message: ${authorUsersRes.json?.message}`
  );

  // 4.2 Endpoint Super Admin: POST /api/authors (Manajemen Penulis)
  const editorCreateAuthorRes = await makeRequest(app, {
    method: "POST",
    url: "/api/authors",
    headers: { authorization: `Bearer ${editorToken}` },
    body: { name: "Penulis Liar", role_title: "Hacker" },
  });
  recordTest(
    "SEC-003-B",
    "Editor DITOLAK saat mencoba menambah penulis (POST /api/authors) (HTTP 403)",
    editorCreateAuthorRes.status === 403,
    `Status: ${editorCreateAuthorRes.status}`
  );

  // 4.3 Endpoint Status Artikel: PATCH /api/artikel/:id/status (Super Admin & Editor ONLY)
  const authorChangeStatusRes = await makeRequest(app, {
    method: "PATCH",
    url: "/api/artikel/1/status",
    headers: { authorization: `Bearer ${authorToken}` },
    body: { status: "Published" },
  });
  recordTest(
    "SEC-003-C1",
    "Author DITOLAK mengubah status artikel langsung (HTTP 403)",
    authorChangeStatusRes.status === 403,
    `Status: ${authorChangeStatusRes.status}`
  );

  const editorChangeStatusRes = await makeRequest(app, {
    method: "PATCH",
    url: "/api/artikel/1/status",
    headers: { authorization: `Bearer ${editorToken}` },
    body: { status: "Draft" },
  });
  recordTest(
    "SEC-003-C2",
    "Editor DIIZINKAN mengubah status publikasi artikel (HTTP 200)",
    editorChangeStatusRes.status === 200,
    `Status: ${editorChangeStatusRes.status}`
  );

  // 4.4 Isolasi Artikel untuk Author: POST /api/artikel harus dipaksa Draft & Author
  const authorPostRes = await makeRequest(app, {
    method: "POST",
    url: "/api/artikel",
    headers: { authorization: `Bearer ${authorToken}` },
    body: {
      title_id: "Artikel Oleh Author Uji",
      title_en: "Article by Test Author",
      excerpt_id: "Ringkasan uji",
      excerpt_en: "Test summary",
      content_id: "<p>Konten uji</p>",
      content_en: "<p>Test content</p>",
      author: "Super Admin PSU Palsu", // Percobaan spoofing nama author
      status: "Published", // Percobaan bypass publishing approval
      is_featured: 1, // Percobaan elevate to featured
      category: "News",
      tags: ["Security", "Test"],
    },
  });
  const createdArt = authorPostRes.json?.data;
  const isForcedDraft = createdArt?.status === "Draft";
  const isAuthorIdentified = createdArt?.author === "Author PSU";
  const isNotFeatured = createdArt?.is_featured === 0;
  recordTest(
    "SEC-003-D",
    "Author membuat artikel dipaksa berstatus Draft, nama author terkunci, & tidak featured",
    authorPostRes.status === 201 && isForcedDraft && isAuthorIdentified && isNotFeatured,
    `Status: ${createdArt?.status}, Author: ${createdArt?.author}, is_featured: ${createdArt?.is_featured}`
  );

  // 4.5 Author tidak boleh menghapus artikel: DELETE /api/artikel/:slug
  const authorDeleteArtRes = await makeRequest(app, {
    method: "DELETE",
    url: `/api/artikel/${createdArt?.slug || "1"}`,
    headers: { authorization: `Bearer ${authorToken}` },
  });
  recordTest(
    "SEC-003-E",
    "Author DITOLAK menghapus artikel (DELETE /api/artikel/:slug) (HTTP 403)",
    authorDeleteArtRes.status === 403,
    `Status: ${authorDeleteArtRes.status}`
  );

  // -------------------------------------------------------------------------
  // TEST GROUP 5: SEC-002 (Secure Image Upload & Stored SVG XSS Prevention)
  // -------------------------------------------------------------------------
  console.log("\n--- [SEC-002] Verifikasi Keamanan Upload Gambar & Penolakan SVG XSS ---");

  // 5.1 Upload file SVG murni
  const svgPayload = `data:image/svg+xml;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg"><script>alert("XSS")</script></svg>`
  ).toString("base64")}`;
  const svgUploadRes = await makeRequest(app, {
    method: "POST",
    url: "/api/upload-gambar",
    headers: { authorization: `Bearer ${adminToken}` },
    body: {
      dataUrl: svgPayload,
      filename: "exploit.svg",
      title: "Exploit SVG",
    },
  });
  recordTest(
    "SEC-002-A",
    "Upload file berformat SVG DITOLAK secara eksplisit (HTTP 400)",
    svgUploadRes.status === 400,
    `Status: ${svgUploadRes.status}, Message: ${svgUploadRes.json?.message}`
  );

  // 5.2 Upload file SVG yang disamarkan dengan ekstensi .png (SVG polyglot disguised as PNG)
  const disguisedSvgPayload = `data:image/png;base64,${Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/><script>alert(document.cookie)</script></svg>`
  ).toString("base64")}`;
  const disguisedUploadRes = await makeRequest(app, {
    method: "POST",
    url: "/api/upload-gambar",
    headers: { authorization: `Bearer ${adminToken}` },
    body: {
      dataUrl: disguisedSvgPayload,
      filename: "fake_image.png",
      title: "Disguised SVG",
    },
  });
  recordTest(
    "SEC-002-B",
    "File SVG disamarkan sebagai .png DITOLAK melalui validasi Magic Bytes (HTTP 400)",
    disguisedUploadRes.status === 400,
    `Status: ${disguisedUploadRes.status}, Message: ${disguisedUploadRes.json?.message}`
  );

  // 5.3 Upload file HTML / script non-gambar
  const htmlPayload = `data:text/html;base64,${Buffer.from("<h1>Hacked</h1>").toString("base64")}`;
  const htmlUploadRes = await makeRequest(app, {
    method: "POST",
    url: "/api/upload-gambar",
    headers: { authorization: `Bearer ${adminToken}` },
    body: {
      dataUrl: htmlPayload,
      filename: "page.html",
      title: "HTML File",
    },
  });
  recordTest(
    "SEC-002-C",
    "File HTML non-gambar DITOLAK (HTTP 400)",
    htmlUploadRes.status === 400,
    `Status: ${htmlUploadRes.status}, Message: ${htmlUploadRes.json?.message}`
  );

  // 5.4 Upload file PNG valid
  const valid1x1Png = Buffer.from(
    "89504e470d0a1a0a0000000d494844520000000200000002080600000072b60d240000000970485973000003e8000003e801b57b526b0000001149444154089963f8cfc0f01f8419600c0047ca07f979b47dd20000000049454e44ae426082",
    "hex"
  );
  const validPngDataUri = `data:image/png;base64,${valid1x1Png.toString("base64")}`;
  const validPngRes = await makeRequest(app, {
    method: "POST",
    url: "/api/upload-gambar",
    headers: { authorization: `Bearer ${adminToken}` },
    body: {
      dataUrl: validPngDataUri,
      filename: "valid_badge.png",
      title: "Valid Badge PNG",
    },
  });
  const uploadedFilename =
    validPngRes.json?.media?.filename || path.basename(validPngRes.json?.image_url || "");
  // Periksa UUID naming pattern: 8-4-4-4-12.png
  const isUuidNamed =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.png$/i.test(
      uploadedFilename || ""
    );
  recordTest(
    "SEC-002-D",
    "Upload gambar PNG raster valid DITERIMA & disimpan dengan nama acak UUID",
    validPngRes.status === 200 && isUuidNamed,
    `Status: ${validPngRes.status}, Filename: ${uploadedFilename}, Url: ${validPngRes.json?.image_url}`
  );

  // 5.5 Verifikasi Header Keamanan pada Penyajian Statis Gambar (/news)
  const staticFileRes = await makeRequest(app, {
    method: "GET",
    url: `/news/${uploadedFilename}`,
  });
  const nosniffHeader = staticFileRes.headers["x-content-type-options"];
  recordTest(
    "SEC-002-E",
    "Static media endpoint menyertakan header X-Content-Type-Options: nosniff",
    nosniffHeader === "nosniff",
    `Header X-Content-Type-Options: ${nosniffHeader}`
  );

  // Bersihkan file uji dari disk
  if (uploadedFilename) {
    const testFileOnDisk = path.join(
      __dirname,
      "..",
      "..",
      "company-profile",
      "public",
      "news",
      uploadedFilename
    );
    try {
      if (fs.existsSync(testFileOnDisk)) fs.unlinkSync(testFileOnDisk);
    } catch {}
  }

  // -------------------------------------------------------------------------
  // RINGKASAN HASIL PENGUJIAN
  // -------------------------------------------------------------------------
  console.log("\n====================================================================");
  console.log("RINGKASAN HASIL PENGUJIAN VERIFIKASI KEAMANAN PHASE 1");
  console.log("====================================================================");
  const total = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Pengujian: ${total}`);
  console.log(`Lolos (PASS)   : ${passedCount}`);
  console.log(`Gagal (FAIL)   : ${failedCount}`);

  if (failedCount > 0) {
    console.error("\nTerdapat pengujian yang GAGAL. Periksa log detail di atas.");
    process.exit(1);
  } else {
    console.log("\nSELURUH PENGUJIAN KEAMANAN PHASE 1 BERHASIL DENGAN SEMPURNA (100% PASS)!");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("FATAL ERROR DURING TEST RUNNER:", err);
  process.exit(1);
});
