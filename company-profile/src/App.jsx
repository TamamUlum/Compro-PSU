import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { LanguageProvider } from "./context/LanguageContext";
import ScrollToTop from "./components/ScrollToTop";
import Navbar from "./components/Navbar";
import WaFloat from "./components/WaFloat";
import Footer from "./components/Footer";
import PageLoader from "./components/PageLoader";
import PageErrorBoundary from "./components/PageErrorBoundary";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Struktur from "./pages/Struktur";
import Client from "./pages/Client";
import ClientProductCertification from "./pages/client/ClientProductCertification";
import ClientTesting from "./pages/client/ClientTesting";
import ClientCalibration from "./pages/client/ClientCalibration";
import ClientManagementSystemCertification from "./pages/client/ClientManagementSystemCertification";
import Artikel from "./pages/Artikel";
import ArtikelDetail from "./pages/ArtikelDetail";
import DashboardArtikel from "./pages/DashboardArtikel";
import Kontak from "./pages/Kontak";
import KalibrasiAlatKesehatan from "./pages/layanan/kalibrasi/Alat_kesehatan_kalibrasi";
import ProductLegalitas from "./pages/layanan/sertifikasi-produk/Legalitas_sertif";
import ProductScope from "./pages/layanan/sertifikasi-produk/Ruang_lingkup_sertif";
import ProductApplication from "./pages/layanan/sertifikasi-produk/Permohonan_sertifikasi";
import ProductType1B from "./pages/layanan/sertifikasi-produk/Tipe_1B";
import ProductType5 from "./pages/layanan/sertifikasi-produk/Tipe_5";
import ProductSniRules from "./pages/layanan/sertifikasi-produk/Ketentuan_penggunaan_SNI";
import ProductComplaints from "./pages/layanan/sertifikasi-produk/Keluhan_banding_sertif";
import ProductClientRights from "./pages/layanan/sertifikasi-produk/Hak_kewajiban_klien_sertif";
import ProductFees from "./pages/layanan/sertifikasi-produk/Biaya_penawaran_sertif";
import TestingLegalitas from "./pages/layanan/pengujian/Legalitas_penguji";
import TestingScope from "./pages/layanan/pengujian/Ruang_lingkup_penguji";
import TestingProcess from "./pages/layanan/pengujian/Proses_penguji";
import TestingFees from "./pages/layanan/pengujian/Biaya_penawaran_penguji";
import CalibrationLegalitas from "./pages/layanan/kalibrasi/Legalitas_kalibrasi";
import CalibrationFees from "./pages/layanan/kalibrasi/Biaya_penawaran_kalibrasi";
import ManagementLegalitas from "./pages/layanan/sertifikasi-sistem-manajemen/Legalitas_sertif_sistem";
import ManagementScope from "./pages/layanan/sertifikasi-sistem-manajemen/Ruang_lingkup_sertif_sistem";
import ManagementProcess from "./pages/layanan/sertifikasi-sistem-manajemen/Proses_sertif_sistem";
import ManagementComplaints from "./pages/layanan/sertifikasi-sistem-manajemen/Keluhan_banding_sertif_sistem";
import ManagementClientRights from "./pages/layanan/sertifikasi-sistem-manajemen/Hak_kewajiban_klien_sertif_sistem";
import ManagementFees from "./pages/layanan/sertifikasi-sistem-manajemen/Biaya_penawaran_sertif_sistem";
import GeneralTraining from "./pages/layanan/pelatihan/General_training";
import InhouseTraining from "./pages/layanan/pelatihan/Inhouse_training";
import ExhouseTraining from "./pages/layanan/pelatihan/Exhouse_training";
import Pertanian from "./pages/sectors/Pertanian";
import Tanaman from "./pages/sectors/Tanaman";
import Pangan from "./pages/sectors/Pangan";
import Kimia from "./pages/sectors/Kimia";
import Logam from "./pages/sectors/Logam";
import JasaLainnya from "./pages/sectors/JasaLainnya";

function RedirectArtikelEdit() {
  const { slug } = useParams();
  return (
    <Navigate
      to={slug ? `/dashboard-artikel/edit/${encodeURIComponent(slug)}` : "/dashboard-artikel/edit"}
      replace
    />
  );
}

function App() {
  const location = useLocation();
  const [readyLocationKey, setReadyLocationKey] = useState(null);

  const isDashboardRoute =
    location.pathname.startsWith("/dashboard-artikel") ||
    location.pathname === "/admin" ||
    location.pathname.startsWith("/admin/");

  useEffect(() => {
    const timer = window.setTimeout(
      () => setReadyLocationKey(location.key),
      isDashboardRoute ? 80 : 350,
    );
    return () => window.clearTimeout(timer);
  }, [location.key, isDashboardRoute]);

  return (
    <LanguageProvider>
      <div className="app-layout">
        <ScrollToTop />
        {!isDashboardRoute && <Navbar />}
        <main className="app-main">
          <PageErrorBoundary key={location.key}>
            {readyLocationKey === location.key || isDashboardRoute ? (
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pertanian" element={<Pertanian />} />
                <Route path="/tanaman" element={<Tanaman />} />
                <Route path="/pangan" element={<Pangan />} />
                <Route path="/kimia" element={<Kimia />} />
                <Route path="/logam" element={<Logam />} />
                <Route path="/jasa-lainnya" element={<JasaLainnya />} />
                <Route path="/about/profile" element={<Profile />} />
                <Route
                  path="/about/struktur-organisasi"
                  element={<Struktur />}
                />
                <Route path="/client" element={<Client />} />
                <Route
                  path="/client/sertifikasi-produk"
                  element={<ClientProductCertification />}
                />
                <Route path="/client/pengujian" element={<ClientTesting />} />
                <Route path="/client/kalibrasi" element={<ClientCalibration />} />
                <Route
                  path="/client/sertifikasi-sistem-manajemen"
                  element={<ClientManagementSystemCertification />}
                />

                {/* Rute Dashboard Admin Artikel (Terproteksi Sesi Login JWT) */}
                <Route
                  path="/admin"
                  element={<Navigate to="/dashboard-artikel" replace />}
                />
                <Route
                  path="/admin/*"
                  element={<Navigate to="/dashboard-artikel" replace />}
                />
                <Route path="/dashboard-artikel" element={<DashboardArtikel />} />
                <Route
                  path="/dashboard-artikel/:subpage"
                  element={<DashboardArtikel />}
                />
                <Route
                  path="/dashboard-artikel/:subpage/:slug"
                  element={<DashboardArtikel />}
                />

                {/* Rute Artikel Publik & Pengalihan URL Manual Tambah/Edit ke Dashboard */}
                <Route path="/artikel" element={<Artikel />} />
                <Route
                  path="/artikel/tambah"
                  element={<Navigate to="/dashboard-artikel/tambah" replace />}
                />
                <Route
                  path="/artikel/edit"
                  element={<Navigate to="/dashboard-artikel/edit" replace />}
                />
                <Route
                  path="/artikel/edit/:slug"
                  element={<RedirectArtikelEdit />}
                />
                <Route path="/artikel/:slug" element={<ArtikelDetail />} />

                <Route path="/kontak" element={<Kontak />} />
                <Route
                  path="/layanan/sertif-produk/legalitas"
                  element={<ProductLegalitas />}
                />
                <Route
                  path="/layanan/sertif-produk/ruang-lingkup"
                  element={<ProductScope />}
                />
                <Route
                  path="/layanan/sertif-produk/permohonan-sertifikasi"
                  element={<ProductApplication />}
                />
                <Route
                  path="/layanan/sertif-produk/tipe-1b"
                  element={<ProductType1B />}
                />
                <Route
                  path="/layanan/sertif-produk/tipe-5"
                  element={<ProductType5 />}
                />
                <Route
                  path="/layanan/sertif-produk/penggunaan-sni"
                  element={<ProductSniRules />}
                />
                <Route
                  path="/layanan/sertif-produk/keluhan-banding"
                  element={<ProductComplaints />}
                />
                <Route
                  path="/layanan/sertif-produk/hak-kewajiban-klien"
                  element={<ProductClientRights />}
                />
                <Route
                  path="/layanan/sertif-produk/biaya-sertif"
                  element={<ProductFees />}
                />
                <Route
                  path="/layanan/penguji/legalitas"
                  element={<TestingLegalitas />}
                />
                <Route
                  path="/layanan/penguji/ruang-lingkup"
                  element={<TestingScope />}
                />
                <Route
                  path="/layanan/kalibrasi/ruang-lingkup/alat-kesehatan"
                  element={<KalibrasiAlatKesehatan />}
                />
                <Route
                  path="/layanan/penguji/proses-pengujian"
                  element={<TestingProcess />}
                />
                <Route
                  path="/layanan/penguji/biaya-sertif"
                  element={<TestingFees />}
                />
                <Route
                  path="/layanan/kalibrasi/legalitas"
                  element={<CalibrationLegalitas />}
                />
                <Route
                  path="/layanan/kalibrasi/biaya-sertif"
                  element={<CalibrationFees />}
                />
                <Route
                  path="/layanan/sertif-manajemen/legalitas"
                  element={<ManagementLegalitas />}
                />
                <Route
                  path="/layanan/sertif-manajemen/ruang-lingkup"
                  element={<ManagementScope />}
                />
                <Route
                  path="/layanan/sertif-manajemen/proses-sertifikasi"
                  element={<ManagementProcess />}
                />
                <Route
                  path="/layanan/sertif-manajemen/keluhan-banding"
                  element={<ManagementComplaints />}
                />
                <Route
                  path="/layanan/sertif-manajemen/hak-kewajiban-klien"
                  element={<ManagementClientRights />}
                />
                <Route
                  path="/layanan/sertif-manajemen/biaya-sertif"
                  element={<ManagementFees />}
                />
                <Route
                  path="/layanan/pelatihan/general-training"
                  element={<GeneralTraining />}
                />
                <Route
                  path="/layanan/pelatihan/inhouse-training"
                  element={<InhouseTraining />}
                />
                <Route
                  path="/layanan/pelatihan/exhouse-training"
                  element={<ExhouseTraining />}
                />
              </Routes>
            ) : (
              <PageLoader />
            )}
          </PageErrorBoundary>
        </main>
        {!isDashboardRoute && <WaFloat />}
        {!isDashboardRoute && <Footer />}
      </div>
    </LanguageProvider>
  );
}

export default App;
