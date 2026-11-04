import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import "./PageHeader.css";

/**
 * Daftar route yang benar-benar memiliki file halaman (.jsx) tersendiri.
 * Jika suatu item breadcrumb tidak memiliki `href` atau `href`-nya tidak ada
 * di dalam daftar ini (misalnya menu induk dropdown seperti "Layanan",
 * "Lembaga Sertifikasi Produk", "Proses Sertifikasi", "Ruang Lingkup" Kalibrasi,
 * "Tentang Kami", atau "Client"), maka item tersebut otomatis ditampilkan
 * sebagai teks biasa (<span>) yang TIDAK BISA DIKLIK.
 */
const VALID_PAGE_ROUTES = new Set([
  "/",
  "/pertanian",
  "/tanaman",
  "/pangan",
  "/kimia",
  "/logam",
  "/jasa-lainnya",
  "/about/profile",
  "/about/struktur-organisasi",
  "/client/sertifikasi-produk",
  "/client/pengujian",
  "/client/kalibrasi",
  "/client/sertifikasi-sistem-manajemen",
  "/artikel",
  "/kontak",
  "/layanan/sertif-produk/legalitas",
  "/layanan/sertif-produk/ruang-lingkup",
  "/layanan/sertif-produk/permohonan-sertifikasi",
  "/layanan/sertif-produk/tipe-1b",
  "/layanan/sertif-produk/tipe-5",
  "/layanan/sertif-produk/penggunaan-sni",
  "/layanan/sertif-produk/keluhan-banding",
  "/layanan/sertif-produk/hak-kewajiban-klien",
  "/layanan/sertif-produk/biaya-sertif",
  "/layanan/penguji/legalitas",
  "/layanan/penguji/ruang-lingkup",
  "/layanan/penguji/proses-pengujian",
  "/layanan/penguji/biaya-sertif",
  "/layanan/kalibrasi/legalitas",
  "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan",
  "/layanan/kalibrasi/biaya-sertif",
  "/layanan/sertif-manajemen/legalitas",
  "/layanan/sertif-manajemen/ruang-lingkup",
  "/layanan/sertif-manajemen/proses-sertifikasi",
  "/layanan/sertif-manajemen/keluhan-banding",
  "/layanan/sertif-manajemen/hak-kewajiban-klien",
  "/layanan/sertif-manajemen/biaya-sertif",
  "/layanan/pelatihan/general-training",
  "/layanan/pelatihan/inhouse-training",
  "/layanan/pelatihan/exhouse-training",
]);

export default function PageHeader({ title, breadcrumbs = [] }) {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  const trail =
    Array.isArray(breadcrumbs) && breadcrumbs.length > 0
      ? breadcrumbs
      : title
        ? [{ label: title, href: pathname }]
        : [];

  return (
    <header className="page-header">
      <div className="page-header__overlay" aria-hidden="true" />
      <div className="page-header__inner">
        <h1 className="page-header__title">{t(title)}</h1>

        <nav className="page-header__breadcrumb-box" aria-label="Breadcrumb">
          <ol className="page-header__breadcrumb-list">
            <li className="page-header__breadcrumb-item">
              <Link to="/" className="page-header__crumb-link">
                {t("Beranda")}
              </Link>
            </li>

            {trail.map((item, index) => {
              const isLast = index === trail.length - 1;
              const hasOwnPageFile =
                Boolean(item.href) &&
                item.clickable !== false &&
                VALID_PAGE_ROUTES.has(item.href);

              return (
                <li
                  key={`${item.label}-${index}`}
                  className="page-header__breadcrumb-item"
                >
                  <span className="page-header__crumb-sep" aria-hidden="true">
                    &gt;
                  </span>
                  {hasOwnPageFile ? (
                    <Link
                      to={item.href}
                      className={`page-header__crumb-link${
                        isLast ? " page-header__crumb-link--current" : ""
                      }`}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {t(item.label)}
                    </Link>
                  ) : (
                    <span className="page-header__crumb-text">
                      {t(item.label)}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </header>
  );
}