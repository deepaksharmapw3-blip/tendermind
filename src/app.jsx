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

/* =========================
   BID PREPARATION SCREEN
========================= */

function BidPreparationScreen({ tender, onBack }) {
  if (!tender) return null;

  return (
    <main className="page-shell bid-preparation-page">

      <nav className="nav-bar">
        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            onBack();
          }}
        >
          <span className="brand-mark">T</span> TenderMind
        </a>

        <span className="nav-note">
          Bid preparation workspace
        </span>
      </nav>

      <section className="bid-header">

        <button
          className="back-button"
          onClick={onBack}
        >
          ← Back to opportunities
        </button>

        <p className="eyebrow">Bid preparation</p>

        <h1>
          Prepare your bid
        </h1>

        <p className="lede">
          Build your submission step by step for this tender.
        </p>
      </section>

      <section className="bid-tender-summary">

        <div>
          <p className="action-label">Selected tender</p>

          <h2>
            {tender.title || "Untitled tender"}
          </h2>

          <p className="organization">
            {tender.organization || "Government organization"}
          </p>
        </div>

        <div className="action-score-box">
          <strong>
            {Number(tender.matchScore) || 0}%
          </strong>
          <span>MATCH</span>
        </div>

      </section>

      <section className="bid-workspace">

        <div className="bid-step">
          <div className="action-step-number">1</div>

          <div>
            <h3>Company details</h3>

            <p>
              Add your company registration, GST, PAN,
              experience and financial details.
            </p>

            <button className="secondary-action">
              Add company details →
            </button>
          </div>
        </div>

        <div className="bid-step">
          <div className="action-step-number">2</div>

          <div>
            <h3>Technical bid</h3>

            <p>
              Prepare the technical response according to
              the tender requirements.
            </p>

            <button className="secondary-action">
              Prepare technical bid →
            </button>
          </div>
        </div>

        <div className="bid-step">
          <div className="action-step-number">3</div>

          <div>
            <h3>Financial bid</h3>

            <p>
              Enter your commercial quote and review the
              financial requirements.
            </p>

            <button className="secondary-action">
              Prepare financial bid →
            </button>
          </div>
        </div>

        <div className="bid-step">
          <div className="action-step-number">4</div>

          <div>
            <h3>Required documents</h3>

            <p>
              Upload and verify all documents required
              for submission.
            </p>

            <button className="secondary-action">
              Manage documents →
            </button>
          </div>
        </div>

        <div className="bid-step">
          <div className="action-step-number">5</div>

          <div>
            <h3>Final review</h3>

            <p>
              Review the complete bid before submitting
              it on the official tender portal.
            </p>

            <button className="action-primary">
              Review complete bid →
            </button>
          </div>
        </div>

      </section>

      <div className="bid-warning">
        <strong>Important:</strong> This is an AI-assisted
        preparation workspace. Always verify the official
        tender document and requirements before submission.
      </div>

    </main>
  );
}

/* =========================
   TENDER CARD
========================= */

function TenderCard({ tender, index, onPrepare }) {

  const score = Number(tender.matchScore) || 0;

  return (
    <article
      className="tender-card"
      style={{ "--delay": `${index * 90}ms` }}
    >

      <div className="card-topline">

        <span
          className={`status status-${
            tender.eligibilityStatus || "unknown"
          }`}
        >
          {tender.eligibilityStatus?.replaceAll("_", " ")
            || "Needs review"}
        </span>

        <span className="score">
          {score}% match
        </span>

      </div>

      <h3>
        {tender.title || "Untitled tender"}
      </h3>

      <p className="organization">
        {tender.organization || "Government organization"}
      </p>

      <div className="metadata">

        <span>
          <b>Value</b>
          {tender.value || "Not listed"}
        </span>

        <span>
          <b>Signal</b>
          {scoreLabel(score)}
        </span>

      </div>

      <p className="recommendation">
        {tender.recommendation ||
          "Review the tender documents before applying."}
      </p>

      {/* IMPORTANT BUTTON */}
      <button
        className="view-action-button"
        onClick={() => onPrepare(tender)}
      >
        <span>Start Bid Preparation</span>
        <span>→</span>
      </button>

    </article>
  );
}

/* =========================
   MAIN APP
========================= */

function App() {

  const [query, setQuery] = useState("");

  const [searchState, setSearchState] = useState({
    status: "idle",
    data: null,
    error: ""
  });

  const [selectedTender, setSelectedTender] = useState(null);

  /* SEARCH */

  async function searchTenders(event) {

    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {

      setSearchState({
        status: "error",
        data: null,
        error: "Tell us what your business is looking for first."
      });

      return;
    }

    setSearchState({
      status: "loading",
      data: null,
      error: ""
    });

    try {

      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          query: trimmedQuery
        })
      });

      const data = await response.json();

      if (!response.ok || data.status === "error") {
        throw new Error(
          data.error || "Search failed."
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
        error: error.message
      });

    }
  }

  /* EXAMPLE */

  function useStarterQuery() {

    setQuery(starterQuery);

    setSearchState({
      status: "idle",
      data: null,
      error: ""
    });
  }

  /* OPEN BID PREPARATION */

  function startBidPreparation(tender) {

    // NO ALERT HERE
    setSelectedTender(tender);

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  /* IF BID SCREEN IS OPEN */

  if (selectedTender) {

    return (
      <BidPreparationScreen
        tender={selectedTender}
        onBack={() => setSelectedTender(null)}
      />
    );
  }

  const isLoading =
    searchState.status === "loading";

  const results =
    searchState.data?.results || [];

  return (
    <main className="page-shell">

      <nav className="nav-bar">

        <a className="brand" href="/">
          <span className="brand-mark">T</span>
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
            Find the tenders your business can actually win.
          </h1>

          <p className="lede">
            Describe your capabilities, location, and
            constraints. TenderMind searches the portal,
            then ranks opportunities against your
            real-world eligibility.
          </p>

          <div className="proof-row">

            <span>
              <i /> Webcmd connected
            </span>

            <span>
              <i /> Eligibility scored
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
            Business profile and tender requirements
          </label>

          <textarea
            id="query"
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Example: I install CCTV systems in Kolkata..."
            disabled={isLoading}
          />

          <div className="form-footer">

            <button
              className="example-button"
              type="button"
              onClick={useStarterQuery}
            >
              Use example
            </button>

            <button
              className="submit-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading
                ? "Searching..."
                : "Find matches"}

              <span aria-hidden="true">
                -&gt;
              </span>

            </button>

          </div>

          {searchState.status === "error" && (
            <p
              className="error-message"
              role="alert"
            >
              {searchState.error}
            </p>
          )}

        </form>

      </section>

      {searchState.status === "loading" && (

        <section
          className="loading-state"
          aria-live="polite"
        >
          <span className="spinner" />
          Reading the tender landscape...
        </section>

      )}

      {searchState.status === "success" && (

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
              {searchState.data.tenders_found} found
            </span>

          </div>

          {results.length ? (

            <div className="results-grid">

              {results.map((tender, index) => (

                <TenderCard
                  key={
                    tender.tender_id || index
                  }
                  tender={tender}
                  index={index}
                  onPrepare={startBidPreparation}
                />

              ))}

            </div>

          ) : (

            <p className="empty-state">
              Try widening the location, value,
              or capability in your brief.
            </p>

          )}

        </section>

      )}

    </main>
  );
}

createRoot(
  document.getElementById("root")
).render(
  <StrictMode>
    <App />
  </StrictMode>
);