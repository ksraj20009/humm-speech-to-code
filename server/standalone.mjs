#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generateLite, stripFences, LANGUAGES, PROVIDERS, SYSTEM_PROMPT } from "./lite.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "127.0.0.1";

async function callModel(body) {
  const provider = body.provider || "humm-lite";
  const language = body.language || "python";
  const transcript = body.transcript || "";
  const model = body.model || "";
  const user = `Target language: ${language}\n\nSpoken / typed logic:\n${transcript}\n\nReturn only ${language} source code.`;
  if (provider === "humm-lite") return { code: generateLite(transcript, language), model: "humm-lite" };
  if (provider === "anthropic") {
    const key = (body.apiKey || process.env.ANTHROPIC_API_KEY || "").trim();
    if (!key) throw Object.assign(new Error("Add an API key in Model settings. Keys are used for this request only."), { status: 400 });
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({ model: model || "claude-sonnet-4-6", max_tokens: 8192, system: SYSTEM_PROMPT, messages: [{ role: "user", content: user }] }),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data?.error?.message || "Anthropic error " + res.status), { status: res.status });
    const text = Array.isArray(data.content) ? data.content.map((p) => p.text || "").join("") : "";
    return { code: stripFences(text), model: model || "claude-sonnet-4-6" };
  }
  if (provider === "gemini") {
    const key = (body.apiKey || process.env.GEMINI_API_KEY || "").trim();
    if (!key) throw Object.assign(new Error("Add an API key in Model settings. Keys are used for this request only."), { status: 400 });
    const m = model || "gemini-2.0-flash";
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(m) + ":generateContent?key=" + encodeURIComponent(key);
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig: { maxOutputTokens: 8192 } }),
    });
    const data = await res.json();
    if (!res.ok) throw Object.assign(new Error(data?.error?.message || "Gemini error " + res.status), { status: res.status });
    const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    return { code: stripFences(text), model: m };
  }
  const endpoint = (body.endpoint || "").trim() || (provider === "custom" ? "" : "https://api.openai.com/v1/chat/completions");
  if (!endpoint) throw Object.assign(new Error("Add an endpoint URL for your custom provider."), { status: 400 });
  const local = endpoint.includes("localhost") || endpoint.includes("127.0.0.1");
  const key = (body.apiKey || process.env.OPENAI_API_KEY || "").trim();
  if (!local && !key) throw Object.assign(new Error("Add an API key in Model settings. Keys are used for this request only."), { status: 400 });
  const headers = { "content-type": "application/json" };
  if (key) headers.authorization = "Bearer " + key;
  const res = await fetch(endpoint, {
    method: "POST",
    headers,
    body: JSON.stringify({ model: model || "gpt-4o-mini", max_tokens: 8192, messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: user }] }),
  });
  const data = await res.json();
  if (!res.ok) throw Object.assign(new Error(data?.error?.message || "Provider error " + res.status), { status: res.status });
  return { code: stripFences(data?.choices?.[0]?.message?.content || ""), model: model || "gpt-4o-mini" };
}

function send(res, status, data, type = "application/json; charset=utf-8") {
  const body = type.includes("json") ? JSON.stringify(data) : data;
  res.writeHead(status, { "content-type": type, "cache-control": "no-store", "access-control-allow-origin": "*", "access-control-allow-headers": "content-type", "access-control-allow-methods": "GET,POST,OPTIONS" });
  res.end(body);
}
function mime(file) {
  if (file.endsWith(".html")) return "text/html; charset=utf-8";
  if (file.endsWith(".css")) return "text/css; charset=utf-8";
  if (file.endsWith(".js")) return "text/javascript; charset=utf-8";
  return "application/octet-stream";
}
function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(Object.assign(new Error("Invalid JSON body"), { status: 400 })); }
    });
    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", "http://" + HOST + ":" + PORT);
  if (req.method === "OPTIONS") return send(res, 204, "");
  if (req.method === "GET" && url.pathname === "/api/health") {
    return send(res, 200, { ok: true, product: "HUMM Speech-to-Code", flow: ["speak", "understand", "generate", "review", "paste"], languages: LANGUAGES, providers: PROVIDERS });
  }
  if (req.method === "POST" && url.pathname === "/api/speech-to-code") {
    try {
      const body = await readBody(req);
      const transcript = String(body.transcript || "").trim();
      const language = String(body.language || "python").toLowerCase();
      if (!transcript) return send(res, 400, { error: "Transcript is empty. Speak or type the logic first." });
      if (!LANGUAGES.includes(language)) return send(res, 400, { error: "Unsupported language: " + language });
      const result = await callModel({ ...body, transcript, language });
      if (!result.code) return send(res, 502, { error: "The model returned empty code." });
      return send(res, 200, { code: result.code, language, provider: body.provider || "humm-lite", model: result.model });
    } catch (err) {
      const status = err.status && err.status >= 400 && err.status < 600 ? err.status : 500;
      return send(res, status, { error: err.message || "Generation failed." });
    }
  }
  if (req.method === "GET") {
    const rel = url.pathname === "/" ? "/index.html" : url.pathname;
    const file = path.normalize(path.join(ROOT, "public", rel));
    if (!file.startsWith(path.join(ROOT, "public"))) return send(res, 403, { error: "Forbidden" });
    if (fs.existsSync(file) && fs.statSync(file).isFile()) return send(res, 200, fs.readFileSync(file), mime(file));
    return send(res, 404, { error: "Not found" });
  }
  send(res, 404, { error: "Not found" });
});

server.listen(PORT, HOST, () => {
  console.log("HUMM Speech-to-Code");
  console.log("Open this on Windows: http://" + HOST + ":" + PORT);
});
