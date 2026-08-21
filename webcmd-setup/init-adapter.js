const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);
const webcmdExecutable = process.platform === "win32" ? "webcmd.cmd" : "webcmd";
const webcmdOptions = process.platform === "win32" ? { shell: true } : {};
const ADAPTER = "wbtenders/search";

async function initWebcmdAdapters() {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║            Webcmd Adapter Initialization                      ║
║     This explores WBTenders and creates reusable commands     ║
╚════════════════════════════════════════════════════════════════╝
  `);

  try {
    console.log("\n[1/2] Initializing browser adapter...");
    console.log(`Ensuring ${ADAPTER} is available in Webcmd's local adapter store...\n`);
    const init = await execFileAsync(webcmdExecutable, ["browser", "init", ADAPTER], webcmdOptions);
    if (init.stdout.trim()) console.log(init.stdout.trim());

    console.log("\n[2/2] Verifying adapter registration...");
    const listed = await execFileAsync(webcmdExecutable, ["list", "-f", "json"], webcmdOptions);
    const commands = JSON.parse(listed.stdout);
    const adapter = commands.find((command) => command.command === "wbtenders/search");
    if (!adapter) throw new Error(`Webcmd did not register ${ADAPTER}.`);

    console.log(`✓ Adapter ready: ${adapter.command}`);
    console.log("\nNext steps:");
    console.log("  npm run demo");
    console.log("  webcmd wbtenders search --query 'CCTV' --location 'Kolkata' -f json");
  } catch (error) {
    console.error("\nWebcmd adapter initialization failed:", error.message);
    console.error("Ensure Webcmd is installed: npm install -g @agentrhq/webcmd");
    process.exitCode = 1;
  }
}

initWebcmdAdapters();
