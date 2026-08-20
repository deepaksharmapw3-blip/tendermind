const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

class WebcmdClient {
  async search(query, location) {
    try {
      console.log("[Webcmd] Executing: webcmd wbtenders search");
      const cmd = `webcmd wbtenders search --query "${query}" --location "${location}" -f json`;
      const { stdout, stderr } = await execAsync(cmd);
      
      if (stderr) {
        console.warn("[Webcmd] Warning:", stderr);
      }
      
      const results = JSON.parse(stdout);
      console.log(`[Webcmd] Found ${results.length} tenders`);
      return results;
    } catch (error) {
      console.error("[Webcmd] Command failed:", error.message);
      console.log("[Webcmd] Falling back to mock data...");
      return this.mockSearch(query, location);
    }
  }

  async detail(tenderId) {
    try {
      console.log("[Webcmd] Fetching detail for:", tenderId);
      const cmd = `webcmd wbtenders detail --id "${tenderId}" -f json`;
      const { stdout } = await execAsync(cmd);
      return JSON.parse(stdout);
    } catch (error) {
      console.error("[Webcmd] Detail fetch failed:", error.message);
      return this.mockDetail(tenderId);
    }
  }

  mockSearch(query, location) {
    return [
      {
        id: "TENDER-2026-08-001",
        title: "CCTV Installation for Municipal Building - Kolkata",
        organization: "Kolkata Municipal Corporation",
        location: "Kolkata, West Bengal",
        value: "₹8,50,000",
        eligibilityStatus: "eligible",
        matchScore: 87
      },
      {
        id: "TENDER-2026-08-002",
        title: "Security System Upgrade - Government Office",
        organization: "Government of West Bengal - PWD",
        location: "Kolkata, West Bengal",
        value: "₹12,50,000",
        eligibilityStatus: "possibly_eligible",
        matchScore: 72
      }
    ];
  }

  mockDetail(tenderId) {
    return {
      id: tenderId,
      title: "Tender Details",
      description: "Full tender details from WBTenders"
    };
  }
}

module.exports = new WebcmdClient();
