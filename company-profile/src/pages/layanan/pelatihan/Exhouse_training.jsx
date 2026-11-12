import { Link, useLocation } from "react-router-dom";
import PageHeader from "../../../components/PageHeader";
import "./Exhouse_training.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { getWhatsAppUrl } from "../../../utils/whatsapp";

export default function ExhouseTraining() {
  const { lang } = useLanguage();
  const location = useLocation();
  const whatsappUrl = getWhatsAppUrl(location.pathname, null, lang);

  return (
    <>
      <PageHeader
        title="Exhouse Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan", href: "/layanan/pelatihan" },
          {
            label: "Exhouse Training",
            href: "/layanan/pelatihan/exhouse-training",
          },
        ]}
      />

      <section className="service-detail--exhouse-training site-container">
        <header className="exhouse-sub__heading">
          <svg
            className="exhouse-sub__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">
            {lang === "en"
              ? "Exhouse Training (Off-Site & Lab Workshop)"
              : "Program Pelatihan Praktik & Laboratorium (Exhouse Training)"}
          </LocalizedText>
        </header>

        <p className="exhouse-sub__tagline">
          {lang === "en"
            ? "Hands-on Laboratory Practice, Metrology Instrumentation, and Method Validation at Accredited Testing Facilities."
            : "Praktik Langsung Pengujian Laboratorium, Instrumentasi Kalibrasi, dan Verifikasi Metode di Fasilitas Terakreditasi."}
        </p>

        <div className="exhouse-sub__content-body">
          <p>
            {lang === "en"
              ? "Exhouse Training by PT Penilai Standar Uji (PSU) is an intensive, practical workshop program conducted off-site at accredited testing laboratories and partner specialized facilities. This program provides participants with direct, hands-on experience using modern analytical instruments, testing apparatus, and calibration standards under the supervision of senior technical practitioners."
              : "Program Exhouse Training oleh PT Penilai Standar Uji (PSU) merupakan pelatihan praktik intensif yang diselenggarakan di fasilitas laboratorium pengujian dan kalibrasi terakreditasi milik PSU maupun sentra pengujian mitra. Program ini memberikan pengalaman praktik langsung kepada peserta dalam mengoperasikan instrumen analitis modern, peralatan uji standar, serta fasilitas kalibrasi di bawah supervisi langsung praktisi dan analis teknis senior."}
          </p>

          <p>
            {lang === "en"
              ? "Unlike traditional theoretical seminars, Exhouse Training focuses on direct laboratory operations, measurement uncertainty calculation, equipment verification, troubleshooting test anomalies, and validating test results in strict compliance with ISO/IEC 17025 standards."
              : "Berbeda dari seminar teori konvensional, Exhouse Training menitikberatkan pada keterampilan teknis lapangan: pengoperasian instrumen, estimasi ketidakpastian pengukuran, verifikasi peralatan, identifikasi anomali hasil uji, serta pemenuhan Good Laboratory Practice berbasis SNI ISO/IEC 17025."}
          </p>

          <h2 className="exhouse-sub__subheading">
            {lang === "en"
              ? "Core Laboratory & Workshop Training Topics"
              : "Fokus Bidang Pelatihan Praktik Laboratorium"}
          </h2>
          <ul className="exhouse-sub__list">
            <li>
              <strong>
                {lang === "en"
                  ? "Practical Testing for Consumer & Industrial Goods:"
                  : "Praktik Pengujian Produk Konsumen & Industri:"}
              </strong>{" "}
              {lang === "en"
                ? "Physical, mechanical, flammability, and migration testing for toys (SNI ISO 8124), garment tensile and colorfastness, footwear adhesion/flexing, ceramic tableware durability, and audio/video safety testing."
                : "Pengujian mekanik, fisik, sifat mudah terbakar, dan migrasi zat pada mainan anak (SNI ISO 8124), uji kuat tarik & ketahanan luntur kain/pakaian, fleksibilitas & ketahanan rekat alas kaki, uji ketahanan tableware keramik, serta uji keselamatan peralatan elektronika audio/video."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Calibration & Metrology Bench Practice:"
                  : "Praktik Instrumentasi & Kalibrasi Metrologi:"}
              </strong>{" "}
              {lang === "en"
                ? "Calibration techniques for mass & analytical balances, thermal enclosures (ovens, incubators), pressure gauges, dimensional metrology (calipers, micrometers), and electrical testing instruments."
                : "Teknik kalibrasi neraca analitis & anak timbangan, oven/inkubator/suhu, pressure gauge & transmitter, instrumen dimensi (caliper, mikrometer), serta instrumentasi kelistrikan (multimeter & power analyzer)."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "ISO/IEC 17025 Technical Competence:"
                  : "Kompetensi Teknis SNI ISO/IEC 17025:"}
              </strong>{" "}
              {lang === "en"
                ? "Method validation/verification, measurement uncertainty calculation, quality control charts, proficiency testing participation, and equipment intermediate checks."
                : "Validasi & verifikasi metode pengujian, estimasi ketidakpastian pengukuran (measurement uncertainty), penyusunan control chart QC, keikutsertaan uji banding antarlaboratorium, dan uji antara peralatan."}
            </li>
            <li>
              <strong>
                {lang === "en"
                  ? "Equipment Maintenance & Calibration Troubleshooting:"
                  : "Pemeliharaan & Pemecahan Masalah Alat Uji:"}
              </strong>{" "}
              {lang === "en"
                ? "Preventive maintenance, drift detection, trace-level calibration records, and laboratory safety handling."
                : "Pemeliharaan preventif, deteksi pergeseran (drift) alat, dokumentasi rekaman kalibrasi tertelusur, serta tata kelola keselamatan dan kesehatan kerja (K3) laboratorium."}
            </li>
          </ul>

          <h2 className="exhouse-sub__subheading">
            {lang === "en"
              ? "Key Advantages of Exhouse Training"
              : "Keunggulan Program Exhouse Training PSU"}
          </h2>
          <div className="exhouse-sub__grid">
            <div className="exhouse-sub__feature-card">
              <div className="exhouse-sub__feature-number">01</div>
              <h3>
                {lang === "en"
                  ? "Accredited Lab Facilities"
                  : "Fasilitas Lab Terakreditasi"}
              </h3>
              <p>
                {lang === "en"
                  ? "Participants train directly using high-precision instruments and accredited testing apparatus under real working conditions."
                  : "Peserta berlatih langsung menggunakan instrumen presisi tinggi dan peralatan uji di laboratorium terakreditasi dalam kondisi operasional riil."}
              </p>
            </div>
            <div className="exhouse-sub__feature-card">
              <div className="exhouse-sub__feature-number">02</div>
              <h3>
                {lang === "en"
                  ? "Real Test Specimens"
                  : "Spesimen Pengujian Riil"}
              </h3>
              <p>
                {lang === "en"
                  ? "Practical sessions utilize genuine product samples, simulating realistic industrial testing challenges and troubleshooting."
                  : "Sesi praktik menggunakan sampel produk nyata dari berbagai industri, mensimulasikan tantangan pengujian dan pemecahan masalah riil."}
              </p>
            </div>
            <div className="exhouse-sub__feature-card">
              <div className="exhouse-sub__feature-number">03</div>
              <h3>
                {lang === "en"
                  ? "Senior Technical Mentors"
                  : "Instruktur Praktisi Senior"}
              </h3>
              <p>
                {lang === "en"
                  ? "Direct guidance from certified laboratory analysts, metrologists, and technical assessors with decades of field experience."
                  : "Bimbingan langsung dari analis laboratorium bersertifikat, ahli metrologi, dan asesor teknis dengan jam terbang industri yang tinggi."}
              </p>
            </div>
            <div className="exhouse-sub__feature-card">
              <div className="exhouse-sub__feature-number">04</div>
              <h3>
                {lang === "en"
                  ? "Competency Certification"
                  : "Sertifikat Pelatihan Resmi"}
              </h3>
              <p>
                {lang === "en"
                  ? "Graduates receive an official Certificate of Competence / Completion issued by PT Penilai Standar Uji."
                  : "Peserta yang menyelesaikan program dan evaluasi praktik memperoleh Sertifikat Pelatihan resmi dari PT Penilai Standar Uji."}
              </p>
            </div>
          </div>

          {/* Consultation CTA Box */}
          <div className="exhouse-sub__consultation">
            <div className="exhouse-sub__consultation-heading">
              <svg
                className="exhouse-sub__consultation-icon"
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
                  ? "Register or Inquire for Upcoming Exhouse Workshops"
                  : "Konsultasi & Pendaftaran Jadwal Exhouse Training"}
              </h3>
            </div>
            <p>
              {lang === "en"
                ? "Exhouse training batches have limited seats to guarantee hands-on laboratory time for each participant. Connect with our training coordinator to check schedule availability, lab facility locations, and course syllabi."
                : "Jumlah peserta setiap angkatan pelatihan exhouse dibatasi agar setiap peserta mendapatkan kesempatan praktik instrumen yang maksimal. Hubungi koordinator pelatihan kami untuk mengetahui jadwal terdekat, lokasi lab, dan silabus lengkap."}
            </p>
            <div className="exhouse-sub__cta-actions">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="exhouse-sub__btn-whatsapp"
                aria-label="Hubungi kami melalui WhatsApp untuk konsultasi Exhouse Training"
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
                    ? "Chat via WhatsApp"
                    : "Konsultasi via WhatsApp"}
                </span>
              </a>
              <Link to="/kontak" className="exhouse-sub__btn-secondary">
                {lang === "en" ? "Contact Office" : "Hubungi Kami"}
              </Link>
            </div>
          </div>

          {/* Related Links */}
          <div className="exhouse-sub__related">
            <h3>
              {lang === "en"
                ? "Other Training Programs:"
                : "Program Pelatihan Lainnya:"}
            </h3>
            <div className="exhouse-sub__related-links">
              <Link
                to="/layanan/pelatihan/general-training"
                className="exhouse-sub__related-card"
              >
                <span className="exhouse-sub__related-title">
                  General Training →
                </span>
                <span className="exhouse-sub__related-desc">
                  {lang === "en"
                    ? "Public courses on ISO standards and audit management."
                    : "Pelatihan publik reguler pemahaman standar SNI ISO."}
                </span>
              </Link>
              <Link
                to="/layanan/pelatihan/inhouse-training"
                className="exhouse-sub__related-card"
              >
                <span className="exhouse-sub__related-title">
                  Inhouse Training →
                </span>
                <span className="exhouse-sub__related-desc">
                  {lang === "en"
                    ? "Customized corporate training at your facility."
                    : "Pelatihan khusus in-company di fasilitas organisasi Anda."}
                </span>
              </Link>
              <Link
                to="/layanan/pelatihan"
                className="exhouse-sub__related-card"
              >
                <span className="exhouse-sub__related-title">
                  Training Centre →
                </span>
                <span className="exhouse-sub__related-desc">
                  {lang === "en"
                    ? "Comprehensive training programs & accreditations."
                    : "Informasi lengkap seluruh program pelatihan PSU."}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
