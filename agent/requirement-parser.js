class RequirementParser {
  parse(userInput) {
    const lowerInput = userInput.toLowerCase();
    
    return {
      businessType: this.extractBusinessType(userInput),
      experience: this.extractNumber(userInput, /(\d+)\s+years?\s+(?:of\s+)?experience/i),
      turnover: this.extract(userInput, /(₹|INR|Rs\.?)?\s*(\d+(?:,\d+)?)\s+(lakh|crore|lakhs|crores)/i, 2),
      location: this.extractLocation(userInput),
      minValue: this.extract(userInput, /worth\s+(?:at\s+)?least\s+(₹|INR|Rs\.?)?\s*(\d+)/i, 2),
      keywords: this.extractKeywords(userInput)
    };
  }

  extractBusinessType(text) {
    // Match patterns like "I run a X company", "X company", "X business", "X installation"
    const patterns = [
      /(?:I\s+run\s+a|I\s+am\s+a|I\s+have\s+a)\s+([A-Za-z\s]+?)\s+(?:company|business|firm|installation|service)/i,
      /([A-Za-z]+)\s+(?:installation|service|company|business|firm)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1].trim();
    }
    return null;
  }

  extractLocation(text) {
    // Match "in Location", "at Location", "Location" (capitalized)
    const patterns = [
      /(?:in|at|from)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      /Kolkata|Mumbai|Delhi|Bangalore|Chennai|Hyderabad|Pune/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) return match[1] || match[0];
    }
    return "West Bengal"; // default
  }

  extractKeywords(text) {
    const stopWords = new Set(['the', 'and', 'for', 'with', 'have', 'that', 'this', 'from', 'what', 'when', 'where']);
    return text.toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 3 && !stopWords.has(w))
      .slice(0, 10); // limit to 10 keywords
  }

  extract(text, regex, groupIndex = 1) {
    const match = text.match(regex);
    return match ? match[groupIndex].trim() : null;
  }

  extractNumber(text, regex) {
    const match = text.match(regex);
    return match ? parseInt(match[1]) : null;
  }
}

module.exports = RequirementParser;

