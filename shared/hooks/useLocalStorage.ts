"use client"

import { useState, useEffect, useCallback } from 'react';

type SetValue<T> = T | ((val: T) => T);

interface UseLocalStorageReturn<T> {
  value: T;
  setValue: (value: SetValue<T>) => void;
  removeValue: () => void;
  error: string | null;
}

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [error, setError] = useState<string | null>(null);

  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      setError(`Failed to read from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        setError(null);
        
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        
        // Save state
        setStoredValue(valueToStore);
        
        // Save to local storage
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
        setError(`Failed to write to localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    },
    [key, storedValue]
  );

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      setError(null);
      setStoredValue(initialValue);
      
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
      setError(`Failed to remove from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [key, initialValue]);

  // Listen for changes to localStorage from other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setError(null);
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
          setError(`Failed to parse localStorage value: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return {
    value: storedValue,
    setValue,
    removeValue,
    error
  };
}