const express = require("express");

function createApiRouter(agent) {
  const router = express.Router();

  /* ───────────────────────────────────────────────
     POST /api/search — quick search (unchanged)
  ─────────────────────────────────────────────── */

  router.post("/search", async (req, res) => {
    const query = typeof req.body?.query === "string" ? req.body.query.trim() : "";

    if (!query) {
      return res.status(400).json({
        status: "error",
        error: "Please describe your business and tender requirements."
      });
    }

    try {
      console.log(`[API] Search request: ${query.slice(0, 80)}`);
      const results = await agent.execute(query);
      const statusCode = results.status === "error" ? 502 : 200;
      return res.status(statusCode).json(results);
    } catch (error) {
      console.error("[API] Error:", error.message);
      return res.status(500).json({ status: "error", error: "Tender search failed." });
    }
  });

  /* ───────────────────────────────────────────────
     POST /api/analyze — deep multi-stage analysis
  ─────────────────────────────────────────────── */

  router.post("/analyze", async (req, res) => {
    const { tender, companyProfile } = req.body || {};

    if (!tender || typeof tender !== "object") {
      return res.status(400).json({
        status: "error",
        error: "Missing or invalid 'tender' object in request body."
      });
    }

    if (!companyProfile || typeof companyProfile !== "object") {
      return res.status(400).json({
        status: "error",
        error: "Missing or invalid 'companyProfile' object in request body."
      });
    }

    try {
      console.log(`[API] Deep analysis request: ${(tender.title || tender.id || "").slice(0, 80)}`);
      const result = await agent.executeDeepAnalysis(tender, companyProfile);
      const statusCode = result.status === "error" ? 502 : 200;
      return res.status(statusCode).json(result);
    } catch (error) {
      console.error("[API] Deep analysis error:", error.message);
      return res.status(500).json({ status: "error", error: "Deep analysis failed." });
    }
  });

  /* ───────────────────────────────────────────────
     GET /api/health — connection & capability check
  ─────────────────────────────────────────────── */

  router.get("/health", (req, res) => {
    const GeminiClient = require("../ai/gemini-client");

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      gemini: {
        enabled: GeminiClient.enabled,
        model: GeminiClient.model || null
      },
      capabilities: {
        quickSearch: true,
        deepAnalysis: GeminiClient.enabled,
        thinkingMode: GeminiClient.enabled
      }
    });
  });

  return router;
}

module.exports = createApiRouter;
