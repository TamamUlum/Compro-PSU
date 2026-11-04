const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");

const rootDir = __dirname;
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "company-profile");

console.log("==================================================");
console.log("Menjalankan Backend (MySQL API) & Frontend (Vite)...");
console.log("==================================================");

// 1. Jalankan Backend API (node server.js)
const backendProc = spawn(process.execPath, ["server.js"], {
  cwd: backendDir,
  stdio: "inherit",
});

// 2. Jalankan Frontend Vite (company-profile)
const viteBin = path.join(frontendDir, "node_modules", "vite", "bin", "vite.js");
let frontendProc;

if (fs.existsSync(viteBin)) {
  frontendProc = spawn(process.execPath, [viteBin], {
    cwd: frontendDir,
    stdio: "inherit",
  });
} else {
  const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
  frontendProc = spawn(npmCmd, ["run", "dev"], {
    cwd: frontendDir,
    stdio: "inherit",
    shell: true,
  });
}

function shutdown() {
  if (backendProc && !backendProc.killed) backendProc.kill();
  if (frontendProc && !frontendProc.killed) frontendProc.kill();
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);