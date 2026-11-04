import PageHeader from "../../components/PageHeader";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../context/useLanguage";
import LoadingImage from "../../components/LoadingImage";
import "./JasaLainnya.css";

export default function JasaLainnya() {
  const { lang } = useLanguage();
  const cardRef = useRef(null);
  const title = lang === "en" ? "Other Services" : "Jasa Lainnya";

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;

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

    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="sector-detail-page">
      <PageHeader
        fullWidth
        title={title}
        breadcrumbs={[
          { label: title, href: "/jasa-lainnya" },
        ]}
      />
      <div className="jasa-cards">
        <article className="jasa-card" ref={cardRef}>
          <LoadingImage
            src="/Banner_Jasa.webp"
            alt="Pasar Rakyat"
            className="jasa-card__img"
          />

          <div className="jasa-card__overlay"></div>

          <div className="jasa-card__content">
            <h3 className="jasa-card__title">
              {lang === "en" ? "People's Market" : "Pasar Rakyat"}
            </h3>
            <p className="jasa-card__desc">
              {lang === "en" ? (
                <>
                  PT Penilai Standar Uji (PSU) provides people's market
                  certification services, assessing{" "}
                  <strong>
                    general requirements, facilities and infrastructure,
                    cleanliness, safety, comfort, and market management systems
                  </strong>{" "}
                  in accordance with SNI.
                  <br />
                  This certification supports orderly, safe, clean, comfortable,
                  and competitive people's markets.
                </>
              ) : (
                <>
                  PT Penilai Standar Uji (PSU) menyediakan layanan sertifikasi
                  Pasar Rakyat dengan penilaian terhadap{" "}
                  <strong>
                    persyaratan umum, fasilitas dan infrastruktur, kebersihan,
                    keamanan, kenyamanan, serta sistem pengelolaan pasar
                  </strong>{" "}
                  sesuai SNI.
                  <br />
                  Sertifikasi ini mendukung terwujudnya pasar rakyat yang{" "}
                  <strong>
                    tertib, aman, bersih, nyaman, dan berdaya saing.
                  </strong>
                </>
              )}
            </p>
          </div>
        </article>
      </div>

      <Link className="sector-detail-page__back" to="/">
        {lang === "en" ? "Back to Home" : "Kembali ke Beranda"}
      </Link>
    </section>
  );
}
