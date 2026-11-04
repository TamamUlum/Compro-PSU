-- ============================================================================
-- DATABASE SCHEMA & SEED DATA: PT PENILAI STANDAR UJI (PSU)
-- Mencakup:
-- 1. Tabel Sertifikat (Produk, Pengujian, Kalibrasi, Sistem Manajemen)
-- 2. Tabel Admin Users (`admin_users`) untuk Login JWT Dashboard Artikel
-- 3. Tabel Artikel (`artikel`) dengan dukungan Status, Views, & Unggulan
-- 4. Tabel Galeri Foto Artikel (`galeri_artikel`) untuk Media Library & Reuse Foto
-- 5. Tabel Penulis Artikel (`penulis_artikel`)
-- 6. Tabel Log Aktivitas Admin (`log_aktivitas_artikel`)
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `psu_company_profile`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `psu_company_profile`;

-- ----------------------------------------------------------------------------
-- 1. TABEL SERTIFIKAT PELANGGAN
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sertifikat_produk` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_pabrik` VARCHAR(255) NOT NULL,
  `produk` VARCHAR(255) NOT NULL,
  `no_sni` VARCHAR(100) NOT NULL,
  `no_sertifikat` VARCHAR(100) NOT NULL UNIQUE,
  `terbit` VARCHAR(50) NOT NULL,
  `berlaku_sd` VARCHAR(50) NOT NULL,
  `status` ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sertifikat_pengujian` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_pabrik` VARCHAR(255) NOT NULL,
  `produk` VARCHAR(255) NOT NULL,
  `no_sni` VARCHAR(100) NOT NULL,
  `no_sertifikat` VARCHAR(100) NOT NULL UNIQUE,
  `terbit` VARCHAR(50) NOT NULL,
  `berlaku_sd` VARCHAR(50) NOT NULL,
  `status` ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sertifikat_kalibrasi` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_pabrik` VARCHAR(255) NOT NULL,
  `produk` VARCHAR(255) NOT NULL,
  `no_sni` VARCHAR(100) NOT NULL,
  `no_sertifikat` VARCHAR(100) NOT NULL UNIQUE,
  `terbit` VARCHAR(50) NOT NULL,
  `berlaku_sd` VARCHAR(50) NOT NULL,
  `status` ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sertifikat_sistem_manajemen` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `nama_pabrik` VARCHAR(255) NOT NULL,
  `produk` VARCHAR(255) NOT NULL,
  `no_sni` VARCHAR(100) NOT NULL,
  `no_sertifikat` VARCHAR(100) NOT NULL UNIQUE,
  `terbit` VARCHAR(50) NOT NULL,
  `berlaku_sd` VARCHAR(50) NOT NULL,
  `status` ENUM('Aktif', 'Ditangguhkan', 'Dicabut') NOT NULL DEFAULT 'Aktif'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 2. TABEL ADMIN USERS (UNTUK LOGIN DASHBOARD ARTIKEL & JWT SESSION)
-- Catatan: Saat server.js dijalankan, akun default di-seed otomatis:
--   Username: admin   | Password: AdminPSU2026!
--   Username: redaksi | Password: RedaksiPSU2026!
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(150) NOT NULL,
  `role` ENUM('Super Admin', 'Editor', 'Author') NOT NULL DEFAULT 'Super Admin',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `last_login` DATETIME NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 3. TABEL ARTIKEL (DENGAN KOLOM VIEWS, IS_FEATURED, TIMESTAMPS)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `artikel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `slug` VARCHAR(255) NOT NULL UNIQUE,
  `title_id` VARCHAR(255) NOT NULL,
  `title_en` VARCHAR(255) NOT NULL,
  `excerpt_id` TEXT NOT NULL,
  `excerpt_en` TEXT NOT NULL,
  `content_id` LONGTEXT NOT NULL,
  `content_en` LONGTEXT NOT NULL,
  `image_url` LONGTEXT NOT NULL,
  `author` VARCHAR(150) NOT NULL DEFAULT 'Corporate Secretary PSU',
  `category` ENUM('News', 'Article', 'Press Release') NOT NULL DEFAULT 'News',
  `tags` JSON NOT NULL,
  `published_at` DATE NOT NULL,
  `status` ENUM('Published', 'Draft') NOT NULL DEFAULT 'Published',
  `is_featured` TINYINT(1) NOT NULL DEFAULT 0,
  `views` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 4. TABEL GALERI FOTO ARTIKEL (MEDIA LIBRARY UNTUK DIGUNAKAN KEMBALI)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `galeri_artikel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `filename` VARCHAR(255) NOT NULL,
  `image_url` VARCHAR(500) NOT NULL UNIQUE,
  `category` VARCHAR(100) NOT NULL DEFAULT 'Artikel Upload',
  `alt_text` VARCHAR(255) NOT NULL DEFAULT '',
  `file_size` INT NOT NULL DEFAULT 0,
  `mime_type` VARCHAR(100) NOT NULL DEFAULT 'image/webp',
  `uploaded_by` VARCHAR(150) NOT NULL DEFAULT 'Admin PSU',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 5. TABEL PENULIS ARTIKEL (DAFTAR PENULIS / DIVISI RESMI)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `penulis_artikel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL UNIQUE,
  `role_title` VARCHAR(150) NOT NULL DEFAULT 'Tim Redaksi PSU',
  `division` VARCHAR(150) NOT NULL DEFAULT 'Corporate Communication',
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- 6. TABEL LOG AKTIVITAS ADMIN ARTIKEL
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `log_aktivitas_artikel` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `admin_username` VARCHAR(100) NOT NULL,
  `action_type` VARCHAR(50) NOT NULL,
  `target_title` VARCHAR(255) NOT NULL DEFAULT '',
  `details` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- SEED DATA AWAL PENULIS & GALERI
-- ----------------------------------------------------------------------------
INSERT IGNORE INTO `penulis_artikel` (`name`, `role_title`, `division`, `is_active`) VALUES
('Corporate Secretary PSU', 'Sekretaris Perusahaan', 'Corporate Secretary', 1),
('Tim Redaksi & Humas PSU', 'Editor Utama', 'Humas & Komunikasi Korporat', 1),
('Divisi Sertifikasi Produk (LSPro)', 'Tim Teknis LSPro', 'Lembaga Sertifikasi Produk', 1),
('Divisi Laboratorium Pengujian & Kalibrasi', 'Spesialis Laboratorium', 'Laboratorium Pengujian & Kalibrasi', 1),
('Divisi LSSM PSU', 'Auditor Sistem Manajemen', 'Sertifikasi Sistem Manajemen', 1),
('Divisi Pelatihan PSU', 'Koordinator Pelatihan', 'Lembaga Pelatihan', 1),
('Arief Prihardono Darmawan', 'Direktur / Manajemen', 'Direksi PSU', 1),
('Amanda Putri', 'Corporate Communication Officer', 'Humas & Kemitraan', 1),
('Winda Arliny', 'Quality Assurance Specialist', 'Penjaminan Mutu', 1);

INSERT IGNORE INTO `galeri_artikel` (`title`, `filename`, `image_url`, `category`, `alt_text`, `mime_type`, `uploaded_by`) VALUES
('Banner Kantor PSU 1', 'Logo_PSU_banner1.webp', '/Logo_PSU_banner1.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 1', 'image/webp', 'System PSU'),
('Banner Kantor PSU 2', 'Logo_PSU_banner2.webp', '/Logo_PSU_banner2.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 2', 'image/webp', 'System PSU'),
('Banner Kantor PSU 3', 'Logo_PSU_banner3.webp', '/Logo_PSU_banner3.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 3', 'image/webp', 'System PSU'),
('Banner Kantor PSU 4', 'Logo_PSU_banner4.webp', '/Logo_PSU_banner4.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 4', 'image/webp', 'System PSU'),
('Banner Kantor PSU 5', 'Logo_PSU_banner5.webp', '/Logo_PSU_banner5.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 5', 'image/webp', 'System PSU'),
('Banner Kantor PSU 6', 'Logo_PSU_banner6.webp', '/Logo_PSU_banner6.webp', 'Banner Default', 'Banner Utama PT Penilai Standar Uji 6', 'image/webp', 'System PSU'),
('Layanan Sertifikasi Produk (LSPro)', 'LSPro.webp', '/LSPro.webp', 'Layanan PSU', 'Layanan Sertifikasi Produk LSPro PSU', 'image/webp', 'System PSU'),
('Laboratorium Pengujian PSU', 'lab_pengujian.webp', '/lab_pengujian.webp', 'Layanan PSU', 'Fasilitas Laboratorium Pengujian PSU', 'image/webp', 'System PSU'),
('Laboratorium Kalibrasi PSU', 'lab_kalibrasi.webp', '/lab_kalibrasi.webp', 'Layanan PSU', 'Fasilitas Laboratorium Kalibrasi PSU', 'image/webp', 'System PSU'),
('Lembaga Pelatihan PSU', '_pelatihan.webp', '/_pelatihan.webp', 'Layanan PSU', 'Kegiatan Pelatihan Terpadu PSU', 'image/webp', 'System PSU'),
('Sistem Manajemen Mutu (LSSM)', 'sistem_manajemen_mutu.webp', '/sistem_manajemen_mutu.webp', 'Layanan PSU', 'Sertifikasi Sistem Manajemen Mutu ISO', 'image/webp', 'System PSU'),
('Tim Visi & Misi PSU', 'vision-mission-team.webp', '/vision-mission-team.webp', 'Dokumentasi Korporat', 'Transformasi Identitas PT Penilai Standar Uji', 'image/webp', 'System PSU');
