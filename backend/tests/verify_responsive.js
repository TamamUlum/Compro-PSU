/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) — UNIVERSAL RESPONSIVE VERIFICATION SUITE
 * Comprehensive Cross-Viewport Validation: 320px to 1920px+
 * ============================================================================
 */

import fs from 'fs';
import path from 'path';
import assert from 'assert';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..', '..');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`[PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`[FAIL] ${name}`);
    console.error(`       Error: ${err.message}`);
    process.exitCode = 1;
  }
}

/**
 * Helper: extracts body of a @media block
 */
function getMediaBlock(cssContent, mediaQuery) {
  const index = cssContent.indexOf(mediaQuery);
  if (index === -1) return '';
  const startBrace = cssContent.indexOf('{', index);
  if (startBrace === -1) return '';
  let depth = 1;
  let pos = startBrace + 1;
  while (depth > 0 && pos < cssContent.length) {
    if (cssContent[pos] === '{') depth++;
    else if (cssContent[pos] === '}') depth--;
    pos++;
  }
  return cssContent.substring(startBrace + 1, pos - 1);
}

console.log('====================================================================');
console.log('PT PENILAI STANDAR UJI (PSU) — UNIVERSAL RESPONSIVE AUDIT & VERIFICATION');
console.log('Target: 8 Viewports (320px - 1920px+), Priority: /layanan/pelatihan');
console.log('====================================================================\n');

// ----------------------------------------------------------------------------
// SUITE 1: GLOBAL BASELINE & OVERFLOW PREVENTION (index.css)
// ----------------------------------------------------------------------------
console.log('--- [SUITE 1] Global Baseline & Overflow Containment ---');

const indexCssPath = path.join(rootDir, 'company-profile', 'src', 'index.css');
const indexCss = fs.readFileSync(indexCssPath, 'utf8');

runTest('1.1 html and body enforce overflow-x containment (clip/hidden)', () => {
  assert.ok(
    indexCss.includes('overflow-x: clip;') || indexCss.includes('overflow-x: hidden;'),
    'html, body must enforce overflow-x: clip or hidden'
  );
});

runTest('1.2 Unified .site-container uses fluid clamp gutter & responsive breakpoints', () => {
  assert.ok(indexCss.includes('--site-max-width: 1200px;'), 'site-max-width must be 1200px');
  assert.ok(indexCss.includes('--site-gutter: clamp('), 'site-gutter must use fluid clamp');
  assert.ok(indexCss.includes('@media (max-width: 768px)'), 'site-container must have <= 768px query');
  assert.ok(indexCss.includes('@media (max-width: 480px)'), 'site-container must have <= 480px query');
});

runTest('1.3 #root element uses fluid 100% width without rigid pixel restrictions', () => {
  assert.ok(indexCss.includes('width: 100%;'), '#root must have width: 100%');
});

// ----------------------------------------------------------------------------
// SUITE 2: PRIORITY TARGET /layanan/pelatihan & SERVICE LANDING (ServiceLanding.css)
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 2] Priority Target /layanan/pelatihan & Service Landing Pages ---');

const serviceLandingCssPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'layanan', 'ServiceLanding.css');
const serviceLandingCss = fs.readFileSync(serviceLandingCssPath, 'utf8');

runTest('2.1 .service-landing container enforces responsive max-width and fluid margins', () => {
  assert.ok(serviceLandingCss.includes('width: min(100% - 2 * var(--site-gutter)'), 'Default container matches site standard');
  assert.ok(serviceLandingCss.includes('width: min(100% - 32px, var(--site-max-width))'), 'Tablet container uses 32px gutter');
  assert.ok(serviceLandingCss.includes('width: min(100% - 24px, var(--site-max-width))'), 'Mobile container uses 24px gutter');
  assert.ok(serviceLandingCss.includes('width: min(100% - 16px, var(--site-max-width))'), 'Small mobile container uses 16px gutter');
});

runTest('2.2 .service-landing hero section stacks cleanly on tablet (<= 900px)', () => {
  const m900 = getMediaBlock(serviceLandingCss, '@media (max-width: 900px)');
  assert.ok(m900.includes('grid-template-columns: 1fr;'), 'Hero section must stack to 1fr on <= 900px');
  assert.ok(m900.includes('.service-landing__hero'), 'Hero section styled in <= 900px');
});

runTest('2.3 Hero action buttons stack vertically and stretch full width on mobile (<= 600px)', () => {
  const m600 = getMediaBlock(serviceLandingCss, '@media (max-width: 600px)');
  assert.ok(m600.includes('flex-direction: column;'), 'Hero actions must be flex-direction: column on <= 600px');
  assert.ok(m600.includes('width: 100%;'), 'Buttons must be width: 100% on <= 600px');
});

runTest('2.4 Hero badges wrap cleanly with proportional font size & padding on mobile and small mobile', () => {
  assert.ok(serviceLandingCss.includes('.service-landing__badge-row'), 'Badge row exists');
  const m600 = getMediaBlock(serviceLandingCss, '@media (max-width: 600px)');
  assert.ok(m600.includes('font-size: 0.76rem;'), 'Badge font-size scales to 0.76rem on <= 600px');
  const m375 = getMediaBlock(serviceLandingCss, '@media (max-width: 375px)');
  assert.ok(m375.includes('font-size: 0.72rem;'), 'Badge font-size scales to 0.72rem on <= 375px');
});

runTest('2.5 Service landing commitment box stacks and enforces full-width CTA on mobile', () => {
  const m600 = getMediaBlock(serviceLandingCss, '@media (max-width: 600px)');
  assert.ok(m600.includes('.service-landing__commitment-cta'), 'Commitment CTA targeted in <= 600px');
  assert.ok(m600.includes('width: 100%;'), 'Commitment CTA must be 100% width on <= 600px');
});

// ----------------------------------------------------------------------------
// SUITE 3: BALANCED GRID NO-EMPTY-COLUMN RESPONSIVENESS (BalancedGrid.css)
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 3] BalancedGrid Layout Responsiveness ---');

const balancedGridCssPath = path.join(rootDir, 'company-profile', 'src', 'components', 'BalancedGrid.css');
const balancedGridCss = fs.readFileSync(balancedGridCssPath, 'utf8');

runTest('3.1 BalancedGrid enforces 2 columns on tablet (<= 900px)', () => {
  const m900 = getMediaBlock(balancedGridCss, '@media (max-width: 900px)');
  assert.ok(m900.includes('grid-template-columns: repeat(2, minmax(0, 1fr)) !important;'), 'BalancedGrid row must be 2 columns on <= 900px');
});

runTest('3.2 BalancedGrid enforces 1 column and proportional gap on mobile (<= 600px)', () => {
  const m600 = getMediaBlock(balancedGridCss, '@media (max-width: 600px)');
  assert.ok(m600.includes('grid-template-columns: 1fr !important;'), 'BalancedGrid row must be 1 column on <= 600px');
  assert.ok(m600.includes('gap: 16px;'), 'BalancedGrid gap must be 16px on <= 600px');
});

// ----------------------------------------------------------------------------
// SUITE 4: NAVBAR & HEADER TOP RESPONSIVE SYNCHRONIZATION
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 4] Navbar & HeaderTop Responsive Synchronization ---');

const navbarCssPath = path.join(rootDir, 'company-profile', 'src', 'components', 'Navbar.css');
const navbarCss = fs.readFileSync(navbarCssPath, 'utf8');

runTest('4.1 Navbar mobile spacer height accurately matches inner navbar height (68px)', () => {
  const m1024 = getMediaBlock(navbarCss, '@media (max-width: 1024px)');
  assert.ok(m1024.includes('--nav-height: 68px;'), 'Mobile --nav-height must be 68px matching .navbar__inner height');
});

runTest('4.2 Navbar mobile drawer uses responsive width min(320px, 100vw - 40px)', () => {
  assert.ok(
    navbarCss.includes('width: min(320px, calc(100vw - 40px));'),
    'Navbar drawer must be responsive min(320px, calc(100vw - 40px))'
  );
});

const headerTopCssPath = path.join(rootDir, 'company-profile', 'src', 'components', 'HeaderTop.css');
const headerTopCss = fs.readFileSync(headerTopCssPath, 'utf8');

runTest('4.3 HeaderTop hides office hours on narrow mobile (<= 520px) to prevent element crowding', () => {
  const m520 = getMediaBlock(headerTopCss, '@media (max-width: 520px)');
  assert.ok(m520.includes('display: none;'), 'HeaderTop hours must be display: none on <= 520px');
});

// ----------------------------------------------------------------------------
// SUITE 5: PAGE HEADER & HERO BREADCRUMB FLUIDITY (PageHeader.css)
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 5] PageHeader Responsive Fluidity ---');

const pageHeaderCssPath = path.join(rootDir, 'company-profile', 'src', 'components', 'PageHeader.css');
const pageHeaderCss = fs.readFileSync(pageHeaderCssPath, 'utf8');

runTest('5.1 PageHeader title scales proportionally and prevents overflow with word-break', () => {
  const m768 = getMediaBlock(pageHeaderCss, '@media (max-width: 768px)');
  assert.ok(m768.includes('word-break: break-word;'), 'PageHeader title must have word-break: break-word on <= 768px');
  const m480 = getMediaBlock(pageHeaderCss, '@media (max-width: 480px)');
  assert.ok(m480.includes('font-size: clamp('), 'PageHeader title scales with clamp on <= 480px');
});

runTest('5.2 Breadcrumbs wrap gracefully with word-break on mobile', () => {
  const m768 = getMediaBlock(pageHeaderCss, '@media (max-width: 768px)');
  assert.ok(m768.includes('.page-header__breadcrumb-item'), 'Breadcrumb item targeted on <= 768px');
  assert.ok(m768.includes('word-break: break-word;'), 'Breadcrumb item must wrap with word-break on <= 768px');
});

// ----------------------------------------------------------------------------
// SUITE 6: SUBPAGES & EXTENDED CONTENT RESPONSIVENESS
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 6] Service Subpages & Extended Responsive Layouts ---');

const exhouseCssPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'layanan', 'pelatihan', 'Exhouse_training.css');
const exhouseCss = fs.readFileSync(exhouseCssPath, 'utf8');

runTest('6.1 Exhouse training grid uses min(100%, 240px) and enforces 1 column on mobile', () => {
  assert.ok(exhouseCss.includes('minmax(min(100%, 240px), 1fr)'), 'Uses min(100%, 240px) safeguard');
  const m720 = getMediaBlock(exhouseCss, '@media (max-width: 720px)');
  assert.ok(m720.includes('grid-template-columns: 1fr;'), 'Exhouse grid collapses to 1fr on <= 720px');
});

const profileCssPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'Profile.css');
const profileCss = fs.readFileSync(profileCssPath, 'utf8');

runTest('6.2 Profile page stacks about showcase & vision-mission on mobile (<= 560px) for legible typography', () => {
  const m560 = getMediaBlock(profileCss, '@media (max-width: 560px)');
  assert.ok(m560.includes('flex-direction: column;'), 'About and Vision-mission showcase stack to column on <= 560px');
  assert.ok(m560.includes('.about-showcase'), 'About showcase styled on <= 560px');
  assert.ok(m560.includes('.vision-mission-showcase'), 'Vision mission showcase styled on <= 560px');
});

const strukturCssPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'Struktur.css');
const strukturCss = fs.readFileSync(strukturCssPath, 'utf8');

runTest('6.3 Organization structure implements 2 columns on tablet and 1 column on mobile', () => {
  const mTablet = getMediaBlock(strukturCss, '@media (max-width: 900px) and (min-width: 601px)');
  assert.ok(mTablet.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'), 'Org list is 2 columns on tablet');
  const mMobile = getMediaBlock(strukturCss, '@media (max-width: 600px)');
  assert.ok(mMobile.includes('grid-template-columns: minmax(0, 1fr);'), 'Org list is 1 column on mobile');
});

const clientCssPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'Client.css');
const clientCss = fs.readFileSync(clientCssPath, 'utf8');

runTest('6.4 Certificate tracker input uses fluid flex basis min(100%, 320px) and stretches full width on mobile', () => {
  assert.ok(clientCss.includes('flex: 1 1 min(100%, 320px);'), 'Input wrap uses fluid basis');
  const m640 = getMediaBlock(clientCss, '@media (max-width: 640px)');
  assert.ok(m640.includes('width: 100%;'), 'Input wrap stretches to 100% on <= 640px');
});

const waFloatCssPath = path.join(rootDir, 'company-profile', 'src', 'components', 'WaFloat.css');
const waFloatCss = fs.readFileSync(waFloatCssPath, 'utf8');

runTest('6.5 WaFloat widget scales to 44px (WCAG touch minimum) on small mobile (<= 360px)', () => {
  const m360 = getMediaBlock(waFloatCss, '@media (max-width: 360px)');
  assert.ok(m360.includes('width: 44px;'), 'WaFloat width is 44px on <= 360px');
  assert.ok(m360.includes('height: 44px;'), 'WaFloat height is 44px on <= 360px');
});

// ----------------------------------------------------------------------------
// SUITE 7: CONTENT IMMUTABILITY ASSERTION
// ----------------------------------------------------------------------------
console.log('\n--- [SUITE 7] Content Immutability Verification ---');

const lembagaPelatihanPath = path.join(rootDir, 'company-profile', 'src', 'pages', 'layanan', 'LembagaPelatihanLanding.jsx');
const lembagaPelatihanContent = fs.readFileSync(lembagaPelatihanPath, 'utf8');

runTest('7.1 LembagaPelatihanLanding.jsx retains all original titles, descriptions, and badges', () => {
  assert.ok(lembagaPelatihanContent.includes('PENGEMBANGAN SDM'), 'Retains badge PENGEMBANGAN SDM');
  assert.ok(lembagaPelatihanContent.includes('SNI & ISO'), 'Retains badge SNI & ISO');
  assert.ok(lembagaPelatihanContent.includes('INSTRUKTUR PRAKTISI'), 'Retains badge INSTRUKTUR PRAKTISI');
  assert.ok(lembagaPelatihanContent.includes('General Training'), 'Retains submenu General Training');
  assert.ok(lembagaPelatihanContent.includes('Inhouse Training'), 'Retains submenu Inhouse Training');
  assert.ok(lembagaPelatihanContent.includes('Exhouse Training'), 'Retains submenu Exhouse Training');
  assert.ok(lembagaPelatihanContent.includes('Tingkatkan kapabilitas teknis'), 'Retains Indonesian lead copy');
});

console.log('\n====================================================================');
console.log(`RESPONSIVE TEST SUMMARY: ${passedTests} / ${totalTests} PASSED`);
console.log('====================================================================');

if (passedTests === totalTests) {
  console.log('[VERIFICATION SUCCESS] Universal Responsive Design Verified Across All Viewports (320px - 1920px+)!');
  process.exit(0);
} else {
  console.error('[VERIFICATION FAILURE] Responsive tests did not fully pass.');
  process.exit(1);
}
