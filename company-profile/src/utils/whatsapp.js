/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) — CONTEXTUAL WHATSAPP HELPER & ROUTE MAPPING
 * ============================================================================
 * Menyediakan pemetaan pesan dinamis kontekstual berdasarkan halaman (pathname)
 * untuk seluruh tombol WhatsApp dan floating widget resmi PT PSU.
 * ============================================================================
 */

export const WHATSAPP_NUMBER = "6281908344114";
export const WHATSAPP_DISPLAY_NUMBER = "+62 819-0834-4114";

export const WHATSAPP_MESSAGES_ID = {
  "/": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian laboratorium, kalibrasi, dan sertifikasi produk.",
  "/about/profile": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mendapatkan informasi lebih lanjut mengenai profil dan layanan PT PSU.",
  "/about/struktur-organisasi": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi dengan tim manajemen PT PSU terkait kerja sama layanan.",
  "/kontak": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menghubungi tim layanan pelanggan PT PSU untuk konsultasi kebutuhan perusahaan kami.",
  "/artikel": "Hallo, Admin PT. Penilai Standar Uji. Saya membaca publikasi artikel di website PT PSU dan ingin berkonsultasi lebih lanjut.",
  "/client": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menanyakan validasi dan informasi tracking sertifikat klien PT PSU.",
  "/client/sertifikasi-produk": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin melakukan konfirmasi data sertifikasi produk LSPro.",
  "/client/pengujian": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin melakukan konfirmasi laporan hasil pengujian laboratorium.",
  "/client/kalibrasi": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin melakukan konfirmasi sertifikat kalibrasi alat kesehatan.",
  "/client/sertifikasi-sistem-manajemen": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin melakukan konfirmasi sertifikat sistem manajemen PT PSU.",

  // Sektor Industri
  "/pertanian": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian dan sertifikasi untuk sektor Pertanian dan Pupuk.",
  "/tanaman": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian dan sertifikasi untuk sektor Tanaman dan Benih.",
  "/pangan": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian dan sertifikasi untuk sektor Produk Pangan Olahan.",
  "/kimia": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian dan sertifikasi untuk sektor Produk Kimia Industri.",
  "/logam": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan sertifikasi produk logam (Cookware, Flatware, dan Foodtray).",
  "/jasa-lainnya": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai layanan pengujian khusus dan inspeksi teknis lainnya.",

  // Lembaga Sertifikasi Produk (LSPro)
  "/lspro": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta info detail tentang layanan sertifikasi produk (LSPro).",
  "/layanan/sertif-produk": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta info detail tentang layanan sertifikasi produk (LSPro).",
  "/layanan/sertif-produk/legalitas": "Hallo, Admin PT. Penilai Standar Uji. Saya mau bertanya mengenai legalitas dan akreditasi KAN Lembaga Sertifikasi Produk (LSPro) PT PSU.",
  "/layanan/sertif-produk/ruang-lingkup": "Hallo, Admin PT. Penilai Standar Uji. Saya mau meminta informasi daftar ruang lingkup komoditas sertifikasi produk SNI di PT PSU.",
  "/layanan/sertif-produk/permohonan-sertifikasi": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin konsultasi pengajuan formulir permohonan sertifikasi produk baru.",
  "/layanan/sertif-produk/tipe-1b": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi detail mengenai skema sertifikasi produk Tipe 1B (Batch/Lot).",
  "/layanan/sertif-produk/tipe-5": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi detail mengenai skema sertifikasi produk Tipe 5 (Audit Pabrik & Uji Berkala).",
  "/layanan/sertif-produk/penggunaan-sni": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai ketentuan dan tata cara pembubuhan tanda SNI pada produk.",
  "/layanan/sertif-produk/keluhan-banding": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menyampaikan pertanyaan atau keluhan terkait proses sertifikasi produk.",
  "/layanan/sertif-produk/hak-kewajiban-klien": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin memahami hak dan kewajiban klien pemegang sertifikat produk PT PSU.",
  "/layanan/sertif-produk/biaya-sertif": "Hallo, Admin PT. Penilai Standar Uji. Saya mau meminta informasi rincian biaya dan penawaran sertifikasi produk SNI.",

  // Lembaga Pengujian
  "/layanan/penguji": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi mengenai layanan laboratorium pengujian.",
  "/layanan/penguji/legalitas": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mengetahui legalitas dan akreditasi laboratorium pengujian PT PSU.",
  "/layanan/penguji/ruang-lingkup": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menanyakan parameter dan ruang lingkup pengujian laboratorium PT PSU.",
  "/layanan/penguji/proses-pengujian": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mengetahui alur dan tahapan proses pengujian sampel produk di Laboratorium PSU.",
  "/layanan/penguji/biaya-sertif": "Hallo, Admin PT. Penilai Standar Uji. Saya mau meminta informasi biaya dan penawaran layanan pengujian produk.",

  // Lembaga Kalibrasi
  "/layanan/kalibrasi": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi mengenai layanan laboratorium kalibrasi.",
  "/layanan/kalibrasi/legalitas": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mengetahui legalitas dan sertifikasi operasional laboratorium kalibrasi PT PSU.",
  "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menanyakan daftar ruang lingkup kalibrasi alat kesehatan di PT PSU.",
  "/layanan/kalibrasi/biaya-sertif": "Hallo, Admin PT. Penilai Standar Uji. Saya mau meminta informasi biaya dan penawaran layanan kalibrasi alat kesehatan.",

  // Lembaga Sertifikasi Sistem Manajemen (LSSM)
  "/layanan/sertif-manajemen": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta info detail tentang layanan sertifikasi sistem manajemen (ISO 9001, 14001, 22000).",
  "/layanan/sertif-manajemen/legalitas": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mengetahui legalitas dan akreditasi Lembaga Sertifikasi Sistem Manajemen (LSSM) PT PSU.",
  "/layanan/sertif-manajemen/ruang-lingkup": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin mengetahui ruang lingkup sertifikasi ISO 9001, ISO 14001, dan ISO 22000 di PT PSU.",
  "/layanan/sertif-manajemen/proses-sertifikasi": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin berkonsultasi mengenai tahapan audit dan proses sertifikasi sistem manajemen.",
  "/layanan/sertif-manajemen/keluhan-banding": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin menanyakan prosedur keluhan dan banding sertifikasi sistem manajemen.",
  "/layanan/sertif-manajemen/hak-kewajiban-klien": "Hallo, Admin PT. Penilai Standar Uji. Saya ingin memahami hak dan kewajiban klien sertifikasi sistem manajemen.",
  "/layanan/sertif-manajemen/biaya-sertif": "Hallo, Admin PT. Penilai Standar Uji. Saya mau meminta informasi biaya dan penawaran sertifikasi sistem manajemen.",

  // Lembaga Pelatihan
  "/layanan/pelatihan": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi mengenai layanan lembaga pelatihan personel dan mutu.",
  "/layanan/pelatihan/general-training": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi detail tentang program General Training (pelatihan publik terbuka).",
  "/layanan/pelatihan/inhouse-training": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi detail dan penawaran program Inhouse Training untuk perusahaan kami.",
  "/layanan/pelatihan/exhouse-training": "Hallo, Admin PT. Penilai Standar Uji. Saya mau minta informasi detail tentang program Exhouse Training teknis laboratorium PT PSU.",
};

export const WHATSAPP_MESSAGES_EN = {
  "/": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about laboratory testing, calibration, and product certification services.",
  "/about/profile": "Hello, Admin PT. Penilai Standar Uji. I would like more information regarding PT PSU's corporate profile and services.",
  "/about/struktur-organisasi": "Hello, Admin PT. Penilai Standar Uji. I would like to consult with PT PSU's management regarding service cooperation.",
  "/kontak": "Hello, Admin PT. Penilai Standar Uji. I would like to reach PT PSU's customer service team for consultation on our company's needs.",
  "/artikel": "Hello, Admin PT. Penilai Standar Uji. I read an article on PT PSU's website and would like to ask further questions.",
  "/client": "Hello, Admin PT. Penilai Standar Uji. I would like to verify certificate validation and status for PT PSU clients.",
  "/client/sertifikasi-produk": "Hello, Admin PT. Penilai Standar Uji. I would like to confirm LSPro product certification data.",
  "/client/pengujian": "Hello, Admin PT. Penilai Standar Uji. I would like to confirm a laboratory test report.",
  "/client/kalibrasi": "Hello, Admin PT. Penilai Standar Uji. I would like to confirm a medical equipment calibration certificate.",
  "/client/sertifikasi-sistem-manajemen": "Hello, Admin PT. Penilai Standar Uji. I would like to confirm a management system certificate.",

  // Industrial Sectors
  "/pertanian": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about testing and certification services for Agriculture and Fertilizer sector.",
  "/tanaman": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about testing and certification services for Crops and Seed sector.",
  "/pangan": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about testing and certification services for Processed Food sector.",
  "/kimia": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about testing and certification services for Industrial Chemicals sector.",
  "/logam": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about metal product certification (Cookware, Flatware, and Foodtray).",
  "/jasa-lainnya": "Hello, Admin PT. Penilai Standar Uji. I would like to consult about specialized testing and other technical inspection services.",

  // Services
  "/lspro": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information regarding Product Certification Body (LSPro) services.",
  "/layanan/sertif-produk": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information regarding Product Certification Body (LSPro) services.",
  "/layanan/sertif-produk/legalitas": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about the legality and KAN accreditation of LSPro PT PSU.",
  "/layanan/sertif-produk/ruang-lingkup": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding the scope of SNI product certification commodities at PT PSU.",
  "/layanan/sertif-produk/permohonan-sertifikasi": "Hello, Admin PT. Penilai Standar Uji. I would like to consult on submitting a new product certification application.",
  "/layanan/sertif-produk/tipe-1b": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding Type 1B (Batch/Lot) product certification scheme.",
  "/layanan/sertif-produk/tipe-5": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding Type 5 (Factory Audit & Periodic Testing) certification scheme.",
  "/layanan/sertif-produk/penggunaan-sni": "Hello, Admin PT. Penilai Standar Uji. I would like to consult regarding the rules and procedures for using the SNI mark.",
  "/layanan/sertif-produk/keluhan-banding": "Hello, Admin PT. Penilai Standar Uji. I would like to submit an inquiry or complaint regarding product certification services.",
  "/layanan/sertif-produk/hak-kewajiban-klien": "Hello, Admin PT. Penilai Standar Uji. I would like to understand the rights and obligations of PT PSU product certificate holders.",
  "/layanan/sertif-produk/biaya-sertif": "Hello, Admin PT. Penilai Standar Uji. I would like to request fee information and a formal quotation for SNI product certification.",

  "/layanan/penguji": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding testing laboratory services.",
  "/layanan/penguji/legalitas": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about the legality and accreditation of PT PSU's testing laboratory.",
  "/layanan/penguji/ruang-lingkup": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about testing parameters and scope at PT PSU Laboratory.",
  "/layanan/penguji/proses-pengujian": "Hello, Admin PT. Penilai Standar Uji. I would like to know the process and stages for product sample testing at PSU Laboratory.",
  "/layanan/penguji/biaya-sertif": "Hello, Admin PT. Penilai Standar Uji. I would like to request quotation and fee information for product testing services.",

  "/layanan/kalibrasi": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding calibration laboratory services.",
  "/layanan/kalibrasi/legalitas": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about the operational legality of PT PSU's calibration laboratory.",
  "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about the scope of medical equipment calibration at PT PSU.",
  "/layanan/kalibrasi/biaya-sertif": "Hello, Admin PT. Penilai Standar Uji. I would like to request fee information and a quotation for calibration services.",

  "/layanan/sertif-manajemen": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information regarding management system certification (ISO 9001, 14001, 22000).",
  "/layanan/sertif-manajemen/legalitas": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about the legality and accreditation of LSSM PT PSU.",
  "/layanan/sertif-manajemen/ruang-lingkup": "Hello, Admin PT. Penilai Standar Uji. I would like to know the scope of ISO 9001, 14001, and 22000 certifications at PT PSU.",
  "/layanan/sertif-manajemen/proses-sertifikasi": "Hello, Admin PT. Penilai Standar Uji. I would like to consult on the audit stages and certification process for management systems.",
  "/layanan/sertif-manajemen/keluhan-banding": "Hello, Admin PT. Penilai Standar Uji. I would like to inquire about complaints and appeals procedures for management system certification.",
  "/layanan/sertif-manajemen/hak-kewajiban-klien": "Hello, Admin PT. Penilai Standar Uji. I would like to understand client rights and obligations for management system certification.",
  "/layanan/sertif-manajemen/biaya-sertif": "Hello, Admin PT. Penilai Standar Uji. I would like to request fee information and a quotation for management system certification.",

  "/layanan/pelatihan": "Hello, Admin PT. Penilai Standar Uji. I would like information regarding training institution services.",
  "/layanan/pelatihan/general-training": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information regarding the General Training program (open public courses).",
  "/layanan/pelatihan/inhouse-training": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information and a quotation for an Inhouse Training program for our organization.",
  "/layanan/pelatihan/exhouse-training": "Hello, Admin PT. Penilai Standar Uji. I would like detailed information regarding the technical Exhouse Training program at PT PSU.",
};

/**
 * Mengembalikan pesan WhatsApp tekstual sesuai rute dan bahasa aktif
 */
export function getWhatsAppMessage(pathname = "/", lang = "id") {
  const cleanPath = String(pathname || "/").split("?")[0].split("#")[0].replace(/\/+$/, "") || "/";
  const messages = lang === "en" ? WHATSAPP_MESSAGES_EN : WHATSAPP_MESSAGES_ID;

  if (messages[cleanPath]) {
    return messages[cleanPath];
  }

  // Cek jika halaman adalah artikel dinamis /artikel/:slug
  if (cleanPath.startsWith("/artikel/")) {
    return lang === "en"
      ? "Hello, Admin PT. Penilai Standar Uji. I am interested in an article on your website and would like to consult further."
      : "Hallo, Admin PT. Penilai Standar Uji. Saya membaca artikel di website PT PSU dan ingin berkonsultasi lebih lanjut.";
  }

  // Fallback default
  return lang === "en"
    ? "Hello, Admin PT. Penilai Standar Uji. I would like to request further information regarding PT PSU's services."
    : "Hallo, Admin PT. Penilai Standar Uji. Saya ingin meminta informasi lebih lanjut mengenai layanan PT PSU.";
}

/**
 * Menghasilkan tautan URL WhatsApp resmi lengkap dengan query text ter-encode
 */
export function getWhatsAppUrl(pathname = "/", customText = null, lang = "id") {
  const message = customText && typeof customText === "string" && customText.trim().length > 0
    ? customText.trim()
    : getWhatsAppMessage(pathname, lang);

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default {
  WHATSAPP_NUMBER,
  WHATSAPP_DISPLAY_NUMBER,
  WHATSAPP_MESSAGES_ID,
  WHATSAPP_MESSAGES_EN,
  getWhatsAppMessage,
  getWhatsAppUrl,
};

