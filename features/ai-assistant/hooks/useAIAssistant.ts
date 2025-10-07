import { useState, useCallback } from 'react';
import { 
  analyzeQuery, 
  validateQuery, 
  generateContextualResponse, 
  generateFollowUpQuestions 
} from '../utils';

interface UseAIAssistantReturn {
  query: string;
  response: string | null;
  isLoading: boolean;
  error: string | null;
  followUpQuestions: string[];
  submitQuery: (query: string) => Promise<void>;
  clearResponse: () => void;
  setQuery: (query: string) => void;
  validateCurrentQuery: () => { isValid: boolean; errors: string[]; suggestions: string[] };
}

export const useAIAssistant = (): UseAIAssistantReturn => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);

  const validateCurrentQuery = useCallback(() => {
    return validateQuery(query);
  }, [query]);

  const submitQuery = useCallback(async (queryText: string) => {
    setError(null);
    setResponse(null);
    setFollowUpQuestions([]);

    const validation = validateQuery(queryText);
    if (!validation.isValid) {
      setError(validation.errors[0]);
      return;
    }

    setIsLoading(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

      const analysis = analyzeQuery(queryText);
      const contextualResponse = generateContextualResponse(queryText, analysis);
      const followUps = generateFollowUpQuestions(queryText, analysis);

      setResponse(contextualResponse);
      setFollowUpQuestions(followUps);
    } catch {
      setError('Sorry, I encountered an error processing your query. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResponse = useCallback(() => {
    setResponse(null);
    setQuery('');
    setError(null);
    setFollowUpQuestions([]);
  }, []);

  return {
    query,
    response,
    isLoading,
    error,
    followUpQuestions,
    submitQuery,
    clearResponse,
    setQuery,
    validateCurrentQuery,
  };
};