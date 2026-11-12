import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "../context/useLanguage";
import { buildImageObjectSchema, BASE_SITE_URL } from "../data/imageMetadata";

export const ORGANIZATION_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE_SITE_URL}/#organization`,
  name: "PT PENILAI STANDAR UJI",
  alternateName: "PT PSU",
  url: `${BASE_SITE_URL}/`,
  logo: {
    "@type": "ImageObject",
    "@id": `${BASE_SITE_URL}/Logo_PSU.webp#logo`,
    url: `${BASE_SITE_URL}/Logo_PSU.webp`,
    contentUrl: `${BASE_SITE_URL}/Logo_PSU.webp`,
    name: "Logo PT PENILAI STANDAR UJI",
    width: 512,
    height: 512,
    encodingFormat: "image/webp",
  },
  image: `${BASE_SITE_URL}/Logo_PSU_banner1.webp`,
  description:
    "Lembaga Penilaian Kesesuaian (LPK) independen terakreditasi KAN untuk Sertifikasi Produk (LSPr-051-IDN), Laboratorium Pengujian (LP-1554-IDN), Kalibrasi, Pelatihan, dan Sertifikasi Sistem Manajemen.",
  email: "psuindonesia.info@gmail.com",
  telephone: "+62-21-8602367",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Jalan Cipinang Muara 1 No. 21 RT.006 / RW.03, Kel. Pondok Bambu, Kec. Duren Sawit",
    addressLocality: "Jakarta Timur",
    addressRegion: "DKI Jakarta",
    postalCode: "13430",
    addressCountry: "ID",
  },
  sameAs: [
    "https://instagram.com/penilaistandaruji",
    "https://maps.app.goo.gl/KAX2Pn4DxSPA5aiG6",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+62-21-8602367",
    contactType: "customer service",
    areaServed: "ID",
    availableLanguage: ["Indonesian", "English"],
  },
};

export const WEBSITE_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE_SITE_URL}/#website`,
  url: `${BASE_SITE_URL}/`,
  name: "PT PENILAI STANDAR UJI",
  publisher: {
    "@id": `${BASE_SITE_URL}/#organization`,
  },
  inLanguage: ["id-ID", "en-US"],
};

export default function SeoHead({
  title,
  description,
  canonical,
  type = "website", // "website" | "article" | "service" | "about" | "contact"
  breadcrumbs = [],
  articleData = null,
  serviceData = null,
  primaryImage = "/Logo_PSU_banner1.webp",
  lang: propLang,
}) {
  const { lang: contextLang, t } = useLanguage();
  const lang = propLang || contextLang || "id";
  const location = useLocation();
  const canonicalPath = canonical || location.pathname;
  const canonicalUrl = `${BASE_SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  const siteTitle = "PT PENILAI STANDAR UJI (PSU)";
  const localizedTitle = title ? t(title) : "";
  const fullTitle = localizedTitle ? `${localizedTitle} | ${siteTitle}` : siteTitle;
  const metaDescription =
    description
      ? t(description)
      : lang === "en"
      ? "PT Penilai Standar Uji (PSU) - Independent Conformity Assessment Body (CAB) accredited by KAN for SNI Product Certification, Laboratory Testing, Calibration, and Training."
      : "PT Penilai Standar Uji (PSU) - Lembaga Penilaian Kesesuaian (LPK) independen untuk Sertifikasi Produk SNI, Pengujian Laboratorium, Kalibrasi, dan Pelatihan.";

  const imageObj = buildImageObjectSchema(primaryImage);
  const imageUrl = imageObj ? imageObj.url : `${BASE_SITE_URL}/Logo_PSU_banner1.webp`;

  // 1. Breadcrumb Schema
  let breadcrumbSchema = null;
  if (Array.isArray(breadcrumbs) && breadcrumbs.length > 0) {
    const itemListElement = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Beranda",
        item: `${BASE_SITE_URL}/`,
      },
    ];

    breadcrumbs.forEach((bc, idx) => {
      const bcUrl = bc.href
        ? `${BASE_SITE_URL}${bc.href.startsWith("/") ? bc.href : `/${bc.href}`}`
        : `${canonicalUrl}`;
      itemListElement.push({
        "@type": "ListItem",
        position: idx + 2,
        name: bc.name || bc.label || "Halaman",
        item: bcUrl,
      });
    });

    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumb`,
      itemListElement,
    };
  }

  // 2. Specific Entity Schema
  const graphEntities = [ORGANIZATION_SCHEMA, WEBSITE_SCHEMA];

  if (breadcrumbSchema) {
    graphEntities.push(breadcrumbSchema);
  }

  if (type === "article" && articleData) {
    const wordCount = articleData.content_id
      ? articleData.content_id.split(/\s+/).filter(Boolean).length
      : 0;

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "@id": `${canonicalUrl}#article`,
      isPartOf: {
        "@type": "WebPage",
        "@id": `${canonicalUrl}#webpage`,
        url: canonicalUrl,
        name: articleData.title_id || title,
        isPartOf: { "@id": `${BASE_SITE_URL}/#website` },
      },
      headline: articleData.title_id || title,
      description: articleData.excerpt_id || metaDescription,
      image: imageObj || {
        "@type": "ImageObject",
        url: imageUrl,
      },
      datePublished: `${articleData.published_at}T08:00:00+07:00`,
      dateModified: `${articleData.published_at}T08:00:00+07:00`,
      author: {
        "@type":
          articleData.author?.includes("Divisi") ||
          articleData.author?.includes("Tim") ||
          articleData.author?.includes("Corporate")
            ? "Organization"
            : "Person",
        name: articleData.author || "Corporate Secretary PSU",
      },
      publisher: {
        "@id": `${BASE_SITE_URL}/#organization`,
      },
      inLanguage: lang === "en" ? "en-US" : "id-ID",
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": canonicalUrl,
      },
      articleSection: articleData.category || "News",
      keywords: Array.isArray(articleData.tags)
        ? articleData.tags.join(", ")
        : "PSU, Standar Uji, SNI",
      wordCount: wordCount > 0 ? wordCount : undefined,
      url: canonicalUrl,
    };

    graphEntities.push(articleSchema);
  } else if (type === "service") {
    const serviceName = serviceData?.name || title;
    const serviceDesc = serviceData?.description || metaDescription;
    const serviceType = serviceData?.serviceType || "Conformity Assessment & Certification";

    const serviceSchema = {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: serviceName,
      serviceType: serviceType,
      description: serviceDesc,
      provider: {
        "@id": `${BASE_SITE_URL}/#organization`,
      },
      url: canonicalUrl,
      image: imageObj || {
        "@type": "ImageObject",
        url: imageUrl,
      },
      termsOfService: `${BASE_SITE_URL}/layanan/sertif-produk/hak-kewajiban-klien`,
    };

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: fullTitle,
      description: metaDescription,
      isPartOf: { "@id": `${BASE_SITE_URL}/#website` },
      about: { "@id": `${canonicalUrl}#service` },
      primaryImageOfPage: imageObj,
      inLanguage: lang === "en" ? "en-US" : "id-ID",
    };

    graphEntities.push(serviceSchema);
    graphEntities.push(webPageSchema);
  } else {
    // Default WebPage / AboutPage / ContactPage
    const pageType =
      type === "about"
        ? "AboutPage"
        : type === "contact"
        ? "ContactPage"
        : "WebPage";

    const webPageSchema = {
      "@context": "https://schema.org",
      "@type": pageType,
      "@id": `${canonicalUrl}#webpage`,
      url: canonicalUrl,
      name: fullTitle,
      description: metaDescription,
      isPartOf: { "@id": `${BASE_SITE_URL}/#website` },
      about: { "@id": `${BASE_SITE_URL}/#organization` },
      primaryImageOfPage: imageObj,
      inLanguage: lang === "en" ? "en-US" : "id-ID",
    };

    graphEntities.push(webPageSchema);
  }

  const jsonLdGraph = {
    "@context": "https://schema.org",
    "@graph": graphEntities,
  };

  const jsonString = JSON.stringify(jsonLdGraph);

  // Synchronize document.head for client-side navigation
  useEffect(() => {
    document.title = fullTitle;

    // Meta description
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement("meta");
      metaDescEl.setAttribute("name", "description");
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute("content", metaDescription);

    // Canonical link
    let linkCanonicalEl = document.querySelector('link[rel="canonical"]');
    if (!linkCanonicalEl) {
      linkCanonicalEl = document.createElement("link");
      linkCanonicalEl.setAttribute("rel", "canonical");
      document.head.appendChild(linkCanonicalEl);
    }
    linkCanonicalEl.setAttribute("href", canonicalUrl);

    // OpenGraph Tags
    const setMetaProperty = (property, content) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement("meta");
        el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    setMetaProperty("og:title", fullTitle);
    setMetaProperty("og:description", metaDescription);
    setMetaProperty("og:url", canonicalUrl);
    setMetaProperty("og:image", imageUrl);
    setMetaProperty("og:type", type === "article" ? "article" : "website");
    setMetaProperty("og:site_name", "PT PENILAI STANDAR UJI");
    setMetaProperty("og:locale", lang === "en" ? "en_US" : "id_ID");
    setMetaProperty("og:locale:alternate", lang === "en" ? "id_ID" : "en_US");

    // JSON-LD Script tag in head
    let scriptEl = document.getElementById("psu-jsonld");
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.id = "psu-jsonld";
      scriptEl.type = "application/ld+json";
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = jsonString;

    return () => {
      // Clean up script on unmount if needed
    };
  }, [fullTitle, metaDescription, canonicalUrl, imageUrl, type, jsonString]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:type" content={type === "article" ? "article" : "website"} />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "id_ID"} />
      <meta property="og:locale:alternate" content={lang === "en" ? "id_ID" : "en_US"} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonString }}
      />
    </>
  );
}

