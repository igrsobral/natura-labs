'use client';

import { useState, useEffect, useCallback } from 'react';

interface OfflineState {
  isOnline: boolean;
  wasOffline: boolean;
  lastOnlineTime: Date | null;
  lastOfflineTime: Date | null;
}

interface UseOfflineDetectionReturn {
  isOnline: boolean;
  wasOffline: boolean;
  isReconnecting: boolean;
  offlineDuration: number | null;
  retryConnection: () => Promise<boolean>;
  clearOfflineState: () => void;
}

export function useOfflineDetection(): UseOfflineDetectionReturn {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastOnlineTime: null,
    lastOfflineTime: null
  });
  
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleOnline = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: true,
      wasOffline: prev.wasOffline || !prev.isOnline,
      lastOnlineTime: new Date()
    }));
    setIsReconnecting(false);
  }, []);

  const handleOffline = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOnline: false,
      wasOffline: true,
      lastOfflineTime: new Date()
    }));
  }, []);

  const retryConnection = useCallback(async (): Promise<boolean> => {
    setIsReconnecting(true);
    
    try {
      // Try to fetch a small resource to test connectivity
      const response = await fetch('/favicon.ico', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok) {
        handleOnline();
        return true;
      } else {
        setIsReconnecting(false);
        return false;
      }
    } catch {
      setIsReconnecting(false);
      return false;
    }
  }, [handleOnline]);

  const clearOfflineState = useCallback(() => {
    setState(prev => ({
      ...prev,
      wasOffline: false,
      lastOfflineTime: null,
      lastOnlineTime: null
    }));
  }, []);

  const getOfflineDuration = useCallback((): number | null => {
    if (!state.lastOfflineTime) return null;
    
    const endTime = state.isOnline && state.lastOnlineTime 
      ? state.lastOnlineTime 
      : new Date();
      
    return endTime.getTime() - state.lastOfflineTime.getTime();
  }, [state.lastOfflineTime, state.lastOnlineTime, state.isOnline]);

  useEffect(() => {
    // Set initial state
    setState(prev => ({
      ...prev,
      isOnline: navigator.onLine
    }));

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOnline: state.isOnline,
    wasOffline: state.wasOffline,
    isReconnecting,
    offlineDuration: getOfflineDuration(),
    retryConnection,
    clearOfflineState
  };
}