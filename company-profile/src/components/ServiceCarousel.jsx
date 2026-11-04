import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { getImageMetadata } from "../data/imageMetadata";
import "./ServiceCarousel.css";

export const MAIN_SERVICES = [
  {
    id: "Lembaga Sertifikasi Produk (LSPro)",
    en: "Product Certification Body (LSPro)",
    descId:
      "Penilaian kesesuaian dan sertifikasi produk berdasarkan standar serta skema sertifikasi yang berlaku.",
    descEn:
      "Conformity assessment and product certification based on applicable standards and certification schemes.",
    file: "LSPro.webp",
    link: "/lspro",
  },
  {
    id: "Laboratorium Pengujian",
    en: "Testing Laboratory",
    descId:
      "Pelaksanaan pengujian untuk mendukung evaluasi karakteristik, mutu, keamanan, dan kesesuaian produk terhadap persyaratan teknis.",
    descEn:
      "Conducting tests to support the evaluation of characteristics, quality, safety, and product conformity to technical requirements.",
    file: "lab_pengujian.webp",
    link: "/layanan/penguji",
  },
  {
    id: "Laboratorium Kalibrasi",
    en: "Calibration Laboratory",
    descId:
      "Layanan kalibrasi peralatan ukur untuk mendukung akurasi pengukuran dan ketertelusuran metrologi.",
    descEn:
      "Calibration services for measuring instruments to support measurement accuracy and metrological traceability.",
    file: "lab_kalibrasi.webp",
    link: "/layanan/kalibrasi",
  },
  {
    id: "Lembaga Pelatihan",
    en: "Training Institution",
    descId:
      "Pelatihan teknis, sistem manajemen, standar, audit, dan peningkatan kompetensi personel sesuai kebutuhan organisasi.",
    descEn:
      "Technical training, management systems, standards, audits, and personnel competency enhancement according to organizational needs.",
    file: "_pelatihan.webp",
    link: "/layanan/pelatihan",
  },
  {
    id: "Sistem Manajemen Mutu",
    en: "Quality Management System",
    descId:
      "Layanan pelatihan dan pendampingan penerapan, evaluasi, serta peningkatan sistem manajemen mutu organisasi.",
    descEn:
      "Training services and assistance in the implementation, evaluation, and improvement of organizational quality management systems.",
    file: "sistem_manajemen_mutu.webp",
    link: "/layanan/sertif-manajemen",
  },
];

export default function ServiceCarousel() {
  const { lang } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCards, setVisibleCards] = useState(4);
  const containerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);

  // Responsiveness: Desktop (4 kartu), Tablet (2 kartu), Mobile (1 kartu)
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setVisibleCards(4);
      } else if (width >= 641) {
        setVisibleCards(2);
      } else {
        setVisibleCards(1);
      }
    };

    updateVisibleCards();
    window.addEventListener("resize", updateVisibleCards, { passive: true });
    return () => window.removeEventListener("resize", updateVisibleCards);
  }, []);

  const maxIndex = Math.max(0, MAIN_SERVICES.length - visibleCards);

  // Normalisasi index saat ukuran layar berubah
  useEffect(() => {
    setCurrentIndex((prev) => Math.min(prev, maxIndex));
  }, [maxIndex]);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Autoplay (5 detik), pause saat hover / fokus / tab tidak aktif / prefers-reduced-motion
  useEffect(() => {
    if (isPaused || maxIndex === 0) return undefined;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return undefined;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isPaused, maxIndex, nextSlide]);

  // Touch Swipe Handlers (tidak mengganggu scroll vertikal)
  const handleTouchStart = (e) => {
    if (!e.touches || e.touches.length === 0) return;
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e) => {
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartRef.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartRef.current.y;
    const deltaTime = Date.now() - touchStartRef.current.time;

    // Hanya picu swipe jika gerakan dominan horizontal dan cukup cepat/jauh
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40 && deltaTime < 600) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Mouse Drag Handlers
  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    const deltaX = e.clientX - dragStartXRef.current;
    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      nextSlide();
    }
  };

  // Hitung persentase offset translasi
  const cardWidthPercent = 100 / visibleCards;
  const translateOffset = currentIndex * cardWidthPercent;

  return (
    <section
      className="main-services reveal"
      aria-labelledby="main-services-title"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      tabIndex="0"
      onKeyDown={handleKeyDown}
      role="region"
      aria-roledescription="carousel"
      aria-label={lang === "en" ? "Our Main Services Carousel" : "Karusel Layanan Utama Kami"}
    >
      <div className="main-services__bg" aria-hidden="true"></div>

      <div className="main-services__header">
        <div className="main-services__header-inner">
          <h2 id="main-services-title" className="sectors__heading main-services__heading">
            {lang === "en" ? "OUR MAIN SERVICES" : "LAYANAN UTAMA KAMI"}
          </h2>
          <div className="main-services__gold-accent" aria-hidden="true"></div>
        </div>

        {/* Tombol Navigasi Panah (Kiri & Kanan) */}
        <div className="main-services__controls" aria-label="Navigasi Karusel Layanan">
          <button
            type="button"
            className="main-services__nav-btn main-services__nav-btn--prev"
            onClick={prevSlide}
            aria-label={lang === "en" ? "Previous service slide" : "Slide layanan sebelumnya"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className="main-services__nav-btn main-services__nav-btn--next"
            onClick={nextSlide}
            aria-label={lang === "en" ? "Next service slide" : "Slide layanan berikutnya"}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      {/* Container Carousel */}
      <div
        className="main-services__carousel-wrapper"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <div
          className="main-services__carousel-track"
          style={{
            transform: `translateX(-${translateOffset}%)`,
          }}
        >
          {MAIN_SERVICES.map((service, index) => {
            const title = lang === "en" ? service.en : service.id;
            const desc = lang === "en" ? service.descEn : service.descId;
            const imgMeta = getImageMetadata(service.file, lang);

            return (
              <div
                className="main-services__slide-item"
                key={service.file}
                style={{ flex: `0 0 ${cardWidthPercent}%` }}
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} dari ${MAIN_SERVICES.length}: ${title}`}
              >
                <Link
                  to={service.link}
                  className="main-services__card-link"
                  aria-label={`${title} - ${lang === "en" ? "See details" : "Lihat informasi layanan"}`}
                >
                  <div className="main-services__card-media">
                    <img
                      src={`/${service.file}`}
                      alt={imgMeta?.alt || title}
                      className="main-services__card-img"
                      loading="lazy"
                    />
                    <div className="main-services__card-overlay" aria-hidden="true"></div>
                  </div>
                  <div className="main-services__card-content">
                    <h3 className="main-services__card-title">{title}</h3>
                    <p className="main-services__card-desc">{desc}</p>
                    <span className="main-services__card-cta">
                      {lang === "en" ? "Learn more \u2192" : "Pelajari Lebih Lanjut \u2192"}
                    </span>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Indikator Titik (Dots) */}
      {maxIndex > 0 && (
        <div
          className="main-services__dots"
          role="tablist"
          aria-label={lang === "en" ? "Service slide indicators" : "Indikator slide layanan"}
        >
          {Array.from({ length: maxIndex + 1 }).map((_, dotIdx) => (
            <button
              key={dotIdx}
              type="button"
              role="tab"
              aria-selected={dotIdx === currentIndex}
              className={`main-services__dot ${
                dotIdx === currentIndex ? "main-services__dot--active" : ""
              }`}
              onClick={() => setCurrentIndex(dotIdx)}
              aria-label={
                lang === "en"
                  ? `Go to service slide ${dotIdx + 1}`
                  : `Menuju slide layanan ${dotIdx + 1}`
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

