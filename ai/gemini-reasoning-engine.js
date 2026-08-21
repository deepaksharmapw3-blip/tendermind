/**
 * GeminiReasoningEngine — Multi-stage deep analysis orchestrator.
 *
 * Stage 1: Requirement Decomposition
 * Stage 2: Evidence Matching (per requirement)
 * Stage 3: Risk Quantification
 * Stage 4: Synthesis
 *
 * Each stage uses Gemini's thinking mode for transparent reasoning.
 */

const THINKING_BUDGET = 8192;

/* ═══════════════════════════════════════════
   STAGE SCHEMAS
═══════════════════════════════════════════ */

const DECOMPOSITION_SCHEMA = {
  requirements: [
    {
      id: "string — short unique slug, e.g. 'min_turnover'",
      category: "technical | financial | legal | logistical | experience",
      description: "what the tender demands",
      isMandatory: "boolean — true if failure to meet disqualifies"
    }
  ]
};

const EVIDENCE_SCHEMA = {
  evidenceItems: [
    {
      requirementId: "matches the id from decomposition",
      requirement: "what the tender demands",
      finding: "what the company profile says, or 'not stated'",
      status: "met | partially_met | unmet | unknown",
      confidence: "number 0-100 — how certain is this assessment",
      sourceField: "which part of the tender or profile this was extracted from",
      citation: "verbatim quote from the input data supporting the finding"
    }
  ]
};

const RISK_SCHEMA = {
  risks: [
    {
      id: "string — short slug",
      title: "short risk title",
      description: "detailed risk description",
      impact: "high | medium | low",
      likelihood: "high | medium | low",
      mitigation: "suggested action to address this risk",
      relatedRequirementId: "optional — links to a decomposed requirement"
    }
  ]
};

const SYNTHESIS_SCHEMA = {
  matchScore: "number 0-100",
  overallConfidence: "number 0-100 — confidence in the overall assessment",
  eligibilityStatus: "eligible | possibly_eligible | not_eligible",
  recommendation: "short strategic bid/no-bid recommendation",
  synthesisNarrative: "2-3 paragraph comprehensive analysis explaining the assessment, citing specific evidence and risks",
  strategicInsights: ["actionable insight for the bidder"],
  keyStrengths: ["strength from evidence"],
  criticalGaps: ["gap that must be addressed before bidding"]
};

/* ═══════════════════════════════════════════
   ENGINE
═══════════════════════════════════════════ */

class GeminiReasoningEngine {
  constructor(geminiClient) {
    this.gemini = geminiClient;
  }

  /**
   * Run the full 4-stage deep analysis pipeline.
   * Returns a rich result with all stages, reasoning chain, and metadata.
   */
  async analyze(tender, companyProfile) {
    const t0 = Date.now();
    const stages = [];
    const reasoningChain = [];

    try {
      /* ── Stage 1: Decompose ── */
      const stage1 = await this._stage1_decompose(tender);
      stages.push({ stage: 1, name: "Requirement Decomposition", ...stage1.meta });
      reasoningChain.push({
        stage: 1,
        title: "Requirement Decomposition",
        thinking: stage1.thinking,
        summary: `Identified ${stage1.data.requirements.length} requirements across ${this._countCategories(stage1.data.requirements)} categories`
      });

      /* ── Stage 2: Evidence Match ── */
      const stage2 = await this._stage2_evidence(tender, companyProfile, stage1.data.requirements);
      stages.push({ stage: 2, name: "Evidence Matching", ...stage2.meta });
      const metCount = stage2.data.evidenceItems.filter(e => e.status === "met").length;
      reasoningChain.push({
        stage: 2,
        title: "Evidence Matching",
        thinking: stage2.thinking,
        summary: `Matched ${metCount}/${stage2.data.evidenceItems.length} requirements with evidence`
      });

      /* ── Stage 3: Risk Quantification ── */
      const stage3 = await this._stage3_risks(tender, companyProfile, stage2.data.evidenceItems);
      stages.push({ stage: 3, name: "Risk Quantification", ...stage3.meta });
      const highRisks = stage3.data.risks.filter(r => r.impact === "high").length;
      reasoningChain.push({
        stage: 3,
        title: "Risk Quantification",
        thinking: stage3.thinking,
        summary: `Identified ${stage3.data.risks.length} risks (${highRisks} high-impact)`
      });

      /* ── Stage 4: Synthesis ── */
      const stage4 = await this._stage4_synthesize(tender, companyProfile, stage2.data.evidenceItems, stage3.data.risks);
      stages.push({ stage: 4, name: "Synthesis & Recommendation", ...stage4.meta });
      reasoningChain.push({
        stage: 4,
        title: "Synthesis & Recommendation",
        thinking: stage4.thinking,
        summary: `Score: ${stage4.data.matchScore}% — ${stage4.data.eligibilityStatus} (confidence: ${stage4.data.overallConfidence}%)`
      });

      /* ── Assemble result ── */
      return {
        status: "success",
        analysisSource: "gemini_advanced",
        totalLatencyMs: Date.now() - t0,
        stages,
        reasoningChain,
        // Decomposed requirements
        requirements: stage1.data.requirements,
        // Evidence items with confidence
        evidenceItems: stage2.data.evidenceItems,
        // Risk matrix
        riskMatrix: stage3.data.risks,
        // Synthesis
        matchScore: stage4.data.matchScore,
        overallConfidence: stage4.data.overallConfidence,
        eligibilityStatus: stage4.data.eligibilityStatus,
        recommendation: stage4.data.recommendation,
        synthesisNarrative: stage4.data.synthesisNarrative,
        strategicInsights: stage4.data.strategicInsights || [],
        keyStrengths: stage4.data.keyStrengths || [],
        criticalGaps: stage4.data.criticalGaps || [],
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      return {
        status: "error",
        analysisSource: "gemini_advanced",
        totalLatencyMs: Date.now() - t0,
        stages,
        reasoningChain,
        requirements: [],
        evidenceItems: [],
        riskMatrix: [],
        matchScore: null,
        overallConfidence: null,
        eligibilityStatus: "analysis_unavailable",
        recommendation: "Deep analysis failed. " + error.message,
        synthesisNarrative: null,
        strategicInsights: [],
        keyStrengths: [],
        criticalGaps: [],
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /* ═══════════════════════════════════════════
     STAGE 1 — Requirement Decomposition
  ═══════════════════════════════════════════ */

  async _stage1_decompose(tender) {
    const prompt = `You are a government procurement analyst. Decompose this tender into its atomic requirements. Categorize each as technical, financial, legal, logistical, or experience. Mark each as mandatory or optional. Return JSON matching this schema:\n${JSON.stringify(DECOMPOSITION_SCHEMA)}\n\nTender:\n${JSON.stringify(tender, null, 2)}\n\nBe thorough — extract every stated AND implied requirement. If the tender is brief, infer standard government procurement requirements (e.g., GST registration, EMD, experience certificates).`;

    const result = await this.gemini.analyzeWithReasoning(prompt, THINKING_BUDGET);

    return {
      data: this._validateDecomposition(result.answer),
      thinking: result.thinking,
      meta: { latencyMs: result.latencyMs, model: result.model, tokenUsage: result.tokenUsage }
    };
  }

  /* ═══════════════════════════════════════════
     STAGE 2 — Evidence Matching
  ═══════════════════════════════════════════ */

  async _stage2_evidence(tender, companyProfile, requirements) {
    const prompt = `You are a procurement eligibility analyst. For each requirement below, match it against the company profile. Extract evidence WITH confidence scores. Return JSON matching this schema:\n${JSON.stringify(EVIDENCE_SCHEMA)}\n\nRequirements to check:\n${JSON.stringify(requirements, null, 2)}\n\nCompany profile:\n${JSON.stringify(companyProfile, null, 2)}\n\nTender context:\n${JSON.stringify(tender, null, 2)}\n\nRules:\n- confidence: 90-100 if directly stated in profile; 60-89 if can be reasonably inferred; 30-59 if partially matches; 0-29 if unknown or contradicted.\n- citation: use verbatim text from the profile or tender. If nothing relevant, write "No relevant data in profile."\n- status: "met" only if confidence >= 70. "partially_met" if 40-69. "unmet" if profile explicitly contradicts. "unknown" if no data.\n- Do NOT assume capabilities not stated in the profile.`;

    const result = await this.gemini.analyzeWithReasoning(prompt, THINKING_BUDGET);

    return {
      data: this._validateEvidence(result.answer),
      thinking: result.thinking,
      meta: { latencyMs: result.latencyMs, model: result.model, tokenUsage: result.tokenUsage }
    };
  }

  /* ═══════════════════════════════════════════
     STAGE 3 — Risk Quantification
  ═══════════════════════════════════════════ */

  async _stage3_risks(tender, companyProfile, evidenceItems) {
    const unmet = evidenceItems.filter(e => e.status === "unmet" || e.status === "unknown" || e.status === "partially_met");

    const prompt = `You are a procurement risk analyst. Based on the evidence assessment, identify and quantify all risks for this bid. Return JSON matching this schema:\n${JSON.stringify(RISK_SCHEMA)}\n\nEvidence assessment (focus on gaps):\n${JSON.stringify(unmet, null, 2)}\n\nFull evidence:\n${JSON.stringify(evidenceItems, null, 2)}\n\nTender:\n${JSON.stringify(tender, null, 2)}\n\nCompany profile:\n${JSON.stringify(companyProfile, null, 2)}\n\nRules:\n- Include risks from: missing documents, unmet requirements, tight deadlines, financial exposure (EMD, performance guarantee), competition, compliance.\n- impact: "high" if it could disqualify the bid; "medium" if it weakens competitiveness; "low" if minor concern.\n- Always include at least 1 risk. Government tenders always have risks.\n- Suggest concrete mitigation actions.`;

    const result = await this.gemini.analyzeWithReasoning(prompt, THINKING_BUDGET);

    return {
      data: this._validateRisks(result.answer),
      thinking: result.thinking,
      meta: { latencyMs: result.latencyMs, model: result.model, tokenUsage: result.tokenUsage }
    };
  }

  /* ═══════════════════════════════════════════
     STAGE 4 — Synthesis
  ═══════════════════════════════════════════ */

  async _stage4_synthesize(tender, companyProfile, evidenceItems, risks) {
    const prompt = `You are a senior procurement strategist. Synthesize the evidence and risk analysis into a final bid recommendation. Return JSON matching this schema:\n${JSON.stringify(SYNTHESIS_SCHEMA)}\n\nEvidence items:\n${JSON.stringify(evidenceItems, null, 2)}\n\nRisk assessment:\n${JSON.stringify(risks, null, 2)}\n\nTender:\n${JSON.stringify(tender, null, 2)}\n\nCompany profile:\n${JSON.stringify(companyProfile, null, 2)}\n\nScoring guidance:\n- 80-100: Strong documented fit, most requirements met with high confidence, no high-impact risks\n- 60-79: Plausible fit, some verification needed, manageable risks\n- 40-59: Significant gaps, multiple unknown or unmet requirements\n- Below 40: Material mismatch, recommend not bidding\n\noverallConfidence: how sure you are about the matchScore (based on data quality, not the fit itself).\nsynthesisNarrative: write 2-3 paragraphs explaining your assessment, referencing specific evidence and risks by name. This is the main output the user reads.\nstrategicInsights: 3-5 actionable next steps.\nkeyStrengths: what makes this company a good fit.\ncriticalGaps: what must be addressed before bidding.`;

    const result = await this.gemini.analyzeWithReasoning(prompt, THINKING_BUDGET);

    return {
      data: this._validateSynthesis(result.answer),
      thinking: result.thinking,
      meta: { latencyMs: result.latencyMs, model: result.model, tokenUsage: result.tokenUsage }
    };
  }

  /* ═══════════════════════════════════════════
     VALIDATORS
  ═══════════════════════════════════════════ */

  _validateDecomposition(data) {
    if (!Array.isArray(data?.requirements) || data.requirements.length === 0) {
      throw new Error("Stage 1: Gemini returned no requirements.");
    }
    return data;
  }

  _validateEvidence(data) {
    if (!Array.isArray(data?.evidenceItems)) {
      throw new Error("Stage 2: Gemini returned no evidence items.");
    }
    // Normalize confidence to numbers
    data.evidenceItems = data.evidenceItems.map(item => ({
      ...item,
      confidence: Math.max(0, Math.min(100, Math.round(Number(item.confidence) || 0)))
    }));
    return data;
  }

  _validateRisks(data) {
    if (!Array.isArray(data?.risks)) {
      throw new Error("Stage 3: Gemini returned no risks.");
    }
    const validImpacts = new Set(["high", "medium", "low"]);
    data.risks = data.risks.map(r => ({
      ...r,
      impact: validImpacts.has(r.impact) ? r.impact : "medium",
      likelihood: validImpacts.has(r.likelihood) ? r.likelihood : "medium"
    }));
    return data;
  }

  _validateSynthesis(data) {
    const score = Number(data?.matchScore);
    if (!Number.isFinite(score)) throw new Error("Stage 4: missing matchScore.");
    const statuses = new Set(["eligible", "possibly_eligible", "not_eligible"]);
    if (!statuses.has(data.eligibilityStatus)) throw new Error("Stage 4: invalid eligibilityStatus.");
    if (typeof data.recommendation !== "string") throw new Error("Stage 4: missing recommendation.");

    return {
      ...data,
      matchScore: Math.max(0, Math.min(100, Math.round(score))),
      overallConfidence: Math.max(0, Math.min(100, Math.round(Number(data.overallConfidence) || 50)))
    };
  }

  /* ═══════════════════════════════════════════
     HELPERS
  ═══════════════════════════════════════════ */

  _countCategories(requirements) {
    return new Set(requirements.map(r => r.category)).size;
  }
}

module.exports = GeminiReasoningEngine;
