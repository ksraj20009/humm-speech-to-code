const { contextBridge } = require("electron");
contextBridge.exposeInMainWorld("hummDesktop", { platform: process.platform });
