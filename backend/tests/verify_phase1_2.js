/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) - SECURITY PHASE 1.2 INDEPENDENT TEST SUITE
 * ============================================================================
 * Target: SEC-004 Express 'trust proxy' & IP Header Hardening Verification
 *
 * Scope:
 *  1. Verification of configureTrustProxy() under all supported deployment topologies:
 *     - Direct connection (false / none / 0)
 *     - Local reverse proxy (loopback: Apache / Nginx / Passenger)
 *     - Cloudflare CDN (loopback + official Cloudflare CIDR blocks)
 *     - Private LAN / Docker / K8s (private / lan)
 *     - Custom IP / CIDR list
 *     - Fixed hop count warning advisory
 *  2. Verification of getClientIp(req) header extraction:
 *     - Spoofing immunity on direct connections
 *     - Untrusted socket header rejection
 *     - Trusted reverse proxy X-Forwarded-For resolution
 *     - CF-Connecting-IP validation (only trusted when socket is trusted proxy)
 *     - IPv6-mapped IPv4 prefix stripping (::ffff:)
 *  3. Rate Limiter Defense Verification:
 *     - Password spraying attack mitigation across rotated spoofed headers
 *     - Targeted brute-force lock out at Tier 1 (Account limit)
 *     - Global IP lock out at Tier 2 (IP limit)
 *     - Independent IP traffic isolation
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
const {
  app,
  configureTrustProxy,
  getClientIp,
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
      "user-agent": "security-phase1-2-verifier/1.0",
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

// Helper to inspect request resolution directly via a test route on a given test app
function createTestApp(trustProxySetting) {
  const testApp = express();
  process.env.TRUST_PROXY = trustProxySetting;
  configureTrustProxy(testApp);

  testApp.get("/test-ip", (req, res) => {
    res.json({
      reqIp: req.ip,
      reqIps: req.ips,
      clientIp: getClientIp(req),
    });
  });

  return testApp;
}

const testResults = [];
function recordTest(id, name, passed, detail) {
  testResults.push({ id, name, passed, detail });
  const status = passed ? "[PASS]" : "[FAIL]";
  console.log(`${status} ${id}: ${name}`);
  if (detail) {
    console.log(`       Detail: ${detail}`);
  }
}

async function runTests() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) - PHASE 1.2 TRUSTED PROXY VERIFICATION");
  console.log("====================================================================\n");

  // --------------------------------------------------------------------------
  // TEST GROUP 1: Direct Connection Topology (TRUST_PROXY=false)
  // --------------------------------------------------------------------------
  console.log("--- TEST GROUP 1: Direct Connection Topology (TRUST_PROXY=false) ---");
  const directApp = createTestApp("false");

  // SEC-004-TP-01: Direct connection ignores spoofed X-Forwarded-For
  {
    const res = await sendRequest(directApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.195",
      headers: {
        "x-forwarded-for": "198.51.100.2, 10.0.0.1",
      },
    });

    const passed =
      res.json.clientIp === "203.0.113.195" &&
      res.json.reqIp === "203.0.113.195" &&
      res.json.reqIps.length === 0;

    recordTest(
      "SEC-004-TP-01",
      "Direct connection ignores spoofed X-Forwarded-For",
      passed,
      `Expected socket 203.0.113.195, got ${res.json.clientIp}. req.ips length: ${res.json.reqIps.length}`
    );
  }

  // SEC-004-TP-02: Direct connection ignores spoofed CF-Connecting-IP
  {
    const res = await sendRequest(directApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.195",
      headers: {
        "cf-connecting-ip": "1.1.1.1",
        "x-forwarded-for": "1.1.1.1",
      },
    });

    const passed = res.json.clientIp === "203.0.113.195";

    recordTest(
      "SEC-004-TP-02",
      "Direct connection ignores spoofed CF-Connecting-IP header",
      passed,
      `Attacker sent CF-Connecting-IP=1.1.1.1. Server extracted real socket: ${res.json.clientIp}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Local Reverse Proxy Topology (TRUST_PROXY=loopback)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Local Reverse Proxy Topology (TRUST_PROXY=loopback) ---");
  const loopbackApp = createTestApp("loopback");

  // SEC-004-TP-03: Loopback reverse proxy correctly extracts client IP from 127.0.0.1
  {
    const res = await sendRequest(loopbackApp, {
      method: "GET",
      url: "/test-ip",
      ip: "127.0.0.1",
      headers: {
        "x-forwarded-for": "198.51.100.88",
      },
    });

    const passed =
      res.json.clientIp === "198.51.100.88" &&
      res.json.reqIp === "198.51.100.88" &&
      res.json.reqIps.includes("198.51.100.88");

    recordTest(
      "SEC-004-TP-03",
      "Loopback proxy extracts genuine client IP forwarded from 127.0.0.1",
      passed,
      `Client IP: ${res.json.clientIp}, req.ips: ${JSON.stringify(res.json.reqIps)}`
    );
  }

  // SEC-004-TP-04: Non-loopback socket connecting to loopback-configured server cannot spoof X-Forwarded-For
  {
    const res = await sendRequest(loopbackApp, {
      method: "GET",
      url: "/test-ip",
      ip: "203.0.113.50",
      headers: {
        "x-forwarded-for": "8.8.8.8",
      },
    });

    const passed =
      res.json.clientIp === "203.0.113.50" &&
      res.json.reqIp === "203.0.113.50" &&
      res.json.reqIps.length === 0;

    recordTest(
      "SEC-004-TP-04",
      "Untrusted remote socket connecting directly to loopback-configured server is rejected",
      passed,
      `Expected socket 203.0.113.50, got ${res.json.clientIp}. req.ips length: ${res.json.reqIps.length}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Cloudflare CDN Topology (TRUST_PROXY=cloudflare)
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Cloudflare CDN Topology (TRUST_PROXY=cloudflare) ---");
  const cfApp = createTestApp("cloudflare");

  // SEC-004-TP-05: Cloudflare proxy correctly trusts Cloudflare edge IP and reads CF-Connecting-IP
  {
    // 173.245.48.55 belongs to 173.245.48.0/20 (Cloudflare IPv4 block)
    const res = await sendRequest(cfApp, {
      method: "GET",
      url: "/test-ip",
      ip: "173.245.48.55",
      headers: {
        "cf-connecting-ip": "103.200.5.21",
        "x-forwarded-for": "103.200.5.21, 173.245.48.55",
      },
    });

    const passed = res.json.clientIp === "103.200.5.21";

    recordTest(
      "SEC-004-TP-05",
      "Cloudflare topology trusts Cloudflare edge IP and extracts CF-Connecting-IP",
      passed,
      `Edge IP 173.245.48.55 -> extracted client IP: ${res.json.clientIp}`
    );
  }

  // SEC-004-TP-06: Direct connection bypass attempt pretending to be Cloudflare is rejected
  {
    // Attacker IP 198.51.100.99 is not in Cloudflare CIDR range
    const res = await sendRequest(cfApp, {
      method: "GET",
      url: "/test-ip",
      ip: "198.51.100.99",
      headers: {
        "cf-connecting-ip": "1.1.1.1",
        "x-forwarded-for": "1.1.1.1",
      },
    });

    const passed =
      res.json.clientIp === "198.51.100.99" &&
      res.json.reqIp === "198.51.100.99" &&
      res.json.reqIps.length === 0;

    recordTest(
      "SEC-004-TP-06",
      "Untrusted client pretending to be Cloudflare cannot spoof CF-Connecting-IP",
      passed,
      `Attacker socket 198.51.100.99 correctly pinned as client IP. Spoofed 1.1.1.1 ignored.`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 4: Custom CIDR and Configuration Safety
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 4: Custom CIDR and Configuration Safety ---");

  // SEC-004-TP-07: Custom subnet trust proxy configuration
  {
    const customApp = createTestApp("10.0.0.0/8, 192.168.1.0/24");

    const trustedRes = await sendRequest(customApp, {
      method: "GET",
      url: "/test-ip",
      ip: "10.1.2.3",
      headers: {
        "x-forwarded-for": "203.0.113.7",
      },
    });

    const untrustedRes = await sendRequest(customApp, {
      method: "GET",
      url: "/test-ip",
      ip: "172.16.5.5",
      headers: {
        "x-forwarded-for": "203.0.113.7",
      },
    });

    const passed =
      trustedRes.json.clientIp === "203.0.113.7" &&
      untrustedRes.json.clientIp === "172.16.5.5";

    recordTest(
      "SEC-004-TP-07",
      "Custom CIDR subnet correctly discriminates trusted vs untrusted sockets",
      passed,
      `10.1.2.3 trusted -> ${trustedRes.json.clientIp}; 172.16.5.5 untrusted -> ${untrustedRes.json.clientIp}`
    );
  }

  // SEC-004-TP-08: Fixed hop count must be strictly rejected (Phase 1.3 Hardening)
  {
    let rejected = false;
    let errorMsg = "";
    try {
      createTestApp("1");
    } catch (err) {
      rejected = true;
      errorMsg = err.message;
    }

    recordTest(
      "SEC-004-TP-08",
      "Fixed hop count triggers strict rejection (fail-closed)",
      rejected && errorMsg.includes("Numeric hop count configuration"),
      `Numeric hop count '1' threw expected error: ${errorMsg}`
    );
  }

  // SEC-004-TP-09: IPv6-mapped IPv4 normalization (::ffff:x.x.x.x -> x.x.x.x)
  {
    const res = await sendRequest(directApp, {
      method: "GET",
      url: "/test-ip",
      ip: "::ffff:203.0.113.44",
    });

    const passed = res.json.clientIp === "203.0.113.44";

    recordTest(
      "SEC-004-TP-09",
      "IPv6-mapped IPv4 socket address normalized cleanly",
      passed,
      `::ffff:203.0.113.44 normalized to ${res.json.clientIp}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 5: Rate Limiting Attack Simulation & Integrity
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 5: Rate Limiting Attack Simulation & Integrity ---");

  // SEC-004-TP-10: Password Spraying Attack Defense
  // Attacker on a single socket tries 25 different accounts, rotating X-Forwarded-For each time
  {
    const attackerSocketIp = "198.51.100.77";
    let blockedCount = 0;
    let allowedBeforeBlock = 0;

    // Use main backend app configured with direct or loopback
    process.env.TRUST_PROXY = "false";
    configureTrustProxy(app);

    for (let i = 1; i <= 25; i++) {
      const spoofedIp = `1.2.3.${i}`;
      const res = await sendRequest(app, {
        method: "POST",
        url: "/api/auth/login",
        ip: attackerSocketIp,
        headers: {
          "x-forwarded-for": spoofedIp,
        },
        body: {
          email: `victim_${i}@psu.co.id`,
          password: "WrongPassword!2026",
        },
      });

      if (res.status === 429) {
        blockedCount++;
      } else {
        allowedBeforeBlock++;
      }
    }

    // AUTH_FAIL_LIMIT_IP is 20. So 20 attempts should fail with 401, then 5 attempts should receive 429.
    const passed =
      blockedCount >= 5 &&
      allowedBeforeBlock === 20;

    recordTest(
      "SEC-004-TP-10",
      "Password Spraying with rotated X-Forwarded-For blocked by Tier 2 IP limit",
      passed,
      `Attempts allowed: ${allowedBeforeBlock}, blocked with 429: ${blockedCount} (Limit: 20)`
    );
  }

  // SEC-004-TP-11: Targeted Brute Force Attack Defense (Account Lockout Tier 1)
  {
    const victimAccount = "admin_target@psu.co.id";
    const attackerSocketIp = "198.51.100.88";
    let blockedCount = 0;
    let allowedBeforeBlock = 0;

    for (let i = 1; i <= 8; i++) {
      const res = await sendRequest(app, {
        method: "POST",
        url: "/api/auth/login",
        ip: attackerSocketIp,
        body: {
          email: victimAccount,
          password: "WrongPassword!2026",
        },
      });

      if (res.status === 429) {
        blockedCount++;
      } else {
        allowedBeforeBlock++;
      }
    }

    // AUTH_FAIL_LIMIT_ACCOUNT is 5. So 5 attempts fail with 401, remaining 3 receive 429.
    const passed = allowedBeforeBlock === 5 && blockedCount === 3;

    recordTest(
      "SEC-004-TP-11",
      "Targeted Brute-Force against single account blocked by Tier 1 Account limit",
      passed,
      `Attempts allowed before block: ${allowedBeforeBlock}, blocked with 429: ${blockedCount} (Limit: 5)`
    );
  }

  // SEC-004-TP-12: Independent Legitimate IP Traffic Isolation
  {
    // Distinct legitimate client IP
    const legitSocketIp = "203.0.113.222";

    // Even though 198.51.100.77 and 198.51.100.88 are locked out, this client should get 401 not 429
    const res = await sendRequest(app, {
      method: "POST",
      url: "/api/auth/login",
      ip: legitSocketIp,
      body: {
        email: "legitimate_user@psu.co.id",
        password: "ValidFormattedPassword!123",
      },
    });

    const passed = res.status === 401; // Not 429!

    recordTest(
      "SEC-004-TP-12",
      "Legitimate IP traffic is isolated and unaffected by attacker rate limit lockout",
      passed,
      `Legitimate IP ${legitSocketIp} received status ${res.status} (expected 401 invalid creds, not 429 lockout)`
    );
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n====================================================================");
  console.log("PHASE 1.2 TRUSTED PROXY SECURITY VERIFICATION SUMMARY");
  console.log("====================================================================");

  const total = testResults.length;
  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = total - passedCount;

  console.log(`Total Verification Tests : ${total}`);
  console.log(`Passed                   : ${passedCount}`);
  console.log(`Failed                   : ${failedCount}`);

  if (failedCount > 0) {
    console.error("\n[VERIFICATION FAILED] One or more security tests did not pass.");
    process.exit(1);
  } else {
    console.log("\n[VERIFICATION SUCCESS] All 12 trusted proxy & IP defense tests passed cleanly.");
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Test execution unhandled error:", err);
  process.exit(1);
});

