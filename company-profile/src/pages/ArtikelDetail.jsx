import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../context/useLanguage";
import { translateArticleLabel } from "../context/translations";
import { FALLBACK_ARTICLES } from "../data/articlesFallback";
import "./Artikel.css";

function formatDetailDate(dateStr, lang) {
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

function renderParagraphWithLead(paragraph, idx) {
  const dashIndex = paragraph.indexOf(" — ");
  if (idx === 0 && dashIndex > 0 && dashIndex < 35) {
    const cityLead = paragraph.slice(0, dashIndex + 3);
    const restText = paragraph.slice(dashIndex + 3);
    return (
      <p key={idx}>
        <strong>{cityLead}</strong>
        {restText}
      </p>
    );
  }
  return <p key={idx}>{paragraph}</p>;
}

export default function ArtikelDetail() {
  const { slug } = useParams();
  const { lang, t } = useLanguage();
  const [fetchedArticle, setFetchedArticle] = useState(null);
  const localMatch = FALLBACK_ARTICLES.find((a) => a.slug === slug) || null;
  const article =
    fetchedArticle?.slug === slug ? fetchedArticle.data : localMatch;

  useEffect(() => {
    let active = true;

    async function fetchDetail() {
      const endpoints = [
        `/api/artikel/${encodeURIComponent(slug)}`,
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const ct = res.headers.get("content-type") || "";
          if (!res.ok || !ct.includes("application/json")) continue;
          const json = await res.json();
          if (active && json.success && json.data) {
            setFetchedArticle({ slug, data: json.data });
            return;
          }
        } catch {
          // Gunakan fallback jika server belum merespons
        }
      }
    }
    fetchDetail();
    return () => {
      active = false;
    };
  }, [slug]);

  if (!article) {
    return (
      <>
        <PageHeader
          title="Artikel"
          breadcrumbs={[{ label: "Artikel", href: "/artikel" }]}
        />
        <section className="news-detail">
          <div className="news-detail__container">
            <Link to="/artikel" className="news-detail__back">
              <span>&larr;</span>
              <span>{lang === "en" ? "Back to News" : "Kembali ke Artikel"}</span>
            </Link>
            <h1 className="news-detail__title">
              {lang === "en" ? "Article Not Found" : "Artikel Tidak Ditemukan"}
            </h1>
          </div>
        </section>
      </>
    );
  }

  const title =
    lang === "en"
      ? article.title_en || t("English translation not available yet.")
      : article.title_id;
  const content =
    lang === "en"
      ? article.content_en || t("This article is not available in English yet.")
      : article.content_id;
  const paragraphs = String(content || "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const authorName = article.author || "Corporate Secretary PSU";

  return (
    <>
      <PageHeader
        title="Artikel"
        breadcrumbs={[
          { label: "Artikel", href: "/artikel" },
          { label: title },
        ]}
      />

      <article className="news-detail">
        <div className="news-detail__container">
          <Link to="/artikel" className="news-detail__back">
            <span aria-hidden="true">&larr;</span>
            <span>{lang === "en" ? "Back to News" : "Kembali ke Artikel"}</span>
          </Link>

          {/* Gambar Utama dengan Ukuran & Rasio Seragam (16:9), Tanpa Sumber Gambar */}
          <div className="news-detail__hero-wrap">
            <img
              src={article.image_url}
              alt={title}
              className="news-detail__hero-img"
            />
          </div>

          <h1 className="news-detail__title">{title}</h1>

          <div className="news-detail__tags">
            {tags.map((tg, i) => (
              <span key={`${tg}-${i}`} className="news-detail__tag-pill">
                {translateArticleLabel(tg, lang)}
              </span>
            ))}
          </div>

          {/* Baris Tanggal Publikasi & Author (Tanpa Tombol Share) */}
          <div className="news-detail__meta-bar">
            <div className="news-detail__created">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>
                {lang === "en" ? "Created at " : "Dibuat pada "}
                {formatDetailDate(article.published_at, lang)}
              </span>
            </div>

            <div className="news-detail__author">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" />
                <path d="M4 20c1.8-3.6 5-5.5 8-5.5s6.2 1.9 8 5.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span>
                {lang === "en" ? "Author: " : "Penulis: "}
                <strong>{authorName}</strong>
              </span>
            </div>
          </div>

          <div className="news-detail__body">
            {paragraphs.map((p, idx) => renderParagraphWithLead(p, idx))}
          </div>

          <div className="news-detail__about">
            <h2>{lang === "en" ? "About Us" : "Tentang Kami"}</h2>
            {lang === "en" ? (
              <>
                <p>
                  PT Penilai Standar Uji (PSU) is an independent conformity
                  assessment body (LPK) playing a strategic role in ensuring
                  quality, compliance, safety, and sustainability of national
                  industrial activities through Testing, Certification,
                  Calibration, Training, and Consulting services.
                </p>
                <p>
                  Supported by KAN-accredited laboratories (LP-1554-IDN) and
                  Product Certification Body (LSPr-051-IDN), as well as
                  competent professional personnel, PT Penilai Standar Uji
                  serves key industrial sectors including agriculture,
                  plantations, food and beverages, chemical materials and
                  fertilizers, metal products, and public markets.
                </p>
              </>
            ) : (
              <>
                <p>
                  PT Penilai Standar Uji (PSU) merupakan Lembaga Penilaian
                  Kesesuaian (LPK) independen yang berperan strategis dalam
                  memastikan mutu, kepatuhan standar, keselamatan, dan
                  keberlanjutan aktivitas industri nasional melalui layanan
                  Pengujian (Testing), Sertifikasi (Certification), Kalibrasi
                  (Calibration), Pelatihan (Training), dan Konsultasi
                  (Consulting).
                </p>
                <p>
                  Didukung oleh Laboratorium Pengujian terakreditasi KAN
                  (LP-1554-IDN), Lembaga Sertifikasi Produk (LSPr-051-IDN),
                  Lembaga Sertifikasi Sistem Manajemen (LSSM), serta sumber daya
                  manusia profesional yang kompeten, PT Penilai Standar Uji
                  melayani berbagai sektor prioritas nasional demi memperkuat
                  kepercayaan pasar dan daya saing industri di Indonesia.
                </p>
              </>
            )}

            <div className="news-detail__contact">
              <strong>PT PENILAI STANDAR UJI</strong>
              <div>{lang === "en" ? "Conformity Assessment Body (CAB)" : "Lembaga Penilaian Kesesuaian (LPK)"}</div>
              <div>
                {lang === "en"
                  ? "Jalan Cipinang Muara 1 No. 21 RT.006 / RW.03, Pondok Bambu Urban Village, Duren Sawit District, East Jakarta - 13430"
                  : "Jalan Cipinang Muara 1 No. 21 RT.006 / RW.03, Kel. Pondok Bambu, Kec. Duren Sawit, Jakarta Timur - 13430"}
              </div>
              <div>
                {lang === "en" ? "Email:" : "Email :"}{" "}
                <a href="mailto:psuindonesia.info@gmail.com">
                  psuindonesia.info@gmail.com
                </a>
              </div>
              <div>{lang === "en" ? "Phone:" : "Telp :"} 021 - 8602367</div>
              <div>{lang === "en" ? "WhatsApp:" : "WhatsApp :"} +62 819-0834-4114</div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
