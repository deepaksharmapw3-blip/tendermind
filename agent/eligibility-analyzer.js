const GeminiReasoningEngine = require("../ai/gemini-reasoning-engine");

const ANALYSIS_SCHEMA = {
  matchScore: "number from 0 to 100",
  eligibilityStatus: "eligible, possibly_eligible, or not_eligible",
  recommendation: "short bid/no-bid recommendation",
  reasoning: "brief explanation of the assessment",
  evidence: [{ requirement: "requirement", finding: "evidence from tender or user profile", status: "met, unmet, or unknown" }],
  risks: ["specific risk or missing information"]
};

class EligibilityAnalyzer {
  constructor(geminiClient) {
    this.gemini = geminiClient;
    this.reasoningEngine = new GeminiReasoningEngine(geminiClient);
  }

  /* ───────────────────────────────────────────────
     QUICK — single-shot analysis (backward compat)
  ─────────────────────────────────────────────── */

  async analyze(tender, requirements) {
    const base = {
      tender_id: tender.id,
      title: tender.title,
      organization: tender.organization,
      value: tender.value,
      timestamp: new Date().toISOString()
    };

    try {
      const assessment = await this.gemini.analyzeJson(this.buildPrompt(tender, requirements));
      return { ...base, ...this.validateAssessment(assessment), analysisSource: "gemini" };
    } catch (error) {
      // Never substitute a rule-based result for an AI assessment.
      return {
        ...base,
        matchScore: null,
        eligibilityStatus: "analysis_unavailable",
        recommendation: "Eligibility analysis is unavailable. Add GEMINI_API_KEY and retry.",
        reasoning: null,
        evidence: [],
        risks: [error.message],
        analysisSource: "unavailable"
      };
    }
  }

  /* ───────────────────────────────────────────────
     DEEP — multi-stage reasoning analysis
  ─────────────────────────────────────────────── */

  async deepAnalyze(tender, companyProfile) {
    const base = {
      tender_id: tender.id,
      title: tender.title,
      organization: tender.organization,
      value: tender.value
    };

    try {
      console.log(`[DeepAnalyze] Starting 4-stage analysis for: ${tender.title}`);
      const result = await this.reasoningEngine.analyze(tender, companyProfile);
      console.log(`[DeepAnalyze] Complete in ${result.totalLatencyMs}ms — Score: ${result.matchScore}%`);

      return {
        ...base,
        ...result
      };
    } catch (error) {
      console.error(`[DeepAnalyze] Failed: ${error.message}`);
      return {
        ...base,
        status: "error",
        analysisSource: "gemini_advanced",
        matchScore: null,
        overallConfidence: null,
        eligibilityStatus: "analysis_unavailable",
        recommendation: "Deep analysis failed. " + error.message,
        synthesisNarrative: null,
        stages: [],
        reasoningChain: [],
        requirements: [],
        evidenceItems: [],
        riskMatrix: [],
        strategicInsights: [],
        keyStrengths: [],
        criticalGaps: [],
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /* ───────────────────────────────────────────────
     Prompt & validation (unchanged)
  ─────────────────────────────────────────────── */

  buildPrompt(tender, requirements) {
    return `You are a procurement eligibility analyst. Assess whether the company profile can bid for the tender using ONLY the supplied data. Do not infer missing credentials. Return JSON only, with no markdown, matching this schema:\n${JSON.stringify(ANALYSIS_SCHEMA)}\n\nCompany profile:\n${JSON.stringify(requirements, null, 2)}\n\nTender:\n${JSON.stringify(tender, null, 2)}\n\nScoring guidance: 80-100 = strong documented fit; 60-79 = plausible fit with verification needed; below 60 = material mismatch or unmet requirement. Evidence must name the requirement and cite the supplied profile or tender field. Mark absent information as unknown.`;
  }

  validateAssessment(assessment) {
    const score = Number(assessment.matchScore);
    if (!Number.isFinite(score)) throw new Error("Gemini response did not include a numeric matchScore.");

    const statuses = new Set(["eligible", "possibly_eligible", "not_eligible"]);
    if (!statuses.has(assessment.eligibilityStatus)) throw new Error("Gemini response included an invalid eligibility status.");
    if (typeof assessment.recommendation !== "string" || typeof assessment.reasoning !== "string") {
      throw new Error("Gemini response was missing its recommendation or reasoning.");
    }

    return {
      matchScore: Math.max(0, Math.min(100, Math.round(score))),
      eligibilityStatus: assessment.eligibilityStatus,
      recommendation: assessment.recommendation,
      reasoning: assessment.reasoning,
      evidence: Array.isArray(assessment.evidence) ? assessment.evidence : [],
      risks: Array.isArray(assessment.risks) ? assessment.risks : []
    };
  }
}

module.exports = EligibilityAnalyzer;
