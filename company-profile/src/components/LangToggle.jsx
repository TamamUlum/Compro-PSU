import { useLanguage } from "../context/useLanguage";
import "./LangToggle.css";

export default function LangToggle({ tabIndex }) {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLang}
      title={t(lang === "id" ? "Ganti ke Bahasa Inggris" : "Switch to Indonesian")}
      tabIndex={tabIndex}
    >
      {lang === "id" ? (
        <>
          <img src="/flag-id.svg" alt={t("Bahasa Indonesia")} />
          <span>ID</span>
          <span className="lang-toggle__arrow">→</span>
          <img src="/flag-en.svg" alt="English" />
          <span>EN</span>
        </>
      ) : (
        <>
          <img src="/flag-en.svg" alt="English" />
          <span>EN</span>
          <span className="lang-toggle__arrow">→</span>
          <img src="/flag-id.svg" alt={t("Bahasa Indonesia")} />
          <span>ID</span>
        </>
      )}
    </button>
  );
}
