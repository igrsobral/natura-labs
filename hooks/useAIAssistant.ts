import { useState } from 'react'
import { AIQuery } from '../shared/types'

interface UseAIAssistantReturn {
  queries: AIQuery[]
  isLoading: boolean
  error: string | null
  submitQuery: (query: string) => Promise<void>
  clearHistory: () => void
}

export const useAIAssistant = (): UseAIAssistantReturn => {
  const [queries, setQueries] = useState<AIQuery[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateMockResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase()
    
    if (lowerQuery.includes('sales') && lowerQuery.includes('average')) {
      return 'Based on the current data, the average sales across all brands is $1,250 per day. Brand A shows the highest performance with 15% above average.'
    }
    
    if (lowerQuery.includes('trend') || lowerQuery.includes('growth')) {
      return 'The sales trend shows a 12% week-over-week growth. The strongest growth is in Category 1 with 18% increase.'
    }
    
    if (lowerQuery.includes('best') || lowerQuery.includes('top')) {
      return 'Top performing brand is Brand A with $2,100 in sales this week. Top category is Category 1 with 45% of total sales.'
    }
    
    return 'I can help you analyze sales data, identify trends, and provide insights. Try asking about averages, trends, or top performers.'
  }

  const submitQuery = async (query: string): Promise<void> => {
    if (!query.trim()) {
      setError('Please enter a valid query')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newQuery: AIQuery = {
        query: query.trim(),
        timestamp: new Date(),
        response: generateMockResponse(query),
      }

      setQueries(prev => [...prev, newQuery])
    } catch {
      setError('Failed to process query. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const clearHistory = () => {
    setQueries([])
    setError(null)
  }

  return {
    queries,
    isLoading,
    error,
    submitQuery,
    clearHistory,
  }
}