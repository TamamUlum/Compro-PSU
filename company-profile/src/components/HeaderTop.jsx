import "./HeaderTop.css";
import LangToggle from "./LangToggle";
import { useLanguage } from "../context/useLanguage";

const kontak = {
  email: " psuindonesia.info@gmail.com",
  telepon: "021 - 8602367",
  jam: "Sen - Jum 09.00 - 17.00 WIB",
};

const iconProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};

export default function HeaderTop() {
  const { t } = useLanguage();

  return (
    <div className="header-top">
      <div className="header-top__inner">
        <a
          className="header-top__item header-top__item--email"
          href={`mailto:${kontak.email}`}
        >
          <svg {...iconProps}>
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
          <span>{kontak.email}</span>
        </a>

        <a
          className="header-top__item header-top__item--phone"
          href={`tel:${kontak.telepon.replace(/[\s-]/g, "")}`}
        >
          <svg {...iconProps}>
            <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
          </svg>
          <span>{kontak.telepon}</span>
        </a>

        <div className="header-top__item header-top__hours">
          <svg {...iconProps}>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
          <span>{t(kontak.jam)}</span>
        </div>

        <div className="header-top__language">
          <LangToggle />
        </div>
      </div>
    </div>
  );
}