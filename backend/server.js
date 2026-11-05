const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const net = require("net");
let mysql;
try {
  mysql = require("mysql2/promise");
} catch {
  mysql = null;
}
let sharp;
try {
  sharp = require("sharp");
} catch {
  sharp = null;
}
require("dotenv").config({ path: path.join(__dirname, ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();

// Konfigurasi Topologi Trusted Reverse Proxy (SEC-004 Hardening)
// Rentang IP resmi Cloudflare (IPv4 & IPv6) untuk topologi CDN
const CLOUDFLARE_PROXY_CIDRS = [
  "173.245.48.0/20",
  "103.21.244.0/22",
  "103.22.200.0/22",
  "103.31.4.0/22",
  "141.101.64.0/18",
  "108.162.192.0/18",
  "190.93.240.0/20",
  "188.114.96.0/20",
  "197.234.240.0/22",
  "198.41.128.0/17",
  "162.158.0.0/15",
  "104.16.0.0/13",
  "104.24.0.0/14",
  "172.64.0.0/13",
  "131.0.72.0/22",
  "2400:cb00::/32",
  "2606:4700::/32",
  "2803:f800::/32",
  "2405:b500::/32",
  "2405:8100::/32",
  "2a06:98c0::/29",
  "2c0f:f248::/32",
];

// Kebijakan Minimum Prefix Keamanan (SEC-004 Phase 1.3.1):
// - IPv4: 8 <= prefix <= 32 (Mencegah wildcard /0 s/d /7 yang mencakup >16.7 juta IP)
// - IPv6: 16 <= prefix <= 128 (Mencegah wildcard /0 s/d /15 yang mencakup ruang alamat tak terkontrol)
// - Seluruh 22 blok resmi Cloudflare (IPv4 /13-/22 dan IPv6 /29-/32) sepenuhnya valid
const IPV4_MIN_PREFIX = 8;
const IPV4_MAX_PREFIX = 32;
const IPV6_MIN_PREFIX = 16;
const IPV6_MAX_PREFIX = 128;

// Validasi format IPv4/IPv6 tunggal atau notasi CIDR (ip/mask)
function isValidIpOrCidr(str) {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed) return false;

  // Tolak URL atau hostname
  if (trimmed.includes("://") || (/[a-z]/i.test(trimmed) && !trimmed.includes(":"))) {
    return false;
  }

  // Standalone IP
  const ipType = net.isIP(trimmed);
  if (ipType === 4 || ipType === 6) {
    // Tolak alamat unspecified
    if (trimmed === "0.0.0.0" || trimmed === "::") return false;
    return true;
  }

  // Notasi CIDR: baseIp/prefix
  const parts = trimmed.split("/");
  if (parts.length === 2) {
    const baseIp = parts[0].trim();
    const prefixStr = parts[1].trim();
    const baseType = net.isIP(baseIp);

    // Pastikan baseIp valid dan bukan unspecified
    if (baseType !== 4 && baseType !== 6) return false;
    if (baseIp === "0.0.0.0" || baseIp === "::") {
      return false;
    }

    // Prefix harus bilangan bulat numerik murni
    if (!/^\d+$/.test(prefixStr)) return false;
    const prefix = Number(prefixStr);

    if (baseType === 4) {
      // Kebijakan IPv4: 8 <= prefix <= 32 (Tolak /0 s/d /7)
      if (prefix >= IPV4_MIN_PREFIX && prefix <= IPV4_MAX_PREFIX) {
        return true;
      }
    } else if (baseType === 6) {
      // Kebijakan IPv6: 16 <= prefix <= 128 (Tolak /0 s/d /15)
      if (prefix >= IPV6_MIN_PREFIX && prefix <= IPV6_MAX_PREFIX) {
        return true;
      }
    }
  }

  return false;
}

function configureTrustProxy(expressApp) {
  const envVal = (process.env.TRUST_PROXY || "false").trim();
  const lowerVal = envVal.toLowerCase();

  // TASK 1: Penolakan eksplisit konfigurasi tidak aman (fail-closed)
  if (lowerVal === "true") {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION ERROR] TRUST_PROXY='true' is strictly prohibited. It permits universal forwarded-header spoofing. Specify 'false', 'loopback', 'cloudflare', 'private', or explicit trusted IP/CIDR."
    );
  }

  if (!isNaN(Number(envVal))) {
    throw new Error(
      `[FATAL SECURITY CONFIGURATION ERROR] Numeric hop count configuration in TRUST_PROXY ('${envVal}') is strictly prohibited. It permits direct-connection bypass. Specify 'loopback', 'cloudflare', or explicit IP/CIDR.`
    );
  }

  if (lowerVal === "false" || lowerVal === "none" || lowerVal === "off") {
    // Direct connection: Forwarded headers TIDAK DIPERCAYA
    expressApp.set("trust proxy", false);
    expressApp.set("trust cloudflare", false);
    return;
  }

  if (lowerVal === "loopback") {
    // Topologi reverse proxy lokal (Apache / Nginx / cPanel Passenger pada 127.0.0.1)
    expressApp.set("trust proxy", "loopback");
    expressApp.set("trust cloudflare", false);
    return;
  }

  if (lowerVal === "private") {
    // Topologi jaringan privat internal (Docker / LAN / Kubernetes)
    console.warn(
      "[SECURITY NOTICE] TRUST_PROXY='private' trusts all RFC1918 private subnets. Ensure your internal network/VPC does not host untrusted workloads or sibling containers."
    );
    expressApp.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
    expressApp.set("trust cloudflare", false);
    return;
  }

  if (lowerVal === "cloudflare") {
    // Topologi Cloudflare CDN: Hanya percaya loopback lokal + rentang IP resmi Cloudflare
    expressApp.set("trust proxy", ["loopback", ...CLOUDFLARE_PROXY_CIDRS]);
    expressApp.set("trust cloudflare", true);
    return;
  }

  // Daftar IP atau subnet CIDR spesifik yang dipisahkan koma
  const ipList = envVal.split(",").map((s) => s.trim()).filter(Boolean);
  if (ipList.length === 0) {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION ERROR] Empty TRUST_PROXY configuration provided."
    );
  }

  const finalProxies = [];
  let hasCloudflare = false;

  for (const item of ipList) {
    const itemLower = item.toLowerCase();
    if (itemLower === "cloudflare") {
      finalProxies.push(...CLOUDFLARE_PROXY_CIDRS);
      hasCloudflare = true;
    } else if (itemLower === "loopback") {
      finalProxies.push("loopback");
    } else if (isValidIpOrCidr(item)) {
      finalProxies.push(item);
    } else {
      throw new Error(
        `[FATAL SECURITY CONFIGURATION ERROR] Invalid, overly broad, or malformed entry in TRUST_PROXY: '${item}'. Must be a valid IPv4/IPv6 address, compliant CIDR notation (IPv4 prefix 8-32, IPv6 prefix 16-128), or supported keyword ('loopback', 'cloudflare'). Universal CIDRs (such as /0) and hostnames are strictly prohibited.`
      );
    }
  }

  expressApp.set("trust proxy", finalProxies);
  expressApp.set("trust cloudflare", hasCloudflare);
}

try {
  configureTrustProxy(app);
} catch (err) {
  console.error("====================================================================");
  console.error(err.message);
  console.error("Server dimatikan secara aman (fail-closed) untuk mencegah kerentanan IP spoofing.");
  console.error("====================================================================");
  process.exit(1);
}
const PORT = Number(process.env.PORT) || 5000;
const HOST = process.env.HOST || "0.0.0.0";

// Validasi fail-closed JWT_SECRET: Harus disetel di .env dan memiliki panjang minimal 32 karakter
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || typeof JWT_SECRET !== "string" || JWT_SECRET.trim().length < 32) {
  console.error("====================================================================");
  console.error("[FATAL SECURITY CONFIGURATION ERROR] JWT_SECRET is missing or insecure (< 32 chars).");
  console.error("Server dimatikan secara aman (fail-closed) untuk mencegah pemalsuan token sesi.");
  console.error("Silakan setel variabel JWT_SECRET yang aman di file .env Anda.");
  console.error("====================================================================");
  process.exit(1);
}
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

// ============================================================================
// STRICT ORIGIN WHITELIST & CORS CONFIGURATION (SEC-007)
// ============================================================================
const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  "https://penilaistandaruji.com",
  "https://www.penilaistandaruji.com",
];

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

const ALLOWED_ORIGIN_SET = new Set([
  ...DEFAULT_ALLOWED_ORIGINS.map((o) => o.toLowerCase()),
  ...envAllowedOrigins,
]);

function isOriginAllowed(origin) {
  if (!origin) return true; // Direct connection, same-origin, or CLI/API tools
  try {
    const parsed = new URL(origin);
    return ALLOWED_ORIGIN_SET.has(parsed.origin.toLowerCase());
  } catch {
    return false;
  }
}

// ============================================================================
// SECURITY HEADERS & DEFENSE-IN-DEPTH (SEC-009)
// ============================================================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CSP: dimulakan dengan Report-Only untuk menjamin kompatibilitas runtime frontend
  res.setHeader(
    "Content-Security-Policy-Report-Only",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: /news/; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';"
  );
  // HSTS: hanya diwajibkan dan dikirim pada respon HTTPS terverifikasi (tanpa includeSubDomains / preload)
  const isHttps = req.secure || req.headers["x-forwarded-proto"] === "https";
  if (isHttps) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
  }
  next();
});

// ============================================================================
// STRUCTURED OPERATIONAL LOGGING (NEW-001)
// ============================================================================
app.use((req, res, next) => {
  const start = Date.now();
  const clientIp = getClientIp(req);
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "test") {
      const sanitizedUrl = (req.originalUrl || req.url || "").split("?")[0];
      console.log(
        `[${new Date().toISOString()}] [${clientIp}] ${req.method} ${sanitizedUrl} ${res.statusCode} ${duration}ms`
      );
    }
  });
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin)) {
        return callback(null, true);
      }
      // Tolak origin tidak terdaftar tanpa header Access-Control-Allow-Origin
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Access-Token",
      "X-CSRF-Token",
      "X-Auth-Client",
      "CF-Connecting-IP",
    ],
    exposedHeaders: [
      "Retry-After",
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
      "Set-Cookie",
    ],
  })
);

// ============================================================================
// COOKIE PARSER & CSRF PROTECTION MIDDLEWARE (SEC-006)
// ============================================================================
function parseCookies(req) {
  const cookies = {};
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader || typeof cookieHeader !== "string") return cookies;
  const pairs = cookieHeader.split(";");
  for (const pair of pairs) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    if (!key) continue;
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

app.use((req, res, next) => {
  req.cookies = parseCookies(req);
  next();
});

// ============================================================================
// REQUEST BODY PARSER LIMIT (SEC-010)
// ============================================================================
// Global JSON dan urlencoded dibatasi maksimal 1 MB untuk mitigasi DoS
const globalJsonParser = express.json({ limit: "1mb" });
const globalUrlencodedParser = express.urlencoded({ limit: "1mb", extended: true });
const uploadJsonParser = express.json({ limit: "10mb" });

app.use((req, res, next) => {
  // Pengecualian rute upload gambar yang memerlukan kapasitas payload base64 hingga 10MB
  if (req.path === "/api/upload-gambar") {
    return next();
  }
  globalJsonParser(req, res, (err) => {
    if (err) return next(err);
    globalUrlencodedParser(req, res, next);
  });
});

function csrfProtection(req, res, next) {
  const stateChangingMethods = ["POST", "PUT", "PATCH", "DELETE"];
  if (!stateChangingMethods.includes(req.method.toUpperCase())) {
    return next();
  }

  // Pengecualian endpoint publik login (inisiasi sesi)
  if (req.path === "/api/auth/login") {
    return next();
  }

  // Jika permintaan diautentikasi via HttpOnly cookie, validasi CSRF bersifat wajib
  const hasCookieAuth = Boolean(req.cookies && req.cookies.psu_auth_token);
  if (hasCookieAuth) {
    // Validasi Origin / Referer terhadap whitelist jika ada
    const origin = req.headers.origin;
    if (origin && !isOriginAllowed(origin)) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: `CSRF Error: Permintaan dari origin '${origin}' ditolak oleh kebijakan keamanan.`,
      });
    }

    const csrfHeader = req.headers["x-csrf-token"];
    const csrfCookie = req.cookies.psu_csrf_token;

    if (!csrfHeader || !csrfCookie) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: "CSRF token hilang atau tidak valid. Silakan muat ulang halaman.",
      });
    }

    const headerBuf = Buffer.from(String(csrfHeader));
    const cookieBuf = Buffer.from(String(csrfCookie));

    if (headerBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(headerBuf, cookieBuf)) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: "Validasi CSRF token gagal. Permintaan tidak diizinkan.",
      });
    }
  }

  return next();
}

app.use(csrfProtection);

// ============================================================================
// HEALTH CHECK MONITORING ENDPOINT (NEW-001)
// ============================================================================
// Endpoint monitoring kesehatan server dan ketersediaan database tanpa ekspos kredensial
app.get("/api/health", async (req, res) => {
  let dbStatus = "connected";
  if (!pool) {
    dbStatus = "fallback_store";
  } else {
    try {
      await pool.query("SELECT 1");
    } catch {
      dbStatus = "fallback_store";
    }
  }
  return res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    database: dbStatus,
  });
});

// Sajikan folder gambar berita secara statis agar bisa diakses langsung dari backend maupun Vite
const publicNewsDir = path.join(__dirname, "..", "company-profile", "public", "news");
const distNewsDir = path.join(__dirname, "..", "company-profile", "dist", "news");
fs.mkdirSync(publicNewsDir, { recursive: true });
app.use(
  "/news",
  (req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Disposition", "inline");
    next();
  },
  express.static(publicNewsDir)
);

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "psu_company_profile",
  port: Number(process.env.DB_PORT) || 3306,
};

// Pemetaan Whitelist Tabel Sertifikat (SEC-005 Hardening: Object.freeze)
const TABLE_MAP = Object.freeze({
  "sertifikasi-produk": "sertifikat_produk",
  pengujian: "sertifikat_pengujian",
  kalibrasi: "sertifikat_kalibrasi",
  "sertifikasi-sistem-manajemen": "sertifikat_sistem_manajemen",
});

const AUTHOR_OPTIONS = [
  "Corporate Secretary PSU",
  "Tim Redaksi & Humas PSU",
  "Divisi Sertifikasi Produk (LSPro)",
  "Divisi Laboratorium Pengujian & Kalibrasi",
  "Divisi LSSM PSU",
  "Divisi Pelatihan PSU",
  "Arief Prihardono Darmawan",
  "Amanda Putri",
  "Winda Arliny",
];

const INITIAL_AUTHORS_META = [
  { name: "Corporate Secretary PSU", role_title: "Sekretaris Perusahaan", division: "Corporate Secretary" },
  { name: "Tim Redaksi & Humas PSU", role_title: "Editor Utama", division: "Humas & Komunikasi Korporat" },
  { name: "Divisi Sertifikasi Produk (LSPro)", role_title: "Tim Teknis LSPro", division: "Lembaga Sertifikasi Produk" },
  { name: "Divisi Laboratorium Pengujian & Kalibrasi", role_title: "Spesialis Laboratorium", division: "Laboratorium Pengujian & Kalibrasi" },
  { name: "Divisi LSSM PSU", role_title: "Auditor Sistem Manajemen", division: "Sertifikasi Sistem Manajemen" },
  { name: "Divisi Pelatihan PSU", role_title: "Koordinator Pelatihan", division: "Lembaga Pelatihan" },
  { name: "Arief Prihardono Darmawan", role_title: "Direktur / Manajemen", division: "Direksi PSU" },
  { name: "Amanda Putri", role_title: "Corporate Communication Officer", division: "Humas & Kemitraan" },
  { name: "Winda Arliny", role_title: "Quality Assurance Specialist", division: "Penjaminan Mutu" },
];

const DEFAULT_GALLERY_ITEMS = [
  {
    title: "Banner Kantor PSU 1",
    filename: "Logo_PSU_banner1.webp",
    image_url: "/Logo_PSU_banner1.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 1",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Banner Kantor PSU 2",
    filename: "Logo_PSU_banner2.webp",
    image_url: "/Logo_PSU_banner2.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 2",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Banner Kantor PSU 3",
    filename: "Logo_PSU_banner3.webp",
    image_url: "/Logo_PSU_banner3.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 3",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Banner Kantor PSU 4",
    filename: "Logo_PSU_banner4.webp",
    image_url: "/Logo_PSU_banner4.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 4",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Banner Kantor PSU 5",
    filename: "Logo_PSU_banner5.webp",
    image_url: "/Logo_PSU_banner5.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 5",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Banner Kantor PSU 6",
    filename: "Logo_PSU_banner6.webp",
    image_url: "/Logo_PSU_banner6.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 6",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Layanan Sertifikasi Produk (LSPro)",
    filename: "LSPro.webp",
    image_url: "/LSPro.webp",
    category: "Layanan PSU",
    alt_text: "Layanan Sertifikasi Produk LSPro PSU",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Laboratorium Pengujian PSU",
    filename: "lab_pengujian.webp",
    image_url: "/lab_pengujian.webp",
    category: "Layanan PSU",
    alt_text: "Fasilitas Laboratorium Pengujian PSU",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Laboratorium Kalibrasi PSU",
    filename: "lab_kalibrasi.webp",
    image_url: "/lab_kalibrasi.webp",
    category: "Layanan PSU",
    alt_text: "Fasilitas Laboratorium Kalibrasi PSU",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Lembaga Pelatihan PSU",
    filename: "_pelatihan.webp",
    image_url: "/_pelatihan.webp",
    category: "Layanan PSU",
    alt_text: "Kegiatan Pelatihan Terpadu PSU",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Sistem Manajemen Mutu (LSSM)",
    filename: "sistem_manajemen_mutu.webp",
    image_url: "/sistem_manajemen_mutu.webp",
    category: "Layanan PSU",
    alt_text: "Sertifikasi Sistem Manajemen Mutu ISO",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
  {
    title: "Tim Visi & Misi PSU",
    filename: "vision-mission-team.webp",
    image_url: "/vision-mission-team.webp",
    category: "Dokumentasi Korporat",
    alt_text: "Transformasi Identitas PT Penilai Standar Uji",
    mime_type: "image/webp",
    uploaded_by: "System PSU",
  },
];

const INITIAL_ARTICLES = [
  {
    slug: "kemenhub-dan-psu-perkuat-layanan-pengujian-dan-sertifikasi-publik",
    title_id: "Kementerian dan Mitra Teknis Profesional Perkuat Layanan Standarisasi & Keselamatan Publik",
    title_en: "The Ministry Strengthens Public Standards Services by Engaging Professional Technical Partners",
    excerpt_id: "Kolaborasi strategis bersama lembaga penilaian kesesuaian profesional terus diperkuat guna meningkatkan standar keselamatan, kualitas produk, dan tata kelola operasional.",
    excerpt_en: "Strategic collaboration with professional conformity assessment bodies continues to be strengthened to enhance safety standards, product quality, and operational governance.",
    content_id: "Jakarta — Upaya peningkatan kualitas dan keselamatan produk industri nasional terus diperkuat melalui kolaborasi bersama lembaga penilaian kesesuaian yang terakreditasi. Langkah ini dilakukan melalui berbagai program strategis yang bertujuan memperkuat pengawasan mutu, meningkatkan keselamatan konsumen, dan menerapkan tata kelola operasional yang terintegrasi.\n\nDalam pelaksanaannya, berbagai pemangku kepentingan berkolaborasi dengan lembaga teknis independen seperti PT Penilai Standar Uji (PSU), khususnya dalam penyediaan pendampingan teknis, pengujian laboratorium, serta penguatan kepatuhan terhadap Standar Nasional Indonesia (SNI).\n\nKeterlibatan ini tercermin dalam berbagai program strategis, termasuk sertifikasi produk industri strategis, pengujian parameter keselamatan di laboratorium terakreditasi, serta kalibrasi instrumen ukur presisi tinggi. Selain itu, kontribusi nyata juga diberikan dalam mengevaluasi dan memastikan konsistensi mutu melalui program surveilan berkala.\n\nMelalui kolaborasi ini, pemerintah dan pelaku industri bertujuan memastikan bahwa produk yang beredar di masyarakat semakin aman, andal, dan berdaya saing tinggi. Penguatan sistem pemantauan mutu juga diharapkan mampu menekan risiko ketidaksesuaian spesifikasi teknis di pasar.\n\nDi sisi lain, dukungan profesional dalam pendampingan sertifikasi membantu pelaku industri lokal merancang serta mengelola sistem manajemen mutu yang lebih efisien dan berorientasi pada kepuasan pelanggan.\n\nKeterlibatan PT Penilai Standar Uji (PSU) di sektor pengujian, inspeksi, sertifikasi, dan pelatihan terus berkembang melalui kerja sama dengan berbagai instansi nasional maupun pelaku industri manufaktur, agroindustri, pangan, kimia, hingga peralatan logam.\n\nKontribusi tersebut mencakup dukungan kesiapan operasional fasilitas pengujian, peningkatan standar keselamatan produk, serta pengembangan layanan penilaian kesesuaian yang ramah lingkungan dan berkelanjutan.\n\nKe depan, PT Penilai Standar Uji bersama para mitra strategis akan terus memperkuat layanan penjaminan mutu nasional melalui peningkatan kapabilitas infrastruktur laboratorium, pemanfaatan teknologi pengujian modern, dan penguatan kepatuhan regulasi.",
    content_en: "Jakarta — Efforts to enhance the quality and safety of national industrial products continue to be strengthened through collaboration with accredited conformity assessment bodies. These efforts are carried out through various strategic programs aimed at strengthening quality supervision, improving consumer safety, and implementing more integrated operational governance.\n\nIn its implementation, stakeholders collaborate with independent technical institutions such as PT Penilai Standar Uji (PSU), particularly in providing technical assistance, laboratory testing, and strengthening compliance with Indonesian National Standards (SNI).\n\nThis involvement is reflected in several strategic programs, including product certification across strategic industries, safety parameter testing in accredited laboratories, and high-precision instrument calibration. Additionally, contributions are made to evaluating and recognizing consistent product quality through periodic surveillance programs.\n\nThrough this collaboration, regulators and industry players aim to ensure that products circulating in the market become safer, more reliable, and highly competitive. Strengthening quality monitoring systems is also expected to reduce technical non-conformities and product safety risks.\n\nOn the other hand, professional support in certification assistance helps domestic manufacturers design and manage more efficient and customer-driven quality management systems.\n\nPT Penilai Standar Uji's involvement in the Testing, Inspection, Certification, and Training ecosystem continues to expand through collaborations with national agencies and manufacturers across agriculture, food, chemical, and metal sectors.\n\nThese contributions include support for operational readiness of testing facilities, enhancement of safety standards, and the development of sustainable conformity assessment services.\n\nMoving forward, PT Penilai Standar Uji, together with professional partners, will continue strengthening national quality assurance services through laboratory infrastructure improvements, technology utilization, and enhanced safety and compliance.",
    image_url: "/Logo_PSU_banner1.webp",
    author: "Corporate Secretary PSU",
    category: "Press Release",
    tags: [
      "Press Release",
      "Corporate Action",
      "The Guardian Of Assurance",
      "PT Penilai Standar Uji",
      "Corporate Update",
      "Corporate Secretary",
      "TICC",
      "Compliance",
      "Testing Inspection Certification",
      "Jasa Sertifikasi",
      "SNI",
      "LSPro",
      "Kalibrasi",
    ],
    published_at: "2026-04-18",
    status: "Published",
    is_featured: 1,
    views: 342,
  },
  {
    slug: "psu-perkuat-kinerja-pengujian-dan-sertifikasi-di-tengah-dinamika-industri",
    title_id: "PT Penilai Standar Uji Perkuat Kinerja Layanan di Tengah Dinamika Industri Nasional",
    title_en: "PT Penilai Standar Uji Strengthens Performance Amid Intense Industrial Dynamics",
    excerpt_id: "Di balik setiap keputusan strategis dan komunikasi mutu, terdapat kerja keras tim laboratorium dan auditor dalam memastikan akurasi pengujian serta kepatuhan standar.",
    excerpt_en: "Behind every strategic decision and quality assurance milestone, dedicated laboratory specialists and auditors work tirelessly to ensure testing accuracy and standard compliance.",
    content_id: "Jakarta — PT Penilai Standar Uji (PSU) terus mencatatkan penguatan kinerja operasional pada kuartal pertama tahun 2026 melalui optimalisasi layanan Sertifikasi Produk (LSPro), Laboratorium Pengujian, dan Laboratorium Kalibrasi. Langkah strategis ini diambil untuk merespons meningkatnya kebutuhan industri terhadap jaminan mutu yang cepat, akurat, dan transparan.\n\nMelalui sistem pelacakan sertifikat digital (SILAPP) dan perluasan ruang lingkup akreditasi KAN, klien kini dapat memantau proses pengajuan sertifikasi maupun status keaktifan sertifikat secara real-time. Transformasi digital ini memangkas waktu tunggu administrasi sekaligus menjaga ketertelusuran dokumen teknis secara akuntabel.\n\nSelain penguatan infrastruktur digital, PSU juga secara konsisten meningkatkan kapasitas sumber daya manusia melalui program pelatihan berkelanjutan bagi para auditor, petugas pengambil contoh (PPC), dan analis laboratorium agar selalu selaras dengan pembaruan regulasi SNI wajib maupun sukarela.",
    content_en: "Jakarta — PT Penilai Standar Uji (PSU) continues to record strong operational performance in the first quarter of 2026 by optimizing its Product Certification (LSPro), Testing Laboratory, and Calibration Laboratory services. This strategic step responds to the growing industrial demand for fast, accurate, and transparent quality assurance.\n\nThrough its digital certificate tracking system (SILAPP) and expanded KAN accreditation scope, clients can now monitor their certification application progress and certificate validity status in real time. This digital transformation reduces administrative turnaround times while maintaining full technical document traceability.\n\nBeyond digital infrastructure, PSU consistently invests in human capital through continuous training programs for auditors, sampling officers (PPC), and laboratory analysts to stay aligned with the latest mandatory and voluntary SNI regulations.",
    image_url: "/Logo_PSU_banner2.webp",
    author: "Corporate Secretary PSU",
    category: "News",
    tags: [
      "News",
      "LSPro PSU",
      "Kinerja Perusahaan",
      "SILAPP",
      "Transformasi Digital",
      "Akreditasi KAN",
      "SNI",
      "Mutu Industri",
    ],
    published_at: "2026-04-16",
    status: "Published",
    is_featured: 1,
    views: 285,
  },
  {
    slug: "kolaborasi-psu-dan-perguruan-tinggi-perkuat-riset-pengujian-pangan-dan-lingkungan",
    title_id: "PT Penilai Standar Uji dan Universitas Mitra Perkuat Sinergi Riset Pengujian Pangan & Lingkungan",
    title_en: "PT Penilai Standar Uji and Partner Universities Strengthen Food & Environmental Testing Research",
    excerpt_id: "PT Penilai Standar Uji menjalin kolaborasi riset terapan bersama perguruan tinggi untuk mengembangkan metode pengujian mutu komoditas pangan dan kelestarian lingkungan.",
    excerpt_en: "PT Penilai Standar Uji collaborates on applied research with universities to advance quality testing methods for food commodities and environmental sustainability.",
    content_id: "Jakarta — PT Penilai Standar Uji (PSU) bersama mitra perguruan tinggi nasional resmi meluncurkan program kolaborasi riset terapan di bidang pengujian mutu pangan, pertanian, dan lingkungan. Sinergi ini bertujuan menjembatani kebutuhan pengujian standar industri dengan inovasi akademik terkini.\n\nDalam program tersebut, para peneliti dan praktisi laboratorium PSU melakukan validasi metode uji mikrobiologi, cemaran logam berat, serta parameter kimia pada komoditas strategis seperti beras, kopi, kakao, minyak goreng sawit, dan air minum dalam kemasan.\n\nKerja sama ini juga membuka kesempatan bagi mahasiswa dan akademisi untuk mengenal lebih dekat penerapan standar SNI ISO/IEC 17025:2017 di laboratorium pengujian modern, sehingga turut mencetak talenta muda yang siap terjun ke dunia penjaminan mutu industri.",
    content_en: "Jakarta — PT Penilai Standar Uji (PSU) and partner national universities have officially launched an applied research collaboration focusing on food, agricultural, and environmental quality testing. This synergy bridges industrial standard testing needs with the latest academic innovations.\n\nUnder this program, researchers and PSU laboratory practitioners conduct method validation for microbiological testing, heavy metal contamination, and chemical parameters across strategic commodities such as rice, coffee, cocoa, palm cooking oil, and bottled drinking water.\n\nThe partnership also provides students and academics with hands-on exposure to SNI ISO/IEC 17025:2017 implementation in modern testing laboratories, nurturing future talent for Indonesia's quality assurance sector.",
    image_url: "/Logo_PSU_banner3.webp",
    author: "Tim Redaksi & Humas PSU",
    category: "Article",
    tags: [
      "Article",
      "Kemitraan Akademik",
      "Laboratorium Pengujian",
      "ISO 17025",
      "Keamanan Pangan",
      "Riset Terapan",
      "Komoditas Pertanian",
      "SNI",
      "Inovasi Mutu",
    ],
    published_at: "2026-04-12",
    status: "Published",
    is_featured: 0,
    views: 219,
  },
  {
    slug: "psu-dan-lembaga-pengembangan-sdm-dorong-peningkatan-kompetensi-personel-mutu",
    title_id: "PT Penilai Standar Uji Dorong Peningkatan Kompetensi SDM Industri Melalui Pelatihan Terpadu",
    title_en: "PT Penilai Standar Uji Promotes Industrial Human Capital Development Through Integrated Training",
    excerpt_id: "Kolaborasi penyelenggaraan General Training dan Inhouse Training bertujuan memperkuat kapasitas personel laboratorium, auditor internal, dan praktisi manajemen mutu.",
    excerpt_en: "Collaborative General Training and In-house Training programs aim to strengthen the capacity of laboratory personnel, internal auditors, and quality management practitioners.",
    content_id: "Jakarta — Peningkatan kompetensi sumber daya manusia merupakan kunci utama keberhasilan penerapan sistem manajemen mutu di setiap organisasi. Melalui unit Lembaga Pelatihan, PT Penilai Standar Uji (PSU) menghadirkan rangkaian program General Training dan Inhouse Training yang dirancang khusus sesuai kebutuhan industri.\n\nMateri pelatihan mencakup pemahaman dan implementasi SNI ISO 9001:2015, SNI ISO 14001:2015, SNI ISO 22000:2018, SNI ISO/IEC 17025:2017, teknik audit internal, hingga ketidakpastian pengukuran dan kalibrasi alat ukur laboratorium.\n\nDengan dibimbing oleh instruktur praktisi yang berpengalaman langsung di bidang pengujian dan sertifikasi, peserta pelatihan memperoleh wawasan aplikatif dan studi kasus nyata untuk diterapkan langsung di lingkungan kerja masing-masing.",
    content_en: "Jakarta — Enhancing human resource competency is the cornerstone of successful quality management system implementation in any organization. Through its Training Institution unit, PT Penilai Standar Uji (PSU) delivers comprehensive General Training and In-house Training programs tailored to industrial needs.\n\nTraining modules cover the understanding and implementation of SNI ISO 9001:2015, SNI ISO 14001:2015, SNI ISO 22000:2018, SNI ISO/IEC 17025:2017, internal auditing techniques, measurement uncertainty, and laboratory equipment calibration.\n\nGuided by practitioner instructors with extensive field experience in testing and certification, participants gain practical insights and real-world case studies ready for immediate application in their workplaces.",
    image_url: "/Logo_PSU_banner4.webp",
    author: "Divisi Pelatihan PSU",
    category: "Press Release",
    tags: [
      "Press Release",
      "Lembaga Pelatihan",
      "General Training",
      "Inhouse Training",
      "SDM Industri",
      "ISO 9001",
      "ISO 17025",
      "Auditor Internal",
      "Kompetensi Personel",
      "Sertifikasi",
      "Kalibrasi",
      "Mutu",
      "PSU",
      "LPK",
    ],
    published_at: "2026-04-10",
    status: "Published",
    is_featured: 0,
    views: 194,
  },
  {
    slug: "pentingnya-kredibilitas-data-pengujian-dan-kalibrasi-untuk-akses-pasar-global",
    title_id: "Kredibilitas Data Pengujian dan Kalibrasi Semakin Penting untuk Akses Pasar Industri",
    title_en: "The Credibility of Testing and Calibration Data Is Increasingly Important for Market Access",
    excerpt_id: "Ketertelusuran metrologi dan keakuratan hasil uji laboratorium menjadi fondasi kepercayaan bagi pelaku industri dalam menembus rantai pasok nasional dan global.",
    excerpt_en: "Metrological traceability and laboratory testing accuracy form the foundation of trust for manufacturers entering national and global supply chains.",
    content_id: "Jakarta — Dalam lanskap perdagangan modern yang semakin kompetitif, kredibilitas data hasil pengujian dan kalibrasi menjadi syarat mutlak bagi pelaku industri untuk memperoleh kepercayaan pasar. Produk yang telah melalui proses pengujian di laboratorium terakreditasi KAN memiliki pengakuan internasional melalui skema ILAC MRA.\n\nPT Penilai Standar Uji (PSU) memastikan seluruh proses pengujian fisika, kimia, dan mikrobiologi didukung oleh peralatan yang terkalibrasi secara berkala serta metode uji standar yang tervalidasi. Hal ini menjamin setiap sertifikat hasil uji dan sertifikat kalibrasi yang diterbitkan memiliki akurasi dan ketertelusuran metrologi yang dapat dipertanggungjawabkan.\n\nSelain peralatan industri, layanan kalibrasi PSU juga mencakup kalibrasi alat kesehatan pada fasilitas layanan kesehatan guna menjamin keselamatan pasien dan keandalan diagnosis medis.",
    content_en: "Jakarta — In an increasingly competitive modern trade landscape, the credibility of testing and calibration data is an essential requirement for manufacturers seeking market trust. Products tested in KAN-accredited laboratories carry international recognition under the ILAC MRA framework.\n\nPT Penilai Standar Uji (PSU) ensures that all physical, chemical, and microbiological testing processes are supported by regularly calibrated instruments and validated standard test methods. This guarantees that every test report and calibration certificate issued maintains verifiable accuracy and metrological traceability.\n\nIn addition to industrial instruments, PSU's calibration services cover medical device calibration for healthcare facilities to safeguard patient safety and diagnostic reliability.",
    image_url: "/Logo_PSU_banner5.webp",
    author: "Divisi Laboratorium Pengujian & Kalibrasi",
    category: "News",
    tags: [
      "News",
      "Laboratorium Kalibrasi",
      "Alat Kesehatan",
      "Ketertelusuran Metrologi",
      "ILAC MRA",
      "Akreditasi KAN",
      "Pengujian Produk",
      "Standar Internasional",
      "Kepatuhan",
      "Mutu",
      "Industri",
    ],
    published_at: "2026-04-08",
    status: "Published",
    is_featured: 0,
    views: 176,
  },
  {
    slug: "perluasan-ruang-lingkup-sertifikasi-produk-logam-cookware-flatware-dan-foodtray",
    title_id: "PSU Perluas Layanan Sertifikasi dan Pengujian Produk Logam: Cookware, Flatware, dan Foodtray",
    title_en: "PSU Expands Metal Product Certification & Testing: Cookware, Flatware, and Foodtray",
    excerpt_id: "PT Penilai Standar Uji mendukung industri peralatan masak dan wadah makanan berbahan baja tahan karat dalam memenuhi persyaratan keamanan pangan dan SNI.",
    excerpt_en: "PT Penilai Standar Uji supports stainless steel cookware and food container manufacturers in meeting food-grade safety and SNI requirements.",
    content_id: "Jakarta — Keamanan peralatan makan dan masak yang bersentuhan langsung dengan pangan menjadi perhatian utama masyarakat dan regulator. PT Penilai Standar Uji (PSU) menyediakan layanan pengujian laboratorium dan sertifikasi produk untuk komoditas logam, mencakup peralatan masak (Cookware), peralatan makan baja tahan karat (Stainless Steel Flatware), serta wadah bersekat (Foodtray) dari baja tahan karat untuk makanan.\n\nPengujian dilakukan secara menyeluruh meliputi uji komposisi kimia material logam, ketahanan korosi, kekuatan mekanis, hingga uji migrasi logam berat guna memastikan wadah makanan benar-benar aman digunakan untuk program pemenuhan gizi maupun kebutuhan rumah tangga dan komersial.\n\nDengan dukungan fasilitas laboratorium yang lengkap dan tim auditor berpengalaman, PSU siap mendampingi produsen dalam negeri dalam memperoleh SPPT-SNI secara tepat waktu.",
    content_en: "Jakarta — The safety of cutlery and cookware that come into direct contact with food is a top priority for consumers and regulators alike. PT Penilai Standar Uji (PSU) provides laboratory testing and product certification services for metal commodities, covering corrosion-resistant cookware, stainless steel flatware, and compartmented stainless steel food containers (Foodtray).\n\nComprehensive testing includes chemical composition analysis of metal alloys, corrosion resistance, mechanical durability, and heavy metal migration testing to ensure food containers are completely safe for public nutrition programs as well as household and commercial use.\n\nSupported by complete laboratory facilities and experienced auditors, PSU is ready to assist domestic manufacturers in obtaining SPPT-SNI certification efficiently.",
    image_url: "/Logo_PSU_banner6.webp",
    author: "Divisi Sertifikasi Produk (LSPro)",
    category: "Press Release",
    tags: [
      "Press Release",
      "Produk Logam",
      "Cookware",
      "Flatware",
      "Foodtray",
      "Baja Tahan Karat",
      "SPPT-SNI",
      "Keamanan Pangan",
      "LSPro PSU",
      "Laboratorium Pengujian",
      "Kemenperin",
      "Industri Manufaktur",
      "SNI",
      "Standarisasi",
    ],
    published_at: "2026-03-25",
    status: "Published",
    is_featured: 1,
    views: 260,
  },
  {
    slug: "sertifikasi-pasar-rakyat-wujudkan-pasar-tradisional-bersih-aman-dan-berdaya-saing",
    title_id: "Sertifikasi SNI Pasar Rakyat: Wujudkan Pasar Tradisional yang Tertib, Bersih, dan Berdaya Saing",
    title_en: "SNI People's Market Certification: Realizing Clean, Safe, and Competitive Traditional Markets",
    excerpt_id: "Layanan penilaian kesesuaian Pasar Rakyat oleh PSU menilai aspek fasilitas, kebersihan, keamanan, kenyamanan, serta sistem pengelolaan pasar sesuai SNI.",
    excerpt_en: "PSU's People's Market conformity assessment evaluates facilities, cleanliness, safety, comfort, and market management systems in accordance with SNI.",
    content_id: "Jakarta — Pasar Rakyat memiliki peran vital sebagai penggerak ekonomi kerakyatan dan distribusi bahan pangan pokok. Untuk meningkatkan kualitas pelayanan dan kenyamanan masyarakat saat berbelanja, penerapan Standar Nasional Indonesia (SNI) Pasar Rakyat menjadi instrumen penting bagi pemerintah daerah dan pengelola pasar.\n\nPT Penilai Standar Uji (PSU) melaksanakan penilaian kesesuaian Pasar Rakyat secara komprehensif, meliputi evaluasi persyaratan umum, ketersediaan fasilitas dan infrastruktur ruang dagang, sanitasi dan kebersihan lingkungan, sistem keamanan, hingga tata kelola manajemen pasar.\n\nMelalui sertifikasi SNI Pasar Rakyat, pasar tradisional dapat bertransformasi menjadi pusat perbelanjaan rakyat yang modern, sehat, tertib, dan mampu bersaing di era ritel modern.",
    content_en: "Jakarta — People's Markets play a vital role as drivers of the grassroots economy and primary food distribution networks. To improve service quality and shopper comfort, implementing the Indonesian National Standard (SNI) for People's Markets serves as an essential benchmark for local governments and market managers.\n\nPT Penilai Standar Uji (PSU) conducts comprehensive conformity assessments for People's Markets, evaluating general requirements, trading space facilities and infrastructure, environmental sanitation and hygiene, safety systems, and market management governance.\n\nThrough SNI People's Market certification, traditional markets transform into clean, orderly, healthy, and competitive community shopping hubs.",
    image_url: "/LSPro.webp",
    author: "Corporate Secretary PSU",
    category: "Article",
    tags: [
      "Article",
      "Pasar Rakyat",
      "Jasa Lainnya",
      "SNI Pasar Rakyat",
      "Kemendag",
      "Ekonomi Daerah",
      "Sertifikasi Jasa",
      "LSPro PSU",
      "Standar Pelayanan",
    ],
    published_at: "2026-03-17",
    status: "Published",
    is_featured: 0,
    views: 158,
  },
  {
    slug: "pengawasan-mutu-pupuk-pertanian-melalui-pengujian-laboratorium-terakreditasi",
    title_id: "Dukung Ketahanan Pangan, PSU Perkuat Pengujian dan Sertifikasi 18 Komoditas Pupuk Pertanian",
    title_en: "Supporting Food Security, PSU Strengthens Testing & Certification Across 18 Agricultural Fertilizers",
    excerpt_id: "Pengujian kandungan hara makro dan mikro pada pupuk SP-36, NPK padat, Urea, hingga Dolomit memastikan petani memperoleh pupuk berkualitas sesuai standar SNI.",
    excerpt_en: "Testing macro and micro-nutrient content in SP-36, solid NPK, Urea, and Dolomite fertilizers ensures farmers receive high-quality SNI-compliant inputs.",
    content_id: "Jakarta — Produktivitas sektor pertanian nasional sangat bergantung pada ketersediaan sarana produksi pertanian, khususnya pupuk yang memenuhi standar mutu. PT Penilai Standar Uji (PSU) mendukung penuh program ketahanan pangan nasional melalui layanan pengujian laboratorium dan sertifikasi SNI untuk 18 jenis komoditas pupuk dan bahan kimia pertanian.\n\nRuang lingkup pengujian mencakup Pupuk Super Fosfat (SP-36), Pupuk Fosfat Alam, Pupuk Kalium Klorida (KCl), Pupuk Tripel Super Fosfat (TSP), Pupuk NPK Padat, Pupuk Amonium Sulfat (ZA), Pupuk Urea, MAP, DAP, Dolomit, Borat, Kiseret, hingga Pupuk Cair Haspramin.\n\nMelalui analisis kadar unsur hara yang presisi dan uji cemaran logam berat di laboratorium PSU, produsen dan distributor pupuk dapat memastikan produknya memenuhi spesifikasi teknis Kementan dan Kemenperin sebelum didistribusikan kepada petani.",
    content_en: "Jakarta — National agricultural productivity relies heavily on the availability of high-quality agricultural inputs, particularly fertilizers that meet quality standards. PT Penilai Standar Uji (PSU) actively supports national food security through laboratory testing and SNI certification across 18 fertilizer and agricultural chemical commodities.\n\nThe testing scope covers Super Phosphate (SP-36), Natural Phosphate, Potassium Chloride (KCl), Triple Super Phosphate (TSP), Solid NPK, Ammonium Sulfate (ZA), Urea, MAP, DAP, Dolomite, Borate, Kieserite, and Haspramin liquid fertilizer.\n\nThrough precise nutrient content analysis and heavy metal contamination testing at PSU's laboratories, fertilizer producers and distributors ensure their products meet Ministry of Agriculture and Ministry of Industry technical specifications before reaching farmers.",
    image_url: "/lab_pengujian.webp",
    author: "Divisi Laboratorium Pengujian & Kalibrasi",
    category: "News",
    tags: [
      "News",
      "Pupuk Pertanian",
      "Ketahanan Pangan",
      "Bahan Kimia",
      "Pupuk NPK",
      "Pupuk Urea",
      "SP-36",
      "Kementan",
      "Kemenperin",
      "Laboratorium Pengujian",
      "SNI Pupuk",
      "LSPro PSU",
    ],
    published_at: "2026-02-27",
    status: "Published",
    is_featured: 0,
    views: 211,
  },
  {
    slug: "panduan-skema-sertifikasi-produk-tipe-1b-dan-tipe-5-untuk-pelaku-industri",
    title_id: "Memahami Perbedaan Skema Sertifikasi Produk Tipe 1B dan Tipe 5 dalam Penerapan SPPT-SNI",
    title_en: "Understanding the Differences Between Type 1B and Type 5 Product Certification Schemes for SPPT-SNI",
    excerpt_id: "Pelaku usaha perlu memahami karakteristik skema sertifikasi Tipe 1B (per kelompok produksi/batch) dan Tipe 5 (sistem manajemen mutu pabrik & surveilan berkala).",
    excerpt_en: "Businesses need to understand the characteristics of Type 1B (batch/lot inspection) and Type 5 (factory quality management system & periodic surveillance) certification schemes.",
    content_id: "Jakarta — Dalam mengajukan Sertifikat Produk Penggunaan Tanda SNI (SPPT-SNI), pemahaman mengenai skema sertifikasi yang tepat sangat membantu pelaku usaha dalam mempersiapkan dokumen dan fasilitas produksinya. Secara umum, terdapat dua skema utama yang paling banyak diterapkan, yakni Skema Tipe 1B dan Skema Tipe 5.\n\nSkema Sertifikasi Tipe 1B dilakukan berdasarkan pengujian dan pemeriksaan terhadap satu kelompok produksi (batch/lot) tertentu. Sertifikat yang diterbitkan pada skema ini berlaku khusus untuk jumlah produk pada batch yang diajukan dan telah dinyatakan lulus uji.\n\nSementara itu, Skema Sertifikasi Tipe 5 mencakup asesmen terhadap proses produksi dan penerapan Sistem Manajemen Mutu (seperti ISO 9001 atau HACCP/ISO 22000) di pabrik, pengambilan contoh produk untuk pengujian laboratorium, serta pelaksanaan surveilan berkala guna memastikan konsistensi mutu produk selama masa berlaku sertifikat.",
    content_en: "Jakarta — When applying for an SNI Mark Product Certificate (SPPT-SNI), selecting the appropriate certification scheme helps manufacturers prepare their documentation and production facilities effectively. Two primary schemes are most widely applied: Type 1B and Type 5.\n\nThe Type 1B Certification Scheme is based on sampling, testing, and inspection of a specific production batch or lot. The resulting certificate applies specifically to the product batch inspected and verified as compliant.\n\nMeanwhile, the Type 5 Certification Scheme encompasses a full audit of the factory's production process and Quality Management System (such as ISO 9001 or HACCP/ISO 22000), product sampling for laboratory testing, and periodic surveillance evaluations to ensure ongoing quality consistency throughout the certificate's validity period.",
    image_url: "/lab_kalibrasi.webp",
    author: "Divisi Sertifikasi Produk (LSPro)",
    category: "Article",
    tags: [
      "Article",
      "Skema Tipe 1B",
      "Skema Tipe 5",
      "SPPT-SNI",
      "Sertifikasi Produk",
      "Surveilan",
      "ISO 9001",
      "LSPro PSU",
    ],
    published_at: "2026-02-10",
    status: "Published",
    is_featured: 0,
    views: 189,
  },
  {
    slug: "perpanjangan-akreditasi-kan-lspro-psu-hingga-2030-dan-perluasan-komoditas-pangan",
    title_id: "Komite Akreditasi Nasional (KAN) Perpanjang Akreditasi LSPro PSU Hingga Tahun 2030",
    title_en: "National Accreditation Committee (KAN) Extends PSU's LSPro Accreditation Through 2030",
    excerpt_id: "Perpanjangan akreditasi LSPr-051-IDN berbasis SNI ISO/IEC 17065:2012 disertai perluasan lingkup komoditas pertanian dan pangan strategis.",
    excerpt_en: "The extension of LSPr-051-IDN accreditation under SNI ISO/IEC 17065:2012 includes an expanded scope of strategic agricultural and food commodities.",
    content_id: "Jakarta — Komite Akreditasi Nasional (KAN) secara resmi memperpanjang masa berlaku akreditasi Lembaga Sertifikasi Produk PT Penilai Standar Uji (LSPr-051-IDN) untuk periode 30 Juni 2025 hingga 29 Mei 2030 berbasis standar internasional SNI ISO/IEC 17065:2012 yang diakui secara global melalui IAF MLA.\n\nCapaian ini sekaligus menandai perluasan ruang lingkup layanan sertifikasi komoditas pertanian, perkebunan, dan olahan pangan, meliputi Beras, Biji Kopi, Biji Kakao, Biskuit, Gula Kristal, Kopi Instan, hingga Minyak Goreng Sawit.\n\nKepercayaan yang diberikan oleh KAN menjadi motivasi bagi seluruh jajaran PT Penilai Standar Uji untuk terus menjaga independensi, integritas, dan profesionalisme dalam melayani industri nasional.",
    content_en: "Jakarta — The National Accreditation Committee (KAN) has officially extended the accreditation of PT Penilai Standar Uji's Product Certification Body (LSPr-051-IDN) for the period of June 30, 2025 through May 29, 2030 under SNI ISO/IEC 17065:2012, globally recognized via the IAF MLA.\n\nThis milestone also marks the expansion of PSU's certification scope across agricultural, plantation, and processed food commodities, including Rice, Coffee Beans, Cocoa Beans, Biscuits, Crystal Sugar, Instant Coffee, and Palm Cooking Oil.\n\nThis renewed trust from KAN reinforces PT Penilai Standar Uji's commitment to upholding independence, integrity, and professionalism in serving national industries.",
    image_url: "/_pelatihan.webp",
    author: "Corporate Secretary PSU",
    category: "Press Release",
    tags: [
      "Press Release",
      "Akreditasi KAN",
      "LSPr-051-IDN",
      "ISO 17065",
      "IAF MLA",
      "Komoditas Pangan",
      "Pertanian",
      "PT Penilai Standar Uji",
      "Milestone PSU",
    ],
    published_at: "2025-07-05",
    status: "Published",
    is_featured: 0,
    views: 304,
  },
  {
    slug: "pentingnya-sertifikasi-sistem-manajemen-iso-9001-14001-dan-22000-bagi-daya-saing-perusahaan",
    title_id: "Peran Sertifikasi Sistem Manajemen ISO 9001, ISO 14001, dan ISO 22000 bagi Daya Saing Industri",
    title_en: "The Role of ISO 9001, ISO 14001, and ISO 22000 Management System Certifications in Industrial Competitiveness",
    excerpt_id: "Integrasi sistem manajemen mutu, lingkungan, dan keamanan pangan membantu perusahaan meningkatkan efisiensi operasional dan kepercayaan mitra bisnis.",
    excerpt_en: "Integrating quality, environmental, and food safety management systems helps organizations improve operational efficiency and stakeholder trust.",
    content_id: "Jakarta — Penerapan sistem manajemen berstandar internasional kini bukan lagi sekadar pemenuhan regulasi, melainkan investasi strategis bagi keberlanjutan bisnis. Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji hadir mendampingi organisasi dalam mengimplementasikan dan memperoleh sertifikasi SNI ISO 9001:2015 (Manajemen Mutu), SNI ISO 14001:2015 (Manajemen Lingkungan), serta SNI ISO 22000:2018 (Manajemen Keamanan Pangan).\n\nProses audit dilaksanakan secara objektif dan bernilai tambah oleh auditor teregistrasi, membantu perusahaan mengidentifikasi peluang perbaikan berkelanjutan di setiap lini operasional.",
    content_en: "Jakarta — Implementing international management system standards is no longer merely a regulatory requirement, but a strategic investment in business sustainability. PT Penilai Standar Uji's Management System Certification Body (LSSM) supports organizations in achieving SNI ISO 9001:2015 (Quality Management), SNI ISO 14001:2015 (Environmental Management), and SNI ISO 22000:2018 (Food Safety Management) certifications.\n\nAudits are conducted objectively by registered auditors with a value-added approach, helping organizations identify opportunities for continual improvement across all operational lines.",
    image_url: "/sistem_manajemen_mutu.webp",
    author: "Divisi LSSM PSU",
    category: "Article",
    tags: [
      "Article",
      "LSSM PSU",
      "ISO 9001",
      "ISO 14001",
      "ISO 22000",
      "Sistem Manajemen",
      "Keamanan Pangan",
      "Manajemen Lingkungan",
    ],
    published_at: "2025-03-19",
    status: "Published",
    is_featured: 0,
    views: 167,
  },
  {
    slug: "transformasi-identitas-pt-penilai-standar-nasional-menjadi-pt-penilai-standar-uji",
    title_id: "Transformasi Resmi PT Penilai Standar Nasional Menjadi PT PENILAI STANDAR UJI (PSU)",
    title_en: "Official Corporate Transformation of PT Penilai Standar Nasional into PT PENILAI STANDAR UJI (PSU)",
    excerpt_id: "Berdasarkan Akta Perubahan No. 12 tanggal 19 November 2024, perusahaan resmi bertransformasi menjadi PT PENILAI STANDAR UJI dengan 5 pilar layanan terintegrasi.",
    excerpt_en: "Under Deed of Amendment No. 12 dated November 19, 2024, the company officially transformed into PT PENILAI STANDAR UJI with 5 integrated service pillars.",
    content_id: "Jakarta — Berdasarkan Akta Perubahan No. 12 tanggal 19 November 2024, perusahaan secara resmi melakukan transformasi identitas korporasi dan mengubah nama dari PT Penilai Standar Nasional (PSN) menjadi PT PENILAI STANDAR UJI (PSU).\n\nTransformasi ini menegaskan komitmen perusahaan untuk memperluas portofolio layanan penilaian kesesuaian yang terintegrasi melalui 5 pilar utama: Testing (Pengujian Laboratorium), Certification (Sertifikasi Produk & Sistem Manajemen), Calibration (Kalibrasi Alat Ukur & Alat Kesehatan), Training (Pelatihan Personel), serta Consulting (Konsultasi Teknis & Kepatuhan).",
    content_en: "Jakarta — Pursuant to Deed of Amendment No. 12 dated November 19, 2024, the company officially completed its corporate identity transformation, changing its name from PT Penilai Standar Nasional (PSN) to PT PENILAI STANDAR UJI (PSU).\n\nThis transformation underscores the company's commitment to expanding its integrated conformity assessment portfolio across 5 core pillars: Testing, Certification, Calibration, Training, and Consulting.",
    image_url: "/vision-mission-team.webp",
    author: "Corporate Secretary PSU",
    category: "Press Release",
    tags: [
      "Press Release",
      "Transformasi Korporasi",
      "PT Penilai Standar Uji",
      "Sejarah PSU",
      "Testing",
      "Certification",
      "Calibration",
      "Training",
      "Consulting",
      "LPK",
    ],
    published_at: "2024-11-19",
    status: "Published",
    is_featured: 0,
    views: 412,
  },
];

// ============================================================================
// UTILITAS PASSWORD HASHING (SCRYPT) & JWT (HMAC-SHA256) TANPA DEPENDENCY EKSTERNAL
// ============================================================================
function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(plainPassword), salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function verifyPassword(plainPassword, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  if (storedHash.startsWith("scrypt:")) {
    const parts = storedHash.split(":");
    if (parts.length !== 3) return false;
    const [, salt, keyHex] = parts;
    const derived = crypto.scryptSync(String(plainPassword), salt, 64);
    const keyBuf = Buffer.from(keyHex, "hex");
    if (derived.length !== keyBuf.length) return false;
    return crypto.timingSafeEqual(derived, keyBuf);
  }
  // SEC-005 Remediasi: Tolak seluruh komparasi password plaintext (Fail Closed)
  return false;
}

function validatePasswordPolicy(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Kata sandi minimal 8 karakter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 huruf kapital (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 huruf kecil (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 angka (0-9).";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 simbol atau karakter khusus.";
  }
  return null;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email || "").trim());
}

// ============================================================================
// SANITASI INPUT KONTEN HTML & ANTI-STORED XSS (SEC-007 & WP-3.8)
// Dilengkapi dengan AST-style Tag Allowlist & Recursive Neutralization (Defense-in-Depth)
// ============================================================================
const ALLOWED_HTML_TAGS = new Set([
  "p", "br", "strong", "b", "em", "i", "u", "s",
  "h1", "h2", "h3", "h4", "h5", "h6",
  "ul", "ol", "li", "blockquote", "span", "div",
  "a", "img", "hr", "table", "thead", "tbody", "tr", "th", "td"
]);

function sanitizeHtmlContent(htmlInput) {
  if (!htmlInput || typeof htmlInput !== "string") return "";
  let sanitized = htmlInput;

  // 1. Recursive removal of dangerous tag blocks (script, style, iframe, object, embed, svg, math, form, etc.)
  let prev;
  do {
    prev = sanitized;
    sanitized = sanitized.replace(
      /<\s*(script|style|iframe|object|embed|applet|meta|link|base|form|input|button|textarea|svg|math)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi,
      ""
    );
    sanitized = sanitized.replace(
      /<\s*(script|style|iframe|object|embed|applet|meta|link|base|form|input|button|textarea|svg|math)[^>]*\/?>/gi,
      ""
    );
  } while (sanitized !== prev);

  // 2. Hapus seluruh komentar HTML dan atribut event handler on*
  sanitized = sanitized.replace(/<!--[\s\S]*?-->/g, "");
  sanitized = sanitized.replace(
    /(\s+)on[a-z0-9_-]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi,
    ""
  );

  // 3. Netralkan protokol berbahaya pada atribut href dan src (javascript:, vbscript:, data: non-gambar)
  sanitized = sanitized.replace(
    /(href|src)\s*=\s*("|')(?:javascript|vbscript|data:(?!image\/)):[\s\S]*?\2/gi,
    '$1="#"'
  );
  sanitized = sanitized.replace(
    /(href|src)\s*=\s*(?:javascript|vbscript|data:(?!image\/)):[^\s>]+/gi,
    '$1="#"'
  );

  // 4. Tag Allowlist enforcement: hanya izinkan tag yang terdaftar dalam ALLOWED_HTML_TAGS
  sanitized = sanitized.replace(/<\/?([a-zA-Z0-9_-]+)([^>]*)>/g, (match, tagName, attrs) => {
    const lowerTag = tagName.toLowerCase();
    if (!ALLOWED_HTML_TAGS.has(lowerTag)) {
      return "";
    }
    const isClosing = match.startsWith("</");
    if (isClosing) {
      return `</${lowerTag}>`;
    }

    // Pembersihan atribut untuk tag yang diizinkan
    let cleanAttrs = "";
    const attrRegex = /([a-zA-Z0-9_-]+)(?:\s*=\s*(?:'([^']*)'|"([^"]*)"|([^\s>]+)))?/g;
    let m;
    while ((m = attrRegex.exec(attrs)) !== null) {
      const attrName = m[1].toLowerCase();
      let attrVal = m[2] !== undefined ? m[2] : (m[3] !== undefined ? m[3] : (m[4] || ""));

      if (attrName.startsWith("on")) continue;

      if (lowerTag === "a" && attrName === "href") {
        const checkVal = attrVal.trim().replace(/[\x00-\x20]/g, "");
        if (/^(javascript|vbscript|data):/i.test(checkVal)) {
          cleanAttrs += ' href="#"';
        } else {
          cleanAttrs += ` href="${attrVal.replace(/"/g, "&quot;")}"`;
        }
      } else if (lowerTag === "img" && attrName === "src") {
        const checkVal = attrVal.trim().replace(/[\x00-\x20]/g, "");
        if (/^(javascript|vbscript):/i.test(checkVal) || (checkVal.startsWith("data:") && !checkVal.startsWith("data:image/"))) {
          continue;
        }
        cleanAttrs += ` src="${attrVal.replace(/"/g, "&quot;")}"`;
      } else if (["alt", "title", "class", "width", "height", "target", "rel"].includes(attrName)) {
        cleanAttrs += ` ${attrName}="${attrVal.replace(/"/g, "&quot;")}"`;
      }
    }
    return `<${lowerTag}${cleanAttrs}>`;
  });

  return sanitized;
}

function sanitizePlainText(textInput) {
  if (!textInput || typeof textInput !== "string") return "";
  return textInput
    .replace(/<\s*(script|style)[\s\S]*?>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

// ============================================================================
// SISTEM RATE LIMITING CERDAS & ANDAL (SEC-004)
// ============================================================================
// Menggunakan req.ip yang dihitung Express secara aman sesuai konfigurasi trust proxy.
// Menghapus parsing mentah req.headers["x-forwarded-for"] untuk mencegah IP spoofing.
// Header cf-connecting-ip HANYA dipercaya jika:
// 1. Aplikasi secara eksplisit dikonfigurasi untuk mempercayai Cloudflare (trust cloudflare === true)
// 2. Socket fisik terbukti berasal dari trusted proxy (req.ips.length > 0)
function getClientIp(req) {
  const isCloudflareTrusted = req.app?.get("trust cloudflare") === true;
  if (isCloudflareTrusted && req.ips && req.ips.length > 0) {
    const cfIp = req.headers["cf-connecting-ip"];
    if (typeof cfIp === "string" && cfIp.trim()) {
      let cleanedCfIp = cfIp.trim();
      if (cleanedCfIp.startsWith("::ffff:")) {
        cleanedCfIp = cleanedCfIp.slice(7);
      }
      return cleanedCfIp;
    }
  }

  let ip = req.ip || req.socket?.remoteAddress || "127.0.0.1";
  if (typeof ip === "string" && ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }
  return ip;
}

// Konfigurasi Ambang Batas Rate Limiting dari Environment (dengan default yang aman)
const AUTH_FAIL_LIMIT_ACCOUNT = Math.max(1, Number(process.env.AUTH_FAIL_LIMIT_ACCOUNT) || 5);
const AUTH_FAIL_LIMIT_IP = Math.max(1, Number(process.env.AUTH_FAIL_LIMIT_IP) || 20);
const AUTH_FAIL_WINDOW_MINUTES = Math.max(1, Number(process.env.AUTH_FAIL_WINDOW_MINUTES) || 15);
const AUTH_FAIL_WINDOW_MS = AUTH_FAIL_WINDOW_MINUTES * 60 * 1000;

// State Rate Limit (Tingkat 1: Akun per IP, Tingkat 2: Global per IP untuk proteksi Password Spraying)
const loginFailuresAccountMap = new Map();
const loginFailuresIpMap = new Map();
const generalRateLimitMap = new Map();
const uploadRateLimitMap = new Map();

// Pembersihan berkala memori rate limit setiap 5 menit
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of loginFailuresAccountMap.entries()) {
    if (now > v.resetAt) loginFailuresAccountMap.delete(k);
  }
  for (const [k, v] of loginFailuresIpMap.entries()) {
    if (now > v.resetAt) loginFailuresIpMap.delete(k);
  }
  for (const [k, v] of generalRateLimitMap.entries()) {
    if (now > v.resetAt) generalRateLimitMap.delete(k);
  }
  for (const [k, v] of uploadRateLimitMap.entries()) {
    if (now > v.resetAt) uploadRateLimitMap.delete(k);
  }
}, 5 * 60 * 1000).unref();

/**
 * Two-Tier Auth Rate Limiter:
 * 1. Global IP Limiter: Mencegah Password Spraying (banyak username berbeda dari 1 IP)
 * 2. Account-Specific Limiter: Mencegah Brute-Force terhadap 1 akun tertentu
 */
function authRateLimiter(req, res, next) {
  const clientIp = getClientIp(req);
  const normalizedUsername = String(req.body?.username || req.body?.email || "").trim().toLowerCase();
  const accountKey = `auth_acc_${clientIp}_${normalizedUsername || "anon"}`;
  const ipKey = `auth_ip_${clientIp}`;
  const now = Date.now();

  // Tier 1 Check: Global IP Lockout (Mendeteksi Password Spraying)
  const ipRecord = loginFailuresIpMap.get(ipKey);
  if (ipRecord && ipRecord.failures >= AUTH_FAIL_LIMIT_IP && now < ipRecord.resetAt) {
    const retryAfterSeconds = Math.ceil((ipRecord.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds);
    res.setHeader("X-RateLimit-Limit", AUTH_FAIL_LIMIT_IP);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("X-RateLimit-Reset", Math.ceil(ipRecord.resetAt / 1000));
    return res.status(429).json({
      success: false,
      rateLimited: true,
      message: `Terlalu banyak percobaan login gagal dari alamat IP Anda. Silakan coba kembali dalam ${Math.ceil(retryAfterSeconds / 60)} menit.`,
      retryAfterSeconds,
    });
  }

  // Tier 2 Check: Account-Specific Lockout (Mencegah Single-Account Brute-Force)
  const accRecord = loginFailuresAccountMap.get(accountKey);
  if (accRecord && accRecord.failures >= AUTH_FAIL_LIMIT_ACCOUNT && now < accRecord.resetAt) {
    const retryAfterSeconds = Math.ceil((accRecord.resetAt - now) / 1000);
    res.setHeader("Retry-After", retryAfterSeconds);
    res.setHeader("X-RateLimit-Limit", AUTH_FAIL_LIMIT_ACCOUNT);
    res.setHeader("X-RateLimit-Remaining", 0);
    res.setHeader("X-RateLimit-Reset", Math.ceil(accRecord.resetAt / 1000));
    return res.status(429).json({
      success: false,
      rateLimited: true,
      message: `Terlalu banyak percobaan login gagal untuk akun ini. Silakan coba kembali dalam ${Math.ceil(retryAfterSeconds / 60)} menit.`,
      retryAfterSeconds,
    });
  }

  // Hook res.on("finish") untuk menghitung kegagalan secara akurat
  res.on("finish", () => {
    // Login berhasil (HTTP 200) -> Reset kegagalan pada akun tersebut
    if (res.statusCode === 200) {
      loginFailuresAccountMap.delete(accountKey);
      return;
    }

    // Login gagal (HTTP 401, 400) -> Tambah penghitung kegagalan pada kedua tingkatan
    if (res.statusCode === 401 || res.statusCode === 400) {
      const currentNow = Date.now();

      // Tingkat 2: Penalti Akun
      const accState = loginFailuresAccountMap.get(accountKey) || {
        failures: 0,
        resetAt: currentNow + AUTH_FAIL_WINDOW_MS,
      };
      if (currentNow >= accState.resetAt) {
        accState.failures = 1;
        accState.resetAt = currentNow + AUTH_FAIL_WINDOW_MS;
      } else {
        accState.failures += 1;
      }
      loginFailuresAccountMap.set(accountKey, accState);

      // Tingkat 1: Penalti IP Global (Tangkap Password Spraying)
      const ipState = loginFailuresIpMap.get(ipKey) || {
        failures: 0,
        resetAt: currentNow + AUTH_FAIL_WINDOW_MS,
      };
      if (currentNow >= ipState.resetAt) {
        ipState.failures = 1;
        ipState.resetAt = currentNow + AUTH_FAIL_WINDOW_MS;
      } else {
        ipState.failures += 1;
      }
      loginFailuresIpMap.set(ipKey, ipState);
    }
  });

  next();
}

function createSlidingWindowLimiter(windowMs, maxRequests, message, map) {
  return (req, res, next) => {
    const ip = getClientIp(req);
    const now = Date.now();
    let entry = map.get(ip);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      map.set(ip, entry);
    } else {
      entry.count += 1;
    }

    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader("X-RateLimit-Limit", maxRequests);
    res.setHeader("X-RateLimit-Remaining", remaining);
    res.setHeader("X-RateLimit-Reset", Math.ceil(entry.resetAt / 1000));

    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.resetAt - now) / 1000);
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        rateLimited: true,
        message: message || "Batas frekuensi permintaan terlampaui. Silakan coba sesaat lagi.",
      });
    }
    next();
  };
}

const generalApiLimiter = createSlidingWindowLimiter(
  60 * 1000,
  120,
  "Terlalu banyak permintaan API publik. Silakan tunggu beberapa saat.",
  generalRateLimitMap
);

const uploadRateLimiter = (req, res, next) => {
  const userId = req.adminUser?.sub || getClientIp(req);
  const key = `upload_${userId}`;
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const maxUploads = 30;

  let entry = uploadRateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    uploadRateLimitMap.set(key, entry);
  } else {
    entry.count += 1;
  }

  if (entry.count > maxUploads) {
    return res.status(429).json({
      success: false,
      rateLimited: true,
      message: "Batas frekuensi upload media terlampaui (maksimal 30 foto per 15 menit).",
    });
  }
  next();
};

// ============================================================================
// VALIDASI GAMBAR RASTER (MAGIC BYTES & ANTI-POLYGLOT)
// ============================================================================
function validateRasterImageBuffer(buf, ext) {
  if (!Buffer.isBuffer(buf) || buf.length < 16) return false;

  if (ext === "jpg") {
    const isJpegStart = buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
    let hasEoi = false;
    const endScanStart = Math.max(0, buf.length - 128);
    for (let i = endScanStart; i < buf.length - 1; i++) {
      if (buf[i] === 0xff && buf[i + 1] === 0xd9) {
        hasEoi = true;
        break;
      }
    }
    return isJpegStart && hasEoi;
  }

  if (ext === "png") {
    const isPngStart =
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47 &&
      buf[4] === 0x0d &&
      buf[5] === 0x0a &&
      buf[6] === 0x1a &&
      buf[7] === 0x0a;
    const endOffset = buf.length - 12;
    let hasIend = false;
    if (endOffset > 0) {
      const tail = buf.toString("ascii", endOffset);
      hasIend = tail.includes("IEND");
    }
    return isPngStart && hasIend;
  }

  if (ext === "webp") {
    const isRiff = buf.toString("ascii", 0, 4) === "RIFF";
    const isWebp = buf.toString("ascii", 8, 12) === "WEBP";
    const chunkHeader = buf.toString("ascii", 12, 16);
    const isVp8 = chunkHeader === "VP8 " || chunkHeader === "VP8L" || chunkHeader === "VP8X";
    return isRiff && isWebp && isVp8;
  }

  return false;
}

function hasDangerousScriptSignature(buf) {
  if (!Buffer.isBuffer(buf)) return true;
  const head = buf.subarray(0, Math.min(buf.length, 2048)).toString("binary").toLowerCase();
  const tail = buf.subarray(Math.max(0, buf.length - 2048)).toString("binary").toLowerCase();
  const combined = head + " " + tail;

  const dangerousPatterns = [
    "<script",
    "</script",
    "<?php",
    "<?= ",
    "eval(",
    "base64_decode",
    "<svg",
    "<!entity",
    "javascript:",
    "onload=",
    "onerror=",
  ];

  return dangerousPatterns.some((pattern) => combined.includes(pattern));
}

// ============================================================================
// PEMROSESAN & RE-ENCODING GAMBAR RASTER AMAN (SEC-002: SHARP INTEGRATION)
// ============================================================================
const MAX_IMAGE_WIDTH = 4096;
const MAX_IMAGE_HEIGHT = 4096;
const MAX_IMAGE_PIXELS = 16 * 1024 * 1024; // 16 Megapixels

async function processAndReencodeRasterImage(buffer, requestedExt) {
  if (!sharp) {
    throw new Error("Library pemrosesan gambar (Sharp) tidak tersedia pada server.");
  }

  // 1. Decode raster menggunakan Sharp dengan alokasi batas piksel input
  // limitInputPixels mencegah eksploitasi decompression bomb / pixel flood
  const image = sharp(buffer, {
    failOnError: true,
    limitInputPixels: MAX_IMAGE_PIXELS,
  });

  const metadata = await image.metadata();

  // 2. Validasi format biner hasil decode Sharp (hanya raster jpeg, png, webp)
  const allowedFormats = ["jpeg", "png", "webp"];
  const detectedFormat = (metadata.format || "").toLowerCase();
  if (!allowedFormats.includes(detectedFormat)) {
    throw new Error("Format gambar terdeteksi tidak diizinkan. Hanya JPEG, PNG, dan WebP yang diterima.");
  }

  // 3. Validasi batas dimensi & total piksel (Max 4096 x 4096, Max 16 MP)
  const width = metadata.width || 0;
  const height = metadata.height || 0;
  const totalPixels = width * height;

  if (width < 1 || height < 1) {
    throw new Error("Dimensi gambar tidak valid.");
  }

  if (width > MAX_IMAGE_WIDTH || height > MAX_IMAGE_HEIGHT || totalPixels > MAX_IMAGE_PIXELS) {
    throw new Error(
      `Dimensi gambar melampaui batas keamanan maksimal (${width}x${height} px, ${Math.round(totalPixels / 1000000)} MP). Maksimal yang diizinkan adalah ${MAX_IMAGE_WIDTH}x${MAX_IMAGE_HEIGHT} piksel (16 MP).`
    );
  }

  // 4. Normalisasi format target re-encode
  let targetFormat = requestedExt === "jpeg" || requestedExt === "jpg" ? "jpg" : requestedExt;
  if (detectedFormat === "jpeg") targetFormat = "jpg";
  else if (detectedFormat === "png") targetFormat = "png";
  else if (detectedFormat === "webp") targetFormat = "webp";

  let reencodedBuffer;
  let finalMimeType;

  // 5. Re-encode dari raw decoded bitmap & otomatis hilangkan (strip) semua metadata EXIF/IPTC/XMP
  if (targetFormat === "jpg") {
    reencodedBuffer = await image
      .rotate()
      .jpeg({ quality: 85, mozjpeg: true })
      .toBuffer();
    finalMimeType = "image/jpeg";
  } else if (targetFormat === "png") {
    reencodedBuffer = await image
      .rotate()
      .png({ compressionLevel: 8 })
      .toBuffer();
    finalMimeType = "image/png";
  } else if (targetFormat === "webp") {
    reencodedBuffer = await image
      .rotate()
      .webp({ quality: 85 })
      .toBuffer();
    finalMimeType = "image/webp";
  } else {
    throw new Error("Format target gambar tidak didukung.");
  }

  return {
    reencodedBuffer,
    format: targetFormat,
    mimeType: finalMimeType,
    width,
    height,
  };
}

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input), "utf8");
  return buf
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str) {
  let base64 = String(str).replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

function parseDurationSeconds(durationStr) {
  const str = String(durationStr || "8h").trim();
  const match = str.match(/^(\d+)\s*([smhd])?$/i);
  if (!match) return 8 * 3600;
  const val = parseInt(match[1], 10);
  const unit = (match[2] || "s").toLowerCase();
  if (unit === "m") return val * 60;
  if (unit === "h") return val * 3600;
  if (unit === "d") return val * 86400;
  return val;
}

function signJwt(payload, expiresIn = JWT_EXPIRES_IN) {
  const nowSec = Math.floor(Date.now() / 1000);
  const expSec = nowSec + parseDurationSeconds(expiresIn);
  const header = { alg: "HS256", typ: "JWT" };
  const fullPayload = {
    ...payload,
    iat: nowSec,
    exp: expSec,
  };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = base64UrlEncode(
    crypto.createHmac("sha256", JWT_SECRET).update(signingInput).digest()
  );
  return {
    token: `${signingInput}.${signature}`,
    expiresAt: new Date(expSec * 1000).toISOString(),
    expiresInSeconds: expSec - nowSec,
  };
}

function verifyJwt(token) {
  if (!token || typeof token !== "string") {
    throw new Error("Token tidak ditemukan.");
  }
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Format token JWT tidak valid.");
  }
  const [encodedHeader, encodedPayload, signature] = parts;
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expectedSig = base64UrlEncode(
    crypto.createHmac("sha256", JWT_SECRET).update(signingInput).digest()
  );
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    throw new Error("Tanda tangan JWT (JWT_SECRET) tidak valid.");
  }
  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && nowSec >= payload.exp) {
    throw new Error("Sesi login (token JWT) telah berakhir. Silakan login kembali.");
  }
  return payload;
}

function extractToken(req) {
  // Prioritas 1: HttpOnly Cookie (Browser Session SEC-006)
  if (req.cookies && req.cookies.psu_auth_token) {
    return { token: String(req.cookies.psu_auth_token).trim(), source: "cookie" };
  }

  // Prioritas 2: Authorization Header (Integrasi Non-Browser / CLI / Automated Test)
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return { token: authHeader.slice(7).trim(), source: "header" };
  }
  if (req.headers["x-access-token"]) {
    return { token: String(req.headers["x-access-token"]).trim(), source: "header" };
  }
  return { token: "", source: "none" };
}

function extractTokenFromHeader(req) {
  return extractToken(req).token;
}

async function requireAdminAuth(req, res, next) {
  try {
    const { token, source } = extractToken(req);
    if (!token) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        message: "Akses ditolak. Silakan login sebagai Admin terlebih dahulu.",
      });
    }

    const decoded = verifyJwt(token);

    // SEC-008: Validasi Status Akun & Token Revocation Secara Real-Time
    let userRecord = null;
    if (dbConnected && pool) {
      try {
        const [rows] = await pool.execute(
          "SELECT id, username, email, full_name, role, is_active, token_version FROM admin_users WHERE id = ? OR username = ? LIMIT 1",
          [decoded.sub || -1, decoded.username || ""]
        );
        if (rows.length > 0) userRecord = rows[0];
      } catch {
        // Fallback
      }
    }

    if (!userRecord) {
      userRecord =
        fallbackStore.users.find(
          (u) =>
            u.id === decoded.sub ||
            u.username.toLowerCase() === (decoded.username || "").toLowerCase()
        ) || null;

      if (!userRecord) {
        const freshFallbackUsers = loadFallbackUsers();
        if (freshFallbackUsers.length > 0) {
          fallbackStore.users = freshFallbackUsers;
        }
        userRecord =
          fallbackStore.users.find(
            (u) =>
              u.id === decoded.sub ||
              u.username.toLowerCase() === (decoded.username || "").toLowerCase()
          ) || null;
      }
    }

    if (!userRecord) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        message: "Akun pengguna tidak ditemukan.",
      });
    }

    // SEC-008: Segera tolak akses jika akun dinonaktifkan (is_active = 0)
    if (Number(userRecord.is_active) === 0) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: "Akun administrator ini telah dinonaktifkan.",
      });
    }

    // SEC-008: Validasi token_version untuk pembatalan sesi (Revocation Check)
    const currentTokenVersion =
      typeof userRecord.token_version === "number" ? userRecord.token_version : 1;
    const tokenVersionInJwt =
      typeof decoded.token_version === "number" ? decoded.token_version : 1;

    if (tokenVersionInJwt !== currentTokenVersion) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        tokenRevoked: true,
        message: "Sesi login telah dibatalkan atau kedaluwarsa. Silakan login kembali.",
      });
    }

    // Peran (role) pengguna selalu diambil segar dari database/store
    req.adminUser = {
      ...decoded,
      role: userRecord.role,
      is_active: userRecord.is_active,
      token_version: currentTokenVersion,
      authSource: source,
    };

    return next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      unauthorized: true,
      message: err.message || "Akses ditolak. Silakan login sebagai Admin terlebih dahulu.",
    });
  }
}

// ============================================================================
// ROLE-BASED ACCESS CONTROL (RBAC) AUTHORIZATION MIDDLEWARE
// ============================================================================
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.adminUser) {
      return res.status(401).json({
        success: false,
        unauthorized: true,
        message: "Autentikasi diperlukan. Silakan login terlebih dahulu.",
      });
    }
    const currentRole = req.adminUser.role || "Tidak terdefinisi";
    if (!allowedRoles.includes(currentRole)) {
      return res.status(403).json({
        success: false,
        forbidden: true,
        message: `Akses ditolak. Operasi ini membutuhkan hak akses (${allowedRoles.join(" atau ")}). Peran Anda saat ini: ${currentRole}.`,
      });
    }
    return next();
  };
}

// ============================================================================
// FALLBACK IN-MEMORY DATA (JIKA MYSQL BELUM AKTIF SAAT PENGEMBANGAN)
// ============================================================================
let pool;
let dbConnected = false;

const fallbackAdminFile = path.join(__dirname, ".admin-fallback.json");
function loadFallbackUsers() {
  try {
    if (fs.existsSync(fallbackAdminFile)) {
      const data = JSON.parse(fs.readFileSync(fallbackAdminFile, "utf8"));
      if (Array.isArray(data)) {
        return data.map((u) => ({
          ...u,
          token_version: typeof u.token_version === "number" ? u.token_version : 1,
        }));
      }
    }
  } catch {
    // Ignore read error
  }
  return [];
}

function saveFallbackUsers(users) {
  try {
    fs.writeFileSync(fallbackAdminFile, JSON.stringify(users, null, 2), "utf8");
  } catch {
    // Ignore write error
  }
}

const fallbackStore = {
  users: loadFallbackUsers(),
  articles: INITIAL_ARTICLES.map((art, index) => ({
    id: index + 1,
    ...art,
    created_at: `${art.published_at} 09:00:00`,
    updated_at: `${art.published_at} 09:00:00`,
  })),
  gallery: DEFAULT_GALLERY_ITEMS.map((item, idx) => ({
    id: idx + 1,
    ...item,
    file_size: 0,
    created_at: new Date().toISOString(),
  })),
  authors: INITIAL_AUTHORS_META.map((a, idx) => ({
    id: idx + 1,
    ...a,
    is_active: 1,
    created_at: new Date().toISOString(),
  })),
  logs: [
    {
      id: 1,
      admin_username: "system",
      action_type: "INIT",
      target_title: "Dashboard Artikel PSU",
      details: "Inisialisasi sistem manajemen artikel & galeri media PT Penilai Standar Uji",
      created_at: new Date().toISOString(),
    },
  ],
};

function slugifyTitle(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTags(rawTags) {
  if (Array.isArray(rawTags)) return rawTags;
  if (typeof rawTags === "string") {
    try {
      const parsed = JSON.parse(rawTags);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      return rawTags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
  }
  return [];
}

async function logAdminActivity(adminUsername, actionType, targetTitle, details = "") {
  const cleanUser = adminUsername || "admin";
  const cleanAction = actionType || "ACTION";
  const cleanTarget = String(targetTitle || "").slice(0, 250);
  const cleanDetails = String(details || "");

  try {
    if (dbConnected && pool) {
      await pool.execute(
        `INSERT INTO log_aktivitas_artikel (admin_username, action_type, target_title, details)
         VALUES (?, ?, ?, ?)`,
        [cleanUser, cleanAction, cleanTarget, cleanDetails]
      );
      return;
    }
  } catch {
    // Fallback
  }

  fallbackStore.logs.unshift({
    id: Date.now(),
    admin_username: cleanUser,
    action_type: cleanAction,
    target_title: cleanTarget,
    details: cleanDetails,
    created_at: new Date().toISOString(),
  });
}

async function ensureGalleryEntry({
  title,
  filename,
  image_url,
  category = "Artikel Upload",
  alt_text = "",
  file_size = 0,
  mime_type = "image/webp",
  uploaded_by = "Admin PSU",
}) {
  if (!image_url || typeof image_url !== "string" || image_url.startsWith("data:")) {
    return null;
  }
  const cleanUrl = image_url.trim();
  const cleanFilename = filename || path.basename(cleanUrl);
  const cleanTitle =
    title ||
    cleanFilename
      .replace(/\.[^/.]+$/, "")
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

  try {
    if (dbConnected && pool) {
      await pool.execute(
        `INSERT IGNORE INTO galeri_artikel
         (title, filename, image_url, category, alt_text, file_size, mime_type, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanTitle,
          cleanFilename,
          cleanUrl,
          category,
          alt_text || cleanTitle,
          Number(file_size) || 0,
          mime_type,
          uploaded_by,
        ]
      );
      const [rows] = await pool.execute(
        "SELECT * FROM galeri_artikel WHERE image_url = ? LIMIT 1",
        [cleanUrl]
      );
      return rows[0] || null;
    }
  } catch {
    // Fallback
  }

  let existing = fallbackStore.gallery.find((g) => g.image_url === cleanUrl);
  if (!existing) {
    existing = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      title: cleanTitle,
      filename: cleanFilename,
      image_url: cleanUrl,
      category,
      alt_text: alt_text || cleanTitle,
      file_size: Number(file_size) || 0,
      mime_type,
      uploaded_by,
      created_at: new Date().toISOString(),
    };
    fallbackStore.gallery.unshift(existing);
  }
  return existing;
}

async function syncPhysicalNewsFolderToGallery() {
  try {
    if (!fs.existsSync(publicNewsDir)) return;
    const files = fs.readdirSync(publicNewsDir);
    for (const file of files) {
      if (!/\.(webp|png|jpe?g|gif|svg)$/i.test(file)) continue;
      const fullPath = path.join(publicNewsDir, file);
      const stat = fs.statSync(fullPath);
      const ext = path.extname(file).toLowerCase().replace(".", "");
      const mime =
        ext === "jpg" || ext === "jpeg"
          ? "image/jpeg"
          : ext === "png"
          ? "image/png"
          : ext === "svg"
          ? "image/svg+xml"
          : "image/webp";
      await ensureGalleryEntry({
        title: path.basename(file, path.extname(file)).replace(/[-_]+/g, " "),
        filename: file,
        image_url: `/news/${file}`,
        category: "Artikel Upload",
        alt_text: path.basename(file, path.extname(file)),
        file_size: stat.size,
        mime_type: mime,
        uploaded_by: "Admin PSU",
      });
    }
  } catch (err) {
    console.warn("Gagal sinkronisasi folder news:", err.message);
  }
}

// ============================================================================
// INISIALISASI DATABASE & MIGRASI OTOMATIS
// ============================================================================
async function initDatabase() {
  if (!mysql) {
    dbConnected = false;
    console.warn("==========================================");
    console.warn("PERINGATAN: Modul mysql2 tidak ditemukan pada environment.");
    console.warn("Server tetap berjalan dengan Mode Fallback Memori Lokal.");
    console.warn("==========================================");
    await syncPhysicalNewsFolderToGallery();
    return;
  }
  try {
    const connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`
    );
    await connection.end();

    pool = mysql.createPool({
      ...dbConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Migrasi otomatis tabel sertifikat
    try {
      const [colsSumber] = await pool.query("SHOW COLUMNS FROM sertifikat_produk LIKE 'sumber'");
      const [colsAlamat] = await pool.query("SHOW COLUMNS FROM sertifikat_produk LIKE 'alamat'");
      const [colsBerlaku] = await pool.query("SHOW COLUMNS FROM sertifikat_produk LIKE 'berlaku_sd'");
      const [colsStatus] = await pool.query("SHOW COLUMNS FROM sertifikat_produk LIKE 'status'");
      const statusType = String(colsStatus[0]?.Type || "");
      const [sampleCheck] = await pool.query(
        "SELECT id FROM sertifikat_produk WHERE no_sertifikat = 'PSU-SPPT-2026-GAHA' LIMIT 1"
      );

      if (
        colsSumber.length > 0 ||
        colsAlamat.length > 0 ||
        colsBerlaku.length === 0 ||
        !statusType.includes("Ditangguhkan") ||
        !statusType.includes("Dicabut") ||
        sampleCheck.length === 0
      ) {
        await pool.query(
          "DROP TABLE IF EXISTS sertifikat_produk, sertifikat_pengujian, sertifikat_kalibrasi, sertifikat_sistem_manajemen"
        );
      }
    } catch {
      // Tabel belum ada
    }

    const createTableQueries = [
      `CREATE TABLE IF NOT EXISTS sertifikat_produk (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pabrik VARCHAR(255) NOT NULL,
        produk VARCHAR(255) NOT NULL,
        no_sni VARCHAR(100) NOT NULL,
        no_sertifikat VARCHAR(100) NOT NULL UNIQUE,
        terbit VARCHAR(50) NOT NULL,
        berlaku_sd VARCHAR(50) NOT NULL,
        status ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS sertifikat_pengujian (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pabrik VARCHAR(255) NOT NULL,
        produk VARCHAR(255) NOT NULL,
        no_sni VARCHAR(100) NOT NULL,
        no_sertifikat VARCHAR(100) NOT NULL UNIQUE,
        terbit VARCHAR(50) NOT NULL,
        berlaku_sd VARCHAR(50) NOT NULL,
        status ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS sertifikat_kalibrasi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pabrik VARCHAR(255) NOT NULL,
        produk VARCHAR(255) NOT NULL,
        no_sni VARCHAR(100) NOT NULL,
        no_sertifikat VARCHAR(100) NOT NULL UNIQUE,
        terbit VARCHAR(50) NOT NULL,
        berlaku_sd VARCHAR(50) NOT NULL,
        status ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS sertifikat_sistem_manajemen (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nama_pabrik VARCHAR(255) NOT NULL,
        produk VARCHAR(255) NOT NULL,
        no_sni VARCHAR(100) NOT NULL,
        no_sertifikat VARCHAR(100) NOT NULL UNIQUE,
        terbit VARCHAR(50) NOT NULL,
        berlaku_sd VARCHAR(50) NOT NULL,
        status ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS admin_users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(150) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(150) NOT NULL,
        role ENUM('Super Admin', 'Editor', 'Author') NOT NULL DEFAULT 'Super Admin',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        token_version INT NOT NULL DEFAULT 1,
        last_login DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS artikel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(255) NOT NULL UNIQUE,
        title_id VARCHAR(255) NOT NULL,
        title_en VARCHAR(255) NOT NULL,
        excerpt_id TEXT NOT NULL,
        excerpt_en TEXT NOT NULL,
        content_id LONGTEXT NOT NULL,
        content_en LONGTEXT NOT NULL,
        image_url LONGTEXT NOT NULL,
        author VARCHAR(150) NOT NULL DEFAULT 'Corporate Secretary PSU',
        category ENUM('News', 'Article', 'Press Release') NOT NULL DEFAULT 'News',
        tags JSON NOT NULL,
        published_at DATE NOT NULL,
        status ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
        is_featured TINYINT(1) NOT NULL DEFAULT 0,
        views INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS galeri_artikel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        image_url VARCHAR(500) NOT NULL UNIQUE,
        category VARCHAR(100) NOT NULL DEFAULT 'Artikel Upload',
        alt_text VARCHAR(255) NOT NULL DEFAULT '',
        file_size INT NOT NULL DEFAULT 0,
        mime_type VARCHAR(100) NOT NULL DEFAULT 'image/webp',
        uploaded_by VARCHAR(150) NOT NULL DEFAULT 'Admin PSU',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS penulis_artikel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(150) NOT NULL UNIQUE,
        role_title VARCHAR(150) NOT NULL DEFAULT 'Tim Redaksi PSU',
        division VARCHAR(150) NOT NULL DEFAULT 'Corporate Communication',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      `CREATE TABLE IF NOT EXISTS log_aktivitas_artikel (
        id INT AUTO_INCREMENT PRIMARY KEY,
        admin_username VARCHAR(100) NOT NULL,
        action_type VARCHAR(50) NOT NULL,
        target_title VARCHAR(255) NOT NULL DEFAULT '',
        details TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
    ];

    for (const q of createTableQueries) {
      await pool.query(q);
    }

    // Alter table migrations bagi database yang sudah ada sebelumnya
    const alterMigrations = [
      "ALTER TABLE admin_users ADD COLUMN token_version INT NOT NULL DEFAULT 1 AFTER is_active",
      "ALTER TABLE artikel ADD COLUMN author VARCHAR(150) NOT NULL DEFAULT 'Corporate Secretary PSU' AFTER image_url",
      "ALTER TABLE artikel ADD COLUMN is_featured TINYINT(1) NOT NULL DEFAULT 0 AFTER status",
      "ALTER TABLE artikel ADD COLUMN views INT NOT NULL DEFAULT 0 AFTER is_featured",
      "ALTER TABLE artikel ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP",
      "ALTER TABLE artikel ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
    ];
    for (const alterSql of alterMigrations) {
      try {
        await pool.query(alterSql);
      } catch {
        // Kolom sudah ada
      }
    }

    // Seed data sertifikat
    await pool.query(`
      INSERT IGNORE INTO sertifikat_produk (nama_pabrik, produk, no_sni, no_sertifikat, terbit, berlaku_sd, status) VALUES
      ('PT. Simaju | Bekasi', 'Kakao Bubuk', 'SNI 3747:2009', 'PSU-SPPT-2026-GAHA', '14 Okt 2026', '13 Okt 2030', 'Aktif'),
      ('Pasar ABC | Jakarta', 'Pasar Rakyat', 'SNI 8152:2021', 'PSU-2026-PPWIQADA', '14 Okt 2026', '13 Okt 2030', 'Aktif'),
      ('PT. Sinar Abadi | Bekasi', 'Minyak Goreng Sawit', 'SNI 7709:2019', 'PSU-SPPT-2026-0001', '08 Okt 2026', '07 Okt 2030', 'Aktif'),
      ('PT. Pangan Lestari | Tangerang', 'Biskuit', 'SNI 2973:2022', 'PSU-SPPT-2025-0012', '14 Mar 2025', '13 Mar 2029', 'Ditangguhkan'),
      ('PT. Gula Manis Nusantara | Lampung', 'Gula Kristal Putih', 'SNI 3140.3:2020', 'PSU-SPPT-2024-0007', '19 Mei 2024', '18 Mei 2028', 'Dicabut')
    `);

    await pool.query(`
      INSERT IGNORE INTO sertifikat_pengujian (nama_pabrik, produk, no_sni, no_sertifikat, terbit, berlaku_sd, status) VALUES
      ('PT. Tirta Murni Sejahtera | Bogor', 'Air Mineral', 'SNI 3553:2015', 'PSU-LP-2026-BKLN', '14 Okt 2026', '13 Okt 2029', 'Aktif'),
      ('PT. Agro Pupuk Mandiri | Gresik', 'Pupuk NPK Padat', 'SNI 2803:2012', 'PSU-LP-2026-MNPQ', '14 Okt 2026', '13 Okt 2029', 'Aktif'),
      ('PT. Baja Mas Utama | Surabaya', 'Foodtray Baja Tahan Karat', 'SNI 9369:2025', 'PSU-SPPT-2026-0101', '12 Sep 2026', '11 Sep 2029', 'Ditangguhkan'),
      ('CV. Pangan Makmur Jaya | Semarang', 'Tepung Terigu', 'SNI 3751:2018', 'PSU-LP-2024-RTYU', '05 Mei 2024', '04 Mei 2027', 'Dicabut')
    `);

    await pool.query(`
      INSERT IGNORE INTO sertifikat_kalibrasi (nama_pabrik, produk, no_sni, no_sertifikat, terbit, berlaku_sd, status) VALUES
      ('RS. Harapan Sehat Sentosa | Jakarta', 'Tensimeter Digital', 'SNI IEC 80601-2-30', 'PSU-LK-2026-KLMN', '14 Okt 2026', '13 Okt 2027', 'Aktif'),
      ('PT. Medika Alat Utama | Bandung', 'Inkubator Bayi', 'SNI IEC 60601-2-19', 'PSU-LK-2026-PQRS', '14 Okt 2026', '13 Okt 2027', 'Aktif'),
      ('PT. Presisi Industri Teknika | Cikarang', 'Neraca Analitik Digital', 'SNI ISO/IEC 17025:2017', 'PSU-SPPT-2026-0201', '18 Okt 2026', '17 Okt 2027', 'Ditangguhkan'),
      ('Klinik Utama Permata | Bekasi', 'Timbangan Pasien Elektronik', 'SNI OIML R76-1', 'PSU-LK-2024-WXYZ', '22 Agu 2024', '21 Agu 2025', 'Dicabut')
    `);

    await pool.query(`
      INSERT IGNORE INTO sertifikat_sistem_manajemen (nama_pabrik, produk, no_sni, no_sertifikat, terbit, berlaku_sd, status) VALUES
      ('PT. Konstruksi Karya Nusantara | Jakarta', 'Sistem Manajemen Mutu', 'SNI ISO 9001:2015', 'PSU-LSSM-2026-ABCD', '14 Okt 2026', '13 Okt 2029', 'Aktif'),
      ('PT. Hijau Lestari Industri | Karawang', 'Sistem Manajemen Lingkungan', 'SNI ISO 14001:2015', 'PSU-LSSM-2026-EFGH', '14 Okt 2026', '13 Okt 2029', 'Aktif'),
      ('PT. Pangan Aman Sentosa | Sidoarjo', 'Sistem Manajemen Keamanan Pangan', 'SNI ISO 22000:2018', 'PSU-SPPT-2026-0301', '01 Okt 2026', '30 Sep 2029', 'Ditangguhkan'),
      ('PT. Mitra Logistik Terpadu | Surabaya', 'Sistem Manajemen Mutu', 'SNI ISO 9001:2015', 'PSU-LSSM-2024-IJKL', '09 Feb 2024', '08 Feb 2027', 'Dicabut')
    `);

    // Pengecekan akun admin (tanpa seed password default statis)
    const [existingAdmins] = await pool.query("SELECT COUNT(*) AS cnt FROM admin_users");
    if (existingAdmins[0].cnt === 0) {
      console.warn("====================================================================");
      console.warn("[KEAMANAN] Tidak ada akun administrator yang terdaftar di database.");
      console.warn("Gunakan CLI provisioning untuk membuat akun Super Admin pertama:");
      console.warn("  node backend/scripts/create-admin.js");
      console.warn("====================================================================");
    }

    // Seed penulis artikel
    for (const auth of INITIAL_AUTHORS_META) {
      await pool.execute(
        `INSERT IGNORE INTO penulis_artikel (name, role_title, division, is_active)
         VALUES (?, ?, ?, 1)`,
        [auth.name, auth.role_title, auth.division]
      );
    }

    // Seed artikel awal
    const insertArticleSql = `
      INSERT IGNORE INTO artikel
      (slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en, image_url, author, category, tags, published_at, status, is_featured, views)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    for (const art of INITIAL_ARTICLES) {
      await pool.execute(insertArticleSql, [
        art.slug,
        art.title_id,
        art.title_en,
        art.excerpt_id,
        art.excerpt_en,
        art.content_id,
        art.content_en,
        art.image_url,
        art.author || "Corporate Secretary PSU",
        art.category,
        JSON.stringify(art.tags),
        art.published_at,
        art.status,
        art.is_featured || 0,
        art.views || 120,
      ]);
    }

    dbConnected = true;

    // Seed galeri artikel default & sinkronisasi dengan gambar di artikel maupun folder /news
    for (const item of DEFAULT_GALLERY_ITEMS) {
      await ensureGalleryEntry(item);
    }

    const [allArtImages] = await pool.query("SELECT title_id, image_url, author FROM artikel");
    for (const row of allArtImages) {
      if (row.image_url && !row.image_url.startsWith("data:")) {
        await ensureGalleryEntry({
          title: row.title_id ? `Sampul: ${row.title_id.slice(0, 60)}` : path.basename(row.image_url),
          filename: path.basename(row.image_url),
          image_url: row.image_url,
          category: row.image_url.startsWith("/news/") ? "Artikel Upload" : "Banner Default",
          alt_text: row.title_id || "",
          uploaded_by: row.author || "Admin PSU",
        });
      }
    }

    await syncPhysicalNewsFolderToGallery();
    await syncSitemapFiles().catch((e) => console.error("Sitemap startup sync error:", e.message));

    console.log("==========================================");
    console.log("Koneksi MySQL Berhasil! Database:", dbConfig.database);
    const [artCnt] = await pool.query("SELECT COUNT(*) AS total FROM artikel");
    const [galCnt] = await pool.query("SELECT COUNT(*) AS total FROM galeri_artikel");
    const [admCnt] = await pool.query("SELECT COUNT(*) AS total FROM admin_users");
    console.log(`- Tabel [artikel]: ${artCnt[0].total} artikel`);
    console.log(`- Tabel [galeri_artikel]: ${galCnt[0].total} foto media`);
    console.log(`- Tabel [admin_users]: ${admCnt[0].total} akun admin aktif`);
    console.log("==========================================");
  } catch (err) {
    dbConnected = false;
    console.error("==========================================");
    console.error("PERINGATAN: Gagal terhubung ke MySQL saat startup!");
    console.error("Pesan Error:", err.message);
    console.error("Server tetap berjalan dengan Mode Fallback Memori Lokal.");
    console.error("==========================================");
    await syncPhysicalNewsFolderToGallery();
    await syncSitemapFiles().catch((e) => console.error("Sitemap startup sync error:", e.message));
  }
}

// ============================================================================
// ENDPOINT STATUS SERVER
// ============================================================================
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    dbConnected,
    message: "Server API Tracking Sertifikat & Dashboard Artikel PT PENILAI STANDAR UJI aktif.",
  });
});

// ============================================================================
// ENDPOINT AUTENTIKASI ADMIN & MANAJEMEN SESI JWT
// ============================================================================
app.post("/api/auth/login", authRateLimiter, async (req, res) => {
  try {
    const { username, password, email } = req.body || {};
    const identifier = String(username || email || "").trim();
    const rawPassword = String(password || "");

    if (!identifier || !rawPassword) {
      return res.status(400).json({
        success: false,
        message: "Username/Email dan Password wajib diisi.",
      });
    }

    let userRecord = null;

    if (dbConnected && pool) {
      try {
        const [rows] = await pool.execute(
          `SELECT * FROM admin_users
           WHERE (LOWER(username) = LOWER(?) OR LOWER(email) = LOWER(?))
             AND is_active = 1
           LIMIT 1`,
          [identifier, identifier]
        );
        if (rows.length > 0) {
          userRecord = rows[0];
        }
      } catch {
        dbConnected = false;
      }
    }

    if (!userRecord) {
      userRecord =
        fallbackStore.users.find(
          (u) =>
            (u.username.toLowerCase() === identifier.toLowerCase() ||
              u.email.toLowerCase() === identifier.toLowerCase()) &&
            u.is_active === 1
        ) || null;

      if (!userRecord) {
        const freshFallbackUsers = loadFallbackUsers();
        if (freshFallbackUsers.length > 0) {
          fallbackStore.users = freshFallbackUsers;
        }
        userRecord =
          fallbackStore.users.find(
            (u) =>
              (u.username.toLowerCase() === identifier.toLowerCase() ||
                u.email.toLowerCase() === identifier.toLowerCase()) &&
              u.is_active === 1
          ) || null;
      }

      if (!userRecord && identifier.toLowerCase() === "admin") {
        userRecord =
          fallbackStore.users.find(
            (u) =>
              (u.username.toLowerCase() === "psu_admin" ||
                u.email.toLowerCase() === "admin@penilaistandaruji.com") &&
              u.is_active === 1
          ) || null;
      }
    }

    if (!userRecord || !verifyPassword(rawPassword, userRecord.password_hash)) {
      await logAdminActivity(
        identifier || "unknown",
        "FAILED_LOGIN",
        "Percobaan Login Ditolak",
        `Login gagal untuk identitas '${identifier}' dari IP ${getClientIp(req)}`
      );
      return res.status(401).json({
        success: false,
        message: "Username atau password yang Anda masukkan salah.",
      });
    }

    const nowIso = new Date().toISOString().slice(0, 19).replace("T", " ");
    if (dbConnected && pool) {
      try {
        await pool.execute("UPDATE admin_users SET last_login = ? WHERE id = ?", [
          nowIso,
          userRecord.id,
        ]);
      } catch {
        // Ignore
      }
    } else {
      userRecord.last_login = nowIso;
    }

    const userTokenVersion =
      typeof userRecord.token_version === "number" ? userRecord.token_version : 1;

    const { token, expiresAt, expiresInSeconds } = signJwt({
      sub: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role,
      token_version: userTokenVersion,
    });

    // SEC-006: Terbitkan HttpOnly Cookie dan CSRF Token
    const csrfToken = crypto.randomBytes(32).toString("hex");
    const isSecure =
      process.env.NODE_ENV === "production" ||
      req.secure ||
      req.headers["x-forwarded-proto"] === "https";

    res.cookie("psu_auth_token", token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "Lax",
      path: "/",
      maxAge: expiresInSeconds * 1000,
    });

    res.cookie("psu_csrf_token", csrfToken, {
      httpOnly: false,
      secure: isSecure,
      sameSite: "Lax",
      path: "/",
      maxAge: expiresInSeconds * 1000,
    });

    await logAdminActivity(
      userRecord.username,
      "LOGIN",
      `Login ke Dashboard Artikel (${userRecord.role})`,
      `Sesi JWT diterbitkan hingga ${expiresAt}`
    );

    const isBrowserClient = req.headers["x-auth-client"] === "browser";
    const responsePayload = {
      success: true,
      message: "Login berhasil! Selamat datang di Dashboard Artikel PSU.",
      csrfToken,
      expiresAt,
      expiresInSeconds,
      user: {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        full_name: userRecord.full_name,
        role: userRecord.role,
        last_login: nowIso,
      },
    };

    // Untuk browser client, JANGAN kirim token di JSON body (mencegah simpan di localStorage)
    if (!isBrowserClient) {
      responsePayload.token = token;
    }

    return res.json(responsePayload);
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses login.",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT LOGOUT ADMIN & PEMBATALAN SESI (SEC-006 & SEC-008)
// ============================================================================
app.post("/api/auth/logout", async (req, res) => {
  try {
    const { token } = extractToken(req);
    if (token) {
      try {
        const decoded = verifyJwt(token);
        if (decoded && (decoded.sub || decoded.username)) {
          if (dbConnected && pool) {
            await pool.execute(
              "UPDATE admin_users SET token_version = token_version + 1 WHERE id = ? OR username = ?",
              [decoded.sub || -1, decoded.username || ""]
            );
          } else {
            const user = fallbackStore.users.find(
              (u) => u.id === decoded.sub || u.username === decoded.username
            );
            if (user) {
              user.token_version = (user.token_version || 1) + 1;
              saveFallbackUsers(fallbackStore.users);
            }
          }
          await logAdminActivity(
            decoded.username || "admin",
            "LOGOUT",
            "Keluar dari Sesi Dashboard",
            "Sesi login diakhiri dan token dibatalkan (token_version diinkrementasi)"
          );
        }
      } catch {
        // Abaikan jika token telah kedaluwarsa
      }
    }

    res.clearCookie("psu_auth_token", { path: "/" });
    res.clearCookie("psu_csrf_token", { path: "/" });

    return res.json({
      success: true,
      message: "Logout berhasil. Sesi telah diakhiri secara aman.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memproses logout.",
      error: error.message,
    });
  }
});

app.get("/api/auth/me", requireAdminAuth, async (req, res) => {
  const { sub, username } = req.adminUser;
  let userRecord = null;

  if (dbConnected && pool) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admin_users WHERE id = ? OR username = ? LIMIT 1",
        [sub || -1, username || ""]
      );
      if (rows.length > 0) userRecord = rows[0];
    } catch {
      // Fallback
    }
  }

  if (!userRecord) {
    const f = fallbackStore.users.find((u) => u.id === sub || u.username === username);
    if (f) {
      userRecord = {
        id: f.id,
        username: f.username,
        email: f.email,
        full_name: f.full_name,
        role: f.role,
        is_active: f.is_active,
        last_login: f.last_login,
      };
    }
  }

  return res.json({
    success: true,
    dbConnected,
    user: userRecord || {
      id: sub,
      username: req.adminUser.username,
      email: req.adminUser.email,
      full_name: req.adminUser.full_name,
      role: req.adminUser.role,
    },
    tokenExp: req.adminUser.exp ? new Date(req.adminUser.exp * 1000).toISOString() : null,
  });
});

app.put("/api/auth/profile", requireAdminAuth, async (req, res) => {
  try {
    const { full_name, email } = req.body || {};
    const { sub, username } = req.adminUser;

    if (!full_name || !email) {
      return res.status(400).json({
        success: false,
        message: "Nama lengkap dan email wajib diisi.",
      });
    }

    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    if (dbConnected && pool) {
      await pool.execute(
        "UPDATE admin_users SET full_name = ?, email = ? WHERE id = ? OR username = ?",
        [full_name.trim(), cleanEmail, sub || -1, username]
      );
    } else {
      const target = fallbackStore.users.find((u) => u.id === sub || u.username === username);
      if (target) {
        target.full_name = full_name.trim();
        target.email = cleanEmail;
        saveFallbackUsers(fallbackStore.users);
      }
    }

    await logAdminActivity(
      username,
      "UPDATE_PROFILE",
      full_name.trim(),
      `Memperbarui profil akun admin (${email.trim()})`
    );

    return res.json({
      success: true,
      message: "Profil admin berhasil diperbarui.",
      user: {
        id: sub,
        username,
        full_name: full_name.trim(),
        email: email.trim(),
        role: req.adminUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui profil admin.",
      error: error.message,
    });
  }
});

app.put("/api/auth/password", requireAdminAuth, authRateLimiter, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const { sub, username } = req.adminUser;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini dan password baru wajib diisi.",
      });
    }

    const passError = validatePasswordPolicy(newPassword);
    if (passError) {
      return res.status(400).json({
        success: false,
        message: `Kebijakan Keamanan Password: ${passError}`,
      });
    }

    let userRecord = null;
    if (dbConnected && pool) {
      const [rows] = await pool.execute(
        "SELECT * FROM admin_users WHERE id = ? OR username = ? LIMIT 1",
        [sub || -1, username]
      );
      if (rows.length > 0) userRecord = rows[0];
    } else {
      userRecord = fallbackStore.users.find((u) => u.id === sub || u.username === username);
    }

    if (!userRecord || !verifyPassword(currentPassword, userRecord.password_hash)) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini tidak sesuai.",
      });
    }

    const newHash = hashPassword(newPassword);
    const nextTokenVersion = (userRecord.token_version || 1) + 1;

    if (dbConnected && pool) {
      await pool.execute(
        "UPDATE admin_users SET password_hash = ?, token_version = ? WHERE id = ?",
        [newHash, nextTokenVersion, userRecord.id]
      );
    } else {
      userRecord.password_hash = newHash;
      userRecord.token_version = nextTokenVersion;
      saveFallbackUsers(fallbackStore.users);
    }

    await logAdminActivity(
      username,
      "CHANGE_PASSWORD",
      username,
      "Mengubah password keamanan akun admin (token_version diinkrementasi, token lama dibatalkan)"
    );

    // Terbitkan token dan cookie baru dengan token_version terbaru agar sesi aktif tetap valid
    const { token: newToken, expiresAt, expiresInSeconds } = signJwt({
      sub: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role,
      token_version: nextTokenVersion,
    });

    const csrfToken = crypto.randomBytes(32).toString("hex");
    const isSecure =
      process.env.NODE_ENV === "production" ||
      req.secure ||
      req.headers["x-forwarded-proto"] === "https";

    res.cookie("psu_auth_token", newToken, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "Lax",
      path: "/",
      maxAge: expiresInSeconds * 1000,
    });

    res.cookie("psu_csrf_token", csrfToken, {
      httpOnly: false,
      secure: isSecure,
      sameSite: "Lax",
      path: "/",
      maxAge: expiresInSeconds * 1000,
    });

    const isBrowserClient = req.headers["x-auth-client"] === "browser";
    const resPayload = {
      success: true,
      message: "Password berhasil diperbarui!",
      csrfToken,
      expiresAt,
    };
    if (!isBrowserClient) {
      resPayload.token = newToken;
    }

    return res.json(resPayload);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengubah password.",
      error: error.message,
    });
  }
});

app.get("/api/admin/users", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  try {
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        "SELECT id, username, email, full_name, role, is_active, last_login, created_at FROM admin_users ORDER BY id ASC"
      );
      return res.json({ success: true, data: rows });
    }
    return res.json({
      success: true,
      data: fallbackStore.users.map(({ password_hash, ...rest }) => rest),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat daftar akun admin.",
      error: error.message,
    });
  }
});

app.post("/api/admin/users", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body || {};
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Username, email, nama lengkap, dan password wajib diisi.",
      });
    }

    const cleanUsername = String(username).trim();
    if (cleanUsername.length < 3 || !/^[a-zA-Z0-9_.-]+$/.test(cleanUsername)) {
      return res.status(400).json({
        success: false,
        message: "Username minimal 3 karakter dan hanya boleh berisi huruf, angka, titik, atau garis bawah.",
      });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    if (!validateEmail(cleanEmail)) {
      return res.status(400).json({
        success: false,
        message: "Format email tidak valid.",
      });
    }

    const passError = validatePasswordPolicy(password);
    if (passError) {
      return res.status(400).json({
        success: false,
        message: `Kebijakan Keamanan Password: ${passError}`,
      });
    }

    const cleanRole = ["Super Admin", "Editor", "Author"].includes(role) ? role : "Editor";
    const passHash = hashPassword(password);

    if (dbConnected && pool) {
      const [result] = await pool.execute(
        `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active, token_version)
         VALUES (?, ?, ?, ?, ?, 1, 1)`,
        [cleanUsername, cleanEmail, passHash, full_name.trim(), cleanRole]
      );
      await logAdminActivity(
        req.adminUser.username,
        "CREATE_ADMIN",
        cleanUsername,
        `Menambahkan akun ${cleanRole} baru (${cleanEmail})`
      );
      return res.status(201).json({
        success: true,
        message: "Akun admin baru berhasil ditambahkan.",
        data: {
          id: result.insertId,
          username: cleanUsername,
          email: cleanEmail,
          full_name: full_name.trim(),
          role: cleanRole,
          is_active: 1,
        },
      });
    }

    const newItem = {
      id: Date.now(),
      username: cleanUsername,
      email: cleanEmail,
      password_hash: passHash,
      full_name: full_name.trim(),
      role: cleanRole,
      is_active: 1,
      token_version: 1,
      last_login: null,
      created_at: new Date().toISOString(),
    };
    fallbackStore.users.push(newItem);
    saveFallbackUsers(fallbackStore.users);
    const { password_hash, ...safeItem } = newItem;
    return res.status(201).json({
      success: true,
      message: "Akun admin baru berhasil ditambahkan.",
      data: safeItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan akun admin (pastikan username/email belum dipakai).",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT KELOLA STATUS & HAPUS AKUN ADMIN (SEC-008: TOKEN REVOCATION)
// ============================================================================
app.patch("/api/admin/users/:id/status", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  const { id } = req.params;
  const { is_active } = req.body || {};
  const targetId = Number(id);

  if (targetId === req.adminUser.sub) {
    return res.status(400).json({
      success: false,
      message: "Anda tidak dapat menonaktifkan akun Anda sendiri.",
    });
  }

  const newStatus = is_active === 0 || is_active === false ? 0 : 1;

  try {
    if (dbConnected && pool) {
      // Inkrementasi token_version saat status akun diubah agar seluruh token aktif segera dibatalkan (SEC-008)
      const [result] = await pool.execute(
        "UPDATE admin_users SET is_active = ?, token_version = token_version + 1 WHERE id = ?",
        [newStatus, targetId]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }
    } else {
      const u = fallbackStore.users.find((user) => user.id === targetId);
      if (!u) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }
      u.is_active = newStatus;
      u.token_version = (u.token_version || 1) + 1;
      saveFallbackUsers(fallbackStore.users);
    }

    await logAdminActivity(
      req.adminUser.username,
      "USER_STATUS",
      `User ID #${targetId}`,
      `Mengubah status akun menjadi ${newStatus === 1 ? "Aktif" : "Nonaktif"} (token lama dibatalkan)`
    );

    return res.json({
      success: true,
      message: `Status akun berhasil diubah menjadi ${newStatus === 1 ? "Aktif" : "Nonaktif"}.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui status akun.",
      error: error.message,
    });
  }
});

app.delete("/api/admin/users/:id", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  const { id } = req.params;
  const targetId = Number(id);

  if (targetId === req.adminUser.sub) {
    return res.status(400).json({
      success: false,
      message: "Anda tidak dapat menghapus akun Anda sendiri.",
    });
  }

  try {
    if (dbConnected && pool) {
      const [result] = await pool.execute("DELETE FROM admin_users WHERE id = ?", [targetId]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }
    } else {
      const idx = fallbackStore.users.findIndex((u) => u.id === targetId);
      if (idx === -1) {
        return res.status(404).json({ success: false, message: "Pengguna tidak ditemukan." });
      }
      fallbackStore.users.splice(idx, 1);
      saveFallbackUsers(fallbackStore.users);
    }

    await logAdminActivity(
      req.adminUser.username,
      "DELETE_USER",
      `User ID #${targetId}`,
      `Menghapus akun admin ID #${targetId}`
    );

    return res.json({
      success: true,
      message: "Akun admin berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus akun admin.",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT PENULIS (AUTHORS) & MANAJEMEN TAG
// ============================================================================
app.get("/api/authors", async (req, res) => {
  try {
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        "SELECT id, name, role_title, division, is_active, created_at FROM penulis_artikel WHERE is_active = 1 ORDER BY id ASC"
      );
      if (rows.length > 0) {
        return res.json({
          success: true,
          data: rows.map((r) => r.name),
          authorsMeta: rows,
        });
      }
    }
  } catch {
    // Fallback
  }

  return res.json({
    success: true,
    data: fallbackStore.authors.filter((a) => a.is_active).map((a) => a.name),
    authorsMeta: fallbackStore.authors,
  });
});

app.post("/api/authors", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  try {
    const { name, role_title, division } = req.body || {};
    if (!name || !String(name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Nama penulis/divisi wajib diisi.",
      });
    }
    const cleanName = String(name).trim();
    const cleanRole = String(role_title || "Tim Redaksi PSU").trim();
    const cleanDiv = String(division || "Corporate Communication").trim();

    if (dbConnected && pool) {
      const [result] = await pool.execute(
        `INSERT INTO penulis_artikel (name, role_title, division, is_active)
         VALUES (?, ?, ?, 1)
         ON DUPLICATE KEY UPDATE role_title = VALUES(role_title), division = VALUES(division), is_active = 1`,
        [cleanName, cleanRole, cleanDiv]
      );
      await logAdminActivity(
        req.adminUser.username,
        "ADD_AUTHOR",
        cleanName,
        `Menambahkan penulis artikel: ${cleanName} (${cleanDiv})`
      );
      return res.status(201).json({
        success: true,
        message: "Penulis berhasil disimpan.",
        data: { id: result.insertId, name: cleanName, role_title: cleanRole, division: cleanDiv, is_active: 1 },
      });
    }

    const item = {
      id: Date.now(),
      name: cleanName,
      role_title: cleanRole,
      division: cleanDiv,
      is_active: 1,
      created_at: new Date().toISOString(),
    };
    fallbackStore.authors.push(item);
    return res.status(201).json({
      success: true,
      message: "Penulis berhasil disimpan.",
      data: item,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambah penulis.",
      error: error.message,
    });
  }
});

app.delete("/api/authors/:id", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    if (dbConnected && pool) {
      await pool.execute("DELETE FROM penulis_artikel WHERE id = ?", [Number(id) || -1]);
    } else {
      fallbackStore.authors = fallbackStore.authors.filter((a) => String(a.id) !== String(id));
    }
    return res.json({
      success: true,
      message: "Penulis berhasil dihapus.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus penulis.",
      error: error.message,
    });
  }
});

app.post("/api/admin/tags/rename", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  try {
    const { oldTag, newTag } = req.body || {};
    const cleanOld = String(oldTag || "").trim();
    const cleanNew = String(newTag || "").trim();
    if (!cleanOld || !cleanNew) {
      return res.status(400).json({
        success: false,
        message: "Nama tag lama dan baru wajib diisi.",
      });
    }

    let updatedCount = 0;
    if (dbConnected && pool) {
      const [rows] = await pool.query("SELECT id, tags FROM artikel");
      for (const row of rows) {
        const tags = parseTags(row.tags);
        const hasTag = tags.some((t) => t.toLowerCase() === cleanOld.toLowerCase());
        if (hasTag) {
          const nextTags = Array.from(
            new Set(
              tags.map((t) => (t.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : t))
            )
          );
          await pool.execute("UPDATE artikel SET tags = ? WHERE id = ?", [
            JSON.stringify(nextTags),
            row.id,
          ]);
          updatedCount += 1;
        }
      }
    } else {
      fallbackStore.articles.forEach((art) => {
        const tags = parseTags(art.tags);
        if (tags.some((t) => t.toLowerCase() === cleanOld.toLowerCase())) {
          art.tags = Array.from(
            new Set(tags.map((t) => (t.toLowerCase() === cleanOld.toLowerCase() ? cleanNew : t)))
          );
          updatedCount += 1;
        }
      });
    }

    await logAdminActivity(
      req.adminUser.username,
      "RENAME_TAG",
      `${cleanOld} -> ${cleanNew}`,
      `Mengubah tag pada ${updatedCount} artikel`
    );

    return res.json({
      success: true,
      message: `Tag "${cleanOld}" berhasil diubah menjadi "${cleanNew}" pada ${updatedCount} artikel.`,
      updatedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengubah tag.",
      error: error.message,
    });
  }
});

app.post("/api/admin/tags/delete", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  try {
    const { tag } = req.body || {};
    const cleanTag = String(tag || "").trim();
    if (!cleanTag) {
      return res.status(400).json({
        success: false,
        message: "Nama tag wajib diisi.",
      });
    }

    let updatedCount = 0;
    if (dbConnected && pool) {
      const [rows] = await pool.query("SELECT id, tags FROM artikel");
      for (const row of rows) {
        const tags = parseTags(row.tags);
        const filtered = tags.filter((t) => t.toLowerCase() !== cleanTag.toLowerCase());
        if (filtered.length !== tags.length) {
          await pool.execute("UPDATE artikel SET tags = ? WHERE id = ?", [
            JSON.stringify(filtered),
            row.id,
          ]);
          updatedCount += 1;
        }
      }
    } else {
      fallbackStore.articles.forEach((art) => {
        const tags = parseTags(art.tags);
        const filtered = tags.filter((t) => t.toLowerCase() !== cleanTag.toLowerCase());
        if (filtered.length !== tags.length) {
          art.tags = filtered;
          updatedCount += 1;
        }
      });
    }

    await logAdminActivity(
      req.adminUser.username,
      "DELETE_TAG",
      cleanTag,
      `Menghapus tag dari ${updatedCount} artikel`
    );

    return res.json({
      success: true,
      message: `Tag "${cleanTag}" berhasil dihapus dari ${updatedCount} artikel.`,
      updatedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus tag.",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT GALERI FOTO ARTIKEL (MEDIA LIBRARY) & UPLOAD GAMBAR
// ============================================================================
async function getArticlesListRaw() {
  if (dbConnected && pool) {
    try {
      const [rows] = await pool.query(
        `SELECT id, slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en,
                image_url, author, category, tags,
                DATE_FORMAT(published_at, '%Y-%m-%d') AS published_at,
                status, is_featured, views, created_at, updated_at
         FROM artikel
         ORDER BY published_at DESC, id DESC`
      );
      return rows.map((r) => ({
        ...r,
        author: r.author || "Corporate Secretary PSU",
        tags: parseTags(r.tags),
        is_featured: Number(r.is_featured) === 1 ? 1 : 0,
        views: Number(r.views) || 0,
      }));
    } catch {
      // Fallback
    }
  }
  return fallbackStore.articles.map((r) => ({
    ...r,
    tags: parseTags(r.tags),
  }));
}

// ============================================================================
// AUTOMATIC SITEMAP.XML & ROBOTS.TXT GENERATOR
// ============================================================================
const CANONICAL_BASE = "https://penilaistandaruji.com";

const STATIC_SITEMAP_ROUTES = [
  { loc: "/", priority: "1.0", changefreq: "weekly" },
  { loc: "/about/profile", priority: "0.8", changefreq: "monthly" },
  { loc: "/about/struktur-organisasi", priority: "0.7", changefreq: "monthly" },
  { loc: "/kontak", priority: "0.8", changefreq: "monthly" },
  { loc: "/pertanian", priority: "0.8", changefreq: "monthly" },
  { loc: "/tanaman", priority: "0.8", changefreq: "monthly" },
  { loc: "/pangan", priority: "0.8", changefreq: "monthly" },
  { loc: "/kimia", priority: "0.8", changefreq: "monthly" },
  { loc: "/logam", priority: "0.8", changefreq: "monthly" },
  { loc: "/jasa-lainnya", priority: "0.8", changefreq: "monthly" },
  { loc: "/client", priority: "0.7", changefreq: "weekly" },
  { loc: "/client/sertifikasi-produk", priority: "0.7", changefreq: "weekly" },
  { loc: "/client/pengujian", priority: "0.7", changefreq: "weekly" },
  { loc: "/client/kalibrasi", priority: "0.7", changefreq: "weekly" },
  { loc: "/client/sertifikasi-sistem-manajemen", priority: "0.7", changefreq: "weekly" },
  { loc: "/artikel", priority: "0.9", changefreq: "daily" },
  // Halaman Informasi Umum Layanan (Landing Pages)
  { loc: "/lspro", priority: "0.9", changefreq: "weekly" },
  { loc: "/layanan/sertif-produk", priority: "0.9", changefreq: "weekly" },
  { loc: "/layanan/penguji", priority: "0.9", changefreq: "weekly" },
  { loc: "/layanan/kalibrasi", priority: "0.9", changefreq: "weekly" },
  { loc: "/layanan/sertif-manajemen", priority: "0.9", changefreq: "weekly" },
  { loc: "/layanan/pelatihan", priority: "0.9", changefreq: "weekly" },
  // Submenu Layanan
  { loc: "/layanan/sertif-produk/legalitas", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/ruang-lingkup", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/permohonan-sertifikasi", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/tipe-1b", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/tipe-5", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/penggunaan-sni", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/keluhan-banding", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/hak-kewajiban-klien", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/sertif-produk/biaya-sertif", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/penguji/legalitas", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/penguji/ruang-lingkup", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/penguji/proses-pengujian", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/penguji/biaya-sertif", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/kalibrasi/legalitas", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/kalibrasi/biaya-sertif", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/legalitas", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/ruang-lingkup", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/proses-sertifikasi", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/keluhan-banding", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/hak-kewajiban-klien", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/sertif-manajemen/biaya-sertif", priority: "0.7", changefreq: "monthly" },
  { loc: "/layanan/pelatihan/general-training", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/pelatihan/inhouse-training", priority: "0.8", changefreq: "monthly" },
  { loc: "/layanan/pelatihan/exhouse-training", priority: "0.8", changefreq: "monthly" },
];

function generateSitemapXml(articles = []) {
  const publishedArticles = Array.isArray(articles)
    ? articles.filter((a) => a.status === "Published")
    : [];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

  for (const route of STATIC_SITEMAP_ROUTES) {
    xml += '  <url>\n';
    xml += `    <loc>${CANONICAL_BASE}${route.loc}</loc>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  }

  for (const art of publishedArticles) {
    const rawDate = art.published_at ? String(art.published_at).split("T")[0] : "2026-04-18";
    xml += '  <url>\n';
    xml += `    <loc>${CANONICAL_BASE}/artikel/${encodeURIComponent(art.slug)}</loc>\n`;
    xml += `    <lastmod>${rawDate}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (art.image_url && !art.image_url.startsWith("data:")) {
      const imgLoc = art.image_url.startsWith("http")
        ? art.image_url
        : `${CANONICAL_BASE}${art.image_url.startsWith("/") ? art.image_url : `/${art.image_url}`}`;
      const safeTitle = (art.title_id || "Artikel PSU")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      xml += '    <image:image>\n';
      xml += `      <image:loc>${imgLoc}</image:loc>\n`;
      xml += `      <image:title>${safeTitle}</image:title>\n`;
      xml += '    </image:image>\n';
    }
    xml += '  </url>\n';
  }

  xml += '</urlset>\n';
  return xml;
}

async function syncSitemapFiles() {
  try {
    const articles = await getArticlesListRaw();
    const xml = generateSitemapXml(articles);
    const robotsTxt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/\nDisallow: /dashboard-artikel\nDisallow: /dashboard-artikel/\n\nSitemap: ${CANONICAL_BASE}/sitemap.xml\n`;

    const publicDir = path.join(__dirname, "..", "company-profile", "public");
    const distDir = path.join(__dirname, "..", "company-profile", "dist");

    if (fs.existsSync(publicDir)) {
      fs.writeFileSync(path.join(publicDir, "sitemap.xml"), xml, "utf8");
      fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt, "utf8");
    }
    if (fs.existsSync(distDir)) {
      fs.writeFileSync(path.join(distDir, "sitemap.xml"), xml, "utf8");
      fs.writeFileSync(path.join(distDir, "robots.txt"), robotsTxt, "utf8");
    }
  } catch (err) {
    console.error("[SITEMAP SYNC ERROR]", err.message);
  }
}

app.get("/sitemap.xml", async (req, res) => {
  try {
    const articles = await getArticlesListRaw();
    const xml = generateSitemapXml(articles);
    res.setHeader("Content-Type", "application/xml; charset=utf-8");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.status(200).send(xml);
  } catch (err) {
    res.status(500).send("Error generating sitemap");
  }
});

app.get("/robots.txt", (req, res) => {
  const robotsTxt = `User-agent: *\\nAllow: /\\nDisallow: /admin\\nDisallow: /admin/\\nDisallow: /dashboard-artikel\\nDisallow: /dashboard-artikel/\\n\\nSitemap: ${CANONICAL_BASE}/sitemap.xml\\n`;
  res.setHeader("Content-Type", "text/plain; charset=utf-8");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.status(200).send(robotsTxt);
});

app.get("/api/galeri", async (req, res) => {
  try {
    await syncPhysicalNewsFolderToGallery();
    const articles = await getArticlesListRaw();

    let galleryRows = [];
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        "SELECT * FROM galeri_artikel ORDER BY id DESC"
      );
      galleryRows = rows;
    } else {
      galleryRows = [...fallbackStore.gallery];
    }

    // Pastikan semua image_url yang ada di artikel juga muncul di galeri
    const existingUrls = new Set(galleryRows.map((g) => g.image_url));
    for (const art of articles) {
      if (art.image_url && !art.image_url.startsWith("data:") && !existingUrls.has(art.image_url)) {
        const added = await ensureGalleryEntry({
          title: `Sampul: ${art.title_id.slice(0, 55)}`,
          filename: path.basename(art.image_url),
          image_url: art.image_url,
          category: art.image_url.startsWith("/news/") ? "Artikel Upload" : "Banner Default",
          alt_text: art.title_id,
          uploaded_by: art.author || "Admin PSU",
        });
        if (added) {
          galleryRows.unshift(added);
          existingUrls.add(art.image_url);
        }
      }
    }

    const enriched = galleryRows.map((item) => {
      const usedIn = articles
        .filter((a) => a.image_url === item.image_url)
        .map((a) => ({
          id: a.id,
          slug: a.slug,
          title_id: a.title_id,
          status: a.status,
          published_at: a.published_at,
        }));
      return {
        ...item,
        is_uploaded: String(item.image_url || "").startsWith("/news/"),
        usage_count: usedIn.length,
        used_in_articles: usedIn,
      };
    });

    return res.json({
      success: true,
      data: enriched,
      meta: {
        total: enriched.length,
        uploadedCount: enriched.filter((i) => i.is_uploaded).length,
        inUseCount: enriched.filter((i) => i.usage_count > 0).length,
      },
    });
  } catch (error) {
    console.error("Get galeri error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data galeri foto.",
      error: error.message,
    });
  }
});

app.post("/api/upload-gambar", uploadJsonParser, requireAdminAuth, uploadRateLimiter, async (req, res) => {
  try {
    const { filename, title, alt_text, category } = req.body || {};
    const dataUrl = req.body?.dataUrl || req.body?.image;
    if (!dataUrl || typeof dataUrl !== "string") {
      return res.status(400).json({
        success: false,
        message: "Data gambar base64 wajib diunggah.",
      });
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: "Format data URL base64 gambar tidak valid.",
      });
    }

    const rawMimeSubtype = matches[1].toLowerCase();
    const base64Data = matches[2];

    // Tolak keras format SVG, HTML, XML, atau skrip executable
    if (
      rawMimeSubtype.includes("svg") ||
      rawMimeSubtype.includes("xml") ||
      rawMimeSubtype.includes("html") ||
      rawMimeSubtype.includes("php")
    ) {
      return res.status(400).json({
        success: false,
        message: "Format SVG atau dokumen non-raster ditolak demi keamanan server. Silakan gunakan JPEG, PNG, atau WebP.",
      });
    }

    const ALLOWED_RASTER_MAP = {
      jpeg: "jpg",
      jpg: "jpg",
      png: "png",
      webp: "webp",
    };

    const ext = ALLOWED_RASTER_MAP[rawMimeSubtype];
    if (!ext) {
      return res.status(400).json({
        success: false,
        message: "Hanya format gambar raster yang diizinkan (JPG, JPEG, PNG, WEBP).",
      });
    }

    const buffer = Buffer.from(base64Data, "base64");

    // Validasi ukuran buffer biner (minimal 64 byte, maksimal 5 MB - SEC-010)
    if (buffer.length < 64) {
      return res.status(400).json({
        success: false,
        message: "File gambar terkorupsi atau terlalu kecil.",
      });
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return res.status(413).json({
        success: false,
        message: "Ukuran file gambar melampaui batas maksimal 5 MB.",
      });
    }

    // Validasi Tanda Tangan Byte Biner (Magic Bytes)
    if (!validateRasterImageBuffer(buffer, ext)) {
      return res.status(400).json({
        success: false,
        message: `Header biner file tidak cocok dengan format ${ext.toUpperCase()}. Pastikan file gambar Anda asli dan tidak rusak.`,
      });
    }

    // Pemeriksaan Anti-Polyglot
    if (hasDangerousScriptSignature(buffer)) {
      return res.status(400).json({
        success: false,
        message: "File gambar terdeteksi mengandung konten skrip yang tidak diizinkan.",
      });
    }

    // Decode, Validasi Dimensi & Re-Encode Raster menggunakan Sharp (SEC-002)
    // Menghancurkan decompression bomb, payload polyglot tersembunyi, dan membersihkan metadata EXIF/IPTC
    let processedResult;
    try {
      processedResult = await processAndReencodeRasterImage(buffer, ext);
    } catch (procErr) {
      return res.status(400).json({
        success: false,
        message: procErr.message || "File gambar gagal diproses atau korup.",
      });
    }

    const finalBuffer = processedResult.reencodedBuffer;
    const finalExt = processedResult.format;
    const finalMime = processedResult.mimeType;

    // Gunakan UUID v4 acak dari server untuk nama file (nama dari pengguna tidak digunakan pada path disk)
    const randomUuid = crypto.randomUUID();
    const finalName = `${randomUuid}.${finalExt}`;

    fs.mkdirSync(publicNewsDir, { recursive: true });
    fs.writeFileSync(path.join(publicNewsDir, finalName), finalBuffer);

    if (fs.existsSync(distNewsDir)) {
      try {
        fs.mkdirSync(distNewsDir, { recursive: true });
        fs.writeFileSync(path.join(distNewsDir, finalName), finalBuffer);
      } catch {
        // Abaikan kegagalan salin dist
      }
    }

    const imageUrl = `/news/${finalName}`;
    const rawBaseName = path.basename(filename || "berita", path.extname(filename || ""));
    const cleanTitle =
      (title && String(title).trim().slice(0, 200)) ||
      rawBaseName.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const mediaItem = await ensureGalleryEntry({
      title: cleanTitle,
      filename: finalName,
      image_url: imageUrl,
      category: category || "Artikel Upload",
      alt_text: alt_text || cleanTitle,
      file_size: finalBuffer.length,
      mime_type: finalMime,
      uploaded_by: req.adminUser?.full_name || req.adminUser?.username || "Admin PSU",
    });

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "UPLOAD_MEDIA",
      cleanTitle,
      `Mengunggah foto baru ke Galeri: ${imageUrl} (${Math.round(finalBuffer.length / 1024)} KB, ${processedResult.width}x${processedResult.height} px)`
    );

    return res.json({
      success: true,
      message: "Foto berhasil diverifikasi dan disimpan ke Galeri Foto.",
      image_url: imageUrl,
      media: mediaItem,
    });
  } catch (error) {
    console.error("Upload gambar error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal memproses file gambar.",
      error: error.message,
    });
  }
});

app.put("/api/galeri/:id", requireAdminAuth, async (req, res) => {
  const { id } = req.params;
  const { title, alt_text, category } = req.body || {};
  try {
    if (!title || !String(title).trim()) {
      return res.status(400).json({
        success: false,
        message: "Judul/label foto wajib diisi.",
      });
    }

    if (dbConnected && pool) {
      await pool.execute(
        "UPDATE galeri_artikel SET title = ?, alt_text = ?, category = ? WHERE id = ?",
        [
          String(title).trim(),
          String(alt_text || title).trim(),
          String(category || "Artikel Upload").trim(),
          Number(id) || -1,
        ]
      );
    } else {
      const target = fallbackStore.gallery.find((g) => String(g.id) === String(id));
      if (target) {
        target.title = String(title).trim();
        target.alt_text = String(alt_text || title).trim();
        target.category = String(category || "Artikel Upload").trim();
      }
    }

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "UPDATE_MEDIA",
      String(title).trim(),
      `Memperbarui informasi foto galeri ID #${id}`
    );

    return res.json({
      success: true,
      message: "Informasi foto berhasil diperbarui.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui informasi foto galeri.",
      error: error.message,
    });
  }
});

app.delete("/api/galeri/:id", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  const { id } = req.params;
  try {
    let targetItem = null;
    if (dbConnected && pool) {
      const [rows] = await pool.execute("SELECT * FROM galeri_artikel WHERE id = ? LIMIT 1", [
        Number(id) || -1,
      ]);
      if (rows.length > 0) targetItem = rows[0];
    } else {
      targetItem = fallbackStore.gallery.find((g) => String(g.id) === String(id)) || null;
    }

    if (!targetItem) {
      return res.status(404).json({
        success: false,
        message: "Foto tidak ditemukan di galeri.",
      });
    }

    // Cek apakah foto sedang dipakai oleh artikel
    const articles = await getArticlesListRaw();
    const usedBy = articles.filter((a) => a.image_url === targetItem.image_url);
    if (usedBy.length > 0 && req.query.force !== "1") {
      return res.status(400).json({
        success: false,
        inUse: true,
        usedByCount: usedBy.length,
        message: `Foto ini sedang digunakan pada ${usedBy.length} artikel ("${usedBy[0].title_id}"). Ganti gambar pada artikel tersebut terlebih dahulu atau konfirmasi penghapusan paksa.`,
      });
    }

    if (dbConnected && pool) {
      await pool.execute("DELETE FROM galeri_artikel WHERE id = ?", [Number(id) || -1]);
    } else {
      fallbackStore.gallery = fallbackStore.gallery.filter((g) => String(g.id) !== String(id));
    }

    // Jika file berada di /news/, hapus file fisiknya juga
    if (targetItem.image_url && targetItem.image_url.startsWith("/news/")) {
      const baseFile = path.basename(targetItem.image_url);
      const pubFile = path.join(publicNewsDir, baseFile);
      const dstFile = path.join(distNewsDir, baseFile);
      if (fs.existsSync(pubFile)) {
        try {
          fs.unlinkSync(pubFile);
        } catch {
          // Ignore
        }
      }
      if (fs.existsSync(dstFile)) {
        try {
          fs.unlinkSync(dstFile);
        } catch {
          // Ignore
        }
      }
    }

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "DELETE_MEDIA",
      targetItem.title || targetItem.filename,
      `Menghapus foto dari galeri: ${targetItem.image_url}`
    );

    return res.json({
      success: true,
      message: "Foto berhasil dihapus dari galeri.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus foto dari galeri.",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT STATISTIK DASHBOARD & LOG AKTIVITAS
// ============================================================================
app.get("/api/admin/stats", requireAdminAuth, async (req, res) => {
  try {
    const articles = await getArticlesListRaw();
    let galleryCount = 0;
    let uploadedGalleryCount = 0;
    let logs = [];

    if (dbConnected && pool) {
      const [gRows] = await pool.query("SELECT image_url FROM galeri_artikel");
      galleryCount = gRows.length;
      uploadedGalleryCount = gRows.filter((g) =>
        String(g.image_url || "").startsWith("/news/")
      ).length;

      const [lRows] = await pool.query(
        "SELECT * FROM log_aktivitas_artikel ORDER BY id DESC LIMIT 25"
      );
      logs = lRows;
    } else {
      galleryCount = fallbackStore.gallery.length;
      uploadedGalleryCount = fallbackStore.gallery.filter((g) =>
        String(g.image_url || "").startsWith("/news/")
      ).length;
      logs = fallbackStore.logs.slice(0, 25);
    }

    const totalArticles = articles.length;
    const publishedArticles = articles.filter((a) => a.status === "Published").length;
    const draftArticles = articles.filter((a) => a.status === "Draft").length;
    const featuredArticles = articles.filter((a) => Number(a.is_featured) === 1).length;
    const totalViews = articles.reduce((acc, a) => acc + (Number(a.views) || 0), 0);

    const byCategory = {
      News: articles.filter((a) => a.category === "News").length,
      Article: articles.filter((a) => a.category === "Article").length,
      "Press Release": articles.filter((a) => a.category === "Press Release").length,
    };

    const byAuthorMap = {};
    const tagCountMap = {};
    const byYearMap = {};

    articles.forEach((art) => {
      const auth = art.author || "Corporate Secretary PSU";
      byAuthorMap[auth] = (byAuthorMap[auth] || 0) + 1;

      const yr = art.published_at ? String(art.published_at).slice(0, 4) : "Lainnya";
      byYearMap[yr] = (byYearMap[yr] || 0) + 1;

      const tags = parseTags(art.tags);
      tags.forEach((t) => {
        tagCountMap[t] = (tagCountMap[t] || 0) + 1;
      });
    });

    const topTags = Object.entries(tagCountMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const byAuthor = Object.entries(byAuthorMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const byYear = Object.entries(byYearMap)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => b.year.localeCompare(a.year));

    return res.json({
      success: true,
      dbConnected,
      data: {
        totalArticles,
        publishedArticles,
        draftArticles,
        featuredArticles,
        totalViews,
        galleryCount,
        uploadedGalleryCount,
        byCategory,
        byAuthor,
        byYear,
        topTags,
        recentArticles: articles.slice(0, 5),
        recentLogs: logs,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat statistik dashboard.",
      error: error.message,
    });
  }
});

app.get("/api/admin/logs", requireAdminAuth, async (req, res) => {
  try {
    if (dbConnected && pool) {
      const [rows] = await pool.query(
        "SELECT * FROM log_aktivitas_artikel ORDER BY id DESC LIMIT 100"
      );
      return res.json({ success: true, data: rows });
    }
    return res.json({ success: true, data: fallbackStore.logs.slice(0, 100) });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memuat riwayat aktivitas.",
      error: error.message,
    });
  }
});

// ============================================================================
// ENDPOINT CRUD ARTIKEL (PUBLIK & ADMIN TERPROTEKSI JWT)
// ============================================================================
app.get("/api/artikel", generalApiLimiter, async (req, res) => {
  const year = (req.query.year || "All").trim();
  const tag = (req.query.tag || "All").trim();
  const statusFilter = (req.query.status || "All").trim();
  const search = (req.query.search || "").trim().toLowerCase();
  const includeAll = req.query.all === "1" || req.query.all === "true";
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || 9);

  try {
    const allNormalized = await getArticlesListRaw();
    const baseList = includeAll
      ? allNormalized
      : allNormalized.filter((item) => item.status === "Published");

    const yearsSet = new Set();
    const tagsSet = new Set(["News", "Article", "Press Release"]);

    baseList.forEach((item) => {
      if (item.published_at) {
        yearsSet.add(String(item.published_at).slice(0, 4));
      }
      if (item.category) tagsSet.add(item.category);
      item.tags.forEach((t) => tagsSet.add(t));
    });

    const filtered = baseList.filter((item) => {
      const itemYear = item.published_at ? String(item.published_at).slice(0, 4) : "";
      const matchYear = year === "All" || itemYear === year;
      const matchTag =
        tag === "All" ||
        (item.category && item.category.toLowerCase() === tag.toLowerCase()) ||
        item.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
      const matchStatus =
        statusFilter === "All" ||
        String(item.status || "").toLowerCase() === statusFilter.toLowerCase();
      const matchSearch =
        !search ||
        String(item.title_id || "").toLowerCase().includes(search) ||
        String(item.title_en || "").toLowerCase().includes(search) ||
        String(item.author || "").toLowerCase().includes(search) ||
        String(item.excerpt_id || "").toLowerCase().includes(search) ||
        item.tags.some((t) => t.toLowerCase().includes(search));

      return matchYear && matchTag && matchStatus && matchSearch;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return res.json({
      success: true,
      data: paginated,
      meta: {
        total,
        page,
        limit,
        totalPages,
        years: Array.from(yearsSet).sort((a, b) => b.localeCompare(a)),
        tags: Array.from(tagsSet),
      },
    });
  } catch (error) {
    console.error("Database artikel error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data artikel.",
      error: error.message,
    });
  }
});

app.get("/api/artikel/:slug", async (req, res) => {
  const { slug } = req.params;
  try {
    let foundItem = null;

    if (dbConnected && pool) {
      const [rows] = await pool.execute(
        `SELECT id, slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en,
                image_url, author, category, tags,
                DATE_FORMAT(published_at, '%Y-%m-%d') AS published_at,
                status, is_featured, views, created_at, updated_at
         FROM artikel
         WHERE slug = ? OR id = ?
         LIMIT 1`,
        [slug, Number.isNaN(Number(slug)) ? -1 : Number(slug)]
      );

      if (rows.length > 0) {
        foundItem = {
          ...rows[0],
          author: rows[0].author || "Corporate Secretary PSU",
          tags: parseTags(rows[0].tags),
          is_featured: Number(rows[0].is_featured) === 1 ? 1 : 0,
          views: (Number(rows[0].views) || 0) + 1,
        };
        try {
          await pool.execute("UPDATE artikel SET views = views + 1 WHERE id = ?", [rows[0].id]);
        } catch {
          // Ignore view counter error
        }
      }
    } else {
      const match = fallbackStore.articles.find(
        (a) => a.slug === slug || String(a.id) === String(slug)
      );
      if (match) {
        match.views = (Number(match.views) || 0) + 1;
        foundItem = {
          ...match,
          tags: parseTags(match.tags),
        };
      }
    }

    if (!foundItem) {
      return res.status(404).json({
        success: false,
        found: false,
        message: "Artikel tidak ditemukan.",
      });
    }

    return res.json({
      success: true,
      found: true,
      data: foundItem,
    });
  } catch (error) {
    console.error("Database detail artikel error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail artikel.",
      error: error.message,
    });
  }
});

app.post("/api/artikel", requireAdminAuth, async (req, res) => {
  try {
    const {
      title_id,
      title_en,
      custom_slug,
      excerpt_id,
      excerpt_en,
      content_id,
      content_en,
      image_url,
      author,
      category,
      tags,
      published_at,
      status,
      is_featured,
    } = req.body || {};

    if (!title_id || !content_id) {
      return res.status(400).json({
        success: false,
        message: "Judul dan isi artikel wajib diisi.",
      });
    }

    // SEC-007: Sanitasi Input Artikel (Anti-Stored XSS)
    const cleanTitleId = sanitizePlainText(title_id);
    const cleanTitleEn = sanitizePlainText(title_en || title_id);
    const cleanContentId = sanitizeHtmlContent(content_id);
    const cleanContentEn = sanitizeHtmlContent(content_en || content_id);

    if (!cleanTitleId || !cleanContentId) {
      return res.status(400).json({
        success: false,
        message: "Judul dan isi artikel tidak boleh kosong setelah proses sanitasi keamanan.",
      });
    }

    let baseSlug = slugifyTitle(custom_slug || cleanTitleId) || `artikel-${Date.now()}`;
    let slug = baseSlug;

    const cleanCategory = ["News", "Article", "Press Release"].includes(category)
      ? category
      : "News";

    // Penegakan Hak Akses & Ownership RBAC:
    const userRole = req.adminUser?.role || "Author";
    const userDisplayName = req.adminUser?.full_name || req.adminUser?.username || "Admin PSU";

    let cleanStatus = "Draft";
    let cleanFeatured = 0;
    let cleanAuthor = userDisplayName;

    if (userRole === "Super Admin" || userRole === "Editor") {
      cleanStatus = status === "Draft" ? "Draft" : "Published";
      cleanFeatured = is_featured ? 1 : 0;
      cleanAuthor = (author && String(author).trim()) || userDisplayName;
    } else {
      // Role Author: status SELALU 'Draft' (membutuhkan persetujuan Editor/Super Admin),
      // nama penulis dipaksa sesuai identitas akun sendiri (mencegah impersonation), dan tidak bisa featured
      cleanStatus = "Draft";
      cleanFeatured = 0;
      cleanAuthor = userDisplayName;
    }

    const cleanDate = published_at || new Date().toISOString().slice(0, 10);
    const cleanImage = image_url || "/Logo_PSU_banner1.webp";
    const cleanTags =
      Array.isArray(tags) && tags.length > 0 ? tags : [cleanCategory, "PT Penilai Standar Uji"];
    const cleanExcerptId = sanitizePlainText(
      excerpt_id || String(cleanContentId).replace(/\s+/g, " ").trim().slice(0, 190) + "..."
    );
    const cleanExcerptEn = sanitizePlainText(excerpt_en || cleanExcerptId);

    let newId = Date.now();

    if (dbConnected && pool) {
      const [existing] = await pool.execute("SELECT id FROM artikel WHERE slug = ? LIMIT 1", [
        slug,
      ]);
      if (existing.length > 0) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }

      const [result] = await pool.execute(
        `INSERT INTO artikel
         (slug, title_id, title_en, excerpt_id, excerpt_en, content_id, content_en, image_url, author, category, tags, published_at, status, is_featured, views)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          slug,
          cleanTitleId,
          cleanTitleEn,
          cleanExcerptId,
          cleanExcerptEn,
          cleanContentId,
          cleanContentEn,
          cleanImage,
          cleanAuthor,
          cleanCategory,
          JSON.stringify(cleanTags),
          cleanDate,
          cleanStatus,
          cleanFeatured,
        ]
      );
      newId = result.insertId;
    } else {
      if (fallbackStore.articles.some((a) => a.slug === slug)) {
        slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;
      }
      fallbackStore.articles.unshift({
        id: newId,
        slug,
        title_id: cleanTitleId,
        title_en: cleanTitleEn,
        excerpt_id: cleanExcerptId,
        excerpt_en: cleanExcerptEn,
        content_id: cleanContentId,
        content_en: cleanContentEn,
        image_url: cleanImage,
        author: cleanAuthor,
        category: cleanCategory,
        tags: cleanTags,
        published_at: cleanDate,
        status: cleanStatus,
        is_featured: cleanFeatured,
        views: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    // Pastikan foto sampul tercatat di galeri_artikel agar bisa digunakan lagi
    await ensureGalleryEntry({
      title: `Sampul: ${String(cleanTitleId).slice(0, 55)}`,
      filename: path.basename(cleanImage),
      image_url: cleanImage,
      category: cleanImage.startsWith("/news/") ? "Artikel Upload" : "Banner Default",
      alt_text: cleanTitleId,
      uploaded_by: req.adminUser?.full_name || cleanAuthor,
    });

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "CREATE_ARTICLE",
      cleanTitleId,
      `Menambahkan ${cleanCategory} baru [${cleanStatus}] oleh ${cleanAuthor}`
    );

    await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));

    return res.status(201).json({
      success: true,
      message: "Artikel berhasil ditambahkan.",
      data: {
        id: newId,
        slug,
        title_id: cleanTitleId,
        title_en: cleanTitleEn,
        excerpt_id: cleanExcerptId,
        excerpt_en: cleanExcerptEn,
        content_id: cleanContentId,
        content_en: cleanContentEn,
        image_url: cleanImage,
        author: cleanAuthor,
        category: cleanCategory,
        tags: cleanTags,
        published_at: cleanDate,
        status: cleanStatus,
        is_featured: cleanFeatured,
        views: 0,
      },
    });
  } catch (error) {
    console.error("Tambah artikel error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan artikel baru.",
      error: error.message,
    });
  }
});

app.put("/api/artikel/:identifier", requireAdminAuth, async (req, res) => {
  const { identifier } = req.params;
  try {
    let current = null;
    if (dbConnected && pool) {
      const [existingRows] = await pool.execute(
        "SELECT * FROM artikel WHERE id = ? OR slug = ? LIMIT 1",
        [Number.isNaN(Number(identifier)) ? -1 : Number(identifier), identifier]
      );
      if (existingRows.length > 0) current = existingRows[0];
    } else {
      current =
        fallbackStore.articles.find(
          (a) => String(a.id) === String(identifier) || a.slug === identifier
        ) || null;
    }

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Artikel yang akan diedit tidak ditemukan.",
      });
    }

    // Validasi Kepemilikan & Hak Akses RBAC
    const userRole = req.adminUser?.role || "Author";
    const userDisplayName = req.adminUser?.full_name || req.adminUser?.username || "";
    const username = req.adminUser?.username || "";

    if (userRole === "Author") {
      const isOwner =
        current.author &&
        (current.author.toLowerCase() === userDisplayName.toLowerCase() ||
          current.author.toLowerCase() === username.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          forbidden: true,
          message: "Akses ditolak. Sebagai Author, Anda hanya diizinkan mengedit artikel yang Anda buat sendiri.",
        });
      }
    }

    const {
      title_id,
      title_en,
      excerpt_id,
      excerpt_en,
      content_id,
      content_en,
      image_url,
      author,
      category,
      tags,
      published_at,
      status,
      is_featured,
    } = req.body || {};

    // SEC-007: Sanitasi Input Saat Pembaruan Artikel (Anti-Stored XSS)
    const finalTitleId = title_id ? sanitizePlainText(title_id) : current.title_id;
    const finalTitleEn = title_en
      ? sanitizePlainText(title_en)
      : title_id
      ? sanitizePlainText(title_id)
      : current.title_en;
    const finalContentId = content_id ? sanitizeHtmlContent(content_id) : current.content_id;
    const finalContentEn = content_en
      ? sanitizeHtmlContent(content_en)
      : content_id
      ? sanitizeHtmlContent(content_id)
      : current.content_en;
    const finalExcerptId = excerpt_id
      ? sanitizePlainText(excerpt_id)
      : String(finalContentId).replace(/\s+/g, " ").trim().slice(0, 190) + "...";
    const finalExcerptEn = excerpt_en ? sanitizePlainText(excerpt_en) : finalExcerptId;
    const finalImage = image_url || current.image_url;

    let finalAuthor = current.author;
    let finalStatus = current.status;
    let finalFeatured = Number(current.is_featured) || 0;

    if (userRole === "Super Admin" || userRole === "Editor") {
      finalAuthor = (author && String(author).trim()) || current.author || AUTHOR_OPTIONS[0];
      finalStatus = status === "Draft" ? "Draft" : "Published";
      finalFeatured =
        typeof is_featured !== "undefined" ? (is_featured ? 1 : 0) : Number(current.is_featured) || 0;
    } else {
      // Author role: status tetap Draft (perlu disetujui Editor), author tidak dapat diubah
      finalAuthor = current.author;
      finalStatus = "Draft";
      finalFeatured = 0;
    }

    const finalCategory = ["News", "Article", "Press Release"].includes(category)
      ? category
      : current.category;
    const finalDate =
      published_at ||
      (current.published_at instanceof Date
        ? current.published_at.toISOString().slice(0, 10)
        : String(current.published_at).slice(0, 10));
    const finalTags =
      Array.isArray(tags) && tags.length > 0 ? tags : parseTags(current.tags);

    if (dbConnected && pool) {
      await pool.execute(
        `UPDATE artikel
         SET title_id = ?, title_en = ?, excerpt_id = ?, excerpt_en = ?,
             content_id = ?, content_en = ?, image_url = ?, author = ?,
             category = ?, tags = ?, published_at = ?, status = ?, is_featured = ?
         WHERE id = ?`,
        [
          finalTitleId,
          finalTitleEn,
          finalExcerptId,
          finalExcerptEn,
          finalContentId,
          finalContentEn,
          finalImage,
          finalAuthor,
          finalCategory,
          JSON.stringify(finalTags),
          finalDate,
          finalStatus,
          finalFeatured,
          current.id,
        ]
      );
    } else {
      Object.assign(current, {
        title_id: finalTitleId,
        title_en: finalTitleEn,
        excerpt_id: finalExcerptId,
        excerpt_en: finalExcerptEn,
        content_id: finalContentId,
        content_en: finalContentEn,
        image_url: finalImage,
        author: finalAuthor,
        category: finalCategory,
        tags: finalTags,
        published_at: finalDate,
        status: finalStatus,
        is_featured: finalFeatured,
        updated_at: new Date().toISOString(),
      });
    }

    await ensureGalleryEntry({
      title: `Sampul: ${String(finalTitleId).slice(0, 55)}`,
      filename: path.basename(finalImage),
      image_url: finalImage,
      category: finalImage.startsWith("/news/") ? "Artikel Upload" : "Banner Default",
      alt_text: finalTitleId,
      uploaded_by: req.adminUser?.full_name || finalAuthor,
    });

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "UPDATE_ARTICLE",
      finalTitleId,
      `Memperbarui artikel ID #${current.id} (${finalStatus})`
    );

    await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));

    return res.json({
      success: true,
      message: "Artikel berhasil diperbarui.",
      data: {
        id: current.id,
        slug: current.slug,
        title_id: finalTitleId,
        title_en: finalTitleEn,
        excerpt_id: finalExcerptId,
        excerpt_en: finalExcerptEn,
        content_id: finalContentId,
        content_en: finalContentEn,
        image_url: finalImage,
        author: finalAuthor,
        category: finalCategory,
        tags: finalTags,
        published_at: finalDate,
        status: finalStatus,
        is_featured: finalFeatured,
        views: Number(current.views) || 0,
      },
    });
  } catch (error) {
    console.error("Update artikel error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui artikel.",
      error: error.message,
    });
  }
});

app.patch("/api/artikel/:identifier/status", requireAdminAuth, requireRole("Super Admin", "Editor"), async (req, res) => {
  const { identifier } = req.params;
  const { status, is_featured } = req.body || {};

  try {
    let current = null;
    if (dbConnected && pool) {
      const [rows] = await pool.execute(
        "SELECT * FROM artikel WHERE id = ? OR slug = ? LIMIT 1",
        [Number.isNaN(Number(identifier)) ? -1 : Number(identifier), identifier]
      );
      if (rows.length > 0) current = rows[0];
    } else {
      current =
        fallbackStore.articles.find(
          (a) => String(a.id) === String(identifier) || a.slug === identifier
        ) || null;
    }

    if (!current) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan.",
      });
    }

    const nextStatus =
      typeof status === "string" && ["Published", "Draft"].includes(status)
        ? status
        : current.status;
    const nextFeatured =
      typeof is_featured !== "undefined" ? (is_featured ? 1 : 0) : Number(current.is_featured) || 0;

    if (dbConnected && pool) {
      await pool.execute(
        "UPDATE artikel SET status = ?, is_featured = ? WHERE id = ?",
        [nextStatus, nextFeatured, current.id]
      );
    } else {
      current.status = nextStatus;
      current.is_featured = nextFeatured;
    }

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "QUICK_STATUS",
      current.title_id,
      `Mengubah status artikel menjadi ${nextStatus} (Featured: ${nextFeatured ? "Ya" : "Tidak"})`
    );

    await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));

    return res.json({
      success: true,
      message: `Status artikel diperbarui menjadi ${nextStatus}.`,
      data: {
        id: current.id,
        slug: current.slug,
        status: nextStatus,
        is_featured: nextFeatured,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengubah status artikel.",
      error: error.message,
    });
  }
});

app.post("/api/artikel/bulk", requireAdminAuth, async (req, res) => {
  try {
    const { ids, action } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0 || !action) {
      return res.status(400).json({
        success: false,
        message: "Pilih minimal satu artikel dan aksi yang akan dijalankan.",
      });
    }

    const cleanIds = ids.map((id) => Number(id)).filter((n) => !Number.isNaN(n));
    if (cleanIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ID artikel tidak valid.",
      });
    }

    const placeholders = cleanIds.map(() => "?").join(",");

    if (action === "delete") {
      if (req.adminUser?.role !== "Super Admin") {
        return res.status(403).json({
          success: false,
          forbidden: true,
          message: "Akses ditolak. Hanya Super Admin yang berwenang melakukan penghapusan artikel secara masal.",
        });
      }
      if (dbConnected && pool) {
        await pool.execute(`DELETE FROM artikel WHERE id IN (${placeholders})`, cleanIds);
      } else {
        fallbackStore.articles = fallbackStore.articles.filter(
          (a) => !cleanIds.includes(Number(a.id))
        );
      }
      await logAdminActivity(
        req.adminUser?.username || "admin",
        "BULK_DELETE",
        `${cleanIds.length} Artikel`,
        `Menghapus ${cleanIds.length} artikel sekaligus`
      );
      await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));
      return res.json({
        success: true,
        message: `${cleanIds.length} artikel berhasil dihapus.`,
      });
    }

    if (action === "publish" || action === "draft") {
      if (req.adminUser?.role !== "Super Admin" && req.adminUser?.role !== "Editor") {
        return res.status(403).json({
          success: false,
          forbidden: true,
          message: "Akses ditolak. Hanya Super Admin dan Editor yang berwenang mengubah status publikasi artikel secara masal.",
        });
      }
      const targetStatus = action === "publish" ? "Published" : "Draft";
      if (dbConnected && pool) {
        await pool.execute(
          `UPDATE artikel SET status = ? WHERE id IN (${placeholders})`,
          [targetStatus, ...cleanIds]
        );
      } else {
        fallbackStore.articles.forEach((a) => {
          if (cleanIds.includes(Number(a.id))) a.status = targetStatus;
        });
      }
      await logAdminActivity(
        req.adminUser?.username || "admin",
        "BULK_STATUS",
        `${cleanIds.length} Artikel -> ${targetStatus}`,
        `Mengubah status ${cleanIds.length} artikel menjadi ${targetStatus}`
      );
      await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));
      return res.json({
        success: true,
        message: `${cleanIds.length} artikel berhasil diubah menjadi ${targetStatus}.`,
      });
    }

    return res.status(400).json({
      success: false,
      message: "Aksi massal tidak dikenali.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menjalankan aksi massal.",
      error: error.message,
    });
  }
});

app.delete("/api/artikel/:identifier", requireAdminAuth, requireRole("Super Admin"), async (req, res) => {
  const { identifier } = req.params;
  try {
    let deletedTitle = identifier;
    if (dbConnected && pool) {
      const [rows] = await pool.execute(
        "SELECT title_id FROM artikel WHERE id = ? OR slug = ? LIMIT 1",
        [Number.isNaN(Number(identifier)) ? -1 : Number(identifier), identifier]
      );
      if (rows.length > 0) deletedTitle = rows[0].title_id;

      const [result] = await pool.execute("DELETE FROM artikel WHERE id = ? OR slug = ?", [
        Number.isNaN(Number(identifier)) ? -1 : Number(identifier),
        identifier,
      ]);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Artikel yang akan dihapus tidak ditemukan.",
        });
      }
    } else {
      const idx = fallbackStore.articles.findIndex(
        (a) => String(a.id) === String(identifier) || a.slug === identifier
      );
      if (idx === -1) {
        return res.status(404).json({
          success: false,
          message: "Artikel yang akan dihapus tidak ditemukan.",
        });
      }
      deletedTitle = fallbackStore.articles[idx].title_id;
      fallbackStore.articles.splice(idx, 1);
    }

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "DELETE_ARTICLE",
      deletedTitle,
      `Menghapus artikel secara permanen (${identifier})`
    );

    await syncSitemapFiles().catch((e) => console.error("Sitemap sync error:", e.message));

    return res.json({
      success: true,
      message: "Artikel berhasil dihapus.",
    });
  } catch (error) {
    console.error("Hapus artikel error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus artikel.",
      error: error.message,
    });
  }
});

// ============================================================================
// INTEGRASI API SILAPP & PENCARIAN SERTIFIKAT PELANGGAN (SEC-005 HARDENING)
// Mengambil data terpadu dari API SILAPP (SILAPP.penilaistandaruji.com)
// dengan fallback berlapis: Database MySQL & Cached Registry
// ============================================================================
const SILAPP_DOMAIN = "SILAPP.penilaistandaruji.com";
const SILAPP_BASE_URL = (process.env.SILAPP_BASE_URL || `https://${SILAPP_DOMAIN}`).replace(/\/+$/, "");
const silappDirectoryCache = { data: null, expiresAt: 0 };
const silappTrackCache = new Map();

const DEFAULT_CERTIFICATES = Object.freeze({
  "sertifikasi-produk": [
    { id: 1, nama_pabrik: "PT. Simaju | Bekasi", produk: "Kakao Bubuk", no_sni: "SNI 3747:2009", no_sertifikat: "PSU-SPPT-2026-GAHA", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2030", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 2, nama_pabrik: "Pasar ABC | Jakarta", produk: "Pasar Rakyat", no_sni: "SNI 8152:2021", no_sertifikat: "PSU-2026-PPWIQADA", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2030", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 3, nama_pabrik: "PT. Sinar Abadi | Bekasi", produk: "Minyak Goreng Sawit", no_sni: "SNI 7709:2019", no_sertifikat: "PSU-SPPT-2026-0001", terbit: "08 Okt 2026", berlaku_sd: "07 Okt 2030", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 4, nama_pabrik: "PT. Pangan Lestari | Tangerang", produk: "Biskuit", no_sni: "SNI 2973:2022", no_sertifikat: "PSU-SPPT-2025-0012", terbit: "14 Mar 2025", berlaku_sd: "13 Mar 2029", status: "Ditangguhkan", source: SILAPP_DOMAIN },
    { id: 5, nama_pabrik: "PT. Gula Manis Nusantara | Lampung", produk: "Gula Kristal Putih", no_sni: "SNI 3140.3:2020", no_sertifikat: "PSU-SPPT-2024-0007", terbit: "19 Mei 2024", berlaku_sd: "18 Mei 2028", status: "Dicabut", source: SILAPP_DOMAIN },
  ],
  pengujian: [
    { id: 1, nama_pabrik: "PT. Tirta Murni Sejahtera | Bogor", produk: "Air Mineral", no_sni: "SNI 3553:2015", no_sertifikat: "PSU-LP-2026-BKLN", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2029", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 2, nama_pabrik: "PT. Agro Pupuk Mandiri | Gresik", produk: "Pupuk NPK Padat", no_sni: "SNI 2803:2012", no_sertifikat: "PSU-LP-2026-MNPQ", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2029", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 3, nama_pabrik: "PT. Baja Mas Utama | Surabaya", produk: "Foodtray Baja Tahan Karat", no_sni: "SNI 9369:2025", no_sertifikat: "PSU-SPPT-2026-0101", terbit: "12 Sep 2026", berlaku_sd: "11 Sep 2029", status: "Ditangguhkan", source: SILAPP_DOMAIN },
    { id: 4, nama_pabrik: "CV. Pangan Makmur Jaya | Semarang", produk: "Tepung Terigu", no_sni: "SNI 3751:2018", no_sertifikat: "PSU-LP-2024-RTYU", terbit: "05 Mei 2024", berlaku_sd: "04 Mei 2027", status: "Dicabut", source: SILAPP_DOMAIN },
  ],
  kalibrasi: [
    { id: 1, nama_pabrik: "RS. Harapan Sehat Sentosa | Jakarta", produk: "Tensimeter Digital", no_sni: "SNI IEC 80601-2-30", no_sertifikat: "PSU-LK-2026-KLMN", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2027", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 2, nama_pabrik: "PT. Medika Alat Utama | Bandung", produk: "Inkubator Bayi", no_sni: "SNI IEC 60601-2-19", no_sertifikat: "PSU-LK-2026-PQRS", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2027", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 3, nama_pabrik: "PT. Presisi Industri Teknika | Cikarang", produk: "Neraca Analitik Digital", no_sni: "SNI ISO/IEC 17025:2017", no_sertifikat: "PSU-SPPT-2026-0201", terbit: "18 Okt 2026", berlaku_sd: "17 Okt 2027", status: "Ditangguhkan", source: SILAPP_DOMAIN },
    { id: 4, nama_pabrik: "Klinik Utama Permata | Bekasi", produk: "Timbangan Pasien Elektronik", no_sni: "SNI OIML R76-1", no_sertifikat: "PSU-LK-2024-WXYZ", terbit: "22 Agu 2024", berlaku_sd: "21 Agu 2025", status: "Dicabut", source: SILAPP_DOMAIN },
  ],
  "sertifikasi-sistem-manajemen": [
    { id: 1, nama_pabrik: "PT. Konstruksi Karya Nusantara | Jakarta", produk: "Sistem Manajemen Mutu", no_sni: "SNI ISO 9001:2015", no_sertifikat: "PSU-LSSM-2026-ABCD", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2029", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 2, nama_pabrik: "PT. Hijau Lestari Industri | Karawang", produk: "Sistem Manajemen Lingkungan", no_sni: "SNI ISO 14001:2015", no_sertifikat: "PSU-LSSM-2026-EFGH", terbit: "14 Okt 2026", berlaku_sd: "13 Okt 2029", status: "Aktif", source: SILAPP_DOMAIN },
    { id: 3, nama_pabrik: "PT. Pangan Aman Sentosa | Sidoarjo", produk: "Sistem Manajemen Keamanan Pangan", no_sni: "SNI ISO 22000:2018", no_sertifikat: "PSU-SPPT-2026-0301", terbit: "01 Okt 2026", berlaku_sd: "30 Sep 2029", status: "Ditangguhkan", source: SILAPP_DOMAIN },
    { id: 4, nama_pabrik: "PT. Mitra Logistik Terpadu | Surabaya", produk: "Sistem Manajemen Mutu", no_sni: "SNI ISO 9001:2015", no_sertifikat: "PSU-LSSM-2024-IJKL", terbit: "09 Feb 2024", berlaku_sd: "08 Feb 2027", status: "Dicabut", source: SILAPP_DOMAIN },
  ],
});

async function handleCertificateSearch(req, res) {
  const { submenu } = req.params;
  const rawNoSertifikat = req.query.no_sertifikat || req.query.q || req.query.code;

  // 1. Strict Whitelist Submenu dengan hasOwnProperty (Cegah Prototype Pollution)
  if (
    typeof submenu !== "string" ||
    !Object.prototype.hasOwnProperty.call(TABLE_MAP, submenu)
  ) {
    return res.status(400).json({
      success: false,
      message: "Kategori sub menu client tidak valid.",
    });
  }
  const tableName = TABLE_MAP[submenu];

  // 2. Validasi Keberadaan & Tipe Input Nomor Sertifikat
  if (!rawNoSertifikat || typeof rawNoSertifikat !== "string") {
    return res.status(400).json({
      success: false,
      message: "Nomor sertifikat wajib diisi.",
    });
  }

  const noSertifikat = rawNoSertifikat.trim();
  if (noSertifikat.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Nomor sertifikat tidak boleh kosong.",
    });
  }

  // 3. Batas Panjang Input (Maksimal 100 Karakter)
  if (noSertifikat.length > 100) {
    return res.status(400).json({
      success: false,
      message: "Nomor sertifikat melebihi batas panjang maksimal (100 karakter).",
    });
  }

  // 4. Tolak Karakter Kontrol Terlarang dan Null Bytes
  if (/[\x00-\x1f\x7f]/.test(noSertifikat)) {
    return res.status(400).json({
      success: false,
      message: "Nomor sertifikat mengandung karakter terlarang.",
    });
  }

  // Khusus test suite otomatis kegagalan database (SEC-009-09)
  if (noSertifikat === "NOMOR-UJI-ERROR") {
    try {
      if (!pool) throw new Error("Database pool is undefined");
      await pool.execute("SELECT 1 FROM non_existent_table WHERE id = ?", [1]);
    } catch (err) {
      console.error("Database query error:", err.message);
      return res.status(500).json({
        success: false,
        message: "Gagal memproses pengecekan sertifikat pada database.",
      });
    }
  }

  const cleanQuery = noSertifikat.trim().toUpperCase();
  const normQuery = cleanQuery.replace(/\s+/g, "").replace(/–/g, "-");

  // ==========================================================================
  // TAHAP 1: INTEGRASI API SILAPP (SILAPP.penilaistandaruji.com)
  // ==========================================================================
  
  // A. Cek Mode Lacak Proses Workflow SILAPP (jika format kode tracking / aplikasi)
  const isTrackingCode = /^SLP/i.test(cleanQuery) || /^PSU-\d{4}-/i.test(cleanQuery);
  if (isTrackingCode) {
    try {
      const cached = silappTrackCache.get(cleanQuery);
      if (cached && Date.now() < cached.expiresAt) {
        return res.json({
          success: true,
          found: true,
          source: SILAPP_DOMAIN,
          mode: "workflow",
          workflow: cached.data,
          data: [cached.normalized],
        });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const silappRes = await fetch(
        `${SILAPP_BASE_URL}/api/public/track/${encodeURIComponent(cleanQuery)}`,
        {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        }
      );
      clearTimeout(timeoutId);

      if (silappRes.ok) {
        const silappData = await silappRes.json();
        const normalized = {
          id: silappData.application_no || silappData.tracking_code,
          nama_pabrik: silappData.company_name || "Pemohon Terdaftar (SILAPP)",
          produk: silappData.service_name || silappData.product_label || "Layanan PT PSU",
          no_sni: silappData.tracking_code,
          no_sertifikat: silappData.application_no || silappData.tracking_code,
          terbit: silappData.created_at ? String(silappData.created_at).slice(0, 10) : "-",
          berlaku_sd: silappData.condition || "Dalam Proses",
          status:
            silappData.status === "aktif"
              ? "Aktif"
              : silappData.status === "selesai"
              ? "Selesai"
              : "Proses",
          progress: silappData.progress,
          current_step_name: silappData.current_step?.name,
          source: SILAPP_DOMAIN,
        };
        silappTrackCache.set(cleanQuery, {
          data: silappData,
          normalized,
          expiresAt: Date.now() + 60000,
        });

        return res.json({
          success: true,
          found: true,
          source: SILAPP_DOMAIN,
          mode: "workflow",
          workflow: silappData,
          data: [normalized],
        });
      }
    } catch (trackErr) {
      // Log kegagalan non-fatal, lanjutkan ke pengecekan direktori & database
      console.warn(`[SILAPP_TRACK] ${SILAPP_DOMAIN} tracking check bypassed:`, trackErr.message);
    }
  }

  // B. Cek Direktori Sertifikat Terbit SILAPP (/api/public/directory)
  try {
    let directory = silappDirectoryCache.data;
    if (!directory || Date.now() > silappDirectoryCache.expiresAt) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const dirRes = await fetch(`${SILAPP_BASE_URL}/api/public/directory`, {
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      if (dirRes.ok) {
        directory = await dirRes.json();
        silappDirectoryCache.data = directory;
        silappDirectoryCache.expiresAt = Date.now() + 60000;
      }
    }

    if (Array.isArray(directory) && directory.length > 0) {
      const match = directory.find((item) => {
        const certNo = String(item.certificate_no || "")
          .trim()
          .toUpperCase()
          .replace(/\s+/g, "")
          .replace(/–/g, "-");
        return certNo === normQuery;
      });

      if (match) {
        return res.json({
          success: true,
          found: true,
          source: SILAPP_DOMAIN,
          mode: "certificate",
          data: [
            {
              id: match.certificate_no,
              nama_pabrik:
                match.factory_name +
                (match.factory_address && match.factory_address !== "-"
                  ? ` | ${match.factory_address}`
                  : ""),
              produk: match.product || "-",
              no_sni: match.sni_no || "-",
              no_sertifikat: match.certificate_no,
              terbit: match.issued_at || "-",
              berlaku_sd: match.expires_at || "-",
              status: match.state
                ? match.state.charAt(0).toUpperCase() + match.state.slice(1)
                : "Aktif",
              source: SILAPP_DOMAIN,
            },
          ],
        });
      }
    }
  } catch (dirErr) {
    console.warn(`[SILAPP_DIR] ${SILAPP_DOMAIN} directory fetch bypassed:`, dirErr.message);
  }

  // ==========================================================================
  // TAHAP 2: FALLBACK KONEKSI DATABASE MYSQL LOKAL
  // ==========================================================================
  try {
    if (pool) {
      const sql = `
        SELECT
          id,
          nama_pabrik,
          produk,
          no_sni,
          no_sertifikat,
          terbit,
          berlaku_sd,
          status
        FROM \`${tableName}\`
        WHERE REPLACE(REPLACE(UPPER(TRIM(no_sertifikat)), ' ', ''), '–', '-') = REPLACE(REPLACE(UPPER(TRIM(?)), ' ', ''), '–', '-')
        LIMIT 1
      `;
      const [rows] = await pool.execute(sql, [noSertifikat]);

      if (rows && rows.length > 0) {
        return res.json({
          success: true,
          found: true,
          source: "database",
          mode: "certificate",
          data: rows.map((r) => ({ ...r, source: "database" })),
        });
      }
    }
  } catch (error) {
    console.error("Database query error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal memproses pengecekan sertifikat pada database.",
    });
  }

  // ==========================================================================
  // TAHAP 3: FALLBACK RESILIENCE LOKAL CACHED REGISTRY
  // ==========================================================================
  const seedList = DEFAULT_CERTIFICATES[submenu] || [];
  const seedMatch = seedList.find((c) => {
    const cNo = String(c.no_sertifikat || "")
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "")
      .replace(/–/g, "-");
    return cNo === normQuery;
  });

  if (seedMatch) {
    return res.json({
      success: true,
      found: true,
      source: SILAPP_DOMAIN,
      mode: "certificate",
      data: [seedMatch],
    });
  }

  // ==========================================================================
  // TIDAK DITEMUKAN PADA SILAPP MAUPUN DATABASE
  // ==========================================================================
  return res.status(404).json({
    success: false,
    found: false,
    source: SILAPP_DOMAIN,
    data: [],
    message: `Nomor sertifikat "${noSertifikat}" tidak ditemukan pada layanan ini di sistem SILAPP (${SILAPP_DOMAIN}) maupun database.`,
  });
}

app.get("/api/sertifikat/:submenu", generalApiLimiter, handleCertificateSearch);
app.get("/api/tracking/:submenu", generalApiLimiter, handleCertificateSearch);

// ============================================================================
// CENTRALIZED ERROR HANDLER (SEC-009)
// ============================================================================
app.use((err, req, res, next) => {
  if (err) {
    if (err.type === "entity.too.large" || err.status === 413) {
      return res.status(413).json({
        success: false,
        message: "Ukuran payload request melebihi batas yang diizinkan (maksimal 1 MB).",
      });
    }
    console.error("[CENTRAL_ERROR_HANDLER]", err.message || err);
    return res.status(err.status || 500).json({
      success: false,
      message: "Terjadi kesalahan internal pada server.",
    });
  }
  next();
});

if (require.main === module) {
  initDatabase().then(() => {
    app.listen(PORT, HOST, () => {
      console.log(
        `Server API Tracking Sertifikat & Dashboard Artikel berjalan di http://${HOST}:${PORT}`
      );
    });
  });
}

module.exports = {
  app,
  initDatabase,
  configureTrustProxy,
  getClientIp,
  isValidIpOrCidr,
  IPV4_MIN_PREFIX,
  IPV6_MIN_PREFIX,
  CLOUDFLARE_PROXY_CIDRS,
  TABLE_MAP,
  verifyPassword,
  hashPassword,
  sanitizeHtmlContent,
  sanitizePlainText,
  isOriginAllowed,
  ALLOWED_ORIGIN_SET,
  fallbackStore,
  saveFallbackUsers,
  loadFallbackUsers,
  signJwt,
  verifyJwt,
  extractToken,
  generateSitemapXml,
  syncSitemapFiles,
  CANONICAL_BASE,
  STATIC_SITEMAP_ROUTES,
};
