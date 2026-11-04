import PageHeader from "../../../components/PageHeader";
import "./Biaya_penawaran_kalibrasi.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Biayapenawarankalibrasi() {
  return (
    <>
      <PageHeader
        title="Biaya dan Penawaran Kalibrasi"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Kalibrasi" },
          { label: "Biaya dan Penawaran Kalibrasi", href: "/layanan/kalibrasi/biaya-sertif" },
        ]}
      />
      <section><LocalizedText as="h1">Biaya dan Penawaran Kalibrasi</LocalizedText></section>
    </>
  );
}
