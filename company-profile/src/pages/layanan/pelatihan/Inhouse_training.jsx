import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Inhouse_training.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

export default function Inhousetraining() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Inhouse Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan", href: "/layanan/pelatihan" },
          {
            label: "Inhouse Training",
            href: "/layanan/pelatihan/inhouse-training",
          },
        ]}
      />

      <section className="service-detail--inhouse-training site-container">
        <header className="training-sub__heading">
          <svg
            className="training-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M3 21h18M3 7v14M21 7v14M6 11h4M6 15h4M14 11h4M14 15h4M9 3l3-2 3 2v4H9V3z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Inhouse Training Program (Custom On-Site)"
              : "Program Inhouse Training (Pelatihan Khusus On-Site)"}
          </LocalizedText>
        </header>

        <p className="training-sub__tagline">
          {lang === "en"
            ? "Tailored Corporate Training Delivered Exclusively at Your Organization's Premises."
            : "Program Pelatihan Mutu Terkustomisasi yang Diselenggarakan Eksklusif di Fasilitas Perusahaan Anda."}
        </p>

        <div className="training-sub__content-body">
          <p>
            {lang === "en"
              ? "PT Penilai Standar Uji (PSU) delivers Inhouse Training solutions specifically developed to meet the unique operational challenges, quality requirements, and standard compliance goals of your organization. Our senior practitioner instructors conduct interactive sessions directly at your facility."
              : "Lembaga Pelatihan PT Penilai Standar Uji (PSU) menghadirkan solusi Inhouse Training yang dirancang khusus untuk menjawab tantangan operasional, kebutuhan sistem manajemen mutu, dan target kepatuhan standar organisasi Anda. Instruktur praktisi ahli kami hadir langsung di fasilitas perusahaan Anda."}
          </p>

          <p>
            {lang === "en"
              ? "This program offers significant advantages for companies seeking to upskill cross-functional teams simultaneously, align internal procedures, and accelerate standard certification readiness without sending personnel off-site."
              : "Program ini memberikan efisiensi tinggi bagi perusahaan yang ingin meningkatkan kompetensi banyak karyawan secara serentak, menyelaraskan prosedur operasional internal, serta mempercepat kesiapan audit sertifikasi tanpa perlu mengirim personel ke luar lokasi kerja."}
          </p>

          <h2 className="training-sub__subheading">
            {lang === "en"
              ? "Key Advantages of Inhouse Training"
              : "Keunggulan Program Inhouse Training PT PSU"}
          </h2>
          <ul className="training-sub__list">
            <li>
              <strong>
                {lang === "en"
                  ? "Customized Curriculum:"
                  : "Kurikulum Disesuaikan:"}
              </strong>{" "}
              {lang === "en"
                ? "Syllabus and exercises are tailored to your company's actual industry, products, and operational workflows."
                : "Silabus dan modul studi kasus disesuaikan langsung dengan jenis produk, proses produksi, dan prosedur mutu perusahaan Anda."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Confidentiality:" : "Kerahasiaan Dokumen Terjamin:"}
              </strong>{" "}
              {lang === "en"
                ? "Discuss internal procedures, audit findings, and proprietary data within a secure non-disclosure framework."
                : "Diskusi dan analisis ketidaksesuaian dapat langsung menggunakan dokumen kerja internal di bawah jaminan kerahasiaan penuh."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Cost Efficiency:" : "Efisiensi Biaya & Waktu:"}
              </strong>{" "}
              {lang === "en"
                ? "Train entire departments or multi-disciplinary audit teams in one session, minimizing travel and accommodation overheads."
                : "Melatih seluruh tim kerja dalam satu kelompok tanpa biaya perjalanan dinas dan akomodasi eksternal."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Flexible Scheduling:" : "Jadwal Fleksibel:"}
              </strong>{" "}
              {lang === "en"
                ? "Timing, dates, and session durations are coordinated to fit your operational shifts and plant schedules."
                : "Hari, tanggal, dan durasi pelatihan ditentukan secara fleksibel agar tidak mengganggu operasional rutin perusahaan."}
            </li>
          </ul>

          <h2 className="training-sub__subheading">
            {lang === "en"
              ? "Consultation & Implementation Workflow"
              : "Tahapan Pengajuan Inhouse Training"}
          </h2>
          <ol className="training-sub__workflow-steps">
            <li>
              <strong>
                {lang === "en"
                  ? "Training Needs Assessment:"
                  : "Konsultasi Kebutuhan (TNA):"}
              </strong>{" "}
              {lang === "en"
                ? "Initial discussion with PSU training consultants to define goals, participant profile, and focus standards."
                : "Diskusi awal bersama tim konsultan pelatihan PSU untuk memetakan sasaran kompetensi, profil peserta, dan standar yang dituju."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Syllabus & Proposal Formulation:"
                  : "Penyusunan Silabus & Proposal Resmi:"}
              </strong>{" "}
              {lang === "en"
                ? "Our instructional team prepares a customized training agenda and formal fee proposal."
                : "Penyusunan silabus khusus, rencana sesi, dan penerbitan Surat Penawaran Biaya resmi dari PT PSU."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "On-Site Delivery:"
                  : "Pelaksanaan Pelatihan di Lokasi:"}
              </strong>{" "}
              {lang === "en"
                ? "Interactive lectures, group workshops, practical simulation, and post-training evaluations."
                : "Pelaksanaan sesi interaktif, workshop dokumen, simulasi audit, serta evaluasi pemahaman peserta."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Certification & Reporting:"
                  : "Penerbitan Sertifikat & Laporan Hasil:"}
              </strong>{" "}
              {lang === "en"
                ? "Official certificates of training and an executive summary report delivered to company management."
                : "Penerbitan sertifikat resmi bagi seluruh peserta dan laporan evaluasi pelatihan kepada manajemen perusahaan."}
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
                ? "Discuss Your Inhouse Training Needs"
                : "Konsultasikan Kebutuhan Inhouse Training Perusahaan Anda"}
            </LocalizedText>
          </div>
          <p>
            {lang === "en"
              ? "Connect with our training specialists to discuss course customization, participant batch sizing, and formal corporate quotation."
              : "Diskusikan kebutuhan pelatihan internal tim Anda bersama spesialis pelatihan PT PSU untuk memperoleh silabus kustom dan penawaran biaya resmi."}
          </p>

          <div className="training-sub__cta-actions">
            <a
              className="training-sub__whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                lang === "en"
                  ? "Consult inhouse training via WhatsApp"
                  : "Konsultasi inhouse training via WhatsApp"
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
                  ? "Consult via WhatsApp"
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
              to="/layanan/pelatihan/general-training"
              className="training-sub__related-chip"
            >
              {lang === "en"
                ? "General Training (Public Courses) \u2192"
                : "General Training (Pelatihan Umum) \u2192"}
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
