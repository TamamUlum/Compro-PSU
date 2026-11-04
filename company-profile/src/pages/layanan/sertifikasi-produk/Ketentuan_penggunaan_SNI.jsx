import PageHeader from "../../../components/PageHeader";
import "./Ketentuan_penggunaan_SNI.css";
import LocalizedText from "../../../components/LocalizedText";
import { FaDownload, FaRegFileAlt } from "react-icons/fa";

const dokumenSni =
  "/pdf/Tata_Cara_Penggunaan_Tanda_SNI_dan_Tanda_Kesesuaian_Berbasis_SNI.pdf";

export default function KetentuanpenggunaanSNI() {
  return (
    <>
      <PageHeader
        title="Ketentuan dan Tata Cara Penggunaan SNI"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Ketentuan dan Tata Cara Penggunaan SNI", href: "/layanan/sertif-produk/penggunaan-sni" },
        ]}
      />
      <section className="service-detail--ketentuan-penggunaan-sni">
        <article className="ketentuan-sni">
        <header className="ketentuan-sni__header">
          <LocalizedText as="h1">
            Ketentuan dan Tata Cara Penggunaan SNI
          </LocalizedText>
          <LocalizedText as="p">
            Informasi ketentuan penggunaan Tanda SNI sesuai peraturan yang
            berlaku.
          </LocalizedText>
        </header>

        <div className="ketentuan-sni__content">
          <LocalizedText as="h2">Ketentuan Penggunaan Tanda SNI</LocalizedText>
          <LocalizedText as="p">
            Standar Nasional Indonesia (SNI) merupakan standar yang ditetapkan
            oleh Badan Standardisasi Nasional (BSN) dan berlaku di wilayah
            Indonesia. Penggunaan Tanda SNI menunjukkan bahwa barang, jasa,
            proses, sistem, atau personal telah memenuhi persyaratan acuan yang
            berlaku. Pembubuhan Tanda SNI harus didasarkan pada sertifikat
            kesesuaian dan persetujuan penggunaan tanda sesuai ketentuan.
          </LocalizedText>
          <LocalizedText as="p">
            Pengajuan penggunaan Tanda SNI dilakukan melalui pemenuhan
            persyaratan standar, penerbitan sertifikat kesesuaian oleh Lembaga
            Penilaian Kesesuaian (LPK) yang sesuai, serta pengajuan permohonan
            persetujuan penggunaan tanda. Pemegang persetujuan wajib menjaga
            kesesuaian terhadap standar dan menggunakan tanda sesuai ketentuan.
          </LocalizedText>

          <div className="ketentuan-sni__document">
            <div className="ketentuan-sni__document-info">
              <span className="ketentuan-sni__file-icon" aria-hidden="true">
                <FaRegFileAlt />
              </span>
              <div className="ketentuan-sni__file-copy">
                <LocalizedText as="h3">
                  TATA CARA PENGGUNAAN TANDA SNI DAN TANDA KESESUAIAN BERBASIS
                  SNI
                </LocalizedText>
                <LocalizedText as="p">
                  PDF · Dokumen ketentuan penggunaan Tanda SNI
                </LocalizedText>
              </div>
            </div>
            <a
              className="ketentuan-sni__download"
              href={dokumenSni}
              download="TATA CARA PENGGUNAAN TANDA SNI DAN TANDA KESESUAIAN BERBASIS SNI.pdf"
            >
              <FaDownload aria-hidden="true" />
              <LocalizedText>Unduh Dokumen PDF</LocalizedText>
            </a>
          </div>
        </div>
        </article>
      </section>
    </>
  );
}
