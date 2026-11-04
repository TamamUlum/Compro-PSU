import PageHeader from "../../../components/PageHeader";
import "./Legalitas_sertif_sistem.css";
import LocalizedText from "../../../components/LocalizedText";
import LegalitasButtons from "../../../components/LegalitasButtons";

export default function Legalitassertifsistem() {
  return (
    <>
      <PageHeader
        title="Legalitas"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Sistem Manajemen" },
          { label: "Legalitas", href: "/layanan/sertif-manajemen/legalitas" },
        ]}
      />
      <section className="service-detail--legalitas-sertif-sistem">
      <LocalizedText as="h1">Legalitas</LocalizedText>
      <LegalitasButtons />
      </section>
    </>
  );
}
