import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Hak_kewajiban_klien_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

const CLIENT_RIGHTS = [
  {
    id: "Memperoleh layanan audit dan sertifikasi sistem manajemen secara profesional, objektif, transparan, dan tidak berpihak sesuai kaidah ISO/IEC 17021-1.",
    en: "Receive management system audit and certification services professionally, objectively, transparently, and impartially under ISO/IEC 17021-1 guidelines.",
  },
  {
    id: "Memperoleh Sertifikat Sistem Manajemen resmi dan pengakuan kesesuaian apabila organisasi telah terbukti memenuhi seluruh kriteria standar.",
    en: "Receive the official Management System Certificate and formal conformity recognition once the organization fulfills all standard requirements.",
  },
  {
    id: "Mendapatkan hak penggunaan tanda kesesuaian (logo sertifikasi LSSM dan simbol akreditasi) sesuai aturan pedoman penggunaan merek sertifikasi yang sah.",
    en: "Entitled to display certification marks (LSSM PSU logo and accreditation symbols) in accordance with official certification brand usage rules.",
  },
  {
    id: "Memperoleh rincian jadwal, komposisi tim auditor, rencana audit (audit plan), dan transparansi dasar perhitungan biaya sebelum audit dilaksanakan.",
    en: "Receive detailed audit plans, auditor team composition, and transparent man-days calculation basis prior to on-site audit execution.",
  },
  {
    id: "Jaminan perlindungan kerahasiaan atas seluruh rahasia dagang, data proses bisnis, dan dokumentasi internal yang disampaikan kepada tim auditor.",
    en: "Guaranteed confidentiality protection over all proprietary trade secrets, operational processes, and internal documentation shared with the audit team.",
  },
  {
    id: "Hak untuk mengajukan keluhan atau permohonan banding terhadap hasil temuan audit maupun keputusan sertifikasi melalui mekanisme panel independen.",
    en: "Right to lodge formal complaints or appeals against audit findings or certification decisions through the independent appeals panel.",
  },
];

const CLIENT_OBLIGATIONS = [
  {
    id: "Senantiasa memelihara komitmen implementasi dan efektivitas sistem manajemen sesuai standar yang disertifikasi selama masa berlaku siklus sertifikat.",
    en: "Continuously maintain commitment, implementation, and effectiveness of the certified management system throughout the certificate validity cycle.",
  },
  {
    id: "Memberikan akses terbuka kepada tim auditor untuk memeriksa seluruh area operasional, fasilitas, rekaman mutu, dan personel yang relevan dengan ruang lingkup audit.",
    en: "Grant open access to the audit team to inspect all operational areas, facilities, management records, and personnel relevant to the audit scope.",
  },
  {
    id: "Mengizinkan kehadiran observer atau asesor badan akreditasi (seperti KAN) apabila dilakukan audit penyaksian (witness audit) sesuai ketentuan skema.",
    en: "Permit the presence of observers or accreditation body assessors (such as KAN) during scheduled witness audits under scheme requirements.",
  },
  {
    id: "Menyelesaikan tindakan perbaikan beserta analisis akar penyebab terhadap seluruh temuan ketidaksesuaian (non-conformity) dalam batas waktu yang ditentukan.",
    en: "Execute root cause analyses and corrective actions for all identified non-conformities within specified contractual timeframes.",
  },
  {
    id: "Memberitahukan secara tertulis kepada LSSM PSU atas setiap perubahan signifikan organisasi, seperti perubahan kepemilikan hukum, struktur manajemen kunci, relokasi pabrik/kantor, atau perubahan proses operasional.",
    en: "Promptly inform LSSM PSU in writing of any significant organizational changes, such as legal ownership, key management, operational site relocation, or major process alterations.",
  },
  {
    id: "Mematuhi tata cara penggunaan logo sertifikasi sistem manajemen, antara lain tidak mencantumkan logo sistem manajemen secara langsung pada kemasan produk yang dapat menyesatkan konsumen seolah-olah produk tersebut telah disertifikasi.",
    en: "Comply strictly with certification mark guidelines, including never displaying management system marks directly on product packages in a way that implies product certification.",
  },
  {
    id: "Memenuhi seluruh kewajiban administrasi dan pelunasan biaya audit sertifikasi maupun surveilans sesuai perjanjian kontrak yang disepakati.",
    en: "Fulfill all administrative and financial obligations, including timely settlement of initial audit and annual surveillance fees per agreement.",
  },
  {
    id: "Segera menghentikan seluruh penggunaan logo, sertifikat, dan klaim promosi sertifikasi apabila sertifikat mengalami pembekuan (penangguhan), pencabutan, atau berakhirnya masa berlaku.",
    en: "Cease all usage of certification logos, certificates, and promotional claims immediately if the certificate is suspended, revoked, or expired.",
  },
];

export default function Hakkewajibankliensertifsistem() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Hak dan Kewajiban Klien"
        breadcrumbs={[
          { label: "Layanan" },
          {
            label: "Lembaga Sertifikasi Sistem Manajemen",
            href: "/layanan/sertif-manajemen",
          },
          {
            label: "Hak dan Kewajiban Klien",
            href: "/layanan/sertif-manajemen/hak-kewajiban-klien",
          },
        ]}
      />

      <section className="service-detail--hak-kewajiban-klien-sertif-sistem site-container">
        <header className="hakkewajiban-sub__heading">
          <svg
            className="hakkewajiban-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" />
            <path
              d="M23 21v-2a4 4 0 0 0-3-3.87"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M16 3.13a4 4 0 0 1 0 7.75"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Client Rights & Obligations (LSSM PSU)"
              : "Hak dan Kewajiban Klien Sertifikasi Sistem Manajemen"}
          </LocalizedText>
        </header>

        <p className="hakkewajiban-sub__tagline">
          {lang === "en"
            ? "Ethical Partnership, Governance Standards, and Mutual Obligations for Certified Organizations."
            : "Kemitraan Profesional Berlandaskan Standar Mutu, Ketertiban Hukum, dan Saling Menghormati Komitmen."}
        </p>

        <div className="hakkewajiban-sub__content-body">
          <p>
            {lang === "en"
              ? "The relationship between Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji and client organizations is founded on transparency, mutual accountability, and integrity. Both parties are bound by the certification contract and international accreditation stipulations under ISO/IEC 17021-1."
              : "Hubungan kerja sama antara Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji dengan organisasi klien dilandaskan pada prinsip transparansi, akuntabilitas bersama, dan kepatuhan hukum. Seluruh ketentuan dirumuskan mengacu pada standar akreditasi internasional SNI ISO/IEC 17021-1 guna menjaga kredibilitas sertifikasi."}
          </p>

          <div className="hakkewajiban-sub__block">
            <h2 className="hakkewajiban-sub__subheading">
              {lang === "en"
                ? "A. Certified Client Rights"
                : "A. Hak-Hak Organisasi Klien"}
            </h2>
            <ol className="hakkewajiban-sub__list">
              {CLIENT_RIGHTS.map((item, idx) => (
                <li key={idx}>{lang === "en" ? item.en : item.id}</li>
              ))}
            </ol>
          </div>

          <div className="hakkewajiban-sub__block">
            <h2 className="hakkewajiban-sub__subheading">
              {lang === "en"
                ? "B. Client Obligations & Compliance"
                : "B. Kewajiban & Tanggung Jawab Klien"}
            </h2>
            <ol className="hakkewajiban-sub__list">
              {CLIENT_OBLIGATIONS.map((item, idx) => (
                <li key={idx}>{lang === "en" ? item.en : item.id}</li>
              ))}
            </ol>
          </div>

          {/* Consultation CTA Box */}
          <div className="hakkewajiban-sub__consultation">
            <div className="hakkewajiban-sub__consultation-heading">
              <svg
                className="hakkewajiban-sub__consultation-icon"
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
                  ? "Questions About Logo Usage or Contract Terms?"
                  : "Konsultasi Ketentuan Penggunaan Logo & Perjanjian Sertifikasi"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "If you require guidance on certification logo guidelines, marketing claims, or contractual scope amendments, contact our legal and compliance team via WhatsApp."
                : "Bila organisasi Anda memerlukan panduan mengenai tata cara pencantuman logo akreditasi, materi promosi, atau perubahan ruang lingkup sertifikasi, hubungi tim compliance kami via WhatsApp."}
            </p>
            <div className="hakkewajiban-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hakkewajiban-sub__btn-whatsapp"
                aria-label="Konsultasi Hak dan Kewajiban via WhatsApp"
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
              <Link to="/kontak" className="hakkewajiban-sub__btn-secondary">
                {lang === "en" ? "Contact Secretariat" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="hakkewajiban-sub__related">
            <h3>
              {lang === "en"
                ? "Related Management System Pages:"
                : "Informasi Terkait LSSM:"}
            </h3>
            <div className="hakkewajiban-sub__related-links">
              <Link
                to="/layanan/sertif-manajemen/proses-sertifikasi"
                className="hakkewajiban-sub__related-card"
              >
                <span className="hakkewajiban-sub__related-title">
                  {lang === "en"
                    ? "Certification Workflow →"
                    : "Tahapan Proses Sertifikasi →"}
                </span>
                <span className="hakkewajiban-sub__related-desc">
                  {lang === "en"
                    ? "Audit stages from Stage 1 to surveillance and renewal."
                    : "Tahapan audit dokumen, evaluasi lapangan, dan surveilan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/keluhan-banding"
                className="hakkewajiban-sub__related-card"
              >
                <span className="hakkewajiban-sub__related-title">
                  {lang === "en"
                    ? "Complaints & Appeals →"
                    : "Keluhan dan Banding →"}
                </span>
                <span className="hakkewajiban-sub__related-desc">
                  {lang === "en"
                    ? "Procedures for submitting grievances and formal appeals."
                    : "Prosedur resmi penanganan ketidakpuasan dan banding."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/ruang-lingkup"
                className="hakkewajiban-sub__related-card"
              >
                <span className="hakkewajiban-sub__related-title">
                  {lang === "en"
                    ? "Certification Scope →"
                    : "Ruang Lingkup LSSM →"}
                </span>
                <span className="hakkewajiban-sub__related-desc">
                  {lang === "en"
                    ? "Standards covered: ISO 9001, ISO 14001, ISO 22000."
                    : "Cakupan standar sistem manajemen yang dilayani."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
