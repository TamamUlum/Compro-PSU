import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

const PARAMETERS = [
  {
    num: "1",
    titleId: "Jumlah Personel Efektif (Effective Headcount / FTE)",
    titleEn: "Effective Headcount (Full-Time Equivalents)",
    descId:
      "Perhitungan man-days auditor mengacu pada tabel IAF MD 5 berdasarkan total jumlah tenaga kerja purnawaktu, paruh waktu, dan pekerja alih daya (outsourcing) yang memengaruhi sistem manajemen.",
    descEn:
      "Audit man-days calculation is based on IAF MD 5 tables using the aggregate of full-time, part-time, and contracted personnel impacting management system processes.",
  },
  {
    num: "2",
    titleId: "Tingkat Kompleksitas & Kategori Risiko Proses",
    titleEn: "Complexity Level & Operational Risk Category",
    descId:
      "Organisasi diklasifikasikan ke dalam kategori risiko rendah, menengah, atau tinggi (misalnya bahan kimia berbahaya atau manufaktur kompleks) yang memengaruhi kedalaman verifikasi audit.",
    descEn:
      "Organizations are classified into low, medium, or high risk tiers (e.g., hazardous chemicals or complex manufacturing) which dictates required audit depth.",
  },
  {
    num: "3",
    titleId: "Jumlah Lokasi & Topologi Multisite",
    titleEn: "Number of Sites & Multisite Topology",
    descId:
      "Untuk organisasi yang memiliki kantor pusat, pabrik, atau cabang ganda, berlaku pedoman sampling multisite IAF MD 1 guna mengoptimalkan durasi dan efisiensi biaya audit.",
    descEn:
      "For multi-branch operations, IAF MD 1 multisite sampling guidelines apply, optimizing audit duration, travel logistics, and overall audit expenditure.",
  },
  {
    num: "4",
    titleId: "Sifat Audit: Tunggal vs Sistem Terintegrasi (IMS)",
    titleEn: "Audit Nature: Single vs Integrated Management System",
    descId:
      "Audit bersama untuk dua atau lebih standar (misalnya ISO 9001 + ISO 14001) memperoleh pengurangan total man-days audit terintegrasi hingga 20% dibandingkan pelaksanaan audit terpisah.",
    descEn:
      "Combined audits across multiple standards (e.g., ISO 9001 + ISO 14001) qualify for integrated audit man-day discounts of up to 20% compared to separate audits.",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    titleId: "Unduh & Lengkapi Kuesioner Data Organisasi",
    titleEn: "Download & Complete Client Questionnaire",
    descId:
      "Klien melengkapi data dasar ruang lingkup bisnis, jumlah karyawan, dan daftar lokasi operasional yang diajukan untuk sertifikasi.",
    descEn:
      "The client fills out essential operational data, employee headcount, and site locations proposed for certification.",
  },
  {
    step: "02",
    titleId: "Penelaahan Teknis & Perhitungan Man-Days IAF",
    titleEn: "Technical Review & IAF Man-Days Calculation",
    descId:
      "Tim penelaah teknis LSSM PSU menghitung kebutuhan hari-orang auditor secara akurat dan transparan sesuai pedoman baku internasional.",
    descEn:
      "LSSM PSU technical reviewers calculate auditor man-days accurately and transparently according to international benchmark tables.",
  },
  {
    step: "03",
    titleId: "Penerbitan Surat Penawaran Biaya Resmi",
    titleEn: "Official Quotation Letter Issuance",
    descId:
      "LSSM PSU menerbitkan surat penawaran biaya resmi yang mencakup biaya Audit Tahap 1, Audit Tahap 2, penerbitan sertifikat, dan estimasi surveilans.",
    descEn:
      "LSSM PSU issues a binding quotation covering Stage 1 Audit, Stage 2 Audit, certificate issuance, and annual surveillance projections.",
  },
  {
    step: "04",
    titleId: "Konfirmasi & Penjadwalan Audit",
    titleEn: "Agreement Confirmation & Audit Scheduling",
    descId:
      "Setelah penawaran disepakati dan perjanjian ditandatangani, tim sekretariat mengoordinasikan penetapan tanggal audit dan komposisi tim auditor.",
    descEn:
      "Upon agreement signing, the secretariat finalizes audit dates and introduces the qualified audit team to the client organization.",
  },
];

export default function Biayapenawaransertifsistem() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Sertifikasi"
        breadcrumbs={[
          { label: "Layanan" },
          {
            label: "Lembaga Sertifikasi Sistem Manajemen",
            href: "/layanan/sertif-manajemen",
          },
          {
            label: "Biaya dan Penawaran Sertifikasi",
            href: "/layanan/sertif-manajemen/biaya-sertif",
          },
        ]}
      />

      <section className="service-detail--biaya-penawaran-sertif-sistem site-container">
        <header className="biayasistem-sub__heading">
          <svg
            className="biayasistem-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" strokeWidth="2" />
            <path
              d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Management System Certification Fees & Quotation (LSSM)"
              : "Biaya dan Penawaran Sertifikasi Sistem Manajemen"}
          </LocalizedText>
        </header>

        <p className="biayasistem-sub__tagline">
          {lang === "en"
            ? "Transparent Fee Calculations Governed by IAF Mandatory Documents (IAF MD 5 & IAF MD 1)."
            : "Transparansi Biaya Audit Berdasarkan Regulasi Baku Hari-Orang (Man-Days) Auditor IAF MD 5."}
        </p>

        <div className="biayasistem-sub__content-body">
          <p>
            {lang === "en"
              ? "Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji adheres strictly to the International Accreditation Forum (IAF) mandatory requirements for determining audit time. Certification fees are not arbitrarily set; they reflect the precise auditor man-days required to evaluate your organization's processes thoroughly and objectively."
              : "Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji menerapkan transparansi penuh dalam penetapan biaya audit sertifikasi. Seluruh penawaran disusun berdasarkan alokasi hari-orang (man-days) auditor sesuai dokumen wajib International Accreditation Forum (IAF MD 5), menjamin biaya yang proporsional, adil, dan dapat dipertanggungjawabkan."}
          </p>

          <h2 className="biayasistem-sub__subheading">
            {lang === "en"
              ? "Key Parameters Determining Audit Man-Days"
              : "Parameter Penentu Alokasi Man-Days Auditor"}
          </h2>

          <div className="biayasistem-sub__grid">
            {PARAMETERS.map((param) => (
              <div key={param.num} className="biayasistem-sub__param-card">
                <div className="biayasistem-sub__param-num">{param.num}</div>
                <h3>{lang === "en" ? param.titleEn : param.titleId}</h3>
                <p>{lang === "en" ? param.descEn : param.descId}</p>
              </div>
            ))}
          </div>

          <h2 className="biayasistem-sub__subheading">
            {lang === "en"
              ? "Quotation Request Workflow"
              : "Tahapan Permohonan Penawaran Biaya"}
          </h2>

          <div className="biayasistem-sub__workflow-list">
            {WORKFLOW_STEPS.map((wf) => (
              <div key={wf.step} className="biayasistem-sub__workflow-item">
                <div className="biayasistem-sub__workflow-badge">{wf.step}</div>
                <div className="biayasistem-sub__workflow-content">
                  <h3>{lang === "en" ? wf.titleEn : wf.titleId}</h3>
                  <p>{lang === "en" ? wf.descEn : wf.descId}</p>
                </div>
              </div>
            ))}
          </div>

          <h2 className="biayasistem-sub__subheading">
            {lang === "en"
              ? "Commitment to Transparent Pricing"
              : "Komitmen Transparansi Biaya"}
          </h2>
          <p>
            {lang === "en"
              ? "Our quotation clearly itemizes initial certification fees (Stage 1 and Stage 2 audits), registration, annual surveillance audit estimations, and recertification cycles. No surprise administrative costs or hidden charges."
              : "Surat penawaran resmi LSSM PSU merinci seluruh komponen secara transparan: biaya evaluasi kecukupan dokumen (Stage 1), audit lapangan (Stage 2), penerbitan sertifikat, serta estimasi audit surveilan tahunan. Tidak ada biaya tersembunyi atau pungutan di luar perjanjian resmi."}
          </p>

          {/* Consultation CTA Box */}
          <div className="biayasistem-sub__consultation">
            <div className="biayasistem-sub__consultation-heading">
              <svg
                className="biayasistem-sub__consultation-icon"
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
                  ? "Request an Official Management System Quotation"
                  : "Minta Surat Penawaran Biaya Sertifikasi Resmi"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "Chat directly with our certification coordinator via WhatsApp to obtain the organizational questionnaire and calculate your estimated IAF audit man-days."
                : "Konsultasikan kebutuhan sertifikasi organisasi Anda langsung via WhatsApp untuk mendapatkan kuesioner profil organisasi dan estimasi perhitungan man-days auditor."}
            </p>
            <div className="biayasistem-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="biayasistem-sub__btn-whatsapp"
                aria-label="Minta Penawaran Biaya Sertifikasi Sistem via WhatsApp"
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
                    : "Minta Penawaran via WhatsApp"}
                </span>
              </a>
              <Link to="/kontak" className="biayasistem-sub__btn-secondary">
                {lang === "en" ? "Contact Secretariat" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="biayasistem-sub__related">
            <h3>
              {lang === "en"
                ? "Related Management System Pages:"
                : "Informasi Terkait LSSM:"}
            </h3>
            <div className="biayasistem-sub__related-links">
              <Link
                to="/layanan/sertif-manajemen/proses-sertifikasi"
                className="biayasistem-sub__related-card"
              >
                <span className="biayasistem-sub__related-title">
                  {lang === "en"
                    ? "Certification Workflow →"
                    : "Tahapan Proses Sertifikasi →"}
                </span>
                <span className="biayasistem-sub__related-desc">
                  {lang === "en"
                    ? "Step-by-step audit journey from Stage 1 to renewal."
                    : "Alur tahapan audit Stage 1, Stage 2, dan surveilan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/ruang-lingkup"
                className="biayasistem-sub__related-card"
              >
                <span className="biayasistem-sub__related-title">
                  {lang === "en"
                    ? "Scope of Services →"
                    : "Ruang Lingkup LSSM →"}
                </span>
                <span className="biayasistem-sub__related-desc">
                  {lang === "en"
                    ? "Management standards: ISO 9001, 14001, 22000, and more."
                    : "Daftar skema sertifikasi sistem manajemen mutu dan lingkungan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/hak-kewajiban-klien"
                className="biayasistem-sub__related-card"
              >
                <span className="biayasistem-sub__related-title">
                  {lang === "en"
                    ? "Client Rights & Duties →"
                    : "Hak dan Kewajiban Klien →"}
                </span>
                <span className="biayasistem-sub__related-desc">
                  {lang === "en"
                    ? "Client rights, responsibilities, and logo usage rules."
                    : "Pedoman hak dan kewajiban klien serta penggunaan logo."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
