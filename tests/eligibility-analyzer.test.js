const assert = require("node:assert/strict");
const EligibilityAnalyzer = require("../agent/eligibility-analyzer");

const tender = {
  id: "T-101",
  title: "CCTV installation",
  organization: "Kolkata Municipal Corporation",
  value: "INR 8 lakh",
  location: "Kolkata"
};

const requirements = { experience: 5, turnover: "₹25 lakh", location: "Kolkata", keywords: ["cctv"] };

async function run() {
  const calls = [];
  const analyzer = new EligibilityAnalyzer({
    async analyzeJson(prompt) {
      calls.push(prompt);
      return {
        matchScore: 86.4,
        eligibilityStatus: "eligible",
        recommendation: "Bid after confirming registration requirements.",
        reasoning: "The supplied experience and turnover support the tender.",
        evidence: [{ requirement: "experience", finding: "Profile states 5 years", status: "met" }],
        risks: ["Registration requirement was not supplied"]
      };
    }
  });

  const result = await analyzer.analyze(tender, requirements);
  assert.equal(calls.length, 1, "Gemini must be called for every assessment");
  assert.match(calls[0], /Return JSON only/);
  assert.equal(result.analysisSource, "gemini");
  assert.equal(result.matchScore, 86);
  assert.equal(result.evidence[0].status, "met");

  const unavailable = await new EligibilityAnalyzer({
    async analyzeJson() { throw new Error("Gemini is not configured"); }
  }).analyze(tender, requirements);
  assert.equal(unavailable.analysisSource, "unavailable");
  assert.equal(unavailable.matchScore, null);
  assert.equal(unavailable.eligibilityStatus, "analysis_unavailable");
  console.log("Eligibility analyzer tests passed.");
}

run().catch((error) => {
  console.error("Eligibility analyzer tests failed:", error);
  process.exitCode = 1;
});
