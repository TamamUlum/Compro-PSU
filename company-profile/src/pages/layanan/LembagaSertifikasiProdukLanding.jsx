import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import BalancedGrid from "../../components/BalancedGrid";
import { useLanguage } from "../../context/useLanguage";
import "./ServiceLanding.css";

const SUBMENUS = [
  {
    title: "Legalitas & Akreditasi",
    titleEn: "Legality & Accreditation",
    desc: "Sertifikat Akreditasi KAN LSPr-051-IDN (SNI ISO/IEC 17065:2012) dan Nomor Induk Berusaha (NIB) operasional.",
    descEn: "KAN LSPr-051-IDN Accreditation Certificate (SNI ISO/IEC 17065:2012) and official business license.",
    link: "/layanan/sertif-produk/legalitas",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    title: "Ruang Lingkup Sertifikasi",
    titleEn: "Certification Scope",
    desc: "Daftar komoditas produk industri pangan, perkebunan, kimia, pupuk, dan logam yang dilayani sertifikasi SNI.",
    descEn: "List of industrial commodities in food, agriculture, chemicals, fertilizers, and metals certified for SNI.",
    link: "/layanan/sertif-produk/ruang-lingkup",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
  },
  {
    title: "Permohonan Sertifikasi",
    titleEn: "Certification Application",
    desc: "Prosedur pengajuan permohonan sertifikasi produk SPPT-SNI, kelengkapan berkas, dan verifikasi dokumen legalitas.",
    descEn: "Application procedure for SPPT-SNI product certification, checklist, and legal document verification.",
    link: "/layanan/sertif-produk/permohonan-sertifikasi",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
    ),
  },
  {
    title: "Skema Proses Sertifikasi Tipe 1B",
    titleEn: "Type 1B Certification Scheme",
    desc: "Sertifikasi kesesuaian produk berbasis pengujian contoh setiap batch/lot sebelum diedarkan ke pasar.",
    descEn: "Product conformity certification based on testing samples representing each consignment or batch/lot.",
    link: "/layanan/sertif-produk/tipe-1b",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
  },
  {
    title: "Skema Proses Sertifikasi Tipe 5",
    titleEn: "Type 5 Certification Scheme",
    desc: "Sertifikasi komprehensif mencakup audit sistem manajemen mutu di pabrik serta pengujian berkala produk.",
    descEn: "Comprehensive certification covering factory quality management system audit and periodic surveillance testing.",
    link: "/layanan/sertif-produk/tipe-5",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
  },
  {
    title: "Ketentuan Penggunaan Tanda SNI",
    titleEn: "SNI Mark Usage Rules",
    desc: "Panduan dan regulasi resmi mengenai tata cara pembubuhan tanda SNI pada produk dan kemasan komersial.",
    descEn: "Official regulatory guidelines on applying the SNI certification mark on products and commercial packaging.",
    link: "/layanan/sertif-produk/penggunaan-sni",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
      </svg>
    ),
  },
  {
    title: "Keluhan dan Banding",
    titleEn: "Complaints & Appeals",
    desc: "Saluran dan prosedur formal penanganan keluhan mutu layanan serta permohonan banding atas keputusan sertifikasi.",
    descEn: "Formal procedure for submitting client complaints and appeals regarding certification decisions.",
    link: "/layanan/sertif-produk/keluhan-banding",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    ),
  },
  {
    title: "Hak dan Kewajiban Klien",
    titleEn: "Client Rights & Obligations",
    desc: "Ketentuan hukum hak, tanggung jawab, dan kewajiban pemegang sertifikat kesesuaian produk SPPT-SNI.",
    descEn: "Legal terms, responsibilities, and obligations of certified clients holding SPPT-SNI licenses.",
    link: "/layanan/sertif-produk/hak-kewajiban-klien",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
        <circle cx="9" cy="7" r="4"></circle>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
      </svg>
    ),
  },
  {
    title: "Biaya dan Penawaran Sertifikasi",
    titleEn: "Certification Fees & Quotation",
    desc: "Transparansi komponen biaya audit, sampling contoh, pengujian laboratorium, dan penerbitan sertifikat.",
    descEn: "Transparent breakdown of audit, sampling, laboratory testing, and certificate issuance fee components.",
    link: "/layanan/sertif-produk/biaya-sertif",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
  },
];

export default function LembagaSertifikasiProdukLanding() {
  const { lang } = useLanguage();

  const title =
    lang === "en"
      ? "Product Certification Body (LSPro)"
      : "Lembaga Sertifikasi Produk (LSPro)";
  const description =
    lang === "en"
      ? "PT Penilai Standar Uji operates a KAN-accredited Product Certification Body (LSPr-051-IDN) according to SNI ISO/IEC 17065:2012, delivering certified product conformity assessment (SPPT-SNI)."
      : "Lembaga Sertifikasi Produk (LSPro) PT Penilai Standar Uji terakreditasi KAN nomor LSPr-051-IDN (SNI ISO/IEC 17065:2012) untuk layanan sertifikasi kesesuaian tanda SNI produk industri nasional.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical="/lspro"
        type="service"
        breadcrumbs={[
          { label: "Layanan", href: "/lspro" },
          { label: title },
        ]}
        serviceData={{
          name: title,
          description: description,
          serviceType: "Product Certification Body (LSPro - SPPT SNI)",
          image: "/LSPro.webp",
        }}
        primaryImage="/LSPro.webp"
        lang={lang}
      />

      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: "Layanan", href: "/lspro" },
          { label: title },
        ]}
      />

      <main className="service-landing">
        {/* Hero Section */}
        <div className="service-landing__hero">
          <div className="service-landing__hero-content">
            <div className="service-landing__badge-row">
              <span className="service-landing__badge">AKREDITASI KAN</span>
              <span className="service-landing__badge service-landing__badge--gold">LSPr-051-IDN</span>
              <span className="service-landing__badge">SNI ISO/IEC 17065:2012</span>
            </div>
            <h1 className="service-landing__title">{title}</h1>
            <p className="service-landing__lead">
              {lang === "en"
                ? "PT Penilai Standar Uji (PSU) delivers independent and impartial product conformity certification against Indonesian National Standards (SNI). Our accredited scope encompasses food and beverage commodities, agricultural products, chemical fertilizers, metallic cookware, and industrial materials."
                : "PT Penilai Standar Uji (PSU) menyediakan layanan sertifikasi kesesuaian produk secara kompeten, independen, dan tidak berpihak terhadap Standar Nasional Indonesia (SNI). Cakupan akreditasi kami melayani komoditas pangan, perkebunan, pupuk kimia, peralatan masak logam, dan barang teknik industri."}
            </p>
            <div className="service-landing__hero-actions">
              <Link to="/layanan/sertif-produk/permohonan-sertifikasi" className="service-landing__btn-primary">
                {lang === "en" ? "Apply for Certification \u2192" : "Ajukan Permohonan Sertifikasi \u2192"}
              </Link>
              <Link to="/layanan/sertif-produk/ruang-lingkup" className="service-landing__btn-secondary">
                {lang === "en" ? "View Product Scope" : "Lihat Ruang Lingkup Produk"}
              </Link>
            </div>
          </div>
          <div className="service-landing__hero-media">
            <img
              src="/LSPro.webp"
              alt={title}
              className="service-landing__hero-img"
              loading="eager"
            />
          </div>
        </div>

        {/* Section Submenu Grid */}
        <div className="service-landing__section-header">
          <h2 className="service-landing__section-title">
            {lang === "en" ? "Information & Certification Structure" : "Struktur & Informasi Layanan LSPro"}
          </h2>
          <p className="service-landing__section-subtitle">
            {lang === "en"
              ? "Access full technical guidance, certification schemes, legal documentation, and client terms below."
              : "Akses panduan teknis lengkap, skema sertifikasi, dokumen legalitas, dan ketentuan klien di bawah ini."}
          </p>
        </div>

        <BalancedGrid
          items={SUBMENUS}
          className="service-landing__balanced-grid"
          renderItem={(item) => (
            <Link to={item.link} key={item.link} className="service-landing__card">
              <div className="service-landing__card-icon">{item.icon}</div>
              <h3 className="service-landing__card-title">
                {lang === "en" ? item.titleEn : item.title}
              </h3>
              <p className="service-landing__card-desc">
                {lang === "en" ? item.descEn : item.desc}
              </p>
              <span className="service-landing__card-arrow">
                {lang === "en" ? "Open Details \u2192" : "Buka Informasi \u2192"}
              </span>
            </Link>
          )}
        />

        {/* Quality Commitment Box */}
        <div className="service-landing__commitment">
          <div className="service-landing__commitment-text">
            <h3>{lang === "en" ? "Commitment to Impartiality & Integrity" : "Komitmen Ketidakberpihakan & Integritas"}</h3>
            <p>
              {lang === "en"
                ? "PT Penilai Standar Uji upholds the highest ethical standards, ensuring all product certification evaluations are free from commercial or financial conflicts of interest."
                : "PT Penilai Standar Uji menjunjung tinggi standar etika tertinggi, memastikan seluruh evaluasi sertifikasi produk bebas dari konflik kepentingan finansial maupun komersial."}
            </p>
          </div>
          <div className="service-landing__commitment-cta">
            <Link to="/kontak" className="service-landing__btn-primary">
              {lang === "en" ? "Contact Helpdesk" : "Hubungi Layanan Klien"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

