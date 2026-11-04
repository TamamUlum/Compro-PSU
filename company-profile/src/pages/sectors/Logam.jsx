import PageHeader from "../../components/PageHeader";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./Logam.css";

const COMMODITIES = [
  {
    id: "Peralatan Masak (Cookware) dari Logam Tahan Karat",
    en: "Cookware Made of Corrosion-Resistant Metal",
    image: "/Cookware.webp",
  },
  {
    id: "Peralatan Makan dan perlengkapan masak dari Baja Tahan Karat (Stainless Steel Flatware)",
    en: "Cutlery and Cooking Utensils Made of Stainless Steel (Stainless Steel Flatware)",
    image: "/Flatware.webp",
  },
  {
    id: "Wadah Bersekat (FOODTRAY) dari Baja Tahan Karat untuk Makanan",
    en: "Compartmented Containers (FOODTRAY) Made of Stainless Steel for Food",
    image: "/Foodtray.webp",
  }
];

export default function Logam() {
  const { lang } = useLanguage();
  const cardsRef = useRef(null);

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".logam-card");
    if (!cards) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.2 }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sector-detail-page">
      <PageHeader
        fullWidth
        title="Logam dan Produk Logam"
        breadcrumbs={[
          { label: "Logam dan Produk Logam", href: "/logam" },
        ]}
      />
      <div className="logam-cards" ref={cardsRef}>
        {COMMODITIES.map((item, index) => (
          <div className="logam-card" key={index}>
            <LoadingImage
              src={item.image}
              alt={lang === "en" ? item.en : item.id}
              className="logam-card__img"
            />

            <div className="logam-card__overlay"></div>

            <div className="logam-card__content">
              <h3 className="logam-card__title">
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
