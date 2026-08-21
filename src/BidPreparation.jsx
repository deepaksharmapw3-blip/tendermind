import React, { useState } from "react";

function BidPreparation({ tender, onClose }) {
  const [companyName, setCompanyName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [generating, setGenerating] = useState(false);

  const handleGenerate = () => {
    if (!companyName || !contactPerson || !email) {
      alert("Please fill Company Name, Contact Person and Email.");
      return;
    }

    setGenerating(true);

    setTimeout(() => {
      setGenerating(false);

      alert(
        `Bid proposal generated successfully for:\n${tender?.title || "Selected Tender"}`
      );
    }, 1500);
  };

  if (!tender) return null;

  return (
    <div className="bid-modal-overlay">
      <div className="bid-modal">

        <div className="bid-modal-header">
          <div>
            <p className="eyebrow">BID PREPARATION</p>
            <h2>Prepare Your Bid</h2>
          </div>

          <button
            className="bid-close"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="bid-tender-info">
          <h3>{tender.title}</h3>

          <p>
            <strong>Organization:</strong>{" "}
            {tender.organization || "Government Organization"}
          </p>

          <p>
            <strong>Estimated Value:</strong>{" "}
            ₹{tender.value || "Not listed"}
          </p>
        </div>

        <div className="bid-section">
          <p className="action-label">COMPANY INFORMATION</p>

          <div className="bid-form-grid">

            <div>
              <label>Company Name *</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>

            <div>
              <label>Contact Person *</label>
              <input
                type="text"
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="Enter contact person"
              />
            </div>

            <div>
              <label>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="company@example.com"
              />
            </div>

            <div>
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </div>

          </div>
        </div>

        <div className="bid-section">

          <p className="action-label">REQUIRED DOCUMENTS</p>

          <div className="document-list">

            <label>
              <input type="checkbox" />
              Company Registration Certificate
            </label>

            <label>
              <input type="checkbox" />
              GST Certificate
            </label>

            <label>
              <input type="checkbox" />
              PAN Card
            </label>

            <label>
              <input type="checkbox" />
              Experience Certificate
            </label>

            <label>
              <input type="checkbox" />
              Turnover / Financial Documents
            </label>

          </div>

        </div>

        <div className="bid-section">

          <p className="action-label">BID PREPARATION</p>

          <div className="bid-features">

            <div>
              <span>✓</span>
              Technical proposal
            </div>

            <div>
              <span>✓</span>
              Financial bid structure
            </div>

            <div>
              <span>✓</span>
              Eligibility summary
            </div>

            <div>
              <span>✓</span>
              Document checklist
            </div>

          </div>

        </div>

        <div className="bid-footer">

          <button
            className="action-close"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="action-primary"
            onClick={handleGenerate}
            disabled={generating}
          >
            {generating
              ? "Generating..."
              : "Generate Bid Proposal →"}
          </button>

        </div>

      </div>
    </div>
  );
}

export default BidPreparation;