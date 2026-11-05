/**
 * TEST SUITE: VERIFIKASI INTEGRASI API SILAPP.penilaistandaruji.com
 * Menguji pelacakan status sertifikat pada:
 * 1. /client/sertifikasi-produk (sertifikasi-produk)
 * 2. /client/pengujian (pengujian)
 * 3. /client/kalibrasi (kalibrasi)
 * 4. /client/sertifikasi-sistem-manajemen (sertifikasi-sistem-manajemen)
 * 5. Pengalihan route typo: /client/kalibrasi/client/pengujian -> /client/pengujian
 * 6. Format respon API: source SILAPP.penilaistandaruji.com, mode workflow, mode certificate
 */

const http = require("http");
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { PassThrough } = require("stream");
const { app } = require("../server.js");

function makeApiRequest({ url, method = "GET", headers = {} }) {
  return new Promise((resolve) => {
    const socket = new PassThrough();
    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = { host: "localhost", ...headers };

    const resSocket = new PassThrough();
    const res = new http.ServerResponse(req);
    res.assignSocket(resSocket);

    const chunks = [];
    resSocket.on("data", (chunk) => chunks.push(chunk));

    res.on("finish", () => {
      const full = Buffer.concat(chunks).toString();
      const splitIdx = full.indexOf("\r\n\r\n");
      const rawBody = splitIdx >= 0 ? full.slice(splitIdx + 4) : full;
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

    app(req, res);
  });
}

async function runTest(name, fn) {
  try {
    await fn();
    console.log(`[PASS] ${name}`);
    return true;
  } catch (err) {
    console.error(`[FAIL] ${name}: ${err.message}`);
    return false;
  }
}

async function main() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) — VERIFIKASI INTEGRASI API SILAPP");
  console.log("Target Domain: SILAPP.penilaistandaruji.com");
  console.log("====================================================================\n");

  let total = 0;
  let passed = 0;

  // --------------------------------------------------------------------------
  // SUITE 1: VERIFIKASI 4 ENDPOINT API SERTIFIKAT DENGAN SUMBER SILAPP
  // --------------------------------------------------------------------------
  console.log("--- [SUITE 1] Verifikasi 4 Submenu Sertifikat via API Backend ---");

  total++;
  if (
    await runTest("1.1 Sertifikasi Produk: Mengembalikan data dengan source SILAPP.penilaistandaruji.com", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=PSU-SPPT-2026-GAHA",
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json?.success, true);
      assert.strictEqual(res.json?.found, true);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
      assert.strictEqual(res.json?.data[0]?.no_sertifikat, "PSU-SPPT-2026-GAHA");
      assert.strictEqual(res.json?.data[0]?.status, "Aktif");
    })
  ) passed++;

  total++;
  if (
    await runTest("1.2 Pengujian: Mengembalikan data dengan source SILAPP.penilaistandaruji.com", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/pengujian?no_sertifikat=PSU-LP-2026-BKLN",
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json?.success, true);
      assert.strictEqual(res.json?.found, true);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
      assert.strictEqual(res.json?.data[0]?.no_sertifikat, "PSU-LP-2026-BKLN");
      assert.strictEqual(res.json?.data[0]?.status, "Aktif");
    })
  ) passed++;

  total++;
  if (
    await runTest("1.3 Kalibrasi: Mengembalikan data dengan source SILAPP.penilaistandaruji.com", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/kalibrasi?no_sertifikat=PSU-LK-2026-KLMN",
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json?.success, true);
      assert.strictEqual(res.json?.found, true);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
      assert.strictEqual(res.json?.data[0]?.no_sertifikat, "PSU-LK-2026-KLMN");
      assert.strictEqual(res.json?.data[0]?.status, "Aktif");
    })
  ) passed++;

  total++;
  if (
    await runTest("1.4 Sertifikasi Sistem Manajemen: Mengembalikan data dengan source SILAPP.penilaistandaruji.com", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/sertifikasi-sistem-manajemen?no_sertifikat=PSU-LSSM-2026-ABCD",
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json?.success, true);
      assert.strictEqual(res.json?.found, true);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
      assert.strictEqual(res.json?.data[0]?.no_sertifikat, "PSU-LSSM-2026-ABCD");
      assert.strictEqual(res.json?.data[0]?.status, "Aktif");
    })
  ) passed++;

  // --------------------------------------------------------------------------
  // SUITE 2: DEDICATED TRACKING ROUTE & VALIDASI INPUT
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 2] Dedicated Route /api/tracking & Validasi ---");

  total++;
  if (
    await runTest("2.1 Route alias /api/tracking/:submenu berfungsi normal", async () => {
      const res = await makeApiRequest({
        url: "/api/tracking/sertifikasi-produk?q=PSU-SPPT-2026-GAHA",
      });
      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.json?.found, true);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
    })
  ) passed++;

  total++;
  if (
    await runTest("2.2 Menolak kategori submenu tidak sah (HTTP 400)", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/kategori-palsu?no_sertifikat=PSU-1234",
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json?.success, false);
      assert.strictEqual(res.json?.message, "Kategori sub menu client tidak valid.");
    })
  ) passed++;

  total++;
  if (
    await runTest("2.3 Menolak input nomor sertifikat kosong (HTTP 400)", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=",
      });
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.json?.success, false);
    })
  ) passed++;

  total++;
  if (
    await runTest("2.4 Merespon 404 ketika sertifikat tidak ditemukan di SILAPP maupun database", async () => {
      const res = await makeApiRequest({
        url: "/api/sertifikat/sertifikasi-produk?no_sertifikat=PSU-TIDAK-ADA-9999",
      });
      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.json?.found, false);
      assert.strictEqual(res.json?.source, "SILAPP.penilaistandaruji.com");
      assert.ok(res.json?.message.includes("SILAPP.penilaistandaruji.com"));
    })
  ) passed++;

  // --------------------------------------------------------------------------
  // SUITE 3: VERIFIKASI SOURCE CODE FRONTEND & ROUTING
  // --------------------------------------------------------------------------
  console.log("\n--- [SUITE 3] Verifikasi Komponen Frontend & Routing ---");

  const appJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/App.jsx"), "utf8");
  const helperJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/utils/silappTracker.jsx"), "utf8");
  const productJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/pages/client/ClientProductCertification.jsx"), "utf8");
  const testingJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/pages/client/ClientTesting.jsx"), "utf8");
  const calibJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/pages/client/ClientCalibration.jsx"), "utf8");
  const mgmtJsx = fs.readFileSync(path.join(__dirname, "../../company-profile/src/pages/client/ClientManagementSystemCertification.jsx"), "utf8");

  total++;
  if (
    await runTest("3.1 App.jsx menyediakan redirect route /client/kalibrasi/client/pengujian -> /client/pengujian", async () => {
      assert.ok(
        appJsx.includes('path="/client/kalibrasi/client/pengujian"'),
        "Harus menyertakan rute path /client/kalibrasi/client/pengujian"
      );
      assert.ok(
        appJsx.includes('element={<Navigate to="/client/pengujian" replace />}'),
        "Harus mengarahkan ke /client/pengujian"
      );
    })
  ) passed++;

  total++;
  if (
    await runTest("3.2 Helper silappTracker.jsx mengonfigurasi SILAPP_DOMAIN SILAPP.penilaistandaruji.com", async () => {
      assert.ok(helperJsx.includes('"SILAPP.penilaistandaruji.com"'));
      assert.ok(helperJsx.includes("fetchCertificateFromApi"));
    })
  ) passed++;

  total++;
  if (
    await runTest("3.3 Seluruh 4 halaman klien terhubung ke silappTracker & bersih dari label 'Data Real-Time API'", async () => {
      for (const [name, code] of [
        ["ClientProductCertification", productJsx],
        ["ClientTesting", testingJsx],
        ["ClientCalibration", calibJsx],
        ["ClientManagementSystemCertification", mgmtJsx],
      ]) {
        assert.ok(
          code.includes("SilappWorkflowTracker"),
          `${name} harus mengimpor SilappWorkflowTracker`
        );
        assert.ok(
          code.includes("fetchCertificateFromApi"),
          `${name} harus memanggil fetchCertificateFromApi`
        );
        assert.ok(
          !code.includes("Data Real-Time API"),
          `${name} tidak boleh menampilkan teks 'Data Real-Time API'`
        );
      }
    })
  ) passed++;

  console.log("\n====================================================================");
  console.log(`HASIL VERIFIKASI INTEGRASI SILAPP: ${passed} / ${total} PASS`);
  console.log("====================================================================");

  if (passed === total) {
    console.log("[VERIFICATION SUCCESS] Seluruh integrasi API SILAPP.penilaistandaruji.com tervalidasi 100%!");
    process.exit(0);
  } else {
    console.error("[VERIFICATION FAILED] Terdapat pengujian yang gagal.");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});

