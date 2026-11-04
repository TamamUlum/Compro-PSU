import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Biayapenawaransertifsistem() {
  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Sertifikasi"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Sistem Manajemen" },
          { label: "Biaya dan Penawaran Sertifikasi", href: "/layanan/sertif-manajemen/biaya-sertif" },
        ]}
      />
      <section><LocalizedText as="h1">Biaya dan Penawaran Sertifikasi</LocalizedText></section>
    </>
  );
}
