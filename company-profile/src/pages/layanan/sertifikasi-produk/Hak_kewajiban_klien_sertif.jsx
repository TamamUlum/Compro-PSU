import PageHeader from "../../../components/PageHeader";
import "./Hak_kewajiban_klien_sertif.css";
import LocalizedText from "../../../components/LocalizedText";

const hakKlien = [
  "Memperoleh layanan sertifikasi produk secara profesional, objektif, tidak diskriminatif, dan tidak berpihak sesuai persyaratan yang berlaku.",
  "Memperoleh sertifikat produk dan hak penggunaan tanda kesesuaian apabila telah memenuhi seluruh persyaratan sertifikasi dan ketentuan perizinan yang berlaku.",
  "Mendapatkan informasi mengenai prosedur, biaya, persyaratan, perubahan ketentuan sertifikasi, serta masa berlaku sertifikat.",
  "Mengajukan permohonan sertifikasi baru, perluasan, pengurangan, perubahan ruang lingkup, dan sertifikasi ulang sesuai ketentuan yang berlaku.",
  "Mengajukan keluhan, pengaduan, dan banding terhadap proses pelayanan maupun keputusan sertifikasi melalui mekanisme yang ditetapkan LSPro PSU.",
  "Memperoleh jaminan kerahasiaan informasi dan perlindungan data yang disampaikan selama proses sertifikasi sesuai ketentuan yang berlaku.",
  "Menggunakan dan mempublikasikan status sertifikasi secara benar sesuai ruang lingkup sertifikat dan ketentuan penggunaan tanda kesesuaian.",
];

const kewajibanKlien = [
  "Memenuhi seluruh persyaratan sertifikasi, standar produk, skema sertifikasi, perjanjian sertifikasi, serta peraturan perundang-undangan yang berlaku, termasuk setiap perubahan persyaratan yang telah dikomunikasikan.",
  "Menjamin produk yang disertifikasi senantiasa memenuhi persyaratan standar dan menjaga konsistensi mutu produk selama masa berlaku sertifikasi.",
  "Menyediakan dokumen, rekaman, informasi, fasilitas, personel, serta akses yang diperlukan untuk pelaksanaan evaluasi, audit, pengambilan contoh, pengujian, surveilans, penyelidikan keluhan, dan penyaksian oleh pihak berwenang apabila diperlukan.",
  "Menggunakan sertifikat, lisensi, dan tanda kesesuaian hanya untuk produk dalam ruang lingkup sertifikasi serta tidak membuat pernyataan atau publikasi yang menyesatkan.",
  "Menyelesaikan ketidaksesuaian dan melaksanakan tindakan perbaikan sesuai batas waktu yang ditetapkan LSPro PSU.",
  "Memberitahukan setiap perubahan legalitas, organisasi, lokasi produksi, desain produk, proses produksi, sistem manajemen, atau perubahan lainnya yang dapat memengaruhi pemenuhan persyaratan sertifikasi.",
  "Memelihara rekaman keluhan pelanggan terkait produk yang disertifikasi, melakukan investigasi dan tindakan perbaikan, serta menyediakan rekaman tersebut apabila diminta LSPro PSU.",
  "Menghentikan penggunaan sertifikat, tanda kesesuaian, dan seluruh publikasi terkait apabila sertifikasi ditangguhkan, dicabut, diakhiri, atau berakhir masa berlakunya, serta melaksanakan tindakan lain sesuai ketentuan LSPro PSU.",
  "Memenuhi kewajiban pembayaran biaya sertifikasi dan kegiatan terkait sesuai perjanjian yang disepakati.",
  "Menjaga keabsahan dokumen sertifikasi, memberikan salinan dokumen secara utuh atau sesuai ketentuan skema, serta menyediakan informasi distribusi produk apabila diperlukan untuk kegiatan sertifikasi atau pengawasan.",
];

function DaftarKetentuan({ items }) {
  return (
    <ol className="hak-kewajiban__list">
      {items.map((item, index) => (
        <LocalizedText as="li" key={index}>
          {item}
        </LocalizedText>
      ))}
    </ol>
  );
}

export default function Hakkewajibankliensertif() {
  return (
    <>
      <PageHeader
        title="Hak dan Kewajiban Klien"
        breadcrumbs={[
          { label: "Layanan" },
          { label: "Lembaga Sertifikasi Produk" },
          { label: "Hak dan Kewajiban Klien", href: "/layanan/sertif-produk/hak-kewajiban-klien" },
        ]}
      />
      <section className="service-detail--hak-kewajiban-klien-sertif">
      <header className="hak-kewajiban__header">
        <span className="hak-kewajiban__eyebrow">
          <LocalizedText>LEMBAGA SERTIFIKASI PRODUK (LSPro)</LocalizedText>
        </span>
        <LocalizedText as="h1">Hak dan Kewajiban Klien</LocalizedText>
        <LocalizedText as="p" className="hak-kewajiban__organization">
          PT Penilai Standar Uji (PSU)
        </LocalizedText>
      </header>

      <div className="hak-kewajiban__sections">
        <section className="hak-kewajiban__card" aria-labelledby="hak-klien">
          <div className="hak-kewajiban__section-heading">
            <LocalizedText as="h2" id="hak-klien">Hak Klien</LocalizedText>
          </div>
          <DaftarKetentuan items={hakKlien} />
        </section>

        <section className="hak-kewajiban__card" aria-labelledby="kewajiban-klien">
          <div className="hak-kewajiban__section-heading">
            <LocalizedText as="h2" id="kewajiban-klien">Kewajiban Klien</LocalizedText>
          </div>
          <DaftarKetentuan items={kewajibanKlien} />
        </section>
      </div>

      <aside className="hak-kewajiban__notice">
        <LocalizedText as="h2">Ketentuan Umum</LocalizedText>
        <LocalizedText as="p">
          Hak dan kewajiban ini berlaku bagi klien LSPro PT Penilai Standar Uji
          sesuai tahapan dan status sertifikasinya, serta menjadi bagian dari
          persyaratan dan perjanjian sertifikasi. Ketentuan lebih lanjut mengacu
          pada skema sertifikasi, prosedur LSPro PSU, dan peraturan
          perundang-undangan yang berlaku.
        </LocalizedText>
      </aside>
      </section>
    </>
  );
}
