require("dotenv").config();

class GeminiClient {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      this.enabled = false;
      return;
    }

    this.apiKey = apiKey;
    this.model = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    this.enabled = true;
  }

  async analyzeJson(prompt) {
    if (!this.enabled) throw new Error("Gemini is not configured (missing GEMINI_API_KEY).");

    try {
      // Gemini's generateContent JSON mode is served through v1beta. Calling it
      // directly avoids the installed legacy SDK's incompatible v1 endpoint.
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "x-goog-api-key": this.apiKey },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.1, responseMimeType: "application/json" }
          })
        }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || `HTTP ${response.status}`);

      const text = payload.candidates?.[0]?.content?.parts?.[0]?.text;
      if (typeof text !== "string") throw new Error("Gemini returned no text content.");
      return JSON.parse(this.extractJson(text));
    } catch (error) {
      if (error instanceof SyntaxError) throw new Error("Gemini returned invalid JSON.");
      throw new Error(`Gemini analysis failed: ${error.message}`);
    }
  }

  extractJson(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    return trimmed;
  }
}

module.exports = new GeminiClient();
