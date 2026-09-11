# HUMM Speech-to-Code

Speak code logic. Get clean, formatted code. No typing.

Full-stack desktop + web app from the HUMM product brief:

**Speak → Understand → Generate → Review → Paste**

Works on **Windows desktop** (Chrome/Edge or Electron) and any modern browser.

Repository: https://github.com/ksraj20009/humm-speech-to-code

## What it does

You describe logic in English, Hindi, Hinglish, or mixed speech. HUMM turns that into paste-ready code in Python, JavaScript, Java, SQL, C++, Go, or Rust. You review the snippet, then copy it into any editor. Nothing is auto-pasted.

## Run on Windows

### 1. Prerequisites

- Node.js 20+ from https://nodejs.org
- Google Chrome or Microsoft Edge (best for the microphone)
- Optional: an API key for Claude, Gemini, OpenAI, Groq, etc.
- Optional: [Ollama](https://ollama.com) for a local model

### Fastest start (no npm install)

```bat
git clone https://github.com/ksraj20009/humm-speech-to-code.git
cd humm-speech-to-code
node server\standalone.mjs
```

Or double-click `start-windows.bat`. Then open Chrome or Edge to http://127.0.0.1:8787

### Developer mode (React + Vite)

```bat
npm install
npm run dev
```

Open http://127.0.0.1:5173. `npm start` runs the zero-dependency desktop server.

## Use it without an API key

Pick **HUMM Lite (offline demo)** in Model settings. It already knows the five product-brief examples and sketches other requests. For full natural-language generation, choose Claude, Gemini, OpenAI, Groq, OpenRouter, Mistral, DeepSeek, Ollama, vLLM, or a custom OpenAI-compatible endpoint.

API keys stay in memory for the current tab. They are never written to `localStorage` or history.

## Stack

- Desktop runtime: Node zero-dependency server (`server/standalone.mjs`) + `public/` UI
- Developer frontend: React 18 + Vite
- Developer backend: Express + TypeScript (`POST /api/speech-to-code`)
- Speech: browser Web Speech API (`en-IN`, `hi-IN`, `en-US`, `en-GB`)
- Desktop shell: Electron (optional)
- History: browser localStorage only

## API

`POST /api/speech-to-code`

```json
{
  "transcript": "ek function banao jo list mein se even numbers filter kare",
  "language": "python",
  "provider": "humm-lite",
  "model": "humm-lite",
  "endpoint": null,
  "apiKey": null
}
```

`GET /api/health` — liveness + catalogs.

## Product rules that this build keeps

- Voice first, text always available
- Review before paste
- Seven output languages
- Bring-your-own-model + one-click presets
- Speech locale selector
- Hinglish-aware system prompt
- Fence stripping if a model wraps code in markdown
- No accounts, no cloud history, no IDE plugin lock-in
