# Website Company Profile PT Penilai Standar Uji

Website profil perusahaan PT Penilai Standar Uji (PSU) dengan fitur pencarian sertifikat dan pengelolaan artikel. Aplikasi terdiri dari frontend React/Vite, backend API Express, dan database MySQL.

Konten website tersedia dalam bahasa Indonesia dan bahasa Inggris. Pengunjung dapat melihat profil, layanan, sektor, informasi kontak, berita, serta mencari data sertifikat berdasarkan kategori layanan.

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Persyaratan](#persyaratan)
- [Menjalankan di Komputer Lokal](#menjalankan-di-komputer-lokal)
- [Konfigurasi Backend](#konfigurasi-backend)
- [URL dan Endpoint API](#url-dan-endpoint-api)
- [Data Contoh untuk Pelacakan](#data-contoh-untuk-pelacakan)
- [Struktur Proyek](#struktur-proyek)
- [Build, Lint, dan Pengembangan](#build-lint-dan-pengembangan)
- [Catatan Keamanan dan Deployment](#catatan-keamanan-dan-deployment)
- [Pemecahan Masalah](#pemecahan-masalah)

## Fitur

### Website publik

- Beranda dengan banner, layanan utama, sektor industri, dan artikel terbaru.
- Profil perusahaan dan struktur organisasi.
- Informasi sektor:
  - Pertanian dan perkebunan.
  - Produk tanaman.
  - Produk pangan.
  - Bahan dan produk kimia.
  - Logam dan produk logam.
  - Jasa lainnya.
- Informasi layanan:
  - **Sertifikasi Produk (LSPro):** legalitas, ruang lingkup, permohonan, skema Tipe 1B dan Tipe 5, penggunaan tanda SNI, keluhan dan banding, hak dan kewajiban klien, serta biaya.
  - **Laboratorium Pengujian:** legalitas, ruang lingkup, proses pengujian, dan biaya.
  - **Laboratorium Kalibrasi:** legalitas, ruang lingkup kalibrasi alat kesehatan, dan biaya.
  - **Sertifikasi Sistem Manajemen:** legalitas, ruang lingkup, proses sertifikasi, keluhan dan banding, hak dan kewajiban klien, serta biaya.
  - **Pelatihan:** informasi pelatihan umum, in-house, dan ex-house.
- Halaman kontak dengan informasi alamat, peta, email, dan WhatsApp.
- Pilihan bahasa Indonesia/Inggris. Pilihan bahasa disimpan di browser.
- Tata letak responsif dan tombol WhatsApp mengambang.

### Pencarian sertifikat

Pengunjung dapat mencari sertifikat tanpa login pada empat kategori:

1. Sertifikasi Produk.
2. Pengujian.
3. Kalibrasi.
4. Sertifikasi Sistem Manajemen.

Hasil pencarian menampilkan data yang tersedia di database, termasuk nama perusahaan, produk atau ruang lingkup, standar, nomor sertifikat, tanggal terbit, status, dan sumber data.

### Berita dan artikel

- Daftar artikel, halaman detail, pencarian berdasarkan tahun/tag, serta pagination.
- Konten artikel memiliki judul, ringkasan, isi, dan gambar dalam bahasa Indonesia dan Inggris.
- Form untuk menambah, mengedit, dan menghapus artikel, termasuk status draft/published.
- Gambar artikel dapat diunggah ke folder publik proyek.
- Artikel terbaru ditampilkan di beranda. Jika API belum tersedia, beranda menggunakan data fallback lokal.

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19, React Router, Vite 8, JavaScript, CSS |
| Backend | Node.js, Express 4 |
| Database | MySQL, `mysql2` |
| Utilitas frontend | `react-icons`, ESLint |

## Persyaratan

- Node.js yang mendukung Vite 8 (disarankan Node.js 20.19+ atau 22.12+).
- npm.
- MySQL Server lokal, misalnya melalui XAMPP atau MySQL Workbench.
- Hak akses database yang dapat membuat database dan tabel untuk konfigurasi pertama.

## Menjalankan di Komputer Lokal

### 1. Unduh proyek dan pasang dependency

Dari direktori utama proyek:

```bash
npm --prefix backend install
npm --prefix company-profile install
```

Dependency backend dan frontend dikelola oleh masing-masing folder. Menjalankan `npm install` hanya di direktori utama tidak menggantikan instalasi kedua dependency tersebut.

### 2. Siapkan database

Nyalakan MySQL, lalu impor file [backend/database/psu_sertifikat.sql](backend/database/psu_sertifikat.sql) menggunakan MySQL Workbench atau klien MySQL lain. Script tersebut membuat database `psu_company_profile`, tabel sertifikat dan artikel, serta data contoh.

> **Penting:** script SQL berisi `DROP TABLE IF EXISTS` untuk tabel-tabel yang dibuatnya. Mengimpor ulang script dapat menghapus lalu membuat ulang tabel beserta data di dalamnya. Cadangkan database terlebih dahulu jika berisi data yang ingin dipertahankan.

Backend juga membuat database/tabel yang belum ada saat pertama kali dijalankan dan mengisi data awal artikel bila tabel artikel masih kosong. Namun, contoh sertifikat disediakan oleh script SQL.

### 3. Atur koneksi backend (opsional)

Tanpa file `.env`, backend menggunakan konfigurasi lokal berikut:

| Variabel | Nilai default | Keterangan |
| --- | --- | --- |
| `DB_HOST` | `127.0.0.1` | Host MySQL |
| `DB_USER` | `root` | Pengguna MySQL |
| `DB_PASSWORD` | kosong | Kata sandi MySQL |
| `DB_NAME` | `psu_company_profile` | Nama database |
| `DB_PORT` | `3306` | Port MySQL |
| `PORT` | `5000` | Port API |

Jika konfigurasi lokal berbeda, buat `backend/.env` (file `.env` tidak disimpan di Git) dan isi, misalnya:

```dotenv
DB_HOST=127.0.0.1
DB_USER=root
DB_PASSWORD=
DB_NAME=psu_company_profile
DB_PORT=3306
PORT=5000
```

Gunakan nilai `DB_PASSWORD` sesuai konfigurasi MySQL Anda. Jangan memasukkan kata sandi atau kredensial asli ke README maupun ke Git.

### 4. Jalankan aplikasi

Dari direktori utama proyek:

```bash
npm start
```

Perintah ini menjalankan backend dan server pengembangan Vite secara bersamaan. Buka alamat frontend yang ditampilkan di terminal, biasanya:

- Website: <http://localhost:5173>
- API: <http://127.0.0.1:5000>
- Pemeriksaan status API: <http://127.0.0.1:5000/>

Tekan `Ctrl+C` di terminal untuk menghentikan proses.

### Menjalankan frontend dan backend terpisah

Untuk pengembangan, buka dua terminal dari direktori utama.

Terminal pertama:

```bash
cd backend
npm run dev
```

Terminal kedua:

```bash
cd company-profile
npm run dev
```

Frontend Vite secara default berjalan pada port `5173`; backend berjalan pada port `5000`.

## Konfigurasi Backend

Backend akan menggunakan pengaturan koneksi dari variabel lingkungan di atas. Nama database default adalah `psu_company_profile`.

Kategori untuk endpoint pencarian sertifikat menggunakan nilai berikut:

| Segmen URL | Tabel database |
| --- | --- |
| `sertifikasi-produk` | `sertifikat_produk` |
| `pengujian` | `sertifikat_pengujian` |
| `kalibrasi` | `sertifikat_kalibrasi` |
| `sertifikasi-sistem-manajemen` | `sertifikat_sistem_manajemen` |

Tabel artikel bernama `artikel`. Database menggunakan charset `utf8mb4`.

## URL dan Endpoint API

Semua endpoint API berada di backend Express pada port `5000` secara default.

| Method | Endpoint | Kegunaan |
| --- | --- | --- |
| `GET` | `/` | Memeriksa bahwa API berjalan. |
| `GET` | `/api/sertifikat/:submenu?no_sertifikat=...` | Mencari sertifikat pada satu kategori. |
| `GET` | `/api/artikel` | Mengambil artikel published dengan filter dan pagination. |
| `GET` | `/api/artikel/:slug` | Mengambil detail artikel berdasarkan slug atau ID. |
| `POST` | `/api/artikel` | Membuat artikel. |
| `PUT` | `/api/artikel/:idOrSlug` | Memperbarui artikel berdasarkan ID atau slug. |
| `DELETE` | `/api/artikel/:idOrSlug` | Menghapus artikel berdasarkan ID atau slug. |
| `GET` | `/api/authors` | Mengambil daftar pilihan penulis. |
| `POST` | `/api/upload-gambar` | Menyimpan gambar artikel dari data URL Base64 ke `company-profile/public/news/`. |

Parameter daftar artikel:

- `year`: filter tahun penerbitan; nilai `All` atau tidak diisi berarti semua tahun.
- `tag`: filter kategori/tag; nilai `All` atau tidak diisi berarti semua tag.
- `page`: nomor halaman, minimal `1`.
- `limit`: jumlah artikel per halaman, minimal `1` (default `9`).
- `all=1` atau `all=true`: sertakan artikel draft. Tanpa parameter ini, hanya artikel berstatus `Published` yang dikembalikan.

Contoh:

```text
http://127.0.0.1:5000/api/sertifikat/sertifikasi-produk?no_sertifikat=PSU-SPPT-2026-0001
http://127.0.0.1:5000/api/artikel?year=2026&tag=News&page=1&limit=9
```

## Data Contoh untuk Pelacakan

Data berikut dimasukkan oleh script SQL dan dapat digunakan untuk mencoba form pelacakan:

| Kategori | Contoh nomor sertifikat |
| --- | --- |
| Sertifikasi Produk | `PSU-SPPT-2026-GAHA`, `PSU-2026-PPWIQADA`, `PSU-SPPT-2025-0012`, `PSU-SPPT-2024-0007` |
| Pengujian | `PSU-LP-2026-BKLN`, `PSU-LP-2026-MNPQ`, `PSU-SPPT-2026-0101`,'`PSU-LP-2024-RTYU` |
| Kalibrasi | `PSU-LK-2026-KLMN`, `PSU-LK-2026-PQRS`, `PSU-SPPT-2026-0201`, `PSU-LK-2024-WXYZ` |
| Sertifikasi Sistem Manajemen | `PSU-LSSM-2026-ABCD`, `PSU-LSSM-2026-EFGH`, `PSU-SPPT-2026-0301`, `PSU-LSSM-2024-IJKL` |

## Struktur Proyek

```text
.
├── backend/
│   ├── database/
│   │   └── psu_sertifikat.sql  # Skema dan data awal MySQL
│   ├── server.js               # API Express dan inisialisasi database
│   └── package.json
├── company-profile/
│   ├── public/                 # Gambar, dokumen, ikon, dan aset publik
│   │   └── news/               # Gambar artikel yang diunggah
│   ├── src/
│   │   ├── components/         # Navbar, footer, header, tombol WhatsApp
│   │   ├── context/            # Pengaturan bahasa dan terjemahan
│   │   ├── data/               # Data fallback artikel
│   │   ├── pages/              # Halaman profil, layanan, artikel, pelacakan
│   │   ├── App.jsx             # Route aplikasi
│   │   └── main.jsx            # Entry point frontend
│   ├── index.html
│   └── package.json
├── start_all.js                # Menjalankan frontend dan backend bersamaan
├── package.json                # Script root
└── CHANGELOG.md
```

## Build, Lint, dan Pengembangan

Jalankan dari direktori utama:

```bash
# Build frontend produksi
npm --prefix company-profile run build

# Periksa kode frontend dengan ESLint
npm --prefix company-profile run lint
```

Hasil build frontend berada di `company-profile/dist`. Script `npm start` menjalankan API dan server pengembangan Vite; script tersebut bukan server produksi untuk menyajikan hasil build.

## Catatan Keamanan dan Deployment

- Proyek ini menyediakan konfigurasi untuk pengembangan lokal. Belum ada konfigurasi siap-produksi untuk menyajikan frontend hasil build dan API melalui satu origin.
- Endpoint pembuatan, pengubahan, penghapusan artikel, serta unggah gambar saat ini tidak menerapkan autentikasi/otorisasi. Jangan memublikasikan endpoint tersebut ke internet sebelum perlindungan akses ditambahkan.
- Backend menerima CORS secara luas. Atur kebijakan origin yang sesuai sebelum deployment.
- `GET /api/artikel?all=1` menyertakan draft; batasi aksesnya bila API digunakan di lingkungan publik.
- Jangan gunakan data contoh atau kredensial database lokal sebagai data produksi. Buat kredensial database dengan hak akses minimum dan simpan di environment server.
- Siapkan backup database dan folder `company-profile/public/news/`; file gambar artikel disimpan di folder tersebut.
- Sesuaikan alamat API dan konfigurasi hosting frontend jika frontend dan backend di-deploy pada host/domain berbeda.

## Pemecahan Masalah

### Koneksi database gagal

Pastikan service MySQL sudah berjalan, nilai `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, dan `DB_NAME` benar, serta akun database memiliki hak untuk membuat/mengakses database dan tabel. Backend dapat mulai berjalan meskipun koneksi awal gagal, tetapi permintaan API yang membutuhkan database akan mengembalikan error.

### Port sudah digunakan

Jika port `5000` atau `5173` sedang dipakai aplikasi lain, hentikan aplikasi tersebut atau ubah port yang sesuai. Port backend dapat diubah dengan `PORT` di `backend/.env`. Vite menampilkan port frontend yang dipakainya di terminal.

### Sertifikat tidak ditemukan

Pastikan script SQL sudah diimpor, kategori pada form sesuai dengan kategori sertifikat, dan nomor sertifikat cocok dengan data di tabel. Pencarian menerima variasi kapitalisasi dan spasi, tetapi nomor sertifikat tetap harus merujuk pada rekaman yang tersedia.

### Artikel tidak muncul atau gagal disimpan

Pastikan backend hidup dan database `artikel` dapat diakses. Pastikan juga gambar yang diunggah dapat ditulis ke `company-profile/public/news/`. Frontend menyediakan data fallback untuk artikel terbaru di beranda, tetapi halaman artikel memerlukan API.
