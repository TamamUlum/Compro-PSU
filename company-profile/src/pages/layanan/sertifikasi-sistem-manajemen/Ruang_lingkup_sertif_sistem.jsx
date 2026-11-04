import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Ruang_lingkup_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

const SCOPES = [
  {
    code: "ISO 9001:2015",
    nameId: "Sistem Manajemen Mutu (SMM)",
    nameEn: "Quality Management Systems (QMS)",
    descId:
      "Standar internasional untuk memastikan efektivitas tata kelola mutu organisasi, kepuasan pelanggan, konsistensi mutu produk/jasa, dan peningkatan berkelanjutan berbasis mitigasi risiko.",
    descEn:
      "International standard ensuring organizational quality governance, customer satisfaction, product/service consistency, and risk-based continual improvement.",
    sectorsId:
      "Manufaktur, Jasa Komersial, Konstruksi, Pendidikan, Distribusi & Logistik, Teknologi Informasi.",
    sectorsEn:
      "Manufacturing, Commercial Services, Construction, Education, Distribution & Logistics, IT.",
  },
  {
    code: "ISO 14001:2015",
    nameId: "Sistem Manajemen Lingkungan (SML)",
    nameEn: "Environmental Management Systems (EMS)",
    descId:
      "Kerangka kerja komprehensif pengelolaan aspek dan dampak lingkungan, kepatuhan terhadap regulasi AMDAL/UKL-UPL, efisiensi energi dan sumber daya, serta pencegahan pencemaran.",
    descEn:
      "Comprehensive framework for managing environmental aspects and impacts, environmental legal compliance, energy/resource efficiency, and pollution prevention.",
    sectorsId:
      "Industri Pengolahan, Kimia & Polimer, Pertambangan & Energi, Pengolahan Limbah, Manufaktur Berat.",
    sectorsEn:
      "Processing Industries, Chemical & Polymers, Mining & Energy, Waste Management, Heavy Manufacturing.",
  },
  {
    code: "ISO 22000:2018",
    nameId: "Sistem Manajemen Keamanan Pangan (SMKP)",
    nameEn: "Food Safety Management Systems (FSMS)",
    descId:
      "Pengendalian bahaya keamanan pangan di seluruh mata rantai pakan dan pangan (farm-to-fork) yang mengintegrasikan prinsip HACCP, program prasyarat (PRP), dan komunikasi interaktif.",
    descEn:
      "Food safety hazard control across the food/feed chain (farm-to-fork), combining HACCP principles, prerequisite programs (PRPs), and interactive communication.",
    sectorsId:
      "Produsen Makanan & Minuman, Pengemasan Pangan, Katering & Jasa Boga, Distribusi & Penyimpanan Dingin.",
    sectorsEn:
      "Food & Beverage Producers, Food Packaging, Catering Services, Distribution & Cold Storage.",
  },
  {
    code: "ISO 45001:2018",
    nameId: "Sistem Manajemen Keselamatan & Kesehatan Kerja (SMK3)",
    nameEn: "Occupational Health & Safety Management (OH&SMS)",
    descId:
      "Standar pencegahan cedera dan gangguan kesehatan akibat kerja, penyediaan tempat kerja yang aman dan sehat, serta eliminasi bahaya dan minimalisasi risiko K3 organisasi.",
    descEn:
      "Standard for preventing work-related injury and ill health, providing safe workplaces, eliminating hazards, and minimizing occupational health and safety risks.",
    sectorsId:
      "Konstruksi, Pertambangan, Kelistrikan, Fabrikasi Logam, Minyak & Gas, Pergudangan & Logistik.",
    sectorsEn:
      "Construction, Mining, Electrical, Metal Fabrication, Oil & Gas, Warehousing & Logistics.",
  },
  {
    code: "ISO/IEC 27001:2022",
    nameId: "Sistem Manajemen Keamanan Informasi (SMKI)",
    nameEn: "Information Security Management Systems (ISMS)",
    descId:
      "Tata kelola perlindungan kerahasiaan (confidentiality), keutuhan (integrity), dan ketersediaan (availability) aset informasi organisasi terhadap ancaman siber dan kebocoran data.",
    descEn:
      "Governance framework safeguarding the confidentiality, integrity, and availability of organizational information assets against cyber threats and data breaches.",
    sectorsId:
      "Penyedia Jasa TI, Fintech, Pusat Data, E-Commerce, Telekomunikasi, Layanan Kesehatan Digital.",
    sectorsEn:
      "IT Service Providers, Fintech, Data Centers, E-Commerce, Telecommunications, Digital Healthcare.",
  },
];

export default function Ruanglingkupsertifsistem() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Ruang Lingkup"
        breadcrumbs={[
          { label: "Layanan" },
          {
            label: "Lembaga Sertifikasi Sistem Manajemen",
            href: "/layanan/sertif-manajemen",
          },
          {
            label: "Ruang Lingkup",
            href: "/layanan/sertif-manajemen/ruang-lingkup",
          },
        ]}
      />

      <section className="service-detail--ruang-lingkup-sertif-sistem site-container">
        <header className="lssm-sub__heading">
          <svg
            className="lssm-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
            <path
              d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Management System Certification Scope (LSSM)"
              : "Ruang Lingkup Sertifikasi Sistem Manajemen (LSSM)"}
          </LocalizedText>
        </header>

        <p className="lssm-sub__tagline">
          {lang === "en"
            ? "Accredited Audit and Certification Services across Key National & International Management System Standards."
            : "Layanan Audit & Sertifikasi Berkelanjutan untuk Standar Sistem Manajemen Mutu, Lingkungan, K3, dan Keamanan Pangan."}
        </p>

        <div className="lssm-sub__content-body">
          <p>
            {lang === "en"
              ? "Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji (PSU) provides independent, third-party audit and certification services for organizations across diverse industrial and commercial sectors. Our assessments adhere strictly to ISO/IEC 17021-1 requirements and IAF (International Accreditation Forum) mandatory guidelines."
              : "Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji (PSU) melayani audit pihak ketiga independen dan sertifikasi sistem manajemen bagi organisasi dan korporasi di berbagai sektor industri. Proses evaluasi dan sertifikasi kami diselenggarakan sesuai standar akreditasi SNI ISO/IEC 17021-1 dan pedoman mandatory International Accreditation Forum (IAF)."}
          </p>

          <h2 className="lssm-sub__subheading">
            {lang === "en"
              ? "Standard Certification Schemes"
              : "Skema Standar Sistem Manajemen yang Dilayani"}
          </h2>

          <div className="lssm-scope__cards">
            {SCOPES.map((scope, idx) => (
              <div key={idx} className="lssm-scope__card">
                <div className="lssm-scope__badge">{scope.code}</div>
                <h3 className="lssm-scope__card-title">
                  {lang === "en" ? scope.nameEn : scope.nameId}
                </h3>
                <p className="lssm-scope__card-desc">
                  {lang === "en" ? scope.descEn : scope.descId}
                </p>
                <div className="lssm-scope__sectors">
                  <strong>
                    {lang === "en"
                      ? "Applicable Industry Sectors:"
                      : "Sektor Industri Terkait:"}
                  </strong>{" "}
                  <span>
                    {lang === "en" ? scope.sectorsEn : scope.sectorsId}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h2 className="lssm-sub__subheading">
            {lang === "en"
              ? "Integrated Management System (IMS) Audits"
              : "Audit Sistem Manajemen Terintegrasi (Integrated Management System)"}
          </h2>
          <p>
            {lang === "en"
              ? "For organizations implementing multiple standards simultaneously (e.g., ISO 9001 + ISO 14001 + ISO 45001), LSSM PSU provides integrated audits. This combined assessment significantly reduces audit duration, minimizes operational disruption, and harmonizes management governance."
              : "Bagi organisasi yang menerapkan lebih dari satu standar secara simultan (misalnya integrasi ISO 9001, ISO 14001, dan ISO 45001), LSSM PSU menyediakan skema Audit Terintegrasi. Skema ini mengoptimalkan jumlah man-days auditor, mengurangi disrupsi operasional, dan mengharmonisasikan pemantauan tata kelola organisasi."}
          </p>

          {/* Consultation CTA Box */}
          <div className="lssm-sub__consultation">
            <div className="lssm-sub__consultation-heading">
              <svg
                className="lssm-sub__consultation-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <h3>
                {lang === "en"
                  ? "Verify Your Organization's Scope & Certification Scheme"
                  : "Konsultasikan Kebutuhan Ruang Lingkup Sertifikasi Organisasi Anda"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "Contact our LSSM certification secretariat to confirm your organization's IAF sector classification, multi-site eligibility, and required audit preparation documents."
                : "Hubungi tim sekretariat LSSM PSU untuk memastikan kesesuaian klasifikasi sektor industri organisasi Anda, audit multisite, serta dokumen persyaratan awal permohonan sertifikasi."}
            </p>
            <div className="lssm-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lssm-sub__btn-whatsapp"
                aria-label="Konsultasi Ruang Lingkup Sistem Manajemen via WhatsApp"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                >
                  <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.979-.275-.101-.475-.15-.675.15-.199.301-.774.979-.95 1.179-.175.201-.351.226-.651.076-.301-.15-1.27-.468-2.42-1.493-.894-.798-1.498-1.784-1.674-2.085-.175-.301-.019-.464.132-.614.136-.135.301-.351.451-.527.15-.175.201-.3.301-.501.101-.2.05-.376-.025-.526-.075-.15-.675-1.628-.925-2.232-.243-.589-.49-.509-.674-.519-.175-.01-.375-.01-.575-.01s-.526.075-.801.376c-.275.301-1.05 1.027-1.05 2.505 0 1.478 1.076 2.906 1.226 3.107.15.201 2.117 3.232 5.129 4.532.716.31 1.275.495 1.71.633.72.228 1.376.196 1.895.118.578-.087 1.78-.727 2.03-1.43.25-.702.25-1.303.175-1.43-.075-.126-.275-.201-.576-.351zM12.04 2C6.516 2 2.023 6.49 2.023 12.012c0 1.989.585 3.843 1.597 5.408L2 22l4.757-1.571a9.97 9.97 0 0 0 5.283 1.583h.004c5.52 0 10.012-4.49 10.012-10.013C22.056 6.49 17.564 2 12.04 2z" />
                </svg>
                <span>
                  {lang === "en"
                    ? "Inquire via WhatsApp"
                    : "Konsultasi via WhatsApp"}
                </span>
              </a>
              <Link to="/kontak" className="lssm-sub__btn-secondary">
                {lang === "en" ? "Contact Secretariat" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="lssm-sub__related">
            <h3>
              {lang === "en"
                ? "Related Management System Pages:"
                : "Informasi Terkait LSSM:"}
            </h3>
            <div className="lssm-sub__related-links">
              <Link
                to="/layanan/sertif-manajemen/proses-sertifikasi"
                className="lssm-sub__related-card"
              >
                <span className="lssm-sub__related-title">
                  {lang === "en"
                    ? "Certification Process &rarr;"
                    : "Tahapan Proses Sertifikasi &rarr;"}
                </span>
                <span className="lssm-sub__related-desc">
                  {lang === "en"
                    ? "Stage 1, Stage 2, surveillance, and recertification workflows."
                    : "Alur audit Stage 1, Stage 2, keputusan audit, dan surveilan tahunan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/biaya-sertif"
                className="lssm-sub__related-card"
              >
                <span className="lssm-sub__related-title">
                  {lang === "en"
                    ? "Quotation & Pricing &rarr;"
                    : "Biaya dan Penawaran Sertifikasi &rarr;"}
                </span>
                <span className="lssm-sub__related-desc">
                  {lang === "en"
                    ? "IAF man-days determination and quote request procedure."
                    : "Dasar penentuan man-days auditor dan tata cara permohonan penawaran."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen"
                className="lssm-sub__related-card"
              >
                <span className="lssm-sub__related-title">
                  {lang === "en"
                    ? "LSSM Landing Page &rarr;"
                    : "Pusat Layanan LSSM &rarr;"}
                </span>
                <span className="lssm-sub__related-desc">
                  {lang === "en"
                    ? "Comprehensive overview of management system certification."
                    : "Ikhtisar lengkap layanan sertifikasi sistem manajemen PSU."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
