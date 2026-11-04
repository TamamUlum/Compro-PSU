# Changelog

Semua perubahan penting pada **Website Company Profile PT Penilai Standar Uji (PSU)** dicatat di sini secara kronologis, dari awal repository sampai kondisi saat ini.

## Cara membaca changelog

- Catatan ini disusun dari riwayat commit Git yang tersedia di repository, bukan dari catatan rilis atau tiket terpisah.
- Tanggal mengikuti tanggal commit yang tercatat di Git.
- Hash pendek setelah judul bagian merujuk pada commit yang memuat perubahan terkait.
- Repository belum menggunakan tag atau skema versi rilis resmi. Oleh karena itu, perubahan dicatat berdasarkan tanggal, bukan nomor versi semantik.
- Commit merge, commit tanpa perubahan file, dan commit dengan pesan terlalu umum tidak selalu memiliki entri tersendiri. Bila perubahan konkretnya dapat dikenali dari file yang ikut berubah, dampaknya dirangkum pada bagian tanggal yang sesuai. Tidak ada fitur yang disimpulkan hanya dari pesan seperti “update” atau “test”.

## 2026-10-17

### Dokumentasi dan penyempurnaan terakhir

**`e87f27e` — dokumentasi proyek diperbarui**

- README bawaan template diganti dengan panduan proyek berbahasa Indonesia.
- README menjelaskan fungsi website, teknologi, kebutuhan sistem, instalasi dependency frontend/backend, impor database, konfigurasi backend, cara menjalankan proyek, contoh nomor sertifikat, endpoint API, struktur folder, build, lint, keamanan deployment, dan pemecahan masalah.
- Changelog mulai digunakan untuk mendokumentasikan riwayat perubahan yang dapat dilacak dari repository.

**`6992452`, `afab788`, `16deb80`, `72f8aec`, dan `16f93b2` — penyempurnaan tampilan dan aset**

- Tampilan halaman Kimia dan beranda diperbarui.
- Konten profil dan presentasi visi/misi menerima perbaikan tampilan.
- Penanganan aset, konfigurasi frontend, serta dependency terkait build dirapikan untuk mengatasi masalah file/error.
- Halaman layanan menjalani penyesuaian lanjutan berdasarkan pengujian.

**`505f0c2` — pembaruan database**

- File database sertifikat diperbarui. Detail data yang berubah mengikuti isi SQL pada commit tersebut.

## 2026-10-16

### Penyempurnaan profil, navigasi, dan tampilan halaman

**`34f49fc` — konten profil dan kontak diperluas**

- Bagian profil dan kontak ditambah serta dirapikan agar informasi perusahaan lebih lengkap.
- Tampilan kedua halaman disesuaikan untuk menghadirkan presentasi informasi yang lebih jelas.

**`e725bc9` — perbaikan struktur organisasi dan kontak**

- Tampilan halaman struktur organisasi disempurnakan.
- Halaman kontak mendapatkan perbaikan tambahan.

**`251c946` dan perubahan terkait — pembaruan sejarah, visi, misi, dan konten sektor**

- Narasi sejarah dan visi/misi perusahaan diperbarui.
- Konten halaman sektor, termasuk pertanian, tanaman, pangan, kimia, logam, dan jasa lainnya, dirapikan mengikuti materi profil terbaru.
- Header halaman dan tata letak bagian beranda/profil menerima penyempurnaan.

**`90ad22c` — tombol navigasi diubah menjadi pelacakan**

- Label dan fungsi tombol lama “Login” diubah menjadi akses untuk melacak sertifikat.
- Route/halaman login yang tidak lagi digunakan dihapus.
- Ukuran teks dropdown navigasi dan sejumlah teks halaman disesuaikan.
- Terjemahan untuk label yang terdampak ikut diperbarui.

**`3a30f74`, `bd84d55`, dan `3146ddc` — aset layanan dan informasi legalitas**

- Banner dan gambar layanan diperbarui, termasuk aset alat kesehatan untuk layanan kalibrasi.
- Halaman legalitas Sertifikasi Produk dan Laboratorium Pengujian dilengkapi materi dan dokumen pendukung akreditasi.
- Tombol akses dokumen legalitas dirapikan.
- Konten dan penyajian ruang lingkup pengujian disesuaikan dengan pembaruan materi layanan.

### Ruang lingkup dan biaya layanan

**`2f740da`, `4a21392`, `7fd7f96`, dan `d98b8f4` — penyajian ruang lingkup**

- Ruang lingkup Sertifikasi Produk dan Laboratorium Pengujian mulai disajikan dalam tabel agar standar/parameter lebih mudah dipindai.
- Struktur tabel kemudian disesuaikan kembali untuk memperbaiki susunan informasinya.
- Konten ruang lingkup pengujian diperbarui.

**`b502933` dan `1af99a8` — kalibrasi alat kesehatan**

- Materi layanan kalibrasi alat kesehatan ditambahkan dan disempurnakan.
- Gambar peralatan kalibrasi, termasuk alat timbang, defibrillator, electrical safety analyzer, gas flow analyzer, incubator analyzer, parameter tester, dan patient simulator, ditambahkan sebagai materi visual layanan.
- Label terkait alat kesehatan disesuaikan pada terjemahan.

**`b70d66b`, `fe5bdd8`, dan `eea611e` — biaya, penawaran, dan ruang lingkup**

- Konten halaman biaya dan penawaran untuk layanan diperbarui.
- Informasi ruang lingkup Pengujian disesuaikan kembali.
- Materi biaya dan ruang lingkup pada beberapa halaman layanan menerima revisi lanjutan.

### Berita, artikel, dan peningkatan informasi publik

**`51c04aa` — fondasi fitur artikel dinamis**

- Endpoint backend dan skema database artikel dikembangkan/diperbarui untuk mendukung pengelolaan konten berita dan artikel.
- Halaman daftar artikel, detail artikel, tambah artikel, dan edit/hapus artikel ditambahkan atau diintegrasikan ke aplikasi.
- Data fallback artikel ditambahkan agar beranda tetap dapat menampilkan konten terbaru ketika API belum tersedia.
- Header halaman bersama diperkenalkan dan digunakan untuk konsistensi judul halaman.
- Beranda dihubungkan ke artikel terbaru dari API.

**`ec46f3a` — legalitas dan alur artikel**

- Dokumen lampiran akreditasi Laboratorium Pengujian ditambahkan dan dokumen legalitas terkait diperbarui.
- Halaman legalitas pengujian dan Sertifikasi Produk diperbaiki.
- Halaman detail dan tambah artikel menerima penyempurnaan.

**`56759a8`, `833eddc`, dan perubahan paket terkait**

- Konfigurasi dan dependency frontend diperbarui untuk mendukung kebutuhan styling dan build.
- Konfigurasi PostCSS ditambahkan.

### Bahasa dan penyesuaian penggunaan

**`410299b` — cakupan bahasa Inggris diperluas**

- Terjemahan diperluas ke navigasi, footer, formulir tambah/edit artikel, halaman pelacakan sertifikat, dan halaman layanan.
- Konten dan label pada halaman pengujian, kalibrasi, legalitas, serta ruang lingkup disesuaikan untuk pengalaman bilingual yang lebih konsisten.

**`16deb80` — pemeliharaan dependency dan tampilan profil**

- Dependency frontend/backend dan konfigurasi PostCSS dirapikan untuk membantu menangani masalah file/build.
- Tampilan halaman profil menerima pembaruan.
- Arsip proyek yang sebelumnya ikut tersimpan di repository dihapus.

## 2026-10-15

### Pelacakan sertifikat dan backend

**`cb9bc30` — fitur pelacakan nomor sertifikat**

- Fitur pencarian nomor sertifikat di halaman pelanggan dihubungkan dengan backend API.
- Backend Express dan dependency backend ditambahkan.
- Database MySQL disiapkan untuk empat kategori data sertifikat:
  - Sertifikasi Produk.
  - Pengujian.
  - Kalibrasi.
  - Sertifikasi Sistem Manajemen.
- Form pelacakan mengirim nomor sertifikat dan kategori layanan ke API untuk mencari data yang sesuai.
- Antarmuka pelanggan serta navigasi diperbarui untuk menampilkan dan mengakses proses pelacakan.
- Integrasi database memisahkan sertifikat per kategori agar pencarian pada satu layanan tidak mengambil data layanan lain.

**`f83f657` — database contoh disertakan**

- Script SQL untuk membuat database, tabel sertifikat, dan data contoh dimasukkan ke folder backend.
- Dataset awal memungkinkan proses pelacakan dicoba secara lokal.

**`234d368` dan `4919b38` — konfigurasi aset dan Vite**

- Konfigurasi Vite disesuaikan untuk membantu penyajian gambar dan aset frontend.
- Berkas konfigurasi/database yang berkaitan ikut dirapikan.

### Perluasan konten website

**`eee3079` — profil dan kontak diperbarui**

- Bagian misi dan tampilan profil disesuaikan.
- Bagian tambahan ditambahkan pada halaman profil perusahaan.
- Halaman kontak mendapatkan kartu akses WhatsApp.
- Materi dan terjemahan terkait diperbarui.

**`8fa2951`, `a54e831`, dan `a675b51` — kartu interaktif**

- Kartu interaktif di beranda disempurnakan.
- Animasi dan interaksi kartu disesuaikan.
- Tampilan beranda dan sejumlah halaman sektor diperbaiki.

**`045b6b1` dan `585164f` — halaman layanan**

- Halaman terkait layanan sertifikasi ditambahkan/diperbarui agar lebih terhubung dengan dropdown layanan.
- Teks terjemahan dan materi halaman terkait disesuaikan.

**`87d1e70`, `b303332`, dan `d900e5f` — header halaman dan navigasi**

- Komponen header halaman beserta gambar dan tautannya ditambahkan/diperluas untuk berbagai halaman.
- Link halaman dan beberapa detail beranda diperbarui.
- Header digunakan untuk menyeragamkan tampilan pembuka halaman.

**`1328207` — pembaruan lintas layanan**

- Konten dan tampilan sejumlah halaman layanan diperbarui.
- Perubahan mencakup konfigurasi frontend, terjemahan, dependency, halaman kontak, dan halaman layanan.

### Dokumentasi instalasi awal

**`4653eaf`, `dea9e83`, `2876ada`, `39e0adf`, dan `1b1dc83`**

- README awal diperbarui bertahap untuk menjelaskan cara menjalankan backend dan frontend.
- Petunjuk impor database lokal ditambahkan.
- Contoh nomor sertifikat disertakan agar form tracking dapat diuji.
- Petunjuk penyiapan proyek dan data contoh diperjelas.

## 2026-10-14

### Kartu layanan utama dan halaman sektor

**`3bf0825` — layanan utama dan kartu sektor**

- Bagian “Layanan Utama Kami” ditambahkan ke beranda.
- Kartu layanan disusun sebagai carousel horizontal yang bergerak otomatis pada layar desktop.
- Kartu sektor ditambahkan atau diperluas pada halaman Pertanian, Tanaman, Produk Pangan, dan Kimia.
- Aset gambar pendukung sektor ditambahkan.

**`f816a16` — penyempurnaan kartu dan gerakan**

- Tampilan kartu pada beranda dan sektor diperhalus.
- Perilaku animasi/scroll kartu diperbarui.
- Beberapa komponen, halaman profil, halaman kontak, dan sektor ikut menerima penyesuaian visual.

### Biaya dan ruang lingkup layanan

**`b70d66b` — biaya penawaran layanan**

- Materi biaya dan penawaran pada beberapa halaman layanan diperbarui.

**`fe5bdd8` dan `6d7a4a9` — ruang lingkup pengujian**

- Konten ruang lingkup pengujian dan konfigurasi frontend terkait diperbarui.
- Informasi layanan diperbaiki untuk mencerminkan susunan ruang lingkup terbaru.

## 2026-10-13

### Interaksi beranda dan navigasi

**`bca0acb` — perluasan halaman dan animasi**

- Halaman layanan dan navigasi menuju halaman pelanggan diperluas.
- Halaman beranda dan profil disempurnakan.
- Animasi saat konten masuk ke area tampilan ditambahkan.
- Perilaku scroll disesuaikan agar navigasi halaman kembali ke bagian atas.
- Struktur beberapa halaman pelanggan diorganisasi berdasarkan jenis layanan.

**`4239064` — daftar dan tombol interaktif**

- Daftar serta tombol pada halaman beranda diperluas.
- Elemen-elemen tersebut dihubungkan ke interaksi/navigasi yang relevan.
- Teks terjemahan dan beberapa halaman layanan/kontak/profil disesuaikan.

## 2026-10-12

### Dukungan bahasa Inggris dan responsivitas

**`e5c6052` — terjemahan bahasa Inggris**

- Pilihan bahasa Inggris dan komponen pendukung bahasa ditambahkan.
- Navigasi, footer, header, tombol kontak, dan berbagai halaman mulai menampilkan terjemahan berdasarkan pilihan bahasa.
- Komponen teks terlokalisasi diperkenalkan untuk konten yang memerlukan bahasa berbeda.
- Layout responsif diperbaiki untuk ukuran layar yang lebih kecil.
- Komponen navigasi, halaman pelanggan, artikel, profil, dan layanan menerima penyesuaian terkait bahasa/tampilan.

### Galeri beranda

**`fa3fde2` — tabel/galeri gambar**

- Bagian visual berupa kumpulan gambar ditambahkan ke halaman beranda.
- Aset gambar dan styling galeri diperbarui.

## 2026-10-10

### Perombakan besar struktur halaman dan konten

**`91670ec` — reorganisasi utama website**

- Beranda dan halaman profil disusun ulang dengan konten perusahaan yang lebih lengkap.
- Dropdown profil pada navigasi dihapus dan struktur menu disederhanakan.
- Halaman layanan lama diganti dengan halaman yang lebih terorganisasi per jenis layanan.
- Konten dan struktur halaman Sertifikasi, Pelanggan, Profil, dan layanan dirapikan.
- Kerangka pilihan bahasa Indonesia/Inggris, context bahasa, dan tombol pemilih bahasa ditambahkan.
- Halaman dan materi untuk Sertifikasi Produk, Pengujian, Kalibrasi, Pelatihan, dan Sertifikasi Sistem Manajemen diperluas.
- Komponen navigasi, footer, tombol WhatsApp, dan beranda diselaraskan dengan struktur baru.

Perubahan ini merupakan salah satu tahap restrukturisasi terbesar sejak kerangka awal website.

## 2026-10-09

### Akses layanan dari beranda

**`e88ec11` — kartu layanan dan WhatsApp**

- Tombol/kartu layanan utama ditambahkan ke halaman beranda.
- Halaman layanan dan data daftar layanan diperkenalkan untuk menautkan pengunjung ke layanan yang tersedia.
- Tombol WhatsApp mengambang ditambahkan agar pengunjung dapat menghubungi PSU dari berbagai halaman.
- Route, styling, dan komponen beranda diperbarui untuk mendukung navigasi tersebut.

## 2026-10-08

### Halaman pelanggan dan navigasi

**`5a601f3` — tabel data pelanggan**

- Halaman Pelanggan mulai menampilkan tabel sertifikat.
- Tombol/filter tahun ditambahkan untuk membantu pengunjung menemukan data.
- Data contoh pelanggan dipisahkan ke modul tersendiri.
- Styling halaman Pelanggan, legalitas, dan sertifikasi disesuaikan.

**`bb08226` — perbaikan halaman Pelanggan**

- Kesalahan pada halaman/tabel pelanggan diperbaiki.
- Integrasi data dan tampilan tabel disesuaikan.

**`354876d` dan `c481f08` — penyesuaian navigasi**

- Logika beberapa halaman dan route aplikasi diperbarui.
- Tombol Login pada navigasi disesuaikan.
- Komponen scroll-to-top ditambahkan agar perpindahan halaman lebih mudah digunakan.
- Halaman kontak dan navigasi ikut menerima perubahan.

### Pemeliharaan repository

**`11bcb5c`, `5830fe9`, dan `d2bff78`**

- Berkas konfigurasi/tooling agen yang tidak diperlukan untuk aplikasi dihapus dari repository.
- Perubahan ini merapikan berkas proyek dan tidak menambahkan fitur website yang ditujukan kepada pengunjung.

## 2026-10-07

### Banner dan navigasi layanan

**`a9e4f00` — pembaruan hero beranda**

- Banner utama beranda disempurnakan.
- Teks pengantar dan gambar banner ditambahkan.
- Aset visual baru ditambahkan untuk memperkuat bagian pembuka website.

**`a60b218` — perataan teks beranda**

- Perataan teks pada bagian beranda disesuaikan agar lebih mudah dibaca.

**`4a2c1f9` — dropdown layanan**

- Menu Layanan ditambahkan ke navbar dengan dropdown.
- Halaman pengantar layanan untuk Sertifikasi Produk, Pengujian, Kalibrasi, Pelatihan, dan Sertifikasi Sistem Manajemen mulai dibuat.
- Route aplikasi disesuaikan agar halaman layanan dapat dibuka melalui navigasi.

### Konten sertifikasi

**`4fbcf17` dan `eb30a18` — informasi sertifikasi**

- Materi legalitas dan informasi halaman layanan dirapikan.
- Konten halaman Sertifikasi ditambahkan/diperluas.
- Materi skema Tipe 1B beserta aset pendukungnya ditambahkan.

**`4f2eeb5` — perubahan tahap uji**

- Terdapat commit pengujian/perubahan pada tahap pengembangan. Karena pesan commit tidak menjelaskan rincian perubahan secara spesifik, tidak ada fungsi tambahan yang diklaim dari commit ini.

## 2026-10-06

### Navigasi profil dan portofolio

**`31ba608`**

- Dropdown profil pada tampilan desktop disesuaikan.
- Menu/halaman portofolio ditambahkan ke navigasi.
- Route dan tampilan portofolio dihubungkan ke aplikasi.

## 2026-10-04

### Kerangka profil perusahaan

**`3bd45c0` — header, footer, sejarah, dan visi/misi**

- Komponen header bagian atas (header-top) ditambahkan.
- Dropdown profil dibuat pada navigasi.
- Footer dan styling footer disusun.
- Konten sejarah, visi, dan misi diperbarui.
- Struktur halaman dan komponen utama React diperluas.
- Halaman legalitas, pelanggan, dan login awal dibuat pada tahap prototipe.
- Tampilan beranda serta aset logo/banner diperbarui.

**`fbdba0c` — struktur organisasi**

- Halaman Struktur Organisasi dibuat beserta styling-nya.
- Konten sejarah dan bagian terkait profil disesuaikan.

**`804c174` — tampilan header mobile**

- Header-top disesuaikan untuk layar ponsel.

### Kontak

**`cee7ddb` dan `15b2c63`**

- Menu/halaman Kontak diperkenalkan.
- Informasi kontak dan tampilan halaman diperbarui pada revisi berikutnya.
- Styling halaman kontak serta dependency proyek terkait ditambahkan/diperbarui.

## 2026-10-01

### Kerangka aplikasi awal

**`8f055e9` — frontend awal dipindahkan ke repository**

- Aplikasi React berbasis Vite dimasukkan ke repository.
- Entry point, konfigurasi Vite, stylesheet dasar, navbar, dan footer awal disiapkan.
- Halaman awal untuk Beranda, Artikel, Kontak, Mitra, Profil, Sertifikasi, dan Struktur ditambahkan.
- Logo PSU dan favicon awal dimasukkan sebagai aset publik.
- Konfigurasi ESLint dan manifest dependency frontend dibuat.

Commit ini menjadi titik awal kode aplikasi yang dapat dijalankan di dalam repository.

## 2026-09-30

### Inisialisasi repository

**`da4653d` — Initial commit**

- Repository Git diinisialisasi.
- Berkas `.gitignore` dasar ditambahkan untuk mencegah file runtime, dependency, cache, dan konfigurasi lokal tertentu masuk ke version control.
- Pada commit ini belum terdapat implementasi website yang tercatat; kerangka frontend ditambahkan pada tahap berikutnya.

## Catatan riwayat

Perubahan berlanjut melalui sejumlah commit merge dan commit berpesan umum seperti “update”, “updating”, atau “test”. Changelog ini merangkum perubahan yang dapat diverifikasi dari judul commit dan file yang berubah, sambil menghindari klaim atas rincian yang tidak dicatat secara eksplisit. Untuk melihat detail file atau patch pada satu perubahan, gunakan riwayat Git repository dan hash commit yang dicantumkan pada bagian terkait.
