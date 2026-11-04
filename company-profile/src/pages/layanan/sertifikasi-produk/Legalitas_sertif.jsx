import PageHeader from "../../../components/PageHeader";
import "./Legalitas_sertif.css";
import LocalizedText from "../../../components/LocalizedText";
import LegalitasButtons from "../../../components/LegalitasButtons";
import { useLanguage } from "../../../context/useLanguage";

const accreditationScope = (t) => (
  <figure className="legalitas-document legalitas-document--pdf">
    <iframe
      className="legalitas-document__pdf"
      src={`${import.meta.env.BASE_URL}Lampiran-Akreditasi-LSPro.pdf#toolbar=0&navpanes=0`}
      title={t("Lampiran ruang lingkup akreditasi LSPr-051-IDN")}
    />
  </figure>
);

const accreditationCertificate = (t) => (
  <figure className="legalitas-document">
    <a
      className="legalitas-document__link"
      href={`${import.meta.env.BASE_URL}Akreditas%20LSPro.jpeg`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("Buka sertifikat akreditasi ukuran penuh di tab baru")}
    >
      <img
        className="legalitas-document__image"
        src={`${import.meta.env.BASE_URL}Akreditas%20LSPro.jpeg`}
        alt={t("Sertifikat akreditasi LSPr-051-IDN dari Komite Akreditasi Nasional")}
      />
    </a>
    <figcaption className="legalitas-document__caption">
      {t("Klik gambar untuk membuka dokumen asli di tab baru.")}
    </figcaption>
  </figure>
);

const businessLicense = (t) => (
  <figure className="legalitas-document">
    <a
      className="legalitas-document__link"
      href={`${import.meta.env.BASE_URL}NIB.jpeg`}
      target="_blank"
      rel="noreferrer"
      aria-label={t("Buka gambar NIB ukuran penuh di tab baru")}
    >
      <img
        className="legalitas-document__image"
        src={`${import.meta.env.BASE_URL}NIB.jpeg`}
        alt={t("Dokumen Nomor Induk Berusaha PT PENILAI STANDAR UJI")}
      />
    </a>
    <figcaption className="legalitas-document__caption">
      {t("Klik gambar untuk membuka dokumen asli di tab baru.")}
    </figcaption>
  </figure>
);

export default function Legalitassertif() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title="Legalitas"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Legalitas", href: "/layanan/sertif-produk/legalitas" },
        ]}
      />
      <section className="service-detail--legalitas-sertif">
        <LocalizedText as="h1">Legalitas</LocalizedText>
        <LegalitasButtons
          documentContent={{
            "Sertifikasi Akreditasi": accreditationCertificate(t),
            "Lampiran Ruang Lingkup": accreditationScope(t),
            NIB: businessLicense(t),
          }}
        />
      </section>
    </>
  );
}
