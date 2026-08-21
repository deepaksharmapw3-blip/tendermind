import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const starterQuery =
  "I run a CCTV installation company in Kolkata. Find government tenders in West Bengal worth at least INR 5 lakh where my company is likely eligible. I have 5 years experience and INR 25 lakh annual turnover.";

function scoreLabel(score) {
  if (score > 80) return "Strong fit";
  if (score > 60) return "Worth reviewing";
  return "Low fit";
}

/* =====================================================
   CONFIDENCE GAUGE — animated arc
===================================================== */

function ConfidenceGauge({ value, size = 100, label }) {
  const clampedValue = Math.max(0, Math.min(100, value || 0));
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedValue / 100) * circumference;

  const color =
    clampedValue >= 80
      ? "var(--gauge-high)"
      : clampedValue >= 60
        ? "var(--gauge-mid)"
        : clampedValue >= 40
          ? "var(--gauge-low)"
          : "var(--gauge-critical)";

  return (
    <div className="confidence-gauge" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="gauge-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
        />
        <circle
          className="gauge-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth="8"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      <div className="gauge-label">
        <strong>{clampedValue}%</strong>
        {label && <span>{label}</span>}
      </div>
    </div>
  );
}

/* =====================================================
   EVIDENCE CARD — single evidence item
===================================================== */

function EvidenceCard({ item, index }) {
  const [expanded, setExpanded] = useState(false);
  const statusIcon =
    item.status === "met"
      ? "✓"
      : item.status === "partially_met"
        ? "◐"
        : item.status === "unmet"
          ? "✗"
          : "?";

  return (
    <div
      className={`evidence-card evidence-card-${item.status}`}
      style={{ "--card-delay": `${index * 60}ms` }}
    >
      <div className="evidence-card-header">
        <span className={`evidence-status-badge status-${item.status}`}>
          {statusIcon}
        </span>

        <div className="evidence-card-info">
          <strong>{item.requirement}</strong>
          <p>{item.finding}</p>
        </div>

        <ConfidenceGauge value={item.confidence} size={56} />
      </div>

      {(item.citation || item.sourceField) && (
        <button
          type="button"
          className="evidence-expand-btn"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Hide citation ▲" : "Show citation ▼"}
        </button>
      )}

      {expanded && (
        <div className="evidence-citation">
          {item.sourceField && (
            <p>
              <span className="citation-label">Source:</span>{" "}
              {item.sourceField}
            </p>
          )}
          {item.citation && (
            <blockquote>{item.citation}</blockquote>
          )}
        </div>
      )}
    </div>
  );
}

/* =====================================================
   RISK MATRIX — visual grid
===================================================== */

function RiskMatrix({ risks }) {
  if (!risks || risks.length === 0) return null;

  const impactOrder = { high: 0, medium: 1, low: 2 };
  const sorted = [...risks].sort(
    (a, b) =>
      (impactOrder[a.impact] ?? 1) - (impactOrder[b.impact] ?? 1)
  );

  return (
    <div className="risk-matrix-section">
      <h3 className="section-title">
        <span className="section-icon">⚠️</span> Risk Matrix
      </h3>

      <div className="risk-grid">
        {sorted.map((risk, i) => (
          <div
            key={risk.id || i}
            className={`risk-cell risk-impact-${risk.impact} risk-likelihood-${risk.likelihood}`}
            style={{ "--risk-delay": `${i * 80}ms` }}
          >
            <div className="risk-cell-header">
              <span className={`risk-badge risk-${risk.impact}`}>
                {risk.impact}
              </span>
              <span className={`risk-likelihood-badge risk-lh-${risk.likelihood}`}>
                {risk.likelihood} likelihood
              </span>
            </div>

            <h4>{risk.title}</h4>
            <p>{risk.description}</p>

            {risk.mitigation && (
              <div className="risk-mitigation">
                <span>💡</span> {risk.mitigation}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   REASONING TIMELINE — stage-by-stage
===================================================== */

function ReasoningTimeline({ chain }) {
  const [expandedStage, setExpandedStage] = useState(null);

  if (!chain || chain.length === 0) return null;

  return (
    <div className="reasoning-timeline">
      <h3 className="section-title">
        <span className="section-icon">🧠</span> Reasoning Chain
      </h3>

      <div className="timeline-track">
        {chain.map((step, i) => (
          <div
            key={step.stage}
            className="timeline-stage"
            style={{ "--stage-delay": `${i * 150}ms` }}
          >
            <div className="timeline-connector">
              <div className="timeline-dot" />
              {i < chain.length - 1 && <div className="timeline-line" />}
            </div>

            <div className="timeline-content">
              <div className="timeline-header">
                <span className="stage-number">Stage {step.stage}</span>
                <h4>{step.title}</h4>
              </div>

              <p className="timeline-summary">{step.summary}</p>

              {step.thinking && (
                <>
                  <button
                    type="button"
                    className="thinking-toggle"
                    onClick={() =>
                      setExpandedStage(
                        expandedStage === i ? null : i
                      )
                    }
                  >
                    {expandedStage === i
                      ? "Hide thinking ▲"
                      : "View Gemini's thinking ▼"}
                  </button>

                  {expandedStage === i && (
                    <div className="thinking-trace">
                      <pre>{step.thinking}</pre>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =====================================================
   REASONING PANEL — full deep analysis view
===================================================== */

function ReasoningPanel({ tender, searchData, onClose }) {
  const [analysisState, setAnalysisState] = useState({
    status: "idle",
    data: null,
    error: ""
  });

  async function runDeepAnalysis() {
    setAnalysisState({ status: "loading", data: null, error: "" });

    try {
      const companyProfile = searchData?.requirements || {
        businessType: "CCTV installation",
        experience: 5,
        turnover: "₹25 lakh",
        location: "Kolkata"
      };

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tender, companyProfile })
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(data.error || "Deep analysis failed.");
      }

      setAnalysisState({ status: "success", data, error: "" });
    } catch (error) {
      setAnalysisState({
        status: "error",
        data: null,
        error: error?.message || "Something went wrong."
      });
    }
  }

  const { status, data } = analysisState;

  return (
    <div className="reasoning-panel-overlay" onClick={onClose}>
      <div
        className="reasoning-panel"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="reasoning-panel-header">
          <div>
            <p className="eyebrow">ADVANCED GEMINI REASONING</p>
            <h2>Deep Analysis</h2>
          </div>
          <button
            type="button"
            className="reasoning-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* ── Tender Summary ── */}
        <div className="reasoning-tender-summary">
          <div>
            <h3>{tender?.title || "Tender"}</h3>
            <p className="organization">
              {tender?.organization || "Government organization"}
            </p>
          </div>
          {tender?.value && (
            <span className="tender-value-badge">{tender.value}</span>
          )}
        </div>

        {/* ── Start Analysis / Loading ── */}
        {status === "idle" && (
          <div className="reasoning-start">
            <div className="reasoning-start-icon">🧠</div>
            <h3>Multi-Stage AI Reasoning</h3>
            <p>
              Run a 4-stage deep analysis using Gemini's extended
              thinking. This decomposes requirements, matches evidence
              with confidence scores, quantifies risks, and synthesizes
              a strategic recommendation.
            </p>
            <div className="reasoning-stages-preview">
              <span>① Decompose</span>
              <span className="stage-arrow">→</span>
              <span>② Evidence</span>
              <span className="stage-arrow">→</span>
              <span>③ Risks</span>
              <span className="stage-arrow">→</span>
              <span>④ Synthesize</span>
            </div>
            <button
              type="button"
              className="action-primary run-analysis-btn"
              onClick={runDeepAnalysis}
            >
              Run Deep Analysis →
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="reasoning-loading">
            <div className="reasoning-loading-animation">
              <div className="pulse-ring" />
              <div className="pulse-ring ring-2" />
              <div className="pulse-ring ring-3" />
              <span className="brain-icon">🧠</span>
            </div>
            <h3>Gemini is thinking...</h3>
            <p>
              Running 4-stage reasoning pipeline with extended thinking
              tokens. This typically takes 15-30 seconds.
            </p>
            <div className="loading-stages">
              <div className="loading-stage active">
                <span className="loading-dot" />
                Decomposing requirements
              </div>
              <div className="loading-stage">
                <span className="loading-dot" />
                Matching evidence
              </div>
              <div className="loading-stage">
                <span className="loading-dot" />
                Quantifying risks
              </div>
              <div className="loading-stage">
                <span className="loading-dot" />
                Synthesizing recommendation
              </div>
            </div>
          </div>
        )}

        {status === "error" && (
          <div className="reasoning-error">
            <p className="error-message" role="alert">
              {analysisState.error}
            </p>
            <button
              type="button"
              className="action-primary"
              onClick={runDeepAnalysis}
            >
              Retry Analysis →
            </button>
          </div>
        )}

        {/* ── Results ── */}
        {status === "success" && data && (
          <div className="reasoning-results">
            {/* Score + Confidence */}
            <div className="reasoning-score-row">
              <ConfidenceGauge
                value={data.matchScore}
                size={120}
                label="Match"
              />
              <ConfidenceGauge
                value={data.overallConfidence}
                size={120}
                label="Confidence"
              />

              <div className="reasoning-verdict">
                <span
                  className={`verdict-status status-${data.eligibilityStatus}`}
                >
                  {data.eligibilityStatus?.replaceAll("_", " ")}
                </span>
                <p className="verdict-recommendation">
                  {data.recommendation}
                </p>
              </div>
            </div>

            {/* Synthesis Narrative */}
            {data.synthesisNarrative && (
              <div className="synthesis-narrative">
                <h3 className="section-title">
                  <span className="section-icon">📝</span> Synthesis
                </h3>
                <div className="narrative-text">
                  {data.synthesisNarrative}
                </div>
              </div>
            )}

            {/* Key Strengths + Critical Gaps */}
            {(data.keyStrengths?.length > 0 ||
              data.criticalGaps?.length > 0) && (
              <div className="strengths-gaps-row">
                {data.keyStrengths?.length > 0 && (
                  <div className="strengths-card">
                    <h4>
                      <span>💪</span> Key Strengths
                    </h4>
                    <ul>
                      {data.keyStrengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {data.criticalGaps?.length > 0 && (
                  <div className="gaps-card">
                    <h4>
                      <span>🔴</span> Critical Gaps
                    </h4>
                    <ul>
                      {data.criticalGaps.map((g, i) => (
                        <li key={i}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Evidence Grid */}
            {data.evidenceItems?.length > 0 && (
              <div className="evidence-grid-section">
                <h3 className="section-title">
                  <span className="section-icon">📋</span> Evidence
                  Assessment
                  <span className="evidence-count">
                    {data.evidenceItems.length} items
                  </span>
                </h3>
                <div className="evidence-grid">
                  {data.evidenceItems.map((item, i) => (
                    <EvidenceCard key={i} item={item} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Risk Matrix */}
            <RiskMatrix risks={data.riskMatrix} />

            {/* Reasoning Chain Timeline */}
            <ReasoningTimeline chain={data.reasoningChain} />

            {/* Strategic Insights */}
            {data.strategicInsights?.length > 0 && (
              <div className="strategic-insights">
                <h3 className="section-title">
                  <span className="section-icon">🎯</span> Strategic
                  Insights
                </h3>
                <ol className="insights-list">
                  {data.strategicInsights.map((insight, i) => (
                    <li key={i}>{insight}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Analysis Metadata */}
            <div className="analysis-metadata">
              <span>
                Model: <strong>{data.stages?.[0]?.model || "gemini-2.5-flash"}</strong>
              </span>
              <span>
                Latency: <strong>{data.totalLatencyMs ? `${(data.totalLatencyMs / 1000).toFixed(1)}s` : "—"}</strong>
              </span>
              <span>
                Stages: <strong>{data.stages?.length || 0}</strong>
              </span>
              <span>
                Source: <strong>{data.analysisSource}</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* =====================================================
   BID DRAFT SCREEN
===================================================== */

function BidDraftScreen({ tender, onBack }) {
  function handlePrint() {
    window.print();
  }

  return (
    <main className="page-shell">
      <nav className="nav-bar">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to preparation
        </button>

        <span className="nav-note">
          TenderMind · Bid Draft
        </span>
      </nav>

      <section className="bid-page">
        <div className="bid-page-header">
          <p className="eyebrow">GENERATED BID DRAFT</p>

          <h1>Draft Bid Proposal</h1>

          <p className="bid-subtitle">
            Review this draft and verify all information against the
            official tender document before submission.
          </p>
        </div>

        <div className="bid-tender-card">
          <div>
            <p className="action-label">SELECTED TENDER</p>

            <h2>
              {tender?.title || "Government Tender"}
            </h2>

            <p className="organization">
              {tender?.organization || "Government organization"}
            </p>
          </div>

          <div className="action-score-box">
            <strong>
              {Number(tender?.matchScore) || 0}%
            </strong>

            <span>MATCH</span>
          </div>
        </div>

        <section className="preparation-card">
          <div className="preparation-heading">
            <div>
              <p className="eyebrow">BID DOCUMENT</p>
              <h2>Bid proposal draft</h2>
            </div>
          </div>

          <div className="action-section">
            <h3>1. Executive Summary</h3>

            <p>
              We propose to execute the work described in the official
              tender document in accordance with the specified technical
              requirements, quality standards, project schedule and
              applicable terms and conditions.
            </p>
          </div>

          <div className="action-section">
            <h3>2. Tender Information</h3>

            <p>
              <strong>Tender:</strong>{" "}
              {tender?.title || "Not specified"}
            </p>

            <p>
              <strong>Organization:</strong>{" "}
              {tender?.organization || "Not specified"}
            </p>

            <p>
              <strong>Estimated Value:</strong>{" "}
              {tender?.value || "Not listed"}
            </p>
          </div>

          <div className="action-section">
            <h3>3. Company Profile</h3>

            <p>
              The bidder is engaged in CCTV installation and security
              system related services and will provide the required
              technical manpower, equipment and project support as
              specified in the tender.
            </p>
          </div>

          <div className="action-section">
            <h3>4. Documents Checklist</h3>

            <ul>
              <li>Company Registration Certificate</li>
              <li>PAN Card</li>
              <li>GST Registration Certificate</li>
              <li>Experience Certificates</li>
              <li>Turnover / Financial Statements</li>
              <li>Bank Details / Cancelled Cheque</li>
              <li>Technical Qualification Documents</li>
              <li>Any tender-specific declarations</li>
            </ul>
          </div>

          <div className="action-section">
            <h3>5. Technical Proposal</h3>

            <p>
              The technical proposal should include the proposed CCTV
              equipment, installation methodology, manpower deployment,
              testing and commissioning procedure, warranty and
              maintenance support as required by the tender.
            </p>
          </div>

          <div className="action-section">
            <h3>6. Financial Proposal</h3>

            <p>
              Complete the official BOQ and financial schedule using the
              quantities, specifications, taxes and commercial conditions
              stated in the tender document. Do not use estimated pricing
              from this draft as the final bid price.
            </p>
          </div>

          <div className="bid-warning">
            <span>!</span>

            <p>
              This is an AI-assisted draft. Verify every requirement,
              document, quantity, price and deadline using the official
              tender document before submitting.
            </p>
          </div>

          <div className="preparation-footer">
            <button
              type="button"
              className="action-primary"
              onClick={handlePrint}
            >
              Print / Save Draft →
            </button>

            <button
              type="button"
              className="action-close"
              onClick={onBack}
            >
              Back
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

/* =====================================================
   BID PREPARATION SCREEN
===================================================== */

function BidPreparation({
  tender,
  onBack,
  onGenerateDraft
}) {
  const [activeStep, setActiveStep] = useState(null);
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Review the tender document",
      text:
        "Open and carefully review the official tender document, scope of work, deadlines and submission instructions."
    },
    {
      title: "Verify eligibility",
      text:
        "Check experience, turnover, technical qualifications, registrations and all eligibility requirements."
    },
    {
      title: "Prepare company documents",
      text:
        "Keep company registration, GST, PAN, experience certificates, turnover documents and other required documents ready."
    },
    {
      title: "Prepare technical and financial bid",
      text:
        "Prepare the technical proposal, BOQ/pricing and financial bid according to the official tender format."
    },
    {
      title: "Submit before deadline",
      text:
        "Upload all required documents on the official portal and submit the bid before the stated deadline."
    }
  ];

  function completePreparation() {
    setCompleted(true);
  }

  return (
    <main className="page-shell">
      <nav className="nav-bar">
        <button
          type="button"
          className="back-button"
          onClick={onBack}
        >
          ← Back to results
        </button>

        <span className="nav-note">
          TenderMind · Bid Preparation
        </span>
      </nav>

      <section className="bid-page">
        <div className="bid-page-header">
          <p className="eyebrow">BID PREPARATION</p>

          <h1>Prepare your bid</h1>

          <p className="bid-subtitle">
            Follow these steps to prepare a complete and compliant tender
            submission.
          </p>
        </div>

        <div className="bid-tender-card">
          <div>
            <p className="action-label">SELECTED TENDER</p>

            <h2>
              {tender?.title || "Government Tender"}
            </h2>

            <p className="organization">
              {tender?.organization || "Government organization"}
            </p>
          </div>

          <div className="action-score-box">
            <strong>
              {Number(tender?.matchScore) || 0}%
            </strong>

            <span>MATCH</span>
          </div>
        </div>

        <section className="preparation-card">
          <div className="preparation-heading">
            <div>
              <p className="eyebrow">YOUR NEXT MOVES</p>

              <h2>Bid preparation checklist</h2>
            </div>

            <span className="step-count">
              {steps.length} steps
            </span>
          </div>

          <div className="preparation-steps">
            {steps.map((step, index) => {
              const isActive = activeStep === index;

              return (
                <div
                  className={`preparation-step ${
                    isActive ? "step-active" : ""
                  }`}
                  key={step.title}
                >
                  <button
                    type="button"
                    className="step-button"
                    onClick={() =>
                      setActiveStep(
                        isActive ? null : index
                      )
                    }
                  >
                    <span className="step-number">
                      {index + 1}
                    </span>

                    <span className="step-content">
                      <strong>{step.title}</strong>

                      {isActive && (
                        <span className="step-description">
                          {step.text}
                        </span>
                      )}
                    </span>

                    <span className="step-arrow">
                      {isActive ? "−" : "+"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>

          <div className="bid-warning">
            <span>!</span>

            <p>
              This is an AI-assisted preparation guide. Always verify the
              official tender document and eligibility requirements before
              submitting a bid.
            </p>
          </div>

          {!completed ? (
            <div className="preparation-footer">
              <button
                type="button"
                className="action-primary"
                onClick={completePreparation}
              >
                Complete Bid Preparation →
              </button>

              <button
                type="button"
                className="action-close"
                onClick={onBack}
              >
                Back
              </button>
            </div>
          ) : (
            <div className="preparation-footer">
              <div>
                <strong>
                  ✓ Bid preparation completed
                </strong>

                <p>
                  Your preparation checklist is complete.
                </p>
              </div>

              <button
                type="button"
                className="action-primary"
                onClick={onGenerateDraft}
              >
                Generate Bid Draft →
              </button>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

/* =====================================================
   TENDER CARD
===================================================== */

function TenderCard({
  tender,
  index,
  onPrepare,
  onDeepAnalysis
}) {
  const score =
    Number(tender?.matchScore) || 0;

  return (
    <article
      className="tender-card"
      style={{
        "--delay": `${index * 90}ms`
      }}
    >
      <div className="card-topline">
        <span
          className={`status status-${
            tender?.eligibilityStatus || "unknown"
          }`}
        >
          {tender?.eligibilityStatus?.replaceAll(
            "_",
            " "
          ) || "Needs review"}
        </span>

        <span className="score">
          {score}% match
        </span>
      </div>

      <h3>
        {tender?.title || "Untitled tender"}
      </h3>

      <p className="organization">
        {tender?.organization ||
          "Government organization"}
      </p>

      <div className="metadata">
        <span>
          <b>Value</b>
          {tender?.value || "Not listed"}
        </span>

        <span>
          <b>Signal</b>
          {scoreLabel(score)}
        </span>
      </div>

      <p className="recommendation">
        {tender?.recommendation ||
          "Review the tender documents before applying."}
      </p>

      {tender?.reasoning && (
        <div className="reasoning-section">
          <strong>Analysis:</strong> {tender.reasoning}
        </div>
      )}

      {tender?.evidence && tender.evidence.length > 0 && (
        <div className="evidence-section">
          <h4>📋 Evidence</h4>
          <ul className="evidence-list">
            {tender.evidence.map((item, i) => (
              <li key={i} className={`evidence-item evidence-${item.status}`}>
                <span className="evidence-icon">
                  {item.status === "met" ? "✓" : item.status === "unmet" ? "✗" : "?"}
                </span>
                <div className="evidence-content">
                  <strong>{item.requirement}:</strong> {item.finding}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {tender?.risks && tender.risks.length > 0 && (
        <div className="risks-section">
          <h4>⚠️ Risks to Consider</h4>
          <ul className="risks-list">
            {tender.risks.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="card-actions">
        <button
          type="button"
          className="deep-analysis-button"
          onClick={() => onDeepAnalysis(tender)}
        >
          <span>🧠</span>
          <span>Deep Analysis</span>
        </button>

        <button
          type="button"
          className="view-action-button"
          onClick={() => onPrepare(tender)}
        >
          <span>Start Bid Preparation</span>
          <span>→</span>
        </button>
      </div>
    </article>
  );
}

/* =====================================================
   MAIN APP
===================================================== */

function App() {
  const [query, setQuery] = useState("");

  const [searchState, setSearchState] =
    useState({
      status: "idle",
      data: null,
      error: ""
    });

  const [selectedTender, setSelectedTender] =
    useState(null);

  const [showDraft, setShowDraft] =
    useState(false);

  const [deepAnalysisTender, setDeepAnalysisTender] =
    useState(null);

  /* -----------------------------------------------
     OPEN DEEP ANALYSIS
  ------------------------------------------------ */

  function openDeepAnalysis(tender) {
    setDeepAnalysisTender(tender);
  }

  function closeDeepAnalysis() {
    setDeepAnalysisTender(null);
  }

  /* -----------------------------------------------
     OPEN BID PREPARATION
  ------------------------------------------------ */

  function openBidPreparation(tender) {
    setSelectedTender(tender);
    setShowDraft(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* -----------------------------------------------
     BACK TO RESULTS
  ------------------------------------------------ */

  function closeBidPreparation() {
    setSelectedTender(null);
    setShowDraft(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* -----------------------------------------------
     OPEN BID DRAFT
  ------------------------------------------------ */

  function openDraftScreen() {
    setShowDraft(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* -----------------------------------------------
     BACK FROM BID DRAFT
  ------------------------------------------------ */

  function closeDraftScreen() {
    setShowDraft(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* -----------------------------------------------
     SEARCH
  ------------------------------------------------ */

  async function searchTenders(event) {
    event.preventDefault();

    const trimmedQuery =
      query.trim();

    if (!trimmedQuery) {
      setSearchState({
        status: "error",
        data: null,
        error:
          "Tell us what your business is looking for first."
      });

      return;
    }

    setSearchState({
      status: "loading",
      data: null,
      error: ""
    });

    try {
      const response =
        await fetch("/api/search", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body: JSON.stringify({
            query: trimmedQuery
          })
        });

      const data =
        await response.json();

      if (
        !response.ok ||
        data.status === "error"
      ) {
        throw new Error(
          data.error ||
            "Search failed."
        );
      }

      setSearchState({
        status: "success",
        data,
        error: ""
      });
    } catch (error) {
      setSearchState({
        status: "error",
        data: null,
        error:
          error?.message ||
          "Something went wrong."
      });
    }
  }

  /* -----------------------------------------------
     USE EXAMPLE
  ------------------------------------------------ */

  function useStarterQuery() {
    setQuery(starterQuery);

    setSearchState({
      status: "idle",
      data: null,
      error: ""
    });
  }

  /* -----------------------------------------------
     BID DRAFT SCREEN
  ------------------------------------------------ */

  if (
    showDraft &&
    selectedTender
  ) {
    return (
      <BidDraftScreen
        tender={selectedTender}
        onBack={closeDraftScreen}
      />
    );
  }

  /* -----------------------------------------------
     BID PREPARATION SCREEN
  ------------------------------------------------ */

  if (selectedTender) {
    return (
      <BidPreparation
        tender={selectedTender}
        onBack={closeBidPreparation}
        onGenerateDraft={
          openDraftScreen
        }
      />
    );
  }

  const isLoading =
    searchState.status ===
    "loading";

  const results =
    searchState.data?.results ||
    [];

  /* -----------------------------------------------
     SEARCH PAGE
  ------------------------------------------------ */

  return (
    <main className="page-shell">
      {/* Deep Analysis Panel (overlay) */}
      {deepAnalysisTender && (
        <ReasoningPanel
          tender={deepAnalysisTender}
          searchData={searchState.data}
          onClose={closeDeepAnalysis}
        />
      )}

      <nav className="nav-bar">
        <a
          className="brand"
          href="/"
          aria-label="TenderMind home"
        >
          <span className="brand-mark">
            T
          </span>

          TenderMind
        </a>

        <span className="nav-note">
          Government tender intelligence
        </span>
      </nav>

      <section className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">
            A sharper way to bid
          </p>

          <h1>
            Find the tenders your business
            can actually win.
          </h1>

          <p className="lede">
            Describe your capabilities,
            location, and constraints.
            TenderMind searches the portal,
            then ranks opportunities against
            your real-world eligibility.
          </p>

          <div className="proof-row">
            <span>
              <i />
              Webcmd connected
            </span>

            <span>
              <i />
              Eligibility scored
            </span>

            <span>
              <i />
              Deep reasoning
            </span>
          </div>
        </div>

        <form
          className="search-panel"
          onSubmit={searchTenders}
        >
          <div className="panel-heading">
            <span className="panel-number">
              01
            </span>

            <div>
              <p className="eyebrow">
                Your brief
              </p>

              <h2>
                What are you looking for?
              </h2>
            </div>
          </div>

          <label htmlFor="query">
            Business profile and tender
            requirements
          </label>

          <textarea
            id="query"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Example: I install CCTV systems in Kolkata..."
            disabled={isLoading}
          />

          <div className="form-footer">
            <button
              type="button"
              className="example-button"
              onClick={
                useStarterQuery
              }
            >
              Use example
            </button>

            <button
              type="submit"
              className="submit-button"
              disabled={isLoading}
            >
              {isLoading
                ? "Searching..."
                : "Find matches"}

              <span aria-hidden="true">
                →
              </span>
            </button>
          </div>

          {searchState.status ===
            "error" && (
            <p
              className="error-message"
              role="alert"
            >
              {searchState.error}
            </p>
          )}
        </form>
      </section>

      {searchState.status ===
        "loading" && (
        <section
          className="loading-state"
          aria-live="polite"
        >
          <span className="spinner" />

          Reading the tender landscape...
        </section>
      )}

      {searchState.status ===
        "success" && (
        <section className="results-section">
          <div className="results-heading">
            <div>
              <p className="eyebrow">
                Search results
              </p>

              <h2>
                {results.length
                  ? "Opportunities worth your attention"
                  : "No close matches yet"}
              </h2>
            </div>

            <span className="result-count">
              {searchState.data
                ?.tenders_found ||
                results.length}{" "}
              found
            </span>
          </div>

          {results.length > 0 ? (
            <div className="results-grid">
              {results.map(
                (
                  tender,
                  index
                ) => (
                  <TenderCard
                    key={
                      tender?.tender_id ||
                      index
                    }
                    tender={tender}
                    index={index}
                    onPrepare={
                      openBidPreparation
                    }
                    onDeepAnalysis={
                      openDeepAnalysis
                    }
                  />
                )
              )}
            </div>
          ) : (
            <p className="empty-state">
              Try widening the
              location, value, or
              capability in your brief.
            </p>
          )}
        </section>
      )}
    </main>
  );
}

/* =====================================================
   START REACT
===================================================== */

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);