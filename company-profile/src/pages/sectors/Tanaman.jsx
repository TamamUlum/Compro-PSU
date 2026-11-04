import PageHeader from "../../components/PageHeader";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./Tanaman.css";

const COMMODITIES = [
  {
    id: "Biskuit",
    en: "Biscuits",
    image: "/Biskuit.webp",
    descId:
      "Pengujian mikrobiologi (TPC, E. coli, Salmonella), kadar air, aktivitas air, dan kontaminan kimia sesuai SNI & BPOM.",
    descEn:
      "Microbiological testing (TPC, E. coli, Salmonella), moisture, water activity, and chemical contaminants per SNI & BPOM.",
  },
  {
    id: "Gula Kristal",
    en: "Crystal Sugar",
    image: "/Gula kristal.webp",
    descId:
      "Analisis rendemen, warna ICUMSA, keasaman, sulfated ash, pestisida, dan logam berat untuk standar SNI gula.",
    descEn:
      "Yield, ICUMSA color, acidity, sulfated ash, pesticides, and heavy metals for crystal sugar SNI standards.",
  },
  {
    id: "Kopi Instan",
    en: "Instant Coffee",
    image: "/Kopi Instan.webp",
    descId:
      "Uji kafein, kadar air, kelarutan, aktivitas air, sensoris, mikrobiologi, oksida etilen, dan akrilamida.",
    descEn:
      "Caffeine, moisture, solubility, water activity, sensory, microbiology, ethylene oxide, and acrylamide testing.",
  },
  {
    id: "Kopi Sangrai dan Kopi Bubuk",
    en: "Roasted and Ground Coffee",
    image: "/kopi sangrai dan kopi bubuk.webp",
    descId:
      "Kafein, kadar air, abu, keasaman, cupping, mikrobiologi, okratoksin A, dan logam berat per SNI kopi.",
    descEn:
      "Caffeine, moisture, ash, acidity, cupping, microbiology, ochratoxin A, and heavy metals per coffee SNI.",
  },
  {
    id: "Kopi Gula Krimer",
    en: "Coffee, Sugar, and Creamer",
    image: "/Kopi Gula Krimer.webp",
    descId:
      "Komposisi nutrisi (gula, lemak, protein), mikrobiologi, kafein, aktivitas air, pewarna & pengawet sintetis.",
    descEn:
      "Nutritional composition (sugar, fat, protein), microbiology, caffeine, water activity, synthetic colorants & preservatives.",
  },
  {
    id: "Kakao Bubuk",
    en: "Cocoa Powder",
    image: "/Kakao Bubuk.webp",
    descId:
      "Lemak kakao, kadar air, keasaman, kelarutan, teobromin, mikrobiologi (Salmonella, kapang), pestisida, logam berat.",
    descEn:
      "Cocoa fat, moisture, acidity, solubility, theobromine, microbiology (Salmonella, yeast/mold), pesticides, heavy metals.",
  },
  {
    id: "Minyak Goreng Sawit",
    en: "Palm Cooking Oil",
    image: "/Minyak Goreng Sawit.webp",
    descId:
      "Bilangan asam (FFA), peroksida, anisidin, kadar air, warna Lovibond, profil asam lemak, 3-MCPD, GE, logam berat.",
    descEn:
      "FFA, peroxide, anisidine, moisture, Lovibond color, fatty acid profile, 3-MCPD, GE, and heavy metals.",
  },
  {
    id: "Minyak Goreng",
    en: "Cooking Oil",
    image: "/Minyak Goreng.webp",
    descId:
      "Parameter kimia (bilangan asam, peroksida, anisidin, yodium), sensoris, mikrobiologi, pestisida, logam berat.",
    descEn:
      "Chemical parameters (acid value, peroxide, anisidine, iodine), sensory, microbiology, pesticides, heavy metals.",
  },
];

export default function Tanaman() {
  const { lang } = useLanguage();
  const rowsRef = useRef(null);
  const [cardsPerRow, setCardsPerRow] = useState(() =>
    window.matchMedia("(max-width: 992px)").matches ? 2 : 3
  );
  const title =
    lang === "en" ? "Plant Products and Derivatives" : "Produk Tanaman";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 992px)");
    const updateCardsPerRow = (event) => {
      setCardsPerRow(event.matches ? 2 : 3);
    };

    mediaQuery.addEventListener("change", updateCardsPerRow);
    return () => mediaQuery.removeEventListener("change", updateCardsPerRow);
  }, []);

  useEffect(() => {
    const rows = rowsRef.current?.querySelectorAll(".tanaman-card-row");
    if (!rows) return undefined;

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

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [cardsPerRow]);

  return (
    <section className="sector-detail-page">
      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: title, href: "/tanaman" },
        ]}
      />
      <div className="tanaman-cards" ref={rowsRef}>
        {Array.from(
          { length: Math.ceil(COMMODITIES.length / cardsPerRow) },
          (_, rowIndex) => {
            const rowItems = COMMODITIES.slice(
              rowIndex * cardsPerRow,
              rowIndex * cardsPerRow + cardsPerRow
            );

            return (
              <div
                className={`tanaman-card-row${cardsPerRow === 3 && rowItems.length === 2 ? " tanaman-card-row--centered" : ""}`}
                key={rowIndex}
              >
                {rowItems.map((item) => (
                  <article className="tanaman-card" key={item.id}>
                    <LoadingImage
                      src={item.image}
                      alt={lang === "en" ? item.en : item.id}
                      className="tanaman-card__img"
                    />
                    <div className="tanaman-card__overlay"></div>
                    <div className="tanaman-card__content">
                      <h3 className="tanaman-card__title">
                        {lang === "en" ? item.en : item.id}
                      </h3>
                    </div>
                  </article>
                ))}
              </div>
            );
          }
        )}
      </div>
      <Link className="sector-detail-page__back" to="/">
        {lang === "en" ? "Back to Home" : "Kembali ke Beranda"}
      </Link>
    </section>
  );
}
