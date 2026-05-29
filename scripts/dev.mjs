import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const viteBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "vite.cmd" : "vite");
const electronBin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "electron.cmd" : "electron");

function spawnVisible(command, args) {
  return spawn(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env
  });
}

function waitForPort(port, host = "127.0.0.1", timeoutMs = 60000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const tryConnect = () => {
      const socket = net.connect({ port, host });
      socket.once("connect", () => {
        socket.end();
        resolve();
      });
      socket.once("error", () => {
        socket.destroy();
        if (Date.now() - startedAt > timeoutMs) {
          reject(new Error(`Timed out waiting for ${host}:${port}`));
          return;
        }
        setTimeout(tryConnect, 500);
      });
    };
    tryConnect();
  });
}

const vite = spawnVisible(viteBin, ["--host", "127.0.0.1"]);

try {
  await waitForPort(5173);
  const electron = spawnVisible(electronBin, ["."]);

  electron.on("exit", (code) => {
    vite.kill();
    process.exit(code ?? 0);
  });
} catch (error) {
  vite.kill();
  console.error(error);
  process.exit(1);
}
