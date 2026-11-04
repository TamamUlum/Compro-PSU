# Panduan Dashboard Artikel Admin & Autentikasi JWT — PT Penilai Standar Uji (PSU)

Dokumen ini merangkum pembaruan arsitektur, rute URL, konfigurasi **JWT (`JWT_SECRET`)**, skema database MySQL, serta fitur-fitur pada **Dashboard Artikel (`/dashboard-artikel`)**.

---

## 1. Akses URL & Proteksi Rute (Tanpa Tombol Publik)

Sesuai kebutuhan, tidak ada tombol menuju halaman admin di bagian publik website (`Navbar`, `Footer`, `Beranda`, maupun halaman `Artikel`). Admin dapat mengakses dashboard secara langsung melalui URL browser:

| URL Akses | Fungsi & Perilaku |
| :--- | :--- |
| `http://localhost:5173/dashboard-artikel` | Halaman utama **Dashboard Artikel Admin** (dilindungi sesi login JWT). |
| `http://localhost:5173/admin` | Otomatis dialihkan (*redirect*) ke `http://localhost:5173/dashboard-artikel`. |
| `http://localhost:5173/dashboard-artikel/kelola` | Menu **Kelola Semua Artikel** (pencarian, filter, status cepat, *bulk action*). |
| `http://localhost:5173/dashboard-artikel/tambah` | Menu **Tambah Artikel Baru** di dalam ekosistem Dashboard Admin. |
| `http://localhost:5173/dashboard-artikel/edit/:slug` | Menu **Edit Artikel** di dalam ekosistem Dashboard Admin. |
| `http://localhost:5173/dashboard-artikel/galeri` | Menu **Galeri Foto Artikel (Media Library)** untuk melihat & memakai ulang foto. |
| `http://localhost:5173/dashboard-artikel/taksonomi` | Menu **Penulis & Kategori/Tag** untuk mengelola daftar penulis dan tag artikel. |
| `http://localhost:5173/dashboard-artikel/pengaturan` | Menu **Log Aktivitas & Keamanan Akun Admin (JWT)**. |
| `http://localhost:5173/artikel/tambah` & `/artikel/edit/:id` | Rute manual lama kini otomatis dialihkan ke dalam `/dashboard-artikel` dan wajib melewati sesi login JWT. |

---

## 2. Konfigurasi Sesi Login & JWT (`JWT_SECRET`)

Autentikasi menggunakan standar **JSON Web Token (HS256)** dan enkripsi kata sandi **`scrypt`** bawaan modul `crypto` Node.js (tidak memerlukan instalasi *library* eksternal tambahan).

### Variabel Environment (`backend/.env`)

```dotenv
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=iLOVEYOU30
DB_NAME=psu_company_profile
JWT_SECRET=psu_compro_super_secret_jwt_key_2026_x9A8b7C6d5E4
JWT_EXPIRES_IN=8h
```

### Akun Default Admin (Otomatis Dibuat Saat Startup)

| Username | Email | Password Default | Role |
| :--- | :--- | :--- | :--- |
| `admin` | `admin@penilaistandaruji.com` | `AdminPSU2026!` | `Super Admin` |
| `redaksi` | `redaksi@penilaistandaruji.com` | `RedaksiPSU2026!` | `Editor` |

> Anda dapat mengubah password atau menambahkan akun Admin/Editor baru langsung melalui menu **Log & Akun Admin (JWT)** di dalam `/dashboard-artikel/pengaturan`.

---

## 3. Penyesuaian Skema Database MySQL (`psu_company_profile`)

Saat `backend/server.js` dijalankan (atau saat mengimpor `backend/database/psu_sertifikat.sql`), sistem secara otomatis menyiapkan dan memigrasikan tabel-tabel berikut:

1. **`admin_users`**: Menyimpan kredensial admin (`username`, `email`, `password_hash` dengan `scrypt`, `full_name`, `role`, `is_active`, `last_login`).
2. **`artikel`**: Diperbarui dengan kolom tambahan:
   - `is_featured TINYINT(1) DEFAULT 0` (penanda artikel unggulan ★)
   - `views INT DEFAULT 0` (penghitung jumlah pembaca halaman detail)
   - `created_at` & `updated_at`
3. **`galeri_artikel`**: Menyimpan seluruh foto yang pernah di-upload ke artikel (`/news/...`) maupun gambar sampul default (`title`, `filename`, `image_url`, `category`, `alt_text`, `file_size`, `mime_type`, `uploaded_by`, `created_at`).
4. **`penulis_artikel`**: Menyimpan daftar penulis/divisi resmi PT Penilai Standar Uji yang dapat dipilih pada form Tambah & Edit Artikel.
5. **`log_aktivitas_artikel`**: Mencatat riwayat aktivitas admin (`LOGIN`, `CREATE_ARTICLE`, `UPDATE_ARTICLE`, `DELETE_ARTICLE`, `UPLOAD_MEDIA`, `DELETE_MEDIA`, dll.).

---

## 4. Fitur Menu pada `/dashboard-artikel`

1. **Ringkasan & Statistik (`Overview`)**:
   - Menampilkan KPI Total Artikel, Published vs Draft, Total Foto di Galeri, Total Pembaca (*Views*), grafik distribusi kategori (`News`, `Article`, `Press Release`), daftar artikel terbaru, dan jejak aktivitas admin.
2. **Kelola Semua Artikel**:
   - Tabel manajemen artikel dengan pencarian instan, filter Kategori, filter Status (`Published`/`Draft`), filter Tahun, pengurutan, *Quick Toggle* status tayang & artikel unggulan (★), duplikasi artikel, *Bulk Actions* (Publish/Draft/Hapus massal), dan ekspor ke CSV.
3. **Tambah Artikel Baru & Edit Artikel (Terintegrasi Dashboard)**:
   - Editor artikel bilingual (Indonesia & Inggris) dengan fitur **Pilih dari Galeri Foto (Modal Visual Interaktif)**, upload gambar baru, pembuatan ringkasan (*excerpt*) otomatis, rekomendasi tag sekali klik, dan **Mode Pratinjau Langsung (*Live Preview*)**.
4. **Galeri Foto Artikel (*Media Library*)**:
   - Melihat seluruh foto yang sudah di-upload pada artikel (`/news/...`) beserta status penggunaannya (`Dipakai di X Artikel`).
   - Memungkinkan admin memakai ulang foto yang sudah ada ke **Artikel Baru** atau **Edit Artikel** hanya dengan 1 klik tanpa perlu mengunggah ulang file yang sama.
5. **Penulis & Kategori/Tag**:
   - Menambah/menghapus daftar penulis resmi serta mengubah nama tag (*rename* massal) atau menghapus tag di seluruh artikel.
6. **Log & Akun Admin (JWT)**:
   - Mengelola profil admin, mengganti password, menambah akun editor baru, dan memantau tabel audit log aktivitas.
