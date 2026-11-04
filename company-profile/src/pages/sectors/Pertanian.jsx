import PageHeader from "../../components/PageHeader";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./Pertanian.css";

const COMMODITIES = [
  {
    id: "Beras",
    en: "Rice",
    image: "/Beras.webp",
    descId: "Rasakan keaslian bulir beras pilihan yang ditanam dengan penuh dedikasi oleh petani lokal. Pulen, harum, dan kaya nutrisi untuk sajian istimewa keluarga Anda.",
    descEn: "Experience the authenticity of selected rice grains grown with dedication by local farmers. Fluffy, fragrant, and rich in nutrients for your family's special meals.",
  },
  {
    id: "Biji Kakao",
    en: "Cocoa Beans",
    image: "/Biji Kakao.webp",
    descId: "Ekstrak cita rasa cokelat sejati dari biji kakao hasil fermentasi sempurna. Menghadirkan aroma pekat dan kualitas premium untuk mahakarya kuliner Anda.",
    descEn: "Extract the true chocolate flavor from perfectly fermented cocoa beans. Delivering a rich aroma and premium quality for your culinary masterpieces.",
  },
  {
    id: "Biji Kopi",
    en: "Coffee Beans",
    image: "/Biji Kopi.webp",
    descId: "Bangkitkan semangat dengan seduhan biji kopi nusantara. Dipanen dari dataran tinggi terbaik, menyimpan profil rasa yang khas dan aroma yang tak terlupakan.",
    descEn: "Awaken your spirit with a brew of archipelago coffee beans. Harvested from the best highlands, retaining a distinct flavor profile and unforgettable aroma.",
  }
];

export default function Pertanian() {
  const { lang } = useLanguage();
  const cardsRef = useRef(null);
  const title =
    lang === "en" ? "Agriculture and Plantation" : "Pertanian dan Perkebunan";

  useEffect(() => {
    const cards = cardsRef.current?.querySelectorAll(".pertanian-card");
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
        title={title}
        breadcrumbs={[
          { label: title, href: "/pertanian" },
        ]}
      />
      <div className="pertanian-cards" ref={cardsRef}>
        {COMMODITIES.map((item, index) => (
          <div className="pertanian-card" key={index}>
            <LoadingImage
              src={item.image} 
              alt={lang === "en" ? item.en : item.id} 
              className="pertanian-card__img" 
            />
            
            <div className="pertanian-card__overlay"></div>
            
            <div className="pertanian-card__content">
              <h3 className="pertanian-card__title">
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