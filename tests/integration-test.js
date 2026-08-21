const assert = require("node:assert/strict");
const http = require("node:http");
const app = require("../backend/server");

function request(port, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request({ hostname: "127.0.0.1", port, path: "/api/search", method: "POST", headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(payload) } }, (res) => {
      let response = "";
      res.on("data", (chunk) => { response += chunk; });
      res.on("end", () => resolve({ statusCode: res.statusCode, body: JSON.parse(response) }));
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

async function run() {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, "127.0.0.1", () => resolve(instance));
  });
  const port = server.address().port;

  try {
    const invalid = await request(port, { query: "" });
    assert.equal(invalid.statusCode, 400);
    assert.equal(invalid.body.status, "error");

    const valid = await request(port, { query: "CCTV installation tenders in Kolkata, minimum INR 5 lakh" });
    assert.equal(valid.statusCode, 200);
    assert.equal(valid.body.status, "success");
    assert.ok(Array.isArray(valid.body.results));
    assert.ok(["gemini", "unavailable"].includes(valid.body.results[0].analysisSource));
    if (valid.body.results[0].analysisSource === "gemini") {
      assert.ok(valid.body.results[0].matchScore >= 0);
      assert.ok(Array.isArray(valid.body.results[0].evidence));
    } else {
      assert.equal(valid.body.results[0].matchScore, null);
    }
    console.log("Integration API test passed.");
  } finally {
    server.close();
  }
}

run().catch((error) => {
  console.error("Integration API test failed:", error);
  process.exitCode = 1;
});
