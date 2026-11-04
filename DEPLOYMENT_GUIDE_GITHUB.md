# PANDUAN DEPLOYMENT & PENGELOLAAN REPOSITORY GITHUB
## PT PENILAI STANDAR UJI (PT PSU)

**Dokumen:** Panduan Resmi Inisialisasi, Konfigurasi, dan Pemeliharaan Repository GitHub  
**Target Proyek:** Website Company Profile & Tracking Sertifikat PT PSU  
**Klasifikasi Repository:** **PRIVATE (Wajib)**  
**Direktori Lokal:** `E:\PSU siap Upload\compro-PSU-main`

---

## 1. PENDAHULUAN & PRASYARAT

Panduan ini disusun untuk memandu tim pengembang dalam mempublikasikan kode sumber website PT Penilai Standar Uji ke GitHub secara aman, terstruktur, dan mematuhi kaidah keamanan siber.

### Prasyarat Sebelum Memulai:
1. **Aplikasi Git:** Telah terpasang di komputer lokal (`git --version` minimal versi 2.30+).
2. **Akun GitHub:** Memiliki akun resmi organisasi atau pengembang di [GitHub](https://github.com).
3. **Autentikasi Aman:** Menggunakan **Git Credential Manager (GCM)** atau **SSH Key**. 
   > [!CAUTION]
   > DILARANG KERAS menyematkan Personal Access Token (PAT) atau password langsung pada URL remote git (misalnya `https://ghp_xxxx@github.com/...`). Hal ini berisiko terekspos pada log sistem dan history git.

---

## 2. LANGKAH 1 — PEMBUATAN REPOSITORY DI GITHUB

1. Masuk (*login*) ke akun GitHub Anda di browser.
2. Klik tombol **New** (atau ikon **+** di sudut kanan atas lalu pilih **New repository**).
3. Isi parameter pembuatan repository sebagai berikut:
   - **Repository name:** `compro-psu` (atau `pt-psu-company-profile`).
   - **Description:** `Website Company Profile & Tracking Status Sertifikat PT Penilai Standar Uji (PT PSU)`.
   - **Visibility:** Pilih **Private**.
     > [!IMPORTANT]
     > Proyek ini memuat arsitektur aplikasi internal, skema database, dan aset korporat PT PSU. Wajib memilih visibilitas **Private**.
   - **Initialize this repository with:**
     - [ ] **JANGAN centang** *Add a README file* (repository lokal sudah memiliki `README.md`).
     - [ ] **JANGAN centang** *Add .gitignore* (repository lokal sudah memiliki `.gitignore` hardened).
     - [ ] **JANGAN centang** *Choose a license*.
4. Klik tombol hijau **Create repository**.
5. Simpan URL repository yang dihasilkan, contoh:
   - **HTTPS:** `https://github.com/USERNAME/compro-psu.git`
   - **SSH:** `git@github.com:USERNAME/compro-psu.git`

---

## 3. LANGKAH 2 — INISIALISASI & KONFIGURASI REMOTE LOKAL

Buka Command Prompt (CMD) atau PowerShell di komputer lokal Anda, lalu arahkan ke direktori kerja proyek:

```cmd
cd /d "E:\PSU siap Upload\compro-PSU-main"
```

### A. Verifikasi Status Remote Saat Ini
Periksa apakah sudah ada remote URL yang terhubung sebelumnya:

```cmd
git remote -v
```

*Jika belum ada output*, lanjutkan ke langkah penambahan remote.  
*Jika sudah ada remote lama yang keliru*, hapus atau ubah dengan:
```cmd
git remote remove origin
```

### B. Standardisasi Nama Branch ke `main`
Pastikan branch utama menggunakan penamaan standar `main`:

```cmd
git branch -M main
```

### C. Menghubungkan Remote Repository
Hubungkan repository lokal ke repository GitHub yang baru saja Anda buat:

```cmd
:: Opsi 1: Menggunakan HTTPS (Direkomendasikan dengan Git Credential Manager)
git remote add origin https://github.com/USERNAME/compro-psu.git

:: Opsi 2: Menggunakan SSH (Jika kunci SSH telah didaftarkan di GitHub)
git remote add origin git@github.com:USERNAME/compro-psu.git
```

Verifikasi kembali:
```cmd
git remote -v
```
Pastikan `origin` mengarah ke URL GitHub Anda untuk `fetch` dan `push`.

---

## 4. LANGKAH 3 — REVIEW PRE-COMMIT & INSPEKSI KEAMANAN

Sebelum melakukan commit, lakukan verifikasi gerbang keamanan (*security gate*) untuk memastikan tidak ada data sensitif yang masuk ke staging:

### A. Periksa Status File
```cmd
git status
```

### B. Verifikasi File Sensitif Ditolak oleh `.gitignore`
Pastikan file rahasia dan audit internal tidak dapat dimasukkan ke tracking:

```cmd
git check-ignore -v .env
git check-ignore -v backend/.env
git check-ignore -v SECURITY_AUDIT_REPORT.md
git check-ignore -v GITIGNORE_AUDIT_REPORT.md
```
Setiap perintah di atas wajib menghasilkan output baris aturan `.gitignore` yang memblokirnya.

---

## 5. LANGKAH 4 — STAGING, COMMIT & INITIAL PUSH

Jalankan perintah commit secara berurutan:

```cmd
:: 1. Masukkan perubahan kode dan penghapusan tracking audit internal ke staging
git add .

:: 2. Periksa daftar file yang akan di-commit (PASTIKAN tidak ada file rahasia)
git diff --cached --name-only

:: 3. Buat commit resmi awal
git commit -m "feat: initial production-ready release for PT Penilai Standar Uji"

:: 4. Unggah branch main ke GitHub
git push -u origin main
```

Saat menjalankan `git push`, browser atau Git Credential Manager akan meminta otorisasi akun GitHub Anda satu kali. Selesaikan proses login melalui browser tersebut.

---

## 6. WORKFLOW UPDATE BERKALA (DAILY DEVELOPMENT)

Setelah repository aktif di GitHub, gunakan alur kerja berikut untuk setiap pembaruan kode selanjutnya:

```
+-------------------------------------------------------------+
| 1. Edit Kode Lokal -> 2. Jalankan Pengujian (Regression)    |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 3. git status -> 4. git diff (Review Perubahan Baris Kode)  |
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 5. git add . -> 6. git commit -m "deskripsi perubahan jelas"|
+-------------------------------------------------------------+
                              |
                              v
+-------------------------------------------------------------+
| 7. git push origin main                                     |
+-------------------------------------------------------------+
```

### Rincian Perintah CMD:

```cmd
:: Periksa perubahan
git status

:: Uji build frontend sebelum commit
npm --prefix company-profile run build

:: Masukkan ke staging
git add .

:: Review file staging
git diff --cached --name-only

:: Commit dengan pesan konvensional
git commit -m "fix(services): refine card navigation and typography alignment"

:: Push ke remote
git push origin main
```

---

## 7. PROSEDUR ROLLBACK AMAN MENGGUNAKAN GIT

Jika terjadi kesalahan pada commit yang sudah di-push ke GitHub, **JANGAN** menggunakan perintah destruktif seperti `git reset --hard` atau `git push --force`. Gunakan `git revert`:

### Langkah Revert Aman:
1. Periksa histori commit terakhir:
   ```cmd
   git log --oneline -n 5
   ```
2. Buat commit pembatalan (*inverse commit*) untuk commit yang bermasalah:
   ```cmd
   git revert <COMMIT_HASH>
   ```
3. Simpan pesan revert yang muncul pada editor.
4. Push commit pembatalan ke GitHub:
   ```cmd
   git push origin main
   ```
Metode ini menjaga integritas audit log dan tidak merusak histori rekan tim lain.

---

## 8. RINGKASAN ATURAN KEAMANAN GITHUB PT PSU

1. **Repository Wajib Private:** Jangan mengubah visibilitas repository menjadi Public.
2. **Zero Secrets in Git:** Kredensial `.env`, private keys (`.pem`, `.key`), dan database dump backup dilarang masuk Git.
3. **Internal Audit Isolation:** Laporan audit keamanan internal (`SECURITY_*.md`), file reconcilation, dan pengujian internal tetap tersimpan di mesin lokal dan tidak diunggah ke GitHub.
4. **Schema Migrations Allowed:** File DDL schema resmi (`backend/database/psu_sertifikat.sql`) tetap dikelola di Git tanpa memuat data akun produksi.

