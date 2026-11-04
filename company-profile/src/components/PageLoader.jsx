import "./PageLoader.css";
import { useLanguage } from "../context/useLanguage";

export default function PageLoader() {
  const { lang } = useLanguage();

  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader__spinner" aria-hidden="true" />
      <span>{lang === "en" ? "Loading page..." : "Memuat halaman..."}</span>
    </div>
  );
}
