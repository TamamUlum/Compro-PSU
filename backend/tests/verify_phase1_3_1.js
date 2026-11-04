/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) - SECURITY PHASE 1.3.1 TEST SUITE
 * ============================================================================
 * Scope: Final Trusted Proxy Correction & Universal CIDR Rejection (SEC-004)
 *
 * Specific Verification Criteria:
 *  1. Rejection of universal IPv4 CIDR (0.0.0.0/0)
 *  2. Rejection of universal IPv6 CIDR (::/0)
 *  3. Rejection of overly broad CIDRs (IPv4 prefix < 8, IPv6 prefix < 16)
 *  4. Rejection of unspecified standalone addresses (0.0.0.0, ::)
 *  5. Rejection of URLs (http://...) and hostnames (proxy.example.com)
 *  6. Acceptance of valid single IPv4 / IPv6 addresses
 *  7. Acceptance of compliant IPv4 (8 <= prefix <= 32) and IPv6 (16 <= prefix <= 128) CIDRs
 *  8. Strict compliance of all 22 Cloudflare canonical CIDR blocks
 *  9. Fail-closed startup when universal or overly broad CIDR is configured in TRUST_PROXY
 * 10. In-memory integration test demonstrating proxy discrimination under compliant CIDR
 * ============================================================================
 */

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "0123456789abcdef0123456789abcdef0123456789abcdef";

const express = require("express");
const http = require("http");
const { PassThrough } = require("stream");
const {
  app,
  configureTrustProxy,
  getClientIp,
  isValidIpOrCidr,
  IPV4_MIN_PREFIX,
  IPV6_MIN_PREFIX,
  CLOUDFLARE_PROXY_CIDRS,
} = require("../server");

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
      if (Buffer.isBuffer(body)) bodyBuf = body;
      else if (typeof body === "object") bodyBuf = Buffer.from(JSON.stringify(body));
      else bodyBuf = Buffer.from(String(body));
    }

    const socket = new PassThrough();
    socket.remoteAddress = ip;
    socket.encrypted = false;

    const req = new http.IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {
      host: "localhost",
      "user-agent": "security-phase1-3-1-verifier/1.0",
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

    if (bodyBuf) req.push(bodyBuf);
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
    });
  });

  return testApp;
}

const testResults = [];
function recordTest(id, name, passed, detail) {
  testResults.push({ id, name, passed, detail });
  const tag = passed ? "[PASS]" : "[FAIL]";
  console.log(`${tag} ${id}: ${name}`);
  if (detail) {
    console.log(`       Detail: ${detail}`);
  }
}

async function runPhase1_3_1Tests() {
  console.log("====================================================================");
  console.log("PT PENILAI STANDAR UJI (PSU) - PHASE 1.3.1 VERIFICATION SUITE");
  console.log("Target: Final Trusted Proxy Correction & Universal CIDR Rejection");
  console.log("====================================================================\n");

  // --------------------------------------------------------------------------
  // TEST GROUP 1: Universal and Overly Broad CIDR Rejection
  // --------------------------------------------------------------------------
  console.log("--- TEST GROUP 1: Universal & Overly Broad CIDR Rejection ---");

  // SEC-004-CIDR-01: Reject universal IPv4 CIDR (0.0.0.0/0)
  {
    const passed = isValidIpOrCidr("0.0.0.0/0") === false;
    recordTest(
      "SEC-004-CIDR-01",
      "Reject universal IPv4 CIDR wildcard (0.0.0.0/0)",
      passed,
      `0.0.0.0/0 correctly rejected by minimum prefix policy (${IPV4_MIN_PREFIX} <= prefix <= 32)`
    );
  }

  // SEC-004-CIDR-02: Reject universal IPv6 CIDR (::/0)
  {
    const passed = isValidIpOrCidr("::/0") === false;
    recordTest(
      "SEC-004-CIDR-02",
      "Reject universal IPv6 CIDR wildcard (::/0)",
      passed,
      `::/0 correctly rejected by minimum prefix policy (${IPV6_MIN_PREFIX} <= prefix <= 128)`
    );
  }

  // SEC-004-CIDR-03: Reject overly broad IPv4 CIDR (prefix < 8)
  {
    const broadIps = ["10.0.0.0/7", "128.0.0.0/1", "192.0.0.0/4", "0.0.0.0/8"];
    const allRejected = broadIps.every((ip) => isValidIpOrCidr(ip) === false);
    recordTest(
      "SEC-004-CIDR-03",
      "Reject overly broad IPv4 CIDRs (prefix < 8 and 0.0.0.0 base)",
      allRejected,
      `Tested: ${broadIps.join(", ")}`
    );
  }

  // SEC-004-CIDR-04: Reject overly broad IPv6 CIDR (prefix < 16)
  {
    const broadIpv6 = ["2001::/15", "2000::/3", "fe80::/10", "::/16"];
    const allRejected = broadIpv6.every((ip) => isValidIpOrCidr(ip) === false);
    recordTest(
      "SEC-004-CIDR-04",
      "Reject overly broad IPv6 CIDRs (prefix < 16 and :: base)",
      allRejected,
      `Tested: ${broadIpv6.join(", ")}`
    );
  }

  // SEC-004-CIDR-05: Reject unspecified standalone addresses
  {
    const unspecified = ["0.0.0.0", "::"];
    const allRejected = unspecified.every((ip) => isValidIpOrCidr(ip) === false);
    recordTest(
      "SEC-004-CIDR-05",
      "Reject unspecified standalone addresses (0.0.0.0 and ::)",
      allRejected,
      `Tested: ${unspecified.join(", ")}`
    );
  }

  // SEC-004-CIDR-06: Reject URLs and hostnames
  {
    const hostnames = ["http://127.0.0.1", "https://proxy.example.com", "localhost", "proxy.psu.co.id"];
    const allRejected = hostnames.every((h) => isValidIpOrCidr(h) === false);
    recordTest(
      "SEC-004-CIDR-06",
      "Reject URLs and hostnames as trusted proxy values",
      allRejected,
      `Tested: ${hostnames.join(", ")}`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 2: Compliant IP and CIDR Acceptance
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 2: Compliant IP & CIDR Acceptance ---");

  // SEC-004-CIDR-07: Accept compliant IPv4 CIDRs (8 <= prefix <= 32)
  {
    const validIpv4Cidrs = [
      "10.0.0.0/8",      // RFC 1918 Class A
      "172.16.0.0/12",   // RFC 1918 Class B
      "192.168.1.0/24",  // Local subnet
      "173.245.48.0/20", // Cloudflare IPv4
      "104.16.0.0/13",   // Cloudflare widest IPv4 (/13)
      "192.0.2.1/32",    // Single host CIDR
    ];
    const allValid = validIpv4Cidrs.every((c) => isValidIpOrCidr(c) === true);
    recordTest(
      "SEC-004-CIDR-07",
      "Accept compliant IPv4 CIDRs within policy boundary (8 to 32)",
      allValid,
      `Tested: ${validIpv4Cidrs.join(", ")}`
    );
  }

  // SEC-004-CIDR-08: Accept compliant IPv6 CIDRs (16 <= prefix <= 128)
  {
    const validIpv6Cidrs = [
      "2400:cb00::/32",  // Cloudflare IPv6
      "2a06:98c0::/29",  // Cloudflare widest IPv6 (/29)
      "2001:db8::/32",   // Standard documentation prefix
      "fd00::/16",       // Unique local minimum prefix
      "::1/128",         // Loopback host CIDR
    ];
    const allValid = validIpv6Cidrs.every((c) => isValidIpOrCidr(c) === true);
    recordTest(
      "SEC-004-CIDR-08",
      "Accept compliant IPv6 CIDRs within policy boundary (16 to 128)",
      allValid,
      `Tested: ${validIpv6Cidrs.join(", ")}`
    );
  }

  // SEC-004-CIDR-09: Accept valid standalone IPs
  {
    const validSingleIps = ["127.0.0.1", "10.0.1.5", "192.168.1.100", "::1", "2400:cb00::1"];
    const allValid = validSingleIps.every((ip) => isValidIpOrCidr(ip) === true);
    recordTest(
      "SEC-004-CIDR-09",
      "Accept valid standalone IPv4 and IPv6 proxy addresses",
      allValid,
      `Tested: ${validSingleIps.join(", ")}`
    );
  }

  // SEC-004-CIDR-10: Verify all 22 official Cloudflare CIDRs satisfy policy
  {
    const allCfValid = CLOUDFLARE_PROXY_CIDRS.every((cidr) => isValidIpOrCidr(cidr) === true);
    recordTest(
      "SEC-004-CIDR-10",
      "All 22 canonical Cloudflare CIDR blocks comply with minimum prefix policy",
      allCfValid && CLOUDFLARE_PROXY_CIDRS.length === 22,
      `Validated 22 CIDRs (15 IPv4 with prefixes 13-22, 7 IPv6 with prefixes 29-32)`
    );
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 3: Fail-Closed Server Configuration & Pipeline Integration
  // --------------------------------------------------------------------------
  console.log("\n--- TEST GROUP 3: Fail-Closed Configuration & Integration ---");

  // SEC-004-CIDR-11: Fail-closed when universal 0.0.0.0/0 is configured in TRUST_PROXY
  {
    let thrown = false;
    let errMessage = "";
    try {
      createCustomApp("0.0.0.0/0");
    } catch (e) {
      thrown = true;
      errMessage = e.message;
    }
    const passed = thrown && errMessage.includes("Universal CIDRs (such as /0)");
    recordTest(
      "SEC-004-CIDR-11",
      "Fail-closed startup when TRUST_PROXY='0.0.0.0/0'",
      passed,
      `Captured error: ${errMessage}`
    );
  }

  // SEC-004-CIDR-12: Fail-closed when universal ::/0 is configured in TRUST_PROXY
  {
    let thrown = false;
    let errMessage = "";
    try {
      createCustomApp("::/0");
    } catch (e) {
      thrown = true;
      errMessage = e.message;
    }
    const passed = thrown && errMessage.includes("Universal CIDRs (such as /0)");
    recordTest(
      "SEC-004-CIDR-12",
      "Fail-closed startup when TRUST_PROXY='::/0'",
      passed,
      `Captured error: ${errMessage}`
    );
  }

  // SEC-004-CIDR-13: Fail-closed when mixed list contains one universal CIDR
  {
    let thrown = false;
    let errMessage = "";
    try {
      createCustomApp("10.0.0.1, 0.0.0.0/0");
    } catch (e) {
      thrown = true;
      errMessage = e.message;
    }
    const passed = thrown && errMessage.includes("Universal CIDRs (such as /0)");
    recordTest(
      "SEC-004-CIDR-13",
      "Fail-closed startup when mixed list contains universal CIDR (10.0.0.1, 0.0.0.0/0)",
      passed,
      `Captured error: ${errMessage}`
    );
  }

  // SEC-004-CIDR-14: In-memory pipeline discrimination under compliant CIDR
  {
    // Configure app with compliant private subnet: 10.0.0.0/8
    const appSubnet = createCustomApp("10.0.0.0/8");

    // 1. Connection from trusted IP within subnet (10.1.2.3)
    const resTrusted = await sendRequest(appSubnet, {
      method: "GET",
      url: "/test-ip",
      ip: "10.1.2.3",
      headers: { "x-forwarded-for": "203.0.113.77" },
    });

    // 2. Connection from untrusted IP outside subnet (172.16.1.1)
    const resUntrusted = await sendRequest(appSubnet, {
      method: "GET",
      url: "/test-ip",
      ip: "172.16.1.1",
      headers: { "x-forwarded-for": "203.0.113.77" },
    });

    const passed =
      resTrusted.json.clientIp === "203.0.113.77" &&
      resUntrusted.json.clientIp === "172.16.1.1";

    recordTest(
      "SEC-004-CIDR-14",
      "In-memory pipeline discriminates trusted subnet (10.0.0.0/8) vs untrusted socket",
      passed,
      `Trusted 10.1.2.3 -> ${resTrusted.json.clientIp}; Untrusted 172.16.1.1 -> ${resUntrusted.json.clientIp}`
    );
  }

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n====================================================================");
  console.log("PHASE 1.3.1 VERIFICATION SUMMARY");
  console.log("====================================================================");

  const total = testResults.length;
  const passed = testResults.filter((t) => t.passed).length;
  const failed = total - passed;

  console.log(`Total Phase 1.3.1 Tests : ${total}`);
  console.log(`Passed                  : ${passed}`);
  console.log(`Failed                  : ${failed}`);

  if (failed > 0) {
    console.error("\n[VERIFICATION FAILED] One or more tests in Phase 1.3.1 failed.");
    process.exit(1);
  } else {
    console.log("\n[VERIFICATION SUCCESS] All Phase 1.3.1 tests passed with 100% accuracy.");
    process.exit(0);
  }
}

runPhase1_3_1Tests().catch((err) => {
  console.error("Fatal error during test suite execution:", err);
  process.exit(1);
});

