const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

class GeminiClient {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_api_key_here") {
      this.enabled = false;
      return;
    }
    try {
      this.client = new GoogleGenerativeAI(apiKey);
      this.model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
      this.enabled = true;
    } catch (error) {
      this.enabled = false;
    }
  }

  async analyze(prompt) {
    if (!this.enabled) return this.mockAnalyze();
    try {
      const result = await this.model.generateContent(prompt);
      return (await result.response).text();
    } catch (error) {
      return this.mockAnalyze();
    }
  }

  mockAnalyze() {
    return JSON.stringify({ status: "mock_response" });
  }
}

module.exports = new GeminiClient();
