'use client';

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';

interface AIInputBoxProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  placeholder?: string;
  disabled?: boolean;
  error?: string | null;
  onQueryChange?: (query: string) => void;
}

const EXAMPLE_QUERIES = [
  "Show me Brand A trends",
  "Compare Lifestyle Brand A and Fashion Brand A",
  "Tell me about Supplements performance",
  "How is Fitness category doing?",
  "What about Recovery and Gear categories?"
];

export const AIInputBox = ({ 
  onSubmit, 
  isLoading, 
  placeholder = "Ask BrandAI (AI Assistant): e.g., 'Show me Brand A trends.'",
  disabled = false,
  error = null,
  onQueryChange
}: AIInputBoxProps) => {
  const [query, setQuery] = useState('');
  const [showExamples, setShowExamples] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (!query.trim() || isLoading || disabled) {
      return;
    }

    onSubmit(query.trim());
    setQuery('');
    setShowExamples(false);
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    setShowExamples(false);
    onQueryChange?.(example);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onQueryChange?.(newQuery);
  };

  const handleInputFocus = () => {
    if (!query.trim()) {
      setShowExamples(true);
    }
  };

  const handleInputBlur = () => {
    setTimeout(() => setShowExamples(false), 200);
  };

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className="flex space-x-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder={placeholder}
              disabled={disabled || isLoading}
              className={error ? 'border-destructive focus-visible:ring-destructive' : ''}
              aria-label="AI Assistant Query Input"
              aria-invalid={!!error}
              aria-describedby={error ? 'query-error' : undefined}
            />
            
            {/* Example Queries Dropdown */}
            {showExamples && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10">
                <div className="p-3 border-b">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Example Queries
                  </p>
                </div>
                <div className="py-2">
                  {EXAMPLE_QUERIES.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-accent focus:bg-accent focus:outline-none"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Button
            type="submit"
            disabled={!query.trim() || isLoading || disabled}
            size="icon"
            aria-label="Submit Query"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div id="query-error" className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </div>
      )}

      {/* Help Message */}
      {!error && query.trim() === '' && showExamples && (
        <div className="mt-2 text-sm text-muted-foreground">
          Enter a question about your sales data or select an example above.
        </div>
      )}
    </div>
  );
};