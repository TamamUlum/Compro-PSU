import "../pengujian/Ruang_lingkup_penguji.css";
import LocalizedText from "../../../components/LocalizedText";
import { FaDownload } from "react-icons/fa";
import { useLanguage } from "../../../context/useLanguage";

const dataPengujian = [
  {
    bidang: "Fisika/Kimia",
    items: [
      {
        jenis: "Peralatan masak (Cookware) dari logam",
        hrefs: [
          "https://drive.google.com/file/d/1b9_6v_BGv0G24BIxGd-cEHXFyIssZAMi/view?usp=drive_link",
        ],
      },
      {
        jenis:
          "Peralatan makan dan perlengkapan masak dari baja tahan karat (stainless steel flatware)",
        hrefs: [
          "https://drive.google.com/file/d/1q7VeZeBzw8wpMBKN8zyq54NURmqdoGl9/view?usp=drive_link",
        ],
      },
    ],
  },
  {
    bidang: "Kimia/Fisika",
    items: [
      {
        jenis: "Pupuk SP 36",
        hrefs: [
          "https://drive.google.com/file/d/1c-gbC5RTXtwiXX4kSCMfG1fDXdz6ttz2/view?usp=drive_link",
        ],
      },
      {
        jenis: "Pupuk Fosfat Alam Untuk Pertanian",
        hrefs: [
          "https://drive.google.com/file/d/1Z3KUpg5nlIoLm2tItBOlwIQFnhJMIv1r/view?usp=drive_link",
        ],
      },
      {
        jenis: "Pupuk Kalium Klorida",
        hrefs: [
          "https://drive.google.com/file/d/1lN52_79scsfZOatD0_IS-hKrDNnCqETJ/view?usp=drive_link",
        ],
      },
      {
        jenis: "Pupuk Triple Super Fosfat / TSP",
        hrefs: [
          "https://drive.google.com/file/d/1J3tbnXVYoG8zZdhUUUS6SzNh1TZed-4l/view?usp=drive_link",
        ],
      },
    ],
  },
  {
    bidang: "Kimia",
    items: [
      {
        jenis: "Pupuk NPK Padat",
        hrefs: [
          "https://drive.google.com/file/d/1kHJbWZeP8gQ45M6kq1E7eqL4ESP8IjEu/view?usp=drive_link",
        ],
      },
      {
        jenis: "Pupuk Amonium Sulfat / ZA",
        hrefs: [
          "https://drive.google.com/file/d/1Rej8iVntCbUsnZAqfIGdwlhm6vk8QYJH/view?usp=drive_link",
        ],
      },
      {
        jenis: "Pupuk Urea",
        hrefs: [
          "https://drive.google.com/file/d/10OHiulnI8xvrrB_0g_ZEdJb84Yn5YTFx/view?usp=drive_link",
          // "https://drive.google.com/file/d/10OHiulnI8xvrrB_0g_ZEdJb84Yn5YTFx/view?usp=drive_link",
        ],
      },
    ],
  },
];

export default function Ruanglingkuppenguji() {
  const { t } = useLanguage();

  return (
    <section className="ruang-lingkup">
      <div className="ruang-lingkup__header">
        <LocalizedText as="h2">
          Ruang Lingkup Pengujian
        </LocalizedText>
      </div>

      <div className="ruang-lingkup__content">
        <div className="ruang-lingkup__table-wrapper">
          <table className="ruang-lingkup__table">
            <thead>
              <tr>
                <th><LocalizedText>Bidang Pengujian</LocalizedText></th>
                <th><LocalizedText>Bahan atau Produk yang Diuji</LocalizedText></th>
                <th><LocalizedText>Dokumen</LocalizedText></th>
              </tr>
            </thead>

            <tbody>
              {dataPengujian.map((kelompok) =>
                kelompok.items.map((item, index) => (
                  <tr key={`${kelompok.bidang}-${item.jenis}`}>
                    {index === 0 && (
                      <td
                        rowSpan={kelompok.items.length}
                        className="ruang-lingkup__bidang"
                      >
                        {t(kelompok.bidang)}
                      </td>
                    )}

                    <td className="ruang-lingkup__produk">
                      {t(item.jenis)}
                    </td>

                    <td className="ruang-lingkup__buku">
                      <div className="ruang-lingkup__sni">
                        {item.hrefs.map((href) => (
                          <a
                            key={href}
                            href={href}
                            className="ruang-lingkup__download"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label={`${t("Buka dokumen Google Drive untuk")} ${t(item.jenis)}`}
                            title={t("Buka Google Drive")}
                          >
                            <FaDownload aria-hidden="true" />
                          </a>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}