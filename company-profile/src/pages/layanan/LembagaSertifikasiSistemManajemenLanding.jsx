import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import BalancedGrid from "../../components/BalancedGrid";
import { useLanguage } from "../../context/useLanguage";
import "./ServiceLanding.css";

const SUBMENUS = [
  {
    title: "Legalitas & Prinsip Audit LSSM",
    titleEn: "LSSM Legality & Audit Principles",
    desc: "Landasan operasional, komitmen integritas, dan prinsip ketidakberpihakan dalam pelaksanaan audit sistem manajemen.",
    descEn: "Operational foundation, integrity commitments, and impartiality principles in management system auditing.",
    link: "/layanan/sertif-manajemen/legalitas",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    title: "Ruang Lingkup Sistem Manajemen",
    titleEn: "Management System Scope",
    desc: "Cakupan standar sistem manajemen mutu ISO 9001, lingkungan ISO 14001, keamanan pangan ISO 22000, dan lainnya.",
    descEn: "Scope of ISO 9001 (Quality), ISO 14001 (Environment), ISO 22000 (Food Safety), and related standards.",
    link: "/layanan/sertif-manajemen/ruang-lingkup",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
  },
  {
    title: "Tahapan Proses Sertifikasi",
    titleEn: "Certification Process Stages",
    desc: "Alur audit Stage 1 (kecukupan dokumen), Stage 2 (audit lapangan), penerbitan sertifikat, dan audit surveilan tahunan.",
    descEn: "Workflow covering Stage 1 document review, Stage 2 on-site audit, certification decision, and surveillance audits.",
    link: "/layanan/sertif-manajemen/proses-sertifikasi",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
      </svg>
    ),
  },
  {
    title: "Keluhan dan Banding",
    titleEn: "Complaints & Appeals",
    desc: "Prosedur resmi penanganan ketidakpuasan klien atau permohonan banding terhadap hasil temuan dan keputusan audit.",
    descEn: "Formal channels for submitting complaints or appealing audit findings and certification decisions.",
    link: "/layanan/sertif-manajemen/keluhan-banding",
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
    desc: "Kewajiban pemeliharaan konsistensi sistem manajemen, penggunaan logo sertifikasi, dan hak klien tersertifikasi.",
    descEn: "Obligations for maintaining management system integrity, certification mark rules, and client entitlements.",
    link: "/layanan/sertif-manajemen/hak-kewajiban-klien",
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
    desc: "Penjelasan dasar perhitungan man-days auditor berdasarkan kompleksitas organisasi serta formulir permintaan penawaran.",
    descEn: "Basis of audit man-days calculation depending on organization size and formal quote request guidelines.",
    link: "/layanan/sertif-manajemen/biaya-sertif",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
  },
];

export default function LembagaSertifikasiSistemManajemenLanding() {
  const { lang, t } = useLanguage();

  const title =
    lang === "en"
      ? "Management System Certification Body (LSSM)"
      : "Lembaga Sertifikasi Sistem Manajemen (LSSM)";
  const description =
    lang === "en"
      ? "PT Penilai Standar Uji provides independent management system certification services helping organizations achieve international compliance (ISO 9001, ISO 14001, ISO 22000)."
      : "Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji melayani audit dan sertifikasi sistem manajemen mutu ISO 9001, ISO 14001, dan ISO 22000 untuk daya saing industri.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical="/layanan/sertif-manajemen"
        type="service"
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/sertif-manajemen" },
          { label: title },
        ]}
        serviceData={{
          name: title,
          description: description,
          serviceType: "Management System Certification Body (LSSM)",
          image: "/sistem_manajemen_mutu.webp",
        }}
        primaryImage="/sistem_manajemen_mutu.webp"
        lang={lang}
      />

      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/sertif-manajemen" },
          { label: title },
        ]}
      />

      <main className="service-landing">
        <div className="service-landing__hero">
          <div className="service-landing__hero-content">
            <div className="service-landing__badge-row">
              <span className="service-landing__badge">{t("SISTEM MANAJEMEN")}</span>
              <span className="service-landing__badge service-landing__badge--gold">ISO 9001 | ISO 14001</span>
              <span className="service-landing__badge">ISO 22000</span>
            </div>
            <h1 className="service-landing__title">{title}</h1>
            <p className="service-landing__lead">
              {lang === "en"
                ? "We support organizations across manufacturing, agriculture, food processing, and public services to build sustainable, efficient, and resilient management systems aligned with global best practices."
                : "Kami mendampingi dan mengaudit organisasi di berbagai sektor industri manufaktur, pertanian, pengolahan pangan, hingga jasa publik dalam membangun tata kelola sistem manajemen yang berkelanjutan, efisien, dan selaras dengan standar internasional."}
            </p>
            <div className="service-landing__hero-actions">
              <Link to="/layanan/sertif-manajemen/proses-sertifikasi" className="service-landing__btn-primary">
                {lang === "en" ? "Audit Process \u2192" : "Alur Proses Audit \u2192"}
              </Link>
              <Link to="/layanan/sertif-manajemen/ruang-lingkup" className="service-landing__btn-secondary">
                {lang === "en" ? "Certification Scopes" : "Ruang Lingkup Standar"}
              </Link>
            </div>
          </div>
          <div className="service-landing__hero-media">
            <img
              src="/sistem_manajemen_mutu.webp"
              alt={title}
              className="service-landing__hero-img"
              loading="eager"
            />
          </div>
        </div>

        <div className="service-landing__section-header">
          <h2 className="service-landing__section-title">
            {lang === "en" ? "Management System Submenu Structure" : "Struktur Layanan Sertifikasi Sistem"}
          </h2>
          <p className="service-landing__section-subtitle">
            {lang === "en"
              ? "Access full audit procedures, legal compliance, client rights, and fee structures below."
              : "Akses prosedur audit lengkap, landasan legalitas, hak kewajiban klien, dan skema pembiayaan di bawah ini."}
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
            <h3>{lang === "en" ? "Continuous Improvement" : "Peningkatan Mutu Berkelanjutan"}</h3>
            <p>
              {lang === "en"
                ? "Our objective audits add tangible value to your operations, promoting continuous improvement and heightened stakeholder confidence."
                : "Audit objektif dari auditor kompeten kami memberikan nilai tambah nyata bagi organisasi Anda dalam mencapai peningkatan mutu berkelanjutan dan kepercayaan pelanggan."}
            </p>
          </div>
          <div className="service-landing__commitment-cta">
            <Link to="/kontak" className="service-landing__btn-primary">
              {lang === "en" ? "Consult Certification" : "Konsultasi Sertifikasi"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

