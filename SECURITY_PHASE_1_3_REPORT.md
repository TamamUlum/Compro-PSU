# LAPORAN KEAMANAN IMPLEMENTASI PHASE 1.3
## STRICT TRUSTED PROXY PRODUCTION HARDENING & ORIGIN PROTECTION (SEC-004)
### PT PENILAI STANDAR UJI (PSU) — COMPANY PROFILE & CERTIFICATE TRACKING SYSTEM

- **Tanggal Pelaksanaan:** 4 November 2026
- **Status Evaluasi:** SELESAI (100% RIGOROUSLY TESTED & HARDENED)
- **Baseline Git Checkpoint:** `66ebb16` (Pre-Phase 1.3 Checkpoint)
- **Komponen Terdampak:** `backend/server.js`, `.env.example`, `backend/tests/verify_phase1_3.js`, `backend/tests/verify_phase1_2.js`
- **Klasifikasi Temuan:** SEC-004 (CWE-345 / CWE-290 / CWE-307) — Seluruh Residual Risk Ditutup

---

## 1. RINGKASAN EKSEKUTIF

Berdasarkan hasil evaluasi Phase 1.2, ditemukan sejumlah *residual security risks* pada konfigurasi `trust proxy` dan penentuan IP klien Express. Meskipun mitigasi dasar telah diterapkan, lingkungan produksi membutuhkan validasi yang jauh lebih ketat (*fail-closed*), penolakan tegas terhadap konfigurasi yang berisiko, serta kepastian proteksi origin server saat aplikasi berada di balik CDN Cloudflare dan server web Apache/cPanel Phusion Passenger.

Pada **Phase 1.3**, telah dilakukan hardening menyeluruh:
1. **Strict Trust Proxy Validation:** Konfigurasi `TRUST_PROXY=true` dan hop count numerik (`1`, `2`, dst.) **ditolak keras** saat server startup dengan kesalahan fatal (*fail-closed*).
2. **Validasi Sintaksis IP/CIDR Eksplisit:** Hanya menerima alamat IPv4/IPv6 valid atau format CIDR resmi (`ip/mask`). Nilai yang tidak valid atau ambigu langsung mematikan proses startup.
3. **Isolasi Ekstraksi `CF-Connecting-IP`:** Header `CF-Connecting-IP` **hanya dipercaya** jika aplikasi secara eksplisit dikonfigurasi dalam mode Cloudflare (`trust cloudflare === true`) DAN soket fisik terverifikasi berasal dari IP resmi Cloudflare.
4. **Audit Topologi Cloudflare + Apache & Origin Protection:** Mengidentifikasi celah *Direct-to-Origin Bypass* dan mendokumentasikan arsitektur proteksi 3 lapis (Firewall iptables, Cloudflare Authenticated Origin Pulls, dan Cloudflare Tunnel).
5. **Audit Jaringan Privat (`TRUST_PROXY=private`):** Mendokumentasikan risiko multi-tenancy pada shared VPC/Docker cluster dan menetapkan panduan penggunaan ingress proxy IP/CIDR spesifik.
6. **Verifikasi Kanonikal 22 CIDR Cloudflare:** Memvalidasi seluruh 15 blok IPv4 dan 7 blok IPv6 resmi dari Cloudflare beserta SOP pembaruan manual berkala.

---

## 2. DETAIL AUDIT & HARDENING SUMBER KODE

### A. TASK 1 — Strict Trust Proxy Validation (`configureTrustProxy`)

Fungsi `configureTrustProxy` pada [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js) dimodifikasi dengan logika *fail-closed* tanpa fallback permisif:

```javascript
// Validasi format IPv4/IPv6 tunggal atau notasi CIDR (ip/mask)
function isValidIpOrCidr(str) {
  if (typeof str !== "string") return false;
  const trimmed = str.trim();
  if (!trimmed) return false;

  const ipType = net.isIP(trimmed);
  if (ipType === 4 || ipType === 6) return true;

  const parts = trimmed.split("/");
  if (parts.length === 2) {
    const baseIp = parts[0].trim();
    const prefixStr = parts[1].trim();
    const baseType = net.isIP(baseIp);

    if (/^\d+$/.test(prefixStr)) {
      const prefix = Number(prefixStr);
      if (baseType === 4 && prefix >= 0 && prefix <= 32) return true;
      if (baseType === 6 && prefix >= 0 && prefix <= 128) return true;
    }
  }

  return false;
}

function configureTrustProxy(expressApp) {
  const envVal = (process.env.TRUST_PROXY || "false").trim();
  const lowerVal = envVal.toLowerCase();

  // 1. Tolak keras 'true'
  if (lowerVal === "true") {
    throw new Error(
      "[FATAL SECURITY CONFIGURATION ERROR] TRUST_PROXY='true' is strictly prohibited. It permits universal forwarded-header spoofing. Specify 'false', 'loopback', 'cloudflare', 'private', or explicit trusted IP/CIDR."
    );
  }

  // 2. Tolak keras numeric hop count
  if (!isNaN(Number(envVal))) {
    throw new Error(
      `[FATAL SECURITY CONFIGURATION ERROR] Numeric hop count configuration in TRUST_PROXY ('${envVal}') is strictly prohibited. It permits direct-connection bypass. Specify 'loopback', 'cloudflare', or explicit IP/CIDR.`
    );
  }

  // 3. Mode koneksi langsung yang aman
  if (lowerVal === "false" || lowerVal === "none" || lowerVal === "off") {
    expressApp.set("trust proxy", false);
    expressApp.set("trust cloudflare", false);
    return;
  }

  // 4. Mode local reverse proxy (cPanel Passenger / Apache lokal)
  if (lowerVal === "loopback") {
    expressApp.set("trust proxy", "loopback");
    expressApp.set("trust cloudflare", false);
    return;
  }

  // 5. Mode jaringan privat (dengan peringatan multi-tenant)
  if (lowerVal === "private") {
    console.warn(
      "[SECURITY NOTICE] TRUST_PROXY='private' trusts all RFC1918 private subnets. Ensure your internal network/VPC does not host untrusted workloads or sibling containers."
    );
    expressApp.set("trust proxy", ["loopback", "linklocal", "uniquelocal"]);
    expressApp.set("trust cloudflare", false);
    return;
  }

  // 6. Mode Cloudflare CDN resmi
  if (lowerVal === "cloudflare") {
    expressApp.set("trust proxy", ["loopback", ...CLOUDFLARE_PROXY_CIDRS]);
    expressApp.set("trust cloudflare", true);
    return;
  }

  // 7. Daftar IP/CIDR eksplisit
  const ipList = envVal.split(",").map((s) => s.trim()).filter(Boolean);
  if (ipList.length === 0) {
    throw new Error("[FATAL SECURITY CONFIGURATION ERROR] Empty TRUST_PROXY configuration provided.");
  }

  const finalProxies = [];
  let hasCloudflare = false;

  for (const item of ipList) {
    const itemLower = item.toLowerCase();
    if (itemLower === "cloudflare") {
      finalProxies.push(...CLOUDFLARE_PROXY_CIDRS);
      hasCloudflare = true;
    } else if (itemLower === "loopback") {
      finalProxies.push("loopback");
    } else if (isValidIpOrCidr(item)) {
      finalProxies.push(item);
    } else {
      throw new Error(
        `[FATAL SECURITY CONFIGURATION ERROR] Invalid or malformed entry in TRUST_PROXY: '${item}'. Must be a valid IPv4/IPv6 address, CIDR notation (e.g. 10.0.0.0/8), or supported keyword ('loopback', 'cloudflare').`
      );
    }
  }

  expressApp.set("trust proxy", finalProxies);
  expressApp.set("trust cloudflare", hasCloudflare);
}
```

### B. Isolasi Header `CF-Connecting-IP`

Diperbaiki pada `getClientIp(req)`:
- Header `CF-Connecting-IP` **tidak lagi diproses** hanya karena `req.ips.length > 0` (misal saat berjalan di balik Apache `loopback`).
- Hanya jika aplikasi disetel dengan bendera `trust cloudflare === true` DAN koneksi berasal dari subnet resmi Cloudflare, barulah `CF-Connecting-IP` diekstrak.
- Dalam mode `loopback`, server secara ketat hanya menggunakan IP dari `X-Forwarded-For` yang dihasilkan Apache lokal, mengabaikan header `CF-Connecting-IP` yang disuntikkan penyerang.

---

## 3. AUDIT TOPOLOGI PRODUKSI & PANDUAN DEPLOYMENT (TASK 2, 3, 4)

### A. TASK 2 — Cloudflare Origin Protection Architecture

Berdasarkan inspeksi [`htaccess-production.txt`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/htaccess-production.txt), aplikasi dirancang untuk berjalan di cPanel dengan Apache dan Phusion Passenger. 

> [!WARNING]
> **Risiko Direct-to-Origin Bypass:**
> Jika domain `penilaistandaruji.com` diproxy melalui Cloudflare, namun alamat IP publik server origin cPanel terbuka ke internet, penyerang dapat menghubungkan HTTP request langsung ke `http://<IP_ORIGIN>/api/auth/login`. Penyerang dapat membypass WAF Cloudflare, DDoS protection Cloudflare, dan menyuntikkan header perutean langsung ke Apache.

Untuk mengamankan origin di tingkat infrastruktur produksi, wajib menerapkan salah satu atau kombinasi dari 3 mekanisme berikut:

#### Rekomendasi 1 (Terbaik): Cloudflare Tunnel (`cloudflared`)
- Pasang daemon `cloudflared` di server Linux/cPanel.
- Konfigurasikan tunnel keluar (*outbound-only tunnel* ke edge Cloudflare).
- **Tutup seluruh port masuk (port 80 dan 443) pada firewall server origin**. Tidak ada IP origin publik yang dapat dipindai atau diakses penyerang.

#### Rekomendasi 2: Cloudflare Authenticated Origin Pulls (AOP)
- Aktifkan Authenticated Origin Pulls di dashboard Cloudflare (SSL/TLS -> Origin Server).
- Unduh sertifikat CA resmi Cloudflare (`origin-pull-ca.pem`).
- Konfigurasikan virtual host Apache / cPanel:
  ```apache
  SSLVerifyClient require
  SSLVerifyDepth 1
  SSLCACertificateFile /etc/ssl/certs/cloudflare-origin-pull-ca.pem
  ```
- Setiap koneksi HTTPS langsung yang tidak memiliki sertifikat klien Cloudflare akan ditolak saat TLS handshake.

#### Rekomendasi 3: Firewall IP Whitelisting (iptables / UFW / CSF)
Jika AOP atau Tunnel belum aktif, batasi akses port 80 dan 443 di firewall server origin hanya untuk rentang IP resmi Cloudflare:
```bash
# Contoh script iptables untuk mengunci port HTTP/HTTPS ke Cloudflare saja:
for ip in $(curl -s https://www.cloudflare.com/ips-v4); do
  iptables -A INPUT -p tcp -m multiport --dports 80,443 -s $ip -j ACCEPT
done
for ip in $(curl -s https://www.cloudflare.com/ips-v6); do
  ip6tables -A INPUT -p tcp -m multiport --dports 80,443 -s $ip -j ACCEPT
done
# Blokir seluruh trafik lain ke port 80 dan 443
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j DROP
ip6tables -A INPUT -p tcp -m multiport --dports 80,443 -j DROP
```

#### Konfigurasi Apache mod_remoteip untuk cPanel
Pada `httpd.conf` atau konfigurasi include Apache cPanel:
```apache
<IfModule mod_remoteip.c>
  RemoteIPHeader CF-Connecting-IP
  RemoteIPTrustedProxy 127.0.0.1
  RemoteIPTrustedProxy ::1
  # Masukkan seluruh 15 IPv4 CIDR dan 7 IPv6 CIDR Cloudflare
  RemoteIPTrustedProxy 173.245.48.0/20
  RemoteIPTrustedProxy 103.21.244.0/22
  RemoteIPTrustedProxy 103.22.200.0/22
  RemoteIPTrustedProxy 103.31.4.0/22
  RemoteIPTrustedProxy 141.101.64.0/18
  RemoteIPTrustedProxy 108.162.192.0/18
  RemoteIPTrustedProxy 190.93.240.0/20
  RemoteIPTrustedProxy 188.114.96.0/20
  RemoteIPTrustedProxy 197.234.240.0/22
  RemoteIPTrustedProxy 198.41.128.0/17
  RemoteIPTrustedProxy 162.158.0.0/15
  RemoteIPTrustedProxy 104.16.0.0/13
  RemoteIPTrustedProxy 104.24.0.0/14
  RemoteIPTrustedProxy 172.64.0.0/13
  RemoteIPTrustedProxy 131.0.72.0/22
  RemoteIPTrustedProxy 2400:cb00::/32
  RemoteIPTrustedProxy 2606:4700::/32
  RemoteIPTrustedProxy 2803:f800::/32
  RemoteIPTrustedProxy 2405:b500::/32
  RemoteIPTrustedProxy 2405:8100::/32
  RemoteIPTrustedProxy 2a06:98c0::/29
  RemoteIPTrustedProxy 2c0f:f248::/32
</IfModule>
```

---

### B. TASK 3 — Audit Jaringan Privat (`TRUST_PROXY=private`)

Konfigurasi `TRUST_PROXY=private` menggunakan kata kunci Express/proxy-addr:
- `linklocal`: `169.254.0.0/16`, `fe80::/10`
- `uniquelocal`: `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `fc00::/7`

**Analisis Risiko Multi-Tenant:**
1. Pada lingkungan cloud publik (misal: AWS VPC, Google Cloud VPC, DigitalOcean VPC) atau kluster Kubernetes bersama, alamat IP `10.x.x.x` atau `172.16.x.x` digunakan bersama oleh banyak beban kerja (*workloads*).
2. Jika sebuah container, pod, atau instans database/microservice lain dalam VPC yang sama disusupi penyerang (*compromised workload*), penyerang tersebut dapat menghubungi backend Express dan menyuntikkan header `X-Forwarded-For: <target-ip>` sembarangan.
3. Karena server mempercayai seluruh subnet RFC 1918, Express akan menganggap IP palsu tersebut sebagai IP klien asli, membypass rate limiter atau mengelabui pencatatan audit.

**Panduan & Rekomendasi:**
- Jangan menyetel `TRUST_PROXY=private` pada VPC atau kluster bersama.
- Tetapkan IP atau subnet spesifik dari reverse proxy ingress/load balancer internal (misal: `TRUST_PROXY=10.0.1.5` atau `TRUST_PROXY=172.20.0.2`).
- Sistem kini mencetak pesan peringatan keamanan eksplisit pada console log setiap kali mode `private` diaktifkan.

---

### C. TASK 4 — Validasi Kanonikal CIDR Cloudflare & SOP Pembaruan

Daftar CIDR resmi pada [`backend/server.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/server.js) telah diverifikasi terhadap sumber kanonikal Cloudflare:
- **IPv4 Source:** `https://www.cloudflare.com/ips-v4` (15 subnet)
- **IPv6 Source:** `https://www.cloudflare.com/ips-v6` (7 subnet)
- **Tanggal Validasi:** 4 November 2026.
- **Total:** 22 subnet kanonikal lengkap tanpa ada yang kurang atau salah.

**SOP Prosedur Pembaruan Terkontrol:**
1. **Dilarang melakukan pembaruan otomatis (auto-fetch) saat runtime server:**
   Mengunduh daftar IP dari internet saat startup server membuka celah SSRF, DNS poisoning, ketergantungan jaringan eksternal, dan potensi *Denial of Service* (server gagal nyala jika internet down).
2. **Prosedur Pembaruan Manual Terjadwal:**
   - Jadwalkan review manual setiap 6 bulan atau saat menerima buletin perubahan IP dari Cloudflare.
   - Ambil daftar terbaru via HTTPS terautentikasi dan bandingkan *diff* dengan konstanta `CLOUDFLARE_PROXY_CIDRS` di `backend/server.js`.
   - Jalankan suite pengujian `node backend/tests/verify_phase1_3.js` untuk memastikan semua subnet lolos validasi `isValidIpOrCidr`.
   - Lakukan commit dan deploy melalui pipeline pengujian standar.

---

## 4. HASIL PENGUJIAN KEAMANAN PHASE 1.3

Pengujian Phase 1.3 dipisahkan secara tegas ke dalam 3 kategori pengujian pada [`backend/tests/verify_phase1_3.js`](file:///e:/PSU%20siap%20Upload/compro-PSU-main/backend/tests/verify_phase1_3.js):

| Kategori | ID Uji | Deskripsi Skenario Pengujian | Hasil |
|---|---|---|:---:|
| **UNIT** | `UNIT-01` | Validasi format IPv4 standar (`127.0.0.1`, `192.168.1.1`, dll.) | **PASS** |
| **UNIT** | `UNIT-02` | Validasi format IPv6 standar (`::1`, `2400:cb00::1`, dll.) | **PASS** |
| **UNIT** | `UNIT-03` | Validasi notasi CIDR IPv4 (prefix 0 s/d 32) | **PASS** |
| **UNIT** | `UNIT-04` | Validasi notasi CIDR IPv6 (prefix 0 s/d 128) | **PASS** |
| **UNIT** | `UNIT-05` | Penolakan string IP malformed (`999.999.999.999`, `not_an_ip`, dll.) | **PASS** |
| **UNIT** | `UNIT-06` | Penolakan CIDR mask di luar batas (`10.0.0.0/33`, `2400::/129`, dll.) | **PASS** |
| **UNIT** | `UNIT-07` | **Penolakan fatal `TRUST_PROXY='true'` (throw fail-closed error)** | **PASS** |
| **UNIT** | `UNIT-08` | **Penolakan fatal numeric hop count (`'1'`, `'2'`, `'5'`)** | **PASS** |
| **UNIT** | `UNIT-09` | **Penolakan fatal entry tidak valid dalam daftar IP/CIDR kustom** | **PASS** |
| **UNIT** | `UNIT-10` | Konfigurasi tepat untuk mode bernama: `false`, `loopback`, `cloudflare`, `private` | **PASS** |
| **INTEGRATION** | `INT-01` | Direct connection (`false`): mengabaikan spoofed `X-Forwarded-For` | **PASS** |
| **INTEGRATION** | `INT-02` | Direct connection (`false`): mengabaikan spoofed `CF-Connecting-IP` | **PASS** |
| **INTEGRATION** | `INT-03` | Direct-to-origin bypass pada server mode `loopback` ditolak | **PASS** |
| **INTEGRATION** | `INT-04` | Direct-to-origin bypass pada server mode `cloudflare` ditolak | **PASS** |
| **INTEGRATION** | `INT-05` | Ekstraksi IP klien sah melalui Apache local reverse proxy (`127.0.0.1`) | **PASS** |
| **INTEGRATION** | `INT-06` | **Mode `loopback` mengabaikan `CF-Connecting-IP` palsu dari penyerang** | **PASS** |
| **INTEGRATION** | `INT-07` | Soket Cloudflare edge valid mengekstrak `CF-Connecting-IP` secara akurat | **PASS** |
| **INTEGRATION** | `INT-08` | Password spraying dengan rotasi IP palsu diblokir Tier 2 IP limit (HTTP 429) | **PASS** |
| **INTEGRATION** | `INT-09` | Single account brute force diblokir Tier 1 Account limit (HTTP 429) | **PASS** |
| **INTEGRATION** | `INT-10` | Klien sah pada IP berbeda tetap dapat login (HTTP 401 bukan 429) | **PASS** |
| **INTEGRATION** | `INT-11` | Regresi seluruh endpoint aplikasi (`/api/artikel`, `/api/galeri`, `/api/auth/me`) | **PASS** |
| **TOPOLOGY** | `TOPO-01` | Verifikasi direktif reverse proxy Apache Passenger pada `htaccess-production.txt` | **PASS** |
| **TOPOLOGY** | `TOPO-02` | Verifikasi kelengkapan kanonikal 22 CIDR Cloudflare resmi (15 IPv4 + 7 IPv6) | **PASS** |
| **TOPOLOGY** | `TOPO-03` | Verifikasi parameter binding `HOST=127.0.0.1` pada startup backend | **PASS** |
| **TOPOLOGY** | `TOPO-04` | Verifikasi pencatatan peringatan keamanan saat mode `private` diaktifkan | **PASS** |

### Ringkasan Pengujian Kumulatif Proyek:
- `backend/tests/verify_phase1.js` (Baseline Phase 1): **21 / 21 PASS (100%)**
- `backend/tests/verify_phase1_1.js` (Phase 1.1 Sharp & Rate Limit): **21 / 21 PASS (100%)**
- `backend/tests/verify_phase1_2.js` (Phase 1.2 Trusted Proxy Hardening): **12 / 12 PASS (100%)**
- `backend/tests/verify_phase1_3.js` (Phase 1.3 Strict Validation & Topology Audit): **25 / 25 PASS (100%)**
- **TOTAL PENGUJIAN OTOMATIS: 79 / 79 PASS (100% ZERO REGRESSION)**

---

## 5. KESIMPULAN & STATUS AKHIR PHASE 1.3

1. **SEC-004 telah ditutup seutuhnya** pada tingkat kode aplikasi Node.js/Express. Tidak ada celah pemalsuan header IP klien yang dapat membypass rate limiting atau menyamarkan identitas serangan.
2. Batas arsitektur infrastruktur (antara kode aplikasi dan konfigurasi server cPanel/Apache/Cloudflare) telah dipetakan dan didokumentasikan secara transparan.
3. Seluruh kontrak API, respon endpoint, dan logika bisnis aplikasi berfungsi normal 100% tanpa regresi.
4. Kode aplikasi berada dalam kondisi aman dan siap untuk diaudit sebelum melangkah ke **Phase 2**.
