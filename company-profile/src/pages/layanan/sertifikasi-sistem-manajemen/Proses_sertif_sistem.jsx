import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Proses_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

const STAGES = [
  {
    num: "01",
    titleId: "Permohonan Sertifikasi & Pengisian Kuesioner",
    titleEn: "Certification Application & Initial Questionnaire",
    descId:
      "Pemohon mengisi formulir permohonan sertifikasi dan kuesioner profil organisasi, mencakup ruang lingkup yang diajukan, jumlah personel efektif, lokasi fasilitas kerja, serta dokumentasi legalitas pendukung.",
    descEn:
      "The applicant submits a formal application and organizational profile questionnaire detailing scope of certification, effective staff count, operational facilities, and legal standing documents.",
  },
  {
    num: "02",
    titleId: "Tinjauan Permohonan & Kesepakatan Biaya",
    titleEn: "Application Review & Quotation Agreement",
    descId:
      "Tim teknis LSSM PSU menelaah ruang lingkup, menentukan kompetensi auditor yang diperlukan, serta menghitung alokasi man-days audit sesuai ketentuan IAF. Surat Penawaran Biaya dan Perjanjian Sertifikasi diterbitkan untuk disepakati.",
    descEn:
      "LSSM PSU technical team reviews the scope, allocates competent audit personnel, and calculates mandatory IAF audit man-days. A formal quotation and certification agreement are issued for client confirmation.",
  },
  {
    num: "03",
    titleId: "Audit Tahap 1 (Stage 1 Audit — Tinjauan Dokumen & Kesiapan)",
    titleEn: "Stage 1 Audit (Document Review & Readiness Assessment)",
    descId:
      "Evaluasi kecukupan dokumen sistem manajemen (manual mutu, prosedur, kebijakan, identifikasi risiko/aspek/bahaya), peninjauan status audit internal dan tinjauan manajemen, serta penilaian kesiapan organisasi menghadapi Audit Tahap 2.",
    descEn:
      "Evaluation of management system documentation completeness (manuals, policies, hazard/aspect evaluations), verification of internal audit and management review status, and assessment of organization readiness for Stage 2.",
  },
  {
    num: "04",
    titleId: "Audit Tahap 2 (Stage 2 Audit — Evaluasi Lapangan)",
    titleEn: "Stage 2 Audit (On-Site Implementation Assessment)",
    descId:
      "Pemeriksaan langsung di lapangan (on-site) terhadap implementasi menyeluruh sistem manajemen, wawancara personel di berbagai level, verifikasi bukti objektif efektivitas proses, pemenuhan persyaratan standar, dan kepatuhan hukum.",
    descEn:
      "Comprehensive on-site assessment evaluating system implementation, interviewing personnel across all levels, sampling objective records, and verifying process effectiveness against standard criteria and legal requirements.",
  },
  {
    num: "05",
    titleId: "Penyelesaian Tindakan Perbaikan (Corrective Actions)",
    titleEn: "Corrective Action Resolution & Closure",
    descId:
      "Apabila ditemukan ketidaksesuaian (non-conformity) dalam Audit Tahap 2, organisasi klien menyusun analisis akar penyebab (root cause analysis) dan melaksanakan tindakan perbaikan untuk diverifikasi oleh tim auditor.",
    descEn:
      "If non-conformities are identified during Stage 2, the client organization conducts root cause analysis and submits corrective action evidence for verification and technical closure by the lead auditor.",
  },
  {
    num: "06",
    titleId: "Tinjauan Independen & Keputusan Sertifikasi",
    titleEn: "Independent Technical Review & Certification Decision",
    descId:
      "Laporan audit dan bukti perbaikan ditelaah oleh Komite/Panel Pengambil Keputusan Sertifikasi LSSM PSU yang independen dan tidak terlibat dalam pelaksanaan audit lapangan, guna menjamin ketidakberpihakan mutlak.",
    descEn:
      "Audit reports and closure evidence undergo independent technical review by the LSSM PSU Certification Decision Panel, completely impartial and separate from the on-site audit team.",
  },
  {
    num: "07",
    titleId: "Penerbitan Sertifikat & Hak Tanda Kesesuaian",
    titleEn: "Certificate Issuance & Certification Mark Entitlement",
    descId:
      "Penerbitan Sertifikat Sistem Manajemen resmi dengan masa berlaku 3 (tiga) tahun serta hak pencantuman tanda kesesuaian/logo akreditasi sesuai pedoman regulasi yang berlaku.",
    descEn:
      "Official issuance of the Management System Certificate valid for 3 (three) years, along with rules and entitlements for displaying certification marks and accreditation symbols.",
  },
  {
    num: "08",
    titleId: "Audit Pengawasan Tahunan (Surveilans Tahun ke-1 & ke-2)",
    titleEn: "Annual Surveillance Audits (Year 1 & Year 2)",
    descId:
      "Pelaksanaan audit surveilans berkala sekurang-kurangnya sekali setahun guna memastikan sistem manajemen tetap dipelihara secara konsisten, efektif, dan mengalami perbaikan berkelanjutan.",
    descEn:
      "Periodic surveillance audits conducted at least annually to verify that the certified management system is continuously maintained, effective, and experiencing ongoing improvement.",
  },
  {
    num: "09",
    titleId: "Audit Sertifikasi Ulang (Recertification Audit)",
    titleEn: "Recertification Audit (Cycle Renewal)",
    descId:
      "Audit menyeluruh yang diselenggarakan sebelum masa berlaku sertifikat 3 tahun berakhir guna memperbarui siklus sertifikasi untuk periode 3 tahun berikutnya.",
    descEn:
      "Full reassessment conducted prior to the 3-year certificate expiry to renew the certification cycle for the subsequent 3-year period.",
  },
];

export default function Prosessertifsistem() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Proses Sertifikasi"
        breadcrumbs={[
          { label: "Layanan" },
          {
            label: "Lembaga Sertifikasi Sistem Manajemen",
            href: "/layanan/sertif-manajemen",
          },
          {
            label: "Proses Sertifikasi",
            href: "/layanan/sertif-manajemen/proses-sertifikasi",
          },
        ]}
      />

      <section className="service-detail--proses-sertif-sistem site-container">
        <header className="proses-sub__heading">
          <svg
            className="proses-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <polyline
              points="22 12 18 12 15 21 9 3 6 12 2 12"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Management System Certification Process (ISO/IEC 17021-1)"
              : "Tahapan Proses Sertifikasi Sistem Manajemen (ISO/IEC 17021-1)"}
          </LocalizedText>
        </header>

        <p className="proses-sub__tagline">
          {lang === "en"
            ? "Transparent, Systematic, and Rigorous Audit Stages from Application to 3-Year Certification Maintenance."
            : "Alur Sertifikasi Sistematis, Terukur, dan Transparan dari Permohonan Awal hingga Pemeliharaan Siklus 3 Tahunan."}
        </p>

        <div className="proses-sub__content-body">
          <p>
            {lang === "en"
              ? "The management system certification process conducted by Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji adheres to the international accreditation standard ISO/IEC 17021-1. The evaluation is conducted objectively by certified lead auditors and technical experts."
              : "Pelaksanaan audit dan proses sertifikasi sistem manajemen oleh LSSM PT Penilai Standar Uji diselenggarakan mengacu pada standar akreditasi internasional SNI ISO/IEC 17021-1. Proses sertifikasi dirancang objektif, terukur, dan transparan, didukung oleh auditor kepala dan tenaga ahli teknis yang kompeten di bidangnya."}
          </p>

          <h2 className="proses-sub__subheading">
            {lang === "en"
              ? "Comprehensive 9-Step Certification Workflow"
              : "9 Tahapan Utama Proses Sertifikasi Sistem Manajemen"}
          </h2>

          <div className="proses-sub__steps-list">
            {STAGES.map((stage) => (
              <div key={stage.num} className="proses-sub__step-item">
                <div className="proses-sub__step-badge">{stage.num}</div>
                <div className="proses-sub__step-content">
                  <h3>{lang === "en" ? stage.titleEn : stage.titleId}</h3>
                  <p>{lang === "en" ? stage.descEn : stage.descId}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="proses-sub__subheading">
            {lang === "en"
              ? "Audit Principles & Confidentiality Guarantee"
              : "Prinsip Integritas, Ketidakberpihakan, dan Kerahasiaan"}
          </h2>
          <p>
            {lang === "en"
              ? "LSSM PSU enforces strict confidentiality over all client data, proprietary processes, and audit records obtained during assessments. Our auditors adhere to a legally binding Code of Conduct and Conflict of Interest declaration, guaranteeing absolute impartiality throughout all certification decisions."
              : "LSSM PSU menjamin kerahasiaan seluruh dokumen, data operasional, proses bisnis, dan rekaman audit klien. Seluruh personel dan auditor kami terikat pakta integritas, kode etik profesi, serta deklarasi bebas konflik kepentingan guna menjamin ketidakberpihakan dalam setiap keputusan sertifikasi."}
          </p>

          {/* Consultation CTA Box */}
          <div className="proses-sub__consultation">
            <div className="proses-sub__consultation-heading">
              <svg
                className="proses-sub__consultation-icon"
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
                  ? "Ready to Initiate Management System Certification?"
                  : "Siap Memulai Proses Sertifikasi Sistem Manajemen Organisasi Anda?"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "Contact our certification coordinator via WhatsApp to obtain the initial application questionnaire and discuss your target audit timeline."
                : "Hubungi koordinator sertifikasi kami via WhatsApp untuk mendapatkan formulir kuesioner awal serta mendiskusikan jadwal dan target pelaksanaan audit."}
            </p>
            <div className="proses-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="proses-sub__btn-whatsapp"
                aria-label="Konsultasi Proses Sertifikasi via WhatsApp"
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
              <Link to="/kontak" className="proses-sub__btn-secondary">
                {lang === "en" ? "Contact Office" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="proses-sub__related">
            <h3>
              {lang === "en"
                ? "Related Management System Pages:"
                : "Informasi Terkait LSSM:"}
            </h3>
            <div className="proses-sub__related-links">
              <Link
                to="/layanan/sertif-manajemen/ruang-lingkup"
                className="proses-sub__related-card"
              >
                <span className="proses-sub__related-title">
                  {lang === "en"
                    ? "Certification Scope &rarr;"
                    : "Ruang Lingkup LSSM &rarr;"}
                </span>
                <span className="proses-sub__related-desc">
                  {lang === "en"
                    ? "Standards covered: ISO 9001, ISO 14001, ISO 22000, and more."
                    : "Cakupan standar mutu, lingkungan, keselamatan, dan pangan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/biaya-sertif"
                className="proses-sub__related-card"
              >
                <span className="proses-sub__related-title">
                  {lang === "en"
                    ? "Fees & Quotation &rarr;"
                    : "Biaya dan Penawaran Sertifikasi &rarr;"}
                </span>
                <span className="proses-sub__related-desc">
                  {lang === "en"
                    ? "How auditor man-days are calculated based on IAF standards."
                    : "Tata cara perhitungan hari-orang auditor dan permintaan penawaran."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/hak-kewajiban-klien"
                className="proses-sub__related-card"
              >
                <span className="proses-sub__related-title">
                  {lang === "en"
                    ? "Client Rights & Duties &rarr;"
                    : "Hak dan Kewajiban Klien &rarr;"}
                </span>
                <span className="proses-sub__related-desc">
                  {lang === "en"
                    ? "Responsibilities and certification mark usage rules."
                    : "Ketentuan penggunaan logo sertifikasi dan hak-kewajiban organisasi."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
