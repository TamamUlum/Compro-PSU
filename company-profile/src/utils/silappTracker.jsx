export const SILAPP_DOMAIN = "SILAPP.penilaistandaruji.com";
export const SILAPP_BASE_URL = `https://${SILAPP_DOMAIN}`;

export function renderNamaPabrik(namaPabrik) {
  if (!namaPabrik) return "-";
  const raw = String(namaPabrik);
  if (raw.includes("|")) {
    const [name, city] = raw.split("|").map((s) => s.trim());
    return (
      <div>
        <div className="cert-tracker__factory-name">{name}</div>
        {city && <div className="cert-tracker__factory-city">{city}</div>}
      </div>
    );
  }
  if (raw.includes("\n")) {
    const [name, city] = raw.split("\n").map((s) => s.trim());
    return (
      <div>
        <div className="cert-tracker__factory-name">{name}</div>
        {city && <div className="cert-tracker__factory-city">{city}</div>}
      </div>
    );
  }
  return (
    <div>
      <div className="cert-tracker__factory-name">{raw}</div>
    </div>
  );
}

export function getStatusBadgeClass(statusText) {
  const norm = String(statusText || "").trim().toLowerCase();
  if (norm === "aktif" || norm === "selesai") return "cert-tracker__badge--active";
  if (norm === "ditangguhkan" || norm === "proses") return "cert-tracker__badge--suspended";
  return "cert-tracker__badge--revoked";
}

/**
 * Mengambil data pelacakan status sertifikat atau alur permohonan dari API SILAPP (SILAPP.penilaistandaruji.com)
 * Memprioritaskan Backend Proxy PT PSU dengan fallback direct browser call ke SILAPP
 */
export async function fetchCertificateFromApi(submenu, noSertifikat) {
  const encodedNo = encodeURIComponent(noSertifikat.trim());
  const endpoints = [
    `/api/sertifikat/${submenu}?no_sertifikat=${encodedNo}`,
    `/api/tracking/${submenu}?no_sertifikat=${encodedNo}`,
  ];

  let lastError = null;

  // 1. Prioritas Utama: Backend Proxy (Terintegrasi ke SILAPP.penilaistandaruji.com)
  for (const url of endpoints) {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        continue;
      }
      const payload = await response.json();
      return { status: response.status, payload };
    } catch (err) {
      lastError = err;
    }
  }

  // 2. Direct Fallback: Browser direct-call ke API SILAPP.penilaistandaruji.com
  try {
    const cleanQuery = noSertifikat.trim().toUpperCase();
    const isTrackingCode = /^SLP/i.test(cleanQuery) || /^PSU-\d{4}-/i.test(cleanQuery);

    if (isTrackingCode) {
      const trackRes = await fetch(
        `${SILAPP_BASE_URL}/api/public/track/${encodeURIComponent(cleanQuery)}`,
        { headers: { Accept: "application/json" } }
      );
      if (trackRes.ok) {
        const silappData = await trackRes.json();
        return {
          status: 200,
          payload: {
            success: true,
            found: true,
            source: SILAPP_DOMAIN,
            mode: "workflow",
            workflow: silappData,
            data: [
              {
                id: silappData.application_no || silappData.tracking_code,
                nama_pabrik: silappData.company_name || "Pemohon Terdaftar (SILAPP)",
                produk: silappData.service_name || silappData.product_label || "Layanan PT PSU",
                no_sni: silappData.tracking_code,
                no_sertifikat: silappData.application_no || silappData.tracking_code,
                terbit: silappData.created_at ? String(silappData.created_at).slice(0, 10) : "-",
                berlaku_sd: silappData.condition || "Dalam Proses",
                status:
                  silappData.status === "aktif"
                    ? "Aktif"
                    : silappData.status === "selesai"
                    ? "Selesai"
                    : "Proses",
                progress: silappData.progress,
                current_step_name: silappData.current_step?.name,
                source: SILAPP_DOMAIN,
              },
            ],
          },
        };
      }
    }

    // Direct fetch ke SILAPP directory
    const dirRes = await fetch(`${SILAPP_BASE_URL}/api/public/directory`, {
      headers: { Accept: "application/json" },
    });
    if (dirRes.ok) {
      const dirData = await dirRes.json();
      const normInput = cleanQuery.replace(/\s+/g, "").replace(/–/g, "-");
      const match =
        Array.isArray(dirData) &&
        dirData.find((c) => {
          const cNo = String(c.certificate_no || "")
            .trim()
            .toUpperCase()
            .replace(/\s+/g, "")
            .replace(/–/g, "-");
          return cNo === normInput;
        });

      if (match) {
        return {
          status: 200,
          payload: {
            success: true,
            found: true,
            source: SILAPP_DOMAIN,
            mode: "certificate",
            data: [
              {
                id: match.certificate_no,
                nama_pabrik:
                  match.factory_name +
                  (match.factory_address && match.factory_address !== "-"
                    ? ` | ${match.factory_address}`
                    : ""),
                produk: match.product || "-",
                no_sni: match.sni_no || "-",
                no_sertifikat: match.certificate_no,
                terbit: match.issued_at || "-",
                berlaku_sd: match.expires_at || "-",
                status: match.state
                  ? match.state.charAt(0).toUpperCase() + match.state.slice(1)
                  : "Aktif",
                source: SILAPP_DOMAIN,
              },
            ],
          },
        };
      }
    }
  } catch (directErr) {
    console.warn("Direct SILAPP fetch warning:", directErr.message);
  }

  throw lastError || new Error(`Tidak dapat terhubung ke server API (${SILAPP_DOMAIN}).`);
}

