import "./Ruang_lingkup_sertif.css";
import LocalizedText from "../../../components/LocalizedText";
import { useLanguage } from "../../../context/useLanguage";
import { FaDownload } from "react-icons/fa";

// Tabel start
const dataSertifikasi = [
  {
    no: 1,
    skema: "Produk",
    kategori: "Pertanian dan Perkebunan (12)",
    subKategori: "Hasil pertanian dan perkebunan (biji kopi, beras) (12.02)",
    jenis: "Beras",
    standar: [{ nomor: "SNI 6128:2020", judul: "Beras" }],
    skemaSertifikasi: "PBSN No.4 Tahun 2021 Lampiran XVII",
    link: "https://drive.google.com/drive/folders/1FS2pCa_AcNXs8FrO_ef5WkQ2YQdtpyIt?usp=drive_link",
  },
  {
    no: 2,
    skema: "Produk",
    kategori: "Produk pertanian dan perkebunan  (12)",
    subKategori: "hasil pertanian dan perkebunan (biji kopi, beras) (12.02)  ",
    jenis: "Biji Kakao",
    standar: [
      { nomor: "SNI 2323:2008", judul: "Biji kakao" },
      { nomor: "SNI2323:2008/Amd1:2010", judul: "Biji kakao / Bijikakao -AMANDEMEN 1" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1RsMrEtJpxm1drGV5gb02mVfxH4U5Yr0u?usp=drive_link",
  },
  {
    no: 3,
    skema: "Produk",
    kategori: "Pertanian dan Perkebunan (12)",
    subKategori: "Hasil pertanian dan perkebunan (biji kopi, beras) (12.02)",
    jenis: "Biji kopi",
    standar: [
      { nomor: "SNI 2907:2008", judul: "Biji kopi" },
      // {
      //   judul: "Biji Kopi",
      // },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1FqqF-s6KLQaEfD20RQKkMHupQVtlp8tL?usp=drive_link",
  },
  {
    no: 4,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Serealia,umbi-umbiandan produkturunannya(15.01)",
    jenis: "Biskuit",
    standar: [
      { nomor: "SNI 2973:2011", judul: "Biskuit" },
      // {
      //   judul: "Biskuit",
      // },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1TB7e2jWwH82rvjAoIUo3T1nGAZWNHyIR?usp=drive_link",
  },
  {
    no: 5,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Gula, produkgula, pati(Sugar, sugarproducts,starch) (15.03)",
    jenis: "Gula kristal putih",
    standar: [
      { nomor: "SNI 3140.3:2020", judul: "Gula kristal - Bagian 3: Putih" },
      // {
      //   judul: "Gula kristal putih",
      // },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/16APPhiaGMlo_AwhVtjq9gkKddgcP7PNE?usp=drive_link",
  },
  {
    no: 6,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunanya (15)",
    subKategori: "Gula, produkgula, pati(Sugar, sugarproducts,starch) (15.03)",
    jenis: "Gula kristalrafinasi",
    standar: [
      { nomor: "SNI 3140.2-2018", judul: "Gula kristal - Bagian2: Rafinasi" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1EXOTc9AIJuTLk9mt_rAxWFB6VtgTyKtz?usp=drive_link",
  },
  {
    no: 7,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunanya (15)",
    subKategori: "Gula, produkgula, pati(Sugar, sugarproducts,starch) (15.03)",
    jenis: "Gula kristal mentah",
    standar: [
      { nomor: "SNI 3140.1:2020", judul: "Gula kristal mentah" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1Zwvmx2V3kC1Emx3FFZhJV-76dAonaCOC?usp=drive_link",
  },
  {
    no: 8,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunanya (15)",
    subKategori: "Kopi, teh,kakao, cokelat(Coffee, tea,cocoa) (15.06)",
    jenis: "Kopi instan",
    standar: [
      { nomor: "SNI 2983.3:2024", judul: "Kopi Instan" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/15QMwednz4NDMz9GYonKCDM3R69fM_O4T?usp=drive_link",
  },
  {
    no: 9,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Kopi, teh,kakao, cokelat(Coffee, tea,cocoa) (15.06)",
    jenis: "Kopi Sangrai dan Kopi Bubuk",
    standar: [
      { nomor: "SNI 8964: 2021", judul: "Kopi Sangrai dan Kopi Bubuk" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/15QMwednz4NDMz9GYonKCDM3R69fM_O4T?usp=drive_link",
  },
  {
    no: 10,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunanya (15)",
    subKategori: "Kopi, teh,kakao, cokelat(Coffee, tea,cocoa) (15.06)",
    jenis: "Kopi gula krimer dalam kemasan",
    standar: [
      { nomor: "SNI 7708:2011", judul: "Kopi gula krimer dalam kemasan" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1U_og0--iC2NI5S88OUGneTQpjegwOe-o?usp=drive_link",
  },
  {
    no: 11,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Kopi, teh,kakao, cokelat(Coffee, tea,cocoa) (15.06)",
    jenis: "Kakao Bubuk",
    standar: [
      { nomor: "SNI 3747:2024", judul: "Kakao Bubuk" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/15u0KjN07K03lXmakXlIW56lyQd5dGXnA?usp=drive_link",
  },
  {
    no: 12,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Minyak nabati,lemak, minyakbiji-bijian(Edible oils,fats, oilseeds)(15.07)",
    jenis: "Minyak goreng sawit",
    standar: [
      { nomor: "SNI 7709:2019", judul: "Minyak goreng sawit" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1un-jr7sOfFcz4Z-LFoyNDncsUq5ksqIF?usp=drive_link",
  },
  {
    no: 13,
    skema: "Produk",
    kategori: "Produk Tanaman dan Turunannya (15)",
    subKategori: "Minyak nabati,lemak, minyak biji-bijian(Edible oils,fats, oilseeds)(15.07)",
    jenis: "Minyak goreng",
    standar: [
      { nomor: "SNI 3741:2013", judul: "Minyak goreng" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1XTDS9EalbCsJ6EKXSILTdKLv5OzmrSai?usp=drive_link",
  },
  {
    no: 14,
    skema: "Produk",
    kategori: "Produk Pangan Lainnya (17)",
    subKategori: "Minuman(Beverages,sirup, limun)(17.01)",
    jenis: "Air mineral",
    standar: [
      { nomor: "SNI 3553:2015", judul: "Air mineral" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1mPOM3bYjh1XqreRNmxU8EsWWhD9pUGu6?usp=drive_link",
  },
  {
    no: 15,
    skema: "Produk",
    kategori: "Produk Pangan Lainnya (17)",
    subKategori: "Minuman(Beverages,sirup, limun)(17.01)",
    jenis: "Air demineral",
    standar: [
      { nomor: "SNI 6241:2023", judul: "Air demineral" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1pLWyuVqF0FkjeQGASvl7wjvamaxREDBk?usp=drive_link",
  },
  {
    no: 16,
    skema: "Produk",
    kategori: "Produk Pangan Lainnya (17)",
    subKategori: "Minuman(Beverages,sirup, limun)(17.01)",
    jenis: "Air mineral alami",
    standar: [
      { nomor: "SNI 6242:2023", judul: "Air mineral alami" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1IaoZoI59VhVzRSbV4Z0fWTXvInG3SvEx?usp=drive_link",
  },
  {
    no: 17,
    skema: "Produk",
    kategori: "Produk Pangan Lainnya (17)",
    subKategori: "Minuman(Beverages,sirup,limun) (17.01)",
    jenis: "Air minum embun",
    standar: [
      { nomor: "SNI 7812:2021", judul: "Air minum embun" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1f-Y9_R_HGDr-KG0ICkl3YUoxBOZz-jri?usp=drive_link",
  },
  {
    no: 18,
    skema: "Produk",
    kategori: "Bahan danProduk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk super fosfat SP - 36",
    standar: [
      { nomor: "SNI 02-3769-2005", judul: "Pupuk SP-36" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1qOFWesGrw9_AcsSe9hyO-yVHkK05ueZD?usp=drive_link",
  },
  {
    no: 19,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk fosfat alam untuk pertanian",
    standar: [
      { nomor: "SNI 02-3776-2005", judul: "Pupuk fosfat alam untuk pertanian" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1zwWquLmgqMIfiqIfFA7l1Z7CCKQSzuH5?usp=drive_link",
  },
  {
    no: 20,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk kalium klorida",
    standar: [
      { nomor: "SNI 02-2805-2005", judul: "Pupuk kalium klorida" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1X0fo08E7uW77PmjbwJ-7OzVXpuLwdP89?usp=drive_link",
  },
  {
    no: 21,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk tripel super fosfat /TSP",
    standar: [
      { nomor: "SNI 02-0086-2005", judul: "Pupuk tripel super fosfat /TSP" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1UnbORBJY8J3NsDUCUGNQnaykKTtaFUJP?usp=drive_link",
  },
  {
    no: 22,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk NPK padat",
    standar: [
      { nomor: "SNI 2803:2024", judul: "Pupuk NPK padat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1kbaPJVonlUOYEpBkOjM7TCznDqWeBzur?usp=drive_link",
  },
  {
    no: 23,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia(18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk amonium sulfat (ZA)",
    standar: [
      { nomor: "SNI 02-1760-2005", judul: "PPupuk amonium sulfat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1rnSK8JKzX1vmHFS1-8ft-qeG7vUeiSHJ?usp=drive_link",
  },
  {
    no: 24,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk urea",
    standar: [
      { nomor: "SNI 2801:2010", judul: "Pupuk urea" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1rnSK8JKzX1vmHFS1-8ft-qeG7vUeiSHJ?usp=drive_link",
  },
  {
    no: 25,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk mono amonium fosfat (MAP)",
    standar: [
      { nomor: "SNI 02-2810-2005", judul: "Pupuk monoamonium fosfat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1PD4-pa8CbWRHYtZnrJ6ajXqfr5gNGDse?usp=drive_link",
  },
  {
    no: 26,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk diamonium fosfat",
    standar: [
      { nomor: "SNI 02-2858-2005", judul: "Pupuk diamonium fosfat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1Bh2KSjg7IlewMuo2wlQmTqFbxaYEl7by?usp=drive_link",
  },
  {
    no: 27,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk urea amonium fosfat",
    standar: [
      { nomor: "SNI 02-2811-2005", judul: "Pupuk urea amonium fosfat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1HBrjTMmLZyqgPJFJ7ypf164PZUPeIdGs?usp=drive_link",
  },
  {
    no: 28,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk tripel Super fosfat plus-Zn",
    standar: [
      { nomor: "SNI 02-2800-2005", judul: "Pupuk tripel super fosfat plus-Zn (TSP-36 Plus Zn)" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1jxgZ0DidIOnInLnJIbVbyXr2cSQon-S_?usp=drive_link",
  },
  {
    no: 29,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk super fosfat plus-Zn",
    standar: [
      { nomor: "SNI 02-4873-1998", judul: "Pupuk super fosfat plus-Zn (SP-36 Plus-Zn)" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1suPV-fLufaiCoj5g6ofSYJ_0g4XZHvZV?usp=drive_link",
  },
  {
    no: 30,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk super fosfat tunggal",
    standar: [
      { nomor: "SNI 6246:2010", judul: "Pupuk super fosfat tunggal (SP-18)" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1PIJTGnD_KdiVFzazcgYGdY8H56-iggWI?usp=drive_link",
  },
  {
    no: 30,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk dolomit",
    standar: [
      { nomor: "SNI 02-2804-2005", judul: "Pupuk dolomit" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1VCtp-TBpiOVMvgsMnq-VBIWFSogtkSNw?usp=drive_link",
  },
  {
    no: 31,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk borat",
    standar: [
      { nomor: "SNI 02-4959-1999", judul: "Pupuk borat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1iKgdeOYNWtwzZGDqbQbhOCPv04hagAZh?usp=drive_link",
  },
  {
    no: 32,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk",
    standar: [
      { nomor: "SNI 02-4959-1999", judul: "Pupuk borat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1iUSuH6QGNHuqdeLleZ49mn6d3enCmsog?usp=drive_link",
  },
  {
    no: 33,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk amonium klorida",
    standar: [
      { nomor: "SNI 02-2581-2005", judul: "Pupuk amonium klorida" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1r2-LBtjvY30SuD6qRARRR8hK1cdtSEqm?usp=drive_link",
  },
  {
    no: 34,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk kiseret",
    standar: [
      { nomor: "SNI 02-2807-1992", judul: "Pupuk kiseret" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1r1pnoPhuFmeUzVlsclI0kO2P72Mykuil?usp=drive_link",
  },
  {
    no: 35,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk kalium sulfat",
    standar: [
      { nomor: "SNI 2809:2014", judul: "Pupuk kalium sulfat" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1u1SBMxWHo4nwU10K0cZH6LBsVtAhyF1Q?usp=drive_link",
  },
  {
    no: 36,
    skema: "Produk",
    kategori: "Bahan dan Produk Kimia (18)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pupuk cair hasil samping proses asam amino (Haspramin)",
    standar: [
      { nomor: "SNI 4958:2015", judul: "Pupuk cair hasil samping proses asam amino (Haspramin)" },
    ],
    skemaSertifikasi: "PBSN No. 4 Tahun 2021 Lampiran XIII",
    link: "https://drive.google.com/drive/folders/1Tjx5km0wn5ALU6TzvshBBYzwWHNu9zHz?usp=drive_link",
  },
  {
    no: 37,
    skema: "Produk",
    kategori: "ServicesCertification (27)",
    subKategori: "Pupuk (18.07)",
    jenis: "Pasar rakyat",
    standar: [
      { nomor: "SNI 8152:2021", judul: "Pasar rakyat" },
    ],
    skemaSertifikasi: "Peraturan BSN No. 7Tahun 2024",
    link: "https://drive.google.com/drive/folders/1pcuhRaz78kQVWLFr-Bs5XdpSOUp_LCv-?usp=drive_link",
  },
  // Tabel end
];

export default function Ruanglingkuppenguji() {
  const { lang, t } = useLanguage();

  return (
    <section className="ruang-lingkup">
      <div className="ruang-lingkup__header">
        <LocalizedText as="h1">
          Ruang Lingkup Sertifikasi Produk
        </LocalizedText>
      </div>

      <div className="ruang-lingkup__content">
        <div className="ruang-lingkup__table-wrapper">
          <table className="ruang-lingkup__table" lang={lang}>
            <thead>
              <tr>
                <th>{t("No")}</th>
                <th>{t("Skema")}</th>
                <th>{t("Kategori")}</th>
                <th>{t("Sub Kategori")}</th>
                <th>{t("Jenis Produk/Proses/Jasa")}</th>
                <th>{t("Nomor Acuan Standar")}</th>
                <th>{t("Judul Acuan Standar")}</th>
                <th>{t("Skema Sertifikasi")}</th>
              </tr>
            </thead>

            <tbody>
              {dataSertifikasi.map((item, itemIndex) =>
                item.standar.map((standar, index) => (
                  <tr key={`${item.no}-${itemIndex}-${standar.nomor}`}>
                    {index === 0 && (
                      <>
                        <td
                          className="ruang-lingkup__no"
                          rowSpan={item.standar.length}
                        >
                          {item.no}.
                        </td>
                        <td rowSpan={item.standar.length}>{t(item.skema)}</td>
                        <td rowSpan={item.standar.length}>{t(item.kategori)}</td>
                        <td rowSpan={item.standar.length}>{t(item.subKategori)}</td>
                        <td rowSpan={item.standar.length}>{t(item.jenis)}</td>
                      </>
                    )}

                    <td>{standar.nomor}</td>
                    <td>{t(standar.judul)}</td>

                    {index === 0 && (
                      <td rowSpan={item.standar.length}>
                        <div className="ruang-lingkup__certification">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ruang-lingkup__download"
                            aria-label={`${t("Download dokumen")} No. ${item.no}`}
                            title={`${t("Download")} No. ${item.no}`}
                          >
                            <FaDownload />
                          </a>
                        </div>
                      </td>
                    )}
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}