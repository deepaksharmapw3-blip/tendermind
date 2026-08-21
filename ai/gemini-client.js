require("dotenv").config();

const DEFAULT_THINKING_BUDGET = 8192;
const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1000;
const RETRYABLE_CODES = new Set([429, 503, 500]);

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

  /* ───────────────────────────────────────────────
     LEGACY — single-shot JSON (backward compat)
  ─────────────────────────────────────────────── */

  async analyzeJson(prompt) {
    if (!this.enabled) throw new Error("Gemini is not configured (missing GEMINI_API_KEY).");

    const result = await this._callGemini(prompt, {
      temperature: 0.1,
      responseMimeType: "application/json"
    });

    return result.answer;
  }

  /* ───────────────────────────────────────────────
     NEW — reasoning mode with thinking tokens
  ─────────────────────────────────────────────── */

  async analyzeWithReasoning(prompt, thinkingBudget = DEFAULT_THINKING_BUDGET) {
    if (!this.enabled) throw new Error("Gemini is not configured (missing GEMINI_API_KEY).");

    const result = await this._callGemini(prompt, {
      temperature: 0.1,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget }
    });

    return result;
  }

  /* ───────────────────────────────────────────────
     INTERNAL — fetch with retry + metadata
  ─────────────────────────────────────────────── */

  async _callGemini(prompt, generationConfig) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(this.model)}:generateContent`;

    const body = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig
    };

    let lastError;
    const t0 = Date.now();

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": this.apiKey
          },
          body: JSON.stringify(body)
        });

        const payload = await response.json();

        if (!response.ok) {
          const msg = payload.error?.message || `HTTP ${response.status}`;
          if (RETRYABLE_CODES.has(response.status) && attempt < MAX_RETRIES - 1) {
            const wait = RETRY_BASE_MS * Math.pow(2, attempt);
            console.warn(`[Gemini] ${response.status} — retrying in ${wait}ms (attempt ${attempt + 1}/${MAX_RETRIES})`);
            await this._sleep(wait);
            lastError = new Error(msg);
            continue;
          }
          throw new Error(msg);
        }

        const latencyMs = Date.now() - t0;
        return this._parseResponse(payload, latencyMs);

      } catch (error) {
        if (error instanceof SyntaxError) {
          throw new Error("Gemini returned invalid JSON.");
        }
        lastError = error;

        if (attempt < MAX_RETRIES - 1 && !error.message.includes("invalid JSON")) {
          const wait = RETRY_BASE_MS * Math.pow(2, attempt);
          console.warn(`[Gemini] Error: ${error.message} — retrying in ${wait}ms`);
          await this._sleep(wait);
          continue;
        }
      }
    }

    throw new Error(`Gemini analysis failed after ${MAX_RETRIES} attempts: ${lastError?.message}`);
  }

  /* ───────────────────────────────────────────────
     Parse response — extract thinking + answer
  ─────────────────────────────────────────────── */

  _parseResponse(payload, latencyMs) {
    const candidate = payload.candidates?.[0];
    if (!candidate?.content?.parts) {
      throw new Error("Gemini returned no content.");
    }

    let thinking = null;
    let answerText = null;

    for (const part of candidate.content.parts) {
      if (part.thought === true && part.text) {
        thinking = part.text;
      } else if (part.text) {
        answerText = part.text;
      }
    }

    if (typeof answerText !== "string") {
      throw new Error("Gemini returned no text content.");
    }

    const answer = JSON.parse(this._extractJson(answerText));

    const tokenUsage = payload.usageMetadata || null;

    return {
      answer,
      thinking,
      model: this.model,
      latencyMs,
      tokenUsage,
      finishReason: candidate.finishReason || null
    };
  }

  /* ───────────────────────────────────────────────
     Helpers
  ─────────────────────────────────────────────── */

  _extractJson(text) {
    const trimmed = text.trim();
    if (trimmed.startsWith("```")) {
      return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    }
    return trimmed;
  }

  _sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new GeminiClient();
