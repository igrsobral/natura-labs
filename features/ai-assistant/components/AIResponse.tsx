'use client';

import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { LoadingTransition } from '@/components/ui/loading-transition';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bot, X, Lightbulb } from 'lucide-react';

interface AIResponseProps {
  response: string | null;
  isLoading: boolean;
  followUpQuestions?: string[];
  onClear?: () => void;
  onFollowUpClick?: (question: string) => void;
}

export const AIResponse = ({ 
  response, 
  isLoading, 
  followUpQuestions = [], 
  onClear, 
  onFollowUpClick 
}: AIResponseProps) => {
  if (!response && !isLoading) {
    return null;
  }

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
      <CardContent className="pt-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">BrandAI Assistant</span>
              <Badge variant="secondary" className="text-xs">
                AI
              </Badge>
            </div>
          </div>
          
          {onClear && response && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              aria-label="Clear Response"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <LoadingTransition
          isLoading={isLoading}
          fallback={
            <div className="flex items-center space-x-3">
              <LoadingSpinner 
                size="sm" 
                variant="primary" 
                type="dots"
              />
              <span className="text-sm text-muted-foreground">Analyzing your data...</span>
            </div>
          }
        >
          {/* Response Content */}
          {response && (
            <div className="space-y-4">
              <div className="text-sm leading-relaxed">
                {response}
              </div>
              
              {/* Follow-up Questions */}
              {followUpQuestions.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-3">Follow-up questions:</p>
                  <div className="space-y-2">
                    {followUpQuestions.map((question, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        onClick={() => onFollowUpClick?.(question)}
                        className="w-full justify-start text-left h-auto p-2 text-xs"
                      >
                        • {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="pt-4 border-t">
                <div className="flex items-start space-x-2 text-xs text-muted-foreground">
                  <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <p className="italic">
                    This is a mock AI response for demonstration purposes. 
                    In a real implementation, this would connect to an actual AI service.
                  </p>
                </div>
              </div>
            </div>
          )}
        </LoadingTransition>
      </CardContent>
    </Card>
  );
};