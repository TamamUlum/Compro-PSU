import PageHeader from "../components/PageHeader";
import { useEffect, useRef, useState } from "react";
import arief from "../assets/arief.jpg";
import amanda from "../assets/amanda.jpeg";
import winda from "../assets/winda.jpg";
import { useLanguage } from "../context/useLanguage";
import "./Struktur.css";

const leaders = [
  {
    no: "01",
    name: "Arief Prihardono Darmawan",
    role: "Direktur Utama",
    roleEn: "President Director",
    photo: arief,
    duty: "Memimpin arah strategis dan pengembangan bisnis PT PENILAI STANDAR UJI secara berkelanjutan.",
    dutyEn:
      "Leads the strategic direction and sustainable business development of PT PENILAI STANDAR UJI.",
  },
  {
    no: "02",
    name: "Amanda Putri",
    role: "Direktur",
    roleEn: "Director",
    photo: amanda,
    duty: "Mengelola operasional, keuangan, dan pengembangan organisasi untuk mendukung pencapaian tujuan perusahaan.",
    dutyEn:
      "Manages operations, finance, and organizational development to support the company's goals.",
  },
  {
    no: "03",
    name: "Winda Arliny",
    role: "Komisaris",
    roleEn: "Commissioner",
    photo: winda,
    duty: "Melakukan pengawasan dan memberikan arahan strategis demi memastikan tata kelola perusahaan berjalan dengan baik.",
    dutyEn:
      "Provides oversight and strategic guidance to ensure sound corporate governance.",
  },
];

export default function Struktur() {
  const { lang, t } = useLanguage();
  const [openIds, setOpenIds] = useState(() => new Set());
  const [visibleIds, setVisibleIds] = useState(() => new Set());
  const listRef = useRef(null);

  useEffect(() => {
    const cards = listRef.current.querySelectorAll("[data-leader]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const no = entry.target.dataset.leader;
          setVisibleIds((previous) => new Set(previous).add(no));
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const toggleCard = (no) => {
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (next.has(no)) next.delete(no);
      else next.add(no);
      return next;
    });
  };

  const openCard = (event, no) => {
    if (event.pointerType !== "mouse") return;
    setOpenIds((previous) =>
      previous.has(no) ? previous : new Set(previous).add(no)
    );
  };

  return (
    <>
      <PageHeader
        title="Struktur Organisasi"
        breadcrumbs={[
          { label: "Tentang Kami" },
          { label: "Struktur Organisasi", href: "/about/struktur-organisasi" },
        ]}
      />
      <main className="org">
      <h1 className="org__title">
        {lang === "en" ? "Leadership Structure" : "Struktur Kepemimpinan"}{" "}
        <br /> PT PENILAI STANDAR UJI
      </h1>
      <p className="org__caption"></p>

      <ul className="org__list" ref={listRef}>
        {leaders.map((leader) => {
          const isOpen = openIds.has(leader.no);
          const role = lang === "en" ? leader.roleEn : leader.role;

          return (
            <li
              className={`leader${isOpen ? " is-open" : ""}${
                visibleIds.has(leader.no) ? " is-visible" : ""
              }`}
              data-leader={leader.no}
              key={leader.no}
              onPointerEnter={(event) => openCard(event, leader.no)}
            >
              <button
                type="button"
                className="leader__toggle"
                aria-expanded={isOpen}
                aria-controls={`leader-${leader.no}`}
                onClick={() => toggleCard(leader.no)}
              >
                <img
                  className="leader__photo"
                  src={leader.photo}
                  alt={`${leader.name}, ${t(leader.role)}`}
                />
                <span className="leader__more">
                  {isOpen
                    ? lang === "en"
                      ? "Close"
                      : "Tutup"
                    : lang === "en"
                      ? "Learn more"
                      : "Selengkapnya"}
                  <svg
                    className="leader__arrow"
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    aria-hidden="true"
                  >
                    <path
                      d="M7 2v10M3 8l4 4 4-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              <div className="leader__details" id={`leader-${leader.no}`}>
                <div className="leader__details-inner">
                  <div className="leader__text">
                    <h2 className="leader__name">
                      {leader.no}. {leader.name}
                    </h2>
                    <p className="leader__role">{role}</p>
                    <p className="leader__duty">
                      {lang === "en" ? leader.dutyEn : leader.duty}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      </main>
    </>
  );
}