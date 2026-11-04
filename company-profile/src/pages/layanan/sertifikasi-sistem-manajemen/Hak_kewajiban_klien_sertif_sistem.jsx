import PageHeader from "../../../components/PageHeader";
import "./Hak_kewajiban_klien_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Hakkewajibankliensertifsistem() {
  return (
    <>
      <PageHeader
        title="Hak dan Kewajiban Klien"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Sistem Manajemen" },
          { label: "Hak dan Kewajiban Klien", href: "/layanan/sertif-manajemen/hak-kewajiban-klien" },
        ]}
      />
      <section><LocalizedText as="h1">Hak dan Kewajiban Klien</LocalizedText></section>
    </>
  );
}
