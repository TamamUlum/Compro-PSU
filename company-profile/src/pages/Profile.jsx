import "./Profile.css";
import { useEffect } from "react";
import PageHeader from "../components/PageHeader";
import { useLanguage } from "../context/useLanguage";

const ABOUT_IMAGE = "/Logo_PSU_banner1.webp";
const VISIMISI_IMAGE = `${import.meta.env.BASE_URL}vis-misi-2026.jpeg`;

export default function Profile() {
  const { lang, t } = useLanguage();

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );

    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const timelineData = [
    {
      period: "2016",
      titleId: "Akreditasi Pertama Lembaga Sertifikasi Produk (LSPro)",
      titleEn: "First Accreditation of the Product Certification Body (LSPro)",
      descId: <>Pada tahun 2016, PT Penilai Standar Nasional (PSN) untuk pertama kalinya memperoleh akreditasi dari <strong>Komite Akreditasi Nasional (KAN)</strong> sebagai <strong>Lembaga Sertifikasi Produk (LSPro)</strong>, berdasarkan standar <strong>SNI ISO/IEC 17065:2012</strong>.<br /><br />Pencapaian ini menjadi <strong>tonggak penting</strong> dalam perjalanan perusahaan untuk memberikan <strong>layanan sertifikasi produk secara kompeten, independen, dan tidak berpihak</strong>.<br /><br />Sejak memperoleh akreditasi pertama, LSPro terus mempertahankan status akreditasinya hingga saat ini melalui pemenuhan persyaratan akreditasi, evaluasi berkala, dan peningkatan berkelanjutan.</>,
      descEn: <>In 2016, PT Penilai Standar Nasional (PSN) received its first accreditation from the National Accreditation Committee (KAN) as a Product Certification Body (LSPro), based on <strong>SNI ISO/IEC 17065:2012</strong>.<br /><br />This achievement was an important milestone in the company's journey to provide competent, independent, and impartial product certification services.<br /><br />Since receiving its first accreditation, LSPro has maintained its accreditation status through compliance with accreditation requirements, periodic evaluations, and continuous improvement.</>
    },
    {
      period: "2021",
      titleId: "Akreditasi Laboratorium Pengujian",
      titleEn: "Testing Laboratory Accreditation",
      descId: <>Pada tahun 2021, PT Penilai Standar Nasional (PSN) kembali mencatat pencapaian penting dengan memperoleh akreditasi dari <strong>Komite Akreditasi Nasional (KAN)</strong> untuk <strong>Laboratorium Pengujian</strong> berdasarkan <strong>SNI ISO/IEC 17025:2017</strong>.<br /><br />Akreditasi ini menjadi bukti pengakuan terhadap kompetensi laboratorium dalam melaksanakan kegiatan pengujian sesuai ruang lingkup yang ditetapkan.<br /><br />Kehadiran laboratorium pengujian memperkuat layanan perusahaan dalam mendukung kebutuhan industri terhadap hasil pengujian yang objektif, akurat, telusur, dan dapat dipertanggungjawabkan secara teknis.</>,
      descEn: <>In 2021, PT Penilai Standar Nasional (PSN) marked another important achievement by receiving National Accreditation Committee (KAN) accreditation for its Testing Laboratory based on SNI ISO/IEC 17025:2017.<br /><br />This accreditation recognizes the laboratory's competence in conducting tests within its established scope.<br /><br />The testing laboratory strengthened the company's services by supporting industry needs for objective, accurate, traceable, and technically accountable test results.</>
    },
    {
      period: "2023",
      titleId: "Pengembangan Ruang Lingkup Layanan",
      titleEn: "Development of Service Scope",
      descId: <>Seiring meningkatnya kebutuhan industri, perusahaan terus mengembangkan kemampuan teknis dan memperluas cakupan layanan sertifikasi produk serta pengujian laboratorium.<br /><br />Pengembangan layanan mencakup berbagai komoditas industri dan produk sesuai ruang lingkup kompetensi dan akreditasi yang dimiliki, guna mendukung penerapan standar mutu dan pemenuhan persyaratan regulasi.</>,
      descEn: <>As industry needs continue to grow, the company continues to develop its technical capabilities and expand its product certification and laboratory testing services.<br /><br />Service development covers various industrial commodities and products within the company's competence and accreditation scope, supporting the implementation of quality standards and compliance with regulatory requirements.</>
    },
    {
      period: "2025",
      titleId: "Keberlanjutan Akreditasi dan Penguatan Kompetensi",
      titleEn: "Accreditation Continuity and Competence Strengthening",
      descId: <>Perusahaan terus menjaga kesinambungan akreditasi LSPro dan mengembangkan sistem manajemen, kompetensi personel, serta kemampuan teknis untuk memastikan pelayanan yang konsisten dan terpercaya.<br /><br />Pada periode ini, perusahaan semakin memperkuat komitmennya terhadap ketidakberpihakan, kerahasiaan, profesionalisme, dan kepuasan pelanggan.</>,
      descEn: <>The company continues to maintain LSPro accreditation and develop its management system, personnel competence, and technical capabilities to ensure consistent and reliable services.<br /><br />During this period, the company further strengthened its commitment to impartiality, confidentiality, professionalism, and customer satisfaction.</>
    },
    {
      period: "2026",
      titleId: "Transformasi Identitas Menjadi PT Penilai Standar Uji (PSU)",
      titleEn: "Identity Transformation to PT Penilai Standar Uji (PSU)",
      descId: <>Tahun 2026 menjadi momentum penting dalam sejarah perusahaan dengan dilakukannya perubahan nama dari PT Penilai Standar Nasional (PSN) menjadi PT Penilai Standar Uji (PSU).<br /><br />Perubahan identitas ini mencerminkan semangat pembaruan dan penguatan komitmen perusahaan dalam menghadirkan pelayanan penilaian kesesuaian yang semakin profesional, inovatif, dan berorientasi pada kebutuhan pelanggan.<br /><br />Melalui identitas baru, PT Penilai Standar Uji berkomitmen melanjutkan pengalaman dan kompetensi yang telah dibangun sejak era PSN, sekaligus memperkuat pengembangan layanan sertifikasi, pengujian, dan bidang penilaian kesesuaian lainnya.</>,
      descEn: <>The year 2026 marks an important moment in the company's history, with its name changing from PT Penilai Standar Nasional (PSN) to PT Penilai Standar Uji (PSU).<br /><br />This identity change reflects a spirit of renewal and a strengthened commitment to delivering increasingly professional, innovative, and customer-focused conformity assessment services.<br /><br />With its new identity, PT Penilai Standar Uji is committed to building on the experience and competence developed since the PSN era, while further developing certification, testing, and other conformity assessment services.</>
    }
  ];

  return (
    <>
      <PageHeader
        title="Tentang Kami"
        breadcrumbs={[{ label: "Tentang Kami", href: "/about/profile" }]}
      />
      <main className="profile-page">
        <section aria-label={t("Tentang Kami")}>
        <div className="about-showcase">
          <div className="about-showcase__portrait reveal reveal-left">
            <div className="about-showcase__img-wrapper">
              <img
                className="about-showcase__photo"
                src={ABOUT_IMAGE}
                alt={t("Kantor PT PENILAI STANDAR UJI")}
              />
            </div>
            <div className="about-showcase__overlay-text">
              <strong>{t("Akreditasi KAN")}</strong>
              <span>LSPr-051-IDN</span>
              <span>LP-1554-IDN</span>
              <span>LSSM</span>
              <span>{t("Penunjukkan Kemenperin")}</span>
              <span>{t("Penunjukkan Kemendag")}</span>
              <span>{t("Penunjukkan Kementan")}</span>
            </div>
          </div>

          <div className="about-showcase__landscape reveal reveal-right reveal-dark">
            <div className="about-showcase__text-content">
              <p>
                <strong className="about-showcase__company-name">PT PENILAI STANDAR UJI (PSU)</strong>{" "}
                {lang === "en"
                  ? "is a company operating in the conformity assessment ecosystem and providing quality support services. We offer a range of services to help industries ensure their products, processes, and services meet applicable standards and requirements."
                  : "merupakan perusahaan yang bergerak dalam ekosistem penilaian kesesuaian dan layanan pendukung mutu. Kami menyediakan berbagai layanan yang mendukung kebutuhan industri dalam memastikan produk, proses, dan layanan memenuhi standar serta persyaratan yang berlaku."}
              </p>
              <p>
                {lang === "en"
                  ? "Supported by professional, competent, and experienced personnel, PSU continues to develop its services in product certification, laboratory testing, calibration, training, and laboratory and compliance consulting."
                  : "Didukung oleh tenaga profesional, kompeten, dan berpengalaman, PSU terus mengembangkan layanan melalui sertifikasi produk, pengujian laboratorium, kalibrasi, pelatihan, serta konsultasi laboratorium dan kepatuhan."}
              </p>
              <p>
                {lang === "en"
                  ? "We are committed to delivering services with integrity, competence, independence, collaboration, and sustainability, helping industries, communities, and stakeholders improve the quality and trustworthiness of products and services."
                  : "Kami berkomitmen memberikan layanan yang integritas, kompeten, independen, kolaboratif, dan berkelanjutan untuk membantu industri, masyarakat, dan para pemangku kepentingan meningkatkan kualitas dan kepercayaan terhadap produk maupun layanan."}
              </p>
            </div>
          </div>
        </div>
      </section>

      <h2 className="profile-page__section-title reveal reveal-dark">
        {t("Sejarah PT PENILAI STANDAR UJI (PSU)")}
      </h2>

      <div className="profile-page__intro reveal reveal-dark">
        {lang === "en" ? (
          <>
            <p><strong>PT Penilai Standar Uji (PSU)</strong>, formerly known as PT Penilai Standar Nasional (PSN), is a company operating in conformity assessment, product certification, and laboratory testing in Indonesia.</p>
            <p>The company's journey began with the development of product certification services, committed to supporting the implementation of <strong>Indonesian National Standards (SNI)</strong>, improving product quality, protecting consumers, and strengthening the competitiveness of national industry.</p>
            <p>As industry needs evolved and demand for quality assurance grew, the company continued to enhance its competence, expand its service scope, and strengthen the implementation of national and international standards.</p>
            <p>In 2026, the company entered a new chapter through its name change from PT Penilai Standar Nasional (PSN) to <strong>PT Penilai Standar Uji (PSU)</strong>. This transformation is part of the company's commitment to strengthening its identity, improving service quality, and sustainably developing conformity assessment services.</p>
          </>
        ) : (
          <>
            <p><strong>PT Penilai Standar Uji (PSU)</strong>, yang sebelumnya dikenal sebagai PT Penilai Standar Nasional (PSN), merupakan perusahaan yang bergerak di bidang penilaian kesesuaian, sertifikasi produk, serta pengujian laboratorium di Indonesia.</p>
            <p>Perjalanan perusahaan dimulai dengan pengembangan layanan sertifikasi produk yang berkomitmen mendukung penerapan <strong>Standar Nasional Indonesia (SNI)</strong>, peningkatan mutu produk, perlindungan konsumen, serta daya saing industri nasional.</p>
            <p>Seiring perkembangan kebutuhan industri dan tuntutan terhadap jaminan mutu, perusahaan terus meningkatkan kompetensi, memperluas ruang lingkup layanan, serta memperkuat penerapan standar nasional dan internasional.</p>
            <p>Pada tahun 2026, perusahaan memasuki babak baru melalui perubahan nama dari PT Penilai Standar Nasional (PSN) menjadi <strong>PT Penilai Standar Uji (PSU)</strong>. Transformasi ini menjadi bagian dari komitmen perusahaan untuk memperkuat identitas, meningkatkan kualitas pelayanan, serta mengembangkan layanan penilaian kesesuaian secara berkelanjutan.</p>
          </>
        )}
      </div>

      <h3 className="profile-page__subtitle reveal reveal-dark">
        {t("Masa Perkembangan dan Milestones Utama")}
      </h3>

      <div className="sejarah__timeline">
        {timelineData.map((item, index) => {
          const isEven = index % 2 !== 0; 
          const isFirst = index === 0;
          const isLast = index === timelineData.length - 1;

          return (
            <div 
              key={index}
              className={`timeline-row reveal ${isEven ? 'row-right' : 'row-left'} ${isFirst ? 'row-first' : ''} ${isLast ? 'row-last' : ''}`}
            >
              {!isFirst && <div className="line-in"></div>}

              <div className="timeline-node">
                <span className="timeline-year">{item.period}</span>
              </div>

              <div className="timeline-content-wrapper">
                <div className="sejarah__timeline-content">
                  <h4>{lang === "en" ? item.titleEn : item.titleId}</h4>
                  <p>{lang === "en" ? item.descEn : item.descId}</p>
                </div>
              </div>

              {!isLast && (
                <>
                  <div className="line-out-v1"></div>
                  <div className="line-out-h"></div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <section aria-labelledby="visimisi-title" className="vision-mission-section">
        <div className="vision-mission-showcase">
          <div className="vision-mission__image-side reveal reveal-left">
            <img 
              src={VISIMISI_IMAGE} 
              alt={t("Tim bekerja sama dalam diskusi")}
              className="vision-mission__photo"
            />
          </div>

          <div className="vision-mission__text-side reveal reveal-right">
            <div className="vision-mission__header-box">
              <h2>{t("Visi & Misi")}</h2>
              <h3>PT. PENILAI STANDAR UJI</h3>
            </div>

            <div className="vision-mission__content-box">
              <h4 className="vision-mission__label">{t("Visi")}</h4>
              <p className="vision-mission__desc">
                {t("Menjadi lembaga penilaian kesesuaian dan pengembangan kompetensi yang unggul, independen, profesional, inovatif, serta terpercaya di tingkat nasional dan internasional dalam mendukung peningkatan mutu, keselamatan, keandalan, dan daya saing industri secara berkelanjutan.")}
              </p>
            </div>

            <div className="vision-mission__content-box">
              <h4 className="vision-mission__label">{t("Misi")}</h4>
              <ul className="vision-mission__list">
                <li>{t("Menyelenggarakan Layanan Penilaian Kesesuaian yang Profesional dan Terpercaya")}.</li>
                <li>{t("Menjamin Mutu, Akurasi, dan Keandalan Layanan")}.</li>
                <li>{t("Mengembangkan Kompetensi dan Profesionalisme Sumber Daya Manusia")}.</li>
                <li>{t("Mendorong Inovasi dan Transformasi Digital")}.</li>
                <li>{t("Memperkuat Kemitraan dan Daya Saing Industri Nasional")}.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="commitment-title" className="commitment-section reveal reveal-dark">
        <div className="commitment-wrapper">
          <h2 id="commitment-title" className="commitment__title">{t("KOMITMEN PSU")}</h2>
          
          <p className="commitment__desc">
            {lang === "en" ? (
              "PT Penilai Standar Uji continues striving to be a trusted partner to the industrial world through competent, objective, transparent, and sustainable conformity assessment services."
            ) : (
              "PT Penilai Standar Uji terus berupaya menjadi mitra terpercaya bagi dunia industri melalui layanan penilaian kesesuaian yang kompeten, objektif, transparan, dan berkelanjutan."
            )}
          </p>
          
          <p className="commitment__desc">
            {lang === "en" ? (
              "Grounded in experience, accreditation recognition, and the development of human resources and technology, PSU is committed to supporting improvements in product quality and the competitiveness of Indonesian industry."
            ) : (
              "Dengan berlandaskan pengalaman, pengakuan akreditasi, serta pengembangan sumber daya manusia dan teknologi, PSU berkomitmen mendukung peningkatan kualitas produk dan daya saing industri Indonesia."
            )}
          </p>
        </div>
        </section>
      </main>
    </>
  );
}