const express = require("express");

function createApiRouter(agent) {
  const router = express.Router();

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

  return router;
}

module.exports = createApiRouter;
