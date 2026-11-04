import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./General_training.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

export default function Generaltraining() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="General Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan", href: "/layanan/pelatihan" },
          {
            label: "General Training",
            href: "/layanan/pelatihan/general-training",
          },
        ]}
      />

      <section className="service-detail--general-training site-container">
        <header className="training-sub__heading">
          <svg
            className="training-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 14l9-5-9-5-9 5 9 5z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0112 20.055a11.952 11.952 0 01-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "General Training Program (Public Courses)"
              : "Program Pelatihan Umum (General Training)"}
          </LocalizedText>
        </header>

        <p className="training-sub__tagline">
          {lang === "en"
            ? "Fostering Competency in International Standards, Quality Management, and Technical Auditing."
            : "Membangun Kompetensi SDM Berstandar Nasional dan Internasional Melalui Pelatihan Terpadu."}
        </p>

        <div className="training-sub__content-body">
          <p>
            {lang === "en"
              ? "Lembaga Pelatihan PT Penilai Standar Uji (PSU) organizes General Training courses designed for professionals, quality managers, laboratory personnel, and organization representatives seeking in-depth understanding of standard compliance and audit practices."
              : "Lembaga Pelatihan PT Penilai Standar Uji (PSU) menyelenggarakan program General Training (pelatihan publik terbuka) yang dirancang bagi para profesional, manajer mutu, personel laboratorium, serta perwakilan instansi yang ingin memperdalam pemahaman standar mutu dan implementasi audit."}
          </p>

          <p>
            {lang === "en"
              ? "Courses are conducted systematically with standardized curricula delivered by experienced practitioners actively engaged in national testing, calibration, and product certification."
              : "Pelatihan diselenggarakan secara terstruktur dengan kurikulum terstandarisasi yang dibimbing oleh instruktur praktisi berpengalaman yang aktif di bidang pengujian laboratorium, kalibrasi, serta sertifikasi produk nasional."}
          </p>

          <h2 className="training-sub__subheading">
            {lang === "en"
              ? "Core Training Modules Available"
              : "Modul & Topik Pelatihan yang Tersedia"}
          </h2>
          <ul className="training-sub__list">
            <li>
              <strong>SNI ISO 9001:2015:</strong>{" "}
              {lang === "en"
                ? "Quality Management System requirements, risk-based thinking, and operational continual improvement."
                : "Pemahaman dan penerapan Sistem Manajemen Mutu, pemikiran berbasis risiko, serta peningkatan berkelanjutan."}
            </li>
            <li>
              <strong>SNI ISO 14001:2015:</strong>{" "}
              {lang === "en"
                ? "Environmental Management System, aspect-impact identification, and environmental compliance."
                : "Pemahaman Sistem Manajemen Lingkungan, identifikasi aspek-dampak lingkungan, dan kepatuhan regulasi."}
            </li>
            <li>
              <strong>SNI ISO 22000:2018:</strong>{" "}
              {lang === "en"
                ? "Food Safety Management Systems, HACCP principles, and prerequisite programs (PRP)."
                : "Sistem Manajemen Keamanan Pangan, prinsip HACCP, dan pengendalian bahaya pada rantai pasok pangan."}
            </li>
            <li>
              <strong>SNI ISO/IEC 17025:2017:</strong>{" "}
              {lang === "en"
                ? "General requirements for the competence of testing and calibration laboratories."
                : "Persyaratan umum kompetensi laboratorium pengujian dan kalibrasi, validasi metode, dan jaminan mutu hasil."}
            </li>
            <li>
              <strong>Internal Audit Techniques:</strong>{" "}
              {lang === "en"
                ? "Audit planning, execution, non-conformity reporting, and corrective action verification."
                : "Perencanaan audit internal, teknik wawancara audit, perumusan temuan ketidaksesuaian, dan verifikasi perbaikan."}
            </li>
            <li>
              <strong>Measurement Uncertainty:</strong>{" "}
              {lang === "en"
                ? "Estimating uncertainty in measurement and testing data according to GUM guidelines."
                : "Estimasi ketidakpastian pengukuran dan pengujian laboratorium sesuai pedoman baku metrologi."}
            </li>
          </ul>

          <h2 className="training-sub__subheading">
            {lang === "en"
              ? "Learning Methodology & Benefits"
              : "Metodologi Pembelajaran & Manfaat Peserta"}
          </h2>
          <ol className="training-sub__workflow-steps">
            <li>
              <strong>
                {lang === "en" ? "Interactive Case Studies:" : "Studi Kasus Riil:"}
              </strong>{" "}
              {lang === "en"
                ? "Hands-on analysis of practical challenges encountered in testing and certification audits."
                : "Pembahasan studi kasus kontekstual dari implementasi nyata di industri dan laboratorium."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Comprehensive Courseware:" : "Modul Pelatihan Lengkap:"}
              </strong>{" "}
              {lang === "en"
                ? "Participants receive comprehensive training materials, standard references, and exercise toolkits."
                : "Peserta memperoleh materi pembelajaran terstruktur, referensi standar, dan lembar kerja latihan."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Competency Certificate:" : "Sertifikat Pelatihan Resmi:"}
              </strong>{" "}
              {lang === "en"
                ? "Official Certificate of Attendance / Competence issued by PT Penilai Standar Uji."
                : "Penerbitan Sertifikat Resmi Pelatihan dari PT Penilai Standar Uji sebagai bukti pengembangan kompetensi."}
            </li>
          </ol>
        </div>

        {/* Section Contact CTA */}
        <aside className="training-sub__consultation">
          <div className="training-sub__consultation-heading">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="training-sub__consultation-icon"
            >
              <path
                d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm14 10v-2a4 4 0 0 0-3-3.87m-4-12a4 4 0 0 1 0 7.75"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <LocalizedText as="h2">
              {lang === "en"
                ? "Inquire Upcoming Schedule & Registration"
                : "Informasi Jadwal Terdekat & Pendaftaran"}
            </LocalizedText>
          </div>
          <p>
            {lang === "en"
              ? "Contact our training coordinator to obtain the upcoming course schedule, syllabus details, and registration procedure for your team."
              : "Hubungi koordinator pelatihan PT PSU untuk mendapatkan informasi jadwal batch terdekat, silabus materi lengkap, serta prosedur pendaftaran peserta."}
          </p>

          <div className="training-sub__cta-actions">
            <a
              className="training-sub__whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                lang === "en"
                  ? "Inquire schedule via WhatsApp"
                  : "Tanya jadwal pelatihan via WhatsApp"
              }
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                className="training-sub__btn-icon"
              >
                <path
                  fill="currentColor"
                  d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.05-.52-.099-.148-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.464 3.488"
                />
              </svg>
              <span>
                {lang === "en"
                  ? "Inquire via WhatsApp"
                  : "Konsultasi via WhatsApp"}
              </span>
            </a>

            <Link
              to="/kontak"
              className="training-sub__contact-button"
              aria-label={
                lang === "en"
                  ? "Go to contact page"
                  : "Buka formulir halaman kontak"
              }
            >
              <span>{lang === "en" ? "Contact Helpdesk" : "Hubungi Kami"}</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </aside>

        {/* Section Related Information */}
        <nav
          className="training-sub__related"
          aria-label={
            lang === "en" ? "Related training pages" : "Halaman terkait pelatihan"
          }
        >
          <h3>
            {lang === "en"
              ? "Explore Other Training Options"
              : "Pilihan Program Pelatihan Lainnya"}
          </h3>
          <div className="training-sub__related-links">
            <Link
              to="/layanan/pelatihan/inhouse-training"
              className="training-sub__related-chip"
            >
              {lang === "en"
                ? "Inhouse Training (On-Site) \u2192"
                : "Inhouse Training (Di Perusahaan) \u2192"}
            </Link>
            <Link
              to="/layanan/pelatihan/exhouse-training"
              className="training-sub__related-chip"
            >
              {lang === "en"
                ? "Exhouse Training (Laboratory) \u2192"
                : "Exhouse Training (Praktik Lab) \u2192"}
            </Link>
            <Link
              to="/layanan/pelatihan"
              className="training-sub__related-chip"
            >
              {lang === "en"
                ? "Training Overview Landing \u2192"
                : "Informasi Lembaga Pelatihan \u2192"}
            </Link>
          </div>
        </nav>
      </section>
    </>
  );
}
