import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import LoadingImage from "../components/LoadingImage";
import { useLanguage } from "../context/useLanguage";
import { translateArticleLabel } from "../context/translations";
import { FALLBACK_ARTICLES } from "../data/articlesFallback";
import "./Home.css";

const BANNERS = [
  "/Logo_PSU_banner1.webp",
  "/Logo_PSU_banner2.webp",
  "/Logo_PSU_banner3.webp",
  "/Logo_PSU_banner4.webp",
  "/Logo_PSU_banner5.webp",
  "/Logo_PSU_banner6.webp",
];

const SECTORS = [
  {
    file: "1.pertanian.webp",
    id: "Pertanian dan Perkebunan",
    en: "Agriculture and Plantation",
    descId: "Pengujian dan sertifikasi komoditas hasil bumi untuk memastikan kualitas, keamanan, dan pemenuhan standar regulasi.",
    descEn: "Testing and certification of agricultural commodities to ensure quality, safety, and regulatory compliance.",
    link: "/pertanian",
  },
  {
    file: "2.tanaman.webp",
    id: "Produk Tanaman",
    en: "Plant Products and Derivatives",
    descId: "Layanan penilaian kesesuaian untuk berbagai produk olahan nabati dan turunannya guna menjaga standar mutu.",
    descEn: "Conformity assessment services for various plant-based processed products and derivatives to maintain quality standards.",
    link: "/tanaman",
  },
  {
    file: "3.pangan.webp",
    id: "Produk Pangan",
    en: "Other Food Products",
    descId: "Analisis mutu fisik, kimia, dan cemaran pada produk makanan dan minuman untuk menjamin keamanan pangan.",
    descEn: "Physical, chemical, and contamination quality analysis of food and beverage products to guarantee food safety.",
    link: "/pangan",
  },
  {
    file: "4.kimia.webp",
    id: "Bahan dan Produk Kimia",
    en: "Chemical Materials and Products",
    descId: "Pengujian parameter dan komposisi kimia pada bahan baku industri maupun produk akhir sesuai standar yang berlaku.",
    descEn: "Testing of parameters and chemical composition in industrial raw materials and final products according to applicable standards.",
    link: "/kimia",
  },
  {
    file: "Stainless.webp",
    id: "Logam dan Produk Logam",
    en: "Metal and Metal Products",
    descId: "PT Penilai Standar Uji (PSU) menyediakan layanan pengujian dan sertifikasi produk logam untuk memastikan kualitas, keamanan, ketahanan, serta kesesuaiannya terhadap persyaratan Standar Nasional Indonesia (SNI).",
    descEn: "PT Penilai Standar Uji (PSU) provides testing and certification services for metal products to ensure quality, safety, durability, and compliance with the requirements of the Indonesian National Standard (SNI).",
    link: "/logam",
  },
  {
    file: "Jasa_Lainnya.webp", 
    id: "Jasa Lainnya",
    en: "Other Services",
    descId: "Layanan sertifikasi berbagai sektor jasa untuk meningkatkan kualitas pelayanan, kepercayaan masyarakat, dan daya saing usaha melalui penerapan standar nasional serta pengembangan ruang lingkup sertifikasi secara berkelanjutan.",
    descEn: "Certification services across various service sectors to improve service quality, public trust, and business competitiveness through the implementation of national standards and the continuous development of certification scopes.",
    link: "/jasa-lainnya",
  },
];

const MAIN_SERVICES = [
  {
    id: "Lembaga Sertifikasi Produk (LSPro)",
    en: "Product Certification Body (LSPro)",
    descId: "Penilaian kesesuaian dan sertifikasi produk berdasarkan standar serta skema sertifikasi yang berlaku.",
    descEn: "Conformity assessment and product certification based on applicable standards and certification schemes.",
    file: "LSPro.webp",
  },
  {
    id: "Laboratorium Pengujian",
    en: "Testing Laboratory",
    descId: "Pelaksanaan pengujian untuk mendukung evaluasi karakteristik, mutu, keamanan, dan kesesuaian produk terhadap persyaratan teknis.",
    descEn: "Conducting tests to support the evaluation of characteristics, quality, safety, and product conformity to technical requirements.",
    file: "lab_pengujian.webp",
  },
  {
    id: "Laboratorium Kalibrasi",
    en: "Calibration Laboratory",
    descId: "Layanan kalibrasi peralatan ukur untuk mendukung akurasi pengukuran dan ketertelusuran metrologi.",
    descEn: "Calibration services for measuring instruments to support measurement accuracy and metrological traceability.",
    file: "lab_kalibrasi.webp",
  },
  {
    id: "Lembaga Pelatihan",
    en: "Training Institution",
    descId: "Pelatihan teknis, sistem manajemen, standar, audit, dan peningkatan kompetensi personel sesuai kebutuhan organisasi.",
    descEn: "Technical training, management systems, standards, audits, and personnel competency enhancement according to organizational needs.",
    file: "_pelatihan.webp",
  },
  {
    id: "Sistem Manajemen Mutu",
    en: "Quality Management System",
    descId: "Layanan pelatihan dan pendampingan penerapan, evaluasi, serta peningkatan sistem manajemen mutu organisasi.",
    descEn: "Training services and assistance in the implementation, evaluation, and improvement of organizational quality management systems.",
    file: "sistem_manajemen_mutu.webp",
  },
];

export default function Home() {
  const [current, setCurrent] = useState(0);
  const [latestNews, setLatestNews] = useState(() => FALLBACK_ARTICLES.slice(0, 6));
  const { lang } = useLanguage();
  const marqueeRef = useRef(null);
  const groupRef = useRef(null);
  const marqueeCtl = useRef({ hover: false, drag: false, startX: 0, startScroll: 0, pauseUntil: 0 });

  useEffect(() => {
    let active = true;
    async function fetchLatestNews() {
      const endpoints = [
        "/api/artikel?limit=6",
      ];
      for (const url of endpoints) {
        try {
          const res = await fetch(url);
          const ct = res.headers.get("content-type") || "";
          if (!res.ok || !ct.includes("application/json")) continue;
          const json = await res.json();
          if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setLatestNews(json.data.slice(0, 6));
            return;
          }
        } catch {
          // Gunakan data fallback jika server belum merespons
        }
      }
    }
    fetchLatestNews();
    return () => {
      active = false;
    };
  }, []);

  // Auto-scroll "Layanan Utama Kami" (desktop saja): berhenti saat cursor di atasnya, bisa digeser manual
  useEffect(() => {
    const el = marqueeRef.current;
    const group = groupRef.current;
    if (!el || !group) return undefined;

    const mq = window.matchMedia("(min-width: 861px)");
    const ctl = marqueeCtl.current;
    let raf = 0;
    let last = 0;
    let pos = 0;
    let started = false;
    const startTimer = setTimeout(() => {
      started = true;
    }, 2800);

    const step = (ts) => {
      const dt = last ? ts - last : 0;
      last = ts;
      const loop = group.offsetWidth;
      const paused = ctl.hover || ctl.drag || ts < ctl.pauseUntil;

      if (!mq.matches || !started || paused || !loop) {
        pos = el.scrollLeft;
      } else {
        pos += ((loop / 40) * dt) / 1000; // 40 detik per putaran
        if (pos >= loop) pos -= loop;
        el.scrollLeft = pos;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    return () => {
      clearTimeout(startTimer);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleMarqueeScroll = () => {
    const el = marqueeRef.current;
    const group = groupRef.current;
    if (!el || !group || !window.matchMedia("(min-width: 861px)").matches) return;
    const loop = group.offsetWidth;
    if (loop && el.scrollLeft >= loop) {
      el.scrollLeft -= loop;
      marqueeCtl.current.startScroll -= loop;
    }
  };

  const handleMarqueePointerDown = (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    const ctl = marqueeCtl.current;
    ctl.drag = true;
    ctl.startX = e.clientX;
    ctl.startScroll = marqueeRef.current.scrollLeft;
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add("is-dragging");
  };

  const handleMarqueePointerMove = (e) => {
    const ctl = marqueeCtl.current;
    if (!ctl.drag) return;
    marqueeRef.current.scrollLeft = ctl.startScroll - (e.clientX - ctl.startX);
  };

  const endMarqueeDrag = (e) => {
    const ctl = marqueeCtl.current;
    if (!ctl.drag) return;
    ctl.drag = false;
    e.currentTarget.classList.remove("is-dragging");
  };

  const pauseMarqueeBriefly = () => {
    marqueeCtl.current.pauseUntil = performance.now() + 2000;
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((c) => (c + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <main className="home">
      <div className="home__hero">
        {BANNERS.map((banner, i) => (
          <img
            key={banner}
            className={`home__banner${i === current ? " home__banner--active" : ""}${
              i === 0 ? " home__banner--office" : ""
            }`}
            src={banner}
            alt={`PT PENILAI STANDAR UJI ${i + 1}`}
          />
        ))}
        
        <div className="home__hero-text">
          <span className="home__hero-subtitle">PT. PENILAI STANDAR UJI</span>
          <p className="home__hero-desc">
            {lang === "en"
              ? "Your trusted partner in conformity assessment, laboratory testing, and product certification. We empower industries to meet global standards with integrity and excellence."
              : "Mitra tepercaya Anda dalam penilaian kesesuaian, pengujian laboratorium, dan sertifikasi produk. Kami mendukung industri untuk mencapai standar kualitas global dengan keunggulan dan integritas."}
          </p>
        </div>
      </div>

      <section className="about">
        <div className="about__body">
          <p className="reveal reveal-fade" style={{ transitionDelay: "0.1s" }}>
            <strong>PT PENILAI STANDAR UJI (PSU)</strong>{" "}
            {lang === "en"
              ? "is a company operating in the conformity assessment ecosystem and providing quality support services. We offer a range of services to help industries ensure their products, processes, and services meet applicable standards and requirements."
              : "merupakan perusahaan yang bergerak dalam ekosistem penilaian kesesuaian dan layanan pendukung mutu. Kami menyediakan berbagai layanan yang mendukung kebutuhan industri dalam memastikan produk, proses, dan layanan memenuhi standar serta persyaratan yang berlaku."}
          </p>
          <p className="reveal reveal-fade" style={{ transitionDelay: "0.3s" }}>
            {lang === "en"
              ? "Supported by professional, competent, and experienced personnel, PSU continues to develop its services in product certification, laboratory testing, calibration, training, and laboratory and compliance consulting."
              : "Didukung oleh tenaga profesional, kompeten, dan berpengalaman, PSU terus mengembangkan layanan melalui sertifikasi produk, pengujian laboratorium, kalibrasi, pelatihan, serta konsultasi laboratorium dan kepatuhan."}
          </p>
          <p className="reveal reveal-fade" style={{ transitionDelay: "0.5s" }}>
            {lang === "en"
              ? "We are committed to delivering services with integrity, competence, independence, collaboration, and sustainability, helping industries, communities, and stakeholders improve the quality and trustworthiness of products and services."
              : "Kami berkomitmen memberikan layanan yang integritas, kompeten, independen, kolaboratif, dan berkelanjutan untuk membantu industri, masyarakat, dan para pemangku kepentingan meningkatkan kualitas dan kepercayaan terhadap produk maupun layanan."}
          </p>
        </div>

        <blockquote className="about__quote reveal reveal-fade" style={{ transitionDelay: "0.7s" }}>
          {lang === "en"
            ? "“Conformity Assessment Solutions for a More Advanced Industry.”"
            : "“Solusi Penilaian Kesesuaian untuk Industri yang Lebih Maju.”"}
        </blockquote>
      </section>

      <section className="main-services reveal" aria-labelledby="main-services-title">
        <div className="main-services__bg"></div>

        <div className="main-services__header"> 
          <h2 id="main-services-title" className="sectors__heading main-services__heading">
            {lang === "en" ? "OUR MAIN SERVICES" : "LAYANAN UTAMA KAMI"}
          </h2>
        </div>

        <div
          className="main-services__marquee"
          ref={marqueeRef}
          onScroll={handleMarqueeScroll}
          onMouseEnter={() => { marqueeCtl.current.hover = true; }}
          onMouseLeave={() => { marqueeCtl.current.hover = false; }}
          onPointerDown={handleMarqueePointerDown}
          onPointerMove={handleMarqueePointerMove}
          onPointerUp={endMarqueeDrag}
          onPointerCancel={endMarqueeDrag}
          onWheel={pauseMarqueeBriefly}
          onTouchStart={pauseMarqueeBriefly}
          onTouchMove={pauseMarqueeBriefly}
        >
          <div className="main-services__track">
            <div className="main-services__group" ref={groupRef}>
              {MAIN_SERVICES.map((service, index) => (
                <div 
                  className="main-services__card" 
                  key={`original-${index}`} 
                  style={{ backgroundImage: `url(/${service.file})` }}
                >
                  <div className="main-services__card-content">
                    <h4>{lang === "en" ? service.en : service.id}</h4>
                    <p>{lang === "en" ? service.descEn : service.descId}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="main-services__group main-services__group--duplicate" aria-hidden="true">
              {MAIN_SERVICES.map((service, index) => (
                <div 
                  className="main-services__card" 
                  key={`dup-${index}`} 
                  style={{ backgroundImage: `url(/${service.file})` }}
                >
                  <div className="main-services__card-content">
                    <h4>{lang === "en" ? service.en : service.id}</h4>
                    <p>{lang === "en" ? service.descEn : service.descId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="sectors" aria-labelledby="sectors-title">
        <h2 id="sectors-title" className="sectors__heading reveal reveal-fade" style={{ transitionDelay: "0.1s" }}>
          {lang === "en" ? "Products Certified" : "PRODUK YANG DISERTIFIKASI"}
        </h2>

        <div className="sectors__container">
          {Array.from(
            { length: Math.ceil(SECTORS.length / 3) },
            (_, rowIndex) => {
              const rowSectors = SECTORS.slice(
                rowIndex * 3,
                rowIndex * 3 + 3
              );

              return (
                <div className="sectors__row" key={rowIndex}>
                  {rowSectors.map((sector) => {
                    const label = lang === "en" ? sector.en : sector.id;
                    const desc = lang === "en" ? sector.descEn : sector.descId;

                    return (
                      <div
                        className="expanding-card reveal"
                        key={sector.file}
                        style={{ backgroundImage: `url(/${sector.file})` }}
                        tabIndex="0"
                      >
                        <div className="expanding-card__content">
                          <h3 className="expanding-card__title">{label}</h3>

                          <span className="expanding-card__more">
                            {lang === "en" ? "Learn more \u2192" : "Selengkapnya \u2192"}
                          </span>

                          <p className="expanding-card__desc">{desc}</p>

                          <Link to={sector.link} className="expanding-card__btn">
                            {lang === "en" ? "See Details" : "Lihat Detail"}
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            }
          )}
        </div>
      </section>

      <section className="home-news reveal" aria-labelledby="home-news-title">
        <div className="home-news__container">
          <div className="home-news__header">
            <div className="home-news__header-left">
              <div className="home-news__eyebrow">
                <span className="home-news__eyebrow-line" aria-hidden="true" />
                <span>{lang === "en" ? "NEWS & ARTICLES" : "BERITA & ARTIKEL"}</span>
              </div>
              <h2 id="home-news-title" className="home-news__title">
                {lang === "en"
                  ? "Latest News & Articles Updates"
                  : "Update Berita & Artikel Terbaru"}
              </h2>
            </div>
          </div>

          <div className="home-news__grid">
            {latestNews.map((item) => {
              const title =
                lang === "en"
                  ? item.title_en || ("English translation not available yet.")
                  : item.title_id;
              const excerpt =
                lang === "en"
                  ? item.excerpt_en || ("English summary not available yet.")
                  : item.excerpt_id;
              const tags = Array.isArray(item.tags) ? item.tags : [];
              const extraTags = Math.max(0, tags.length - 1);

              return (
                <article className="home-news__card" key={item.slug}>
                  <Link
                    to={`/artikel/${item.slug}`}
                    className="home-news__img-link"
                  >
                    <LoadingImage
                      src={item.image_url}
                      alt={title}
                      className="home-news__img"
                      loading="lazy"
                    />
                  </Link>

                  <div className="home-news__badges">
                    <span className="home-news__badge">
                      {translateArticleLabel(item.category || "Article", lang)}
                    </span>
                    {extraTags > 0 && (
                      <span className="home-news__badge">{extraTags}+</span>
                    )}
                  </div>

                  <h3 className="home-news__card-title">
                    <Link to={`/artikel/${item.slug}`}>{title}</Link>
                  </h3>

                  <p className="home-news__card-excerpt">{excerpt}</p>

                  <Link
                    to={`/artikel/${item.slug}`}
                    className="home-news__learn-more"
                  >
                    <span>{lang === "en" ? "Learn more" : "Selengkapnya"}</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="tracking-banner reveal">
        <div className="tracking-banner__bg-left"></div>
        <div className="tracking-banner__bg-right"></div>
        
        <div className="tracking-banner__content">
          <h3>
            {lang === "en"
              ? "Want to Track Your Service Application Status?"
              : "Ingin Lacak Status Pengajuan Layanan Anda?"}
          </h3>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="tracking-banner__btn"
          >
            {("Klik Disini!")}
          </a>
        </div>
      </section>

    </main>
  );
}