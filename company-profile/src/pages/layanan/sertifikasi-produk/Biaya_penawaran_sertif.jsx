import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_sertif.css";
import LocalizedText from "../../../components/LocalizedText";

const WHATSAPP_NUMBER = "6281908344114";
const WHATSAPP_MESSAGE =
  "Halo, saya ingin berkonsultasi mengenai biaya dan penawaran sertifikasi produk. Mohon informasi mengenai persyaratan, ruang lingkup sertifikasi, tahapan proses, dan estimasi biaya untuk produk saya. Terima kasih.";

export default function Biayapenawaransertif() {
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;

  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Sertifikasi"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Biaya dan Penawaran Sertifikasi", href: "/layanan/sertif-produk/biaya-sertif" },
        ]}
      />
      <section className="service-detail--biaya-penawaran-sertif">
        <header className="product-fees__heading">
          <svg
            className="product-fees__heading-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M12 3.5 14.2 5l2.7-.1.7 2.6 2 1.8-1 2.5.5 2.7-2.3 1.5-.9 2.6-2.7-.2L12 20l-2.2-1.6-2.7.2-.9-2.6-2.3-1.5.5-2.7-1-2.5 2-1.8.7-2.6 2.7.1L12 3.5Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="m9 12 2 2 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <LocalizedText as="h1">Biaya dan Penawaran Sertifikasi Produk</LocalizedText>
        </header>

        <LocalizedText as="p" className="product-fees__tagline">
          Wujudkan Kepercayaan dan Tingkatkan Daya Saing Produk Anda melalui Sertifikasi Produk.
        </LocalizedText>
        <LocalizedText as="p">
          LSPro PT Penilai Standar Uji (PSU) menyediakan layanan sertifikasi produk sesuai dengan
          ruang lingkup sertifikasi yang berlaku, dengan proses yang profesional, independen,
          transparan, dan mengacu pada persyaratan standar serta ketentuan yang berlaku.
        </LocalizedText>
        <LocalizedText as="p">
          Biaya sertifikasi disesuaikan dengan jenis produk, ruang lingkup sertifikasi, skema
          sertifikasi, kebutuhan pengujian, serta tahapan evaluasi kesesuaian yang diperlukan.
        </LocalizedText>
        <LocalizedText as="p">
          Untuk memperoleh informasi lebih lanjut mengenai rincian biaya, persyaratan, dan
          penawaran sertifikasi produk, silakan menghubungi tim layanan pelanggan LSPro PSU.
        </LocalizedText>

        <aside className="product-fees__consultation">
          <div className="product-fees__consultation-heading">
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
            <LocalizedText as="h2">Konsultasikan Kebutuhan Sertifikasi Produk Anda</LocalizedText>
          </div>
          <LocalizedText as="p">
            Tim kami siap membantu memberikan informasi layanan dan penawaran sesuai kebutuhan
            sertifikasi produk Anda.
          </LocalizedText>
          <a
            className="product-fees__whatsapp-button"
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <LocalizedText as="span">Ajukan Permintaan Penawaran</LocalizedText>
            <span aria-hidden="true">→</span>
          </a>
        </aside>
      </section>
    </>
  );
}
