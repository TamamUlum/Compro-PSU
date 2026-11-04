import PageHeader from "../../../components/PageHeader";
import "./Keluhan_banding_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Keluhanbandingsertifsistem() {
  return (
    <>
      <PageHeader
        title="Keluhan dan Banding"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Sistem Manajemen" },
          { label: "Keluhan dan Banding", href: "/layanan/sertif-manajemen/keluhan-banding" },
        ]}
      />
      <section><LocalizedText as="h1">Keluhan dan Banding</LocalizedText></section>
    </>
  );
}
