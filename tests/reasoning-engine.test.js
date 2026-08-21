const assert = require("node:assert/strict");
const GeminiReasoningEngine = require("../ai/gemini-reasoning-engine");

const tender = { id: "T-101", title: "CCTV installation" };
const profile = { experience: 5, turnover: "₹25 lakh" };

async function run() {
  const calls = [];
  
  // Mock GeminiClient that returns different responses based on the stage
  const mockGemini = {
    async analyzeWithReasoning(prompt) {
      calls.push(prompt);
      
      if (prompt.includes("Decompose this tender")) {
        return {
          answer: { requirements: [{ id: "exp", category: "experience", description: "5 years exp", isMandatory: true }] },
          thinking: "Thinking about decomposition...",
          latencyMs: 100
        };
      }
      
      if (prompt.includes("match it against the company profile")) {
        return {
          answer: { evidenceItems: [{ requirementId: "exp", requirement: "5 years exp", finding: "Has 5 years", status: "met", confidence: 95 }] },
          thinking: "Thinking about evidence...",
          latencyMs: 150
        };
      }
      
      if (prompt.includes("identify and quantify all risks")) {
        return {
          answer: { risks: [{ id: "r1", title: "Tight deadline", description: "Need to submit soon", impact: "low", likelihood: "high" }] },
          thinking: "Thinking about risks...",
          latencyMs: 120
        };
      }
      
      if (prompt.includes("Synthesize the evidence and risk")) {
        return {
          answer: { 
            matchScore: 92, 
            overallConfidence: 85, 
            eligibilityStatus: "eligible", 
            recommendation: "Strong fit, proceed with bid.",
            synthesisNarrative: "The company is a perfect fit.",
            keyStrengths: ["Experience"]
          },
          thinking: "Thinking about synthesis...",
          latencyMs: 200
        };
      }
      
      throw new Error("Unknown prompt");
    }
  };

  const engine = new GeminiReasoningEngine(mockGemini);
  const result = await engine.analyze(tender, profile);
  
  assert.equal(calls.length, 4, "Engine must call Gemini 4 times (4 stages)");
  assert.equal(result.status, "success");
  assert.equal(result.stages.length, 4, "Should record 4 stages");
  assert.equal(result.reasoningChain.length, 4, "Should record 4 reasoning steps");
  
  assert.equal(result.requirements.length, 1);
  assert.equal(result.evidenceItems.length, 1);
  assert.equal(result.riskMatrix.length, 1);
  
  assert.equal(result.matchScore, 92);
  assert.equal(result.overallConfidence, 85);
  
  console.log("Reasoning engine tests passed.");
}

run().catch((error) => {
  console.error("Reasoning engine tests failed:", error);
  process.exitCode = 1;
});
