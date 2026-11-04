import PageHeader from "../../../components/PageHeader";
import { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import "./Tipe_1B.css";

const certificationStages = [
  "Sertifikasi Awal (Sukarela)",
  "Sertifikasi Awal (SIINAS)",
];

const voluntaryInitialSteps = [
  { title: "Mulai", type: "terminal" },
  { title: "Pengajuan permohonan sertifikasi produk Tipe 1B", type: "step" },
  {
    title: "Verifikasi dokumen dan identifikasi batch atau lot",
    type: "step",
  },
  {
    title: "Dokumen memenuhi persyaratan?",
    type: "decision",
    note: "Jika belum, klien diminta melengkapi atau memperbaiki dokumen permohonan.",
  },
  {
    title: "Tinjauan permohonan dan kontrak sertifikasi",
    type: "step",
  },
  {
    title: "Penetapan rencana evaluasi dan rencana sampling",
    type: "step",
  },
  {
    title: "Verifikasi identitas, jumlah, dan kondisi batch atau lot",
    type: "step",
  },
  {
    title: "Pengambilan contoh produk secara representatif",
    type: "step",
  },
  {
    title: "Pengujian produk sesuai persyaratan standar",
    type: "step",
  },
  {
    title: "Evaluasi hasil pengujian dan bukti kesesuaian",
    type: "step",
  },
  {
    title: "Hasil uji memenuhi persyaratan?",
    type: "decision",
    note: "Jika belum memenuhi, hasil ditindaklanjuti sesuai ketentuan skema sebelum evaluasi dilanjutkan.",
  },
  {
    title: "Tinjauan hasil evaluasi sertifikasi",
    type: "step",
  },
  {
    title: "Keputusan sertifikasi oleh personel berwenang",
    type: "step",
  },
  {
    title: "Sertifikasi disetujui?",
    type: "decision",
    note: "Jika tidak disetujui, PSU menyampaikan pemberitahuan keputusan kepada klien.",
  },
  {
    title: "Penerbitan sertifikat untuk batch atau lot tertentu",
    type: "step",
  },
  { title: "Selesai", type: "terminal" },
];

const voluntaryInitialStages = [
  {
    stage: "Permohonan",
    description:
      "Klien mengajukan permohonan sertifikasi produk Tipe 1B untuk batch atau lot tertentu.",
  },
  {
    stage: "Verifikasi dokumen",
    description:
      "PSU memeriksa kelengkapan dokumen dan kesesuaian informasi batch atau lot yang diajukan.",
  },
  {
    stage: "Tinjauan permohonan",
    description:
      "Permohonan ditinjau dan kontrak sertifikasi disepakati sebelum evaluasi dilaksanakan.",
  },
  {
    stage: "Rencana evaluasi",
    description:
      "PSU menetapkan rencana evaluasi dan sampling sesuai standar serta skema sertifikasi yang berlaku.",
  },
  {
    stage: "Verifikasi batch atau lot",
    description:
      "Identitas, jumlah, dan kondisi batch atau lot diverifikasi untuk memastikan kesesuaian dengan permohonan.",
  },
  {
    stage: "Pengambilan contoh",
    description:
      "Contoh produk diambil secara representatif dari batch atau lot yang diajukan.",
  },
  {
    stage: "Pengujian produk",
    description: "Contoh produk diuji sesuai persyaratan standar yang berlaku.",
  },
  {
    stage: "Evaluasi hasil",
    description:
      "Hasil pengujian dan bukti kesesuaian dievaluasi terhadap persyaratan sertifikasi.",
  },
  {
    stage: "Tinjauan hasil evaluasi",
    description:
      "Hasil evaluasi ditinjau sebelum keputusan sertifikasi ditetapkan.",
  },
  {
    stage: "Keputusan sertifikasi",
    description:
      "Keputusan ditetapkan oleh personel berwenang yang tidak terlibat dalam evaluasi.",
  },
  {
    stage: "Penerbitan sertifikat",
    description:
      "Jika disetujui, sertifikat diterbitkan khusus untuk batch atau lot yang telah dievaluasi.",
  },
];

const requiredDocuments = [
  "Formulir permohonan sertifikasi produk Tipe 1B",
  "Dokumen legalitas perusahaan dan identitas pemohon",
  "Spesifikasi produk dan informasi standar yang digunakan",
  "Identitas, jumlah, dan informasi batch atau lot produk",
  "Label atau penandaan produk yang diajukan",
  "Dokumen pendukung lain sesuai standar dan skema sertifikasi",
];

const siinasSteps = [
  {
    title: "Login ke SIINAS",
    description:
      "Perusahaan mengakses SIINAS menggunakan akun perusahaan yang terdaftar.",
  },
  {
    title: "Pengajuan permohonan sertifikasi",
    description:
      "Perusahaan mengisi informasi produk, merek, jumlah produk, identitas batch atau lot, serta memilih LSPro PSU apabila tersedia.",
  },
  {
    title: "Unggah dokumen persyaratan",
    description:
      "Perusahaan melengkapi dokumen legalitas, informasi produk, dokumen batch atau lot, serta persyaratan lain sesuai skema.",
  },
  {
    title: "Verifikasi oleh Tim Kemenperin",
    description:
      "Tim Kemenperin melakukan pemeriksaan kelengkapan dan kesesuaian dokumen permohonan melalui SIINAS.",
    decision: {
      question: "Apakah verifikasi disetujui?",
      options: [
        {
          label: "Tidak OK",
          description:
            "Perusahaan memperbaiki atau melengkapi dokumen melalui SIINAS untuk diverifikasi kembali.",
          detail: "Kembali ke langkah 04",
          type: "rejected",
        },
        {
          label: "OK",
          description: "Permohonan diteruskan kepada LSPro PSU melalui SIINAS.",
          detail: "Lanjut ke langkah 05",
          type: "approved",
        },
      ],
    },
  },
  {
    title: "Penerimaan dan verifikasi ulang oleh LSPro",
    description:
      "LSPro PSU memeriksa dokumen, kesesuaian ruang lingkup sertifikasi, identitas batch atau lot, dan kemampuan melaksanakan penilaian kesesuaian.",
    decision: {
      question: "Apakah permohonan diterima LSPro?",
      options: [
        {
          label: "Tidak OK — Ditolak",
          description:
            "LSPro menolak permohonan berdasarkan hasil tinjauan dan menyampaikan alasan penolakan.",
          detail: "Proses berakhir",
          type: "rejected",
        },
        {
          label: "OK — Diterima",
          description:
            "LSPro menerima permohonan dan melanjutkan proses sertifikasi.",
          detail: "Lanjut ke langkah 06",
          type: "approved",
        },
      ],
    },
  },
  {
    title: "Penawaran biaya, kesepakatan, dan kontrak",
    description:
      "LSPro menyampaikan penawaran biaya dan ketentuan sertifikasi. Setelah disepakati, perusahaan dan LSPro menandatangani kontrak.",
  },
  {
    title: "Verifikasi identitas dan ketersediaan batch atau lot",
    description:
      "LSPro memastikan identitas, jumlah, lokasi, serta ketersediaan kelompok produk yang akan disertifikasi sesuai skema.",
  },
  {
    title: "Penjadwalan pengambilan sampel",
    description:
      "LSPro menetapkan petugas dan jadwal pengambilan contoh produk sesuai ketentuan skema sertifikasi.",
  },
  {
    title: "Pengambilan sampel produk",
    description:
      "Petugas mengambil sampel yang mewakili batch atau lot sesuai metode dan jumlah yang ditetapkan.",
  },
  {
    title: "Pengujian sampel di laboratorium",
    description:
      "Sampel diuji oleh laboratorium yang memenuhi persyaratan menggunakan metode pengujian sesuai SNI.",
  },
  {
    title: "Evaluasi hasil pengujian",
    description:
      "LSPro mengevaluasi laporan hasil uji dan bukti penilaian lainnya. Hasil yang belum memenuhi persyaratan ditindaklanjuti sesuai skema.",
  },
  {
    title: "Keputusan sertifikasi",
    description:
      "Personel berwenang menetapkan apakah batch atau lot produk memenuhi persyaratan sertifikasi.",
  },
  {
    title: "Penerbitan sertifikat dan proses SIINAS",
    description:
      "Jika disetujui, LSPro menerbitkan sertifikat kesesuaian untuk batch atau lot yang dinilai dan menyelesaikan proses administrasi SIINAS sesuai ketentuan produk.",
    decision: {
      question: "Keputusan sertifikasi disetujui?",
      options: [
        {
          label: "Tidak disetujui",
          description:
            "Sertifikat tidak diterbitkan. Perusahaan memperoleh pemberitahuan keputusan dan alasan sesuai prosedur.",
          type: "rejected",
        },
        {
          label: "Disetujui",
          description:
            "Sertifikat diterbitkan khusus untuk batch atau lot produk yang dinyatakan memenuhi persyaratan.",
          type: "approved",
        },
      ],
    },
  },
];

export default function Tipe1B() {
  const { t } = useLanguage();
  const [activeStage, setActiveStage] = useState(certificationStages[0]);

  return (
    <>
      <PageHeader
        title="Tipe 1B"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Proses Sertifikasi" },
          { label: "Tipe 1B", href: "/layanan/sertif-produk/tipe-1b" },
        ]}
      />
      <section className="service-detail--tipe-1b">
        <h1>{t("Tipe 1B")}</h1>
        <div className="tipe-1b__buttons" aria-label={t("Tahapan sertifikasi")}>
          {certificationStages.map((stage) => (
            <button
              key={stage}
              type="button"
              className="tipe-1b__button"
              aria-pressed={stage === activeStage}
              onClick={() => setActiveStage(stage)}
            >
              {t(stage)}
            </button>
          ))}
        </div>
        {activeStage === "Sertifikasi Awal (Sukarela)" && (
          <div className="tipe-1b__content">
            <section
              className="tipe-1b__content-section"
              aria-labelledby="tipe-1b-voluntary-flow-title"
            >
              <h2 id="tipe-1b-voluntary-flow-title">
                {t("Alur Sertifikasi Produk Tipe 1B (Produk Sukarela)")}
              </h2>
              <ol className="tipe-1b__flow">
                {voluntaryInitialSteps.map(({ title, type, note }, index) => {
                  const stepNumber =
                    voluntaryInitialSteps
                      .slice(0, index)
                      .filter((step) => step.type !== "terminal").length + 1;

                  return (
                    <li
                      key={title}
                      className={`tipe-1b__flow-item tipe-1b__flow-item--${type}`}
                    >
                      <div className="tipe-1b__flow-node">
                        {type !== "terminal" && (
                          <span
                            className="tipe-1b__flow-number"
                            aria-hidden="true"
                          >
                            {stepNumber}
                          </span>
                        )}
                        <span>{t(title)}</span>
                      </div>
                      {note && (
                        <p className="tipe-1b__flow-note">
                          <strong>{t("Catatan keputusan")}:</strong> {t(note)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            <section
              className="tipe-1b__content-section"
              aria-labelledby="tipe-1b-voluntary-stages-title"
            >
              <h2 id="tipe-1b-voluntary-stages-title">
                {t("Tahapan Sertifikasi Produk Tipe 1B")}
              </h2>
              <div className="tipe-1b__table-wrap">
                <table className="tipe-1b__table">
                  <thead>
                    <tr>
                      <th scope="col">{t("Tahapan")}</th>
                      <th scope="col">{t("Keterangan utama")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {voluntaryInitialStages.map(
                      ({ stage, description }, index) => (
                        <tr key={stage}>
                          <th scope="row">
                            {index + 1}. {t(stage)}
                          </th>
                          <td>{t(description)}</td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="tipe-1b__content-section tipe-1b__documents"
              aria-labelledby="tipe-1b-voluntary-documents-title"
            >
              <h2 id="tipe-1b-voluntary-documents-title">
                {t("Dokumen yang dapat disiapkan")}
              </h2>
              <p>
                {t(
                  "Siapkan dokumen berikut untuk mendukung permohonan sertifikasi. Persyaratan dapat berbeda sesuai jenis produk dan skema sertifikasi.",
                )}
              </p>
              <ul className="tipe-1b__documents-list">
                {requiredDocuments.map((document, index) => (
                  <li className="tipe-1b__document-item" key={document}>
                    <span
                      className="tipe-1b__document-number"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span>{t(document)}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
        {activeStage === "Sertifikasi Awal (SIINAS)" && (
          <div className="tipe-1b__content tipe-1b__siinas-content">
            <section
              className="tipe-1b__content-section"
              aria-labelledby="tipe-1b-siinas-flow-title"
            >
              <h2 id="tipe-1b-siinas-flow-title">
                {t("Alur Sertifikasi Awal Produk Wajib Tipe 1B melalui SIINAS")}
              </h2>
              <p className="tipe-1b__siinas-intro">
                {t(
                  "Alur permohonan sertifikasi produk wajib melalui SIINAS Kementerian Perindustrian.",
                )}
              </p>
              <div className="tipe-1b__siinas-start">
                <strong>
                  {t("Mulai — Pengajuan Sertifikasi SNI Tipe 1B")}
                </strong>
                <span>{t("Melalui akun SIINAS perusahaan")}</span>
              </div>
              <ol className="tipe-1b__siinas-flow">
                {siinasSteps.map(({ title, description, decision }, index) => (
                  <li className="tipe-1b__siinas-step" key={title}>
                    <article className="tipe-1b__siinas-card">
                      <span
                        className="tipe-1b__siinas-number"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="tipe-1b__siinas-card-copy">
                        <h3>{t(title)}</h3>
                        <p>{t(description)}</p>
                      </div>
                    </article>
                    {decision && (
                      <div className="tipe-1b__siinas-decision">
                        <h3>{t(decision.question)}</h3>
                        <div className="tipe-1b__siinas-branches">
                          {decision.options.map((option) => (
                            <article
                              className={`tipe-1b__siinas-branch tipe-1b__siinas-branch--${option.type}`}
                              key={option.label}
                            >
                              <h4>{t(option.label)}</h4>
                              <p>{t(option.description)}</p>
                              {option.detail && (
                                <strong>{t(option.detail)}</strong>
                              )}
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <div className="tipe-1b__siinas-finish">
                <strong>{t("Selesai — Sertifikat Batch atau Lot")}</strong>
                <span>
                  {t(
                    "Sertifikat berlaku untuk batch atau lot yang telah dievaluasi sesuai persyaratan.",
                  )}
                </span>
              </div>
            </section>
          </div>
        )}
      </section>
    </>
  );
}
