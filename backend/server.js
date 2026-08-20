const express = require("express");
const path = require("path");
require("dotenv").config();

const TenderMindAgent = require("../agent");
const WebcmdClient = require("../adapters/webcmd-client");
const GeminiClient = require("../ai/gemini-client");
const createApiRouter = require("./api");

const app = express();
const port = process.env.PORT || 3000;
const frontendDirectory = path.join(__dirname, "../frontend/dist");
const agent = new TenderMindAgent(GeminiClient, WebcmdClient);

app.use(express.json({ limit: "50kb" }));
app.use("/api", createApiRouter(agent));
app.use(express.static(frontendDirectory));

app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  return res.sendFile(path.join(frontendDirectory, "index.html"));
});

if (require.main === module) {
  app.listen(port, () => {
    console.log(`[Server] TenderMind running on http://localhost:${port}`);
    console.log("[Server] Webcmd failures use the built-in mock tenders.");
  });
}

module.exports = app;
