/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) — VERIFIKASI RESPONSIVITAS & BILINGUAL
 * ============================================================================
 * Comprehensive Test Suite for Universal Responsive Design & Bilingual Engine
 * Target: 8 Viewports (320px - 1920px+), 42+ Routes, SEO, SILAPP & Localized UI
 * ============================================================================
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vm from "vm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");
const frontendSrc = path.join(rootDir, "company-profile/src");

let passedTests = 0;
let failedTests = 0;

function assert(condition, testId, description) {
  if (condition) {
    console.log(`[PASS] ${testId}: ${description}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testId}: ${description}`);
    failedTests++;
  }
}

console.log("====================================================================");
console.log("PT PENILAI STANDAR UJI (PSU) — AUDIT & VERIFIKASI RESPONSIVE & BILINGUAL");
console.log("====================================================================\n");

// -----------------------------------------------------------------------------
// [SUITE 1] Language Switcher Visibility Across 8 Viewports
// -----------------------------------------------------------------------------
console.log("--- [SUITE 1] Language Switcher Visibility Across 8 Viewports ---");

const headerTopCss = fs.readFileSync(path.join(frontendSrc, "components/HeaderTop.css"), "utf8");
const navbarCss = fs.readFileSync(path.join(frontendSrc, "components/Navbar.css"), "utf8");

// Test 1.1: No 861px-1024px hiding rule in HeaderTop.css
const hasOldHidingRule = headerTopCss.includes("@media (min-width: 861px) and (max-width: 1024px)") &&
                         headerTopCss.includes(".header-top__language {\n    display: none;");
assert(!hasOldHidingRule, "RESP-LANG-01", "HeaderTop.css tidak menyembunyikan language switcher di range 861px-1024px");

// Test 1.2: HeaderTop language visible for desktop & tablet landscape (>860px)
const headerTopLangDefault = headerTopCss.includes(".header-top__language {\n  display: flex;");
assert(headerTopLangDefault, "RESP-LANG-02", "HeaderTop language switcher berstatus 'display: flex' secara default untuk >= 861px");

// Test 1.3: HeaderTop inner uses fluid gap clamp
const headerTopFluidGap = headerTopCss.includes("clamp(14px, 2vw, 32px)") || headerTopCss.includes("clamp(12px, 2vw, 32px)");
assert(headerTopFluidGap, "RESP-LANG-03", "HeaderTop inner bar menggunakan fluid gap clamp untuk mencegah elemen berjejal");

// Test 1.4: Navbar language displayed on mobile (<= 860px)
const navbarLangMobile = navbarCss.includes(".navbar__language {") &&
                         navbarCss.includes("display: flex;") &&
                         navbarCss.includes("order: 2;");
assert(navbarLangMobile, "RESP-LANG-04", "Navbar language switcher aktif (display: flex) pada viewport mobile/tablet <= 860px");

// -----------------------------------------------------------------------------
// [SUITE 2] DOM & Language Context Synchronization
// -----------------------------------------------------------------------------
console.log("\n--- [SUITE 2] DOM & Language Context Synchronization ---");

const langContextCode = fs.readFileSync(path.join(frontendSrc, "context/LanguageContext.jsx"), "utf8");

// Test 2.1: HTML Lang synced to document.documentElement
const hasHtmlLangSync = langContextCode.includes("document.documentElement.lang = lang");
assert(hasHtmlLangSync, "I18N-SYNC-01", "LanguageContext.jsx menyinkronkan document.documentElement.lang secara real-time");

// Test 2.2: LocalStorage persistence
const hasLocalStorage = langContextCode.includes("window.localStorage.setItem(\"psu-lang\", lang)");
assert(hasLocalStorage, "I18N-SYNC-02", "LanguageContext.jsx mempertahankan preferensi bahasa pada localStorage ('psu-lang')");

// -----------------------------------------------------------------------------
// [SUITE 3] Technical SEO & Dynamic Metadata Synchronization
// -----------------------------------------------------------------------------
console.log("\n--- [SUITE 3] Technical SEO & Dynamic Metadata Synchronization ---");

const seoHeadCode = fs.readFileSync(path.join(frontendSrc, "components/SeoHead.jsx"), "utf8");

// Test 3.1: SeoHead uses useLanguage hook
assert(seoHeadCode.includes("import { useLanguage } from \"../context/useLanguage\";"), "SEO-I18N-01", "SeoHead mengimpor useLanguage hook");
assert(seoHeadCode.includes("const { lang: contextLang, t } = useLanguage();"), "SEO-I18N-02", "SeoHead menggunakan active language & translation function");

// Test 3.2: OpenGraph locale and alternate locale set dynamically
assert(seoHeadCode.includes("setMetaProperty(\"og:locale\", lang === \"en\" ? \"en_US\" : \"id_ID\");"), "SEO-I18N-03", "SeoHead mengatur og:locale dinamis sesuai bahasa aktif (id_ID vs en_US)");
assert(seoHeadCode.includes("setMetaProperty(\"og:locale:alternate\", lang === \"en\" ? \"id_ID\" : \"en_US\");"), "SEO-I18N-04", "SeoHead menyertakan og:locale:alternate untuk bahasa alternatif");

// Test 3.3: JSON-LD inLanguage dynamic
assert(seoHeadCode.includes("inLanguage: lang === \"en\" ? \"en-US\" : \"id-ID\""), "SEO-I18N-05", "SeoHead menyinkronkan inLanguage pada JSON-LD Schema.org");

// -----------------------------------------------------------------------------
// [SUITE 4] Translation Dictionary Completeness
// -----------------------------------------------------------------------------
console.log("\n--- [SUITE 4] Translation Dictionary Completeness ---");

const transPath = path.join(frontendSrc, "context/translations.js");
const transContent = fs.readFileSync(transPath, "utf8");
let dictKeys = new Set();
const evalCode = transContent
  .replace(/export function/g, "function")
  .replace(/export default/g, "//")
  + "\n; global.extractedEnglish = english;";

vm.runInThisContext(evalCode);
Object.keys(global.extractedEnglish || {}).forEach(k => dictKeys.add(k));

const requiredKeys = [
  "Tahapan Siklus Layanan",
  "Silakan masukkan nomor sertifikat atau kode lacak terlebih dahulu.",
  "Gagal terhubung ke server. Silakan pastikan koneksi jaringan aktif dan coba beberapa saat lagi.",
  "Melacak...",
  "Nama Pemilik / Faskes",
  "Instrumen / Alat",
  "Nomor Standar / Metode",
  "Nomor Sertifikat Kalibrasi",
  "Kalibrasi Ulang",
  "Nama Perusahaan / Organisasi",
  "Standar Acuan",
  "Nama Pabrik / Perusahaan",
  "Produk Diuji",
  "Nomor SNI / Metode",
  "Nomor Sertifikat / LHU",
  "Alur Permohonan Aktif",
  "Tahap",
  "dari",
  "Selesai",
  "Sedang Berjalan",
  "Menunggu",
  "Kode Lacak (Tracking Code)",
  "Status Saat Ini",
  "Estimasi Pengerjaan",
  "Update Terakhir",
  "Masuk ke Portal SILAPP",
  "Lacak Nomor Lain",
  "Pemrosesan Berkas",
  "KETERTELUSURAN METROLOGI",
  "STANDAR NASIONAL",
  "ALAT KESEHATAN",
  "PENGEMBANGAN SDM",
  "INSTRUKTUR PRAKTISI",
  "SISTEM MANAJEMEN",
  "AKREDITASI KAN"
];

let missingInDict = 0;
requiredKeys.forEach(k => {
  if (!dictKeys.has(k)) {
    console.error(`Missing required translation key: "${k}"`);
    missingInDict++;
  }
});

assert(missingInDict === 0, "I18N-DICT-01", `Seluruh ${requiredKeys.length} kunci terjemahan esensial SILAPP & responsive hadir di translations.js`);
assert(dictKeys.size >= 850, "I18N-DICT-02", `Kamus bilingual memiliki ${dictKeys.size} entri lengkap`);

// -----------------------------------------------------------------------------
// [SUITE 5] Component Bilingual Wrapping & Clean Markup
// -----------------------------------------------------------------------------
console.log("\n--- [SUITE 5] Component Bilingual Wrapping & Clean Markup ---");

const silappTrackerCode = fs.readFileSync(path.join(frontendSrc, "components/SilappWorkflowTracker.jsx"), "utf8");
assert(silappTrackerCode.includes("<LocalizedText>Alur Permohonan Aktif</LocalizedText>"), "COMP-I18N-01", "SilappWorkflowTracker melokalkan badge alur aktif");
assert(silappTrackerCode.includes("<LocalizedText>Tahapan Siklus Layanan</LocalizedText>"), "COMP-I18N-02", "SilappWorkflowTracker melokalkan judul tahapan siklus layanan");
assert(silappTrackerCode.includes("<LocalizedText>Masuk ke Portal SILAPP</LocalizedText>"), "COMP-I18N-03", "SilappWorkflowTracker melokalkan tombol portal SILAPP");

const keluhanBandingCode = fs.readFileSync(path.join(frontendSrc, "pages/layanan/sertifikasi-produk/Keluhan_banding_sertif.jsx"), "utf8");
assert(
  keluhanBandingCode.includes('<LocalizedText as="h1">') &&
  keluhanBandingCode.includes("Tanggung Gugat, Keluhan dan Banding"),
  "COMP-I18N-04",
  "Keluhan_banding_sertif.jsx menggunakan string bersih tanpa nested span untuk terjemahan"
);

const prosesPengujiCode = fs.readFileSync(path.join(frontendSrc, "pages/layanan/pengujian/Proses_penguji.jsx"), "utf8");
assert(prosesPengujiCode.includes("<LocalizedText>TAHAPAN</LocalizedText>"), "COMP-I18N-05", "Proses_penguji.jsx melokalkan label TAHAPAN");

// -----------------------------------------------------------------------------
// [SUITE 6] Responsive Table Touch Containment
// -----------------------------------------------------------------------------
console.log("\n--- [SUITE 6] Responsive Table Touch Containment ---");

const tipe1bCss = fs.readFileSync(path.join(frontendSrc, "pages/layanan/sertifikasi-produk/Tipe_1B.css"), "utf8");
const tipe5Css = fs.readFileSync(path.join(frontendSrc, "pages/layanan/sertifikasi-produk/Tipe_5.css"), "utf8");
const scopeProdCss = fs.readFileSync(path.join(frontendSrc, "pages/layanan/sertifikasi-produk/Ruang_lingkup_sertif.css"), "utf8");
const scopeTestCss = fs.readFileSync(path.join(frontendSrc, "pages/layanan/pengujian/Ruang_lingkup_penguji.css"), "utf8");

assert(tipe1bCss.includes("-webkit-overflow-scrolling: touch;"), "TOUCH-01", "Tipe_1B.css menyertakan -webkit-overflow-scrolling: touch");
assert(tipe5Css.includes("-webkit-overflow-scrolling: touch;"), "TOUCH-02", "Tipe_5.css menyertakan -webkit-overflow-scrolling: touch");
assert(scopeProdCss.includes("-webkit-overflow-scrolling: touch;"), "TOUCH-03", "Ruang_lingkup_sertif.css menyertakan -webkit-overflow-scrolling: touch");
assert(scopeTestCss.includes("-webkit-overflow-scrolling: touch;"), "TOUCH-04", "Ruang_lingkup_penguji.css menyertakan -webkit-overflow-scrolling: touch");

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log("\n====================================================================");
console.log(`TOTAL PENGUJIAN RESPONSIVE & BILINGUAL: ${passedTests + failedTests}`);
console.log(`LOLOS (PASS)                           : ${passedTests}`);
console.log(`GAGAL (FAIL)                           : ${failedTests}`);
console.log("====================================================================");

if (failedTests > 0) {
  console.error("[VERIFICATION FAILED] Terdapat pengujian yang gagal!");
  process.exit(1);
} else {
  console.log("[VERIFICATION SUCCESS] Seluruh Pengujian Responsivitas & Bilingual Lolos 100%!");
  process.exit(0);
}

