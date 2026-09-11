# HUMM Speech-to-Code

Speak code logic. Get clean, formatted code. No typing.

**Live app (Windows Chrome / Edge):** https://humm-speech-to-code.vercel.app

**Repo:** https://github.com/ksraj20009/humm-speech-to-code

Flow: Speak → Understand → Generate → Review → Paste

## Use it now

1. Open https://humm-speech-to-code.vercel.app
2. Click an example chip or press Speak
3. Click Generate code
4. Review, then Copy or Download
5. Paste into any editor

HUMM Lite works with no API key. For full generation, pick Claude / Gemini / Groq / OpenAI in Model settings and paste a key. Keys stay in the current tab only.

## Local desktop

```bat
git clone https://github.com/ksraj20009/humm-speech-to-code.git
cd humm-speech-to-code
node server\standalone.mjs
```

Then open http://127.0.0.1:8787
