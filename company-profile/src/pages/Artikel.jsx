import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import LoadingImage from "../components/LoadingImage";
import { useLanguage } from "../context/useLanguage";
import { translateArticleLabel } from "../context/translations";
import { FALLBACK_ARTICLES } from "../data/articlesFallback";
import "./Artikel.css";

function formatCardDate(dateStr, lang) {
  if (!dateStr) return "";
  const d = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString(lang === "en" ? "en-GB" : "id-ID", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function Artikel() {
  const { lang } = useLanguage();
  const [allArticles, setAllArticles] = useState(FALLBACK_ARTICLES);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedTag, setSelectedTag] = useState("All");
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    let active = true;
    async function loadArticles() {
      const endpoints = [
        "/api/artikel?limit=500",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const ct = res.headers.get("content-type") || "";
          if (!res.ok || !ct.includes("application/json")) continue;
          const json = await res.json();
          if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setAllArticles(json.data);
            return;
          }
        } catch {
          // Gunakan fallback jika server belum merespons
        }
      }
    }
    loadArticles();
    return () => {
      active = false;
    };
  }, []);

  const availableYears = useMemo(() => {
    const years = new Set();
    allArticles.forEach((item) => {
      if (item.published_at) years.add(String(item.published_at).slice(0, 4));
    });
    return Array.from(years).sort((a, b) => b.localeCompare(a));
  }, [allArticles]);

  const availableTags = useMemo(() => {
    const tags = new Set(["News", "Article", "Press Release"]);
    allArticles.forEach((item) => {
      if (item.category) tags.add(item.category);
      if (Array.isArray(item.tags)) {
        item.tags.forEach((t) => tags.add(t));
      }
    });
    return Array.from(tags);
  }, [allArticles]);

  const filteredArticles = useMemo(() => {
    return allArticles.filter((item) => {
      const itemYear = item.published_at ? String(item.published_at).slice(0, 4) : "";
      const matchYear = selectedYear === "All" || itemYear === selectedYear;
      const tagsList = Array.isArray(item.tags) ? item.tags : [];
      const matchTag =
        selectedTag === "All" ||
        (item.category && item.category.toLowerCase() === selectedTag.toLowerCase()) ||
        tagsList.some((t) => t.toLowerCase() === selectedTag.toLowerCase());
      return matchYear && matchTag;
    });
  }, [allArticles, selectedYear, selectedTag]);

  const totalItems = filteredArticles.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);

  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
    setPage(1);
  };

  return (
    <>
      <PageHeader
        title="Artikel"
        breadcrumbs={[{ label: "Artikel", href: "/artikel" }]}
      />

      <section className="news-page">
        <div className="news-page__container">
          {/* Baris Filter Tahun & Tag (Sesuai Gambar ke-2) */}
          <div className="news-filters">
            <div className="news-filter-group">
              <label htmlFor="filter-year" className="news-filter-label">
                {lang === "en" ? "Sort by Years" : "Urutkan Tahun"}
              </label>
              <div className="news-filter-select-wrap">
                <select
                  id="filter-year"
                  className="news-filter-select news-filter-select--year"
                  value={selectedYear}
                  onChange={handleYearChange}
                >
                  <option value="All">{lang === "en" ? "All" : "Semua"}</option>
                  {availableYears.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
                <span className="news-filter-chevron" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <div className="news-filter-group">
              <label htmlFor="filter-tag" className="news-filter-label">
                {lang === "en" ? "Filter by tag" : "Filter berdasarkan tag"}
              </label>
              <div className="news-filter-select-wrap">
                <select
                  id="filter-tag"
                  className="news-filter-select news-filter-select--tag"
                  value={selectedTag}
                  onChange={handleTagChange}
                >
                  <option value="All">{lang === "en" ? "All" : "Semua"}</option>
                  {availableTags.map((tg) => (
                    <option key={tg} value={tg}>
                      {translateArticleLabel(tg, lang)}
                    </option>
                  ))}
                </select>
                <span className="news-filter-chevron" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 9l6 6 6-6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Grid 9 Kartu Artikel (3x3) */}
          <div className="news-grid">
            {paginatedArticles.map((item) => {
              const title =
                lang === "en"
                  ? item.title_en || "English translation not available yet."
                  : item.title_id;
              const tags = Array.isArray(item.tags) ? item.tags : [];
              const extraTagCount = Math.max(0, tags.length - 1);

              return (
                <article className="news-card" key={item.slug}>
                  <Link
                    to={`/artikel/${item.slug}`}
                    className="news-card__img-link"
                  >
                    <LoadingImage
                      src={item.image_url}
                      alt={title}
                      className="news-card__img"
                      loading="lazy"
                    />
                  </Link>

                  <div className="news-card__meta">
                    <span className="news-card__pill">
                      {translateArticleLabel(item.category || "News", lang)}
                    </span>
                    {extraTagCount > 0 && (
                      <span className="news-card__pill">{extraTagCount}+</span>
                    )}
                    <span className="news-card__dot" aria-hidden="true">
                      &bull;
                    </span>
                    <time className="news-card__date" dateTime={item.published_at}>
                      {formatCardDate(item.published_at, lang)}
                    </time>
                  </div>

                  <h2 className="news-card__title">
                    <Link to={`/artikel/${item.slug}`}>{title}</Link>
                  </h2>

                  <Link to={`/artikel/${item.slug}`} className="news-card__more">
                    <span>{lang === "en" ? "Read more" : "Baca selengkapnya"}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </article>
              );
            })}
          </div>

          {/* Footer Show X of Y & Pagination */}
          <div className="news-footer">
            <div className="news-footer__count">
              {lang === "en"
                ? `Show ${paginatedArticles.length} of ${totalItems} Article`
                : `Menampilkan ${paginatedArticles.length} dari ${totalItems} Artikel`}
            </div>

            <nav className="news-pagination" aria-label="Pagination">
              <button
                type="button"
                className="news-pagination__btn"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                <span aria-hidden="true">&lsaquo;</span>
                <span>{lang === "en" ? "Previous" : "Sebelumnya"}</span>
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    className={`news-pagination__btn${
                      pageNum === currentPage ? " is-active" : ""
                    }`}
                    onClick={() => setPage(pageNum)}
                    aria-current={pageNum === currentPage ? "page" : undefined}
                  >
                    {pageNum}
                  </button>
                )
              )}

              <button
                type="button"
                className="news-pagination__btn"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                <span>{lang === "en" ? "Next" : "Selanjutnya"}</span>
                <span aria-hidden="true">&rsaquo;</span>
              </button>
            </nav>
          </div>
        </div>
      </section>
    </>
  );
}
