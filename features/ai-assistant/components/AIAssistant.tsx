'use client';

import { useAIAssistant } from '../hooks';
import { AIInputBox } from './AIInputBox';
import { AIResponse } from './AIResponse';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AIAssistantProps {
  className?: string;
}

export const AIAssistant = ({ className = '' }: AIAssistantProps) => {
  const {
    response,
    isLoading,
    error,
    followUpQuestions,
    submitQuery,
    clearResponse,
    setQuery
  } = useAIAssistant();

  const handleSubmit = async (queryText: string) => {
    await submitQuery(queryText);
  };

  const handleFollowUpClick = (question: string) => {
    setQuery(question);
    submitQuery(question);
  };

  return (
    <div className={`w-full max-w-none ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Main Chat Area - Takes 3/4 on large screens, full width on smaller */}
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          <Card className="h-fit">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">BrandAI Assistant</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask questions about your sales data and get instant insights
              </p>
            </CardHeader>

            <CardContent className="space-y-4 lg:space-y-6">
              {/* Input Section */}
              <AIInputBox
                onSubmit={handleSubmit}
                isLoading={isLoading}
                error={error}
                onQueryChange={setQuery}
                placeholder="Ask BrandAI (AI Assistant): e.g., 'Show me Brand A trends.'"
              />

              {/* Response Section */}
              <AIResponse
                response={response}
                isLoading={isLoading}
                followUpQuestions={followUpQuestions}
                onClear={clearResponse}
                onFollowUpClick={handleFollowUpClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Takes 1/4 on large screens, full width on smaller */}
        <div className="lg:col-span-1 space-y-4 lg:space-y-6">
          {/* Help Section */}
          <Card>
            <CardContent className="pt-4 lg:pt-6">
              <h4 className="text-sm font-medium mb-3 lg:mb-4">
                Try asking about:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2 lg:space-y-3">
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Lifestyle Brand A and Fashion Brand A trends</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Fitness, Recovery, Supplements, Gear performance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Category comparisons and averages</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Data gaps and missing values analysis</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-primary mt-1">•</span>
                  <span>Weekly totals and growth patterns</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="pt-4 lg:pt-6">
              <h4 className="text-sm font-medium mb-3 lg:mb-4">
                Quick Actions
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleSubmit("Show me Brand A trends")}
                  disabled={isLoading}
                >
                  Brand A Trends
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleSubmit("Compare Supplements and Fitness")}
                  disabled={isLoading}
                >
                  Category Comparison
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs"
                  onClick={() => handleSubmit("Tell me about data gaps")}
                  disabled={isLoading}
                >
                  Data Gaps Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};