import PageHeader from "../../../components/PageHeader";
import "./Inhouse_training.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Inhousetraining() {
  return (
    <>
      <PageHeader
        title="Inhouse Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan" },
          { label: "Inhouse Training", href: "/layanan/pelatihan/inhouse-training" },
        ]}
      />
      <section><LocalizedText as="h1">Inhouse Training</LocalizedText></section>
    </>
  );
}
