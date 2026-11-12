import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import BalancedGrid from "../../components/BalancedGrid";
import { useLanguage } from "../../context/useLanguage";
import "./ServiceLanding.css";

const SUBMENUS = [
  {
    title: "Legalitas & Komitmen Mutu Kalibrasi",
    titleEn: "Calibration Legality & Quality Commitment",
    desc: "Komitmen ketertelusuran standar metrologi nasional dan internasional serta alur proses pelayanan kalibrasi.",
    descEn: "Traceability commitment to national and international metrology standards and calibration service workflows.",
    link: "/layanan/kalibrasi/legalitas",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
      </svg>
    ),
  },
  {
    title: "Ruang Lingkup Kalibrasi Alat Kesehatan",
    titleEn: "Medical Device Calibration Scope",
    desc: "Cakupan 27 jenis peralatan medis rumah sakit (Suction Pump, Tensimeter, Syringe Pump, Infant Warmer, USG, X-Ray, dll).",
    descEn: "Scope covering 27 types of hospital medical equipment (Suction Pumps, Tensimeters, Syringe Pumps, Ultrasound, X-Ray, etc).",
    link: "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="2" y1="12" x2="22" y2="12"></line>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
      </svg>
    ),
  },
  {
    title: "Biaya dan Penawaran Kalibrasi",
    titleEn: "Calibration Fees & Quotation",
    desc: "Informasi skema tarif jasa kalibrasi alat ukur presisi dan prosedur permohonan surat penawaran resmi.",
    descEn: "Information on precision measurement calibration fee schedules and formal quotation request procedures.",
    link: "/layanan/kalibrasi/biaya-sertif",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"></line>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
      </svg>
    ),
  },
];

export default function LembagaKalibrasiLanding() {
  const { lang } = useLanguage();

  const title =
    lang === "en" ? "Calibration Laboratory" : "Lembaga Kalibrasi";
  const description =
    lang === "en"
      ? "PT Penilai Standar Uji provides precision calibration services for measuring instruments and healthcare equipment to guarantee measurement accuracy and metrological traceability."
      : "Lembaga Kalibrasi PT Penilai Standar Uji menyediakan layanan kalibrasi instrumen ukur presisi dan alat kesehatan guna menjamin akurasi pengukuran dan ketertelusuran metrologi.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical="/layanan/kalibrasi"
        type="service"
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/kalibrasi" },
          { label: title },
        ]}
        serviceData={{
          name: title,
          description: description,
          serviceType: "Metrological Calibration Laboratory",
          image: "/lab_kalibrasi.webp",
        }}
        primaryImage="/lab_kalibrasi.webp"
        lang={lang}
      />

      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/kalibrasi" },
          { label: title },
        ]}
      />

      <main className="service-landing">
        <div className="service-landing__hero">
          <div className="service-landing__hero-content">
            <div className="service-landing__badge-row">
              <span className="service-landing__badge">{t("KETERTELUSURAN METROLOGI")}</span>
              <span className="service-landing__badge service-landing__badge--gold">{t("STANDAR NASIONAL")}</span>
              <span className="service-landing__badge">{t("ALAT KESEHATAN")}</span>
            </div>
            <h1 className="service-landing__title">{title}</h1>
            <p className="service-landing__lead">
              {lang === "en"
                ? "Our calibration services ensure that critical measuring instruments and clinical healthcare devices operate with guaranteed accuracy and direct traceability to International System of Units (SI)."
                : "Layanan kalibrasi kami memastikan bahwa instrumen pengukuran industri dan peralatan medis fasilitas kesehatan bekerja dengan akurasi terverifikasi dan tertelusur langsung ke Standar Satuan Internasional (SI)."}
            </p>
            <div className="service-landing__hero-actions">
              <Link to="/layanan/kalibrasi/ruang-lingkup/alat-kesehatan" className="service-landing__btn-primary">
                {lang === "en" ? "View Medical Devices Scope \u2192" : "Lihat Alat Kesehatan \u2192"}
              </Link>
              <Link to="/layanan/kalibrasi/legalitas" className="service-landing__btn-secondary">
                {lang === "en" ? "Calibration Workflow" : "Alur Proses Kalibrasi"}
              </Link>
            </div>
          </div>
          <div className="service-landing__hero-media">
            <img
              src="/lab_kalibrasi.webp"
              alt={title}
              className="service-landing__hero-img"
              loading="eager"
            />
          </div>
        </div>

        <div className="service-landing__section-header">
          <h2 className="service-landing__section-title">
            {lang === "en" ? "Calibration Information & Scopes" : "Informasi & Ruang Lingkup Kalibrasi"}
          </h2>
          <p className="service-landing__section-subtitle">
            {lang === "en"
              ? "Explore medical equipment scopes, legal compliance, and service request details below."
              : "Jelajahi ruang lingkup alat kesehatan, alur proses kalibrasi, dan permohonan penawaran biaya di bawah ini."}
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
            <h3>{lang === "en" ? "Measurement Confidence" : "Kepastian Akurasi & Keamanan Pasien"}</h3>
            <p>
              {lang === "en"
                ? "Calibrated medical devices reduce clinical diagnosis risks and ensure patient safety throughout hospital facilities."
                : "Kalibrasi berkala pada peralatan medis menjamin keandalan diagnosis klinis dan keselamatan pasien di seluruh fasilitas pelayanan kesehatan."}
            </p>
          </div>
          <div className="service-landing__commitment-cta">
            <Link to="/kontak" className="service-landing__btn-primary">
              {lang === "en" ? "Request Calibration" : "Konsultasi Kalibrasi"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

