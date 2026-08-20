require("dotenv").config();

const TenderMindAgent = require("../agent");
const WebcmdClient = require("../adapters/webcmd-client");
const GeminiClient = require("../ai/gemini-client");

async function runSimpleDemo() {
  const agent = new TenderMindAgent(GeminiClient, WebcmdClient);
  const userRequest = "I run a CCTV installation company in Kolkata. Find government tenders in West Bengal worth at least INR 5 lakh where my company is likely eligible. I have 5 years experience and INR 25 lakh annual turnover.";

  console.log("TenderMind simple demo\n");
  console.log(`User input: ${userRequest}\n`);
  const results = await agent.execute(userRequest);
  console.log(JSON.stringify(results, null, 2));
}

runSimpleDemo().catch((error) => {
  console.error("Demo failed:", error.message);
  process.exitCode = 1;
});
