class EligibilityAnalyzer {
  constructor(geminiClient) {
    this.gemini = geminiClient;
  }

  async analyze(tender, requirements) {
    try {
      const matchScore = this.calculateScore(tender, requirements);
      return {
        tender_id: tender.id,
        title: tender.title,
        organization: tender.organization,
        value: tender.value,
        matchScore: matchScore,
        eligibilityStatus: matchScore > 80 ? "eligible" : matchScore > 60 ? "possibly_eligible" : "not_eligible",
        recommendation: this.getRecommendation(matchScore),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        tender_id: tender.id,
        matchScore: 0,
        error: error.message
      };
    }
  }

  calculateScore(tender, requirements) {
    let score = 50;
    
    if (requirements.experience && requirements.experience >= 5) score += 20;
    if (requirements.turnover && requirements.turnover.includes('25')) score += 15;
    if (requirements.location && tender.location.toLowerCase().includes('kolkata')) score += 15;
    
    return Math.min(score, 100);
  }

  getRecommendation(score) {
    if (score > 85) return "Highly recommended. Apply immediately.";
    if (score > 70) return "Good match. Review requirements carefully.";
    if (score > 50) return "Possible match. Check eligibility criteria.";
    return "Not recommended.";
  }
}

module.exports = EligibilityAnalyzer;
