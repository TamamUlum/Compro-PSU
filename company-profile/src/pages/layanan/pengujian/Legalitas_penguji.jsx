import PageHeader from "../../../components/PageHeader";
import "./Legalitas_penguji.css";
import LocalizedText from "../../../components/LocalizedText";
import LegalitasButtons from "../../../components/LegalitasButtons";
import { useLanguage } from "../../../context/useLanguage";

const testingScopeContent = (t) => (
  <figure className="legalitas-document legalitas-document--pdf">
    <iframe
      className="legalitas-document__pdf"
      src={`${import.meta.env.BASE_URL}Lampiran-Akreditasi-Pengujian.pdf#toolbar=0&navpanes=0`}
      title={t("Lampiran ruang lingkup akreditasi Laboratorium Pengujian LP-1554-IDN")}
    />
  </figure>
);

export default function Legalitaspenguji() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title="Legalitas"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pengujian" },
          { label: "Legalitas", href: "/layanan/penguji/legalitas" },
        ]}
      />
      <section className="service-detail--legalitas-penguji">
        <LocalizedText as="h1">Legalitas</LocalizedText>
        <LegalitasButtons
          documentContent={{
            "Sertifikasi Akreditasi": (
              <figure className="legalitas-document">
                <a
                  className="legalitas-document__link"
                  href={`${import.meta.env.BASE_URL}Akreditas%20Pengujian.jpeg`}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={t("Buka sertifikat akreditasi laboratorium penguji ukuran penuh di tab baru")}
                >
                  <img
                    className="legalitas-document__image"
                    src={`${import.meta.env.BASE_URL}Akreditas%20Pengujian.jpeg`}
                    alt={t("Sertifikat akreditasi Laboratorium Penguji LP-1554-IDN")}
                  />
                </a>
                <figcaption className="legalitas-document__caption">
                  {t("Klik gambar untuk membuka dokumen asli di tab baru.")}
                </figcaption>
              </figure>
            ),
            "Lampiran Ruang Lingkup": testingScopeContent(t),
          }}
        />
      </section>
    </>
  );
}
