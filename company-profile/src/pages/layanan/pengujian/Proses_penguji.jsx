import PageHeader from "../../../components/PageHeader";
import "./Proses_penguji.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";

export default function Prosespenguji() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title="Proses Pengujian"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pengujian" },
          { label: "Proses Pengujian", href: "/layanan/penguji/proses-pengujian" },
        ]}
      />
      <section className="service-detail--proses-penguji">
        <header className="testing-process__header">
          <div className="testing-process__heading">
            <span className="testing-process__eyebrow">
              <LocalizedText>LABORATORIUM PENGUJIAN</LocalizedText>
            </span>
            <LocalizedText as="h1">Alur Proses Pengujian</LocalizedText>
            <LocalizedText as="p">
              Dari permohonan hingga hasil diterima, setiap tahap dilakukan
              secara terencana dan terdokumentasi.
            </LocalizedText>
          </div>
          <div className="testing-process__index" aria-hidden="true">
            <span>01</span>
            <span className="testing-process__index-line" />
            <span>11</span>
            <small>TAHAPAN</small>
          </div>
        </header>

        <figure className="testing-process__figure">
          <div className="testing-process__image-wrap">
            <a
              className="testing-process__image-link"
              href="/alur-proses-analisa.jpeg"
              target="_blank"
              rel="noreferrer"
              aria-label={t("Buka infografik alur proses analisa ukuran penuh")}
            >
              <img
                className="testing-process__image"
                src="/alur-proses-analisa.jpeg"
                alt={t(
                  "Infografik alur proses analisa laboratorium dari permohonan pengujian hingga arsip dan rekaman"
                )}
                loading="lazy"
              />
            </a>
          </div>
          <figcaption className="testing-process__caption">
            <span className="testing-process__caption-mark" aria-hidden="true">
              ↗
            </span>
            <span>
              <LocalizedText as="strong">
                Alur proses analisa laboratorium
              </LocalizedText>
              <LocalizedText as="small">
                Pilih gambar untuk melihat infografik dalam ukuran penuh.
              </LocalizedText>
            </span>
          </figcaption>
        </figure>
      </section>
    </>
  );
}
