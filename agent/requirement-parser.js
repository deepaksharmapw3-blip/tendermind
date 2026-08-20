class RequirementParser {
  parse(userInput) {
    return {
      businessType: this.extract(userInput, /(?:company|business|firm)(?:\s+(?:in|for))?\s+([a-zA-Z\s]+)/i),
      experience: this.extractNumber(userInput, /(\d+)\s+years?\s+(?:of\s+)?experience/i),
      turnover: this.extract(userInput, /([₹\$]?\s*\d+)\s+(?:lakh|crore)/i),
      location: this.extract(userInput, /(?:in|at)\s+([A-Z][a-zA-Z\s]+)/),
      minValue: this.extract(userInput, /worth\s+(?:at\s+)?least\s+([₹\$]?\s*\d+)/i),
      keywords: userInput.toLowerCase().split(/\s+/).filter(w => w.length > 3)
    };
  }

  extract(text, regex) {
    const match = text.match(regex);
    return match ? match[1].trim() : null;
  }

  extractNumber(text, regex) {
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  }
}

module.exports = RequirementParser;
