import PageHeader from "../../../components/PageHeader";
import "./Permohonan_sertifikasi.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";

const tahapanPermohonan = [
  {
    judul: "1. Permohonan Sertifikasi Produk",
    paragraf: [
      "Calon klien mengajukan permohonan sertifikasi produk kepada LSPro PT Penilai Standar Uji dengan mengisi formulir permohonan dan melampirkan dokumen persyaratan sesuai jenis produk, standar acuan, serta skema sertifikasi yang diajukan.",
      "Untuk produk yang diwajibkan melalui Sistem Informasi Industri Nasional (SIINas), permohonan dilakukan melalui akun SIINas perusahaan sesuai mekanisme yang ditetapkan Kementerian Perindustrian.",
    ],
  },
  {
    judul: "2. Kajian Permohonan",
    paragraf: [
      "LSPro PSU melakukan kajian terhadap permohonan untuk memastikan kelengkapan dokumen, kesesuaian ruang lingkup, ketersediaan personel kompeten, kemampuan pelaksanaan evaluasi, serta persyaratan sertifikasi yang berlaku.",
      "Apabila permohonan memenuhi persyaratan, proses dapat dilanjutkan ke tahap penawaran dan perjanjian sertifikasi.",
    ],
  },
  {
    judul: "3. Penawaran dan Perjanjian Sertifikasi",
    paragraf: [
      "LSPro PSU menyampaikan penawaran biaya berdasarkan jenis produk, skema sertifikasi, kebutuhan audit, pengambilan contoh, pengujian, serta kegiatan evaluasi lainnya.",
      "Setelah penawaran disetujui, pemohon dan LSPro PSU melaksanakan perjanjian sertifikasi sesuai ketentuan yang berlaku.",
    ],
  },
  {
    judul: "4. Evaluasi Proses Produksi dan Sistem Manajemen Mutu",
    paragraf: [
      "Untuk skema sertifikasi yang mensyaratkan audit, LSPro PSU melaksanakan evaluasi terhadap proses produksi dan/atau sistem manajemen mutu guna memastikan kemampuan produsen menghasilkan produk yang konsisten memenuhi persyaratan standar.",
      "Evaluasi dapat mencakup pemeriksaan dokumen, verifikasi proses produksi, pengendalian mutu, serta pemeriksaan penerapan sistem manajemen di lokasi produksi.",
    ],
  },
  {
    judul: "5. Pengambilan Contoh Produk",
    paragraf: [
      "Pengambilan contoh produk dilaksanakan oleh Petugas Pengambil Contoh (PPC) yang ditugaskan sesuai persyaratan skema sertifikasi.",
      "Contoh produk diidentifikasi, diberi label, dan didokumentasikan dalam Berita Acara Pengambilan Contoh untuk selanjutnya dilakukan pengujian pada laboratorium yang memenuhi persyaratan.",
    ],
  },
  {
    judul: "6. Pengujian Produk",
    paragraf: [
      "Contoh produk diuji berdasarkan parameter dan metode pengujian yang dipersyaratkan dalam standar acuan.",
      "Apabila hasil pengujian menunjukkan ketidaksesuaian, tindak lanjut dilakukan sesuai ketentuan skema sertifikasi, termasuk kemungkinan pengujian ulang apabila diperbolehkan.",
    ],
  },
  {
    judul: "7. Tinjauan dan Keputusan Sertifikasi",
    paragraf: [
      "LSPro PSU melakukan tinjauan terhadap seluruh hasil evaluasi, termasuk dokumen administrasi, hasil audit atau inspeksi, serta laporan hasil pengujian.",
      "Keputusan sertifikasi dilakukan oleh personel yang berwenang dan tidak terlibat dalam kegiatan evaluasi terhadap permohonan tersebut.",
    ],
  },
  {
    judul: "8. Penerbitan Sertifikat Produk",
    paragraf: [
      "Sertifikat produk diterbitkan apabila seluruh persyaratan sertifikasi telah dipenuhi dan keputusan sertifikasi menyatakan bahwa produk memenuhi persyaratan yang ditetapkan.",
      "Masa berlaku sertifikat ditentukan berdasarkan skema sertifikasi dan ketentuan regulasi yang berlaku.",
    ],
  },
  {
    judul: "9. Perjanjian Lisensi dan Penggunaan Tanda Kesesuaian",
    paragraf: [
      "Pemegang sertifikat wajib mematuhi ketentuan penggunaan sertifikat, lisensi, dan tanda kesesuaian.",
      "Penggunaan tanda SNI atau tanda kesesuaian lainnya hanya dapat dilakukan sesuai hak dan ketentuan yang diberikan berdasarkan peraturan yang berlaku.",
    ],
  },
  {
    judul: "10. Surveilans Sertifikasi Produk",
    paragraf: [
      "Untuk skema sertifikasi yang mensyaratkan surveilans, LSPro PSU melaksanakan pemantauan berkala guna memastikan produk yang telah disertifikasi tetap memenuhi persyaratan.",
      "Surveilans dapat mencakup audit proses produksi, pengambilan contoh, pengujian produk, serta evaluasi tindak lanjut atas ketidaksesuaian.",
    ],
  },
  {
    judul: "11. Sertifikasi Ulang",
    paragraf: [
      "Pemegang sertifikat yang akan melanjutkan sertifikasi setelah berakhirnya masa berlaku sertifikat dapat mengajukan sertifikasi ulang sesuai ketentuan skema yang berlaku.",
    ],
  },
  {
    judul: "12. Perluasan dan Pengurangan Ruang Lingkup Sertifikasi",
    paragraf: [
      "Pemegang sertifikat dapat mengajukan perubahan ruang lingkup sertifikasi, termasuk penambahan atau pengurangan merek, tipe, jenis, atau produk sesuai ketentuan yang berlaku.",
      "LSPro PSU melakukan kajian untuk menentukan kegiatan evaluasi tambahan yang diperlukan sebelum menetapkan keputusan perubahan ruang lingkup.",
    ],
  },
  {
    judul: "13. Pembekuan, Pencabutan, dan Pengakhiran Sertifikasi",
    paragraf: [
      "LSPro PSU dapat melakukan pembekuan, pencabutan, atau pengakhiran sertifikasi apabila pemegang sertifikat tidak memenuhi persyaratan sertifikasi, menyalahgunakan sertifikat atau tanda kesesuaian, maupun berdasarkan alasan lain sesuai ketentuan yang berlaku.",
      "Setiap keputusan disampaikan kepada pemegang sertifikat melalui pemberitahuan resmi.",
    ],
  },
  {
    judul: "14. Kerahasiaan Informasi",
    paragraf: [
      "LSPro PSU menjaga kerahasiaan seluruh informasi yang diperoleh selama proses sertifikasi, kecuali informasi yang wajib diungkapkan berdasarkan ketentuan hukum, peraturan, atau persyaratan akreditasi.",
    ],
  },
  {
    judul: "15. Keluhan dan Banding",
    paragraf: [
      "Pemohon dan pemegang sertifikat berhak menyampaikan keluhan terhadap pelayanan sertifikasi maupun mengajukan banding atas keputusan sertifikasi.",
      "Setiap keluhan dan banding ditangani secara objektif, tidak berpihak, dan sesuai prosedur yang ditetapkan LSPro PSU.",
    ],
  },
  {
    judul: "16. Biaya Sertifikasi",
    paragraf: [
      "Biaya sertifikasi ditentukan berdasarkan ruang lingkup produk, skema sertifikasi, lokasi produksi, kebutuhan audit, pengambilan contoh, pengujian, serta kegiatan sertifikasi lainnya.",
      "Rincian biaya disampaikan kepada pemohon melalui penawaran resmi LSPro PSU sebelum pelaksanaan kegiatan sertifikasi.",
    ],
  },
];

export default function Permohonansertifikasi() {
  const { t } = useLanguage();

  return (
    <>
      <PageHeader
        title="Permohonan Sertifikasi"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Permohonan Sertifikasi", href: "/layanan/sertif-produk/permohonan-sertifikasi" },
        ]}
      />
      <section className="service-detail--permohonan-sertifikasi">
        <article className="permohonan-sertifikasi">
          <header className="permohonan-sertifikasi__header">
            <span className="permohonan-sertifikasi__eyebrow">
              <LocalizedText>LEMBAGA SERTIFIKASI PRODUK (LSPro)</LocalizedText>
            </span>
            <LocalizedText as="h1">
              Tata Cara Permohonan Sertifikat Produk
            </LocalizedText>
            <LocalizedText as="p" className="permohonan-sertifikasi__organization">
              PT Penilai Standar Uji (PSU)
            </LocalizedText>
            <img
              className="permohonan-sertifikasi__process-image"
              src={`${import.meta.env.BASE_URL}Alur_Proses_Sertifikasi_Produk.jpg`}
              alt={t("Alur Proses Sertifikasi Produk")}
            />
          </header>

          <div className="permohonan-sertifikasi__content">
            <LocalizedText as="p" className="permohonan-sertifikasi__intro">
              LSPro PT Penilai Standar Uji memberikan pelayanan sertifikasi
              produk berdasarkan persyaratan SNI, skema sertifikasi, serta
              peraturan perundang-undangan yang berlaku dengan mengutamakan
              kompetensi, ketidakberpihakan, kerahasiaan, dan transparansi.
            </LocalizedText>

            <div className="permohonan-sertifikasi__steps">
              {tahapanPermohonan.map(({ judul, paragraf }) => (
                <section className="permohonan-sertifikasi__step" key={judul}>
                  <LocalizedText as="h2">{judul}</LocalizedText>
                  {paragraf.map((teks) => (
                    <LocalizedText as="p" key={teks}>
                      {teks}
                    </LocalizedText>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </article>
      </section>
    </>
  );
}
