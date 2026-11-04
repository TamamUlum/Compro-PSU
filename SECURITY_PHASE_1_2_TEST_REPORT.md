# LAPORAN PENGUJIAN KEAMANAN PHASE 1.2
## HASIL UJI VERIFIKASI KEAMANAN TRUSTED PROXY & RATE LIMITING
### PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pengujian:** 4 November 2026
- **Test Suite:** `backend/tests/verify_phase1_2.js`
- **Tipe Pengujian:** Independent In-Memory Automated Security Test Suite
- **Hasil Akhir:** 12 / 12 PASS (Tingkat Keberhasilan 100%)

---

## 1. LOG EKSEKUSI PENGUJIAN AKTUAL

```text
====================================================================
PT PENILAI STANDAR UJI (PSU) - PHASE 1.2 TRUSTED PROXY VERIFICATION
====================================================================

--- TEST GROUP 1: Direct Connection Topology (TRUST_PROXY=false) ---
[PASS] SEC-004-TP-01: Direct connection ignores spoofed X-Forwarded-For
       Detail: Expected socket 203.0.113.195, got 203.0.113.195. req.ips length: 0
[PASS] SEC-004-TP-02: Direct connection ignores spoofed CF-Connecting-IP header
       Detail: Attacker sent CF-Connecting-IP=1.1.1.1. Server extracted real socket: 203.0.113.195

--- TEST GROUP 2: Local Reverse Proxy Topology (TRUST_PROXY=loopback) ---
[PASS] SEC-004-TP-03: Loopback proxy extracts genuine client IP forwarded from 127.0.0.1
       Detail: Client IP: 198.51.100.88, req.ips: ["198.51.100.88"]
[PASS] SEC-004-TP-04: Untrusted remote socket connecting directly to loopback-configured server is rejected
       Detail: Expected socket 203.0.113.50, got 203.0.113.50. req.ips length: 0

--- TEST GROUP 3: Cloudflare CDN Topology (TRUST_PROXY=cloudflare) ---
[PASS] SEC-004-TP-05: Cloudflare topology trusts Cloudflare edge IP and extracts CF-Connecting-IP
       Detail: Edge IP 173.245.48.55 -> extracted client IP: 103.200.5.21
[PASS] SEC-004-TP-06: Untrusted client pretending to be Cloudflare cannot spoof CF-Connecting-IP
       Detail: Attacker socket 198.51.100.99 correctly pinned as client IP. Spoofed 1.1.1.1 ignored.

--- TEST GROUP 4: Custom CIDR and Configuration Safety ---
[PASS] SEC-004-TP-07: Custom CIDR subnet correctly discriminates trusted vs untrusted sockets
       Detail: 10.1.2.3 trusted -> 203.0.113.7; 172.16.5.5 untrusted -> 172.16.5.5
[PASS] SEC-004-TP-08: Fixed hop count triggers explicit security advisory warning
       Detail: Advisory warning captured when TRUST_PROXY is set to numeric value ('1')
[PASS] SEC-004-TP-09: IPv6-mapped IPv4 socket address normalized cleanly
       Detail: ::ffff:203.0.113.44 normalized to 203.0.113.44

--- TEST GROUP 5: Rate Limiting Attack Simulation & Integrity ---
[PASS] SEC-004-TP-10: Password Spraying with rotated X-Forwarded-For blocked by Tier 2 IP limit
       Detail: Attempts allowed: 20, blocked with 429: 5 (Limit: 20)
[PASS] SEC-004-TP-11: Targeted Brute-Force against single account blocked by Tier 1 Account limit
       Detail: Attempts allowed before block: 5, blocked with 429: 3 (Limit: 5)
[PASS] SEC-004-TP-12: Legitimate IP traffic is isolated and unaffected by attacker rate limit lockout
       Detail: Legitimate IP 203.0.113.222 received status 401 (expected 401 invalid creds, not 429 lockout)

====================================================================
PHASE 1.2 TRUSTED PROXY SECURITY VERIFICATION SUMMARY
====================================================================
Total Verification Tests : 12
Passed                   : 12
Failed                   : 0

[VERIFICATION SUCCESS] All 12 trusted proxy & IP defense tests passed cleanly.
```

---

## 2. DETAIL TEKNIS SETIAP PENGUJIAN

### Kelompok Uji 1: Topologi Koneksi Langsung (`TRUST_PROXY=false`)
- **Tujuan:** Memastikan backend yang terpapar langsung ke jaringan tidak mempercayai header perutean dari klien.
- **Kasus Uji SEC-004-TP-01:**
  - *Soket Fisik:* `203.0.113.195`
  - *Header Dikirim:* `X-Forwarded-For: 198.51.100.2, 10.0.0.1`
  - *Hasil:* Header diabaikan. `req.ips` berukuran 0. Nilai `getClientIp(req)` mengembalikan `203.0.113.195`.
- **Kasus Uji SEC-004-TP-02:**
  - *Soket Fisik:* `203.0.113.195`
  - *Header Dikirim:* `CF-Connecting-IP: 1.1.1.1`
  - *Hasil:* Header `CF-Connecting-IP` diabaikan karena soket bukan proxy tepercaya. IP tetap `203.0.113.195`.

### Kelompok Uji 2: Topologi Local Reverse Proxy (`TRUST_PROXY=loopback`)
- **Tujuan:** Memvalidasi deployment Apache/cPanel Phusion Passenger/Nginx pada host yang sama (`127.0.0.1`).
- **Kasus Uji SEC-004-TP-03:**
  - *Soket Fisik:* `127.0.0.1` (Reverse Proxy Lokal)
  - *Header Dikirim:* `X-Forwarded-For: 198.51.100.88`
  - *Hasil:* Soket loopback dipercaya, `req.ips` memuat `["198.51.100.88"]`, dan `getClientIp(req)` mengembalikan `198.51.100.88`.
- **Kasus Uji SEC-004-TP-04:**
  - *Soket Fisik:* `203.0.113.50` (Koneksi Langsung Eksternal ke Port Backend)
  - *Header Dikirim:* `X-Forwarded-For: 8.8.8.8`
  - *Hasil:* Karena soket `203.0.113.50` bukan loopback, Express menolak mempercayai header tersebut. IP terdeteksi adalah `203.0.113.50`. Upaya pemalsuan identitas gagal total.

### Kelompok Uji 3: Topologi CDN Cloudflare (`TRUST_PROXY=cloudflare`)
- **Tujuan:** Memvalidasi integrasi Cloudflare CDN dan verifikasi subnet resmi.
- **Kasus Uji SEC-004-TP-05:**
  - *Soket Fisik:* `173.245.48.55` (Subnet resmi Cloudflare: `173.245.48.0/20`)
  - *Header Dikirim:* `CF-Connecting-IP: 103.200.5.21`, `X-Forwarded-For: 103.200.5.21, 173.245.48.55`
  - *Hasil:* Soket diverifikasi valid sebagai edge Cloudflare. Nilai `CF-Connecting-IP` diekstrak dengan aman: `103.200.5.21`.
- **Kasus Uji SEC-004-TP-06:**
  - *Soket Fisik:* `198.51.100.99` (IP luar non-Cloudflare)
  - *Header Dikirim:* `CF-Connecting-IP: 1.1.1.1`
  - *Hasil:* Soket bukan anggota subnet Cloudflare. `req.ips` kosong, header `CF-Connecting-IP` palsu diabaikan. Server mendeteksi penyerang pada `198.51.100.99`.

### Kelompok Uji 4: Subnet Kustom & Keamanan Konfigurasi
- **Kasus Uji SEC-004-TP-07:**
  - Subnet kustom: `10.0.0.0/8, 192.168.1.0/24`.
  - Soket `10.1.2.3` (di dalam subnet): Dipercaya, mengekstrak header klien `203.0.113.7`.
  - Soket `172.16.5.5` (di luar subnet): Ditolak, mengembalikan IP soket fisik `172.16.5.5`.
- **Kasus Uji SEC-004-TP-08:**
  - Konfigurasi `TRUST_PROXY=1` (fixed hop count).
  - Sistem mengeluarkan peringatan keamanan eksplisit: `[SECURITY ADVISORY] TRUST_PROXY menggunakan jumlah hop tetap...`.
- **Kasus Uji SEC-004-TP-09:**
  - Soket IPv6-mapped IPv4: `::ffff:203.0.113.44`.
  - Dinormalisasi secara bersih menjadi format standar `203.0.113.44`.

### Kelompok Uji 5: Simulasi Serangan Rate Limiter & Integritas Pertahanan
- **Kasus Uji SEC-004-TP-10 (Password Spraying Mitigation):**
  - *Skenario:* Penyerang dari satu soket (`198.51.100.77`) mencoba membobol 25 akun berbeda (`victim_1`, `victim_2`, ..., `victim_25`) dengan merotasi header `X-Forwarded-For` pada setiap permintaan (`1.2.3.1`, `1.2.3.2`, dst).
  - *Hasil Pertahanan:* Karena server mengekstrak IP soket asli `198.51.100.77`, rotasi header spoofing tidak berpengaruh. Sebanyak 20 percobaan pertama ditolak dengan HTTP 401 (batas `AUTH_FAIL_LIMIT_IP = 20`), dan seluruh percobaan berikutnya (21 s/d 25) langsung diblokir dengan **HTTP 429 Too Many Requests**. Serangan password spraying berhasil ditumpas.
- **Kasus Uji SEC-004-TP-11 (Targeted Brute-Force Mitigation):**
  - *Skenario:* Penyerang dari IP `198.51.100.88` melakukan targeted brute-force terhadap satu akun (`admin_target@psu.co.id`).
  - *Hasil Pertahanan:* 5 percobaan pertama gagal dengan HTTP 401. Percobaan ke-6, 7, dan 8 langsung diblokir oleh Tier 1 (Account Limiter) dengan **HTTP 429 Too Many Requests**.
- **Kasus Uji SEC-004-TP-12 (Isolasi Trafik Klien Sah):**
  - *Skenario:* Klien sah pada IP `203.0.113.222` melakukan login saat penyerang sedang diblokir rate limiter.
  - *Hasil Pertahanan:* Klien sah menerima respon normal (HTTP 401 kredensial salah, bukan HTTP 429 lockout). Tidak terjadi *Collateral Denial-of-Service* terhadap pengguna lain.

---

## 3. HASIL REGRESI KESELURUHAN (CUMULATIVE TEST SUITE)

| Test Suite | Deskripsi | Jumlah Uji | Lolos (PASS) | Gagal (FAIL) | Status |
|---|---|:---:|:---:|:---:|:---:|
| `backend/tests/verify_phase1.js` | Baseline Phase 1 (SEC-001, SEC-002, SEC-003, SEC-004) | 21 | 21 | 0 | **100% PASS** |
| `backend/tests/verify_phase1_1.js` | Phase 1.1 (Sharp Image Decompression & Two-Tier Limiter) | 21 | 21 | 0 | **100% PASS** |
| `backend/tests/verify_phase1_2.js` | Phase 1.2 (Trusted Proxy Hardening Across Topologies) | 12 | 12 | 0 | **100% PASS** |
| **TOTAL** | **Pengujian Keamanan Komprehensif** | **54** | **54** | **0** | **100% ZERO REGRESSION** |

---

## 4. KESIMPULAN

Seluruh verifikasi keamanan Phase 1.2 telah terpenuhi secara memuaskan dengan bukti empiris 100% PASS pada seluruh pengujian otomatis tanpa adanya regresi fungsionalitas aplikasi.

