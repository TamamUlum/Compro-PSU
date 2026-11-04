import PageHeader from "../../../components/PageHeader";
import "./Legalitas_kalibrasi.css";
import LocalizedText from "../../../components/LocalizedText";
import LegalitasButtons from "../../../components/LegalitasButtons";
import { useLanguage } from "../../../context/useLanguage";

export default function Legalitaskalibrasi() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title="Legalitas"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Kalibrasi" },
          { label: "Legalitas", href: "/layanan/kalibrasi/legalitas" },
        ]}
      />
      <section className="service-detail--legalitas-kalibrasi">
        <LocalizedText as="h1">Legalitas</LocalizedText>
        <LegalitasButtons
          additionalDocuments={[
            {
              label: "Alur Bisnis",
              content: (
                <figure className="legalitas-document">
                  <a
                    className="legalitas-document__link"
                    href={`${import.meta.env.BASE_URL}Alur_Proses_Kalibrasi.jpg`}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={t(
                      "Buka gambar alur proses kalibrasi ukuran penuh di tab baru",
                    )}
                  >
                    <img
                      className="legalitas-document__image"
                      src={`${import.meta.env.BASE_URL}Alur_Proses_Kalibrasi.jpg`}
                      alt={t("Alur Proses Kalibrasi")}
                    />
                  </a>
                  <figcaption className="legalitas-document__caption">
                    {t("Klik gambar untuk membuka dokumen asli di tab baru.")}
                  </figcaption>
                </figure>
              ),
            },
          ]}
        />
      </section>
    </>
  );
}
