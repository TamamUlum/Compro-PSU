import PageHeader from "../../components/PageHeader";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./Kimia.css";

const FERTILIZERS = [
  {
    id: "Pupuk Super Fosfat SP-36",
    en: "Super Phosphate SP-36 Fertilizer",
    image: "/1.webp",
  },
  {
    id: "Pupuk Fosfat Alam untuk Pertanian",
    en: "Natural Phosphate Fertilizer for Agriculture",
    image: "/2.webp",
  },
  {
    id: "Pupuk Kalium Klorida",
    en: "Potassium Chloride Fertilizer",
    image: "/3.webp",
  },
  {
    id: "Pupuk Tripel Super Fosfat/TSP",
    en: "Triple Super Phosphate (TSP) Fertilizer",
    image: "/4.webp",
  },
  { id: "Pupuk NPK Padat", 
    en: "Solid NPK Fertilizer", 
    image: "/5.webp" 
  },
  {
    id: "Pupuk Amonium Sulfat (ZA)",
    en: "Ammonium Sulfate (ZA) Fertilizer",
    image: "/6.webp",
  },
  { id: "Pupuk Urea", 
    en: "Urea Fertilizer", 
    image: "/7.webp" 
  },
  {
    id: "Pupuk Mono Amonium Fosfat (MAP)",
    en: "Mono Ammonium Phosphate (MAP) Fertilizer",
    image: "/8.webp",
  },
  {
    id: "Pupuk Diamonium Fosfat",
    en: "Diammonium Phosphate Fertilizer",
    image: "/9.webp",
  },
  {
    id: "Pupuk Urea Amonium Fosfat",
    en: "Urea Ammonium Phosphate Fertilizer",
    image: "/10.jpeg",
  },
  {
    id: "Pupuk Tripel Super Fosfat Plus-ZN",
    en: "Triple Super Phosphate Plus-ZN Fertilizer",
    image: "/11.webp",
  },
  {
    id: "Pupuk Super Fosfat Plus-ZN",
    en: "Super Phosphate Plus-ZN Fertilizer",
    image: "/19.webp",
  },
  {
    id: "Pupuk Super Fosfat Tunggal",
    en: "Single Super Phosphate Fertilizer",
    image: "/12.webp",
  },
  { id: "Pupuk Dolomit", 
    en: "Dolomite Fertilizer", 
    image: "/13.webp" 
  },
  {
    id: "Pupuk Borat",
    en: "Borate Fertilizer",
    image: "/14.webp",
  },
  {
    id: "Pupuk Amonium Klorida",
    en: "Ammonium Chloride Fertilizer",
    image: "/15.webp",
  },
  { id: "Pupuk Kiseret", 
    en: "Kieserite Fertilizer", 
    image: "/16.webp" 
  },
  {
    id: "Pupuk Kalium Sulfat",
    en: "Potassium Sulfate Fertilizer",
    image: "/17.webp",
  },
  {
    id: "Pupuk Cair Hasil Samping Proses Asam Amino (Haspramin)",
    en: "Amino Acid Process By-product Liquid Fertilizer (Haspramin)",
    image: "/18.webp",
  },
];

export default function Kimia() {
  const { lang } = useLanguage();
  const rowsRef = useRef(null);
  const [cardsPerRow, setCardsPerRow] = useState(() =>
    window.matchMedia("(max-width: 992px)").matches ? 2 : 3,
  );
  const ITEMS_PER_PAGE = 6;
  const totalPages = Math.ceil(FERTILIZERS.length / ITEMS_PER_PAGE);
  const [page, setPage] = useState(1);
  const cardsRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 992px)");
    const updateCardsPerRow = (event) => {
      setCardsPerRow(event.matches ? 2 : 3);
      setPage(1);
    };

    mediaQuery.addEventListener("change", updateCardsPerRow);
    return () => mediaQuery.removeEventListener("change", updateCardsPerRow);
  }, []);

  useEffect(() => {
    const rows = rowsRef.current?.querySelectorAll(".kimia-card-row");
    if (!rows || typeof IntersectionObserver === "undefined") return undefined;

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

    rows.forEach((row) => observer.observe(row));
    return () => observer.disconnect();
  }, [cardsPerRow, page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    cardsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pageItems = FERTILIZERS.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <section className="sector-detail-page">
      <PageHeader
        fullWidth
        title="Bahan dan Produk Kimia"
        breadcrumbs={[
          { label: "Bahan dan Produk Kimia", href: "/kimia" },
        ]}
      />
      <div className="kimia-cards" ref={cardsRef}>
        <div ref={rowsRef} className="kimia-cards__inner">
          {Array.from(
            { length: Math.ceil(pageItems.length / cardsPerRow) },
            (_, rowIndex) => {
              const rowItems = pageItems.slice(
                rowIndex * cardsPerRow,
                rowIndex * cardsPerRow + cardsPerRow,
              );

              return (
                <div
                  className={`kimia-card-row${cardsPerRow === 3 && rowItems.length === 2 ? " kimia-card-row--centered" : ""}`}
                  key={rowIndex}
                >
                  {rowItems.map((item) => (
                    <article className="kimia-card" key={item.id}>
                      <LoadingImage
                        src={item.image}
                        alt={lang === "en" ? item.en : item.id}
                        className="kimia-card__img"
                      />
                      <div className="kimia-card__overlay"></div>
                      <div className="kimia-card__content">
                        <h3 className="kimia-card__title">
                          {lang === "en" ? item.en : item.id}
                        </h3>
                      </div>
                    </article>
                  ))}
                </div>
              );
            },
          )}
        </div>
        {totalPages > 1 && (
          <nav className="kimia-pagination" aria-label="Pagination">
            <button
              type="button"
              className="kimia-pagination__btn"
              disabled={page === 1}
              onClick={() => handlePageChange(page - 1)}
              aria-label="Previous page"
            >
              &lsaquo;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                type="button"
                key={p}
                className={`kimia-pagination__btn${p === page ? " kimia-pagination__btn--active" : ""}`}
                onClick={() => handlePageChange(p)}
                aria-current={p === page ? "page" : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="kimia-pagination__btn"
              disabled={page === totalPages}
              onClick={() => handlePageChange(page + 1)}
              aria-label="Next page"
            >
              &rsaquo;
            </button>
          </nav>
        )}
      </div>
      <Link className="sector-detail-page__back" to="/">
        {lang === "en" ? "Back to Home" : "Kembali ke Beranda"}
      </Link>
    </section>
  );
}
