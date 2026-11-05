import PageHeader from "../../components/PageHeader";
import SeoHead from "../../components/SeoHead";
import { useState } from "react";
import LocalizedText from "../../components/LocalizedText";
import { useLanguage } from "../../context/useLanguage";
import SilappWorkflowTracker from "../../components/SilappWorkflowTracker";
import {
  SILAPP_DOMAIN,
  fetchCertificateFromApi,
  renderNamaPabrik,
  getStatusBadgeClass,
} from "../../utils/silappTracker";
import "../Client.css";

const SUBMENU_KEY = "pengujian";

export default function ClientTesting() {
  const { t } = useLanguage();
  const [noSertifikat, setNoSertifikat] = useState("");
  const [results, setResults] = useState([]);
  const [workflow, setWorkflow] = useState(null);
  const [dataSource, setDataSource] = useState(SILAPP_DOMAIN);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    const trimmed = noSertifikat.trim();

    if (!trimmed) {
      setErrorMsg(t("Silakan masukkan nomor sertifikat atau kode lacak terlebih dahulu."));
      setResults([]);
      setWorkflow(null);
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
        setWorkflow(null);
      } else if (status >= 400 || !payload.success) {
        setResults([]);
        setWorkflow(null);
        setErrorMsg(payload.message || `Terjadi kesalahan saat memeriksa sertifikat pada sistem API ${SILAPP_DOMAIN}.`);
      } else if (payload.mode === "workflow" || payload.workflow) {
        setWorkflow(payload.workflow || payload.data?.[0]);
        setResults(Array.isArray(payload.data) ? payload.data : []);
        setDataSource(payload.source || SILAPP_DOMAIN);
      } else {
        setWorkflow(null);
        setResults(Array.isArray(payload.data) ? payload.data : []);
        setDataSource(payload.source || SILAPP_DOMAIN);
      }
    } catch {
      setHasSearched(true);
      setResults([]);
      setWorkflow(null);
      setErrorMsg(
        `Gagal terhubung ke API ${SILAPP_DOMAIN} maupun backend server. Silakan pastikan koneksi jaringan aktif dan coba beberapa saat lagi.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setNoSertifikat("");
    setResults([]);
    setWorkflow(null);
    setHasSearched(false);
    setSearchedQuery("");
    setErrorMsg("");
  };

  return (
    <>
      <SeoHead
        title="Tracking Laporan Pengujian Laboratorium"
        description="Pelacakan keabsahan nomor laporan hasil uji (LHU) Laboratorium Pengujian terakreditasi KAN LP-1554-IDN PT Penilai Standar Uji."
        canonical="/client/pengujian"
        type="service"
        breadcrumbs={[
          { label: "Client", href: "/client/pengujian" },
          { label: "Lembaga Pengujian", href: "/client/pengujian" },
        ]}
        primaryImage="/lab_pengujian.webp"
      />
      <PageHeader
        title="Lembaga Pengujian"
        breadcrumbs={[
          { label: "Client" },
          { label: "Lembaga Pengujian", href: "/client/pengujian" },
        ]}
      />
      <section className="cert-tracker">
        <div className="cert-tracker__container">
          <header className="cert-tracker__header">
            <span className="cert-tracker__eyebrow">
              <LocalizedText>Tracking Status Sertifikat</LocalizedText>
            </span>
            <LocalizedText as="h1" className="cert-tracker__title">
              Lembaga Pengujian
            </LocalizedText>
            <div className="cert-tracker__api-pill">
              <span className="cert-tracker__api-pulse" />
              <span>Data Real-Time API: <strong>{SILAPP_DOMAIN}</strong></span>
            </div>
            <LocalizedText as="p" className="cert-tracker__subtitle">
              Masukkan nomor sertifikat laporan pengujian atau kode lacak SILAPP untuk memverifikasi keabsahan laporan hasil uji Laboratorium Pengujian PT PSU.
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
                    placeholder={t("Nomor Sertifikat / Kode Lacak (contoh: PSU-LP-2026-BKLN atau SLP26-...)")}
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
                  {loading ? t("Melacak...") : t("Cek Sertifikat")}
                </button>
              </form>

              {hasSearched && !errorMsg && results.length > 0 && (
                <div className="cert-tracker__meta">
                  <span className="cert-tracker__source-tag">
                    Terverifikasi via {dataSource}
                  </span>
                </div>
              )}
            </div>

            <div className="cert-tracker__format-hint">
              <LocalizedText>Contoh Nomor Sertifikat / Kode Lacak:</LocalizedText>
              <code>PSU-LP-2026-BKLN</code>
              <code>SLP26-LAB-0192</code>
            </div>

            {errorMsg && (
              <div className="cert-tracker__state cert-tracker__state--error" role="alert">
                <p className="cert-tracker__state-title">{t("Perhatian")}</p>
                <p>{errorMsg}</p>
              </div>
            )}

            {/* Workflow Timeline jika hasil berupa permohonan progres */}
            {hasSearched && !errorMsg && workflow && (
              <SilappWorkflowTracker workflow={workflow} onReset={handleClear} />
            )}

            {/* Tabel Sertifikat Terbit */}
            {hasSearched && !errorMsg && !workflow && results.length === 0 && (
              <div className="cert-tracker__state cert-tracker__state--notfound">
                <p className="cert-tracker__state-title">
                  <LocalizedText>Data Sertifikat Tidak Ditemukan</LocalizedText>
                </p>
                <p>
                  {t("Nomor sertifikat / kode lacak")} <strong>{searchedQuery}</strong>{" "}
                  {t("tidak ditemukan pada database")} <strong>{t("Lembaga Pengujian")}</strong>{" "}
                  {t("di sistem API")} <strong>{SILAPP_DOMAIN}</strong>.
                </p>
              </div>
            )}

            {hasSearched && !errorMsg && !workflow && results.length > 0 && (
              <div className="cert-tracker__table-wrap">
                <table className="cert-tracker__table">
                  <thead>
                    <tr>
                      <th><LocalizedText>Nama Pabrik / Perusahaan</LocalizedText></th>
                      <th><LocalizedText>Produk Diuji</LocalizedText></th>
                      <th><LocalizedText>Nomor SNI / Metode</LocalizedText></th>
                      <th><LocalizedText>Nomor Sertifikat / LHU</LocalizedText></th>
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
