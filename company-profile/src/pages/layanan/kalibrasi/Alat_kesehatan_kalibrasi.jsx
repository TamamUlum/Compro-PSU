import { useEffect, useRef, useState } from "react";
import PageHeader from "../../../components/PageHeader";
import "./Alat_kesehatan_kalibrasi.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";

import parameterTesterImage from "../../../assets/kalibrasi/Parameter Tester-.png";
import gasFlowAnalyzerImage from "../../../assets/kalibrasi/Gas Flow Analyzer.png";
import incubatorAnalyzerImage from "../../../assets/kalibrasi/Incubator Analyzer.png";
import electricalSafetyImage from "../../../assets/kalibrasi/Electrical Safety.png";
import patientSimulatorImage from "../../../assets/kalibrasi/Patient Simulator.png";
import defibrillatorImage from "../../../assets/kalibrasi/Defibrillator.png";
import anakTimbangF1Image from "../../../assets/kalibrasi/Anak Timbang F1.png";
import anakTimbangM2TwentyImage from "../../../assets/kalibrasi/Anak Timbang M2 (20 Kg).jpg";
import anakTimbangM2TenImage from "../../../assets/kalibrasi/Anak Timbang M2 (10 Kg).jpg";
import anakTimbangM2TwoImage from "../../../assets/kalibrasi/Anak Timbang M2 (2 Kg).jpg";

const products = [
  { name: "Parameter Tester", image: parameterTesterImage },
  { name: "Gas Flow Analyzer", image: gasFlowAnalyzerImage },
  { name: "Incubator Analyzer", image: incubatorAnalyzerImage },
  { name: "Electrical Safety", image: electricalSafetyImage },
  { name: "Patient Simulator", image: patientSimulatorImage },
  { name: "Defibrillator", image: defibrillatorImage },
  { name: "Anak Timbang F1", image: anakTimbangF1Image },
  { name: "Anak Timbang M2 (20 Kg)", image: anakTimbangM2TwentyImage },
  { name: "Anak Timbang M2 (10 Kg)", image: anakTimbangM2TenImage },
  { name: "Anak Timbang M2 (2 Kg)", image: anakTimbangM2TwoImage },
];

const calibrationServices = [
  ["Peralatan pernapasan", "Ventilator ICU"],
  ["Peralatan pernapasan", "Ventilator transport"],
  ["Peralatan pernapasan", "Ventilator neonatal"],
  ["Peralatan pernapasan", "CPAP"],
  ["Peralatan pernapasan", "BiPAP"],
  ["Peralatan pernapasan", "Flowmeter oksigen medis"],
  ["Peralatan pernapasan", "Oxygen blender (parameter aliran)"],
  ["Peralatan neonatal", "Baby incubator"],
  ["Peralatan neonatal", "Transport incubator"],
  ["Peralatan diagnostik", "Electrocardiograph (ECG/EKG)"],
  ["Peralatan monitoring", "ECG monitor"],
  ["Peralatan monitoring", "Patient monitor"],
  ["Peralatan monitoring", "Bedside monitor"],
  ["Peralatan tekanan darah", "Tensimeter digital"],
  ["Peralatan tekanan darah", "Tensimeter aneroid"],
  ["Peralatan tekanan darah", "NIBP monitor"],
  ["Peralatan kegawatdaruratan", "Defibrillator manual"],
  ["Peralatan kegawatdaruratan", "Automated External Defibrillator (AED)"],
  ["Peralatan penimbangan", "Timbangan badan digital"],
  ["Peralatan penimbangan", "Timbangan badan mekanik"],
  ["Peralatan penimbangan", "Timbangan bayi"],
  ["Peralatan penimbangan", "Timbangan kursi roda"],
];

export default function Alatkesehatankalibrasi() {
  const { t } = useLanguage();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sliderRef = useRef(null);

  useEffect(() => {
    if (!selectedProduct) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedProduct(null);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [selectedProduct]);

  useEffect(() => {
    const slider = sliderRef.current;
    if (!slider) return undefined;

    const updateScrollButtons = () => {
      setCanScrollLeft(slider.scrollLeft > 1);
      setCanScrollRight(slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 1);
    };

    updateScrollButtons();
    slider.addEventListener("scroll", updateScrollButtons, { passive: true });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      slider.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);

  const scrollProducts = (direction) => {
    const slider = sliderRef.current;
    if (!slider) return;

    slider.scrollBy({
      left: direction * slider.clientWidth * 0.85,
      behavior: "smooth",
    });
  };

  return (
    <>
      <PageHeader
        title="Alat Kesehatan"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Kalibrasi" },
          { label: "Ruang Lingkup" },
          { label: "Alat Kesehatan", href: "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan" },
        ]}
      />
      <section className="service-detail--alat-kesehatan-kalibrasi">
        <div className="calibration-products__intro">
          <p className="calibration-products__eyebrow">{t("RUANG LINGKUP KALIBRASI")}</p>
          <LocalizedText as="h1">Alat Kesehatan</LocalizedText>
          <p className="calibration-products__description">
            Kenali berbagai alat standar yang mendukung layanan kalibrasi alat kesehatan kami.
          </p>
        </div>

        <div className="calibration-products__slider-heading">
          <p className="calibration-products__count">{t("DAFTAR ALAT KALIBRATOR PSU")} <strong>({products.length})</strong></p>
          <div className="calibration-products__slider-controls" aria-label={t("Kontrol slider produk")}>
            <button
              className="calibration-products__arrow"
              type="button"
              aria-label={t("Geser produk ke kiri")}
              onClick={() => scrollProducts(-1)}
              disabled={!canScrollLeft}
            >
              <span aria-hidden="true">‹</span>
            </button>
            <button
              className="calibration-products__arrow"
              type="button"
              aria-label={t("Geser produk ke kanan")}
              onClick={() => scrollProducts(1)}
              disabled={!canScrollRight}
            >
              <span aria-hidden="true">›</span>
            </button>
          </div>
        </div>

        <div
          className="calibration-products__slider"
          ref={sliderRef}
          role="region"
          aria-label={t("DAFTAR ALAT KALIBRATOR PSU")}
        >
          {products.map((product, index) => (
            <button
              className="calibration-product-card"
              key={product.name}
              type="button"
              onClick={() => setSelectedProduct(product)}
              aria-label={`${t("Lihat foto")} ${t(product.name)}`}
              style={{ "--card-index": index }}
            >
              <span className="calibration-product-card__image-wrap">
                <img src={product.image} alt={t(product.name)} loading="lazy" />
                <span className="calibration-product-card__view">{t("Lihat foto")} <span aria-hidden="true">↗</span></span>
              </span>
              <span className="calibration-product-card__info">
                <span className="calibration-product-card__name">{t(product.name)}</span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="service-detail--alat-kesehatan-kalibrasi calibration-services">
        <div className="calibration-services__intro">
          <LocalizedText as="h2" className="calibration-services__title">
            Daftar Layanan Kalibrasi dan Pengujian Alat Kesehatan
          </LocalizedText>
          <LocalizedText as="p" className="calibration-services__description">
            Berikut daftar alat kesehatan yang berpotensi dilayani berdasarkan jenis kalibrator yang dimiliki PSU.
          </LocalizedText>
        </div>

        <div className="calibration-services__table-wrap">
          <table className="calibration-services__table">
            <caption className="calibration-services__sr-only">
              Daftar kelompok dan jenis alat kesehatan yang berpotensi dilayani PSU
            </caption>
            <thead>
              <tr>
                <th scope="col">{t("No.")}</th>
                <th scope="col">{t("Kelompok alat")}</th>
                <th scope="col">{t("Jenis alat kesehatan")}</th>
              </tr>
            </thead>
            <tbody>
              {calibrationServices.map(([group, equipment], index) => (
                <tr key={equipment}>
                  <td data-label={t("No.")}>
                    <span className="calibration-services__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td data-label={t("Kelompok alat")}>
                    <span className="calibration-services__group">{t(group)}</span>
                  </td>
                  <td data-label={t("Jenis alat kesehatan")}>
                    <span className="calibration-services__equipment">{t(equipment)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {selectedProduct && (
        <div
          className="calibration-product-modal"
          role="presentation"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="calibration-product-modal__dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="calibration-product-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="calibration-product-modal__close"
              type="button"
              aria-label={t("Tutup foto produk")}
              onClick={() => setSelectedProduct(null)}
            >
              ×
            </button>
            <img src={selectedProduct.image} alt={t(selectedProduct.name)} />
            <div className="calibration-product-modal__caption">
              <span>{t("Alat kesehatan kalibrasi")}</span>
              <h2 id="calibration-product-modal-title">{t(selectedProduct.name)}</h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
