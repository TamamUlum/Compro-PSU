import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_penguji.css";
import LocalizedText from "../../../components/LocalizedText";

const WHATSAPP_NUMBER = "6281908344114";
const WHATSAPP_MESSAGE =
  "Halo, saya ingin meminta informasi dan penawaran biaya pengujian produk. Produk atau sampel yang akan diuji adalah [jenis produk], dengan parameter pengujian [parameter]. Mohon informasi mengenai metode atau standar pengujian, estimasi biaya, dan waktu penyelesaian. Terima kasih.";

export default function Biayapenawaranpenguji() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Pengujian"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pengujian" },
          { label: "Biaya dan Penawaran Pengujian", href: "/layanan/penguji/biaya-sertif" },
        ]}
      />
      <section className="service-detail--biaya-penawaran-penguji">
        <header className="testing-fees__heading">
          <svg
            className="testing-fees__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M9 3.5h6M10 3.5v6.2L5.5 18a1.7 1.7 0 0 0 1.5 2.5h10a1.7 1.7 0 0 0 1.5-2.5L14 9.7V3.5M8 15h8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">Biaya dan Penawaran Layanan Pengujian</LocalizedText>
        </header>

        <LocalizedText as="p" className="testing-fees__tagline">
          Solusi Pengujian Produk yang Akurat, Andal, dan Profesional.
        </LocalizedText>
        <LocalizedText as="p">
          Laboratorium PT Penilai Standar Uji (PSU) menyediakan layanan pengujian produk
          berdasarkan metode pengujian, standar acuan, serta ruang lingkup kemampuan laboratorium
          yang berlaku.
        </LocalizedText>
        <LocalizedText as="p">
          Kami berkomitmen memberikan layanan pengujian yang profesional, objektif, dan terpercaya
          untuk mendukung pemenuhan persyaratan mutu, keamanan, serta kesesuaian produk terhadap
          standar yang ditetapkan.
        </LocalizedText>
        <LocalizedText as="p">
          Biaya pengujian ditentukan berdasarkan jenis produk atau sampel, parameter pengujian,
          metode atau standar yang digunakan, jumlah sampel, serta kebutuhan teknis pengujian.
        </LocalizedText>
        <LocalizedText as="p">
          Untuk mendapatkan informasi mengenai tarif pengujian, parameter yang tersedia, estimasi
          waktu penyelesaian, dan penawaran harga, silakan menghubungi tim layanan pelanggan
          Laboratorium PSU.
        </LocalizedText>

        <aside className="testing-fees__consultation">
          <div className="testing-fees__consultation-heading">
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path
                d="M7 3.75h8l4 4V19a1.25 1.25 0 0 1-1.25 1.25h-10.5A1.25 1.25 0 0 1 6 19V5a1.25 1.25 0 0 1 1-1.25Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinejoin="round"
              />
              <path
                d="M14.5 4v4h4M9 12h6M9 15.5h6"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <LocalizedText as="h2">Dapatkan Penawaran Pengujian Sesuai Kebutuhan Anda</LocalizedText>
          </div>
          <LocalizedText as="p">
            Sampaikan jenis produk dan parameter pengujian yang dibutuhkan. Tim kami siap membantu
            memberikan informasi teknis dan penawaran biaya pengujian.
          </LocalizedText>
          <a
            className="testing-fees__whatsapp-button"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LocalizedText as="span">Minta Penawaran Pengujian</LocalizedText>
            <span aria-hidden="true">→</span>
          </a>
        </aside>
      </section>
    </>
  );
}
