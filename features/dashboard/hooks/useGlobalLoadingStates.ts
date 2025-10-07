'use client';

import { useState, useEffect, useCallback } from 'react';
import { useGlobalLoadingState } from '@/store';

interface LoadingOperation {
  id: string;
  label: string;
  startTime: Date;
  timeout?: number;
}

interface UseGlobalLoadingStatesReturn {
  isAnyLoading: boolean;
  loadingOperations: LoadingOperation[];
  addLoadingOperation: (id: string, label: string, timeout?: number) => void;
  removeLoadingOperation: (id: string) => void;
  clearAllLoadingOperations: () => void;
  getLoadingDuration: (id: string) => number | null;
}

export function useGlobalLoadingStates(): UseGlobalLoadingStatesReturn {
  const [operations, setOperations] = useState<LoadingOperation[]>([]);
  const { isLoading: storeLoading } = useGlobalLoadingState();

  const removeLoadingOperation = useCallback((id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
  }, []);

  const addLoadingOperation = useCallback((id: string, label: string, timeout?: number) => {
    const operation: LoadingOperation = {
      id,
      label,
      startTime: new Date(),
      timeout
    };

    setOperations(prev => {
      // Remove existing operation with same id if it exists
      const filtered = prev.filter(op => op.id !== id);
      return [...filtered, operation];
    });

    // Set up timeout if specified
    if (timeout) {
      setTimeout(() => {
        removeLoadingOperation(id);
      }, timeout);
    }
  }, [removeLoadingOperation]);

  const clearAllLoadingOperations = useCallback(() => {
    setOperations([]);
  }, []);

  const getLoadingDuration = useCallback((id: string): number | null => {
    const operation = operations.find(op => op.id === id);
    if (!operation) return null;
    
    return Date.now() - operation.startTime.getTime();
  }, [operations]);

  // Clean up operations that have exceeded their timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setOperations(prev => 
        prev.filter(op => {
          if (!op.timeout) return true;
          const duration = Date.now() - op.startTime.getTime();
          return duration < op.timeout;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isAnyLoading = storeLoading || operations.length > 0;

  return {
    isAnyLoading,
    loadingOperations: operations,
    addLoadingOperation,
    removeLoadingOperation,
    clearAllLoadingOperations,
    getLoadingDuration
  };
}