const gemini = require("../ai/gemini-client");

async function run() {
  const response = await gemini.analyzeJson('Return JSON only: {"connected": true}');
  if (response.connected !== true) throw new Error("Gemini returned an unexpected verification response.");
  console.log("Gemini API verification passed.");
}

run().catch((error) => {
  console.error("Gemini API verification failed:", error.message);
  process.exitCode = 1;
});
