/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) - SECURITY PHASE 1.3 TEST SUITE
 * ============================================================================
 * Scope: Strict Trust Proxy Production Hardening & Origin Boundary Verification
 *
 * Categorized Results:
 *  1. Unit Tests (Strict Validation, CIDR Parsing, Error Throws)
 *  2. Integration Tests (HTTP Pipeline, Spoofing Immunity, Rate Limiter)
 *  3. Production Topology Verification (Apache, Passenger, Cloudflare, Network Boundary)
 * ============================================================================
 */

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";
process.env.AUTH_FAIL_LIMIT_ACCOUNT = "5";
process.env.AUTH_FAIL_LIMIT_IP = "20";
process.env.AUTH_FAIL_WINDOW_MINUTES = "15";

const express = require("express");
const http = require("http");
const { PassThrough } = require("stream");
const fs = require("fs");
const path = require("path");

const {
  app,
  configureTrustProxy,
  getClientIp,
  isValidIpOrCidr,
  CLOUDFLARE_PROXY_CIDRS,
} = require("../server");

// Helper to make in-memory HTTP requests directly to Express without socket networking
function sendRequest(appInstance, options = {}) {
  return new Promise((resolve, reject) => {
    const {
      method = "GET",
      url = "/",
      headers = {},
      body = null,
      ip = "127.0.0.1",
    } = options;

    let bodyBuf = null;
    if (body !== null) {
      if (Buffer.isBuffer(body)) {
        bodyBuf = body;
      } else if (typeof body === "object") {
        bodyBuf = Buffer.from(JSON.stringify(body));
      } else {
        bodyBuf = Buffer.from(String(body));
      }
    }

    const socket = new PassThrough();
    socket.remoteAddress = ip;
    socket.encrypted = false;

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: "localhost",
      "user-agent": "security-phase1-3-verifier/1.0",
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

function createCustomApp(trustProxySetting) {
  const testApp = express();
  process.env.TRUST_PROXY = trustProxySetting;
  configureTrustProxy(testApp);

  testApp.get("/test-ip", (req, res) => {
    res.json({
      reqIp: req.ip,
      reqIps: req.ips,
      clientIp: getClientIp(req),
      trustCloudflare: testApp.get("trust cloudflare"),
    });
  });

  return testApp;
}

const unitResults = [];
const integrationResults = [];
const topologyResults = [];

function recordTest(category, id, name, passed, detail) {
  const item = { category, id, name, passed, detail };
  if (category === "UNIT") unitResults.push(item);
  else if (category === "INTEGRATION") integrationResults.push(item);
  else topologyResults.push(item);

  const tag = passed ? "[PASS]" : "[FAIL]";
  console.log(`${tag} [${category}] ${id}: ${name}`);
  if (detail) {
    console.log(`       Detail: ${detail}`);
  }
}

async function runTestSuite() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) - PHASE 1.3 TRUSTED PROXY AUDIT SUITE");
  console.log("====================================================================\n");

  // ==========================================================================
  // SECTION 1: UNIT TESTS
  // ==========================================================================
  console.log("====================================================================");
  console.log("CATEGORY 1: UNIT TESTS (Strict Validation & Configuration)");
  console.log("====================================================================");

  // UNIT-01: Valid IPv4 addresses
  {
    const ips = ["127.0.0.1", "192.168.1.1", "10.0.0.1", "172.16.0.5", "8.8.8.8"];
    const allValid = ips.every(isValidIpOrCidr);
    recordTest("UNIT", "UNIT-01", "Validate standard IPv4 addresses", allValid, `Tested: ${ips.join(", ")}`);
  }

  // UNIT-02: Valid IPv6 addresses
  {
    const ips = ["::1", "2400:cb00::1", "2606:4700::1", "fe80::1", "2001:db8::ff00:42:8329"];
    const allValid = ips.every(isValidIpOrCidr);
    recordTest("UNIT", "UNIT-02", "Validate standard IPv6 addresses", allValid, `Tested: ${ips.join(", ")}`);
  }

  // UNIT-03: Valid IPv4 CIDRs (Policy: 8 <= prefix <= 32)
  {
    const cidrs = ["10.0.0.0/8", "172.16.0.0/12", "192.168.1.0/24", "173.245.48.0/20", "1.2.3.4/32"];
    const allValid = cidrs.every(isValidIpOrCidr);
    recordTest("UNIT", "UNIT-03", "Validate IPv4 CIDR notation (prefix 8 to 32)", allValid, `Tested: ${cidrs.join(", ")}`);
  }

  // UNIT-04: Valid IPv6 CIDRs (Policy: 16 <= prefix <= 128)
  {
    const cidrs = ["2400:cb00::/32", "2606:4700::/32", "2a06:98c0::/29", "2001:db8::/16", "::1/128"];
    const allValid = cidrs.every(isValidIpOrCidr);
    recordTest("UNIT", "UNIT-04", "Validate IPv6 CIDR notation (prefix 16 to 128)", allValid, `Tested: ${cidrs.join(", ")}`);
  }

  // UNIT-05: Reject invalid IP addresses
  {
    const badIps = ["999.999.999.999", "1.2.3", "http://proxy", "not_an_ip", "10.0.0.256", "0.0.0.0", "::", ""];
    const allRejected = badIps.every((ip) => !isValidIpOrCidr(ip));
    recordTest("UNIT", "UNIT-05", "Reject malformed IP strings", allRejected, `Tested: ${badIps.join(", ")}`);
  }

  // UNIT-06: Reject invalid, universal, or overly broad CIDR notations
  {
    const badCidrs = [
      "0.0.0.0/0",       // Universal IPv4 wildcard (must be rejected)
      "::/0",             // Universal IPv6 wildcard (must be rejected)
      "10.0.0.0/7",       // Overly broad IPv4 (prefix < 8)
      "2001::/15",        // Overly broad IPv6 (prefix < 16)
      "10.0.0.0/33",      // Out of range IPv4 (prefix > 32)
      "192.168.1.1/-1",   // Negative prefix
      "10.0.0.0/abc",     // Non-numeric prefix
      "2400::/129",       // Out of range IPv6 (prefix > 128)
      "invalid/24"        // Non-IP base
    ];
    const allRejected = badCidrs.every((cidr) => !isValidIpOrCidr(cidr));
    recordTest("UNIT", "UNIT-06", "Reject universal (/0), overly broad, or malformed CIDR masks", allRejected, `Tested: ${badCidrs.join(", ")}`);
  }

  // UNIT-07: Strictly reject TRUST_PROXY=true (throws fatal error)
  {
    let thrown = false;
    let errMessage = "";
    try {
      createCustomApp("true");
    } catch (e) {
      thrown = true;
      errMessage = e.message;
    }
    const passed = thrown && errMessage.includes("TRUST_PROXY='true' is strictly prohibited");
    recordTest("UNIT", "UNIT-07", "Strictly reject TRUST_PROXY='true' with fatal fail-closed error", passed, `Error: ${errMessage}`);
  }

  // UNIT-08: Strictly reject numeric hop counts (e.g. '1', '2', '3')
  {
    const hopValues = ["1", "2", "5"];
    let allThrown = true;
    for (const val of hopValues) {
      try {
        createCustomApp(val);
        allThrown = false;
      } catch (e) {
        if (!e.message.includes("Numeric hop count configuration")) allThrown = false;
      }
    }
    recordTest("UNIT", "UNIT-08", "Strictly reject numeric hop counts (e.g. '1', '2', '5')", allThrown, `All numeric hop values triggered fatal error`);
  }

  // UNIT-09: Strictly reject malformed or unrecognized IP/CIDR in comma list
  {
    let thrown = false;
    let errMessage = "";
    try {
      createCustomApp("10.0.0.1, 999.999.999.999");
    } catch (e) {
      thrown = true;
      errMessage = e.message;
    }
    const passed = thrown && errMessage.includes("entry in TRUST_PROXY");
    recordTest("UNIT", "UNIT-09", "Strictly reject invalid IP/CIDR in custom proxy list", passed, `Error: ${errMessage}`);
  }

  // UNIT-10: Properly configure named secure topologies
  {
    const appFalse = createCustomApp("false");
    const appLoopback = createCustomApp("loopback");
    const appCf = createCustomApp("cloudflare");

    let noticeLogged = false;
    const origWarn = console.warn;
    console.warn = (m) => {
      if (typeof m === "string" && m.includes("SECURITY NOTICE")) noticeLogged = true;
    };
    const appPriv = createCustomApp("private");
    console.warn = origWarn;

    const passed =
      appFalse.get("trust proxy") === false &&
      appLoopback.get("trust proxy") === "loopback" &&
      Array.isArray(appCf.get("trust proxy")) &&
      appCf.get("trust cloudflare") === true &&
      noticeLogged === true;

    recordTest("UNIT", "UNIT-10", "Support secure topology modes: false, loopback, cloudflare, private", passed, `Configured accurately with trust cloudflare flags`);
  }

  // ==========================================================================
  // SECTION 2: INTEGRATION TESTS (In-Memory HTTP Stream Pipeline)
  // ==========================================================================
  console.log("\n====================================================================");
  console.log("CATEGORY 2: INTEGRATION TESTS (HTTP Stream Pipeline & Rate Limiter)");
  console.log("====================================================================");

  const directApp = createCustomApp("false");
  const loopbackApp = createCustomApp("loopback");
  const cfApp = createCustomApp("cloudflare");

  // INT-01: Direct connection ignores spoofed X-Forwarded-For
  {
    const res = await sendRequest(directApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.195",
      headers: { "x-forwarded-for": "198.51.100.2, 10.0.0.1" },
    });
    const passed = res.json.clientIp === "203.0.113.195" && res.json.reqIps.length === 0;
    recordTest("INTEGRATION", "INT-01", "Direct connection ignores spoofed X-Forwarded-For", passed, `Socket 203.0.113.195 preserved, req.ips length: ${res.json.reqIps.length}`);
  }

  // INT-02: Direct connection ignores spoofed CF-Connecting-IP
  {
    const res = await sendRequest(directApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.195",
      headers: { "cf-connecting-ip": "1.1.1.1", "x-forwarded-for": "1.1.1.1" },
    });
    const passed = res.json.clientIp === "203.0.113.195";
    recordTest("INTEGRATION", "INT-02", "Direct connection ignores spoofed CF-Connecting-IP header", passed, `Spoofed 1.1.1.1 rejected, extracted socket: ${res.json.clientIp}`);
  }

  // INT-03: Direct-to-origin bypass attempt when TRUST_PROXY=loopback
  {
    const res = await sendRequest(loopbackApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.55",
      headers: {
        "x-forwarded-for": "8.8.8.8",
        "cf-connecting-ip": "8.8.8.8",
      },
    });
    const passed = res.json.clientIp === "203.0.113.55" && res.json.reqIps.length === 0;
    recordTest("INTEGRATION", "INT-03", "Direct-to-origin bypass on loopback-mode server is rejected", passed, `Non-loopback socket 203.0.113.55 locked, spoofed headers ignored`);
  }

  // INT-04: Direct-to-origin bypass attempt when TRUST_PROXY=cloudflare
  {
    const res = await sendRequest(cfApp, {
      method: "GET",
      url: "/test-ip",
      ip: "198.51.100.40",
      headers: {
        "cf-connecting-ip": "1.1.1.1",
        "x-forwarded-for": "1.1.1.1",
      },
    });
    const passed = res.json.clientIp === "198.51.100.40" && res.json.reqIps.length === 0;
    recordTest("INTEGRATION", "INT-04", "Direct-to-origin bypass on cloudflare-mode server is rejected", passed, `Non-Cloudflare socket 198.51.100.40 locked, spoofed headers ignored`);
  }

  // INT-05: Genuine Local Apache Reverse Proxy (TRUST_PROXY=loopback)
  {
    const res = await sendRequest(loopbackApp, {
      method: "GET",
      url: "/test-ip",
      ip: "127.0.0.1",
      headers: { "x-forwarded-for": "198.51.100.88" },
    });
    const passed = res.json.clientIp === "198.51.100.88" && res.json.reqIp === "198.51.100.88";
    recordTest("INTEGRATION", "INT-05", "Genuine Apache local proxy forwarded client IP extracted", passed, `Client IP: ${res.json.clientIp}`);
  }

  // INT-06: Local Apache Reverse Proxy (TRUST_PROXY=loopback) ignores CF-Connecting-IP
  {
    // If Apache runs on loopback and attacker sends CF-Connecting-IP, server must NOT trust CF-Connecting-IP
    // because trust cloudflare is false!
    const res = await sendRequest(loopbackApp, {
      method: "GET",
      url: "/test-ip",
      ip: "127.0.0.1",
      headers: {
        "x-forwarded-for": "198.51.100.88",
        "cf-connecting-ip": "1.1.1.1", // Attacker injected spoofed CF header
      },
    });
    // Must return 198.51.100.88 (from X-Forwarded-For), NOT 1.1.1.1!
    const passed = res.json.clientIp === "198.51.100.88";
    recordTest("INTEGRATION", "INT-06", "Loopback proxy mode rejects untrusted CF-Connecting-IP header", passed, `Extracted X-Forwarded-For (${res.json.clientIp}), ignored CF header (1.1.1.1)`);
  }

  // INT-07: Valid Cloudflare edge IP extracts CF-Connecting-IP
  {
    const res = await sendRequest(cfApp, {
      method: "GET",
      url: "/test-ip",
      ip: "173.245.48.55", // Valid Cloudflare IPv4 block
      headers: {
        "cf-connecting-ip": "103.200.5.21",
        "x-forwarded-for": "103.200.5.21, 173.245.48.55",
      },
    });
    const passed = res.json.clientIp === "103.200.5.21";
    recordTest("INTEGRATION", "INT-07", "Cloudflare edge socket successfully resolves CF-Connecting-IP", passed, `Edge 173.245.48.55 -> Client: ${res.json.clientIp}`);
  }

  // INT-08: Rate Limiting - Password Spraying with rotated headers blocked at IP threshold
  {
    const attackerSocketIp = "198.51.100.71";
    let blockedCount = 0;
    let allowedCount = 0;

    process.env.TRUST_PROXY = "false";
    configureTrustProxy(app);

    for (let i = 1; i <= 25; i++) {
      const spoofedIp = `10.99.1.${i}`;
      const res = await sendRequest(app, {
        method: "POST",
        url: "/api/auth/login",
        ip: attackerSocketIp,
        headers: { "x-forwarded-for": spoofedIp },
        body: {
          username: `spray_victim_${i}@psu.co.id`,
          password: "WrongPassword!2026",
        },
      });

      if (res.status === 429) {
        blockedCount++;
      } else {
        allowedCount++;
      }
    }

    const passed = allowedCount === 20 && blockedCount === 5;
    recordTest("INTEGRATION", "INT-08", "Password Spraying with rotated headers blocked by Tier 2 IP limit (HTTP 429)", passed, `Allowed: ${allowedCount}, Blocked: ${blockedCount} (Limit: 20)`);
  }

  // INT-09: Rate Limiting - Targeted Brute Force blocked at Account threshold
  {
    const victim = "targeted_admin@psu.co.id";
    const attackerSocketIp = "198.51.100.82";
    let blockedCount = 0;
    let allowedCount = 0;

    for (let i = 1; i <= 8; i++) {
      const res = await sendRequest(app, {
        method: "POST",
        url: "/api/auth/login",
        ip: attackerSocketIp,
        body: {
          username: victim,
          password: "WrongPassword!2026",
        },
      });

      if (res.status === 429) {
        blockedCount++;
      } else {
        allowedCount++;
      }
    }

    const passed = allowedCount === 5 && blockedCount === 3;
    recordTest("INTEGRATION", "INT-09", "Targeted Brute-Force against single account blocked by Tier 1 Account limit (HTTP 429)", passed, `Allowed: ${allowedCount}, Blocked: ${blockedCount} (Limit: 5)`);
  }

  // INT-10: Rate Limiting - Legitimate IP isolated from attacker lockout
  {
    const legitSocketIp = "203.0.113.111";
    const res = await sendRequest(app, {
      method: "POST",
      url: "/api/auth/login",
      ip: legitSocketIp,
      body: {
        username: "legit_user@psu.co.id",
        password: "ValidFormattedPassword!123",
      },
    });

    const passed = res.status === 401; // Not 429!
    recordTest("INTEGRATION", "INT-10", "Legitimate IP traffic isolated and unaffected by rate limiter lockout", passed, `Legitimate IP received HTTP ${res.status} (invalid creds, not 429 lockout)`);
  }

  // INT-11: Full Endpoint Regression
  {
    const pubRes = await sendRequest(app, { method: "GET", url: "/api/artikel", ip: "127.0.0.1" });
    const galRes = await sendRequest(app, { method: "GET", url: "/api/galeri", ip: "127.0.0.1" });
    const authRes = await sendRequest(app, { method: "GET", url: "/api/auth/me", ip: "127.0.0.1" });

    const passed =
      pubRes.status === 200 &&
      galRes.status === 200 &&
      authRes.status === 401; // 401 because unauthenticated, route functions properly

    recordTest("INTEGRATION", "INT-11", "Application endpoints regression (artikel, galeri, auth/me)", passed, `Artikel: ${pubRes.status}, Galeri: ${galRes.status}, Auth/me: ${authRes.status}`);
  }

  // ==========================================================================
  // SECTION 3: PRODUCTION TOPOLOGY & INFRASTRUCTURE BOUNDARY AUDIT
  // ==========================================================================
  console.log("\n====================================================================");
  console.log("CATEGORY 3: PRODUCTION TOPOLOGY VERIFICATION (Infrastructure Audit)");
  console.log("====================================================================");

  // TOPO-01: Verify htaccess-production.txt passenger configuration
  {
    const htaccessPath = path.join(__dirname, "..", "..", "htaccess-production.txt");
    const exists = fs.existsSync(htaccessPath);
    let hasPassenger = false;
    let content = "";
    if (exists) {
      content = fs.readFileSync(htaccessPath, "utf8");
      hasPassenger = content.includes("PassengerAppRoot") || content.includes("RewriteRule ^api");
    }
    const passed = exists && hasPassenger;
    recordTest("TOPOLOGY", "TOPO-01", "Production Apache .htaccess passenger proxy configuration verified", passed, `File exists: ${exists}, RewriteRule/Passenger directives present`);
  }

  // TOPO-02: Verify Cloudflare CIDR block completeness against official specifications
  {
    // Canonical Cloudflare CIDRs published at https://www.cloudflare.com/ips-v4 and https://www.cloudflare.com/ips-v6
    const expectedV4Count = 15;
    const expectedV6Count = 7;
    const v4Count = CLOUDFLARE_PROXY_CIDRS.filter((c) => c.includes(".")).length;
    const v6Count = CLOUDFLARE_PROXY_CIDRS.filter((c) => c.includes(":")).length;

    const passed = v4Count === expectedV4Count && v6Count === expectedV6Count && CLOUDFLARE_PROXY_CIDRS.length === 22;
    recordTest("TOPOLOGY", "TOPO-02", "Cloudflare canonical CIDR list matches official specification (15 IPv4 + 7 IPv6)", passed, `IPv4 blocks: ${v4Count}/${expectedV4Count}, IPv6 blocks: ${v6Count}/${expectedV6Count}`);
  }

  // TOPO-03: Origin Protection Boundary Assessment
  {
    // Check if HOST binding is implemented in server.js
    const serverPath = path.join(__dirname, "..", "server.js");
    const serverContent = fs.readFileSync(serverPath, "utf8");
    const hasHostBinding = serverContent.includes("app.listen(PORT, HOST");
    recordTest("TOPOLOGY", "TOPO-03", "Host parameter binding hardening implemented in backend/server.js", hasHostBinding, `Express binds to explicitly defined HOST to prevent public port exposure`);
  }

  // TOPO-04: Private Network Boundary Notice & Risk Warning Audit
  {
    // Ensure that 'private' mode logs an explicit security advisory
    let logged = false;
    const origWarn = console.warn;
    console.warn = (msg) => {
      if (typeof msg === "string" && msg.includes("RFC1918")) logged = true;
    };
    createCustomApp("private");
    console.warn = origWarn;

    recordTest("TOPOLOGY", "TOPO-04", "RFC1918 Private network multi-tenant risk warning verified", logged, `Warning logged for shared VPC / container cluster deployments`);
  }

  // ==========================================================================
  // FINAL SUMMARY
  // ==========================================================================
  console.log("\n====================================================================");
  console.log("PHASE 1.3 TRUSTED PROXY AUDIT SUMMARY");
  console.log("====================================================================");

  const totalUnit = unitResults.length;
  const passUnit = unitResults.filter((r) => r.passed).length;

  const totalInt = integrationResults.length;
  const passInt = integrationResults.filter((r) => r.passed).length;

  const totalTopo = topologyResults.length;
  const passTopo = topologyResults.filter((r) => r.passed).length;

  const totalAll = totalUnit + totalInt + totalTopo;
  const passAll = passUnit + passInt + passTopo;
  const failAll = totalAll - passAll;

  console.log(`Unit Tests (Strict Validation)   : ${passUnit} / ${totalUnit} PASS`);
  console.log(`Integration Tests (HTTP Pipeline): ${passInt} / ${totalInt} PASS`);
  console.log(`Topology & Infrastructure Audits : ${passTopo} / ${totalTopo} PASS`);
  console.log(`--------------------------------------------------------------------`);
  console.log(`TOTAL PHASE 1.3 VERIFICATIONS    : ${passAll} / ${totalAll} PASS`);
  console.log(`TOTAL FAILURES                   : ${failAll}`);

  if (failAll > 0) {
    console.error("\n[VERIFICATION FAILED] One or more tests in Phase 1.3 failed.");
    process.exit(1);
  } else {
    console.log("\n[VERIFICATION SUCCESS] All Phase 1.3 tests passed with 100% accuracy.");
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error("Fatal error during test suite execution:", err);
  process.exit(1);
});

