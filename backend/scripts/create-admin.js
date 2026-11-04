#!/usr/bin/env node
/**
 * ============================================================================
 * PT PENILAI STANDAR UJI (PSU) - CLI ADMIN PROVISIONING SCRIPT
 * Skrip aman untuk membuat akun administrator pertama kali secara eksplisit.
 * ============================================================================
 * 
 * Penggunaan:
 *   1. Interaktif:
 *      node backend/scripts/create-admin.js
 * 
 *   2. Non-interaktif (otomasi deployment/CI/CD):
 *      node backend/scripts/create-admin.js --username psu_admin --email admin@penilaistandaruji.com --name "Admin Utama" --password "Rahasia123!" --role "Super Admin"
 */

const crypto = require("crypto");
const path = require("path");
const readline = require("readline");
let mysql;
try {
  mysql = require("mysql2/promise");
} catch {
  mysql = null;
}
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
require("dotenv").config({ path: path.join(__dirname, "..", "..", ".env") });

function hashPassword(plainPassword) {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(String(plainPassword), salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

function validatePasswordPolicy(password) {
  if (typeof password !== "string" || password.length < 8) {
    return "Kata sandi minimal 8 karakter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 huruf kapital (A-Z).";
  }
  if (!/[a-z]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 huruf kecil (a-z).";
  }
  if (!/[0-9]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 angka (0-9).";
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return "Kata sandi harus mengandung minimal 1 simbol / karakter khusus.";
  }
  return null;
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).trim());
}

function parseCliArgs() {
  const args = process.argv.slice(2);
  const params = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith("--") && i + 1 < args.length) {
      const key = arg.slice(2);
      params[key] = args[++i];
    }
  }
  return params;
}

function askQuestion(rl, query, isPassword = false) {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer.trim());
    });
  });
}

function saveToFallbackStore(username, email, passwordHash, name, finalRole) {
  console.log("Menyimpan akun administrator ke file lokal aman (.admin-fallback.json)...");
  const fallbackFile = path.join(__dirname, "..", ".admin-fallback.json");
  let currentUsers = [];
  try {
    const fs = require("fs");
    if (fs.existsSync(fallbackFile)) {
      currentUsers = JSON.parse(fs.readFileSync(fallbackFile, "utf8"));
    }
    const existingIdx = currentUsers.findIndex((u) => u.username === username || u.email === email);
    const userObj = {
      id: existingIdx >= 0 ? currentUsers[existingIdx].id : Date.now(),
      username,
      email,
      password_hash: passwordHash,
      full_name: name,
      role: finalRole,
      is_active: 1,
      last_login: null,
      created_at: new Date().toISOString(),
    };
    if (existingIdx >= 0) {
      currentUsers[existingIdx] = userObj;
    } else {
      currentUsers.push(userObj);
    }
    fs.writeFileSync(fallbackFile, JSON.stringify(currentUsers, null, 2), "utf8");
    console.log(`[SUKSES] Akun administrator '${username}' (${finalRole}) berhasil dibuat untuk mode fallback!`);
    console.log("====================================================================");
    process.exit(0);
  } catch (fsErr) {
    console.error("[ERROR FILE LOCAL]", fsErr.message);
    process.exit(1);
  }
}

async function main() {
  console.log("====================================================================");
  console.log("  PT PENILAI STANDAR UJI (PSU) — CLI SECURE ADMIN PROVISIONING");
  console.log("====================================================================");

  const cliParams = parseCliArgs();
  let { username, email, name, password, role } = cliParams;

  if (!username || !email || !name || !password) {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      if (!username) username = await askQuestion(rl, "Masukkan Username [min 3 karakter]: ");
      if (!email) email = await askQuestion(rl, "Masukkan Email resmi [contoh: admin@psu.com]: ");
      if (!name) name = await askQuestion(rl, "Masukkan Nama Lengkap: ");
      if (!role) {
        const roleInput = await askQuestion(rl, "Pilih Peran (1: Super Admin, 2: Editor, 3: Author) [default 1]: ");
        role = roleInput === "2" ? "Editor" : roleInput === "3" ? "Author" : "Super Admin";
      }
      if (!password) {
        password = await askQuestion(rl, "Masukkan Kata Sandi Kuat: ", true);
      }
    } finally {
      rl.close();
    }
  }

  // Validasi Input
  if (!username || username.length < 3 || !/^[a-zA-Z0-9_.-]+$/.test(username)) {
    console.error("[ERROR] Username tidak valid (hanya huruf, angka, garis bawah, titik).");
    process.exit(1);
  }

  if (!validateEmail(email)) {
    console.error("[ERROR] Format email tidak valid.");
    process.exit(1);
  }

  if (!name || name.length < 3) {
    console.error("[ERROR] Nama lengkap minimal 3 karakter.");
    process.exit(1);
  }

  const allowedRoles = ["Super Admin", "Editor", "Author"];
  const finalRole = allowedRoles.includes(role) ? role : "Super Admin";

  const passError = validatePasswordPolicy(password);
  if (passError) {
    console.error(`[ERROR KEBIJAKAN PASSWORD] ${passError}`);
    process.exit(1);
  }

  const passwordHash = hashPassword(password);

  const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "psu_company_profile",
    port: Number(process.env.DB_PORT) || 3306,
  };

  if (!mysql) {
    console.warn("[INFO] Driver mysql2 tidak ditemukan. Menyimpan ke fallback store...");
    saveToFallbackStore(username, email, passwordHash, name, finalRole);
    return;
  }

  try {
    console.log(`Menghubungkan ke database MySQL '${dbConfig.database}'...`);
    const connection = await mysql.createConnection(dbConfig);

    const [existing] = await connection.execute(
      "SELECT id FROM admin_users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );

    if (existing.length > 0) {
      console.warn(`[PERINGATAN] Akun dengan username '${username}' atau email '${email}' sudah ada.`);
      console.log("Memperbarui password dan status aktif akun tersebut...");
      await connection.execute(
        "UPDATE admin_users SET password_hash = ?, full_name = ?, role = ?, is_active = 1 WHERE username = ? OR email = ?",
        [passwordHash, name, finalRole, username, email]
      );
      console.log(`[SUKSES] Akun '${username}' berhasil diperbarui sebagai ${finalRole}.`);
    } else {
      await connection.execute(
        `INSERT INTO admin_users (username, email, password_hash, full_name, role, is_active)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [username, email, passwordHash, name, finalRole]
      );
      console.log(`[SUKSES] Akun administrator baru '${username}' (${finalRole}) berhasil dibuat!`);
    }

    await connection.end();
    console.log("====================================================================");
    console.log("Proses provisioning selesai dengan aman.");
    process.exit(0);
  } catch (err) {
    console.warn(`[INFO] Koneksi MySQL tidak tersedia (${err.message}).`);
    saveToFallbackStore(username, email, passwordHash, name, finalRole);
  }
}

main();
