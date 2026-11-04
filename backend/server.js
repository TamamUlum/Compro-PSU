const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const PORT = Number(process.env.PORT) || 5000;

const JWT_SECRET =
  process.env.JWT_SECRET || "psu_compro_super_secret_jwt_key_2026_x9A8b7C6d5E4";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

app.use(cors());
app.use(express.json({ limit: "25mb" }));

// Sajikan folder gambar berita secara statis agar bisa diakses langsung dari backend maupun Vite
const publicNewsDir = path.join(__dirname, "..", "company-profile", "public", "news");
const distNewsDir = path.join(__dirname, "..", "company-profile", "dist", "news");
fs.mkdirSync(publicNewsDir, { recursive: true });
app.use("/news", express.static(publicNewsDir));

const dbConfig = {
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "psu_company_profile",
  port: Number(process.env.DB_PORT) || 3306,
};

const TABLE_MAP = {
  "sertifikasi-produk": "sertifikat_produk",
  pengujian: "sertifikat_pengujian",
  kalibrasi: "sertifikat_kalibrasi",
  "sertifikasi-sistem-manajemen": "sertifikat_sistem_manajemen",
};

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
  return String(plainPassword) === storedHash;
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

function extractTokenFromHeader(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization || "";
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }
  if (req.headers["x-access-token"]) {
    return String(req.headers["x-access-token"]).trim();
  }
  return "";
}

function requireAdminAuth(req, res, next) {
  try {
    const token = extractTokenFromHeader(req);
    const decoded = verifyJwt(token);
    req.adminUser = decoded;
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
// FALLBACK IN-MEMORY DATA (JIKA MYSQL BELUM AKTIF SAAT PENGEMBANGAN)
// ============================================================================
let pool;
let dbConnected = false;

const fallbackStore = {
  users: [
    {
      id: 1,
      username: "admin",
      email: "admin@penilaistandaruji.com",
      password_hash: hashPassword("AdminPSU2026!"),
      full_name: "Administrator Utama PSU",
      role: "Super Admin",
      is_active: 1,
      last_login: null,
      created_at: new Date().toISOString(),
    },
    {
      id: 2,
      username: "redaksi",
      email: "redaksi@penilaistandaruji.com",
      password_hash: hashPassword("RedaksiPSU2026!"),
      full_name: "Tim Redaksi & Humas PSU",
      role: "Editor",
      is_active: 1,
      last_login: null,
      created_at: new Date().toISOString(),
    },
  ],
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

    // Alter table migrations bagi database artikel yang sudah ada sebelumnya
    const alterMigrations = [
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

    // Seed akun admin default
    const [existingAdmins] = await pool.query("SELECT COUNT(*) AS cnt FROM admin_users");
    if (existingAdmins[0].cnt === 0) {
      await pool.execute(
        `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
         VALUES (?, ?, ?, ?, ?, 1), (?, ?, ?, ?, ?, 1)`,
        [
          "admin",
          "admin@penilaistandaruji.com",
          hashPassword("AdminPSU2026!"),
          "Administrator Utama PSU",
          "Super Admin",
          "redaksi",
          "redaksi@penilaistandaruji.com",
          hashPassword("RedaksiPSU2026!"),
          "Tim Redaksi & Humas PSU",
          "Editor",
        ]
      );
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
app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    const identifier = String(username || "").trim();
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
    }

    if (!userRecord || !verifyPassword(rawPassword, userRecord.password_hash)) {
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

    const { token, expiresAt, expiresInSeconds } = signJwt({
      sub: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      full_name: userRecord.full_name,
      role: userRecord.role,
    });

    await logAdminActivity(
      userRecord.username,
      "LOGIN",
      `Login ke Dashboard Artikel (${userRecord.role})`,
      `Sesi JWT diterbitkan hingga ${expiresAt}`
    );

    return res.json({
      success: true,
      message: "Login berhasil! Selamat datang di Dashboard Artikel PSU.",
      token,
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
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memproses login.",
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

    if (dbConnected && pool) {
      await pool.execute(
        "UPDATE admin_users SET full_name = ?, email = ? WHERE id = ? OR username = ?",
        [full_name.trim(), email.trim(), sub || -1, username]
      );
    } else {
      const target = fallbackStore.users.find((u) => u.id === sub || u.username === username);
      if (target) {
        target.full_name = full_name.trim();
        target.email = email.trim();
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

app.put("/api/auth/password", requireAdminAuth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    const { sub, username } = req.adminUser;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password saat ini dan password baru wajib diisi.",
      });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password baru minimal 6 karakter.",
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
    if (dbConnected && pool) {
      await pool.execute("UPDATE admin_users SET password_hash = ? WHERE id = ?", [
        newHash,
        userRecord.id,
      ]);
    } else {
      userRecord.password_hash = newHash;
    }

    await logAdminActivity(
      username,
      "CHANGE_PASSWORD",
      username,
      "Mengubah password keamanan akun admin"
    );

    return res.json({
      success: true,
      message: "Password berhasil diperbarui!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengubah password.",
      error: error.message,
    });
  }
});

app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
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

app.post("/api/admin/users", requireAdminAuth, async (req, res) => {
  try {
    const { username, email, password, full_name, role } = req.body || {};
    if (!username || !email || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: "Username, email, nama lengkap, dan password wajib diisi.",
      });
    }

    const cleanRole = ["Super Admin", "Editor", "Author"].includes(role) ? role : "Editor";
    const passHash = hashPassword(password);

    if (dbConnected && pool) {
      const [result] = await pool.execute(
        `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [username.trim(), email.trim(), passHash, full_name.trim(), cleanRole]
      );
      await logAdminActivity(
        req.adminUser.username,
        "CREATE_ADMIN",
        username.trim(),
        `Menambahkan akun ${cleanRole} baru (${email.trim()})`
      );
      return res.status(201).json({
        success: true,
        message: "Akun admin baru berhasil ditambahkan.",
        data: {
          id: result.insertId,
          username: username.trim(),
          email: email.trim(),
          full_name: full_name.trim(),
          role: cleanRole,
          is_active: 1,
        },
      });
    }

    const newItem = {
      id: Date.now(),
      username: username.trim(),
      email: email.trim(),
      password_hash: passHash,
      full_name: full_name.trim(),
      role: cleanRole,
      is_active: 1,
      last_login: null,
      created_at: new Date().toISOString(),
    };
    fallbackStore.users.push(newItem);
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

app.post("/api/authors", requireAdminAuth, async (req, res) => {
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

app.delete("/api/authors/:id", requireAdminAuth, async (req, res) => {
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

app.post("/api/admin/tags/rename", requireAdminAuth, async (req, res) => {
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

app.post("/api/admin/tags/delete", requireAdminAuth, async (req, res) => {
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

app.post("/api/upload-gambar", requireAdminAuth, async (req, res) => {
  try {
    const { filename, dataUrl, title, alt_text, category } = req.body || {};
    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return res.status(400).json({
        success: false,
        message: "Format gambar tidak valid.",
      });
    }

    const matches = dataUrl.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
    if (!matches) {
      return res.status(400).json({
        success: false,
        message: "Data base64 gambar tidak valid.",
      });
    }

    let ext = matches[1].toLowerCase();
    if (ext === "jpeg") ext = "jpg";
    if (ext === "svg+xml") ext = "svg";
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    const rawBaseName = path.basename(filename || "berita", path.extname(filename || ""));
    const safeBase = slugifyTitle(rawBaseName) || "berita";
    const finalName = `${safeBase}-${Date.now()}.${ext}`;

    fs.mkdirSync(publicNewsDir, { recursive: true });
    fs.writeFileSync(path.join(publicNewsDir, finalName), buffer);

    // Salin juga ke dist/news jika folder dist ada
    try {
      if (fs.existsSync(path.join(__dirname, "..", "company-profile", "dist"))) {
        fs.mkdirSync(distNewsDir, { recursive: true });
        fs.writeFileSync(path.join(distNewsDir, finalName), buffer);
      }
    } catch {
      // Ignore dist copy error
    }

    const imageUrl = `/news/${finalName}`;
    const cleanTitle =
      (title && String(title).trim()) ||
      rawBaseName.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

    const mediaItem = await ensureGalleryEntry({
      title: cleanTitle,
      filename: finalName,
      image_url: imageUrl,
      category: category || "Artikel Upload",
      alt_text: alt_text || cleanTitle,
      file_size: buffer.length,
      mime_type: `image/${ext === "jpg" ? "jpeg" : ext}`,
      uploaded_by: req.adminUser?.full_name || req.adminUser?.username || "Admin PSU",
    });

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "UPLOAD_MEDIA",
      cleanTitle,
      `Mengunggah foto baru ke Galeri: ${imageUrl} (${Math.round(buffer.length / 1024)} KB)`
    );

    return res.json({
      success: true,
      message: "Foto berhasil diunggah dan disimpan ke Galeri Foto.",
      image_url: imageUrl,
      media: mediaItem,
    });
  } catch (error) {
    console.error("Upload gambar error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan file gambar.",
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

app.delete("/api/galeri/:id", requireAdminAuth, async (req, res) => {
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
app.get("/api/artikel", async (req, res) => {
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

    let baseSlug = slugifyTitle(custom_slug || title_id) || `artikel-${Date.now()}`;
    let slug = baseSlug;

    const cleanCategory = ["News", "Article", "Press Release"].includes(category)
      ? category
      : "News";
    const cleanStatus = status === "Draft" ? "Draft" : "Published";
    const cleanAuthor = author || AUTHOR_OPTIONS[0];
    const cleanDate = published_at || new Date().toISOString().slice(0, 10);
    const cleanImage = image_url || "/Logo_PSU_banner1.webp";
    const cleanFeatured = is_featured ? 1 : 0;
    const cleanTags =
      Array.isArray(tags) && tags.length > 0 ? tags : [cleanCategory, "PT Penilai Standar Uji"];
    const cleanExcerptId =
      excerpt_id || String(content_id).replace(/\s+/g, " ").trim().slice(0, 190) + "...";
    const cleanExcerptEn = excerpt_en || cleanExcerptId;

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
          title_id,
          title_en || title_id,
          cleanExcerptId,
          cleanExcerptEn,
          content_id,
          content_en || content_id,
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
        title_id,
        title_en: title_en || title_id,
        excerpt_id: cleanExcerptId,
        excerpt_en: cleanExcerptEn,
        content_id,
        content_en: content_en || content_id,
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
      title: `Sampul: ${String(title_id).slice(0, 55)}`,
      filename: path.basename(cleanImage),
      image_url: cleanImage,
      category: cleanImage.startsWith("/news/") ? "Artikel Upload" : "Banner Default",
      alt_text: title_id,
      uploaded_by: req.adminUser?.full_name || cleanAuthor,
    });

    await logAdminActivity(
      req.adminUser?.username || "admin",
      "CREATE_ARTICLE",
      title_id,
      `Menambahkan ${cleanCategory} baru [${cleanStatus}] oleh ${cleanAuthor}`
    );

    return res.status(201).json({
      success: true,
      message: "Artikel berhasil ditambahkan.",
      data: {
        id: newId,
        slug,
        title_id,
        title_en: title_en || title_id,
        excerpt_id: cleanExcerptId,
        excerpt_en: cleanExcerptEn,
        content_id,
        content_en: content_en || content_id,
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

    const finalTitleId = title_id || current.title_id;
    const finalTitleEn = title_en || finalTitleId;
    const finalContentId = content_id || current.content_id;
    const finalContentEn = content_en || finalContentId;
    const finalExcerptId =
      excerpt_id ||
      String(finalContentId).replace(/\s+/g, " ").trim().slice(0, 190) + "...";
    const finalExcerptEn = excerpt_en || finalExcerptId;
    const finalImage = image_url || current.image_url;
    const finalAuthor = author || current.author || AUTHOR_OPTIONS[0];
    const finalCategory = ["News", "Article", "Press Release"].includes(category)
      ? category
      : current.category;
    const finalStatus = status === "Draft" ? "Draft" : "Published";
    const finalFeatured =
      typeof is_featured !== "undefined" ? (is_featured ? 1 : 0) : Number(current.is_featured) || 0;
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

app.patch("/api/artikel/:identifier/status", requireAdminAuth, async (req, res) => {
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
      return res.json({
        success: true,
        message: `${cleanIds.length} artikel berhasil dihapus.`,
      });
    }

    if (action === "publish" || action === "draft") {
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

app.delete("/api/artikel/:identifier", requireAdminAuth, async (req, res) => {
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
// ENDPOINT PENCARIAN SERTIFIKAT PELANGGAN
// ============================================================================
app.get("/api/sertifikat/:submenu", async (req, res) => {
  const { submenu } = req.params;
  const noSertifikat = (req.query.no_sertifikat || "").trim();

  const tableName = TABLE_MAP[submenu];
  if (!tableName) {
    return res.status(400).json({
      success: false,
      message: "Kategori sub menu client tidak valid.",
    });
  }

  if (!noSertifikat) {
    return res.status(400).json({
      success: false,
      message: "Nomor sertifikat wajib diisi.",
    });
  }

  try {
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

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        found: false,
        data: [],
        message: `Nomor sertifikat "${noSertifikat}" tidak ditemukan pada layanan ini.`,
      });
    }

    return res.json({
      success: true,
      found: true,
      data: rows,
    });
  } catch (error) {
    console.error("Database query error:", error.message);
    return res.status(500).json({
      success: false,
      message:
        "Gagal terhubung ke database MySQL (" +
        error.message +
        "). Pastikan MySQL di XAMPP sudah Start.",
      error: error.message,
    });
  }
});

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server API Tracking Sertifikat & Dashboard Artikel berjalan di http://127.0.0.1:${PORT}`
    );
  });
});
