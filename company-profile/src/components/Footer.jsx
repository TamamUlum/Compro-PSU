import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import "./footer.css";

const kontak = {
  alamat: "Jalan Cipinang Muara 1 No. 21 RT.006 / RW.03, Kel. Pondok Bambu, Kec. Duren Sawit, Jakarta Timur - 13430",
  email: "psuindonesia.info@gmail.com",
  telepon: "021 - 8602367",
  whatsapp: "+6281908344114",
};

const LEBAR_HALAMAN = 1474;
const LEBAR_ISI = 1474;

const BATAS_MOBILE = 860;

function useIsMobile(breakpoint) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

const titleStyle = {
  margin: "0 0 14px",
  fontSize: 15,
  fontWeight: 600,
  color: "#14233b",
};

const addressStyle = {
  fontStyle: "normal",
  color: "#14233b",
};

function ContactIcon({ type }) {
  const paths = {
    email: (
      <path
        d="M3 5.5h18v13H3zM3.5 6l8.5 6.5L20.5 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    phone: (
      <path
        d="M7.2 3.5h3l1.5 4-2 1.7a15.2 15.2 0 0 0 5.1 5.1l1.7-2 4 1.5v3c0 1-.8 1.8-1.8 1.8C10.2 18.6 5.4 13.8 5.4 7.3c0-1 .8-1.8 1.8-1.8Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
    whatsapp: (
      <path
        d="M20.4 3.6A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.5 4.1 1.6 5.9L.1 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.1-3.6-8.3ZM12.1 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.7-.3-.4a9.9 9.9 0 0 1-1.5-5.2c0-5.5 4.4-9.9 9.9-9.9 2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.5-4.4 9.9-9.9 9.9Zm5.4-7.4c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.2-.1.3-.3.5-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.2-.7-1.6-.9-2.2-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.2.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4-.1-.2-.3-.3-.6-.5Z"
        fill="currentColor"
      />
    ),
  };

  return (
    <svg
      className="footer__contact-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {paths[type]}
    </svg>
  );
}

export default function Footer() {
  const { lang, t } = useLanguage();
  const isMobile = useIsMobile(BATAS_MOBILE);

  const wrapperStyle = {
    boxSizing: "border-box",
    width: `min(${LEBAR_HALAMAN}px, calc(100% - 2 * clamp(20px, 4vw, 56px)))`,
    margin: "0 auto",
    padding: isMobile ? "28px 0 20px" : "56px 0 24px",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
    alignItems: "start",
    gap: isMobile ? "14px" : "0 48px",
    maxWidth: LEBAR_ISI,
  };

  const responsiveTitleStyle = isMobile
    ? { ...titleStyle, marginBottom: 2, fontSize: 15 }
    : titleStyle;

  const brandStyle = isMobile
    ? { justifySelf: "start", textAlign: "left" }
    : { display: "contents" };

  const logoLinkStyle = isMobile
    ? undefined
    : { gridColumn: 1, gridRow: 1, justifySelf: "start" };

  const brandTextStyle = isMobile
    ? undefined
    : { gridColumn: 1, gridRow: 2, alignSelf: "baseline", textAlign: "left" };

  const alamatStyle = isMobile
    ? { justifySelf: "start", textAlign: "left" }
    : {
        gridColumn: 2,
        gridRow: 2,
        alignSelf: "baseline",
        justifySelf: "center",
      textAlign: "left",
        maxWidth: 340,
        paddingTop: 0,
      };

  const kontakStyle = isMobile
    ? { justifySelf: "start", textAlign: "left" }
    : {
        gridColumn: 3,
        gridRow: 2,
        alignSelf: "baseline",
        justifySelf: "end",
      textAlign: "left",
        maxWidth: 340,
        paddingTop: 0,
      };

  const linkStyle = { backgroundPosition: "0 100%" };

  const barStyle = { maxWidth: LEBAR_ISI };

  return (
    <footer className="footer">
      <div className="footer__inner" style={wrapperStyle}>
        <div className="footer__grid" style={gridStyle}>
          <div className="footer__brand" style={brandStyle}>
            <Link
              to="/"
              className="footer__logo-link"
              aria-label={t("Kembali ke beranda")}
              style={logoLinkStyle}
            >
              <img src="/Logo_PSU.webp" alt="Logo" className="footer__logo" />
            </Link>

            <div className="footer__brand-text" style={brandTextStyle}>
              <p className="footer__name">PT PENILAI STANDAR UJI</p>
              <p className="footer__tagline">
                {t("Lembaga Penilaian Kesesuaian")}
              </p>
              <p className="footer__tagline">LSPr-051-IDN</p>
              <p className="footer__tagline">LP-1554-IDN</p>
            </div>
          </div>

          <div className="footer__col" style={alamatStyle}>
            <h2 className="footer__title" style={responsiveTitleStyle}>
              {t("Alamat Kantor dan Laboratorium")}
            </h2>
            <address className="footer__list" style={addressStyle}>
              <p>
                {lang === "en"
                  ? "Jalan Cipinang Muara 1 No. 21 RT.006 / RW.03, Pondok Bambu Urban Village, Duren Sawit District, East Jakarta - 13430"
                  : kontak.alamat}
              </p>
            </address>
          </div>

          <div className="footer__col" style={kontakStyle}>
            <h2 className="footer__title" style={responsiveTitleStyle}>
              {t("Hubungi Kami")}
            </h2>
            <address className="footer__list" style={addressStyle}>
              <p>
                <a
                  className="footer__contact-link"
                  href={`mailto:${kontak.email}`}
                  style={linkStyle}
                >
                  <ContactIcon type="email" />
                  <span>{kontak.email}</span>
                </a>
              </p>
              <p>
                <a
                  href={`tel:${kontak.telepon.replace(/[\s-]/g, "")}`}
                  className="footer__contact-link"
                  style={linkStyle}
                >
                  <ContactIcon type="phone" />
                  <span>{kontak.telepon}</span>
                </a>
              </p>
              <p>
                <a
                  href={`https://wa.me/${kontak.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="footer__contact-link"
                  style={linkStyle}
                >
                  <ContactIcon type="whatsapp" />
                  <span>{kontak.whatsapp}</span>
                </a>
              </p>
            </address>
          </div>
        </div>

        <div className="footer__bar" style={barStyle}>
          <p>
            © {new Date().getFullYear()} PT PENILAI STANDAR UJI.{" "}
            {t("Seluruh hak cipta dilindungi.")}
          </p>
        </div>
      </div>
    </footer>
  );
}