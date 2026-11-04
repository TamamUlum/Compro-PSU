import PageHeader from "../../../components/PageHeader";
import { useState } from "react";
import { useLanguage } from "../../../context/useLanguage";
import "./Tipe_5.css";

const certificationStages = [
  "Sertifikasi Awal (Sukarela)",
  "Sertifikasi Awal (SIINAS)",
  "Surveilan",
  "Perubahan Ruang Lingkup",
];

const scopeChangeSteps = [
  { title: "Mulai", type: "terminal" },
  { title: "Permohonan penambahan produk atau merek", type: "step" },
  { title: "Verifikasi dokumen dan tinjauan permohonan", type: "step" },
  {
    title: "Dokumen memenuhi persyaratan?",
    type: "decision",
    note: "Jika tidak, klien diminta melengkapi atau memperbaiki dokumen sebelum proses dilanjutkan.",
  },
  {
    title: "Penetapan rencana evaluasi sesuai skema sertifikasi",
    type: "step",
  },
  {
    title: "Evaluasi teknis (audit, pengambilan contoh, dan/atau pengujian)",
    type: "step",
  },
  { title: "Tinjauan hasil evaluasi", type: "step" },
  {
    title: "Hasil evaluasi memenuhi persyaratan?",
    type: "decision",
    note: "Jika belum, tindak lanjut dan evaluasi dilakukan kembali sesuai kebutuhan.",
  },
  { title: "Keputusan sertifikasi", type: "step" },
  {
    title: "Permohonan disetujui?",
    type: "decision",
    note: "Jika tidak disetujui, PSU menyampaikan pemberitahuan hasil keputusan kepada klien.",
  },
  { title: "Penerbitan atau pembaruan dokumen sertifikasi", type: "step" },
  {
    title: "Pembaruan direktori sertifikasi dan informasi lisensi",
    type: "step",
  },
  { title: "Selesai", type: "terminal" },
];

const scopeChangeStages = [
  {
    stage: "Permohonan",
    description: "Klien mengajukan permohonan penambahan produk atau merek.",
  },
  {
    stage: "Tinjauan permohonan",
    description: "PSU meninjau kelengkapan dan kesesuaian dokumen permohonan.",
  },
  {
    stage: "Rencana evaluasi",
    description:
      "PSU menetapkan evaluasi sesuai skema sertifikasi, termasuk audit, pengambilan contoh, dan/atau pengujian bila diperlukan.",
  },
  {
    stage: "Evaluasi",
    description:
      "Evaluasi teknis dilaksanakan sesuai rencana dan skema sertifikasi yang berlaku.",
  },
  {
    stage: "Tinjauan hasil",
    description:
      "Hasil evaluasi dan kelengkapan dokumen ditinjau sebelum keputusan sertifikasi.",
  },
  {
    stage: "Keputusan sertifikasi",
    description:
      "Keputusan ditetapkan oleh pihak yang berwenang dan tidak terlibat dalam evaluasi.",
  },
  {
    stage: "Penerbitan dokumen",
    description:
      "Dokumen sertifikasi diterbitkan atau diperbarui setelah permohonan disetujui.",
  },
  {
    stage: "Pembaruan direktori",
    description:
      "Direktori sertifikasi dan informasi lisensi diperbarui sesuai keputusan.",
  },
];

const siinasSteps = [
  {
    title: "Registrasi dan login SIINAS",
    description:
      "Perusahaan masuk ke akun SIINAS dan melengkapi profil serta perizinan usaha.",
  },
  {
    title: "Pengajuan permohonan sertifikasi",
    description:
      "Perusahaan mengisi data produk, merek, lokasi pabrik, SNI yang dituju, dan memilih LSPro PSU.",
  },
  {
    title: "Unggah dokumen persyaratan",
    description:
      "Perusahaan mengunggah dokumen legalitas, informasi produk, proses produksi, dan dokumen pendukung lainnya.",
  },
  {
    title: "Verifikasi oleh Tim Kemenperin",
    description:
      "Tim Kemenperin memeriksa kelengkapan dan kesesuaian dokumen permohonan melalui SIINAS.",
    decision: {
      question: "Apakah verifikasi Kemenperin disetujui?",
      options: [
        {
          label: "Tidak OK — Perlu perbaikan",
          description:
            "Perusahaan melengkapi atau memperbaiki dokumen, lalu mengirim ulang melalui SIINAS untuk diverifikasi.",
          type: "rejected",
        },
        {
          label: "OK — Diteruskan ke LSPro",
          description:
            "Permohonan yang lolos verifikasi diteruskan melalui SIINAS kepada LSPro PSU.",
          type: "approved",
        },
      ],
    },
  },
  {
    title: "Penerimaan dan verifikasi ulang oleh LSPro",
    description:
      "LSPro PSU meninjau permohonan, kesesuaian ruang lingkup sertifikasi, dan kemampuan melaksanakan proses sertifikasi.",
    decision: {
      question: "Apakah permohonan diterima LSPro?",
      options: [
        {
          label: "Tidak OK — Ditolak",
          description:
            "LSPro dapat menolak permohonan berdasarkan hasil tinjauan dan menyampaikan alasan penolakan dengan jelas.",
          type: "rejected",
        },
        {
          label: "OK — Diterima",
          description:
            "LSPro menerima permohonan dan melanjutkan proses sertifikasi.",
          type: "approved",
        },
      ],
    },
  },
  {
    title: "Penawaran biaya, kesepakatan, dan kontrak",
    description:
      "LSPro menyampaikan rincian biaya dan ketentuan sertifikasi. Setelah disepakati, perusahaan dan LSPro menandatangani kontrak kerja sama.",
  },
  {
    title: "Penjadwalan audit dan pengambilan sampel",
    description:
      "LSPro menetapkan tim audit, jadwal pemeriksaan pabrik, dan rencana pengambilan contoh produk.",
  },
  {
    title: "Audit proses produksi di pabrik",
    description:
      "Auditor menilai fasilitas, bahan baku, proses produksi, personel, pengendalian mutu, serta konsistensi penerapan persyaratan.",
  },
  {
    title: "Pengambilan dan pengujian sampel",
    description:
      "Sampel produk diambil secara resmi dan diuji oleh laboratorium yang memenuhi persyaratan untuk memastikan kesesuaian terhadap SNI.",
  },
  {
    title: "Tindak lanjut ketidaksesuaian",
    description:
      "Jika terdapat ketidaksesuaian pada hasil audit atau pengujian, perusahaan melakukan tindakan perbaikan sesuai ketentuan yang berlaku.",
  },
  {
    title: "Evaluasi akhir dan keputusan sertifikasi",
    description:
      "LSPro mengevaluasi hasil audit, pengujian, dan tindakan perbaikan untuk menetapkan keputusan pemberian sertifikasi.",
  },
  {
    title: "Penerbitan sertifikat dan proses SIINAS",
    description:
      "Jika seluruh persyaratan terpenuhi, LSPro menerbitkan sertifikat kesesuaian. Proses administrasi lanjutan melalui SIINAS dilakukan sesuai ketentuan produk.",
  },
  {
    title: "Surveilan berkala",
    description:
      "LSPro melakukan pengawasan berkala untuk memastikan konsistensi mutu dan kesesuaian produk selama masa sertifikasi.",
  },
];

const requiredDocuments = [
  "Formulir permohonan penambahan ruang lingkup produk atau merek",
  "Sertifikat produk yang masih berlaku",
  "Dokumen legalitas perusahaan dan produk",
  "Spesifikasi, tipe, model, merek, dan daftar produk yang diajukan",
  "Informasi proses produksi dan hasil pengujian yang relevan",
  "Dokumen pendukung sesuai persyaratan skema sertifikasi",
];

const surveillanceSteps = [
  { title: "Mulai", type: "terminal" },
  {
    title: "Penjadwalan surveilan sesuai skema sertifikasi",
    type: "step",
  },
  {
    title: "Pemberitahuan kepada klien dan konfirmasi pelaksanaan",
    type: "step",
  },
  {
    title: "Persiapan dan penetapan tim serta rencana evaluasi",
    type: "step",
  },
  {
    title: "Audit proses produksi dan sistem pengendalian mutu",
    type: "step",
  },
  {
    title: "Pengambilan contoh dan pengujian produk",
    type: "step",
  },
  {
    title: "Evaluasi hasil audit dan pengujian",
    type: "step",
  },
  {
    title: "Ada ketidaksesuaian?",
    type: "decision",
    note: "Jika ya, dilakukan tindakan perbaikan dan verifikasi efektivitas. Jika tidak, proses dilanjutkan ke tinjauan hasil surveilan.",
  },
  {
    title: "Tindakan perbaikan dan verifikasi efektivitas",
    type: "step",
  },
  {
    title: "Tinjauan hasil surveilan",
    type: "step",
  },
  {
    title: "Penetapan keputusan sertifikasi",
    type: "step",
  },
  {
    title: "Sertifikasi dipertahankan?",
    type: "decision",
    note: "Jika ya, hasil disampaikan kepada klien. Jika tidak, tindak lanjut dilakukan sesuai skema sertifikasi yang berlaku.",
  },
  {
    title: "Pemberitahuan hasil surveilan kepada klien",
    type: "step",
  },
  {
    title: "Pemutakhiran rekaman dan status sertifikasi",
    type: "step",
  },
  {
    title: "Penjadwalan surveilan berikutnya",
    type: "step",
  },
  { title: "Selesai", type: "terminal" },
];

const surveillanceStages = [
  {
    stage: "Penjadwalan",
    description:
      "Surveilan dijadwalkan sesuai skema sertifikasi dan masa berlaku sertifikat.",
  },
  {
    stage: "Pemberitahuan",
    description:
      "PSU menyampaikan jadwal kepada klien dan mengonfirmasi kesiapan pelaksanaan.",
  },
  {
    stage: "Persiapan",
    description:
      "Tim dan rencana evaluasi ditetapkan berdasarkan skema sertifikasi yang berlaku.",
  },
  {
    stage: "Audit atau evaluasi",
    description:
      "Proses produksi dan sistem pengendalian mutu diaudit sesuai persyaratan sertifikasi.",
  },
  {
    stage: "Pengambilan contoh dan pengujian",
    description:
      "Contoh produk diambil dan diuji apabila dipersyaratkan dalam skema sertifikasi.",
  },
  {
    stage: "Evaluasi hasil",
    description:
      "Hasil audit dan pengujian dievaluasi untuk menentukan kesesuaian terhadap persyaratan sertifikasi.",
  },
  {
    stage: "Tindakan perbaikan",
    description:
      "Jika ditemukan ketidaksesuaian, tindakan perbaikan dilaksanakan dan efektivitasnya diverifikasi.",
  },
  {
    stage: "Tinjauan hasil surveilan",
    description:
      "Hasil evaluasi surveilan ditinjau sebelum keputusan ditetapkan.",
  },
  {
    stage: "Keputusan sertifikasi",
    description:
      "PSU menetapkan apakah sertifikasi dapat dipertahankan berdasarkan hasil surveilan.",
  },
  {
    stage: "Pemberitahuan hasil",
    description:
      "PSU menyampaikan keputusan surveilan dan status sertifikasi kepada klien.",
  },
  {
    stage: "Pemutakhiran dan penjadwalan",
    description:
      "Rekaman dan status sertifikasi diperbarui, lalu surveilan berikutnya dijadwalkan.",
  },
];

const voluntaryInitialSteps = [
  { title: "Mulai", type: "terminal" },
  { title: "Pengajuan permohonan sertifikasi produk", type: "step" },
  {
    title: "Pemeriksaan kelengkapan dokumen permohonan",
    type: "step",
  },
  {
    title: "Dokumen lengkap?",
    type: "decision",
    note: "Jika belum lengkap, klien diminta melengkapi dokumen permohonan.",
  },
  {
    title: "Tinjauan permohonan dan penetapan ruang lingkup",
    type: "step",
  },
  {
    title: "Perjanjian sertifikasi dan penetapan rencana evaluasi",
    type: "step",
  },
  {
    title: "Evaluasi atau audit proses produksi dan sistem pengendalian mutu",
    type: "step",
  },
  {
    title: "Pengambilan contoh dan pengujian produk",
    type: "step",
  },
  {
    title: "Evaluasi hasil audit dan pengujian",
    type: "step",
  },
  {
    title: "Persyaratan terpenuhi?",
    type: "decision",
    note: "Jika belum terpenuhi, klien menindaklanjuti temuan dan hasilnya dievaluasi kembali.",
  },
  {
    title: "Tinjauan hasil evaluasi sertifikasi",
    type: "step",
  },
  {
    title: "Pengambilan keputusan sertifikasi",
    type: "step",
  },
  {
    title: "Sertifikasi disetujui?",
    type: "decision",
    note: "Jika tidak disetujui, PSU menyampaikan pemberitahuan keputusan kepada klien.",
  },
  {
    title: "Penerbitan sertifikat produk dan penggunaan lisensi",
    type: "step",
  },
  {
    title: "Pencatatan dalam direktori produk tersertifikasi",
    type: "step",
  },
  {
    title: "Surveilan berkala sesuai skema sertifikasi",
    type: "step",
  },
  { title: "Selesai", type: "terminal" },
];

const voluntaryInitialStages = [
  {
    stage: "Permohonan",
    description:
      "Klien mengajukan permohonan sertifikasi produk secara sukarela kepada PSU.",
  },
  {
    stage: "Pemeriksaan dokumen",
    description:
      "PSU memeriksa kelengkapan dokumen permohonan. Dokumen yang belum lengkap dikembalikan kepada klien untuk dilengkapi.",
  },
  {
    stage: "Tinjauan permohonan",
    description:
      "PSU meninjau permohonan dan menetapkan ruang lingkup sertifikasi yang diajukan.",
  },
  {
    stage: "Perjanjian sertifikasi",
    description:
      "Klien dan PSU menyepakati perjanjian sertifikasi serta rencana evaluasi.",
  },
  {
    stage: "Evaluasi proses produksi",
    description:
      "Proses produksi dan sistem pengendalian mutu dievaluasi sesuai skema sertifikasi.",
  },
  {
    stage: "Pengambilan contoh dan pengujian",
    description:
      "Contoh produk diambil dan diuji sesuai persyaratan skema sertifikasi.",
  },
  {
    stage: "Evaluasi hasil",
    description:
      "Hasil audit dan pengujian dievaluasi terhadap persyaratan sertifikasi. Temuan ditindaklanjuti sebelum proses dilanjutkan.",
  },
  {
    stage: "Tinjauan hasil evaluasi",
    description:
      "Hasil evaluasi ditinjau sebelum keputusan sertifikasi ditetapkan.",
  },
  {
    stage: "Keputusan sertifikasi",
    description:
      "Keputusan sertifikasi ditetapkan oleh personel yang berwenang dan tidak terlibat dalam evaluasi.",
  },
  {
    stage: "Penerbitan sertifikat",
    description:
      "Sertifikat produk dan lisensi penggunaan diterbitkan apabila persyaratan sertifikasi terpenuhi.",
  },
  {
    stage: "Pencatatan sertifikasi",
    description:
      "Produk yang telah tersertifikasi dicatat dalam direktori produk tersertifikasi.",
  },
  {
    stage: "Surveilan berkala",
    description:
      "Surveilan dilaksanakan secara berkala sesuai skema untuk memastikan persyaratan sertifikasi tetap dipenuhi.",
  },
];

export default function Tipe5() {
  const { t } = useLanguage();
  const [activeStage, setActiveStage] = useState(certificationStages[0]);

  return (
    <>
      <PageHeader
        title="Tipe 5"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Proses Sertifikasi" },
          { label: "Tipe 5", href: "/layanan/sertif-produk/tipe-5" },
        ]}
      />
      <section className="service-detail--tipe-5">
        <h1>{t("Tipe 5")}</h1>
        <div className="tipe-5__buttons" aria-label={t("Tahapan sertifikasi")}>
          {certificationStages.map((stage) => (
            <button
              key={stage}
              type="button"
              className="tipe-5__button"
              aria-pressed={stage === activeStage}
              onClick={() => setActiveStage(stage)}
            >
              {t(stage)}
            </button>
          ))}
        </div>
        {activeStage === "Sertifikasi Awal (Sukarela)" && (
          <div className="tipe-5__scope-content">
            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-voluntary-flow-title"
            >
              <h2 id="tipe-5-voluntary-flow-title">
                {t("Alur Sertifikasi Awal Tipe 5 (Produk Sukarela)")}
              </h2>
              <ol className="tipe-5__flow tipe-5__voluntary-flow">
                {voluntaryInitialSteps.map(({ title, type, note }, index) => {
                  const stepNumber =
                    voluntaryInitialSteps
                      .slice(0, index)
                      .filter((step) => step.type !== "terminal").length + 1;

                  return (
                    <li
                      key={title}
                      className={`tipe-5__flow-item tipe-5__flow-item--${type}`}
                    >
                      <div className="tipe-5__flow-node">
                        {type !== "terminal" && (
                          <span
                            className="tipe-5__flow-number"
                            aria-hidden="true"
                          >
                            {stepNumber}
                          </span>
                        )}
                        <span>{t(title)}</span>
                      </div>
                      {note && (
                        <p className="tipe-5__flow-note">
                          <strong>{t("Catatan keputusan")}:</strong> {t(note)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>

            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-voluntary-stages-title"
            >
              <h2 id="tipe-5-voluntary-stages-title">
                {t("Tahapan Sertifikasi Awal")}
              </h2>
              <div className="tipe-5__table-wrap">
                <table className="tipe-5__table">
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
          </div>
        )}
        {activeStage === "Sertifikasi Awal (SIINAS)" && (
          <div className="tipe-5__scope-content tipe-5__siinas-content">
            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-siinas-flow-title"
            >
              <h2 id="tipe-5-siinas-flow-title">
                {t("Alur Sertifikasi Awal Produk Wajib Tipe 5 melalui SIINAS")}
              </h2>
              <p className="tipe-5__siinas-intro">
                {t(
                  "Alur permohonan sertifikasi produk wajib melalui SIINAS Kementerian Perindustrian.",
                )}
              </p>
              <div className="tipe-5__siinas-start">
                <strong>{t("Mulai")}</strong>
                <span>
                  {t("Permohonan sertifikasi produk SNI melalui SIINAS")}
                </span>
              </div>
              <ol className="tipe-5__siinas-flow">
                {siinasSteps.map(({ title, description, decision }, index) => (
                  <li className="tipe-5__siinas-step" key={title}>
                    <article
                      className={`tipe-5__siinas-card${title === "Surveilan berkala" ? " tipe-5__siinas-card--surveillance" : ""}`}
                    >
                      <span
                        className="tipe-5__siinas-number"
                        aria-hidden="true"
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="tipe-5__siinas-card-copy">
                        <h3>{t(title)}</h3>
                        <p>{t(description)}</p>
                      </div>
                    </article>
                    {decision && (
                      <div className="tipe-5__siinas-decision">
                        <h3>{t(decision.question)}</h3>
                        <div className="tipe-5__siinas-branches">
                          {decision.options.map((option) => (
                            <article
                              className={`tipe-5__siinas-branch tipe-5__siinas-branch--${option.type}`}
                              key={option.label}
                            >
                              <h4>{t(option.label)}</h4>
                              <p>{t(option.description)}</p>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
              <div className="tipe-5__siinas-finish">
                <strong>{t("Selesai — Produk Tersertifikasi")}</strong>
                <span>
                  {t(
                    "Sertifikat dipelihara sesuai persyaratan dan ketentuan surveilan.",
                  )}
                </span>
              </div>
            </section>
          </div>
        )}
        {activeStage === "Perubahan Ruang Lingkup" && (
          <div className="tipe-5__scope-content">
            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-scope-flow-title"
            >
              <h2 id="tipe-5-scope-flow-title">
                {t("Alur Penambahan Ruang Lingkup Produk atau Merek")}
              </h2>
              <ol className="tipe-5__flow">
                {scopeChangeSteps.map(({ title, type, note }, index) => (
                  <li
                    key={title}
                    className={`tipe-5__flow-item tipe-5__flow-item--${type}`}
                  >
                    <div className="tipe-5__flow-node">
                      {type !== "terminal" && (
                        <span
                          className="tipe-5__flow-number"
                          aria-hidden="true"
                        >
                          {index}
                        </span>
                      )}
                      <span>{t(title)}</span>
                    </div>
                    {note && (
                      <p className="tipe-5__flow-note">
                        <strong>{t("Catatan keputusan")}:</strong> {t(note)}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>

            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-scope-stages-title"
            >
              <h2 id="tipe-5-scope-stages-title">
                {t("Tahapan dan Keterangan")}
              </h2>
              <div className="tipe-5__table-wrap">
                <table className="tipe-5__table">
                  <thead>
                    <tr>
                      <th scope="col">{t("Tahapan")}</th>
                      <th scope="col">{t("Keterangan utama")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scopeChangeStages.map(({ stage, description }, index) => (
                      <tr key={stage}>
                        <th scope="row">
                          {index + 1}. {t(stage)}
                        </th>
                        <td>{t(description)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section
              className="tipe-5__content-section tipe-5__documents"
              aria-labelledby="tipe-5-scope-documents-title"
            >
              <h2 id="tipe-5-scope-documents-title">
                {t("Dokumen yang dapat disiapkan")}
              </h2>
              <p>
                {t(
                  "Siapkan dokumen berikut untuk mendukung permohonan penambahan ruang lingkup. Persyaratan dapat berbeda sesuai jenis produk dan skema sertifikasi.",
                )}
              </p>
              <ul className="tipe-5__documents-list">
                {requiredDocuments.map((document, index) => (
                  <li className="tipe-5__document-item" key={document}>
                    <span
                      className="tipe-5__document-number"
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
        {activeStage === "Surveilan" && (
          <div className="tipe-5__scope-content tipe-5__surveillance-content">
            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-surveillance-flow-title"
            >
              <h2 id="tipe-5-surveillance-flow-title">
                {t("Alur Surveilan Produk")}
              </h2>
              <ol className="tipe-5__flow tipe-5__surveillance-flow">
                {surveillanceSteps.map(({ title, type, note }, index) => {
                  const stepNumber =
                    surveillanceSteps
                      .slice(0, index)
                      .filter((step) => step.type !== "terminal").length + 1;

                  return (
                    <li
                      key={title}
                      className={`tipe-5__flow-item tipe-5__flow-item--${type}`}
                    >
                      <div className="tipe-5__flow-node">
                        {type !== "terminal" && (
                          <span
                            className="tipe-5__flow-number"
                            aria-hidden="true"
                          >
                            {stepNumber}
                          </span>
                        )}
                        <span>{t(title)}</span>
                      </div>
                      {note && (
                        <p className="tipe-5__flow-note">
                          <strong>{t("Catatan keputusan")}:</strong> {t(note)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ol>
              <p className="tipe-5__surveillance-note">
                {t(
                  "Audit, pengambilan contoh, dan pengujian dilaksanakan sesuai skema sertifikasi yang berlaku.",
                )}
              </p>
            </section>

            <section
              className="tipe-5__content-section"
              aria-labelledby="tipe-5-surveillance-stages-title"
            >
              <h2 id="tipe-5-surveillance-stages-title">
                {t("Tahapan Surveilan")}
              </h2>
              <div className="tipe-5__table-wrap">
                <table className="tipe-5__table tipe-5__surveillance-table">
                  <thead>
                    <tr>
                      <th scope="col">{t("Tahapan")}</th>
                      <th scope="col">{t("Keterangan utama")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {surveillanceStages.map(({ stage, description }, index) => (
                      <tr key={stage}>
                        <th scope="row">
                          {index + 1}. {t(stage)}
                        </th>
                        <td>{t(description)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </section>
    </>
  );
}
