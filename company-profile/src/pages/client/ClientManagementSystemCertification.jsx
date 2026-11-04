import PageHeader from "../../components/PageHeader";
import { useState } from "react";
import LocalizedText from "../../components/LocalizedText";
import { useLanguage } from "../../context/useLanguage";
import "../Client.css";

const SUBMENU_KEY = "sertifikasi-sistem-manajemen";

async function fetchCertificateFromApi(submenu, noSertifikat) {
  const encodedNo = encodeURIComponent(noSertifikat);
  const endpoints = [
    `/api/sertifikat/${submenu}?no_sertifikat=${encodedNo}`,
  ];

  let lastError = null;
  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        continue;
      }
      const payload = await response.json();
      return { status: response.status, payload };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Tidak dapat terhubung ke server API MySQL.");
}

function renderNamaPabrik(namaPabrik) {
  if (!namaPabrik) return "-";
  const raw = String(namaPabrik);
  if (raw.includes("|")) {
    const [name, city] = raw.split("|").map((s) => s.trim());
    return (
      <div>
        <div className="cert-tracker__factory-name">{name}</div>
        {city && <div className="cert-tracker__factory-city">{city}</div>}
      </div>
    );
  }
  if (raw.includes("\n")) {
    const [name, city] = raw.split("\n").map((s) => s.trim());
    return (
      <div>
        <div className="cert-tracker__factory-name">{name}</div>
        {city && <div className="cert-tracker__factory-city">{city}</div>}
      </div>
    );
  }
  return (
    <div>
      <div className="cert-tracker__factory-name">{raw}</div>
    </div>
  );
}

function getStatusBadgeClass(statusText) {
  const norm = String(statusText || "").trim().toLowerCase();
  if (norm === "aktif") return "cert-tracker__badge--active";
  if (norm === "ditangguhkan") return "cert-tracker__badge--suspended";
  return "cert-tracker__badge--revoked";
}

export default function ClientManagementSystemCertification() {
  const { t } = useLanguage();
  const [noSertifikat, setNoSertifikat] = useState("");
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = noSertifikat.trim();

    if (!trimmed) {
      setErrorMsg(t("Silakan masukkan nomor sertifikat terlebih dahulu."));
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setSearchedQuery(trimmed);

    try {
      const { status, payload } = await fetchCertificateFromApi(SUBMENU_KEY, trimmed);
      setHasSearched(true);

      if (status === 404 || !payload.found) {
        setResults([]);
      } else if (status >= 400 || !payload.success) {
        setResults([]);
        setErrorMsg(payload.message || "Terjadi kesalahan saat memeriksa sertifikat.");
      } else {
        setResults(Array.isArray(payload.data) ? payload.data : []);
      }
    } catch {
      setHasSearched(true);
      setResults([]);
      setErrorMsg(
        "Gagal terhubung ke server backend (port 5000). Pastikan Anda sudah menjalankan 'npm start' dan MySQL di XAMPP sudah Start."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNoSertifikat("");
    setResults([]);
    setHasSearched(false);
    setSearchedQuery("");
    setErrorMsg("");
  };

  return (
    <>
      <PageHeader
        title="Lembaga Sertifikasi Sistem Manajemen"
        breadcrumbs={[
          { label: "Client" },
          { label: "Lembaga Sertifikasi Sistem Manajemen", href: "/client/sertifikasi-sistem-manajemen" },
        ]}
      />
      <section className="cert-tracker">
        <div className="cert-tracker__container">
          <header className="cert-tracker__header">
            <span className="cert-tracker__eyebrow">
              <LocalizedText>Tracking Status Sertifikat</LocalizedText>
            </span>
            <LocalizedText as="h1" className="cert-tracker__title">
              Lembaga Sertifikasi Sistem Manajemen
            </LocalizedText>
            <LocalizedText as="p" className="cert-tracker__subtitle">
              Masukkan nomor sertifikat untuk mengecek status dan informasi sertifikat yang terdaftar pada layanan ini. Pencarian hanya menampilkan sertifikat yang sesuai dengan nomor yang diinputkan.
            </LocalizedText>
          </header>

          <div className="cert-tracker__card">
            <div className="cert-tracker__toolbar">
              <form className="cert-tracker__form" onSubmit={handleSearch}>
                <div className="cert-tracker__input-wrap">
                  <span className="cert-tracker__search-icon" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
                      <path d="M20 20L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    className="cert-tracker__input"
                    placeholder={t("Masukkan Nomor Sertifikat (contoh: PSU-LSSM-2026-ABCD)")}
                    value={noSertifikat}
                    onChange={(e) => setNoSertifikat(e.target.value)}
                    aria-label={t("Nomor Sertifikat")}
                  />
                  {noSertifikat && (
                    <button
                      type="button"
                      className="cert-tracker__clear"
                      onClick={handleClear}
                      aria-label={t("Bersihkan input")}
                    >
                      ×
                    </button>
                  )}
                </div>

                <button type="submit" className="cert-tracker__btn" disabled={loading}>
                  {loading ? t("Mencari...") : t("Cek Sertifikat")}
                </button>
              </form>

              {hasSearched && !errorMsg && (
                <div className="cert-tracker__meta">
                  <span>
                    {results.length} {t("sertifikat")}
                  </span>
                </div>
              )}
            </div>

            <div className="cert-tracker__format-hint">
              <LocalizedText>Contoh Nomor Sertifikat:</LocalizedText>
              <code>PSU-LSSM-2026-ABCD</code>
            </div>

            {errorMsg && (
              <div className="cert-tracker__state cert-tracker__state--error" role="alert">
                <p className="cert-tracker__state-title">{t("Perhatian")}</p>
                <p>{errorMsg}</p>
              </div>
            )}

            {hasSearched && !errorMsg && results.length === 0 && (
              <div className="cert-tracker__state cert-tracker__state--notfound">
                <p className="cert-tracker__state-title">
                  <LocalizedText>Data Sertifikat Tidak Ditemukan</LocalizedText>
                </p>
                <p>
                  {t("Nomor sertifikat")} <strong>{searchedQuery}</strong>{" "}
                  {t("tidak ditemukan pada database")}{" "}
                  <strong>{t("Lembaga Sertifikasi Sistem Manajemen")}</strong>.
                </p>
              </div>
            )}

            {hasSearched && !errorMsg && results.length > 0 && (
              <div className="cert-tracker__table-wrap">
                <table className="cert-tracker__table">
                  <thead>
                    <tr>
                      <th><LocalizedText>Nama Pabrik</LocalizedText></th>
                      <th><LocalizedText>Produk</LocalizedText></th>
                      <th><LocalizedText>Nomor SNI</LocalizedText></th>
                      <th><LocalizedText>Nomor Sertifikat</LocalizedText></th>
                      <th><LocalizedText>Terbit</LocalizedText></th>
                      <th><LocalizedText>Berlaku s.d.</LocalizedText></th>
                      <th><LocalizedText>Status</LocalizedText></th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((item) => {
                      const badgeClass = getStatusBadgeClass(item.status);
                      return (
                        <tr key={item.id || item.no_sertifikat}>
                          <td className="cert-tracker__factory">
                            {renderNamaPabrik(item.nama_pabrik)}
                          </td>
                          <td className="cert-tracker__product">{item.produk}</td>
                          <td className="cert-tracker__mono">{item.no_sni}</td>
                          <td className="cert-tracker__mono">{item.no_sertifikat}</td>
                          <td className="cert-tracker__date">{item.terbit}</td>
                          <td className="cert-tracker__date">{item.berlaku_sd || "—"}</td>
                          <td>
                            <span className={`cert-tracker__badge ${badgeClass}`}>
                              <span className="cert-tracker__badge-dot" />
                              <LocalizedText>{item.status}</LocalizedText>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
