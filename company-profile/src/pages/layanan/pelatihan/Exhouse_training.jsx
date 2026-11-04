import PageHeader from "../../../components/PageHeader";
import "./Exhouse_training.css";
import LocalizedText from "../../../components/LocalizedText";

export default function ExhouseTraining() {
  return (
    <>
      <PageHeader
        title="Exhouse Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan" },
          { label: "Exhouse Training", href: "/layanan/pelatihan/exhouse-training" },
        ]}
      />
      <section className="service-detail--exhouse-training">
        <LocalizedText as="h1">Exhouse Training</LocalizedText>
      </section>
    </>
  );
}
