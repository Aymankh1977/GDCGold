/**
 * storageSafe.ts
 * 
 * Provides a safe wrapper around localStorage that gracefully handles
 * QuotaExceededError and other storage exceptions by falling back to
 * in-memory storage.
 * 
 * This ensures the application continues to function even when localStorage
 * is full or unavailable, with clear warnings to the user.
 */

export interface SafeStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

/**
 * In-memory storage fallback for when localStorage is unavailable
 */
class MemoryStorage implements SafeStorage {
  private store: Map<string, string> = new Map();

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }
}

/**
 * Safe localStorage wrapper that catches quota exceeded errors
 * and falls back to in-memory storage
 */
class SafeLocalStorage implements SafeStorage {
  private fallbackStorage: MemoryStorage | null = null;
  private useFallback = false;

  private getFallback(): MemoryStorage {
    if (!this.fallbackStorage) {
      this.fallbackStorage = new MemoryStorage();
      console.warn(
        '⚠️ LocalStorage quota exceeded or unavailable. Using in-memory storage fallback. ' +
        'Data will not persist across browser sessions. ' +
        'Consider exporting important data or clearing old documents.'
      );
    }
    return this.fallbackStorage;
  }

  getItem(key: string): string | null {
    if (this.useFallback) {
      return this.getFallback().getItem(key);
    }

    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('Error reading from localStorage, using fallback:', error);
      this.useFallback = true;
      return this.getFallback().getItem(key);
    }
  }

  setItem(key: string, value: string): void {
    if (this.useFallback) {
      this.getFallback().setItem(key, value);
      return;
    }

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // Check if it's a quota exceeded error
      if (error instanceof DOMException && 
          (error.name === 'QuotaExceededError' || error.code === 22)) {
        console.warn('LocalStorage quota exceeded, switching to in-memory fallback');
        this.useFallback = true;
        this.getFallback().setItem(key, value);
      } else {
        console.error('Unexpected error writing to localStorage:', error);
        throw error;
      }
    }
  }

  removeItem(key: string): void {
    if (this.useFallback) {
      this.getFallback().removeItem(key);
      return;
    }

    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Error removing from localStorage:', error);
      this.useFallback = true;
      this.getFallback().removeItem(key);
    }
  }

  clear(): void {
    if (this.useFallback) {
      this.getFallback().clear();
      return;
    }

    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Error clearing localStorage:', error);
      this.useFallback = true;
      this.getFallback().clear();
    }
  }
}

/**
 * Create a safe storage instance that wraps localStorage with fallback
 */
export function createSafeStorage(): SafeStorage {
  // Check if localStorage is available
  if (typeof localStorage === 'undefined') {
    console.warn('localStorage not available, using in-memory storage');
    return new MemoryStorage();
  }

  return new SafeLocalStorage();
}

/**
 * Create a JSON storage wrapper compatible with Zustand's persist middleware.
 * This is a drop-in replacement for createJSONStorage(() => localStorage)
 */
export function createJSONStorage(getStorage?: () => Storage): any {
  const safeStorage = createSafeStorage();

  return {
    getItem: (name: string): string | null => {
      try {
        return safeStorage.getItem(name);
      } catch (error) {
        console.error('Error getting item from storage:', error);
        return null;
      }
    },
    setItem: (name: string, value: string): void => {
      try {
        safeStorage.setItem(name, value);
      } catch (error) {
        console.error('Error setting item in storage:', error);
      }
    },
    removeItem: (name: string): void => {
      try {
        safeStorage.removeItem(name);
      } catch (error) {
        console.error('Error removing item from storage:', error);
      }
    }
  };
}

/**
 * Test if localStorage is available and has space
 * @returns true if localStorage is working, false otherwise
 */
export function testLocalStorage(): boolean {
  try {
    const testKey = '__storage_test__';
    const testValue = 'test';
    localStorage.setItem(testKey, testValue);
    const retrieved = localStorage.getItem(testKey);
    localStorage.removeItem(testKey);
    return retrieved === testValue;
  } catch {
    return false;
  }
}

/**
 * Get approximate localStorage usage information
 */
export function getStorageInfo(): { used: number; available: boolean; usingFallback: boolean } {
  let used = 0;
  let available = true;

  try {
    if (typeof localStorage !== 'undefined') {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += (localStorage.getItem(key)?.length || 0) + key.length;
        }
      }
      // Test if we can write
      available = testLocalStorage();
    } else {
      available = false;
    }
  } catch {
    available = false;
  }

  return {
    used,
    available,
    usingFallback: !available
  };
}
