import PageHeader from "../../components/PageHeader";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./Pangan.css";

const COMMODITIES = [
  {
    id: "Air Mineral",
    en: "Mineral Water",
    image: "/Air Mineral.webp",
    descId:
      "PT menyediakan layanan pengujian laboratorium untuk air mineral, memastikan kualitas dan keamanan produk sesuai standar nasional (SNI) dan regulasi BPOM. Uji parameter fisik, kimia, dan mikrobiologi untuk menjamin kebersihan dan kesesuaian komposisi mineral.",
    descEn:
      "PT provides laboratory testing services for mineral water, ensuring product quality and safety comply with national standards (SNI) and BPOM regulations. Testing physical, chemical, and microbiological parameters to guarantee hygiene and mineral composition compliance.",
  },
  {
    id: "Air Demineral",
    en: "Demineralized Water",
    image: "/Air Demineral.webp",
    descId:
      "Layanan pengujian air demineralisasi mencakup analisis kadar ion, konduktivitas, pH, dan kontaminan untuk memverifikasi tingkat kemurnian air. Memastikan air demineral memenuhi spesifikasi industri farmasi, elektronik, dan laboratorium.",
    descEn:
      "Demineralized water testing services include ion content analysis, conductivity, pH, and contaminants to verify water purity levels. Ensuring demineral water meets pharmaceutical, electronics, and laboratory industry specifications.",
  },
  {
    id: "Air Mineral Alami",
    en: "Natural Mineral Water",
    image: "/Air Mineral Alami.webp",
  },
  {
    id: "Air Minum Embun",
    en: "Rainwater",
    image: "/Air Minum Embun.webp",
  },
];

export default function Pangan() {
  const { lang } = useLanguage();
  const cardsRef = useRef(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".pangan-card");
    if (!cards) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 },
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sector-detail-page">
      <PageHeader
        fullWidth
        title="Produk Pangan"
        breadcrumbs={[
          { label: "Produk Pangan", href: "/pangan" },
        ]}
      />
      <div className="pangan-cards" ref={cardsRef}>
        {COMMODITIES.map((item, index) => (
          <div className="pangan-card" key={index}>
            <LoadingImage
              src={item.image}
              alt={lang === "en" ? item.en : item.id}
              className="pangan-card__img"
            />

            <div className="pangan-card__overlay"></div>

            <div className="pangan-card__content">
              <h3 className="pangan-card__title">
                {lang === "en" ? item.en : item.id}
              </h3>
            </div>
          </div>
        ))}
      </div>

      <Link className="sector-detail-page__back" to="/">
        {lang === "en" ? "Back to Home" : "Kembali ke Beranda"}
      </Link>
    </section>
  );
}
