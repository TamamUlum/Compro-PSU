import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import HeaderTop from "./HeaderTop";
import LangToggle from "./LangToggle";
import "./Navbar.css";
import "./NavbarTrack.css";

function useIsMobile(breakpoint) {
  const query = `(max-width: ${breakpoint}px)`;
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return isMobile;
}

const menuTentangKami = [
  { label: "Profile", href: "/about/profile" },
  { label: "Struktur Organisasi", href: "/about/struktur-organisasi" },
];

const menuLayanan = [
  {
    label: "Lembaga Sertifikasi Produk",
    id: "sertifikasi-produk",
    href: "/layanan/sertif-produk",
    children: [
      {
        label: "Legalitas",
        href: "/layanan/sertif-produk/legalitas",
      },
      {
        label: "Ruang Lingkup",
        href: "/layanan/sertif-produk/ruang-lingkup",
      },
      {
        label: "Permohonan Sertifikasi",
        href: "/layanan/sertif-produk/permohonan-sertifikasi",
      },
      {
        label: "Proses Sertifikasi",
        id: "sertifikasi-produk-proses",
        children: [
          {
            label: "Tipe 1B",
            href: "/layanan/sertif-produk/tipe-1b",
          },
          {
            label: "Tipe 5",
            href: "/layanan/sertif-produk/tipe-5",
          },
        ],
      },
      {
        label: "Ketentuan dan Tata Cara Penggunaan SNI",
        href: "/layanan/sertif-produk/penggunaan-sni",
      },
      {
        label: "Keluhan dan Banding",
        href: "/layanan/sertif-produk/keluhan-banding",
      },
      {
        label: "Hak dan Kewajiban Klien",
        href: "/layanan/sertif-produk/hak-kewajiban-klien",
      },
      {
        label: "Biaya dan Penawaran Sertifikasi",
        href: "/layanan/sertif-produk/biaya-sertif",
      },
    ],
  },
  {
    label: "Lembaga Pengujian",
    id: "pengujian",
    href: "/layanan/penguji",
    children: [
      {
        label: "Legalitas",
        href: "/layanan/penguji/legalitas",
      },
      {
        label: "Ruang Lingkup",
        id: "pengujian-ruang-lingkup",
        href: "/layanan/penguji/ruang-lingkup",
      },
      {
        label: "Proses Pengujian",
        href: "/layanan/penguji/proses-pengujian",
      },
      {
        label: "Biaya dan Penawaran Pengujian",
        href: "/layanan/penguji/biaya-sertif",
      },
    ],
  },
  {
    label: "Lembaga Kalibrasi",
    id: "kalibrasi",
    href: "/layanan/kalibrasi",
    children: [
      { 
        label: "Legalitas", 
        href: "/layanan/kalibrasi/legalitas" 
      },
      {
        label: "Ruang Lingkup",
        id: "kalibrasi-ruang-lingkup",
        children: [
          {
            label: "Alat Kesehatan",
            href: "/layanan/kalibrasi/ruang-lingkup/alat-kesehatan",
          },
        ],
      },
      {
        label: "Biaya dan Penawaran Kalibrasi",
        href: "/layanan/kalibrasi/biaya-sertif",
      },
    ],
  },
  {
    label: "Lembaga Sertifikasi Sistem Manajemen",
    id: "sertifikasi-sistem",
    href: "/layanan/sertif-manajemen",
    children: [
      {
        label: "Legalitas",
        href: "/layanan/sertif-manajemen/legalitas",
      },
      {
        label: "Ruang Lingkup",
        href: "/layanan/sertif-manajemen/ruang-lingkup",
      },
      {
        label: "Proses Sertifikasi",
        href: "/layanan/sertif-manajemen/proses-sertifikasi",
      },
      {
        label: "Keluhan dan Banding",
        href: "/layanan/sertif-manajemen/keluhan-banding",
      },
      {
        label: "Hak dan Kewajiban Klien",
        href: "/layanan/sertif-manajemen/hak-kewajiban-klien",
      },
      {
        label: "Biaya dan Penawaran Sertifikasi",
        href: "/layanan/sertif-manajemen/biaya-sertif",
      },
    ],
  },
  {
    label: "Lembaga Pelatihan",
    id: "pelatihan",
    href: "/layanan/pelatihan",
    children: [
      {
        label: "General Training",
        href: "/layanan/pelatihan/general-training",
      },
      {
        label: "Inhouse Training",
        href: "/layanan/pelatihan/inhouse-training",
      },
      {
        label: "Exhouse Training",
        href: "/layanan/pelatihan/exhouse-training",
      },
    ],
  },
];

const menuClient = [
  {
    label: "Lembaga Sertifikasi Produk",
    href: "/client/sertifikasi-produk",
  },
  {
    label: "Lembaga Pengujian",
    href: "/client/pengujian",
  },
  {
    label: "Lembaga Kalibrasi",
    href: "/client/kalibrasi",
  },
  {
    label: "Lembaga Sertifikasi Sistem Manajemen",
    href: "/client/sertifikasi-sistem-manajemen",
  },
];

const menuLinks = [
  { label: "Artikel", href: "/artikel" },
  { label: "Kontak", href: "/kontak" },
  {
    label: "Lacak",
    href: "#",
    target: "_blank",
    external: true,
    cta: true,
    extraClass: "navbar__track",
  },
];

const SUBMENU_GAP = 10;
const VIEWPORT_MARGIN = 8;

function measureSubmenuWidth(li) {
  if (!li || window.innerWidth <= 1024) return undefined;
  const sub = li.querySelector(":scope > .navbar__subsub");
  if (!sub) return undefined;

  const previousMaxWidth = sub.style.maxWidth;
  const wasConstrained = sub.classList.contains("is-constrained");
  sub.style.maxWidth = "none";
  sub.classList.remove("is-constrained");
  const width = sub.offsetWidth;
  sub.style.maxWidth = previousMaxWidth;
  if (wasConstrained) sub.classList.add("is-constrained");

  const roomLeft = li.getBoundingClientRect().left - SUBMENU_GAP - VIEWPORT_MARGIN;
  return width > roomLeft ? Math.max(roomLeft, 140) : null;
}

const canHover = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: hover) and (min-width: 1025px)").matches;

export default function Navbar() {
  const { pathname } = useLocation();
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [openSubs, setOpenSubs] = useState(() => new Set());
  const closeTimer = useRef(null);
  const isMobile = useIsMobile(1024);
  const [subMaxWidth, setSubMaxWidth] = useState({});

  const updateSubWidth = (id, li) => {
    const next = measureSubmenuWidth(li);
    if (next === undefined) return;
    setSubMaxWidth((previous) =>
      previous[id] === next ? previous : { ...previous, [id]: next }
    );
  };

  useLayoutEffect(() => {
    if (!openDropdown) return;
    document
      .querySelectorAll(".navbar__panel.is-open > .navbar__submenu > li[data-sub-id]")
      .forEach((li) => {
        const next = measureSubmenuWidth(li);
        if (next === undefined) return;
        const id = li.dataset.subId;
        setSubMaxWidth((previous) =>
          previous[id] === next ? previous : { ...previous, [id]: next }
        );
      });
  }, [openDropdown]);

  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const scrollY = window.scrollY;
    const bodyStyles = {
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      Object.assign(document.body.style, bodyStyles);
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (!e.target.closest(".navbar__dropdown")) {
        setOpenDropdown(null);
        setOpenSubs(new Set());
      }
      if (!e.target.closest(".navbar")) {
        setMenuOpen(false);
      }
    };
    const onEscape = (e) => {
      if (e.key === "Escape") {
        setOpenDropdown(null);
        setOpenSubs(new Set());
        setMenuOpen(false);
      }
    };
    const onResize = () => {
      if (window.innerWidth > 1024) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
      window.removeEventListener("resize", onResize);
      clearTimeout(closeTimer.current);
    };
  }, []);

  const closeAll = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
    setOpenSubs(new Set());
  };

  const openSub = (id) => {
    setOpenSubs((previous) => new Set(previous).add(id));
  };

  const closeSubtree = (id) => {
    setOpenSubs((previous) => {
      const next = new Set(previous);
      for (const openId of next) {
        if (openId === id || openId.startsWith(`${id}-`)) next.delete(openId);
      }
      return next;
    });
  };

  const toggleSub = (id, ancestors) => {
    setOpenSubs((previous) => {
      if (previous.has(id)) {
        const next = new Set(previous);
        for (const openId of next) {
          if (openId === id || openId.startsWith(`${id}-`)) next.delete(openId);
        }
        return next;
      }

      return new Set([...ancestors, id]);
    });
  };

  const handleEnter = (id) => {
    if (!canHover()) return;
    clearTimeout(closeTimer.current);
    setOpenSubs(new Set());
    setOpenDropdown(id);
  };

  const handleLeave = () => {
    if (!canHover()) return;
    closeTimer.current = setTimeout(() => {
      setOpenDropdown(null);
      setOpenSubs(new Set());
    }, 140);
  };

  const handleTriggerClick = (id) => {
    setOpenSubs(new Set());
    if (canHover()) setOpenDropdown(id);
    else setOpenDropdown(openDropdown === id ? null : id);
  };

  const linkProps = (href) => ({
    to: href,
    onClick: closeAll,
    "aria-current": isActive(href) ? "page" : undefined,
    className: isActive(href) ? "is-active" : undefined,
  });

  const renderSubItem = (item, index, ancestors = []) =>
    item.children ? (
      <li
        key={item.id}
        data-sub-id={item.id}
        onMouseEnter={(event) => {
          if (!canHover()) return;
          openSub(item.id);
          updateSubWidth(item.id, event.currentTarget);
        }}
        onMouseLeave={() => canHover() && closeSubtree(item.id)}
      >
        <div
          className={`navbar__subrow ${
            item.children.some(
              (child) =>
                (child.href && isActive(child.href)) ||
                child.children?.some((grandchild) => isActive(grandchild.href))
            )
              ? "is-active"
              : ""
          }`}
        >
          {item.linkParent && (
            <Link {...linkProps(item.href)} className="navbar__subheading-link">
              {t(item.label)}
            </Link>
          )}
          <button
            type="button"
            className="navbar__subheading"
            aria-label={`${t(openSubs.has(item.id) ? "Tutup" : "Buka")} submenu ${t(item.label)}`}
            aria-expanded={openSubs.has(item.id)}
            onClick={(event) => {
              updateSubWidth(item.id, event.currentTarget.closest("li"));
              toggleSub(item.id, ancestors);
            }}
          >
            {!item.linkParent && <span>{t(item.label)}</span>}
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              aria-hidden="true"
              style={{
                transform: isMobile
                  ? openSubs.has(item.id)
                    ? "rotate(180deg)"
                    : "none"
                  : "rotate(90deg)",
              }}
            >
              <path
                d="M1 1l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <ul
          className={[
            "navbar__subsub",
            openSubs.has(item.id) && "is-open",
            subMaxWidth[item.id] && "is-constrained",
          ]
            .filter(Boolean)
            .join(" ")}
          style={
            !isMobile && subMaxWidth[item.id]
              ? { maxWidth: subMaxWidth[item.id] }
              : undefined
          }
        >
          {item.children.map((child, childIndex) =>
            renderSubItem(child, childIndex, [...ancestors, item.id])
          )}
        </ul>
      </li>
    ) : (
      <li key={`${item.label}-${index}`}>
        <Link {...linkProps(item.href)}>
          {t(item.label)}
          <svg
            className="navbar__arrow"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            aria-hidden="true"
          >
            <path
              d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </li>
    );

  const renderDropdown = ({ id, label, items, active }) => {
    const open = openDropdown === id;
    return (
      <li
        className={`navbar__dropdown navbar__dropdown--${id}`}
        onMouseEnter={() => handleEnter(id)}
        onMouseLeave={handleLeave}
      >
        <button
          className={`navbar__trigger ${active ? "is-active" : ""}`}
          aria-haspopup="true"
          aria-expanded={open}
          onClick={() => handleTriggerClick(id)}
        >
          {t(label)}
          <svg
            className={`navbar__caret ${open ? "is-open" : ""}`}
            width="10"
            height="6"
            viewBox="0 0 10 6"
            aria-hidden="true"
          >
            <path
              d="M1 1l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className={`navbar__panel ${open ? "is-open" : ""}`}>
          <ul className="navbar__submenu">
            {items.map((item, index) => renderSubItem(item, index))}
          </ul>
        </div>
      </li>
    );
  };

  return (
    <>
      <HeaderTop />
      {menuOpen && (
        <div
          className="navbar__backdrop"
          aria-hidden="true"
          onClick={closeAll}
        />
      )}
      <header
        className={`navbar ${menuOpen ? "is-menu-open" : ""}`}
      >
        <nav className="navbar__inner" aria-label={t("Navigasi utama")}>
          <div className="navbar__language">
            <LangToggle />
          </div>

          <Link to="/" className="navbar__brand" onClick={closeAll}>
            <img src="/Logo_PSU1.webp" alt="Logo" className="navbar__logo" />
          </Link>

          <button
            className={`navbar__toggle ${menuOpen ? "is-open" : ""}`}
            aria-label={t(menuOpen ? "Tutup menu" : "Buka menu")}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>

          <ul className={`navbar__links ${menuOpen ? "is-open" : ""}`}>
            <li className="navbar__home-link">
              <Link {...linkProps("/")}>{t("Home")}</Link>
            </li>
            <li className="navbar__menu-label" aria-hidden="true">
              {t("Menu")}
            </li>
            {renderDropdown({
              id: "about",
              label: "Tentang Kami",
              items: menuTentangKami,
              active: pathname.startsWith("/about/"),
            })}

            {renderDropdown({
              id: "layanan",
              label: "Layanan",
              items: menuLayanan,
              active: pathname.startsWith("/layanan/"),
            })}

            {renderDropdown({
              id: "client",
              label: "Client",
              items: menuClient,
              active: pathname.startsWith("/client"),
            })}

            {menuLinks.map((item) => (
              <li key={item.href}>
                {item.external ? (
                  <a
                    href={item.href}
                    onClick={closeAll}
                    className={
                      [item.cta && "navbar__cta", item.extraClass]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  >
                    {t(item.label)}
                  </a>
                ) : (
                  <Link
                    {...linkProps(item.href)}
                    className={
                      [
                        isActive(item.href) && "is-active",
                        item.cta && "navbar__cta",
                        item.extraClass,
                      ]
                        .filter(Boolean)
                        .join(" ") || undefined
                    }
                  >
                    {t(item.label)}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <div className="navbar__spacer" aria-hidden="true" />
    </>
  );
}