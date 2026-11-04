import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { AUTHOR_OPTIONS, FALLBACK_ARTICLES } from "../data/articlesFallback";
import "./Artikel.css";
import "./DashboardArtikel.css";

const USER_STORAGE_KEY = "psu_admin_user";

const RECOMMENDED_TAGS = [
  "Press Release",
  "News",
  "Article",
  "PT Penilai Standar Uji",
  "SNI",
  "LSPro PSU",
  "Laboratorium Pengujian",
  "Laboratorium Kalibrasi",
  "LSSM PSU",
  "Lembaga Pelatihan",
  "Akreditasi KAN",
  "ISO 9001",
  "ISO 17025",
  "Keamanan Pangan",
  "Produk Logam",
  "Pupuk Pertanian",
  "Pasar Rakyat",
  "Alat Kesehatan",
];

const DEFAULT_GALLERY_FALLBACK = [
  {
    id: 1,
    title: "Banner Kantor PSU 1",
    filename: "Logo_PSU_banner1.webp",
    image_url: "/Logo_PSU_banner1.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 1",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 2,
    title: "Banner Kantor PSU 2",
    filename: "Logo_PSU_banner2.webp",
    image_url: "/Logo_PSU_banner2.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 2",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 3,
    title: "Banner Kantor PSU 3",
    filename: "Logo_PSU_banner3.webp",
    image_url: "/Logo_PSU_banner3.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 3",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 4,
    title: "Banner Kantor PSU 4",
    filename: "Logo_PSU_banner4.webp",
    image_url: "/Logo_PSU_banner4.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 4",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 5,
    title: "Banner Kantor PSU 5",
    filename: "Logo_PSU_banner5.webp",
    image_url: "/Logo_PSU_banner5.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 5",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 6,
    title: "Banner Kantor PSU 6",
    filename: "Logo_PSU_banner6.webp",
    image_url: "/Logo_PSU_banner6.webp",
    category: "Banner Default",
    alt_text: "Banner Utama PT Penilai Standar Uji 6",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 7,
    title: "Layanan Sertifikasi Produk (LSPro)",
    filename: "LSPro.webp",
    image_url: "/LSPro.webp",
    category: "Layanan PSU",
    alt_text: "Layanan Sertifikasi Produk LSPro PSU",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 8,
    title: "Laboratorium Pengujian PSU",
    filename: "lab_pengujian.webp",
    image_url: "/lab_pengujian.webp",
    category: "Layanan PSU",
    alt_text: "Fasilitas Laboratorium Pengujian PSU",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 9,
    title: "Laboratorium Kalibrasi PSU",
    filename: "lab_kalibrasi.webp",
    image_url: "/lab_kalibrasi.webp",
    category: "Layanan PSU",
    alt_text: "Fasilitas Laboratorium Kalibrasi PSU",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 10,
    title: "Lembaga Pelatihan PSU",
    filename: "_pelatihan.webp",
    image_url: "/_pelatihan.webp",
    category: "Layanan PSU",
    alt_text: "Kegiatan Pelatihan Terpadu PSU",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 11,
    title: "Sistem Manajemen Mutu (LSSM)",
    filename: "sistem_manajemen_mutu.webp",
    image_url: "/sistem_manajemen_mutu.webp",
    category: "Layanan PSU",
    alt_text: "Sertifikasi Sistem Manajemen Mutu ISO",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
  {
    id: 12,
    title: "Tim Visi & Misi PSU",
    filename: "vision-mission-team.webp",
    image_url: "/vision-mission-team.webp",
    category: "Dokumentasi Korporat",
    alt_text: "Transformasi Identitas PT Penilai Standar Uji",
    is_uploaded: false,
    usage_count: 1,
    used_in_articles: [],
  },
];

function slugifyText(title) {
  return String(title || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function formatIndoDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getCookie(name) {
  if (typeof document === "undefined") return "";
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(";").shift() || "";
  return "";
}

async function apiRequest(pathUrl, options = {}, token = "") {
  const bases = [""];
  let lastError = null;

  for (const base of bases) {
    const fullUrl = `${base}${pathUrl}`;
    try {
      const headers = {
        "Content-Type": "application/json",
        "X-Auth-Client": "browser",
        ...(options.headers || {}),
      };

      // SEC-006: Lampirkan CSRF Token dari cookie untuk request mutasi state
      const method = (options.method || "GET").toUpperCase();
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        const csrfToken = getCookie("psu_csrf_token");
        if (csrfToken) {
          headers["X-CSRF-Token"] = csrfToken;
        }
      }

      // Backward compatibility jika Bearer token diberikan oleh pemanggil non-browser
      if (token && token !== "authenticated") {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await fetch(fullUrl, {
        credentials: "include", // SEC-006: Selalu sertakan HttpOnly session cookies
        ...options,
        headers,
      });
      const ct = res.headers.get("content-type") || "";
      if (!ct.includes("application/json")) continue;
      const json = await res.json();
      return { ok: res.ok, status: res.status, data: json };
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError || new Error("Tidak dapat terhubung ke server API (port 5000).");
}

export default function DashboardArtikel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { subpage, slug: routeSlug } = useParams();

  // ==========================================================================
  // STATE SESI LOGIN & JWT (SEC-006: HTTPONLY COOKIE AUTHENTICATION)
  // ==========================================================================
  const [adminUser, setAdminUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  // Token state diselaraskan dengan sesi HttpOnly cookie (tidak ada token di localStorage)
  const token = adminUser ? "authenticated" : "";
  const setToken = () => {};
  const [authChecking, setAuthChecking] = useState(true);
  const [dbConnected, setDbConnected] = useState(true);

  // Form Login
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPass, setShowLoginPass] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Navigasi Menu Dashboard
  const activeTab = useMemo(() => {
    const map = {
      kelola: "articles",
      tambah: "create",
      edit: "edit",
      galeri: "gallery",
      taksonomi: "taxonomy",
      pengaturan: "settings",
    };
    return map[subpage] || "overview";
  }, [subpage]);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!sidebarOpen || !window.matchMedia("(max-width: 860px)").matches) {
      return undefined;
    }

    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousDocumentOverflow = documentElement.style.overflow;
    body.style.overflow = "hidden";
    documentElement.style.overflow = "hidden";

    return () => {
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousDocumentOverflow;
    };
  }, [sidebarOpen]);

  // ==========================================================================
  // STATE DATA UTAMA (ARTIKEL, GALERI, PENULIS, LOG, STATISTIK)
  // ==========================================================================
  const [articles, setArticles] = useState(FALLBACK_ARTICLES);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY_FALLBACK);
  const [authorsList, setAuthorsList] = useState(AUTHOR_OPTIONS);
  const [authorsMeta, setAuthorsMeta] = useState([]);
  const [logs, setLogs] = useState([]);
  const [adminUsersList, setAdminUsersList] = useState([]);
  const [globalAlert, setGlobalAlert] = useState({ type: "", message: "" });

  // ==========================================================================
  // STATE MENU 2: KELOLA ARTIKEL (FILTER, SEARCH, BULK)
  // ==========================================================================
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterYear, setFilterYear] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedArticleIds, setSelectedArticleIds] = useState([]);
  const [deleteTargetArticle, setDeleteTargetArticle] = useState(null);
  const [deletingArticle, setDeletingArticle] = useState(false);

  // ==========================================================================
  // STATE MENU 3 & 4: FORM TAMBAH & EDIT ARTIKEL + MODAL GALERI
  // ==========================================================================
  const today = new Date().toISOString().slice(0, 10);
  const [editingSlug, setEditingSlug] = useState(routeSlug || "");
  const [editingId, setEditingId] = useState(null);
  const [formTitleId, setFormTitleId] = useState("");
  const [formTitleEn, setFormTitleEn] = useState("");
  const [formCustomSlug, setFormCustomSlug] = useState("");
  const [formCategory, setFormCategory] = useState("News");
  const [formAuthor, setFormAuthor] = useState(AUTHOR_OPTIONS[0]);
  const [formPublishedAt, setFormPublishedAt] = useState(today);
  const [formStatus, setFormStatus] = useState("Published");
  const [formIsFeatured, setFormIsFeatured] = useState(false);
  const [formImageUrl, setFormImageUrl] = useState("/Logo_PSU_banner1.webp");
  const [formTagsInput, setFormTagsInput] = useState("News, PT Penilai Standar Uji, SNI");
  const [formExcerptId, setFormExcerptId] = useState("");
  const [formExcerptEn, setFormExcerptEn] = useState("");
  const [formContentId, setFormContentId] = useState("");
  const [formContentEn, setFormContentEn] = useState("");
  const [editorViewMode, setEditorViewMode] = useState("form"); // 'form' | 'preview'
  const [savingArticle, setSavingArticle] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Modal Pemilih Galeri Foto (Media Picker untuk Tambah/Edit Artikel)
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [pickerSearch, setPickerSearch] = useState("");
  const [pickerFilter, setPickerFilter] = useState("All");

  // ==========================================================================
  // STATE MENU 5: GALERI FOTO (MEDIA LIBRARY)
  // ==========================================================================
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState("All");
  const [newPhotoTitle, setNewPhotoTitle] = useState("");
  const [newPhotoCategory, setNewPhotoCategory] = useState("Artikel Upload");
  const [newPhotoAlt, setNewPhotoAlt] = useState("");
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [previewLightboxItem, setPreviewLightboxItem] = useState(null);
  const [editingMediaItem, setEditingMediaItem] = useState(null);
  const [editMediaTitle, setEditMediaTitle] = useState("");
  const [editMediaAlt, setEditMediaAlt] = useState("");
  const [editMediaCategory, setEditMediaCategory] = useState("Artikel Upload");

  // ==========================================================================
  // STATE MENU 6: PENULIS & KATEGORI/TAG
  // ==========================================================================
  const [newAuthorName, setNewAuthorName] = useState("");
  const [newAuthorRole, setNewAuthorRole] = useState("");
  const [newAuthorDivision, setNewAuthorDivision] = useState("");
  const [renamingTagOld, setRenamingTagOld] = useState("");
  const [renamingTagNew, setRenamingTagNew] = useState("");

  // ==========================================================================
  // STATE MENU 7: PENGATURAN AKUN ADMIN & KEAMANAN JWT
  // ==========================================================================
  const [profileFullName, setProfileFullName] = useState(
    () => adminUser?.full_name || ""
  );
  const [profileEmail, setProfileEmail] = useState(() => adminUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [newAdminUsername, setNewAdminUsername] = useState("");
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminFullName, setNewAdminFullName] = useState("");
  const [newAdminPassword, setNewAdminPassword] = useState("");
  const [newAdminRole, setNewAdminRole] = useState("Editor");

  const showToast = useCallback((type, message) => {
    setGlobalAlert({ type, message });
    window.clearTimeout(window.__psuToastTimer);
    window.__psuToastTimer = window.setTimeout(() => {
      setGlobalAlert({ type: "", message: "" });
    }, 4500);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await apiRequest("/api/auth/logout", { method: "POST" });
    } catch {
      // Abaikan error jaringan saat logout
    }
    localStorage.removeItem(USER_STORAGE_KEY);
    setAdminUser(null);
  }, []);

  // ==========================================================================
  // MUAT SELURUH DATA DASHBOARD DARI BACKEND
  // ==========================================================================
  const loadDashboardData = useCallback(
    async (activeToken = token) => {
      if (!activeToken) return;
      try {
        // 1. Artikel (termasuk Draft)
        const artRes = await apiRequest("/api/artikel?limit=500&all=1", {}, activeToken);
        if (artRes.ok && artRes.data.success && Array.isArray(artRes.data.data)) {
          setArticles(artRes.data.data);
        }

        // 2. Galeri Foto
        const galRes = await apiRequest("/api/galeri", {}, activeToken);
        if (galRes.ok && galRes.data.success && Array.isArray(galRes.data.data)) {
          setGallery(galRes.data.data);
        }

        // 3. Penulis (Authors)
        const authRes = await apiRequest("/api/authors", {}, activeToken);
        if (authRes.ok && authRes.data.success) {
          if (Array.isArray(authRes.data.data) && authRes.data.data.length > 0) {
            setAuthorsList(authRes.data.data);
          }
          if (Array.isArray(authRes.data.authorsMeta)) {
            setAuthorsMeta(authRes.data.authorsMeta);
          }
        }

        // 4. Statistik & Log Aktivitas
        const statsRes = await apiRequest("/api/admin/stats", {}, activeToken);
        if (statsRes.ok && statsRes.data.success) {
          setDbConnected(Boolean(statsRes.data.dbConnected));
          if (Array.isArray(statsRes.data.data?.recentLogs)) {
            setLogs(statsRes.data.data.recentLogs);
          }
        }

        // 5. Daftar Admin Users
        const usersRes = await apiRequest("/api/admin/users", {}, activeToken);
        if (usersRes.ok && usersRes.data.success && Array.isArray(usersRes.data.data)) {
          setAdminUsersList(usersRes.data.data);
        }
      } catch {
        // Jika backend belum dinyalakan, gunakan fallback data lokal
        setDbConnected(false);
      }
    },
    [token]
  );

  // Verifikasi Sesi JWT saat halaman dibuka (SEC-006: HttpOnly Cookie Authentication)
  useEffect(() => {
    let active = true;
    async function verifySession() {
      try {
        const res = await apiRequest("/api/auth/me");
        if (!active) return;
        if (res.ok && res.data.success && res.data.user) {
          setAdminUser(res.data.user);
          setProfileFullName(res.data.user.full_name || "");
          setProfileEmail(res.data.user.email || "");
          setDbConnected(Boolean(res.data.dbConnected));
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
          await loadDashboardData("authenticated");
        } else if (res.status === 401 || res.status === 403) {
          handleLogout();
        }
      } catch {
        // Gunakan data sesi tersimpan saat server API tidak tersedia.
        setDbConnected(false);
      } finally {
        if (active) setAuthChecking(false);
      }
    }
    verifySession();
    return () => {
      active = false;
    };
  }, [handleLogout, loadDashboardData]);

  // Sinkronisasi form ketika berpindah ke tab Tambah atau Edit
  const populateEditorFromArticle = useCallback(
    (item) => {
      if (!item) return;
      setEditingId(item.id || null);
      setEditingSlug(item.slug || "");
      setFormTitleId(item.title_id || "");
      setFormTitleEn(item.title_en || "");
      setFormCustomSlug(item.slug || "");
      setFormCategory(item.category || "News");
      setFormAuthor(item.author || authorsList[0] || AUTHOR_OPTIONS[0]);
      setFormPublishedAt(item.published_at ? String(item.published_at).slice(0, 10) : today);
      setFormStatus(item.status || "Published");
      setFormIsFeatured(Number(item.is_featured) === 1);
      setFormImageUrl(item.image_url || "/Logo_PSU_banner1.webp");
      const tagsArr = Array.isArray(item.tags) ? item.tags : [];
      setFormTagsInput(tagsArr.join(", "));
      setFormExcerptId(item.excerpt_id || "");
      setFormExcerptEn(item.excerpt_en || "");
      setFormContentId(item.content_id || "");
      setFormContentEn(item.content_en || "");
      setEditorViewMode("form");
    },
    [authorsList, today]
  );

  const resetCreateForm = useCallback(
    (preselectedImage = "") => {
      setEditingId(null);
      setEditingSlug("");
      setFormTitleId("");
      setFormTitleEn("");
      setFormCustomSlug("");
      setFormCategory("News");
      setFormAuthor(authorsList[0] || AUTHOR_OPTIONS[0]);
      setFormPublishedAt(today);
      setFormStatus("Published");
      setFormIsFeatured(false);
      setFormImageUrl(preselectedImage || "/Logo_PSU_banner1.webp");
      setFormTagsInput("News, PT Penilai Standar Uji, SNI, LSPro PSU");
      setFormExcerptId("");
      setFormExcerptEn("");
      setFormContentId("");
      setFormContentEn("");
      setEditorViewMode("form");
    },
    [authorsList, today]
  );

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const preselectImg = queryParams.get("image") || "";

    if (activeTab === "create") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Form fields must reset when the URL enters the create route.
      resetCreateForm(preselectImg);
    } else if (activeTab === "edit") {
      const targetSlug = routeSlug || editingSlug || (articles[0] ? articles[0].slug : "");
      const found =
        articles.find((a) => a.slug === targetSlug || String(a.id) === String(targetSlug)) ||
        articles[0];
      if (found) {
        populateEditorFromArticle(found);
        if (preselectImg) {
          setFormImageUrl(preselectImg);
        }
      }
    }
  }, [
    activeTab,
    routeSlug,
    articles,
    location.search,
    editingSlug,
    populateEditorFromArticle,
    resetCreateForm,
  ]);

  // ==========================================================================
  // HANDLER LOGIN ADMIN
  // ==========================================================================
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError("");
    setLoginLoading(true);

    try {
      const res = await apiRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: loginUsername.trim(),
          password: loginPassword,
        }),
      });

      if (res.ok && res.data.success && res.data.user) {
        // SEC-006: Simpan identitas pengguna untuk UI; token JWT tersimpan aman di HttpOnly Cookie
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
        setAdminUser(res.data.user);
        setProfileFullName(res.data.user.full_name || "");
        setProfileEmail(res.data.user.email || "");
        await loadDashboardData("authenticated");
      } else {
        setLoginError(res.data.message || "Login gagal. Periksa username dan password Anda.");
      }
    } catch {
      // Tidak ada bypass login: tanpa server API yang valid, akses admin ditolak.
      setLoginError(
        "Gagal terhubung ke server API. Pastikan layanan backend sedang aktif, lalu coba lagi."
      );
    } finally {
      setLoginLoading(false);
    }
  };

  // ==========================================================================
  // COMPUTED METRICS & FILTERED LISTS
  // ==========================================================================
  const dashboardStats = useMemo(() => {
    const total = articles.length;
    const published = articles.filter((a) => a.status === "Published").length;
    const draft = articles.filter((a) => a.status === "Draft").length;
    const featured = articles.filter((a) => Number(a.is_featured) === 1).length;
    const totalViews = articles.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

    const byCategory = {
      News: articles.filter((a) => a.category === "News").length,
      Article: articles.filter((a) => a.category === "Article").length,
      "Press Release": articles.filter((a) => a.category === "Press Release").length,
    };

    const tagMap = {};
    articles.forEach((a) => {
      const tags = Array.isArray(a.tags) ? a.tags : [];
      tags.forEach((t) => {
        tagMap[t] = (tagMap[t] || 0) + 1;
      });
    });
    const sortedTags = Object.entries(tagMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const uploadedMediaCount = gallery.filter(
      (g) => g.is_uploaded || String(g.image_url || "").startsWith("/news/")
    ).length;

    return {
      total,
      published,
      draft,
      featured,
      totalViews,
      byCategory,
      sortedTags,
      galleryTotal: gallery.length,
      uploadedMediaCount,
    };
  }, [articles, gallery]);

  const availableYears = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      if (a.published_at) set.add(String(a.published_at).slice(0, 4));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [articles]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = articles.filter((item) => {
      const matchCat = filterCategory === "All" || item.category === filterCategory;
      const matchStatus = filterStatus === "All" || item.status === filterStatus;
      const itemYear = item.published_at ? String(item.published_at).slice(0, 4) : "";
      const matchYear = filterYear === "All" || itemYear === filterYear;
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const matchSearch =
        !q ||
        String(item.title_id || "").toLowerCase().includes(q) ||
        String(item.title_en || "").toLowerCase().includes(q) ||
        String(item.author || "").toLowerCase().includes(q) ||
        String(item.slug || "").toLowerCase().includes(q) ||
        tags.some((t) => t.toLowerCase().includes(q));
      return matchCat && matchStatus && matchYear && matchSearch;
    });

    return [...list].sort((a, b) => {
      if (sortBy === "oldest") {
        return String(a.published_at || "").localeCompare(String(b.published_at || ""));
      }
      if (sortBy === "title") {
        return String(a.title_id || "").localeCompare(String(b.title_id || ""));
      }
      if (sortBy === "views") {
        return (Number(b.views) || 0) - (Number(a.views) || 0);
      }
      return String(b.published_at || "").localeCompare(String(a.published_at || ""));
    });
  }, [articles, searchQuery, filterCategory, filterStatus, filterYear, sortBy]);

  // Perkaya galeri dengan daftar penggunaan artikel secara real-time
  const enrichedGallery = useMemo(() => {
    return gallery.map((g) => {
      const usedIn = articles.filter((a) => a.image_url === g.image_url);
      return {
        ...g,
        is_uploaded: String(g.image_url || "").startsWith("/news/"),
        usage_count: usedIn.length,
        used_in_articles: usedIn,
      };
    });
  }, [gallery, articles]);

  const filteredGallery = useMemo(() => {
    const q = gallerySearch.trim().toLowerCase();
    return enrichedGallery.filter((item) => {
      const matchFilter =
        galleryFilter === "All" ||
        (galleryFilter === "Uploaded" && item.is_uploaded) ||
        (galleryFilter === "Preset" && !item.is_uploaded) ||
        (galleryFilter === "Used" && item.usage_count > 0) ||
        (galleryFilter === "Unused" && item.usage_count === 0);

      const matchSearch =
        !q ||
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.filename || "").toLowerCase().includes(q) ||
        String(item.image_url || "").toLowerCase().includes(q) ||
        String(item.category || "").toLowerCase().includes(q);

      return matchFilter && matchSearch;
    });
  }, [enrichedGallery, gallerySearch, galleryFilter]);

  const filteredPickerGallery = useMemo(() => {
    const q = pickerSearch.trim().toLowerCase();
    return enrichedGallery.filter((item) => {
      const matchFilter =
        pickerFilter === "All" ||
        (pickerFilter === "Uploaded" && item.is_uploaded) ||
        (pickerFilter === "Preset" && !item.is_uploaded);
      const matchSearch =
        !q ||
        String(item.title || "").toLowerCase().includes(q) ||
        String(item.filename || "").toLowerCase().includes(q) ||
        String(item.image_url || "").toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [enrichedGallery, pickerSearch, pickerFilter]);

  // ==========================================================================
  // HANDLERS: TAMBAH, EDIT, STATUS, BULK, & HAPUS ARTIKEL
  // ==========================================================================
  const parsedFormTags = useMemo(
    () =>
      formTagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    [formTagsInput]
  );

  const toggleTagInForm = (tagVal) => {
    const exists = parsedFormTags.some((t) => t.toLowerCase() === tagVal.toLowerCase());
    if (exists) {
      const next = parsedFormTags.filter((t) => t.toLowerCase() !== tagVal.toLowerCase());
      setFormTagsInput(next.join(", "));
    } else {
      setFormTagsInput([...parsedFormTags, tagVal].join(", "));
    }
  };

  const handleUploadImageFile = async (e, isFromGalleryMenu = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isFromGalleryMenu) {
      setUploadingGalleryPhoto(true);
    } else {
      setUploadingCover(true);
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result;
      try {
        const res = await apiRequest(
          "/api/upload-gambar",
          {
            method: "POST",
            body: JSON.stringify({
              filename: file.name,
              dataUrl,
              title: isFromGalleryMenu
                ? newPhotoTitle.trim() || file.name.replace(/\.[^/.]+$/, "")
                : formTitleId.trim() || file.name.replace(/\.[^/.]+$/, ""),
              category: isFromGalleryMenu ? newPhotoCategory : "Artikel Upload",
              alt_text: isFromGalleryMenu ? newPhotoAlt.trim() : formTitleId.trim(),
            }),
          },
          token
        );

        if (res.ok && res.data.success && res.data.image_url) {
          if (!isFromGalleryMenu) {
            setFormImageUrl(res.data.image_url);
          } else {
            setNewPhotoTitle("");
            setNewPhotoAlt("");
          }
          await loadDashboardData(token);
          showToast("success", "Foto berhasil diunggah dan tersimpan di Galeri Foto!");
        } else {
          throw new Error(res.data?.message || "Gagal mengunggah foto.");
        }
      } catch (err) {
        if (!isFromGalleryMenu) {
          setFormImageUrl(String(dataUrl));
        }
        showToast("error", err.message || "Gagal mengunggah gambar ke server.");
      } finally {
        setUploadingCover(false);
        setUploadingGalleryPhoto(false);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveArticle = async (e) => {
    e.preventDefault();
    if (!formTitleId.trim()) {
      showToast("error", "Judul berita/artikel (Bahasa Indonesia) wajib diisi.");
      return;
    }
    if (!formContentId.trim()) {
      showToast("error", "Isi lengkap berita/artikel wajib diisi.");
      return;
    }

    setSavingArticle(true);
    const isEditMode = activeTab === "edit";
    const autoExcerptId =
      formExcerptId.trim() ||
      formContentId.trim().replace(/\s+/g, " ").slice(0, 190) + "...";
    const autoExcerptEn =
      (formExcerptEn || formExcerptId).trim() ||
      (formContentEn || formContentId).trim().replace(/\s+/g, " ").slice(0, 190) + "...";

    const payload = {
      title_id: formTitleId.trim(),
      title_en: (formTitleEn || formTitleId).trim(),
      custom_slug: formCustomSlug.trim() || slugifyText(formTitleId),
      category: formCategory,
      author: formAuthor,
      published_at: formPublishedAt || today,
      status: formStatus,
      is_featured: formIsFeatured ? 1 : 0,
      image_url: formImageUrl.trim() || "/Logo_PSU_banner1.webp",
      tags: parsedFormTags.length > 0 ? parsedFormTags : [formCategory, "PT Penilai Standar Uji"],
      excerpt_id: autoExcerptId,
      excerpt_en: autoExcerptEn,
      content_id: formContentId.trim(),
      content_en: (formContentEn || formContentId).trim(),
    };

    try {
      const targetIdentifier = editingId || editingSlug;
      const endpoint = isEditMode
        ? `/api/artikel/${encodeURIComponent(targetIdentifier)}`
        : "/api/artikel";
      const method = isEditMode ? "PUT" : "POST";

      const res = await apiRequest(
        endpoint,
        {
          method,
          body: JSON.stringify(payload),
        },
        token
      );

      if (res.ok && res.data.success) {
        await loadDashboardData(token);
        showToast(
          "success",
          isEditMode
            ? "Perubahan artikel berhasil disimpan!"
            : "Artikel baru berhasil ditambahkan ke database!"
        );
        navigate("/dashboard-artikel/kelola");
      } else {
        throw new Error(res.data?.message || "Gagal menyimpan artikel.");
      }
    } catch (err) {
      showToast("error", err.message || "Terjadi kesalahan saat menyimpan artikel.");
    } finally {
      setSavingArticle(false);
    }
  };

  const handleQuickToggleStatus = async (item) => {
    const nextStatus = item.status === "Published" ? "Draft" : "Published";
    try {
      const res = await apiRequest(
        `/api/artikel/${encodeURIComponent(item.id || item.slug)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status: nextStatus }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setArticles((prev) =>
          prev.map((a) => (a.slug === item.slug ? { ...a, status: nextStatus } : a))
        );
        showToast("success", `Status artikel diubah menjadi ${nextStatus}.`);
      }
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah status artikel.");
    }
  };

  const handleQuickToggleFeatured = async (item) => {
    const nextFeatured = Number(item.is_featured) === 1 ? 0 : 1;
    try {
      const res = await apiRequest(
        `/api/artikel/${encodeURIComponent(item.id || item.slug)}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ is_featured: nextFeatured }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setArticles((prev) =>
          prev.map((a) => (a.slug === item.slug ? { ...a, is_featured: nextFeatured } : a))
        );
        showToast(
          "success",
          nextFeatured
            ? "Artikel ditandai sebagai Unggulan (Featured)."
            : "Tanda artikel unggulan dilepas."
        );
      }
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui status unggulan.");
    }
  };

  const handleDuplicateArticle = async (item) => {
    try {
      const payload = {
        title_id: `${item.title_id} (Salinan)`,
        title_en: `${item.title_en || item.title_id} (Copy)`,
        category: item.category || "News",
        author: item.author || AUTHOR_OPTIONS[0],
        published_at: today,
        status: "Draft",
        is_featured: 0,
        image_url: item.image_url || "/Logo_PSU_banner1.webp",
        tags: Array.isArray(item.tags) ? item.tags : ["News"],
        excerpt_id: item.excerpt_id || "",
        excerpt_en: item.excerpt_en || "",
        content_id: item.content_id || "",
        content_en: item.content_en || "",
      };
      const res = await apiRequest(
        "/api/artikel",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );
      if (res.ok && res.data.success) {
        await loadDashboardData(token);
        showToast("success", "Artikel berhasil diduplikasi sebagai Draft!");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menduplikasi artikel.");
    }
  };

  const handleConfirmDeleteArticle = async () => {
    if (!deleteTargetArticle) return;
    setDeletingArticle(true);
    try {
      const targetId = deleteTargetArticle.id || deleteTargetArticle.slug;
      const res = await apiRequest(
        `/api/artikel/${encodeURIComponent(targetId)}`,
        { method: "DELETE" },
        token
      );
      if (res.ok && res.data.success) {
        setDeleteTargetArticle(null);
        await loadDashboardData(token);
        showToast("success", "Artikel berhasil dihapus secara permanen.");
        if (activeTab === "edit") {
          navigate("/dashboard-artikel/kelola");
        }
      } else {
        throw new Error(res.data?.message || "Gagal menghapus artikel.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus artikel.");
    } finally {
      setDeletingArticle(false);
    }
  };

  const handleBulkAction = async (actionType) => {
    if (selectedArticleIds.length === 0) return;
    if (
      actionType === "delete" &&
      !window.confirm(`Hapus ${selectedArticleIds.length} artikel yang dipilih secara permanen?`)
    ) {
      return;
    }
    try {
      const res = await apiRequest(
        "/api/artikel/bulk",
        {
          method: "POST",
          body: JSON.stringify({ ids: selectedArticleIds, action: actionType }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setSelectedArticleIds([]);
        await loadDashboardData(token);
        showToast("success", res.data.message || "Aksi massal berhasil dijalankan.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menjalankan aksi massal.");
    }
  };

  const handleExportCsv = () => {
    const headers = [
      "ID",
      "Slug",
      "Judul (ID)",
      "Kategori",
      "Penulis",
      "Tanggal Publikasi",
      "Status",
      "Views",
      "Gambar Sampul",
    ];
    const rows = filteredArticles.map((a) => [
      a.id || "",
      `"${String(a.slug || "").replace(/"/g, '""')}"`,
      `"${String(a.title_id || "").replace(/"/g, '""')}"`,
      a.category || "",
      `"${String(a.author || "").replace(/"/g, '""')}"`,
      a.published_at || "",
      a.status || "",
      a.views || 0,
      a.image_url || "",
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `daftar-artikel-psu-${today}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // ==========================================================================
  // HANDLERS: GALERI FOTO (UPDATE LABEL, HAPUS, GUNAKAN KEMBALI)
  // ==========================================================================
  const handleSaveMediaEdit = async (e) => {
    e.preventDefault();
    if (!editingMediaItem) return;
    try {
      const res = await apiRequest(
        `/api/galeri/${editingMediaItem.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title: editMediaTitle,
            alt_text: editMediaAlt,
            category: editMediaCategory,
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setEditingMediaItem(null);
        await loadDashboardData(token);
        showToast("success", "Informasi foto galeri berhasil diperbarui.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui informasi foto.");
    }
  };

  const handleDeleteMediaItem = async (item) => {
    const confirmMsg =
      item.usage_count > 0
        ? `Foto "${item.title}" sedang digunakan pada ${item.usage_count} artikel. Tetap hapus dari galeri?`
        : `Apakah Anda yakin ingin menghapus foto "${item.title}" dari galeri?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await apiRequest(
        `/api/galeri/${item.id}?force=1`,
        { method: "DELETE" },
        token
      );
      if (res.ok && res.data.success) {
        await loadDashboardData(token);
        showToast("success", "Foto berhasil dihapus dari galeri.");
      } else {
        throw new Error(res.data?.message || "Gagal menghapus foto.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus foto.");
    }
  };

  // ==========================================================================
  // HANDLERS: PENULIS, TAG, & PENGATURAN AKUN ADMIN
  // ==========================================================================
  const handleAddAuthor = async (e) => {
    e.preventDefault();
    if (!newAuthorName.trim()) return;
    try {
      const res = await apiRequest(
        "/api/authors",
        {
          method: "POST",
          body: JSON.stringify({
            name: newAuthorName.trim(),
            role_title: newAuthorRole.trim() || "Tim Redaksi PSU",
            division: newAuthorDivision.trim() || "Corporate Communication",
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setNewAuthorName("");
        setNewAuthorRole("");
        setNewAuthorDivision("");
        await loadDashboardData(token);
        showToast("success", "Penulis baru berhasil ditambahkan ke database.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menambahkan penulis.");
    }
  };

  const handleDeleteAuthor = async (id) => {
    try {
      const res = await apiRequest(`/api/authors/${id}`, { method: "DELETE" }, token);
      if (res.ok && res.data.success) {
        await loadDashboardData(token);
        showToast("success", "Penulis berhasil dihapus.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus penulis.");
    }
  };

  const handleRenameTag = async (e) => {
    e.preventDefault();
    if (!renamingTagOld.trim() || !renamingTagNew.trim()) return;
    try {
      const res = await apiRequest(
        "/api/admin/tags/rename",
        {
          method: "POST",
          body: JSON.stringify({
            oldTag: renamingTagOld.trim(),
            newTag: renamingTagNew.trim(),
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setRenamingTagOld("");
        setRenamingTagNew("");
        await loadDashboardData(token);
        showToast("success", res.data.message);
      }
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah nama tag.");
    }
  };

  const handleDeleteTagGlobal = async (tagName) => {
    if (!window.confirm(`Hapus tag "${tagName}" dari seluruh artikel?`)) return;
    try {
      const res = await apiRequest(
        "/api/admin/tags/delete",
        {
          method: "POST",
          body: JSON.stringify({ tag: tagName }),
        },
        token
      );
      if (res.ok && res.data.success) {
        await loadDashboardData(token);
        showToast("success", res.data.message);
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menghapus tag.");
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(
        "/api/auth/profile",
        {
          method: "PUT",
          body: JSON.stringify({
            full_name: profileFullName,
            email: profileEmail,
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setAdminUser(res.data.user);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user));
        showToast("success", "Profil akun admin berhasil diperbarui.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal memperbarui profil.");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      showToast("error", "Konfirmasi password baru tidak cocok.");
      return;
    }
    try {
      const res = await apiRequest(
        "/api/auth/password",
        {
          method: "PUT",
          body: JSON.stringify({
            currentPassword,
            newPassword,
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
        showToast("success", "Password akun admin berhasil diperbarui!");
      } else {
        throw new Error(res.data?.message || "Gagal mengubah password.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal mengubah password.");
    }
  };

  const handleCreateAdminUser = async (e) => {
    e.preventDefault();
    try {
      const res = await apiRequest(
        "/api/admin/users",
        {
          method: "POST",
          body: JSON.stringify({
            username: newAdminUsername,
            email: newAdminEmail,
            full_name: newAdminFullName,
            password: newAdminPassword,
            role: newAdminRole,
          }),
        },
        token
      );
      if (res.ok && res.data.success) {
        setNewAdminUsername("");
        setNewAdminEmail("");
        setNewAdminFullName("");
        setNewAdminPassword("");
        await loadDashboardData(token);
        showToast("success", "Akun admin/editor baru berhasil ditambahkan!");
      } else {
        throw new Error(res.data?.message || "Gagal menambahkan akun admin.");
      }
    } catch (err) {
      showToast("error", err.message || "Gagal menambahkan akun admin.");
    }
  };

  // ==========================================================================
  // RENDER 1: HALAMAN LOGIN ADMIN (JIKA BELUM MEMILIKI SESI JWT VALID)
  // ==========================================================================
  if (authChecking) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card" style={{ textAlign: "center" }}>
          <p style={{ margin: 0, fontWeight: 600, color: "#0b2a5b" }}>
            Memverifikasi sesi keamanan JWT Dashboard Artikel...
          </p>
        </div>
      </div>
    );
  }

  if (!token || !adminUser) {
    return (
      <div className="admin-auth-page">
        <div className="admin-auth-card">
          <div className="admin-auth-brand">
            <img
              src="/Logo_PSU1.webp"
              alt="PT Penilai Standar Uji"
              className="admin-auth-brand__logo"
            />
            <span className="admin-auth-brand__badge">JWT Protected CMS</span>
          </div>

          <h1 className="admin-auth-title">Login Dashboard Artikel</h1>
          <p className="admin-auth-subtitle">
            Silakan masuk menggunakan akun Administrator atau Tim Redaksi PT Penilai Standar Uji
            untuk mengelola berita, artikel, siaran pers, dan galeri foto.
          </p>

          {loginError && (
            <div className="news-form-alert news-form-alert--error" role="alert">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="admin-auth-field">
              <label className="admin-auth-label" htmlFor="admin-username">
                Username atau Email Admin
              </label>
              <div className="admin-auth-input-wrap">
                <input
                  id="admin-username"
                  type="text"
                  className="admin-auth-input"
                  placeholder="Masukkan username (mis. admin)"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="admin-auth-field">
              <label className="admin-auth-label" htmlFor="admin-password">
                Kata Sandi (Password)
              </label>
              <div className="admin-auth-input-wrap">
                <input
                  id="admin-password"
                  type={showLoginPass ? "text" : "password"}
                  className="admin-auth-input"
                  placeholder="Masukkan password admin..."
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-auth-eye"
                  onClick={() => setShowLoginPass((v) => !v)}
                  title={showLoginPass ? "Sembunyikan Password" : "Lihat Password"}
                >
                  {showLoginPass ? "Sembunyikan" : "Lihat"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-auth-submit"
              disabled={loginLoading}
            >
              {loginLoading ? "Memverifikasi Kredensial..." : "Masuk ke Dashboard Artikel →"}
            </button>
          </form>

          <div className="admin-auth-footer">
            <Link to="/artikel">&larr; Lihat Halaman Artikel Publik</Link>
            <Link to="/">Beranda Website</Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // RENDER 2: SHELL UTAMA DASHBOARD ARTIKEL ADMIN
  // ==========================================================================
  const switchTab = (tabKey, customSlug = "") => {
    setSidebarOpen(false);
    const routeMap = {
      overview: "/dashboard-artikel",
      articles: "/dashboard-artikel/kelola",
      create: "/dashboard-artikel/tambah",
      edit: customSlug
        ? `/dashboard-artikel/edit/${encodeURIComponent(customSlug)}`
        : "/dashboard-artikel/edit",
      gallery: "/dashboard-artikel/galeri",
      taxonomy: "/dashboard-artikel/taksonomi",
      settings: "/dashboard-artikel/pengaturan",
    };
    navigate(routeMap[tabKey] || "/dashboard-artikel");
  };

  return (
    <div className="cms-shell">
      {/* SIDEBAR NAVIGASI DASHBOARD */}
      <aside className={`cms-sidebar ${sidebarOpen ? "is-open" : ""}`}>
        <div className="cms-sidebar__brand">
          <div className="cms-sidebar__logo-wrap">
            <img src="/Logo_PSU.webp" alt="Logo PSU" className="cms-sidebar__logo" />
          </div>
          <div className="cms-sidebar__brand-text">
            <span className="cms-sidebar__brand-title">PSU Artikel CMS</span>
            <span className="cms-sidebar__brand-sub">Dashboard Admin & Media</span>
          </div>
        </div>

        <nav className="cms-sidebar__nav" aria-label="Menu Dashboard Artikel">
          <div className="cms-sidebar__section-label">Menu Utama</div>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "overview" ? "is-active" : ""}`}
            onClick={() => switchTab("overview")}
          >
            <span className="cms-nav-btn__left">
              <span>📊</span>
              <span>Ringkasan & Statistik</span>
            </span>
          </button>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "articles" ? "is-active" : ""}`}
            onClick={() => switchTab("articles")}
          >
            <span className="cms-nav-btn__left">
              <span>📰</span>
              <span>Kelola Semua Artikel</span>
            </span>
            <span className="cms-nav-badge">{dashboardStats.total}</span>
          </button>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "create" ? "is-active" : ""}`}
            onClick={() => switchTab("create")}
          >
            <span className="cms-nav-btn__left">
              <span>✍️</span>
              <span>Tambah Artikel Baru</span>
            </span>
          </button>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "edit" ? "is-active" : ""}`}
            onClick={() => switchTab("edit", editingSlug || articles[0]?.slug)}
          >
            <span className="cms-nav-btn__left">
              <span>📝</span>
              <span>Edit Artikel</span>
            </span>
          </button>

          <div className="cms-sidebar__section-label">Media & Organisasi Konten</div>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "gallery" ? "is-active" : ""}`}
            onClick={() => switchTab("gallery")}
          >
            <span className="cms-nav-btn__left">
              <span>🖼️</span>
              <span>Galeri Foto Artikel</span>
            </span>
            <span className="cms-nav-badge">{dashboardStats.galleryTotal}</span>
          </button>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "taxonomy" ? "is-active" : ""}`}
            onClick={() => switchTab("taxonomy")}
          >
            <span className="cms-nav-btn__left">
              <span>🏷️</span>
              <span>Penulis & Kategori/Tag</span>
            </span>
          </button>

          <div className="cms-sidebar__section-label">Sistem & Keamanan</div>

          <button
            type="button"
            className={`cms-nav-btn ${activeTab === "settings" ? "is-active" : ""}`}
            onClick={() => switchTab("settings")}
          >
            <span className="cms-nav-btn__left">
              <span>🔐</span>
              <span>Log & Akun Admin (JWT)</span>
            </span>
          </button>
        </nav>

        <div className="cms-sidebar__footer">
          <div className="cms-user-mini">
            <div className="cms-user-mini__avatar">
              {String(adminUser.full_name || adminUser.username || "A")
                .charAt(0)
                .toUpperCase()}
            </div>
            <div className="cms-user-mini__info">
              <div className="cms-user-mini__name">
                {adminUser.full_name || adminUser.username}
              </div>
              <div className="cms-user-mini__role">{adminUser.role || "Super Admin"}</div>
            </div>
          </div>

          <button type="button" className="cms-logout-btn" onClick={handleLogout}>
            <span>Keluar Sesi (Logout)</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className={`cms-sidebar-backdrop${sidebarOpen ? " is-visible" : ""}`}
        aria-label="Tutup Menu Sidebar"
        onClick={() => setSidebarOpen(false)}
      />

      {/* AREA KONTEN UTAMA */}
      <div className="cms-main">
        {/* TOPBAR */}
        <header className="cms-topbar">
          <div className="cms-topbar__left">
            <button
              type="button"
              className="cms-mobile-toggle"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle Menu Sidebar"
            >
              ☰ Menu
            </button>
            <div className="cms-topbar__heading">
              <h1 className="cms-topbar__title">
                {activeTab === "overview" && "Ringkasan & Analitik Artikel"}
                {activeTab === "articles" && "Manajemen Berita, Artikel & Press Release"}
                {activeTab === "create" && "Tambah Berita / Artikel Baru"}
                {activeTab === "edit" && "Edit & Perbarui Artikel"}
                {activeTab === "gallery" && "Galeri Foto Artikel (Media Library)"}
                {activeTab === "taxonomy" && "Manajemen Penulis, Kategori & Tag"}
                {activeTab === "settings" && "Log Aktivitas & Pengaturan Keamanan JWT"}
              </h1>
              <span
                className={`cms-status-pill ${
                  dbConnected ? "cms-status-pill--online" : "cms-status-pill--fallback"
                }`}
                title={
                  dbConnected
                    ? "Terhubung ke Database MySQL psu_company_profile"
                    : "Menggunakan Penyimpanan Fallback Lokal"
                }
              >
                <span className="cms-status-dot" />
                <span>{dbConnected ? "MySQL Terhubung" : "Mode Fallback"}</span>
              </span>
            </div>
          </div>

          <div className="cms-topbar__right">
            <div className="cms-topbar__actions">
              <button
                type="button"
                className="news-btn news-btn--primary"
                style={{ height: "38px", padding: "0 16px", fontSize: "0.84rem" }}
                onClick={() => switchTab("create")}
              >
                + Tulis Artikel Baru
              </button>

              <Link
                to="/artikel"
                className="news-btn news-btn--secondary"
                style={{ height: "38px", padding: "0 14px", fontSize: "0.84rem" }}
              >
                Lihat Halaman Publik
              </Link>
            </div>
          </div>
        </header>

        <div className="cms-content">
          {globalAlert.message && (
            <div
              className={`news-form-alert ${
                globalAlert.type === "error"
                  ? "news-form-alert--error"
                  : "news-form-alert--success"
              }`}
              role="status"
            >
              {globalAlert.message}
            </div>
          )}

          {/* ================================================================
              TAB 1: RINGKASAN & STATISTIK (OVERVIEW)
              ================================================================ */}
          {activeTab === "overview" && (
            <>
              <div className="cms-kpi-grid">
                <div className="cms-kpi-card">
                  <div>
                    <div className="cms-kpi-card__label">Total Seluruh Artikel</div>
                    <div className="cms-kpi-card__value">{dashboardStats.total}</div>
                    <div className="cms-kpi-card__sub">
                      {dashboardStats.featured} ditandai sebagai unggulan (★)
                    </div>
                  </div>
                  <div className="cms-kpi-card__icon cms-kpi-card__icon--blue">📰</div>
                </div>

                <div className="cms-kpi-card">
                  <div>
                    <div className="cms-kpi-card__label">Status Publikasi</div>
                    <div className="cms-kpi-card__value">
                      {dashboardStats.published}{" "}
                      <span style={{ fontSize: "0.95rem", color: "#64748b", fontWeight: 600 }}>
                        Published
                      </span>
                    </div>
                    <div className="cms-kpi-card__sub">
                      {dashboardStats.draft} disimpan sebagai konsep (Draft)
                    </div>
                  </div>
                  <div className="cms-kpi-card__icon cms-kpi-card__icon--green">✅</div>
                </div>

                <div className="cms-kpi-card">
                  <div>
                    <div className="cms-kpi-card__label">Galeri Foto Artikel</div>
                    <div className="cms-kpi-card__value">{dashboardStats.galleryTotal}</div>
                    <div className="cms-kpi-card__sub">
                      {dashboardStats.uploadedMediaCount} foto upload (/news/) siap pakai ulang
                    </div>
                  </div>
                  <div className="cms-kpi-card__icon cms-kpi-card__icon--purple">🖼️</div>
                </div>

                <div className="cms-kpi-card">
                  <div>
                    <div className="cms-kpi-card__label">Total Pembaca (Views)</div>
                    <div className="cms-kpi-card__value">
                      {dashboardStats.totalViews.toLocaleString("id-ID")}
                    </div>
                    <div className="cms-kpi-card__sub">
                      Akumulasi kunjungan halaman detail artikel
                    </div>
                  </div>
                  <div className="cms-kpi-card__icon cms-kpi-card__icon--amber">👁️</div>
                </div>
              </div>

              <div className="cms-grid-2col">
                {/* Daftar Artikel Terbaru dengan Aksi Cepat */}
                <div className="cms-card" style={{ marginBottom: 0 }}>
                  <div className="cms-card__header">
                    <div>
                      <h2 className="cms-card__title">Artikel & Berita Terbaru</h2>
                      <p className="cms-card__subtitle">
                        Klik Edit untuk memperbarui konten atau ganti foto dari Galeri
                      </p>
                    </div>
                    <button
                      type="button"
                      className="cms-icon-btn cms-icon-btn--primary"
                      onClick={() => switchTab("articles")}
                    >
                      Lihat Semua ({articles.length}) &rarr;
                    </button>
                  </div>

                  <div className="cms-table-wrap">
                    <table className="cms-table">
                      <thead>
                        <tr>
                          <th>Artikel</th>
                          <th>Kategori</th>
                          <th>Status</th>
                          <th>Aksi Cepat</th>
                        </tr>
                      </thead>
                      <tbody>
                        {articles.slice(0, 6).map((item) => (
                          <tr key={item.slug}>
                            <td>
                              <div className="cms-article-cell">
                                <img
                                  src={item.image_url}
                                  alt={item.title_id}
                                  className="cms-article-thumb"
                                />
                                <div>
                                  <div className="cms-article-title">{item.title_id}</div>
                                  <div className="cms-article-slug">
                                    {formatIndoDate(item.published_at)} &bull; {item.author}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>
                              <span
                                className={`cms-badge ${
                                  item.category === "Press Release"
                                    ? "cms-badge--press"
                                    : item.category === "Article"
                                    ? "cms-badge--article"
                                    : "cms-badge--news"
                                }`}
                              >
                                {item.category}
                              </span>
                            </td>
                            <td>
                              <span
                                className={`cms-badge ${
                                  item.status === "Published"
                                    ? "cms-badge--published"
                                    : "cms-badge--draft"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>
                              <div className="cms-action-group">
                                <button
                                  type="button"
                                  className="cms-icon-btn cms-icon-btn--primary"
                                  onClick={() => {
                                    populateEditorFromArticle(item);
                                    switchTab("edit", item.slug);
                                  }}
                                >
                                  Edit
                                </button>
                                <Link
                                  to={`/artikel/${item.slug}`}
                                  className="cms-icon-btn"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Lihat
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Distribusi Kategori & Pintasan Galeri */}
                <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div className="cms-card" style={{ marginBottom: 0 }}>
                    <div className="cms-card__header">
                      <div>
                        <h2 className="cms-card__title">Distribusi Kategori Konten</h2>
                        <p className="cms-card__subtitle">
                          Proporsi Berita, Artikel & Siaran Pers PSU
                        </p>
                      </div>
                    </div>

                    <div className="cms-bar-list">
                      {Object.entries(dashboardStats.byCategory).map(([catName, count]) => {
                        const pct =
                          dashboardStats.total > 0
                            ? Math.round((count / dashboardStats.total) * 100)
                            : 0;
                        return (
                          <div key={catName}>
                            <div className="cms-bar-item__top">
                              <span>{catName}</span>
                              <span>
                                {count} artikel ({pct}%)
                              </span>
                            </div>
                            <div className="cms-bar-track">
                              <div className="cms-bar-fill" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div
                      style={{
                        marginTop: "20px",
                        paddingTop: "16px",
                        borderTop: "1px solid #e2e8f0",
                        display: "flex",
                        gap: "10px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        type="button"
                        className="cms-icon-btn cms-icon-btn--primary"
                        onClick={() => switchTab("gallery")}
                      >
                        🖼️ Buka Galeri Foto ({dashboardStats.galleryTotal})
                      </button>
                      <button
                        type="button"
                        className="cms-icon-btn"
                        onClick={() => switchTab("taxonomy")}
                      >
                        🏷️ Kelola Penulis & Tag
                      </button>
                    </div>
                  </div>

                  {/* Log Aktivitas Terakhir */}
                  <div className="cms-card" style={{ marginBottom: 0 }}>
                    <div className="cms-card__header">
                      <div>
                        <h2 className="cms-card__title">Aktivitas Admin Terbaru</h2>
                        <p className="cms-card__subtitle">Riwayat perubahan sesi & konten</p>
                      </div>
                      <button
                        type="button"
                        className="cms-icon-btn"
                        onClick={() => switchTab("settings")}
                      >
                        Detail Log
                      </button>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {logs.slice(0, 4).map((logItem) => (
                        <div
                          key={logItem.id}
                          style={{
                            padding: "10px 12px",
                            borderRadius: "10px",
                            background: "#f8fafc",
                            border: "1px solid #e2e8f0",
                            fontSize: "0.8rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontWeight: 700,
                              color: "#0b2a5b",
                              marginBottom: "2px",
                            }}
                          >
                            <span>
                              [{logItem.action_type}] {logItem.target_title}
                            </span>
                            <span style={{ color: "#64748b", fontWeight: 500 }}>
                              @{logItem.admin_username}
                            </span>
                          </div>
                          <div style={{ color: "#475569" }}>{logItem.details}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              TAB 2: KELOLA SEMUA ARTIKEL (DAFTAR, FILTER, BULK, QUICK EDIT)
              ================================================================ */}
          {activeTab === "articles" && (
            <div className="cms-card">
              <div className="cms-card__header">
                <div>
                  <h2 className="cms-card__title">
                    Daftar Seluruh Berita, Artikel & Press Release ({filteredArticles.length})
                  </h2>
                  <p className="cms-card__subtitle">
                    Kelola publikasi, ubah status Draft/Published secara instan, atau buka editor
                    artikel terintegrasi.
                  </p>
                </div>

                <div className="cms-action-group">
                  <button type="button" className="cms-icon-btn" onClick={handleExportCsv}>
                    ⬇ Ekspor CSV
                  </button>
                  <button
                    type="button"
                    className="news-btn news-btn--primary"
                    style={{ height: "38px", padding: "0 16px", fontSize: "0.84rem" }}
                    onClick={() => switchTab("create")}
                  >
                    + Tambah Artikel Baru
                  </button>
                </div>
              </div>

              {/* Filter & Pencarian */}
              <div className="cms-toolbar">
                <div className="cms-toolbar__filters">
                  <input
                    type="search"
                    className="cms-search-input"
                    placeholder="Cari judul, penulis, tag, atau slug..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    className="cms-select"
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                  >
                    <option value="All">Semua Kategori</option>
                    <option value="News">News (Berita)</option>
                    <option value="Article">Article (Artikel)</option>
                    <option value="Press Release">Press Release (Siaran Pers)</option>
                  </select>

                  <select
                    className="cms-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="All">Semua Status</option>
                    <option value="Published">Published (Tayang)</option>
                    <option value="Draft">Draft (Konsep)</option>
                  </select>

                  <select
                    className="cms-select"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="All">Semua Tahun</option>
                    {availableYears.map((yr) => (
                      <option key={yr} value={yr}>
                        Tahun {yr}
                      </option>
                    ))}
                  </select>

                  <select
                    className="cms-select"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="newest">Urutkan: Terbaru</option>
                    <option value="oldest">Urutkan: Terlama</option>
                    <option value="views">Urutkan: Pembaca Terbanyak</option>
                    <option value="title">Urutkan: Judul (A-Z)</option>
                  </select>
                </div>
              </div>

              {/* Bar Aksi Massal (Bulk Actions) */}
              {selectedArticleIds.length > 0 && (
                <div className="cms-bulk-bar">
                  <div>
                    <strong>{selectedArticleIds.length} artikel</strong> dipilih
                  </div>
                  <div className="cms-action-group">
                    <button
                      type="button"
                      className="cms-icon-btn cms-icon-btn--primary"
                      onClick={() => handleBulkAction("publish")}
                    >
                      Set Published Massal
                    </button>
                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() => handleBulkAction("draft")}
                    >
                      Set Draft Massal
                    </button>
                    <button
                      type="button"
                      className="cms-icon-btn cms-icon-btn--danger"
                      onClick={() => handleBulkAction("delete")}
                    >
                      Hapus Terpilih
                    </button>
                    <button
                      type="button"
                      className="cms-icon-btn"
                      onClick={() => setSelectedArticleIds([])}
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>
              )}

              {/* Tabel Artikel */}
              <div className="cms-table-wrap">
                <table className="cms-table">
                  <thead>
                    <tr>
                      <th style={{ width: "36px" }}>
                        <input
                          type="checkbox"
                          checked={
                            filteredArticles.length > 0 &&
                            selectedArticleIds.length === filteredArticles.length
                          }
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedArticleIds(
                                filteredArticles.map((a) => a.id).filter(Boolean)
                              );
                            } else {
                              setSelectedArticleIds([]);
                            }
                          }}
                        />
                      </th>
                      <th style={{ width: "36px" }} title="Artikel Unggulan">
                        ★
                      </th>
                      <th>Artikel & Sampul</th>
                      <th>Kategori</th>
                      <th>Penulis</th>
                      <th>Tanggal</th>
                      <th>Status (Klik Ubah)</th>
                      <th>Views</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((item) => {
                      const isChecked = selectedArticleIds.includes(item.id);
                      return (
                        <tr key={item.slug}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedArticleIds((prev) => [...prev, item.id]);
                                } else {
                                  setSelectedArticleIds((prev) =>
                                    prev.filter((id) => id !== item.id)
                                  );
                                }
                              }}
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`cms-star-btn ${
                                Number(item.is_featured) === 1 ? "is-featured" : ""
                              }`}
                              onClick={() => handleQuickToggleFeatured(item)}
                              title="Tandai sebagai Artikel Unggulan"
                            >
                              ★
                            </button>
                          </td>
                          <td>
                            <div className="cms-article-cell">
                              <img
                                src={item.image_url}
                                alt={item.title_id}
                                className="cms-article-thumb"
                              />
                              <div>
                                <div className="cms-article-title">{item.title_id}</div>
                                <div className="cms-article-slug">
                                  /{item.slug} &bull;{" "}
                                  {Array.isArray(item.tags) ? `${item.tags.length} tag` : "0 tag"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span
                              className={`cms-badge ${
                                item.category === "Press Release"
                                  ? "cms-badge--press"
                                  : item.category === "Article"
                                  ? "cms-badge--article"
                                  : "cms-badge--news"
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td>{item.author || "Corporate Secretary PSU"}</td>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {formatIndoDate(item.published_at)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleQuickToggleStatus(item)}
                              className={`cms-badge ${
                                item.status === "Published"
                                  ? "cms-badge--published"
                                  : "cms-badge--draft"
                              }`}
                              style={{ border: "none", cursor: "pointer" }}
                              title="Klik untuk mengganti status Published / Draft"
                            >
                              {item.status === "Published" ? "● Published" : "○ Draft"}
                            </button>
                          </td>
                          <td>{(Number(item.views) || 0).toLocaleString("id-ID")}</td>
                          <td>
                            <div className="cms-action-group">
                              <button
                                type="button"
                                className="cms-icon-btn cms-icon-btn--primary"
                                onClick={() => {
                                  populateEditorFromArticle(item);
                                  switchTab("edit", item.slug);
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="cms-icon-btn"
                                onClick={() => handleDuplicateArticle(item)}
                                title="Duplikat Artikel sebagai Draft"
                              >
                                Duplikat
                              </button>
                              <Link
                                to={`/artikel/${item.slug}`}
                                className="cms-icon-btn"
                                target="_blank"
                                rel="noreferrer"
                              >
                                Lihat
                              </Link>
                              <button
                                type="button"
                                className="cms-icon-btn cms-icon-btn--danger"
                                onClick={() => setDeleteTargetArticle(item)}
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredArticles.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "32px" }}>
                          Tidak ada artikel yang cocok dengan filter pencarian.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 3 & TAB 4: TAMBAH ARTIKEL & EDIT ARTIKEL (TERINTEGRASI DASHBOARD)
              ================================================================ */}
          {(activeTab === "create" || activeTab === "edit") && (
            <div className="cms-card">
              <div className="cms-card__header">
                <div>
                  <h2 className="cms-card__title">
                    {activeTab === "create"
                      ? "Form Tambah Berita, Artikel & Press Release Baru"
                      : "Editor Perubahan Berita & Artikel"}
                  </h2>
                  <p className="cms-card__subtitle">
                    {activeTab === "create"
                      ? "Tulis artikel baru, unggah gambar sampul atau gunakan kembali foto dari Galeri Foto."
                      : "Pilih artikel dari daftar di bawah atau perbarui konten, kategori, dan foto sampul."}
                  </p>
                </div>

                <div className="cms-action-group">
                  <div className="cms-editor-tabs">
                    <button
                      type="button"
                      className={`cms-editor-tab ${editorViewMode === "form" ? "is-active" : ""}`}
                      onClick={() => setEditorViewMode("form")}
                    >
                      📝 Mode Form Editor
                    </button>
                    <button
                      type="button"
                      className={`cms-editor-tab ${
                        editorViewMode === "preview" ? "is-active" : ""
                      }`}
                      onClick={() => setEditorViewMode("preview")}
                    >
                      👁️ Pratinjau Langsung (Live Preview)
                    </button>
                  </div>

                  <button
                    type="button"
                    className="cms-icon-btn"
                    onClick={() => switchTab("articles")}
                  >
                    &larr; Kembali ke Daftar Artikel
                  </button>
                </div>
              </div>

              {/* Pemilih Artikel jika berada di menu Edit Artikel */}
              {activeTab === "edit" && (
                <div className="news-form-selector-box">
                  <label htmlFor="cms-select-edit-article">
                    Pilih Berita / Artikel yang Sedang Diedit:
                  </label>
                  <select
                    id="cms-select-edit-article"
                    className="news-form-select"
                    value={editingSlug}
                    onChange={(e) => {
                      const nextSlug = e.target.value;
                      setEditingSlug(nextSlug);
                      const found = articles.find((a) => a.slug === nextSlug);
                      if (found) {
                        populateEditorFromArticle(found);
                        navigate(`/dashboard-artikel/edit/${encodeURIComponent(nextSlug)}`, {
                          replace: true,
                        });
                      }
                    }}
                  >
                    {articles.map((item) => (
                      <option key={item.slug} value={item.slug}>
                        [{item.status}] [{item.published_at}] {item.title_id} ({item.author})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {editorViewMode === "preview" ? (
                /* MODE PRATINJAU LANGSUNG (LIVE PREVIEW) */
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #cbd5e1",
                    borderRadius: "14px",
                    padding: "28px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "18px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #e2e8f0",
                    }}
                  >
                    <strong style={{ color: "#0b2a5b" }}>
                      Pratinjau Halaman Detail Artikel (Rasio Gambar 16:9)
                    </strong>
                    <button
                      type="button"
                      className="cms-icon-btn cms-icon-btn--primary"
                      onClick={() => setEditorViewMode("form")}
                    >
                      Kembali ke Form Editor
                    </button>
                  </div>

                  <div className="news-detail__container" style={{ background: "#ffffff", padding: "28px", borderRadius: "12px" }}>
                    <div className="news-detail__hero-wrap">
                      <img
                        src={formImageUrl || "/Logo_PSU_banner1.webp"}
                        alt={formTitleId || "Preview"}
                        className="news-detail__hero-img"
                      />
                    </div>
                    <h1 className="news-detail__title">
                      {formTitleId || "Judul Artikel Akan Tampil di Sini"}
                    </h1>
                    <div className="news-detail__tags">
                      {parsedFormTags.map((tg, idx) => (
                        <span key={idx} className="news-detail__tag-pill">
                          {tg}
                        </span>
                      ))}
                    </div>
                    <div className="news-detail__meta-bar">
                      <div className="news-detail__created">
                        <span>Dibuat pada {formatIndoDate(formPublishedAt)}</span>
                      </div>
                      <div className="news-detail__author">
                        <span>
                          Penulis: <strong>{formAuthor}</strong>
                        </span>
                      </div>
                    </div>
                    <div className="news-detail__body">
                      {String(formContentId || "Isi artikel akan tampil di sini...")
                        .split(/\n\s*\n/)
                        .filter(Boolean)
                        .map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* MODE FORM EDITOR */
                <form onSubmit={handleSaveArticle}>
                  <div className="news-form-grid">
                    <div className="news-form-field news-form-field--full">
                      <label className="news-form-label" htmlFor="cms_title_id">
                        Judul Berita / Artikel (Bahasa Indonesia)<span>*</span>
                      </label>
                      <input
                        id="cms_title_id"
                        type="text"
                        className="news-form-input"
                        placeholder="Masukkan judul berita/artikel Bahasa Indonesia..."
                        value={formTitleId}
                        onChange={(e) => {
                          setFormTitleId(e.target.value);
                          if (activeTab === "create") {
                            setFormCustomSlug(slugifyText(e.target.value));
                          }
                        }}
                        required
                      />
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_title_en">
                        Judul Berita / Artikel (Bahasa Inggris - Opsional)
                      </label>
                      <input
                        id="cms_title_en"
                        type="text"
                        className="news-form-input"
                        placeholder="Kosongkan jika disamakan dengan judul Bahasa Indonesia..."
                        value={formTitleEn}
                        onChange={(e) => setFormTitleEn(e.target.value)}
                      />
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_slug">
                        Slug URL Artikel
                      </label>
                      <input
                        id="cms_slug"
                        type="text"
                        className="news-form-input"
                        placeholder="slug-url-artikel-otomatis"
                        value={formCustomSlug || slugifyText(formTitleId)}
                        onChange={(e) => setFormCustomSlug(slugifyText(e.target.value))}
                        disabled={activeTab === "edit"}
                      />
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_author">
                        Author / Penulis<span>*</span>
                      </label>
                      <select
                        id="cms_author"
                        className="news-form-select"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                      >
                        {authorsList.map((name) => (
                          <option key={name} value={name}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_category">
                        Kategori Utama<span>*</span>
                      </label>
                      <select
                        id="cms_category"
                        className="news-form-select"
                        value={formCategory}
                        onChange={(e) => setFormCategory(e.target.value)}
                      >
                        <option value="News">Berita (News)</option>
                        <option value="Article">Artikel (Article)</option>
                        <option value="Press Release">Siaran Pers (Press Release)</option>
                      </select>
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_published_at">
                        Tanggal Publikasi<span>*</span>
                      </label>
                      <input
                        id="cms_published_at"
                        type="date"
                        className="news-form-input"
                        value={formPublishedAt}
                        onChange={(e) => setFormPublishedAt(e.target.value)}
                        required
                      />
                    </div>

                    <div className="news-form-field">
                      <label className="news-form-label" htmlFor="cms_status">
                        Status Publikasi & Unggulan
                      </label>
                      <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                        <select
                          id="cms_status"
                          className="news-form-select"
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value)}
                          style={{ flex: 1 }}
                        >
                          <option value="Published">Published (Tampil di Website)</option>
                          <option value="Draft">Draft (Simpan sebagai Konsep)</option>
                        </select>
                        <label
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.84rem",
                            fontWeight: 600,
                            whiteSpace: "nowrap",
                            cursor: "pointer",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formIsFeatured}
                            onChange={(e) => setFormIsFeatured(e.target.checked)}
                          />
                          <span>★ Unggulan</span>
                        </label>
                      </div>
                    </div>

                    {/* PEMILIH GAMBAR SAMPUL TERINTEGRASI GALERI FOTO */}
                    <div className="news-form-field news-form-field--full">
                      <label className="news-form-label">
                        Gambar Utama Artikel (Rasio 16:9 — Pilih dari Galeri Foto atau Upload Baru)
                        <span>*</span>
                      </label>

                      <div className="news-form-image-box">
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "12px",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingBottom: "12px",
                            borderBottom: "1px solid #e2e8f0",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.88rem", color: "#0b2a5b" }}>
                              Gunakan Kembali Foto yang Sudah Di-upload atau Unggah Foto Baru
                            </strong>
                            <div className="news-form-hint" style={{ marginTop: "2px" }}>
                              Setiap foto yang pernah diunggah ke artikel tersimpan otomatis di
                              Galeri Foto dan dapat dipilih kembali tanpa perlu upload ulang.
                            </div>
                          </div>

                          <button
                            type="button"
                            className="news-btn news-btn--primary"
                            style={{ height: "40px", padding: "0 18px", fontSize: "0.85rem" }}
                            onClick={() => setShowMediaPicker(true)}
                          >
                            🖼️ Pilih Foto dari Galeri ({enrichedGallery.length} Foto)
                          </button>
                        </div>

                        <div className="news-form-grid" style={{ marginTop: "6px" }}>
                          <div>
                            <span className="news-form-hint">
                              Upload foto baru dari komputer (otomatis masuk ke Galeri Foto):
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="news-form-input"
                              onChange={(e) => handleUploadImageFile(e, false)}
                              style={{ marginTop: "6px" }}
                            />
                          </div>

                          <div>
                            <span className="news-form-hint">
                              Atau pilih cepat dari koleksi foto di Galeri:
                            </span>
                            <select
                              className="news-form-select"
                              value={
                                enrichedGallery.some((g) => g.image_url === formImageUrl)
                                  ? formImageUrl
                                  : ""
                              }
                              onChange={(e) => {
                                if (e.target.value) setFormImageUrl(e.target.value);
                              }}
                              style={{ marginTop: "6px" }}
                            >
                              <option value="">-- Pilih dari Daftar Galeri Foto --</option>
                              {enrichedGallery.map((g) => (
                                <option key={g.image_url} value={g.image_url}>
                                  {g.is_uploaded ? "[Upload] " : "[Default] "}
                                  {g.title} ({g.image_url})
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {uploadingCover && (
                          <span className="news-form-hint">
                            Mengunggah foto dan menyimpan ke Galeri...
                          </span>
                        )}

                        {formImageUrl && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "18px",
                              alignItems: "center",
                              marginTop: "6px",
                            }}
                          >
                            <div className="news-form-image-preview-wrap">
                              <img
                                src={formImageUrl}
                                alt="Preview Sampul Artikel"
                                className="news-form-image-preview"
                              />
                            </div>
                            <div style={{ flex: 1, minWidth: "220px" }}>
                              <div
                                style={{
                                  fontSize: "0.82rem",
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  marginBottom: "6px",
                                }}
                              >
                                Path / URL Gambar Saat Ini:
                              </div>
                              <input
                                type="text"
                                className="news-form-input"
                                value={formImageUrl}
                                onChange={(e) => setFormImageUrl(e.target.value)}
                              />
                              <div className="news-form-hint" style={{ marginTop: "6px" }}>
                                Gambar ditampilkan seragam dalam rasio 16:9 pada kartu artikel dan
                                halaman detail.
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* TAGS & REKOMENDASI TAG INTERAKTIF */}
                    <div className="news-form-field news-form-field--full">
                      <label className="news-form-label" htmlFor="cms_tags">
                        Daftar Tag / Tagline (Pisahkan dengan tanda koma)
                      </label>
                      <input
                        id="cms_tags"
                        type="text"
                        className="news-form-input"
                        placeholder="Contoh: Press Release, Sertifikasi Produk, SNI, LSPro PSU"
                        value={formTagsInput}
                        onChange={(e) => setFormTagsInput(e.target.value)}
                      />

                      <div className="news-form-hint" style={{ marginTop: "4px" }}>
                        Klik tag populer di bawah untuk menambahkan/melepas secara cepat:
                      </div>
                      <div className="cms-tag-suggestions">
                        {RECOMMENDED_TAGS.map((tg) => {
                          const active = parsedFormTags.some(
                            (t) => t.toLowerCase() === tg.toLowerCase()
                          );
                          return (
                            <button
                              key={tg}
                              type="button"
                              className={`cms-tag-chip ${active ? "is-selected" : ""}`}
                              onClick={() => toggleTagInForm(tg)}
                            >
                              {active ? `✓ ${tg}` : `+ ${tg}`}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* RINGKASAN / EXCERPT */}
                    <div className="news-form-field news-form-field--full">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="news-form-label" htmlFor="cms_excerpt_id">
                          Ringkasan Singkat / Excerpt (Bahasa Indonesia)
                        </label>
                        <button
                          type="button"
                          className="cms-icon-btn"
                          onClick={() => {
                            if (!formContentId.trim()) return;
                            const firstPara = formContentId
                              .trim()
                              .split(/\n\s*\n/)[0]
                              .replace(/^Jakarta\s*—\s*/i, "")
                              .slice(0, 195);
                            setFormExcerptId(firstPara);
                          }}
                        >
                          ⚡ Ambil Otomatis dari Paragraf 1
                        </button>
                      </div>
                      <textarea
                        id="cms_excerpt_id"
                        className="news-form-textarea"
                        placeholder="Ringkasan singkat 1-2 kalimat (jika dikosongkan akan diambil otomatis dari paragraf pertama)..."
                        value={formExcerptId}
                        onChange={(e) => setFormExcerptId(e.target.value)}
                      />
                    </div>

                    {/* ISI ARTIKEL BAHASA INDONESIA */}
                    <div className="news-form-field news-form-field--full">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="news-form-label" htmlFor="cms_content_id">
                          Isi Lengkap Berita / Artikel (Bahasa Indonesia)<span>*</span>
                        </label>
                        <span className="news-form-hint">
                          {formContentId.trim()
                            ? `${formContentId.trim().split(/\s+/).length} kata`
                            : "0 kata"}{" "}
                          &bull; Gunakan baris kosong (Enter 2x) antar paragraf
                        </span>
                      </div>
                      <textarea
                        id="cms_content_id"
                        className="news-form-textarea news-form-textarea--large"
                        placeholder="Jakarta — Tuliskan isi berita atau artikel lengkap di sini..."
                        value={formContentId}
                        onChange={(e) => setFormContentId(e.target.value)}
                        required
                      />
                    </div>

                    {/* ISI ARTIKEL BAHASA INGGRIS */}
                    <div className="news-form-field news-form-field--full">
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <label className="news-form-label" htmlFor="cms_content_en">
                          Isi Lengkap Berita / Artikel (Bahasa Inggris - Opsional)
                        </label>
                        <button
                          type="button"
                          className="cms-icon-btn"
                          onClick={() => {
                            setFormTitleEn(formTitleId);
                            setFormExcerptEn(formExcerptId);
                            setFormContentEn(formContentId);
                          }}
                        >
                          Salin dari Teks Bahasa Indonesia
                        </button>
                      </div>
                      <textarea
                        id="cms_content_en"
                        className="news-form-textarea news-form-textarea--large"
                        placeholder="Kosongkan jika ingin menggunakan teks yang sama dengan Bahasa Indonesia..."
                        value={formContentEn}
                        onChange={(e) => setFormContentEn(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="news-form-actions">
                    <div>
                      {activeTab === "edit" && editingSlug && (
                        <button
                          type="button"
                          className="news-btn news-btn--danger"
                          onClick={() => {
                            const found = articles.find((a) => a.slug === editingSlug);
                            if (found) setDeleteTargetArticle(found);
                          }}
                        >
                          🗑️ Hapus Artikel Ini
                        </button>
                      )}
                    </div>

                    <div className="news-form-actions__right">
                      <button
                        type="button"
                        className="news-btn news-btn--secondary"
                        onClick={() => switchTab("articles")}
                      >
                        Batal
                      </button>

                      <button
                        type="submit"
                        className="news-btn news-btn--primary"
                        disabled={savingArticle || uploadingCover}
                      >
                        {savingArticle
                          ? "Menyimpan..."
                          : activeTab === "create"
                          ? "Simpan & Publikasikan Artikel"
                          : "Simpan Perubahan Artikel"}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ================================================================
              TAB 5: GALERI FOTO ARTIKEL (MEDIA LIBRARY & REUSE ASSETS)
              ================================================================ */}
          {activeTab === "gallery" && (
            <>
              {/* Panel Upload Foto Baru ke Galeri */}
              <div className="cms-card">
                <div className="cms-card__header">
                  <div>
                    <h2 className="cms-card__title">Unggah Foto Baru ke Galeri Artikel</h2>
                    <p className="cms-card__subtitle">
                      Foto yang diunggah disimpan ke folder <code>/news/</code> dan tabel{" "}
                      <code>galeri_artikel</code> sehingga bisa digunakan berkali-kali pada menu
                      Tambah maupun Edit Artikel.
                    </p>
                  </div>
                </div>

                <div className="news-form-grid">
                  <div className="news-form-field">
                    <label className="news-form-label">Judul / Label Foto (Opsional)</label>
                    <input
                      type="text"
                      className="news-form-input"
                      placeholder="Misal: Dokumentasi Kunjungan Lab Pengujian..."
                      value={newPhotoTitle}
                      onChange={(e) => setNewPhotoTitle(e.target.value)}
                    />
                  </div>

                  <div className="news-form-field">
                    <label className="news-form-label">Kategori Foto</label>
                    <select
                      className="news-form-select"
                      value={newPhotoCategory}
                      onChange={(e) => setNewPhotoCategory(e.target.value)}
                    >
                      <option value="Artikel Upload">Artikel Upload (/news/)</option>
                      <option value="Dokumentasi Korporat">Dokumentasi Korporat</option>
                      <option value="Layanan PSU">Layanan PSU</option>
                      <option value="Siaran Pers">Siaran Pers</option>
                    </select>
                  </div>

                  <div className="news-form-field">
                    <label className="news-form-label">Teks Alternatif / Alt Text</label>
                    <input
                      type="text"
                      className="news-form-input"
                      placeholder="Deskripsi singkat gambar untuk SEO & aksesibilitas..."
                      value={newPhotoAlt}
                      onChange={(e) => setNewPhotoAlt(e.target.value)}
                    />
                  </div>

                  <div className="news-form-field">
                    <label className="news-form-label">
                      Pilih File Gambar dari Komputer (JPG, PNG, WEBP)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      className="news-form-input"
                      onChange={(e) => handleUploadImageFile(e, true)}
                      disabled={uploadingGalleryPhoto}
                    />
                  </div>
                </div>
              </div>

              {/* Daftar Koleksi Galeri Foto */}
              <div className="cms-card">
                <div className="cms-card__header">
                  <div>
                    <h2 className="cms-card__title">
                      Koleksi Foto Artikel ({filteredGallery.length} dari {enrichedGallery.length}{" "}
                      Foto)
                    </h2>
                    <p className="cms-card__subtitle">
                      Pilih foto mana pun untuk langsung digunakan kembali pada menu Tambah Artikel
                      atau Edit Artikel.
                    </p>
                  </div>
                </div>

                <div className="cms-toolbar">
                  <div className="cms-toolbar__filters">
                    <input
                      type="search"
                      className="cms-search-input"
                      placeholder="Cari nama foto, nama file, atau path..."
                      value={gallerySearch}
                      onChange={(e) => setGallerySearch(e.target.value)}
                    />

                    <select
                      className="cms-select"
                      value={galleryFilter}
                      onChange={(e) => setGalleryFilter(e.target.value)}
                    >
                      <option value="All">Semua Foto ({enrichedGallery.length})</option>
                      <option value="Uploaded">
                        Hasil Upload Admin /news/ (
                        {enrichedGallery.filter((g) => g.is_uploaded).length})
                      </option>
                      <option value="Preset">
                        Banner & Aset Bawaan PSU (
                        {enrichedGallery.filter((g) => !g.is_uploaded).length})
                      </option>
                      <option value="Used">
                        Sedang Dipakai di Artikel (
                        {enrichedGallery.filter((g) => g.usage_count > 0).length})
                      </option>
                      <option value="Unused">
                        Belum Dipakai ({enrichedGallery.filter((g) => g.usage_count === 0).length})
                      </option>
                    </select>
                  </div>
                </div>

                <div className="cms-gallery-grid">
                  {filteredGallery.map((item) => (
                    <div className="cms-gallery-card" key={item.image_url}>
                      <div
                        className="cms-gallery-card__thumb-wrap"
                        onClick={() => setPreviewLightboxItem(item)}
                        style={{ cursor: "zoom-in" }}
                      >
                        <img
                          src={item.image_url}
                          alt={item.alt_text || item.title}
                          className="cms-gallery-card__thumb"
                          loading="lazy"
                        />
                        <div className="cms-gallery-card__badges">
                          <span className="cms-gallery-pill">
                            {item.is_uploaded ? "Upload /news/" : item.category || "Banner PSU"}
                          </span>
                          <span
                            className={`cms-gallery-pill ${
                              item.usage_count > 0 ? "cms-gallery-pill--used" : ""
                            }`}
                          >
                            {item.usage_count > 0
                              ? `Dipakai di ${item.usage_count} Artikel`
                              : "Belum Dipakai"}
                          </span>
                        </div>
                      </div>

                      <div className="cms-gallery-card__body">
                        <div className="cms-gallery-card__title">{item.title}</div>
                        <div className="cms-gallery-card__path">{item.image_url}</div>

                        {item.used_in_articles && item.used_in_articles.length > 0 && (
                          <div className="cms-gallery-card__used-list">
                            <strong>Digunakan pada:</strong>
                            {item.used_in_articles.slice(0, 2).map((a) => (
                              <div
                                key={a.slug}
                                style={{
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                • {a.title_id}
                              </div>
                            ))}
                            {item.used_in_articles.length > 2 && (
                              <div>+{item.used_in_articles.length - 2} artikel lainnya</div>
                            )}
                          </div>
                        )}

                        <div className="cms-gallery-card__actions">
                          <button
                            type="button"
                            className="cms-icon-btn cms-icon-btn--primary"
                            style={{ flex: 1, justifyContent: "center" }}
                            onClick={() => {
                              navigate(
                                `/dashboard-artikel/tambah?image=${encodeURIComponent(
                                  item.image_url
                                )}`
                              );
                            }}
                          >
                            + Pakai di Artikel Baru
                          </button>

                          <button
                            type="button"
                            className="cms-icon-btn"
                            onClick={() => {
                              const slugTarget = editingSlug || articles[0]?.slug || "";
                              navigate(
                                `/dashboard-artikel/edit/${encodeURIComponent(
                                  slugTarget
                                )}?image=${encodeURIComponent(item.image_url)}`
                              );
                            }}
                            title="Gunakan foto ini pada menu Edit Artikel"
                          >
                            Pakai di Edit
                          </button>

                          <button
                            type="button"
                            className="cms-icon-btn"
                            onClick={() => {
                              navigator.clipboard?.writeText(item.image_url);
                              showToast("success", `Path "${item.image_url}" disalin!`);
                            }}
                            title="Salin Path Gambar"
                          >
                            Salin
                          </button>

                          {item.id && (
                            <button
                              type="button"
                              className="cms-icon-btn"
                              onClick={() => {
                                setEditingMediaItem(item);
                                setEditMediaTitle(item.title || "");
                                setEditMediaAlt(item.alt_text || "");
                                setEditMediaCategory(item.category || "Artikel Upload");
                              }}
                              title="Edit Nama/Label Foto"
                            >
                              ✏️
                            </button>
                          )}

                          {item.is_uploaded && (
                            <button
                              type="button"
                              className="cms-icon-btn cms-icon-btn--danger"
                              onClick={() => handleDeleteMediaItem(item)}
                              title="Hapus Foto dari Galeri"
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ================================================================
              TAB 6: PENULIS & KATEGORI / TAG (TAKSONOMI)
              ================================================================ */}
          {activeTab === "taxonomy" && (
            <div className="cms-grid-2col">
              {/* Manajemen Penulis Resmi */}
              <div className="cms-card" style={{ marginBottom: 0 }}>
                <div className="cms-card__header">
                  <div>
                    <h2 className="cms-card__title">Manajemen Penulis / Divisi (Author)</h2>
                    <p className="cms-card__subtitle">
                      Daftar penulis pada tabel <code>penulis_artikel</code> yang muncul di form
                      Tambah & Edit Artikel.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleAddAuthor}
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                  }}
                >
                  <div className="news-form-grid">
                    <div className="news-form-field" style={{ marginBottom: "10px" }}>
                      <label className="news-form-label">Nama Penulis / Divisi*</label>
                      <input
                        type="text"
                        className="news-form-input"
                        placeholder="Misal: Divisi Riset & Standarisasi PSU"
                        value={newAuthorName}
                        onChange={(e) => setNewAuthorName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="news-form-field" style={{ marginBottom: "10px" }}>
                      <label className="news-form-label">Jabatan / Peran</label>
                      <input
                        type="text"
                        className="news-form-input"
                        placeholder="Misal: Tim Teknis / Editor"
                        value={newAuthorRole}
                        onChange={(e) => setNewAuthorRole(e.target.value)}
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="news-btn news-btn--primary"
                    style={{ height: "38px", padding: "0 16px", fontSize: "0.84rem" }}
                  >
                    + Tambah Penulis
                  </button>
                </form>

                <div className="cms-table-wrap">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>Nama Penulis / Divisi</th>
                        <th>Artikel Ditulis</th>
                        <th>Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {authorsList.map((name, idx) => {
                        const metaObj = authorsMeta.find((m) => m.name === name);
                        const count = articles.filter((a) => a.author === name).length;
                        return (
                          <tr key={name}>
                            <td>
                              <strong>{name}</strong>
                              {metaObj?.role_title && (
                                <div className="cms-article-slug">{metaObj.role_title}</div>
                              )}
                            </td>
                            <td>{count} artikel</td>
                            <td>
                              {metaObj?.id && idx > 0 && (
                                <button
                                  type="button"
                                  className="cms-icon-btn cms-icon-btn--danger"
                                  onClick={() => handleDeleteAuthor(metaObj.id)}
                                >
                                  Hapus
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Manajemen Tag & Kategori */}
              <div className="cms-card" style={{ marginBottom: 0 }}>
                <div className="cms-card__header">
                  <div>
                    <h2 className="cms-card__title">
                      Manajemen Tag Artikel ({dashboardStats.sortedTags.length} Tag Aktif)
                    </h2>
                    <p className="cms-card__subtitle">
                      Ubah nama tag secara massal atau bersihkan tag yang tidak diperlukan di
                      seluruh artikel.
                    </p>
                  </div>
                </div>

                <form
                  onSubmit={handleRenameTag}
                  style={{
                    background: "#f8fafc",
                    padding: "16px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    marginBottom: "20px",
                  }}
                >
                  <div className="news-form-grid">
                    <div className="news-form-field" style={{ marginBottom: "10px" }}>
                      <label className="news-form-label">Pilih / Ketik Tag Lama</label>
                      <input
                        type="text"
                        className="news-form-input"
                        placeholder="Nama tag yang ingin diubah..."
                        value={renamingTagOld}
                        onChange={(e) => setRenamingTagOld(e.target.value)}
                        required
                      />
                    </div>
                    <div className="news-form-field" style={{ marginBottom: "10px" }}>
                      <label className="news-form-label">Nama Tag Baru</label>
                      <input
                        type="text"
                        className="news-form-input"
                        placeholder="Nama tag pengganti..."
                        value={renamingTagNew}
                        onChange={(e) => setRenamingTagNew(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="news-btn news-btn--primary"
                    style={{ height: "38px", padding: "0 16px", fontSize: "0.84rem" }}
                  >
                    Terapkan Perubahan Tag Massal
                  </button>
                </form>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {dashboardStats.sortedTags.map((tObj) => (
                    <div
                      key={tObj.name}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "5px 10px",
                        borderRadius: "999px",
                        background: "#f1f5f9",
                        border: "1px solid #cbd5e1",
                        fontSize: "0.78rem",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setRenamingTagOld(tObj.name)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 700,
                          color: "#0f172a",
                          padding: 0,
                        }}
                        title="Klik untuk mengganti nama tag ini"
                      >
                        {tObj.name} ({tObj.count})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTagGlobal(tObj.name)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          fontWeight: 700,
                          padding: "0 2px",
                        }}
                        title={`Hapus tag "${tObj.name}" dari semua artikel`}
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================
              TAB 7: LOG AKTIVITAS & PENGATURAN KEAMANAN AKUN ADMIN (JWT)
              ================================================================ */}
          {activeTab === "settings" && (
            <>
              <div className="cms-grid-2col">
                {/* Profil & Ganti Password */}
                <div className="cms-card" style={{ marginBottom: 0 }}>
                  <div className="cms-card__header">
                    <div>
                      <h2 className="cms-card__title">Profil & Keamanan Akun Admin (JWT)</h2>
                      <p className="cms-card__subtitle">
                        Kelola identitas akun yang sedang login (<strong>@{adminUser.username}</strong>)
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} style={{ marginBottom: "24px" }}>
                    <div className="news-form-grid">
                      <div className="news-form-field">
                        <label className="news-form-label">Nama Lengkap Admin</label>
                        <input
                          type="text"
                          className="news-form-input"
                          value={profileFullName}
                          onChange={(e) => setProfileFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="news-form-field">
                        <label className="news-form-label">Email Admin</label>
                        <input
                          type="email"
                          className="news-form-input"
                          value={profileEmail}
                          onChange={(e) => setProfileEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="news-btn news-btn--primary"
                      style={{ height: "38px", padding: "0 18px", fontSize: "0.84rem" }}
                    >
                      Simpan Profil Admin
                    </button>
                  </form>

                  <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "20px 0" }} />

                  <h3 style={{ fontSize: "0.98rem", color: "#0b2a5b", margin: "0 0 12px" }}>
                    Ganti Password Akun Admin
                  </h3>
                  <form onSubmit={handleChangePassword}>
                    <div className="news-form-field">
                      <label className="news-form-label">Password Saat Ini</label>
                      <input
                        type="password"
                        className="news-form-input"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="news-form-grid">
                      <div className="news-form-field">
                        <label className="news-form-label">Password Baru (Min. 6 Karakter)</label>
                        <input
                          type="password"
                          className="news-form-input"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="news-form-field">
                        <label className="news-form-label">Konfirmasi Password Baru</label>
                        <input
                          type="password"
                          className="news-form-input"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="news-btn news-btn--primary"
                      style={{ height: "38px", padding: "0 18px", fontSize: "0.84rem" }}
                    >
                      Perbarui Password
                    </button>
                  </form>
                </div>

                {/* Manajemen Akun Admin Baru */}
                <div className="cms-card" style={{ marginBottom: 0 }}>
                  <div className="cms-card__header">
                    <div>
                      <h2 className="cms-card__title">Manajemen Akun Admin & Editor</h2>
                      <p className="cms-card__subtitle">
                        Tabel MySQL <code>admin_users</code> dengan autentikasi token{" "}
                        <code>JWT_SECRET</code>
                      </p>
                    </div>
                  </div>

                  <form
                    onSubmit={handleCreateAdminUser}
                    style={{
                      background: "#f8fafc",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      marginBottom: "18px",
                    }}
                  >
                    <div className="news-form-grid">
                      <div className="news-form-field" style={{ marginBottom: "10px" }}>
                        <label className="news-form-label">Username*</label>
                        <input
                          type="text"
                          className="news-form-input"
                          placeholder="mis. editor_psu"
                          value={newAdminUsername}
                          onChange={(e) => setNewAdminUsername(e.target.value)}
                          required
                        />
                      </div>
                      <div className="news-form-field" style={{ marginBottom: "10px" }}>
                        <label className="news-form-label">Nama Lengkap*</label>
                        <input
                          type="text"
                          className="news-form-input"
                          placeholder="Nama lengkap..."
                          value={newAdminFullName}
                          onChange={(e) => setNewAdminFullName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="news-form-field" style={{ marginBottom: "10px" }}>
                        <label className="news-form-label">Email*</label>
                        <input
                          type="email"
                          className="news-form-input"
                          placeholder="email@penilaistandaruji.com"
                          value={newAdminEmail}
                          onChange={(e) => setNewAdminEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="news-form-field" style={{ marginBottom: "10px" }}>
                        <label className="news-form-label">Password Awal*</label>
                        <input
                          type="password"
                          className="news-form-input"
                          placeholder="Minimal 6 karakter..."
                          value={newAdminPassword}
                          onChange={(e) => setNewAdminPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <select
                        className="cms-select"
                        value={newAdminRole}
                        onChange={(e) => setNewAdminRole(e.target.value)}
                      >
                        <option value="Super Admin">Role: Super Admin</option>
                        <option value="Editor">Role: Editor</option>
                        <option value="Author">Role: Author</option>
                      </select>
                      <button
                        type="submit"
                        className="news-btn news-btn--primary"
                        style={{ height: "38px", padding: "0 16px", fontSize: "0.84rem" }}
                      >
                        + Tambah Akun Admin
                      </button>
                    </div>
                  </form>

                  <div className="cms-table-wrap">
                    <table className="cms-table">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Nama Lengkap</th>
                          <th>Role</th>
                          <th>Login Terakhir</th>
                        </tr>
                      </thead>
                      <tbody>
                        {adminUsersList.map((u) => (
                          <tr key={u.id || u.username}>
                            <td>
                              <strong>@{u.username}</strong>
                              <div className="cms-article-slug">{u.email}</div>
                            </td>
                            <td>{u.full_name}</td>
                            <td>
                              <span className="cms-badge cms-badge--news">{u.role}</span>
                            </td>
                            <td>{u.last_login || "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Tabel Log Aktivitas Admin */}
              <div className="cms-card" style={{ marginTop: "24px" }}>
                <div className="cms-card__header">
                  <div>
                    <h2 className="cms-card__title">
                      Riwayat Log Aktivitas Admin (Tabel <code>log_aktivitas_artikel</code>)
                    </h2>
                    <p className="cms-card__subtitle">
                      Jejak audit login, penambahan/perubahan artikel, dan pengelolaan galeri foto
                    </p>
                  </div>
                </div>

                <div className="cms-table-wrap">
                  <table className="cms-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>Admin</th>
                        <th>Tipe Aksi</th>
                        <th>Target</th>
                        <th>Keterangan Detail</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((l) => (
                        <tr key={l.id}>
                          <td style={{ whiteSpace: "nowrap" }}>
                            {String(l.created_at || "").slice(0, 19).replace("T", " ")}
                          </td>
                          <td>
                            <strong>@{l.admin_username}</strong>
                          </td>
                          <td>
                            <span className="cms-badge cms-badge--article">{l.action_type}</span>
                          </td>
                          <td>
                            <strong>{l.target_title}</strong>
                          </td>
                          <td>{l.details}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ====================================================================
          MODAL PEMILIH GALERI FOTO (UNTUK MENU TAMBAH & EDIT ARTIKEL)
          ==================================================================== */}
      {showMediaPicker && (
        <div
          className="cms-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Pilih Foto dari Galeri Artikel"
        >
          <div className="cms-modal-large">
            <div className="cms-modal-large__header">
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", color: "#0b2a5b" }}>
                  Pilih Gambar Sampul dari Galeri Foto Artikel
                </h3>
                <p style={{ margin: "2px 0 0", fontSize: "0.82rem", color: "#64748b" }}>
                  Klik pada salah satu foto yang sudah pernah di-upload untuk langsung digunakan
                  pada artikel ini, atau unggah foto baru.
                </p>
              </div>
              <button
                type="button"
                className="cms-icon-btn"
                onClick={() => setShowMediaPicker(false)}
              >
                &times; Tutup
              </button>
            </div>

            <div className="cms-modal-large__body">
              <div className="cms-toolbar" style={{ marginBottom: "16px" }}>
                <div className="cms-toolbar__filters">
                  <input
                    type="search"
                    className="cms-search-input"
                    placeholder="Cari judul foto atau nama file..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                  />
                  <select
                    className="cms-select"
                    value={pickerFilter}
                    onChange={(e) => setPickerFilter(e.target.value)}
                  >
                    <option value="All">Semua Foto ({enrichedGallery.length})</option>
                    <option value="Uploaded">
                      Foto Hasil Upload (/news/) (
                      {enrichedGallery.filter((g) => g.is_uploaded).length})
                    </option>
                    <option value="Preset">
                      Banner Default PSU ({enrichedGallery.filter((g) => !g.is_uploaded).length})
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    className="cms-icon-btn cms-icon-btn--primary"
                    style={{ cursor: "pointer", height: "38px", padding: "0 14px" }}
                  >
                    <span>+ Upload Foto Baru</span>
                    <input
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={(e) => handleUploadImageFile(e, false)}
                    />
                  </label>
                </div>
              </div>

              <div className="cms-gallery-grid">
                {filteredPickerGallery.map((item) => {
                  const isSelected = formImageUrl === item.image_url;
                  return (
                    <div
                      key={item.image_url}
                      className={`cms-gallery-card ${isSelected ? "is-selected" : ""}`}
                      onClick={() => {
                        setFormImageUrl(item.image_url);
                        setShowMediaPicker(false);
                        showToast("success", `Foto "${item.title}" dipilih sebagai sampul artikel.`);
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      <div className="cms-gallery-card__thumb-wrap">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="cms-gallery-card__thumb"
                        />
                        <div className="cms-gallery-card__badges">
                          <span className="cms-gallery-pill">
                            {item.is_uploaded ? "Upload /news/" : "Banner PSU"}
                          </span>
                          {isSelected && (
                            <span className="cms-gallery-pill cms-gallery-pill--used">
                              ✓ Terpilih
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="cms-gallery-card__body">
                        <div className="cms-gallery-card__title">{item.title}</div>
                        <div className="cms-gallery-card__path">{item.image_url}</div>
                        <button
                          type="button"
                          className="cms-icon-btn cms-icon-btn--primary"
                          style={{ marginTop: "8px", justifyContent: "center" }}
                        >
                          {isSelected ? "✓ Sedang Digunakan" : "Pilih Foto Ini"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="cms-modal-large__footer">
              <span style={{ fontSize: "0.82rem", color: "#475569" }}>
                Foto terpilih saat ini: <strong>{formImageUrl}</strong>
              </span>
              <button
                type="button"
                className="news-btn news-btn--secondary"
                style={{ height: "38px", padding: "0 16px" }}
                onClick={() => setShowMediaPicker(false)}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL KONFIRMASI HAPUS ARTIKEL
          ==================================================================== */}
      {deleteTargetArticle && (
        <div className="news-modal-backdrop" role="dialog" aria-modal="true">
          <div className="news-modal">
            <div className="news-modal__icon">🗑️</div>
            <h3 className="news-modal__title">Peringatan Hapus Artikel</h3>
            <p className="news-modal__desc">
              Apakah Anda yakin ingin menghapus artikel{" "}
              <strong>&ldquo;{deleteTargetArticle.title_id}&rdquo;</strong>? Data yang dihapus tidak
              dapat dikembalikan lagi.
            </p>
            <div className="news-modal__actions">
              <button
                type="button"
                className="news-btn news-btn--secondary"
                onClick={() => setDeleteTargetArticle(null)}
                disabled={deletingArticle}
              >
                Batal
              </button>
              <button
                type="button"
                className="news-btn news-btn--danger"
                onClick={handleConfirmDeleteArticle}
                disabled={deletingArticle}
              >
                {deletingArticle ? "Menghapus..." : "Ya, Hapus Artikel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL EDIT INFORMASI FOTO GALERI
          ==================================================================== */}
      {editingMediaItem && (
        <div className="news-modal-backdrop" role="dialog" aria-modal="true">
          <div className="news-modal" style={{ textAlign: "left" }}>
            <h3 className="news-modal__title">Edit Label & Metadata Foto Galeri</h3>
            <form onSubmit={handleSaveMediaEdit}>
              <div className="news-form-field">
                <label className="news-form-label">Judul / Label Foto</label>
                <input
                  type="text"
                  className="news-form-input"
                  value={editMediaTitle}
                  onChange={(e) => setEditMediaTitle(e.target.value)}
                  required
                />
              </div>
              <div className="news-form-field">
                <label className="news-form-label">Kategori Foto</label>
                <select
                  className="news-form-select"
                  value={editMediaCategory}
                  onChange={(e) => setEditMediaCategory(e.target.value)}
                >
                  <option value="Artikel Upload">Artikel Upload (/news/)</option>
                  <option value="Dokumentasi Korporat">Dokumentasi Korporat</option>
                  <option value="Layanan PSU">Layanan PSU</option>
                  <option value="Banner Default">Banner Default</option>
                </select>
              </div>
              <div className="news-form-field">
                <label className="news-form-label">Alt Text</label>
                <input
                  type="text"
                  className="news-form-input"
                  value={editMediaAlt}
                  onChange={(e) => setEditMediaAlt(e.target.value)}
                />
              </div>
              <div className="news-modal__actions" style={{ marginTop: "18px" }}>
                <button
                  type="button"
                  className="news-btn news-btn--secondary"
                  onClick={() => setEditingMediaItem(null)}
                >
                  Batal
                </button>
                <button type="submit" className="news-btn news-btn--primary">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          LIGHTBOX PREVIEW FOTO GALERI
          ==================================================================== */}
      {previewLightboxItem && (
        <div
          className="cms-modal-backdrop"
          onClick={() => setPreviewLightboxItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="cms-modal-large"
            style={{ maxWidth: "820px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="cms-modal-large__header">
              <strong>{previewLightboxItem.title}</strong>
              <button
                type="button"
                className="cms-icon-btn"
                onClick={() => setPreviewLightboxItem(null)}
              >
                &times; Tutup
              </button>
            </div>
            <div className="cms-modal-large__body" style={{ textAlign: "center" }}>
              <img
                src={previewLightboxItem.image_url}
                alt={previewLightboxItem.title}
                style={{
                  maxWidth: "100%",
                  maxHeight: "62vh",
                  borderRadius: "10px",
                  objectFit: "contain",
                }}
              />
              <div style={{ marginTop: "12px", fontSize: "0.85rem", color: "#475569" }}>
                Path: <code>{previewLightboxItem.image_url}</code>
              </div>
            </div>
            <div className="cms-modal-large__footer">
              <button
                type="button"
                className="news-btn news-btn--primary"
                style={{ height: "38px", padding: "0 16px" }}
                onClick={() => {
                  const targetUrl = previewLightboxItem.image_url;
                  setPreviewLightboxItem(null);
                  navigate(`/dashboard-artikel/tambah?image=${encodeURIComponent(targetUrl)}`);
                }}
              >
                + Gunakan Foto Ini untuk Artikel Baru
              </button>
              <button
                type="button"
                className="news-btn news-btn--secondary"
                style={{ height: "38px", padding: "0 16px" }}
                onClick={() => setPreviewLightboxItem(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
