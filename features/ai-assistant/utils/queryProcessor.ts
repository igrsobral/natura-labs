// Query processing utilities for AI assistant

export interface QueryAnalysis {
  intent: string;
  entities: string[];
  confidence: number;
  category: 'brand' | 'comparison' | 'trend' | 'forecast' | 'performance' | 'general';
}

export interface QueryValidation {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

// Extract entities (brands, categories, etc.) from query
export const extractEntities = (query: string): string[] => {
  const entities: string[] = [];
  const lowerQuery = query.toLowerCase();
  
  // Brand entities - test data specific
  if (lowerQuery.includes('brand a')) entities.push('Brand A');
  if (lowerQuery.includes('lifestyle brand a') || lowerQuery.includes('lifestyle')) entities.push('Lifestyle Brand A');
  if (lowerQuery.includes('fashion brand a') || lowerQuery.includes('fashion')) entities.push('Fashion Brand A');
  
  // Category entities - test data specific
  if (lowerQuery.includes('fitness')) entities.push('Fitness');
  if (lowerQuery.includes('recovery')) entities.push('Recovery');
  if (lowerQuery.includes('supplements')) entities.push('Supplements');
  if (lowerQuery.includes('gear')) entities.push('Gear');
  
  // Time entities
  if (lowerQuery.includes('week')) entities.push('weekly');
  if (lowerQuery.includes('month')) entities.push('monthly');
  if (lowerQuery.includes('quarter')) entities.push('quarterly');
  if (lowerQuery.includes('year')) entities.push('yearly');
  
  return entities;
};

// Analyze query intent and categorize
export const analyzeQuery = (query: string): QueryAnalysis => {
  const lowerQuery = query.toLowerCase();
  const entities = extractEntities(query);
  
  let category: QueryAnalysis['category'] = 'general';
  let intent = 'unknown';
  let confidence = 0.5;
  
  // Brand-specific queries
  if (lowerQuery.includes('brand') && (lowerQuery.includes('a') || lowerQuery.includes('b') || lowerQuery.includes('c'))) {
    category = 'brand';
    intent = 'brand_analysis';
    confidence = 0.9;
  }
  
  // Comparison queries
  else if (lowerQuery.includes('compare') || lowerQuery.includes('vs') || lowerQuery.includes('versus') || lowerQuery.includes('all brands')) {
    category = 'comparison';
    intent = 'comparison_analysis';
    confidence = 0.85;
  }
  
  // Trend queries
  else if (lowerQuery.includes('trend') || lowerQuery.includes('growth') || lowerQuery.includes('increase') || lowerQuery.includes('decrease')) {
    category = 'trend';
    intent = 'trend_analysis';
    confidence = 0.8;
  }
  
  // Forecast queries
  else if (lowerQuery.includes('forecast') || lowerQuery.includes('predict') || lowerQuery.includes('future') || lowerQuery.includes('next')) {
    category = 'forecast';
    intent = 'forecast_analysis';
    confidence = 0.75;
  }
  
  // Performance queries
  else if (lowerQuery.includes('best') || lowerQuery.includes('top') || lowerQuery.includes('highest') || 
           lowerQuery.includes('worst') || lowerQuery.includes('lowest') || lowerQuery.includes('performance')) {
    category = 'performance';
    intent = 'performance_analysis';
    confidence = 0.8;
  }
  
  return {
    intent,
    entities,
    confidence,
    category
  };
};

// Validate query and provide suggestions
export const validateQuery = (query: string): QueryValidation => {
  const errors: string[] = [];
  const suggestions: string[] = [];
  
  if (!query.trim()) {
    errors.push('Query cannot be empty');
    suggestions.push('Try asking about brand performance or trends');
    return { isValid: false, errors, suggestions };
  }
  
  if (query.length < 3) {
    errors.push('Query is too short');
    suggestions.push('Please provide more details about what you want to know');
    return { isValid: false, errors, suggestions };
  }
  
  if (query.length > 200) {
    errors.push('Query is too long');
    suggestions.push('Please keep your question under 200 characters');
    return { isValid: false, errors, suggestions };
  }
  
  // Check for potentially problematic queries
  const lowerQuery = query.toLowerCase();
  if (!lowerQuery.includes('brand') && !lowerQuery.includes('sales') && 
      !lowerQuery.includes('trend') && !lowerQuery.includes('performance') &&
      !lowerQuery.includes('compare') && !lowerQuery.includes('forecast') &&
      !lowerQuery.includes('category') && !lowerQuery.includes('fitness') &&
      !lowerQuery.includes('recovery') && !lowerQuery.includes('supplements') &&
      !lowerQuery.includes('gear') && !lowerQuery.includes('lifestyle') &&
      !lowerQuery.includes('fashion')) {
    
    suggestions.push('Try asking about Lifestyle Brand A or Fashion Brand A');
    suggestions.push('Ask about Fitness, Recovery, Supplements, or Gear categories');
    suggestions.push('Try "Show me Brand A trends" or category comparisons');
  }
  
  return { isValid: true, errors, suggestions };
};

// Generate contextual suggestions based on query
export const generateSuggestions = (query: string): string[] => {
  const analysis = analyzeQuery(query);
  const suggestions: string[] = [];
  
  switch (analysis.category) {
    case 'brand':
      suggestions.push('Compare this brand with others');
      suggestions.push('Show category breakdown for this brand');
      suggestions.push('Analyze growth trends');
      break;
      
    case 'comparison':
      suggestions.push('Focus on specific categories');
      suggestions.push('Look at time-based trends');
      suggestions.push('Analyze growth rates');
      break;
      
    case 'trend':
      suggestions.push('Forecast future performance');
      suggestions.push('Compare with other brands');
      suggestions.push('Identify seasonal patterns');
      break;
      
    case 'forecast':
      suggestions.push('Analyze historical trends');
      suggestions.push('Consider seasonal factors');
      suggestions.push('Compare with industry benchmarks');
      break;
      
    case 'performance':
      suggestions.push('Analyze underlying factors');
      suggestions.push('Compare time periods');
      suggestions.push('Look at category breakdown');
      break;
      
    default:
      suggestions.push('Ask about Lifestyle Brand A or Fashion Brand A');
      suggestions.push('Try asking about Fitness, Recovery, Supplements, or Gear');
      suggestions.push('Ask about trends, comparisons, or data gaps');
  }
  
  return suggestions;
};