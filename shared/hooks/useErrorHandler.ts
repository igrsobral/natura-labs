"use client"

import { useState, useCallback } from 'react';

interface ErrorState {
  error: Error | null;
  isError: boolean;
  errorMessage: string | null;
}

interface UseErrorHandlerReturn extends ErrorState {
  setError: (error: Error | string | null) => void;
  clearError: () => void;
  handleError: (error: unknown) => void;
  withErrorHandling: <T extends (...args: unknown[]) => unknown>(
    fn: T
  ) => (...args: Parameters<T>) => ReturnType<T> | undefined;
}

/**
 * Custom hook for centralized error handling
 * @param onError - Optional callback to handle errors (e.g., logging)
 * @returns Error state and handling functions
 */
export function useErrorHandler(
  onError?: (error: Error) => void
): UseErrorHandlerReturn {
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isError: false,
    errorMessage: null
  });

  const setError = useCallback(
    (error: Error | string | null) => {
      if (error === null) {
        setErrorState({
          error: null,
          isError: false,
          errorMessage: null
        });
        return;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || 'An unknown error occurred';

      setErrorState({
        error: errorObj,
        isError: true,
        errorMessage
      });

      // Call optional error handler
      onError?.(errorObj);

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error caught by useErrorHandler:', errorObj);
      }
    },
    [onError]
  );

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isError: false,
      errorMessage: null
    });
  }, []);

  const handleError = useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        setError(error);
      } else if (typeof error === 'string') {
        setError(new Error(error));
      } else {
        setError(new Error('An unknown error occurred'));
      }
    },
    [setError]
  );

  const withErrorHandling = useCallback(
    <T extends (...args: unknown[]) => unknown>(fn: T) => {
      return (...args: Parameters<T>): ReturnType<T> | undefined => {
        try {
          const result = fn(...args);
          
          // Handle async functions
          if (result instanceof Promise) {
            return result.catch((error) => {
              handleError(error);
              return undefined;
            }) as ReturnType<T>;
          }
          
          return result;
        } catch (error) {
          handleError(error);
          return undefined;
        }
      };
    },
    [handleError]
  );

  return {
    ...errorState,
    setError,
    clearError,
    handleError,
    withErrorHandling
  };
}