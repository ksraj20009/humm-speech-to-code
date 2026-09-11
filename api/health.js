module.exports = function handler(req, res) {
  res.setHeader("access-control-allow-origin", "*");
  res.status(200).json({
    ok: true,
    product: "HUMM Speech-to-Code",
    flow: ["speak", "understand", "generate", "review", "paste"],
    languages: ["python", "javascript", "java", "sql", "cpp", "go", "rust"],
    providers: ["humm-lite", "anthropic", "gemini", "openai-compatible", "custom"]
  });
};
