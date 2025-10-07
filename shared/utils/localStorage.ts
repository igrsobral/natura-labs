// Utility functions for localStorage operations with error handling and SSR safety

export interface StorageOptions {
  expirationMs?: number;
  compress?: boolean;
}

export interface StorageItem<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
  version?: string;
}

// Check if localStorage is available (SSR safe)
export const isLocalStorageAvailable = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const testKey = '__localStorage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
};

// Get item from localStorage with expiration and error handling
export const getStorageItem = <T>(
  key: string,
  defaultValue: T | null = null
): T | null => {
  if (!isLocalStorageAvailable()) {
    return defaultValue;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return defaultValue;
    }

    const parsed: StorageItem<T> = JSON.parse(item);

    // Check expiration
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return defaultValue;
    }

    return parsed.data;
  } catch (error) {
    console.warn(`Failed to get item from localStorage: ${key}`, error);
    return defaultValue;
  }
};

// Set item in localStorage with optional expiration
export const setStorageItem = <T>(
  key: string,
  value: T,
  options: StorageOptions = {}
): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const now = Date.now();
    const item: StorageItem<T> = {
      data: value,
      timestamp: now,
      version: '1.0'
    };

    if (options.expirationMs) {
      item.expiresAt = now + options.expirationMs;
    }

    const serialized = JSON.stringify(item);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.warn(`Failed to set item in localStorage: ${key}`, error);
    return false;
  }
};

// Remove item from localStorage
export const removeStorageItem = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item from localStorage: ${key}`, error);
    return false;
  }
};

// Clear all items from localStorage
export const clearStorage = (): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Failed to clear localStorage', error);
    return false;
  }
};

// Get storage usage information
export const getStorageInfo = (): {
  available: boolean;
  used: number;
  remaining: number;
  total: number;
} => {
  if (!isLocalStorageAvailable()) {
    return {
      available: false,
      used: 0,
      remaining: 0,
      total: 0
    };
  }

  try {
    // Estimate storage usage
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers have ~5-10MB limit for localStorage
    const estimatedTotal = 5 * 1024 * 1024; // 5MB
    const remaining = Math.max(0, estimatedTotal - used);

    return {
      available: true,
      used,
      remaining,
      total: estimatedTotal
    };
  } catch (error) {
    console.warn('Failed to get storage info', error);
    return {
      available: false,
      used: 0,
      remaining: 0,
      total: 0
    };
  }
};

// Check if an item exists and is not expired
export const hasStorageItem = (key: string): boolean => {
  if (!isLocalStorageAvailable()) {
    return false;
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return false;
    }

    const parsed: StorageItem<unknown> = JSON.parse(item);

    // Check expiration
    if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
      localStorage.removeItem(key);
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Get metadata about a stored item
export const getStorageItemMetadata = (key: string): {
  exists: boolean;
  timestamp?: number;
  expiresAt?: number;
  age?: number;
  timeToExpiry?: number;
  version?: string;
} => {
  if (!isLocalStorageAvailable()) {
    return { exists: false };
  }

  try {
    const item = localStorage.getItem(key);
    if (!item) {
      return { exists: false };
    }

    const parsed: StorageItem<unknown> = JSON.parse(item);
    const now = Date.now();

    return {
      exists: true,
      timestamp: parsed.timestamp,
      expiresAt: parsed.expiresAt,
      age: now - parsed.timestamp,
      timeToExpiry: parsed.expiresAt ? parsed.expiresAt - now : undefined,
      version: parsed.version
    };
  } catch {
    return { exists: false };
  }
};

// Clean up expired items
export const cleanupExpiredItems = (): number => {
  if (!isLocalStorageAvailable()) {
    return 0;
  }

  let cleanedCount = 0;
  const keysToRemove: string[] = [];

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key) continue;

      try {
        const item = localStorage.getItem(key);
        if (!item) continue;

        const parsed: StorageItem<unknown> = JSON.parse(item);
        
        // Check if item has expiration and is expired
        if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
          keysToRemove.push(key);
        }
      } catch {
        // If we can't parse the item, it might be corrupted
        // We could optionally remove it here
      }
    }

    // Remove expired items
    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      cleanedCount++;
    });

  } catch (error) {
    console.warn('Failed to cleanup expired items', error);
  }

  return cleanedCount;
};

// Create a typed storage hook for specific data types
export const createTypedStorage = <T>(keyPrefix: string) => {
  return {
    get: (key: string, defaultValue: T | null = null): T | null => {
      return getStorageItem(`${keyPrefix}_${key}`, defaultValue);
    },
    
    set: (key: string, value: T, options?: StorageOptions): boolean => {
      return setStorageItem(`${keyPrefix}_${key}`, value, options);
    },
    
    remove: (key: string): boolean => {
      return removeStorageItem(`${keyPrefix}_${key}`);
    },
    
    has: (key: string): boolean => {
      return hasStorageItem(`${keyPrefix}_${key}`);
    },
    
    getMetadata: (key: string) => {
      return getStorageItemMetadata(`${keyPrefix}_${key}`);
    }
  };
};

// Export commonly used storage instances
export const salesDataStorage = createTypedStorage<unknown>('natura_sales');
export const uiStateStorage = createTypedStorage<unknown>('natura_ui');
export const userPreferencesStorage = createTypedStorage<unknown>('natura_prefs');