require("dotenv").config();

const TenderMindAgent = require("../agent");
const WebcmdClient = require("../adapters/webcmd-client");
const GeminiClient = require("../ai/gemini-client");

async function runDemo() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            TenderMind - Webcmd-Powered Demo                   ║
║  (Real portal learning + AI eligibility analysis)             ║
╚════════════════════════════════════════════════════════════════╝
  `);

  try {
    console.log("[Setup] Initializing...\n");
    const agent = new TenderMindAgent(GeminiClient, WebcmdClient);

    const userRequest = `
I run a CCTV installation company in Kolkata. 
Find government tenders in West Bengal worth at least ₹5 lakh 
where my company is likely eligible. 
I have 5 years experience and ₹25 lakh annual turnover.
    `;

    console.log("[Input] User Request:");
    console.log(userRequest.trim() + "\n");

    const results = await agent.execute(userRequest);

    console.log("╔════════════════════════════════════════════════════════════════╗");
    console.log("║                       RESULTS                                 ║");
    console.log("╚════════════════════════════════════════════════════════════════╝\n");
    
    if (results.results && results.results.length > 0) {
      console.log("TOP MATCHING TENDERS:\n");
      results.results.forEach((t, i) => {
        console.log(`${i + 1}. ${t.title}`);
        console.log(`   Organization: ${t.organization}`);
        console.log(`   Value: ${t.value}`);
        console.log(`   Match Score: ${t.matchScore}%`);
        console.log(`   Status: ${t.eligibilityStatus}`);
        console.log(`   Recommendation: ${t.recommendation}\n`);
      });
    }

    console.log("✓ Demo completed successfully\n");
    console.log("Next: npm run webcmd:init  # Learn real WBTenders portal");

  } catch (error) {
    console.error("✗ Demo failed:", error.message);
    process.exit(1);
  }
}

runDemo();
