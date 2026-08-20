const { exec } = require("child_process");

async function initWebcmdAdapters() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            Webcmd Adapter Initialization                      ║
║     This explores WBTenders and creates reusable commands     ║
╚════════════════════════════════════════════════════════════════╝
  `);

  console.log("\n[1/3] Creating session...");
  exec("webcmd session create -f json", (err, stdout) => {
    if (err) {
      console.error("Session creation failed. Ensure Webcmd is installed:");
      console.log("  npm install -g @agentrhq/webcmd");
      return;
    }

    const session = JSON.parse(stdout);
    console.log(`✓ Session: ${session.id}\n`);

    console.log("[2/3] Initializing browser adapter...");
    console.log("This will launch a real browser to explore WBTenders...\n");

    const initCmd = `webcmd browser init wbtenders`;
    exec(initCmd, (err, stdout) => {
      if (err) {
        console.error("Browser init failed:", err.message);
        console.log("\nNote: If WBTenders is blocked by your network,");
        console.log("the demo will use fallback mock data.");
        return;
      }

      console.log(stdout);
      console.log("\n[3/3] Verifying adapters...");
      exec("webcmd list | grep wbtenders", (err, stdout) => {
        if (err) {
          console.log("⚠ Adapters not yet created. They'll be created on first search.\n");
        } else {
          console.log("✓ Adapters ready:\n" + stdout);
        }

        console.log("\nNext steps:");
        console.log("  npm run demo           # Run TenderMind demo");
        console.log("  webcmd wbtenders search --query 'CCTV'  # Use learned command");
      });
    });
  });
}

initWebcmdAdapters();
