import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Card, CardContent } from '@/components/ui/card';

// Lazy load the AI assistant
const AIAssistant = lazy(() => 
  import('./AIAssistant').then(module => ({ 
    default: module.AIAssistant 
  }))
);

// Loading fallback component
const AILoadingFallback: React.FC = () => (
  <Card>
    <CardContent className="flex items-center justify-center h-64">
      <LoadingSpinner 
        size="lg" 
        text="Loading AI Assistant..." 
        ariaLabel="Loading AI assistant interface"
      />
    </CardContent>
  </Card>
);

// Lazy-loaded AI assistant with suspense
export const LazyAIAssistant: React.FC<React.ComponentProps<typeof AIAssistant>> = (props) => (
  <Suspense fallback={<AILoadingFallback />}>
    <AIAssistant {...props} />
  </Suspense>
);

// Export as default
export default LazyAIAssistant;