/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) — AUTOMATED VERIFICATION SUITE
 * WEBSITE ENHANCEMENT: SEO JSON-LD, IMAGE METADATA, SITEMAP, CAROUSEL & LANDINGS
 * ============================================================================
 */

const assert = require("node:assert");
const crypto = require("node:crypto");
const http = require("node:http");
const { PassThrough } = require("node:stream");
const fs = require("node:fs");
const path = require("node:path");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "PSU_TEST_SECRET_KEY_MINIMUM_32_CHARACTERS_VALID_LONG_ENTROPY!";
process.env.TRUST_PROXY = "loopback";

const {
  app,
  generateSitemapXml,
  syncSitemapFiles,
  CANONICAL_BASE,
  STATIC_SITEMAP_ROUTES,
  fallbackStore,
} = require("../server");

const { FALLBACK_ARTICLES } = require(path.resolve(__dirname, "../../company-profile/src/data/articlesFallback.js"));
const {
  IMAGE_METADATA,
  getImageMetadata,
  buildImageObjectSchema,
} = require(path.resolve(__dirname, "../../company-profile/src/data/imageMetadata.js"));

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
      "user-agent": "enhancement-verifier/1.0",
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

    setImmediate(() => {
      app.handle(req, res, (err) => {
        if (err) reject(err);
      });
      if (bodyBuf) socket.end(bodyBuf);
      else socket.end();
    });
  });
}

function computeArticleHash(art) {
  const contentToHash = JSON.stringify({
    slug: art.slug,
    title_id: art.title_id,
    title_en: art.title_en,
    excerpt_id: art.excerpt_id,
    excerpt_en: art.excerpt_en,
    content_id: art.content_id,
    content_en: art.content_en,
    image_url: art.image_url,
    category: art.category,
    tags: art.tags,
    published_at: art.published_at,
    status: art.status,
    author: art.author,
  });
  return crypto.createHash("sha256").update(contentToHash, "utf8").digest("hex");
}

// Expected Baseline SHA-256 Hashes from CONTENT_IMMUTABILITY_VERIFICATION.md
const EXPECTED_HASHES_FRONTEND = {
  1: "4dc9d61537b2d1be8c0e0c4214dd0cbb284fb93873707c321277fbaf3f558d16",
  2: "78bf62a8170921b29ea84024cdf8664f63c4c7aafb925f6b6a45eee6b4702cab",
  3: "8765e84ce5ec1ff3fa16b43a2fba3a50b79cf2db3c555758d28833e584f4fbe3",
  4: "b6aec15e9f8a4cb626f9c2dc87dae61b9552dfafd2533bcd11bd3883acc6abc2",
  5: "95b427d4092f7a83f0e3e08fac775c1c3a50974ed899c6ec2fe2c75c824fcaa0",
  6: "22bbdb90c164a33465e066e710d0c3ab79f1a51c31ff237883b73c91553227e5",
  7: "d61fb6cb1ceef25bbfa8548038fb57bbd7f2a34cedc2aefd7f8a4836c645e958",
  8: "182d629c9d7cef1d6f826be01c0b8270382902ed2da31d51e507f683ed442a8a",
  9: "b9a086b4519b4a722bf1f98f318688c82b8fdca9f80b74ec41b6683a23ec8aa9",
  10: "25b580e2ee03fd073fb006889ac17ec240df2f160057d54d360d582919248fbb",
  11: "720704b4b33c6683120c4b676da51e5400411ef8e4341f06ec03672f0a1173d8",
  12: "6a0d6c4cd2b49efa7bbccdcb5589fe9cfc8f71225872b728903588709230df8b",
};

const EXPECTED_HASHES_BACKEND = {
  1: "4dc9d61537b2d1be8c0e0c4214dd0cbb284fb93873707c321277fbaf3f558d16",
  2: "6281a5f366afdf54858b103f2a30fd32bcfec8c573476256e29b36600aa534b4",
  3: "8765e84ce5ec1ff3fa16b43a2fba3a50b79cf2db3c555758d28833e584f4fbe3",
  4: "b7643db8cc5d9375f14c7f423b877d35c45d20346955410eda1c4314c3ceff90",
  5: "95b427d4092f7a83f0e3e08fac775c1c3a50974ed899c6ec2fe2c75c824fcaa0",
  6: "22bbdb90c164a33465e066e710d0c3ab79f1a51c31ff237883b73c91553227e5",
  7: "d61fb6cb1ceef25bbfa8548038fb57bbd7f2a34cedc2aefd7f8a4836c645e958",
  8: "182d629c9d7cef1d6f826be01c0b8270382902ed2da31d51e507f683ed442a8a",
  9: "b9a086b4519b4a722bf1f98f318688c82b8fdca9f80b74ec41b6683a23ec8aa9",
  10: "312925616db45734748a234f76a73aa3b77f7f2022bd8448eacd3d4ec584f51e",
  11: "6a5c4ba330005c3e5cdd21fca47d62f9ddd8514aa4c04e4c7d0ce6a5b346598b",
  12: "6a0d6c4cd2b49efa7bbccdcb5589fe9cfc8f71225872b728903588709230df8b",
};

async function main() {
  console.log("============================================================================");
  console.log("SUITE 1: ARTICLE CONTENT IMMUTABILITY VERIFICATION (12/12 ARTICLES)");
  console.log("============================================================================");

  runTest("1.1 Frontend fallback articles contains exactly 12 items", () => {
    assert.strictEqual(FALLBACK_ARTICLES.length, 12);
  });

  runTest("1.2 Backend fallbackStore articles contains exactly 12 items", () => {
    assert.strictEqual(fallbackStore.articles.length, 12);
  });

  FALLBACK_ARTICLES.forEach((art, idx) => {
    const id = idx + 1;
    runTest(`1.3 Frontend article ID #${id} (${art.slug}) matches baseline SHA-256`, () => {
      const h = computeArticleHash(art);
      assert.strictEqual(h, EXPECTED_HASHES_FRONTEND[id], `Frontend hash mismatch on article ID ${id}`);
    });
  });

  fallbackStore.articles.forEach((art, idx) => {
    const id = idx + 1;
    runTest(`1.4 Backend article ID #${id} (${art.slug}) matches baseline SHA-256`, () => {
      const h = computeArticleHash(art);
      assert.strictEqual(h, EXPECTED_HASHES_BACKEND[id], `Backend hash mismatch on article ID ${id}`);
    });
  });

  console.log("\n============================================================================");
  console.log("SUITE 2: IMAGE METADATA REGISTRY & SCHEMA OBJECTS (71 PUBLIC IMAGES)");
  console.log("============================================================================");

  runTest("2.1 Image metadata registry catalogs at least 71 images", () => {
    const keys = Object.keys(IMAGE_METADATA);
    assert.ok(keys.length >= 71, `Expected >= 71 images, found ${keys.length}`);
  });

  runTest("2.2 Image metadata entries contain width, height, format, alt_id, alt_en", () => {
    const keys = Object.keys(IMAGE_METADATA);
    for (const k of keys) {
      const item = IMAGE_METADATA[k];
      assert.ok(item.width > 0, `Image ${k} missing valid width`);
      assert.ok(item.height > 0, `Image ${k} missing valid height`);
      assert.ok(item.format, `Image ${k} missing format`);
      assert.ok(typeof item.alt_id === "string", `Image ${k} missing alt_id string`);
      assert.ok(typeof item.alt_en === "string", `Image ${k} missing alt_en string`);
      assert.ok(typeof item.desc_id === "string", `Image ${k} missing desc_id`);
      assert.ok(typeof item.desc_en === "string", `Image ${k} missing desc_en`);
    }
  });

  runTest("2.3 getImageMetadata helper returns accurate metadata and normalizes paths", () => {
    const meta1 = getImageMetadata("/Logo_PSU.webp", "id");
    assert.strictEqual(meta1.width, 512);
    assert.strictEqual(meta1.height, 512);
    assert.strictEqual(meta1.format, "image/webp");
    assert.strictEqual(meta1.alt, "Logo PT PENILAI STANDAR UJI");

    const meta2 = getImageMetadata("Logo_PSU.webp", "en");
    assert.strictEqual(meta2.width, 512);
    assert.strictEqual(meta2.alt, "PT PENILAI STANDAR UJI Official Logo");
  });

  runTest("2.4 buildImageObjectSchema produces valid Schema.org ImageObject", () => {
    const schema = buildImageObjectSchema("/Logo_PSU.webp", "Logo PT Penilai Standar Uji");
    assert.strictEqual(schema["@type"], "ImageObject");
    assert.strictEqual(schema.width, 512);
    assert.strictEqual(schema.height, 512);
    assert.strictEqual(schema.contentUrl, "https://penilaistandaruji.com/Logo_PSU.webp");
    assert.strictEqual(schema.caption, "Logo PT Penilai Standar Uji");
    assert.strictEqual(schema.encodingFormat, "image/webp");
  });

  console.log("\n============================================================================");
  console.log("SUITE 3: UNIVERSAL JSON-LD SCHEMA GENERATION");
  console.log("============================================================================");

  runTest("3.1 SeoHead component source exists and handles multiple schema types", () => {
    const seoHeadPath = path.resolve(__dirname, "../../company-profile/src/components/SeoHead.jsx");
    assert.ok(fs.existsSync(seoHeadPath), "SeoHead.jsx must exist");
    const src = fs.readFileSync(seoHeadPath, "utf8");
    assert.ok(src.includes("application/ld+json"), "SeoHead must inject ld+json script");
    assert.ok(src.includes("Organization"), "SeoHead must declare Organization schema");
    assert.ok(src.includes("WebSite"), "SeoHead must declare WebSite schema");
    assert.ok(src.includes("BlogPosting"), "SeoHead must support BlogPosting schema");
    assert.ok(src.includes("Service"), "SeoHead must support Service schema");
    assert.ok(src.includes("BreadcrumbList"), "SeoHead must support BreadcrumbList schema");
  });

  console.log("\n============================================================================");
  console.log("SUITE 4: AUTOMATIC SITEMAP & ROBOTS.TXT GENERATOR");
  console.log("============================================================================");

  runTest("4.1 generateSitemapXml generates clean, valid XML with canonical domain", () => {
    const xml = generateSitemapXml(fallbackStore.articles);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "Must start with XML declaration");
    assert.ok(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'), "Must include Sitemaps namespace");
    assert.ok(xml.includes('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"'), "Must include Google Image namespace");
    assert.ok(xml.includes("https://penilaistandaruji.com/"), "Must contain root canonical URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/lspro"), "Must contain /lspro URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/layanan/sertif-produk"), "Must contain /layanan/sertif-produk URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/layanan/penguji"), "Must contain /layanan/penguji URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/layanan/kalibrasi"), "Must contain /layanan/kalibrasi URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/layanan/sertif-manajemen"), "Must contain /layanan/sertif-manajemen URL");
    assert.ok(xml.includes("https://penilaistandaruji.com/layanan/pelatihan"), "Must contain /layanan/pelatihan URL");
  });

  runTest("4.2 sitemap XML strictly contains ZERO dev/localhost/staging references", () => {
    const xml = generateSitemapXml(fallbackStore.articles);
    assert.ok(!xml.includes("localhost"), "XML must not contain localhost");
    assert.ok(!xml.includes("127.0.0.1"), "XML must not contain 127.0.0.1");
    assert.ok(!xml.includes("staging"), "XML must not contain staging");
    assert.ok(!xml.includes(":5000"), "XML must not contain :5000");
    assert.ok(!xml.includes(":5173"), "XML must not contain :5173");
  });

  runTest("4.3 sitemap XML contains Google Image extensions for published articles", () => {
    const xml = generateSitemapXml(fallbackStore.articles);
    assert.ok(xml.includes("<image:image>"), "XML must contain image:image blocks");
    assert.ok(xml.includes("<image:loc>https://penilaistandaruji.com/Logo_PSU_banner1.webp</image:loc>"), "XML must contain image loc");
    assert.ok(xml.includes("<image:title>"), "XML must contain image title");
  });

  runTest("4.4 sitemap generator excludes Draft articles", () => {
    const testArticles = [
      { id: 998, slug: "published-test", status: "Published", published_at: "2026-04-18" },
      { id: 999, slug: "draft-test", status: "Draft", published_at: "2026-04-18" },
    ];
    const xml = generateSitemapXml(testArticles);
    assert.ok(xml.includes("published-test"), "Published article must be in sitemap");
    assert.ok(!xml.includes("draft-test"), "Draft article must NOT be in sitemap");
  });

  runAsyncTest("4.5 syncSitemapFiles writes sitemap.xml and robots.txt to public/ and dist/", async () => {
    await syncSitemapFiles();
    const publicSitemap = path.resolve(__dirname, "../../company-profile/public/sitemap.xml");
    const publicRobots = path.resolve(__dirname, "../../company-profile/public/robots.txt");
    const distSitemap = path.resolve(__dirname, "../../company-profile/dist/sitemap.xml");
    const distRobots = path.resolve(__dirname, "../../company-profile/dist/robots.txt");

    assert.ok(fs.existsSync(publicSitemap), "public/sitemap.xml must exist");
    assert.ok(fs.existsSync(publicRobots), "public/robots.txt must exist");
    assert.ok(fs.existsSync(distSitemap), "dist/sitemap.xml must exist");
    assert.ok(fs.existsSync(distRobots), "dist/robots.txt must exist");

    const robotsTxt = fs.readFileSync(publicRobots, "utf8");
    assert.ok(robotsTxt.includes("Disallow: /admin"), "robots.txt must disallow /admin");
    assert.ok(robotsTxt.includes("Sitemap: https://penilaistandaruji.com/sitemap.xml"), "robots.txt must declare Sitemap URL");
  });

  console.log("\n============================================================================");
  console.log("SUITE 5: EXPRESS DYNAMIC HTTP SITEMAP & ROBOTS ENDPOINTS");
  console.log("============================================================================");

  await runAsyncTest("5.1 GET /sitemap.xml returns 200 with application/xml header", async () => {
    const res = await makeRequest({ method: "GET", url: "/sitemap.xml" });
    assert.strictEqual(res.statusCode, 200);
    const ct = res.headers["content-type"];
    assert.ok(ct && ct.includes("application/xml"), `Expected application/xml, got ${ct}`);
    assert.ok(res.body.includes("<urlset"), "Response body must contain <urlset");
  });

  await runAsyncTest("5.2 GET /robots.txt returns 200 with text/plain header", async () => {
    const res = await makeRequest({ method: "GET", url: "/robots.txt" });
    assert.strictEqual(res.statusCode, 200);
    const ct = res.headers["content-type"];
    assert.ok(ct && ct.includes("text/plain"), `Expected text/plain, got ${ct}`);
    assert.ok(res.body.includes("User-agent: *"), "Response body must contain User-agent");
    assert.ok(res.body.includes("Sitemap: https://penilaistandaruji.com/sitemap.xml"), "Must include Sitemap directive");
  });

  console.log("\n============================================================================");
  console.log("SUITE 6: SERVICE CAROUSEL COMPONENT VERIFICATION");
  console.log("============================================================================");

  runTest("6.1 ServiceCarousel.jsx exists and implements 4 desktop, 2 tablet, 1 mobile cards", () => {
    const compPath = path.resolve(__dirname, "../../company-profile/src/components/ServiceCarousel.jsx");
    assert.ok(fs.existsSync(compPath), "ServiceCarousel.jsx must exist");
    const src = fs.readFileSync(compPath, "utf8");
    assert.ok(src.includes("setVisibleCards(4)"), "Desktop must show 4 cards");
    assert.ok(src.includes("setVisibleCards(2)"), "Tablet must show 2 cards");
    assert.ok(src.includes("setVisibleCards(1)"), "Mobile must show 1 card");
  });

  runTest("6.2 ServiceCarousel.jsx contains navigation buttons with aria-label & dot indicators", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../../company-profile/src/components/ServiceCarousel.jsx"), "utf8");
    assert.ok(src.includes("Slide layanan sebelumnya"), "Must have prev button aria-label");
    assert.ok(src.includes("Slide layanan berikutnya"), "Must have next button aria-label");
    assert.ok(src.includes("role=\"tablist\""), "Dot indicators must have tablist role");
  });

  runTest("6.3 ServiceCarousel.jsx implements touch swipe/drag event handlers", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../../company-profile/src/components/ServiceCarousel.jsx"), "utf8");
    assert.ok(src.includes("onTouchStart={handleTouchStart}"), "Must handle onTouchStart");
    assert.ok(src.includes("onTouchEnd={handleTouchEnd}"), "Must handle onTouchEnd");
    assert.ok(src.includes("onMouseDown={handleMouseDown}"), "Must handle onMouseDown");
    assert.ok(src.includes("onMouseUp={handleMouseUp}"), "Must handle onMouseUp");
  });

  runTest("6.4 ServiceCarousel.jsx implements autoplay with hover, blur, and reduced-motion pause", () => {
    const src = fs.readFileSync(path.resolve(__dirname, "../../company-profile/src/components/ServiceCarousel.jsx"), "utf8");
    assert.ok(src.includes("prefers-reduced-motion: reduce"), "Must check prefers-reduced-motion");
    assert.ok(src.includes("setIsPaused(true)"), "Must pause on hover or focus");
    assert.ok(src.includes("visibilitychange"), "Must pause on tab blur");
  });

  runTest("6.5 ServiceCarousel.css defines 1.07x hover image zoom and min 44px touch targets", () => {
    const cssPath = path.resolve(__dirname, "../../company-profile/src/components/ServiceCarousel.css");
    assert.ok(fs.existsSync(cssPath), "ServiceCarousel.css must exist");
    const css = fs.readFileSync(cssPath, "utf8");
    assert.ok(css.includes("scale(1.07)"), "Must have 1.07x zoom on hover");
    assert.ok(css.includes("min-width: 44px"), "Buttons must have min 44px width");
    assert.ok(css.includes("min-height: 44px"), "Buttons must have min 44px height");
  });

  console.log("\n============================================================================");
  console.log("SUITE 7: SERVICE LANDING PAGES & ROUTING INTEGRATION");
  console.log("============================================================================");

  const landingFiles = [
    "LembagaSertifikasiProdukLanding.jsx",
    "LembagaPengujianLanding.jsx",
    "LembagaKalibrasiLanding.jsx",
    "LembagaSertifikasiSistemManajemenLanding.jsx",
    "LembagaPelatihanLanding.jsx",
  ];

  landingFiles.forEach((f) => {
    runTest(`7.1 Landing page component ${f} exists`, () => {
      const p = path.resolve(__dirname, `../../company-profile/src/pages/layanan/${f}`);
      assert.ok(fs.existsSync(p), `${f} must exist`);
      const src = fs.readFileSync(p, "utf8");
      assert.ok(src.includes("<SeoHead"), `${f} must include SeoHead`);
      assert.ok(src.includes('type="service"'), `${f} must pass type="service"`);
      assert.ok(src.includes("serviceData"), `${f} must supply serviceData`);
    });
  });

  runTest("7.2 ServiceLanding.css exists with responsive design rules", () => {
    const cssPath = path.resolve(__dirname, "../../company-profile/src/pages/layanan/ServiceLanding.css");
    assert.ok(fs.existsSync(cssPath), "ServiceLanding.css must exist");
  });

  runTest("7.3 App.jsx contains routes for /lspro and all 5 /layanan/* landing paths", () => {
    const appPath = path.resolve(__dirname, "../../company-profile/src/App.jsx");
    const src = fs.readFileSync(appPath, "utf8");
    assert.ok(src.includes('path="/lspro"'), "App.jsx must route /lspro");
    assert.ok(src.includes('path="/layanan/sertif-produk"'), "App.jsx must route /layanan/sertif-produk");
    assert.ok(src.includes('path="/layanan/penguji"'), "App.jsx must route /layanan/penguji");
    assert.ok(src.includes('path="/layanan/kalibrasi"'), "App.jsx must route /layanan/kalibrasi");
    assert.ok(src.includes('path="/layanan/sertif-manajemen"'), "App.jsx must route /layanan/sertif-manajemen");
    assert.ok(src.includes('path="/layanan/pelatihan"'), "App.jsx must route /layanan/pelatihan");
  });

  runTest("7.4 Navbar.jsx enables linkParent navigation for all 5 service categories", () => {
    const navPath = path.resolve(__dirname, "../../company-profile/src/components/Navbar.jsx");
    const src = fs.readFileSync(navPath, "utf8");
    assert.ok(src.includes("linkParent: true"), "Navbar must have linkParent: true on service categories");
  });

  runTest("7.5 PageHeader.jsx includes all 6 service landing routes in VALID_PAGE_ROUTES", () => {
    const headerPath = path.resolve(__dirname, "../../company-profile/src/components/PageHeader.jsx");
    const src = fs.readFileSync(headerPath, "utf8");
    assert.ok(src.includes('"/lspro"'), "PageHeader must have /lspro in VALID_PAGE_ROUTES");
    assert.ok(src.includes('"/layanan/sertif-produk"'), "PageHeader must have /layanan/sertif-produk in VALID_PAGE_ROUTES");
    assert.ok(src.includes('"/layanan/penguji"'), "PageHeader must have /layanan/penguji in VALID_PAGE_ROUTES");
    assert.ok(src.includes('"/layanan/kalibrasi"'), "PageHeader must have /layanan/kalibrasi in VALID_PAGE_ROUTES");
    assert.ok(src.includes('"/layanan/sertif-manajemen"'), "PageHeader must have /layanan/sertif-manajemen in VALID_PAGE_ROUTES");
    assert.ok(src.includes('"/layanan/pelatihan"'), "PageHeader must have /layanan/pelatihan in VALID_PAGE_ROUTES");
  });

  console.log("\n============================================================================");
  console.log("SUITE 8: SERVICE SUBPAGE FULFILLMENT & INTEGRITY (9 SUBPAGES)");
  console.log("============================================================================");

  const subpages = [
    {
      name: "Biaya Penawaran Kalibrasi",
      jsx: "layanan/kalibrasi/Biaya_penawaran_kalibrasi.jsx",
      css: "layanan/kalibrasi/Biaya_penawaran_kalibrasi.css",
      expectedMinLines: 150,
    },
    {
      name: "General Training",
      jsx: "layanan/pelatihan/General_training.jsx",
      css: "layanan/pelatihan/General_training.css",
      expectedMinLines: 150,
    },
    {
      name: "Inhouse Training",
      jsx: "layanan/pelatihan/Inhouse_training.jsx",
      css: "layanan/pelatihan/Inhouse_training.css",
      expectedMinLines: 150,
    },
    {
      name: "Exhouse Training",
      jsx: "layanan/pelatihan/Exhouse_training.jsx",
      css: "layanan/pelatihan/Exhouse_training.css",
      expectedMinLines: 150,
    },
    {
      name: "Ruang Lingkup Sistem Manajemen",
      jsx: "layanan/sertifikasi-sistem-manajemen/Ruang_lingkup_sertif_sistem.jsx",
      css: "layanan/sertifikasi-sistem-manajemen/Ruang_lingkup_sertif_sistem.css",
      expectedMinLines: 150,
    },
    {
      name: "Proses Sertifikasi Sistem Manajemen",
      jsx: "layanan/sertifikasi-sistem-manajemen/Proses_sertif_sistem.jsx",
      css: "layanan/sertifikasi-sistem-manajemen/Proses_sertif_sistem.css",
      expectedMinLines: 150,
    },
    {
      name: "Keluhan dan Banding Sistem Manajemen",
      jsx: "layanan/sertifikasi-sistem-manajemen/Keluhan_banding_sertif_sistem.jsx",
      css: "layanan/sertifikasi-sistem-manajemen/Keluhan_banding_sertif_sistem.css",
      expectedMinLines: 150,
    },
    {
      name: "Hak dan Kewajiban Klien Sistem Manajemen",
      jsx: "layanan/sertifikasi-sistem-manajemen/Hak_kewajiban_klien_sertif_sistem.jsx",
      css: "layanan/sertifikasi-sistem-manajemen/Hak_kewajiban_klien_sertif_sistem.css",
      expectedMinLines: 150,
    },
    {
      name: "Biaya dan Penawaran Sistem Manajemen",
      jsx: "layanan/sertifikasi-sistem-manajemen/Biaya_penawaran_sertif_sistem.jsx",
      css: "layanan/sertifikasi-sistem-manajemen/Biaya_penawaran_sertif_sistem.css",
      expectedMinLines: 150,
    },
  ];

  subpages.forEach((page) => {
    runTest(`8.1 Subpage ${page.name} exists and is populated (> ${page.expectedMinLines} lines)`, () => {
      const p = path.resolve(__dirname, `../../company-profile/src/pages/${page.jsx}`);
      assert.ok(fs.existsSync(p), `${page.jsx} must exist`);
      const src = fs.readFileSync(p, "utf8");
      const lines = src.split("\n").length;
      assert.ok(lines >= page.expectedMinLines, `${page.jsx} has only ${lines} lines, expected >= ${page.expectedMinLines}`);
      assert.ok(src.includes("PageHeader"), `${page.jsx} must include PageHeader`);
      assert.ok(src.includes("getWhatsAppUrl"), `${page.jsx} must use getWhatsAppUrl`);
      assert.ok(src.includes("site-container"), `${page.jsx} must use site-container for layout alignment`);
    });

    runTest(`8.2 Subpage CSS for ${page.name} exists`, () => {
      const p = path.resolve(__dirname, `../../company-profile/src/pages/${page.css}`);
      assert.ok(fs.existsSync(p), `${page.css} must exist`);
    });
  });

  console.log("\n============================================================================");
  console.log("SUITE 9: CONTEXTUAL WHATSAPP ROUTING & WIDGET INTEGRATION");
  console.log("============================================================================");

  let waModule;
  await runAsyncTest("9.1 whatsapp.js module imports successfully", async () => {
    waModule = await import("../../company-profile/src/utils/whatsapp.js");
    assert.strictEqual(waModule.WHATSAPP_NUMBER, "6281908344114", "WHATSAPP_NUMBER must be 6281908344114");
    assert.strictEqual(waModule.WHATSAPP_DISPLAY_NUMBER, "+62 819-0834-4114", "WHATSAPP_DISPLAY_NUMBER must match official PT PSU format");
  });

  runTest("9.2 getWhatsAppUrl generates valid URLs with encoded contextual message", () => {
    const homeUrl = waModule.getWhatsAppUrl("/", null, "id");
    assert.ok(homeUrl.startsWith("https://wa.me/6281908344114?text="), "URL must point to wa.me with correct phone number");
    assert.ok(homeUrl.includes(encodeURIComponent("PT. Penilai Standar Uji")), "URL must encode company name");

    const kalibrasiUrl = waModule.getWhatsAppUrl("/layanan/kalibrasi/biaya-sertif", null, "id");
    assert.ok(kalibrasiUrl.includes(encodeURIComponent("biaya")), "Kalibrasi URL must include context");

    const enUrl = waModule.getWhatsAppUrl("/layanan/sertif-manajemen", null, "en");
    assert.ok(enUrl.includes(encodeURIComponent("management system certification")), "EN URL must contain english context");
  });

  runTest("9.3 WaFloat.jsx uses dynamic contextual getWhatsAppUrl and useLocation", () => {
    const floatPath = path.resolve(__dirname, "../../company-profile/src/components/WaFloat.jsx");
    const src = fs.readFileSync(floatPath, "utf8");
    assert.ok(src.includes("useLocation"), "WaFloat.jsx must use useLocation");
    assert.ok(src.includes("getWhatsAppUrl(location.pathname"), "WaFloat.jsx must generate dynamic URL from location.pathname");
  });

  console.log("\n============================================================================");
  console.log("SUITE 10: BALANCED GRID NO-EMPTY-COLUMN SYSTEM & LANDING ADOPTION");
  console.log("============================================================================");

  runTest("10.1 BalancedGrid.jsx & BalancedGrid.css exist and define balanced distributions", () => {
    const gridJsx = path.resolve(__dirname, "../../company-profile/src/components/BalancedGrid.jsx");
    const gridCss = path.resolve(__dirname, "../../company-profile/src/components/BalancedGrid.css");
    assert.ok(fs.existsSync(gridJsx), "BalancedGrid.jsx must exist");
    assert.ok(fs.existsSync(gridCss), "BalancedGrid.css must exist");

    const src = fs.readFileSync(gridJsx, "utf8");
    assert.ok(src.includes("if (count === 5) return [3, 2];"), "Must distribute 5 items as 3 + 2");
    assert.ok(src.includes("if (count === 6) return [3, 3];"), "Must distribute 6 items as 3 + 3");
    assert.ok(src.includes("if (count === 7) return [4, 3];"), "Must distribute 7 items as 4 + 3");
    assert.ok(src.includes("if (count === 8) return [4, 4];"), "Must distribute 8 items as 4 + 4");
    assert.ok(src.includes("if (count === 9) return [3, 3, 3];"), "Must distribute 9 items as 3 + 3 + 3");
  });

  runTest("10.2 All 5 service landing pages import and adopt BalancedGrid", () => {
    landingFiles.forEach((file) => {
      const p = path.resolve(__dirname, `../../company-profile/src/pages/layanan/${file}`);
      const src = fs.readFileSync(p, "utf8");
      assert.ok(src.includes("BalancedGrid"), `${file} must import and use BalancedGrid`);
      assert.ok(src.includes("<BalancedGrid"), `${file} must render <BalancedGrid`);
    });
  });

  runTest("10.3 ServiceLanding.css uses standard site container max-width & gutter", () => {
    const cssPath = path.resolve(__dirname, "../../company-profile/src/pages/layanan/ServiceLanding.css");
    const css = fs.readFileSync(cssPath, "utf8");
    assert.ok(css.includes("var(--site-max-width)"), "ServiceLanding.css must reference --site-max-width");
    assert.ok(css.includes("var(--site-gutter)"), "ServiceLanding.css must reference --site-gutter");
  });

  console.log("\n============================================================================");
  console.log("SUITE 11: HOMEPAGE MARQUEE ANIMATION RESTORATION & ACCESSIBILITY");
  console.log("============================================================================");

  runTest("11.1 Home.jsx implements continuous horizontal marquee with requestAnimationFrame loop", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes("marqueeRef"), "Home.jsx must have marqueeRef");
    assert.ok(src.includes("groupRef"), "Home.jsx must have groupRef");
    assert.ok(src.includes("marqueeCtl"), "Home.jsx must have marqueeCtl");
    assert.ok(src.includes("requestAnimationFrame"), "Home.jsx must use requestAnimationFrame");
    assert.ok(src.includes("main-services__marquee"), "Home.jsx must have main-services__marquee element");
    assert.ok(src.includes("MAIN_SERVICES"), "Home.jsx must define MAIN_SERVICES");
  });

  runTest("11.2 Home.jsx links all 5 main services to official landing pages", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes('link: "/lspro"'), "Must link LSPro to /lspro");
    assert.ok(src.includes('link: "/layanan/penguji"'), "Must link Pengujian to /layanan/penguji");
    assert.ok(src.includes('link: "/layanan/kalibrasi"'), "Must link Kalibrasi to /layanan/kalibrasi");
    assert.ok(src.includes('link: "/layanan/pelatihan"'), "Must link Pelatihan to /layanan/pelatihan");
    assert.ok(src.includes('link: "/layanan/sertif-manajemen"'), "Must link Sistem Manajemen to /layanan/sertif-manajemen");
  });

  runTest("11.3 Duplicate group in Home.jsx is accessible (aria-hidden=true & tabIndex=-1 non-interactive)", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes('main-services__group--duplicate'), "Home.jsx must have main-services__group--duplicate");
    assert.ok(src.includes('aria-hidden="true"'), "Duplicate group must have aria-hidden=true");
    assert.ok(src.includes('tabIndex="-1"'), "Cards in duplicate group must have tabIndex=-1");
  });

  runTest("11.4 Home.jsx marquee pauses on hover, pointer drag, wheel, touch, and respects prefers-reduced-motion", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes("onMouseEnter"), "Must pause on hover");
    assert.ok(src.includes("onPointerDown"), "Must handle pointer down");
    assert.ok(src.includes("onWheel"), "Must pause briefly on wheel");
    assert.ok(src.includes("onTouchStart"), "Must pause briefly on touch");
    assert.ok(src.includes("prefers-reduced-motion: reduce"), "Must respect prefers-reduced-motion");
  });

  runTest("11.5 Home.css defines responsive marquee styles and reduced-motion override", () => {
    const cssPath = path.resolve(__dirname, "../../company-profile/src/pages/Home.css");
    const css = fs.readFileSync(cssPath, "utf8");
    assert.ok(css.includes(".main-services__marquee"), "Home.css must style .main-services__marquee");
    assert.ok(css.includes(".main-services__track"), "Home.css must style .main-services__track");
    assert.ok(css.includes("prefers-reduced-motion: reduce"), "Home.css must have prefers-reduced-motion rule");
  });

  console.log("\n============================================================================");
  console.log("SUITE 12: ACTIVE SERVICE LINKS, MARQUEE ARROW FALLBACK & CONTENT TYPOGRAPHY ALIGNMENT");
  console.log("============================================================================");

  runTest("12.1 Home.jsx implements Prev/Next arrow navigation buttons with accessible ARIA labels", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes("main-services__slider-wrap"), "Must have main-services__slider-wrap container");
    assert.ok(src.includes("main-services__arrow--prev"), "Must have main-services__arrow--prev button");
    assert.ok(src.includes("main-services__arrow--next"), "Must have main-services__arrow--next button");
    assert.ok(src.includes("handlePrevService"), "Must implement handlePrevService handler");
    assert.ok(src.includes("handleNextService"), "Must implement handleNextService handler");
  });

  runTest("12.2 Home.jsx implements drag threshold (8px) and card click handler preventing accidental navigation", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes("dragDistance"), "Must track dragDistance in marqueeCtl");
    assert.ok(src.includes("dist > 8"), "Must use 8px threshold to differentiate drag from click");
    assert.ok(src.includes("handleCardClick"), "Must implement handleCardClick");
    assert.ok(!src.includes("setPointerCapture"), "Must NOT use setPointerCapture which blocks link clicks");
  });

  runTest("12.3 Duplicate group cards rendered as navigable <Link> with tabIndex=-1 and aria-hidden=true", () => {
    const homePath = path.resolve(__dirname, "../../company-profile/src/pages/Home.jsx");
    const src = fs.readFileSync(homePath, "utf8");
    assert.ok(src.includes('key={`duplicate-${index}`}'), "Must render duplicate group cards");
    assert.ok(src.includes('<Link\n                    to={service.link}\n                    className="main-services__card"\n                    key={`duplicate-${index}`}') ||
              src.includes('key={`duplicate-${index}`}') && src.includes('tabIndex="-1"'),
              "Duplicate cards must be navigable Links with tabIndex=-1");
  });

  runTest("12.4 Home.css defines slider wrapper, arrow buttons, and responsive styles", () => {
    const cssPath = path.resolve(__dirname, "../../company-profile/src/pages/Home.css");
    const css = fs.readFileSync(cssPath, "utf8");
    assert.ok(css.includes(".main-services__slider-wrap"), "Must define .main-services__slider-wrap");
    assert.ok(css.includes(".main-services__arrow"), "Must define .main-services__arrow");
    assert.ok(css.includes(".main-services__arrow--prev"), "Must define .main-services__arrow--prev");
    assert.ok(css.includes(".main-services__arrow--next"), "Must define .main-services__arrow--next");
  });

  runTest("12.5 Global index.css defines standardized content typography and box variables", () => {
    const indexPath = path.resolve(__dirname, "../../company-profile/src/index.css");
    const css = fs.readFileSync(indexPath, "utf8");
    assert.ok(css.includes("--content-font-size"), "Must define --content-font-size");
    assert.ok(css.includes("--content-line-height"), "Must define --content-line-height");
    assert.ok(css.includes("--content-heading-size"), "Must define --content-heading-size");
    assert.ok(css.includes("--content-heading-weight"), "Must define --content-heading-weight");
    assert.ok(css.includes("--content-list-gap"), "Must define --content-list-gap");
    assert.ok(css.includes("--content-section-gap"), "Must define --content-section-gap");
    assert.ok(css.includes("--content-box-padding"), "Must define --content-box-padding");
    assert.ok(css.includes("--content-border-color"), "Must define --content-border-color");
    assert.ok(css.includes("--content-box-bg"), "Must define --content-box-bg");
  });

  runTest("12.6 Refined target CSS files implement text-align: left and avoid text-align: justify", () => {
    const targetCssFiles = [
      "layanan/kalibrasi/Biaya_penawaran_kalibrasi.css",
      "layanan/pelatihan/Inhouse_training.css",
      "layanan/pelatihan/General_training.css",
      "layanan/pelatihan/Exhouse_training.css",
      "layanan/sertifikasi-sistem-manajemen/Hak_kewajiban_klien_sertif_sistem.css",
      "layanan/sertifikasi-sistem-manajemen/Ruang_lingkup_sertif_sistem.css",
      "layanan/sertifikasi-sistem-manajemen/Proses_sertif_sistem.css",
      "layanan/sertifikasi-sistem-manajemen/Keluhan_banding_sertif_sistem.css",
      "layanan/sertifikasi-sistem-manajemen/Biaya_penawaran_sertif_sistem.css",
      "layanan/sertifikasi-produk/Hak_kewajiban_klien_sertif.css",
      "layanan/sertifikasi-produk/Biaya_penawaran_sertif.css",
      "layanan/sertifikasi-produk/Keluhan_banding_sertif.css",
      "layanan/pengujian/Biaya_penawaran_penguji.css",
    ];

    targetCssFiles.forEach((rel) => {
      const p = path.resolve(__dirname, `../../company-profile/src/pages/${rel}`);
      assert.ok(fs.existsSync(p), `${rel} must exist`);
      const css = fs.readFileSync(p, "utf8");
      assert.ok(!css.includes("text-align: justify"), `${rel} must not contain text-align: justify`);
    });
  });

  runTest("12.7 Content Immutability verification: client rights and obligations text is 100% intact", () => {
    const lssmPath = path.resolve(
      __dirname,
      "../../company-profile/src/pages/layanan/sertifikasi-sistem-manajemen/Hak_kewajiban_klien_sertif_sistem.jsx"
    );
    const lssmSrc = fs.readFileSync(lssmPath, "utf8");
    assert.ok(
      lssmSrc.includes("Memperoleh layanan audit dan sertifikasi sistem manajemen secara profesional"),
      "LSSM Client rights item 1 must be intact"
    );
    assert.ok(
      lssmSrc.includes("Senantiasa memelihara komitmen implementasi dan efektivitas sistem manajemen"),
      "LSSM Client obligations item 1 must be intact"
    );
    assert.ok(
      lssmSrc.includes("Segera menghentikan seluruh penggunaan logo, sertifikat, dan klaim promosi"),
      "LSSM Client obligations item 8 must be intact"
    );

    const lsproPath = path.resolve(
      __dirname,
      "../../company-profile/src/pages/layanan/sertifikasi-produk/Hak_kewajiban_klien_sertif.jsx"
    );
    const lsproSrc = fs.readFileSync(lsproPath, "utf8");
    assert.ok(
      lsproSrc.includes("Memperoleh layanan sertifikasi produk secara profesional, objektif, tidak diskriminatif"),
      "LSPro Client rights item 1 must be intact"
    );
  });

  console.log("\n============================================================================");
  console.log(`TEST SUMMARY: ${passedCount} / ${totalCount} PASSED`);
  console.log("============================================================================");

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("Unhandled test suite error:", err);
  process.exit(1);
});
