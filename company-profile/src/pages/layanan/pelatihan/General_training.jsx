import PageHeader from "../../../components/PageHeader";
import "./General_training.css";
import LocalizedText from "../../../components/LocalizedText";

export default function Generaltraining() {
  return (
    <>
      <PageHeader
        title="General Training"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Pelatihan" },
          { label: "General Training", href: "/layanan/pelatihan/general-training" },
        ]}
      />
      <section><LocalizedText as="h1">General Training</LocalizedText></section>
    </>
  );
}
