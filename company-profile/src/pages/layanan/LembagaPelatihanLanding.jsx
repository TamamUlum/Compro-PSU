import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import BalancedGrid from "../../components/BalancedGrid";
import { useLanguage } from "../../context/useLanguage";
import "./ServiceLanding.css";

const SUBMENUS = [
  {
    title: "General Training",
    titleEn: "General Training",
    desc: "Pelatihan publik terjadwal untuk pemahaman standar SNI ISO 9001, 14001, 22000, 17025, dan teknik audit mutu.",
    descEn: "Scheduled public training courses covering SNI ISO 9001, 14001, 22000, 17025, and quality auditing techniques.",
    link: "/layanan/pelatihan/general-training",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
      </svg>
    ),
  },
  {
    title: "Inhouse Training",
    titleEn: "In-House Training",
    desc: "Program pelatihan khusus yang diselenggarakan langsung di fasilitas perusahaan klien dengan materi terarah.",
    descEn: "Tailored on-site training sessions conducted directly at client enterprise premises with customized syllabus.",
    link: "/layanan/pelatihan/inhouse-training",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
    ),
  },
  {
    title: "Exhouse Training",
    titleEn: "Ex-House Training",
    desc: "Pelatihan eksternal interaktif yang memadukan teori audit standar mutu dengan simulasi praktikum laboratorium pengujian.",
    descEn: "Interactive external training workshops combining standard theory with hands-on laboratory testing simulations.",
    link: "/layanan/pelatihan/exhouse-training",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
      </svg>
    ),
  },
];

export default function LembagaPelatihanLanding() {
  const { lang, t } = useLanguage();

  const title =
    lang === "en" ? "Training Institution" : "Lembaga Pelatihan";
  const description =
    lang === "en"
      ? "PT Penilai Standar Uji provides comprehensive industrial training programs in management systems, laboratory testing, and auditing to develop competent human capital."
      : "Lembaga Pelatihan PT Penilai Standar Uji menyelenggarakan program pelatihan teknis, sistem manajemen mutu, dan audit untuk meningkatkan kompetensi sumber daya manusia industri.";

  return (
    <>
      <SeoHead
        title={title}
        description={description}
        canonical="/layanan/pelatihan"
        type="service"
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/pelatihan" },
          { label: title },
        ]}
        serviceData={{
          name: title,
          description: description,
          serviceType: "Professional Industrial Quality & Testing Training",
          image: "/_pelatihan.webp",
        }}
        primaryImage="/_pelatihan.webp"
        lang={lang}
      />

      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: "Layanan", href: "/layanan/pelatihan" },
          { label: title },
        ]}
      />

      <main className="service-landing">
        <div className="service-landing__hero">
          <div className="service-landing__hero-content">
            <div className="service-landing__badge-row">
              <span className="service-landing__badge">{t("PENGEMBANGAN SDM")}</span>
              <span className="service-landing__badge service-landing__badge--gold">{t("SNI & ISO")}</span>
              <span className="service-landing__badge">{t("INSTRUKTUR PRAKTISI")}</span>
            </div>
            <h1 className="service-landing__title">{title}</h1>
            <p className="service-landing__lead">
              {lang === "en"
                ? "Enhance your workforce's technical capabilities and quality management competencies. Led by certified practitioners with hands-on conformity assessment experience, our courses offer actionable insights for industry professionals."
                : "Tingkatkan kapabilitas teknis dan kompetensi personel mutu industri Anda. Dibimbing langsung oleh praktisi tersertifikasi yang berpengalaman di bidang pengujian dan sertifikasi, materi pelatihan kami aplikatif dan relevan dengan tantangan operasional industri."}
            </p>
            <div className="service-landing__hero-actions">
              <Link to="/layanan/pelatihan/general-training" className="service-landing__btn-primary">
                {lang === "en" ? "View Training Schedule \u2192" : "Jadwal Pelatihan \u2192"}
              </Link>
              <Link to="/layanan/pelatihan/inhouse-training" className="service-landing__btn-secondary">
                {lang === "en" ? "In-House Training Inquiry" : "Konsultasi Inhouse"}
              </Link>
            </div>
          </div>
          <div className="service-landing__hero-media">
            <img
              src="/_pelatihan.webp"
              alt={title}
              className="service-landing__hero-img"
              loading="eager"
            />
          </div>
        </div>

        <div className="service-landing__section-header">
          <h2 className="service-landing__section-title">
            {lang === "en" ? "Training Modalities" : "Skema & Modalitas Pelatihan"}
          </h2>
          <p className="service-landing__section-subtitle">
            {lang === "en"
              ? "Choose the learning format that best fits your organizational requirements."
              : "Pilih skema pelatihan yang paling sesuai dengan kebutuhan peningkatan kompetensi organisasi Anda."}
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
            <h3>{lang === "en" ? "Empowering Industrial Excellence" : "Membangun SDM Mutu Berdaya Saing"}</h3>
            <p>
              {lang === "en"
                ? "Our training alumni lead quality management and laboratory operations in key industries across the nation."
                : "Alumni pelatihan PT Penilai Standar Uji telah memimpin operasional penjaminan mutu dan laboratorium di berbagai industri strategis nasional."}
            </p>
          </div>
          <div className="service-landing__commitment-cta">
            <Link to="/kontak" className="service-landing__btn-primary">
              {lang === "en" ? "Contact Training Division" : "Hubungi Divisi Pelatihan"}
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

