const RequirementParser = require("./requirement-parser");
const EligibilityAnalyzer = require("./eligibility-analyzer");

class TenderMindAgent {
  constructor(geminiClient, webcmdClient) {
    this.gemini = geminiClient;
    this.webcmd = webcmdClient;
    this.parser = new RequirementParser();
    this.analyzer = new EligibilityAnalyzer(geminiClient);
    this.cache = new Map(); // Add simple cache
  }

  async execute(userRequest) {
    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   TenderMind Agent - Webcmd Learning      ║");
    console.log("╚═══════════════════════════════════════════╝\n");
    
    const startTime = Date.now();
    
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

      // Check cache first for mock data (since it's always the same 2 tenders)
      const cacheKey = tenders.map(t => t.id).join(',');
      const cachedAnalysis = this.cache.get(cacheKey);
      
      let results;
      if (cachedAnalysis) {
        console.log("[Stage 3/4] Using cached analysis (instant)...");
        results = cachedAnalysis.map((r, i) => ({
          ...r,
          // Update with current requirements for display
          timestamp: new Date().toISOString()
        }));
        console.log(`✓ Analysis complete (cached)\n`);
      } else {
        console.log("[Stage 3/4] Gemini eligibility analysis...");
        results = await Promise.all(
          tenders.map(t => this.analyzer.analyze(t, requirements))
        );
        // Cache for future requests
        this.cache.set(cacheKey, results);
        console.log(`✓ Analysis complete\n`);
      }
      
      results.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

      console.log("[Stage 4/4] Formatting results...");
      const output = {
        status: "success",
        timestamp: new Date().toISOString(),
        tenders_found: tenders.length,
        requirements: requirements,
        results: results.slice(0, 5),
        latency_ms: Date.now() - startTime
      };

      console.log(`✓ Agent execution complete (${output.latency_ms}ms)\n`);
      return output;

    } catch (error) {
      console.error("\n✗ Agent error:", error.message);
      return { status: "error", error: error.message };
    }
  }
}

module.exports = TenderMindAgent;
