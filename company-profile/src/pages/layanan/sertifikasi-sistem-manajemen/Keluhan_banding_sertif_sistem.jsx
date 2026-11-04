import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Keluhan_banding_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

const SECTIONS = [
  {
    id: "keluhan",
    titleId: "Mekanisme Penanganan Keluhan (Complaints)",
    titleEn: "Complaint Handling Mechanism",
    itemsId: [
      "Setiap organisasi klien, pemangku kepentingan (stakeholder), maupun masyarakat umum berhak menyampaikan keluhan atas pelayanan, etika dan perilaku auditor, ketepatan waktu, atau aspek teknis audit yang diselenggarakan LSSM PT Penilai Standar Uji.",
      "Keluhan diajukan secara tertulis melalui surat resmi atau surat elektronik ke saluran resmi LSSM PSU dengan menyertakan identitas pengadu, kronologi kejadian, serta bukti atau rekaman pendukung yang relevan.",
      "Sekretariat LSSM PSU akan meregistrasi dan mengirimkan konfirmasi penerimaan keluhan selambat-lambatnya 3 (tiga) hari kerja sejak pengaduan diterima.",
      "Penyelidikan dan evaluasi keluhan dilakukan oleh personel yang independen, kompeten, dan tidak memiliki benturan kepentingan dengan objek atau auditor yang diadukan.",
      "Hasil investigasi dan tindakan perbaikan (korektif) akan dikomunikasikan secara resmi dan tertulis kepada pihak pengadu.",
      "Pengajuan keluhan dijamin tidak akan menimbulkan perlakuan diskriminatif atau konsekuensi negatif terhadap status sertifikasi klien.",
    ],
    itemsEn: [
      "Any client organization, stakeholder, or member of the public has the right to submit complaints regarding services, auditor conduct, responsiveness, or technical audit aspects conducted by LSSM PT Penilai Standar Uji.",
      "Complaints must be submitted in writing via official letter or email to the official LSSM PSU channels, detailing complainant identity, chronology of events, and relevant supporting evidence.",
      "The LSSM PSU Secretariat logs and issues formal acknowledgment of the complaint within 3 (three) business days of receipt.",
      "Investigation and evaluation are conducted by competent personnel who are strictly independent and have no conflict of interest with the subject or auditor being complained about.",
      "Findings, corrective actions, and conclusions are formally communicated in writing to the complainant.",
      "Submitting a complaint is guaranteed not to result in any discriminatory treatment or negative consequence toward the client's certification status.",
    ],
  },
  {
    id: "banding",
    titleId: "Mekanisme Pengajuan Banding (Appeals)",
    titleEn: "Appeals Process & Independent Panel",
    itemsId: [
      "Klien berhak mengajukan banding terhadap keputusan sertifikasi LSSM PSU, meliputi penolakan permohonan, penolakan penerbitan, pengurangan ruang lingkup, pembekuan (penangguhan), atau pencabutan sertifikat.",
      "Permohonan banding harus disampaikan secara tertulis kepada Direktur/Ketua LSSM PSU paling lambat 30 (tiga puluh) hari kalender setelah surat keputusan sertifikasi diterima oleh klien.",
      "Surat banding wajib menguraikan alasan keberatan secara substantif dan dilampiri bukti objektif pendukung.",
      "Penanganan banding diserahkan kepada Panel Banding Independen yang dibentuk khusus, beranggotakan para pakar teknis yang tidak terlibat dalam proses evaluasi maupun pengambilan keputusan sertifikasi yang dibanding.",
      "Panel Banding memeriksa dokumen, dapat memanggil para pihak untuk dengar pendapat (hearing), dan mengeluarkan rekomendasi keputusan akhir.",
      "Keputusan banding disampaikan secara tertulis kepada pemohon banding dan bersifat final pada tingkat penyelesaian internal LSSM PSU, tanpa mengurangi hak para pihak untuk menempuh jalur hukum sesuai perundang-undangan.",
    ],
    itemsEn: [
      "Clients have the right to appeal against certification decisions issued by LSSM PSU, including refusal to accept applications, refusal to grant certification, scope reductions, suspensions, or certificate revocations.",
      "Appeals must be submitted in writing to the Director/Head of LSSM PSU no later than 30 (thirty) calendar days following receipt of the certification decision notice.",
      "The appeal submission must specify the substantive grounds for objection and provide relevant objective supporting documentation.",
      "Appeals are adjudicated by an ad-hoc Independent Appeals Panel comprising competent technical experts who had no prior involvement in the evaluation or initial certification decision.",
      "The Appeals Panel reviews records, may convene formal hearings with all parties, and formulates the final ruling recommendation.",
      "The appeal resolution is formally communicated in writing and represents the final internal remedy within LSSM PSU, without prejudicing either party's statutory legal rights.",
    ],
  },
  {
    id: "kerahasiaan",
    titleId: "Komitmen Kerahasiaan & Non-Diskriminasi",
    titleEn: "Confidentiality & Non-Discrimination Commitment",
    itemsId: [
      "Seluruh informasi, dokumen pendukung, dan rekaman dalam proses penanganan keluhan dan banding diklasifikasikan sebagai dokumen rahasia.",
      "LSSM PSU menjamin identitas pengadu atau pemohon banding tidak akan dibuka kepada pihak ketiga tanpa persetujuan tertulis, kecuali diwajibkan oleh ketentuan hukum dan regulasi yang berlaku.",
      "Penanganan keluhan dan banding diawasi oleh Komite Ketidakberpihakan (Impartiality Committee) untuk menjamin objektivitas proses secara menyeluruh.",
    ],
    itemsEn: [
      "All information, supporting records, and documentation involved in complaint and appeal proceedings are strictly confidential.",
      "LSSM PSU guarantees that complainant or appellant identities will not be disclosed to third parties without written consent, unless required by statutory regulations.",
      "All complaint and appeal resolutions are overseen by the Impartiality Committee to ensure continuous fairness, integrity, and objectivity.",
    ],
  },
];

export default function Keluhanbandingsertifsistem() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Keluhan dan Banding"
        breadcrumbs={[
          { label: "Layanan" },
          {
            label: "Lembaga Sertifikasi Sistem Manajemen",
            href: "/layanan/sertif-manajemen",
          },
          {
            label: "Keluhan dan Banding",
            href: "/layanan/sertif-manajemen/keluhan-banding",
          },
        ]}
      />

      <section className="service-detail--keluhan-banding-sertif-sistem site-container">
        <header className="keluhan-sub__heading">
          <svg
            className="keluhan-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Complaints and Appeals Procedure (LSSM)"
              : "Prosedur Keluhan dan Banding Sertifikasi Sistem Manajemen"}
          </LocalizedText>
        </header>

        <p className="keluhan-sub__tagline">
          {lang === "en"
            ? "Impartial, Transparent, and Confidential Resolution Framework in Accordance with ISO/IEC 17021-1."
            : "Mekanisme Penyelesaian yang Objektif, Transparan, Bebas Benturan Kepentingan, dan Menjaga Kerahasiaan."}
        </p>

        <div className="keluhan-sub__content-body">
          <p>
            {lang === "en"
              ? "In compliance with international accreditation standards ISO/IEC 17021-1, Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji maintains formal, documented procedures to receive, evaluate, and make decisions on complaints and appeals objectively and without discrimination."
              : "Sebagai komitmen terhadap pemenuhan standar akreditasi SNI ISO/IEC 17021-1, Lembaga Sertifikasi Sistem Manajemen (LSSM) PT Penilai Standar Uji memberlakukan prosedur tertulis yang baku untuk menerima, mengevaluasi, menindaklanjuti, dan menetapkan keputusan atas setiap keluhan maupun banding secara objektif dan non-diskriminatif."}
          </p>

          {SECTIONS.map((sec) => (
            <div key={sec.id} className="keluhan-sub__section-card">
              <h2 className="keluhan-sub__subheading">
                {lang === "en" ? sec.titleEn : sec.titleId}
              </h2>
              <ul className="keluhan-sub__list">
                {(lang === "en" ? sec.itemsEn : sec.itemsId).map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          ))}

          {/* Consultation CTA Box */}
          <div className="keluhan-sub__consultation">
            <div className="keluhan-sub__consultation-heading">
              <svg
                className="keluhan-sub__consultation-icon"
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
                  ? "Submit Inquiry or Formal Grievance to Secretariat"
                  : "Saluran Resmi Pengaduan dan Komunikasi Sekretariat"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "For guidance regarding formal dispute procedures, submission formats, or status updates on active appeals, contact our customer relations officer or secretariat directly."
                : "Untuk panduan format surat pengajuan banding, registrasi keluhan, atau pengecekan status penanganan pengaduan aktif, hubungi petugas sekretariat kami."}
            </p>
            <div className="keluhan-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="keluhan-sub__btn-whatsapp"
                aria-label="Hubungi Sekretariat LSSM via WhatsApp"
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
                    : "Hubungi Sekretariat via WhatsApp"}
                </span>
              </a>
              <Link to="/kontak" className="keluhan-sub__btn-secondary">
                {lang === "en" ? "Official Contact" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="keluhan-sub__related">
            <h3>
              {lang === "en"
                ? "Related Management System Pages:"
                : "Informasi Terkait LSSM:"}
            </h3>
            <div className="keluhan-sub__related-links">
              <Link
                to="/layanan/sertif-manajemen/hak-kewajiban-klien"
                className="keluhan-sub__related-card"
              >
                <span className="keluhan-sub__related-title">
                  {lang === "en"
                    ? "Client Rights & Duties &rarr;"
                    : "Hak dan Kewajiban Klien &rarr;"}
                </span>
                <span className="keluhan-sub__related-desc">
                  {lang === "en"
                    ? "Rights of certified clients and compliance responsibilities."
                    : "Pedoman hak dan kewajiban klien tersertifikasi LSSM."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/proses-sertifikasi"
                className="keluhan-sub__related-card"
              >
                <span className="keluhan-sub__related-title">
                  {lang === "en"
                    ? "Certification Workflow &rarr;"
                    : "Tahapan Proses Sertifikasi &rarr;"}
                </span>
                <span className="keluhan-sub__related-desc">
                  {lang === "en"
                    ? "Complete lifecycle: Stage 1, Stage 2, and annual audits."
                    : "Alur tahapan audit, keputusan sertifikasi, dan surveilan."}
                </span>
              </Link>
              <Link
                to="/layanan/sertif-manajemen/legalitas"
                className="keluhan-sub__related-card"
              >
                <span className="keluhan-sub__related-title">
                  {lang === "en"
                    ? "Legality & Principles &rarr;"
                    : "Legalitas & Prinsip Audit &rarr;"}
                </span>
                <span className="keluhan-sub__related-desc">
                  {lang === "en"
                    ? "Impartiality policies and institutional accreditation."
                    : "Landasan operasional dan komitmen ketidakberpihakan."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
