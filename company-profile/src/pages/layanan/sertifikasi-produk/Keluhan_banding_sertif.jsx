import PageHeader from "../../../components/PageHeader";
import "./Keluhan_banding_sertif.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";

const sections = [
  {
    title: "Keluhan / Pengaduan",
    id: "keluhan-pengaduan",
    items: [
      "Setiap klien maupun pihak berkepentingan berhak menyampaikan keluhan atau pengaduan terkait pelayanan, kompetensi dan perilaku personel, proses sertifikasi, maupun kegiatan sertifikasi produk yang dilaksanakan oleh LSPro PSU.",
      "Keluhan disampaikan secara tertulis melalui saluran komunikasi resmi LSPro PSU dengan mencantumkan identitas pengadu, uraian permasalahan, serta bukti pendukung apabila tersedia.",
      "LSPro PSU akan menerima, mencatat, memvalidasi, mengevaluasi, dan menindaklanjuti setiap keluhan secara objektif, tidak berpihak, serta menjaga kerahasiaan informasi pihak terkait.",
      "Penanganan keluhan dilakukan oleh personel yang tidak terlibat dalam kegiatan yang menjadi objek keluhan. Hasil penanganan akan disampaikan kepada pihak pengadu sesuai prosedur yang berlaku.",
      "Penyampaian keluhan tidak akan mengakibatkan tindakan diskriminatif terhadap pihak yang mengajukan pengaduan.",
    ],
  },
  {
    title: "Tanggung Gugat",
    id: "tanggung-gugat",
    items: [
      "LSPro PSU bertanggung jawab atas pelaksanaan kegiatan sertifikasi produk sesuai ruang lingkup layanan, perjanjian sertifikasi, dan peraturan perundang-undangan yang berlaku.",
      "LSPro PSU memiliki pengaturan yang memadai untuk memenuhi tanggung gugat yang timbul dari kegiatan operasional sertifikasi, melalui mekanisme keuangan, asuransi, atau bentuk pengaturan lain yang sesuai.",
      "Tanggung jawab atas mutu, keamanan, proses produksi, dan kesesuaian produk yang diedarkan tetap berada pada produsen atau pemegang sertifikat sesuai ketentuan peraturan perundang-undangan.",
      "Penyelesaian perselisihan atau tuntutan hukum terkait kegiatan sertifikasi dilakukan berdasarkan perjanjian yang berlaku dan ketentuan hukum di Indonesia.",
    ],
  },
  {
    title: "Banding",
    id: "banding",
    items: [
      "Klien berhak mengajukan banding terhadap keputusan sertifikasi LSPro PSU, termasuk penolakan, pengurangan ruang lingkup, penangguhan, atau pencabutan sertifikat produk.",
      {
        id: (
          <>
            Banding diajukan secara tertulis kepada LSPro PSU paling lambat{" "}
            <strong>30 (tiga puluh) hari kalender</strong> sejak diterimanya
            pemberitahuan keputusan sertifikasi, dengan menyertakan alasan serta
            bukti pendukung yang relevan.
          </>
        ),
        en: (
          <>
            Appeals must be submitted in writing to LSPro PSU no later than{" "}
            <strong>30 (thirty) calendar days</strong> after receiving the
            certification decision notice, with relevant reasons and supporting
            evidence.
          </>
        ),
      },
      "LSPro PSU akan menerima, mencatat, memvalidasi, dan mengevaluasi setiap permohonan banding sesuai prosedur yang ditetapkan.",
      "Penanganan dan keputusan banding dilakukan oleh personel atau panel yang kompeten, independen, tidak berpihak, dan tidak terlibat dalam kegiatan evaluasi maupun pengambilan keputusan sertifikasi yang menjadi objek banding.",
      "LSPro PSU bertanggung jawab atas seluruh keputusan dalam proses penanganan banding dan akan menyampaikan perkembangan serta hasil keputusan secara tertulis kepada pemohon banding.",
      "Pengajuan, pemeriksaan, dan keputusan banding tidak boleh mengakibatkan tindakan diskriminatif terhadap pemohon banding.",
      "Keputusan banding disampaikan sebagai penyelesaian melalui mekanisme internal LSPro PSU, tanpa menghilangkan hak para pihak untuk menempuh upaya hukum sesuai peraturan perundang-undangan yang berlaku.",
    ],
  },
];

function DaftarKetentuan({ items, lang }) {
  return (
    <ol className="keluhan-banding__list">
      {items.map((item, index) => (
        <li key={index}>
          {typeof item === "string" ? (
            <LocalizedText>{item}</LocalizedText>
          ) : (
            item[lang]
          )}
        </li>
      ))}
    </ol>
  );
}

export default function Keluhanbandingsertif() {
  const { lang } = useLanguage();

  return (
    <>
      <PageHeader
        title="Keluhan dan Banding"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Keluhan dan Banding", href: "/layanan/sertif-produk/keluhan-banding" },
        ]}
      />
      <section className="service-detail--keluhan-banding-sertif">
      <header className="keluhan-banding__header">
        <span className="keluhan-banding__eyebrow">
          <LocalizedText>LEMBAGA SERTIFIKASI PRODUK (LSPro)</LocalizedText>
        </span>
        <LocalizedText as="h1">
          <span>Tanggung Gugat, Keluhan dan Banding</span>
        </LocalizedText>
        <LocalizedText as="p" className="keluhan-banding__organization">
          PT Penilai Standar Uji (PSU)
        </LocalizedText>
      </header>

      <div className="keluhan-banding__sections">
        {sections.map((section) => (
          <section
            className="keluhan-banding__card"
            aria-labelledby={section.id}
            key={section.id}
          >
            <div className="keluhan-banding__section-heading">
              <LocalizedText as="h2" id={section.id}>
                {section.title}
              </LocalizedText>
            </div>
            <DaftarKetentuan items={section.items} lang={lang} />
          </section>
        ))}
      </div>

      <section
        className="keluhan-banding__contact"
        aria-labelledby="penyampaian-keluhan-banding"
      >
        <div className="keluhan-banding__contact-heading">
          <LocalizedText as="h2" id="penyampaian-keluhan-banding">
            Penyampaian Keluhan dan Banding
          </LocalizedText>
          <LocalizedText as="p">
            Keluhan, pengaduan, dan banding dapat disampaikan secara tertulis
            kepada:
          </LocalizedText>
        </div>

        <address className="keluhan-banding__contact-details">
          <LocalizedText as="h3" className="keluhan-banding__contact-name">
            LSPro PT Penilai Standar Uji (PSU)
          </LocalizedText>
          <p>
            <LocalizedText as="strong">Ditujukan kepada</LocalizedText>
            <LocalizedText as="span">
              Kepala LSPro / Penanggung Jawab Penanganan Keluhan dan Banding
            </LocalizedText>
          </p>
          <p>
            <LocalizedText as="strong">Email</LocalizedText>
            <a href="mailto:psuindonesia.info@gmail.com">
              psuindonesia.info@gmail.com
            </a>
          </p>
          <p>
            <LocalizedText as="strong">Alamat</LocalizedText>
            <LocalizedText as="span">
              Jalan Cipinang Muara 1 No. 21, Kelurahan Pondok Bambu, Kecamatan
              Duren Sawit, Jakarta Timur, DKI Jakarta
            </LocalizedText>
          </p>
          <p>
            <LocalizedText as="strong">Instagram</LocalizedText>
            <a
              href="https://instagram.com/penilaistandaruji"
              target="_blank"
              rel="noreferrer"
            >
              @penilaistandaruji
            </a>
          </p>
        </address>

        <LocalizedText as="p" className="keluhan-banding__commitment">
          Setiap keluhan dan banding akan ditangani secara profesional,
          objektif, transparan, dan menjaga kerahasiaan sesuai prosedur LSPro
          PSU.
        </LocalizedText>
      </section>
      </section>
    </>
  );
}
