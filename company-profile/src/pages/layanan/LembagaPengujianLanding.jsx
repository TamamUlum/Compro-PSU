import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import BalancedGrid from "../../components/BalancedGrid";
import { useLanguage } from "../../context/useLanguage";
import "./ServiceLanding.css";

const SUBMENUS = [
  {
    title: "Legalitas & Akreditasi Laboratorium",
    titleEn: "Laboratory Legality & Accreditation",
    desc: "Sertifikat Akreditasi KAN LP-1554-IDN berbasis standar internasional SNI ISO/IEC 17025:2017.",
    descEn: "KAN LP-1554-IDN Accreditation Certificate based on international standard SNI ISO/IEC 17025:2017.",
    link: "/layanan/penguji/legalitas",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    title: "Ruang Lingkup Pengujian",
    titleEn: "Testing Scope & Parameters",
    desc: "Matriks pengujian parameter fisika, kimiawi, mikrobiologi, serta cemaran logam berat pada produk pangan dan industri.",
    descEn: "Testing matrices for physical, chemical, microbiological parameters, and heavy metal contaminants.",
    link: "/layanan/penguji/ruang-lingkup",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
  },
  {
    title: "Alur Proses Pengujian",
    titleEn: "Testing Process Workflow",
    desc: "Tahapan pengujian dari penerimaan sampel uji, kaji ulang teknis, preparasi, analisis instrumen, hingga LHU resmi.",
    descEn: "Workflow stages from sample reception, technical review, preparation, instrumental analysis, to test reports.",
    link: "/layanan/penguji/proses-pengujian",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
  },
  {
    title: "Biaya dan Penawaran Pengujian",
    titleEn: "Testing Fees & Quotation",
    desc: "Informasi rincian biaya uji parameter laboratorium dan formulir permintaan surat penawaran harga pengujian.",
    descEn: "Detailed testing fee structures per parameter and formal price quotation request forms.",
    link: "/layanan/penguji/biaya-sertif",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
  },
];

export default function LembagaPengujianLanding() {
  const { lang } = useLanguage();

  const title =
    lang === "en" ? "Testing Laboratory" : "Lembaga Pengujian (Laboratorium Uji)";
  const description =
    lang === "en"
      ? "PT Penilai Standar Uji operates a modern Testing Laboratory accredited by KAN (LP-1554-IDN) according to SNI ISO/IEC 17025:2017 for industrial and food products."
      : "Laboratorium Pengujian PT Penilai Standar Uji terakreditasi KAN nomor LP-1554-IDN berdasarkan SNI ISO/IEC 17025:2017 untuk pengujian mutu, kimia, dan keamanan produk industri.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical="/layanan/penguji"
        type="service"
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/penguji" },
          { label: title },
        ]}
        serviceData={{
          name: title,
          description: description,
          serviceType: "Testing Laboratory (SNI ISO/IEC 17025:2017)",
          image: "/lab_pengujian.webp",
        }}
        primaryImage="/lab_pengujian.webp"
        lang={lang}
      />

      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/penguji" },
          { label: title },
        ]}
      />

      <main className="service-landing">
        <div className="service-landing__hero">
          <div className="service-landing__hero-content">
            <div className="service-landing__badge-row">
              <span className="service-landing__badge">AKREDITASI KAN</span>
              <span className="service-landing__badge service-landing__badge--gold">LP-1554-IDN</span>
              <span className="service-landing__badge">SNI ISO/IEC 17025:2017</span>
            </div>
            <h1 className="service-landing__title">{title}</h1>
            <p className="service-landing__lead">
              {lang === "en"
                ? "Our modern testing laboratory provides accurate, repeatable, and technically sound analytical results. Supported by high-precision equipment and certified analysts, we evaluate compliance with national and international quality requirements."
                : "Laboratorium pengujian kami menghadirkan hasil analisis yang akurat, berulang, dan dapat dipertanggungjawabkan secara teknis. Didukung peralatan presisi tinggi dan analis tersertifikasi, kami melayani evaluasi mutu produk terhadap persyaratan standar nasional dan internasional."}
            </p>
            <div className="service-landing__hero-actions">
              <Link to="/layanan/penguji/proses-pengujian" className="service-landing__btn-primary">
                {lang === "en" ? "Testing Process \u2192" : "Alur Pengujian \u2192"}
              </Link>
              <Link to="/layanan/penguji/ruang-lingkup" className="service-landing__btn-secondary">
                {lang === "en" ? "Testing Parameters" : "Ruang Lingkup Parameter"}
              </Link>
            </div>
          </div>
          <div className="service-landing__hero-media">
            <img
              src="/lab_pengujian.webp"
              alt={title}
              className="service-landing__hero-img"
              loading="eager"
            />
          </div>
        </div>

        <div className="service-landing__section-header">
          <h2 className="service-landing__section-title">
            {lang === "en" ? "Testing Services & Information" : "Struktur Layanan Pengujian"}
          </h2>
          <p className="service-landing__section-subtitle">
            {lang === "en"
              ? "Select a section below to review legalities, testing scopes, workflows, and quotations."
              : "Pilih menu di bawah untuk melihat legalitas akreditasi, ruang lingkup parameter, alur kerja, dan penawaran biaya."}
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

        <div className="service-landing__commitment">
          <div className="service-landing__commitment-text">
            <h3>{lang === "en" ? "Data Integrity & Confidentiality" : "Integritas & Kerahasiaan Data Pengujian"}</h3>
            <p>
              {lang === "en"
                ? "Every test result is strictly confidential and protected through traceable quality controls adhering to ISO/IEC 17025:2017 requirements."
                : "Setiap laporan hasil pengujian ditangani secara rahasia dan terlindungi melalui kendali mutu yang tertelusur sesuai standar ISO/IEC 17025:2017."}
            </p>
          </div>
          <div className="service-landing__commitment-cta">
            <Link to="/kontak" className="service-landing__btn-primary">
              {lang === "en" ? "Inquire Testing" : "Konsultasi Pengujian"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

