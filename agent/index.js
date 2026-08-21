const RequirementParser = require("./requirement-parser");
const EligibilityAnalyzer = require("./eligibility-analyzer");

class TenderMindAgent {
  constructor(geminiClient, webcmdClient) {
    this.gemini = geminiClient;
    this.webcmd = webcmdClient;
    this.parser = new RequirementParser();
    this.analyzer = new EligibilityAnalyzer(geminiClient);
  }

  /* ───────────────────────────────────────────────
     QUICK — search + basic eligibility (unchanged)
  ─────────────────────────────────────────────── */

  async execute(userRequest) {
    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   TenderMind Agent - Webcmd Learning      ║");
    console.log("╚═══════════════════════════════════════════╝\n");
    
    try {
      console.log("[Stage 1/4] Parsing requirements...");
      const requirements = this.parser.parse(userRequest);
      console.log("✓ Parsed\n");

      console.log("[Stage 2/4] Webcmd search (learned command)...");
      const tenders = await this.webcmd.search(
        requirements.keywords.join(" "),
        requirements.location || "West Bengal"
      );
      console.log(`✓ Found ${tenders.length} tenders\n`);

      console.log("[Stage 3/4] Gemini eligibility analysis...");
      const results = await Promise.all(
        tenders.map(t => this.analyzer.analyze(t, requirements))
      );
      results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
      console.log(`✓ Analysis complete\n`);

      console.log("[Stage 4/4] Formatting results...");
      const output = {
        status: "success",
        timestamp: new Date().toISOString(),
        tenders_found: tenders.length,
        requirements: requirements,
        results: results.slice(0, 5)
      };

      console.log("✓ Agent execution complete\n");
      return output;

    } catch (error) {
      console.error("\n✗ Agent error:", error.message);
      return { status: "error", error: error.message };
    }
  }

  /* ───────────────────────────────────────────────
     DEEP — multi-stage reasoning for one tender
  ─────────────────────────────────────────────── */

  async executeDeepAnalysis(tender, companyProfile) {
    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   TenderMind — Deep Reasoning Analysis    ║");
    console.log("╚═══════════════════════════════════════════╝\n");

    try {
      console.log(`[Deep] Analyzing: ${tender.title || tender.id}`);
      const result = await this.analyzer.deepAnalyze(tender, companyProfile);
      console.log(`[Deep] Complete — ${result.status}\n`);
      return result;
    } catch (error) {
      console.error("[Deep] Error:", error.message);
      return {
        status: "error",
        error: error.message,
        analysisSource: "gemini_advanced"
      };
    }
  }
}

module.exports = TenderMindAgent;
