import React from 'react';

const TenderDetailModal = ({ tender, onClose, onGenerateBid }) => {
  if (!tender) return null;

  return (
    <div style={modalStyles.overlay}>
      <div style={modalStyles.modal}>
        {/* Header */}
        <div style={modalStyles.header}>
          <h2>{tender.title}</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>&times;</button>
        </div>

        {/* Content Body */}
        <div style={modalStyles.body}>
          <p><strong>Department:</strong> {tender.department || "Government of West Bengal"}</p>
          <p><strong>Estimated Value:</strong> ₹{tender.value}</p>
          <p><strong>Match Score:</strong> <span style={{ color: '#4CAF50' }}>{tender.matchScore || "85%"}</span></p>

          <hr style={{ margin: '15px 0', borderColor: '#333' }} />

          {/* AI Match Analysis */}
          <h4>AI Match Analysis</h4>
          <ul style={modalStyles.list}>
            <li>✅ Turnover Requirement Met (≥ ₹25 Lakhs)</li>
            <li>✅ Experience Criteria Met (5 Years in CCTV Installation)</li>
            <li>⚠️ Notice: EMD submission deadline is within 3 days.</li>
          </ul>

          {/* Key Requirements */}
          <h4 style={{ marginTop: '15px' }}>Key Requirements</h4>
          <ul style={modalStyles.list}>
            <li>Valid Trade License in West Bengal</li>
            <li>GST Registration & Past 3 Years IT Returns</li>
            <li>OEM Authorization Certificate for Cameras</li>
          </ul>
        </div>

        {/* Footer Actions */}
        <div style={modalStyles.footer}>
          <button onClick={onClose} style={modalStyles.secondaryBtn}>Close</button>
          <button 
            onClick={() => onGenerateBid(tender)} 
            style={modalStyles.primaryBtn}
          >
            ✨ Generate Draft Bid (AI)
          </button>
        </div>
      </div>
    </div>
  );
};

// Inline Styles for Quick Integration
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#121212',
    color: '#fff',
    padding: '24px',
    borderRadius: '8px',
    width: '90%',
    maxWidth: '550px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
    border: '1px solid #333'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid #333',
    paddingBottom: '10px'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '24px',
    cursor: 'pointer'
  },
  body: {
    marginTop: '15px',
    fontSize: '14px',
    lineHeight: '1.6'
  },
  list: {
    paddingLeft: '20px',
    color: '#ccc'
  },
  footer: {
    marginTop: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px'
  },
  primaryBtn: {
    backgroundColor: '#00c853',
    color: '#000',
    border: 'none',
    padding: '10px 16px',
    fontWeight: 'bold',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  secondaryBtn: {
    backgroundColor: 'transparent',
    color: '#ccc',
    border: '1px solid #555',
    padding: '10px 16px',
    borderRadius: '4px',
    cursor: 'pointer'
  }
};

export default TenderDetailModal;