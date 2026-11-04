import { useState } from "react";
import { useLanguage } from "../context/useLanguage";
import "./LegalitasButtons.css";

const legalitasDocuments = [
  "Sertifikasi Akreditasi",
  "Lampiran Ruang Lingkup",
  "NIB",
];

const nibContent = (t) => (
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

export default function LegalitasButtons({
  documentContent = {},
  additionalDocuments = [],
}) {
  const { t } = useLanguage();
  const availableDocuments = [
    ...legalitasDocuments,
    ...additionalDocuments.map(({ label }) => label),
  ];
  const [activeDocument, setActiveDocument] = useState(
    () => availableDocuments[0],
  );
  const selectedDocument = availableDocuments.includes(activeDocument)
    ? activeDocument
    : availableDocuments[0];
  const activeContent =
    selectedDocument === "NIB"
      ? nibContent(t)
      : documentContent[selectedDocument] ??
        additionalDocuments.find(({ label }) => label === selectedDocument)
          ?.content ?? (
          <p className="legalitas-document__unavailable">
            {t("Dokumen untuk bagian ini belum tersedia.")}
          </p>
        );

  return (
    <>
      <div className="legalitas-buttons" aria-label={t("Dokumen legalitas")}>
        {availableDocuments.map((document) => (
          <button
            key={document}
            type="button"
            className="legalitas-button"
            aria-pressed={document === selectedDocument}
            onClick={() => setActiveDocument(document)}
          >
            {t(document)}
          </button>
        ))}
      </div>
      <div className="legalitas-document-content">{activeContent}</div>
    </>
  );
}
