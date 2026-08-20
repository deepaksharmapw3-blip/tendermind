# TenderMind 🎯

**Stop searching tenders. Let your browser agent find the ones you can actually win.**

AI-powered government tender discovery built on **Webcmd** browser automation + Gemini reasoning.

## 🏗️ Webcmd-First Architecture

### Why Webcmd?

Traditional browser agents repeat the same site navigation every run, paying again for discovery. Webcmd **learns websites once, then creates deterministic CLI commands**.

## 🔄 How Webcmd Learning Works

### Stage 1: Discovery (First Run)
```javascript
const session = webcmd.browser.create();
session.navigate('https://en.wbtenders.gov.in/');
session.fillInput('[name="q"]', 'CCTV');
session.click('[type="submit"]');
session.waitForResults();
const results = session.extractData({...});
session.close();
```

### Stage 2: Memory
Webcmd stores:
- Page structures discovered
- Navigation patterns
- Form selectors
- API endpoints captured
- Fallback strategies

### Stage 3: Adapter Generation
Webcmd automatically creates:
```javascript
// ~/.webcmd/clis/wbtenders/search.js
module.exports = {
  command: 'wbtenders search',
  args: ['--query', '--location'],
  strategy: 'PUBLIC',
  handler: async (query, location) => {
    // Uses learned selectors, no new discovery
    return structuredJSON;
  }
};
```

### Stage 4: Reuse (Forever)
```bash
$ webcmd wbtenders search --query "CCTV" --location "Kolkata"
{
  "tenders": [
    { "id": "TENDER-001", "title": "...", "matchScore": 87 }
  ]
}
```

## 🛠️ Build Day (Aug 21) Schedule

### Morning (8-12):
1. **If network allows:** Run `npm run webcmd:init` to learn real portal
2. **If blocked:** Use fallback mock data (still works!)
3. Connect Gemini API for real reasoning

### Afternoon (1-5):
4. Build frontend form + results display
5. Integrate backend API
6. Test end-to-end workflow

### Evening (5-8):
7. Record 3-minute demo video
8. Polish + hardening

## 🔐 Safety & Recovery

- Human approval required before state changes
- Fallback to mock data if portal is unreachable
- Site memory enables recovery if portal structure changes
- Evidence-backed scores prevent blind automation

## 📊 Judging Rubric Match

| Criterion | How TenderMind Wins |
|-----------|-------------------|
| Live Reliability (30%) | Real Webcmd browser execution + site memory |
| Real-World Usefulness (25%) | Actual government tender search + AI eligibility |
| Technical Depth (20%) | Webcmd learning + recovery strategies |
| Creativity (15%) | Evidence-backed scoring + multi-stage pipeline |
| Demo (10%) | Clean 3-min narrative with live execution |

## 🏆 Hackathon Notes

- **Webcmd is mandatory** - this project centers on it
- **Learn once, run forever** - that's the Webcmd value prop
- **Real portal preferred** - fallback to mock if needed
- **Gemini reasoning** - eligibility analysis with evidence
- **Human-in-loop** - safety first

---

**Built for SLAB Hackathon & AgentForge 2026**
