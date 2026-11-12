import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_kalibrasi.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

export default function Biayapenawarankalibrasi() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Kalibrasi"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Kalibrasi", href: "/layanan/kalibrasi" },
          {
            label: "Biaya dan Penawaran Kalibrasi",
            href: "/layanan/kalibrasi/biaya-sertif",
          },
        ]}
      />

      <section className="service-detail--biaya-penawaran-kalibrasi site-container">
        <header className="calibration-fees__heading">
          <svg
            className="calibration-fees__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Calibration Service Fees & Quotation"
              : "Biaya dan Penawaran Layanan Kalibrasi"}
          </LocalizedText>
        </header>

        <p className="calibration-fees__tagline">
          {lang === "en"
            ? "Accurate, Traceable, and Professional Medical Device Calibration."
            : "Ketelitian Pengukuran dan Ketertelusuran Metrologis Alat Kesehatan yang Andal."}
        </p>

        <div className="calibration-fees__content-body">
          <p>
            {lang === "en"
              ? "PT Penilai Standar Uji (PSU) Calibration Laboratory provides professional calibration services for medical devices and precision measuring instruments. We are committed to supporting healthcare facilities, hospitals, clinics, and industries in maintaining equipment accuracy, patient safety, and regulatory compliance."
              : "Laboratorium Kalibrasi PT Penilai Standar Uji (PSU) menyediakan layanan kalibrasi peralatan medis dan instrumen ukur presisi. Kami berkomitmen mendukung fasilitas pelayanan kesehatan, rumah sakit, klinik, dan industri dalam menjaga akurasi peralatan, keselamatan pasien, serta kepatuhan terhadap standar regulasi."}
          </p>

          <p>
            {lang === "en"
              ? "Calibration fees are determined transparently based on the instrument type, technical parameters, quantity of devices, measurement range, and execution method (in-laboratory or on-site at the client facility)."
              : "Biaya kalibrasi ditetapkan secara transparan berdasarkan jenis peralatan, parameter teknis, jumlah instrumen, rentang ukur, serta metode pelaksanaan (in-laboratory di fasilitas PSU atau on-site langsung di lokasi fasilitas pelayanan kesehatan klien)."}
          </p>

          <h2 className="calibration-fees__subheading">
            {lang === "en"
              ? "Information Required for Quotation Request"
              : "Informasi yang Diperlukan untuk Permintaan Penawaran"}
          </h2>
          <p>
            {lang === "en"
              ? "To help us prepare an accurate and tailored proposal, please prepare the following basic details:"
              : "Untuk membantu tim kami menyusun rincian penawaran biaya yang tepat dan sesuai kebutuhan, mohon siapkan rincian informasi berikut:"}
          </p>

          <ul className="calibration-fees__list">
            <li>
              <strong>
                {lang === "en" ? "Instrument List:" : "Daftar Peralatan:"}
              </strong>{" "}
              {lang === "en"
                ? "Name, brand, model/type, and serial number of the devices."
                : "Nama alat, merk, tipe/model, dan nomor seri masing-masing instrumen."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Quantity:" : "Jumlah Unit:"}
              </strong>{" "}
              {lang === "en"
                ? "Total quantity of units requiring calibration."
                : "Jumlah total unit peralatan yang akan dikalibrasi."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Service Location:" : "Lokasi Pelaksanaan:"}
              </strong>{" "}
              {lang === "en"
                ? "On-site at client's hospital/clinic or delivered to PSU Calibration Laboratory."
                : "Pelaksanaan di lokasi fasilitas kesehatan klien (on-site) atau diantarkan ke Laboratorium PSU."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Technical Range / Parameters:"
                  : "Rentang Ukur / Parameter Khusus:"}
              </strong>{" "}
              {lang === "en"
                ? "Specific measuring ranges or special calibration specifications if required."
                : "Rentang pengukuran atau spesifikasi khusus yang dipersyaratkan oleh instansi pemohon."}
            </li>
          </ul>

          <h2 className="calibration-fees__subheading">
            {lang === "en"
              ? "Quotation & Consultation Workflow"
              : "Alur Konsultasi & Pengajuan Penawaran"}
          </h2>
          <ol className="calibration-fees__workflow-steps">
            <li>
              <strong>
                {lang === "en"
                  ? "Inquiry Submission:"
                  : "Pengajuan Permintaan:"}
              </strong>{" "}
              {lang === "en"
                ? "Submit your equipment list via WhatsApp or our official Contact Form."
                : "Kirimkan daftar peralatan yang membutuhkan kalibrasi melalui WhatsApp atau Formulir Kontak resmi."}
            </li>
            <li>
              <strong>
                {lang === "en" ? "Technical Review:" : "Verifikasi Teknis:"}
              </strong>{" "}
              {lang === "en"
                ? "Our technical experts verify calibration calibrator capability and schedule availability."
                : "Tim ahli teknis kalibrasi PSU memverifikasi kesesuaian ruang lingkup kalibrator dan ketersediaan jadwal."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Formal Proposal:"
                  : "Penerbitan Surat Penawaran:"}
              </strong>{" "}
              {lang === "en"
                ? "Receive an official quotation letter detailing scope, estimated turnaround time, and fees."
                : "PT PSU menerbitkan Surat Penawaran Resmi yang memuat rincian tarif, estimasi durasi, dan jadwal pelaksanaan."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Execution & Certification:"
                  : "Pelaksanaan & Penerbitan Sertifikat:"}
              </strong>{" "}
              {lang === "en"
                ? "Upon agreement, calibration is conducted by certified personnel and official certificates are issued."
                : "Setelah penawaran disetujui, teknisi bersertifikat melaksanakan kalibrasi hingga penerbitan sertifikat resmi."}
            </li>
          </ol>
        </div>

        {/* Section Contact CTA */}
        <aside className="calibration-fees__consultation">
          <div className="calibration-fees__consultation-heading">
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
              className="calibration-fees__consultation-icon"
            >
              <path
                d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <LocalizedText as="h2">
              {lang === "en"
                ? "Request a Calibration Quotation"
                : "Dapatkan Penawaran Kalibrasi Sesuai Kebutuhan Anda"}
            </LocalizedText>
          </div>
          <p>
            {lang === "en"
              ? "Share your medical equipment inventory or calibration inquiries. Our customer service team is ready to provide technical consultation and official quotation proposals."
              : "Sampaikan daftar inventaris alat kesehatan atau instrumen ukur yang Anda miliki. Tim layanan pelanggan Laboratorium PSU siap membantu memberikan estimasi dan surat penawaran resmi."}
          </p>

          <div className="calibration-fees__cta-actions">
            <a
              className="calibration-fees__whatsapp-button"
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                lang === "en"
                  ? "Request quotation via WhatsApp"
                  : "Minta penawaran kalibrasi via WhatsApp"
              }
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                className="calibration-fees__btn-icon"
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
              className="calibration-fees__contact-button"
              aria-label={
                lang === "en"
                  ? "Go to contact page"
                  : "Buka formulir halaman kontak"
              }
            >
              <span>{lang === "en" ? "Contact Helpdesk" : "Hubungi Kami"}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </aside>

        {/* Section Related Information */}
        <nav
          className="calibration-fees__related"
          aria-label={
            lang === "en" ? "Related calibration pages" : "Halaman terkait kalibrasi"
          }
        >
          <h3>
            {lang === "en"
              ? "Related Information & Calibration Scope"
              : "Informasi Terkait & Ruang Lingkup Kalibrasi"}
          </h3>
          <div className="calibration-fees__related-links">
            <Link
              to="/layanan/kalibrasi/ruang-lingkup/alat-kesehatan"
              className="calibration-fees__related-chip"
            >
              {lang === "en"
                ? "Scope of Medical Devices \u2192"
                : "Ruang Lingkup Alat Kesehatan \u2192"}
            </Link>
            <Link
              to="/layanan/kalibrasi/legalitas"
              className="calibration-fees__related-chip"
            >
              {lang === "en"
                ? "Calibration Legality & Accreditation \u2192"
                : "Legalitas & Akreditasi Kalibrasi \u2192"}
            </Link>
            <Link
              to="/layanan/kalibrasi"
              className="calibration-fees__related-chip"
            >
              {lang === "en"
                ? "Calibration Landing Overview \u2192"
                : "Informasi Umum Lembaga Kalibrasi \u2192"}
            </Link>
          </div>
        </nav>
      </section>
    </>
  );
}
