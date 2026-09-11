const { app, BrowserWindow, shell } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const isDev = process.argv.includes("--dev");
let child = null;
function startApi() {
  if (isDev) return;
  const root = path.join(__dirname, "..");
  child = spawn(process.execPath ? "node" : "node", ["server/standalone.mjs"], {
    cwd: root,
    env: { ...process.env, PORT: "8787" },
    stdio: "inherit",
    shell: process.platform === "win32",
  });
}
function createWindow() {
  const win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 960, minHeight: 680,
    backgroundColor: "#12081a", title: "HUMM Speech-to-Code",
    webPreferences: { preload: path.join(__dirname, "preload.cjs"), contextIsolation: true, nodeIntegration: false },
  });
  win.removeMenu();
  const url = isDev ? "http://127.0.0.1:5173" : "http://127.0.0.1:8787";
  if (isDev) win.loadURL(url); else setTimeout(() => win.loadURL(url), 600);
  win.webContents.setWindowOpenHandler(({ url: target }) => { shell.openExternal(target); return { action: "deny" }; });
}
app.whenReady().then(() => { startApi(); createWindow(); });
app.on("window-all-closed", () => { if (child) child.kill(); app.quit(); });
