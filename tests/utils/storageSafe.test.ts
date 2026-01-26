/**
 * storageSafe.test.ts
 * 
 * Unit tests for the storage safety wrapper
 * Note: Some tests create new storage instances to avoid state pollution from mocked localStorage
 */

import { describe, it, expect, afterEach, vi } from 'vitest';
import { 
  createSafeStorage,
  createJSONStorage,
  testLocalStorage,
  getStorageInfo
} from '../../src/utils/storageSafe';

describe('createSafeStorage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create a storage instance', () => {
    const storage = createSafeStorage();
    
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('getItem');
    expect(storage).toHaveProperty('setItem');
    expect(storage).toHaveProperty('removeItem');
    expect(storage).toHaveProperty('clear');
  });

  it('should support basic get/set operations', () => {
    const storage = createSafeStorage();
    
    storage.setItem('test-key-basic', 'test-value');
    const value = storage.getItem('test-key-basic');
    
    expect(value).toBe('test-value');
  });

  it('should return null for non-existent keys', () => {
    const storage = createSafeStorage();
    
    const value = storage.getItem('non-existent-key-xyz');
    
    expect(value).toBeNull();
  });

  it('should support removeItem', () => {
    const storage = createSafeStorage();
    
    storage.setItem('test-key-remove-1', 'test-value');
    storage.removeItem('test-key-remove-1');
    const value = storage.getItem('test-key-remove-1');
    
    expect(value).toBeNull();
  });

  it('should support clear', () => {
    const storage = createSafeStorage();
    
    storage.setItem('key1-clear', 'value1');
    storage.setItem('key2-clear', 'value2');
    storage.clear();
    
    expect(storage.getItem('key1-clear')).toBeNull();
    expect(storage.getItem('key2-clear')).toBeNull();
  });

  it('should handle quota exceeded errors gracefully', () => {
    // Create storage first, then mock
    const storage = createSafeStorage();
    
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw error;
    });

    // Should not throw error
    expect(() => {
      storage.setItem('test-key-quota-1', 'test-value');
    }).not.toThrow();

    // Should be able to retrieve the value from fallback
    const value = storage.getItem('test-key-quota-1');
    expect(value).toBe('test-value');

    Storage.prototype.setItem = originalSetItem;
  });

  it('should persist multiple values in fallback mode', () => {
    const storage = createSafeStorage();
    
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw error;
    });

    storage.setItem('key1-multi', 'value1');
    storage.setItem('key2-multi', 'value2');
    storage.setItem('key3-multi', 'value3');
    
    expect(storage.getItem('key1-multi')).toBe('value1');
    expect(storage.getItem('key2-multi')).toBe('value2');
    expect(storage.getItem('key3-multi')).toBe('value3');

    Storage.prototype.setItem = originalSetItem;
  });
});

describe('createJSONStorage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create a JSON storage wrapper', () => {
    const storage = createJSONStorage();
    
    expect(storage).toBeDefined();
    expect(storage).toHaveProperty('getItem');
    expect(storage).toHaveProperty('setItem');
    expect(storage).toHaveProperty('removeItem');
  });

  it('should support get/set operations', () => {
    const storage = createJSONStorage();
    
    storage.setItem('test-key-json-1', 'test-value');
    const value = storage.getItem('test-key-json-1');
    
    expect(value).toBe('test-value');
  });

  it('should return null for non-existent keys', () => {
    const storage = createJSONStorage();
    
    const value = storage.getItem('non-existent-key-json-xyz');
    
    expect(value).toBeNull();
  });

  it('should support removeItem', () => {
    const storage = createJSONStorage();
    
    storage.setItem('test-key-remove-json', 'test-value');
    storage.removeItem('test-key-remove-json');
    const value = storage.getItem('test-key-remove-json');
    
    expect(value).toBeNull();
  });

  it('should handle errors gracefully', () => {
    const storage = createJSONStorage();
    
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage error');
    });

    // Should not throw
    expect(() => {
      storage.setItem('test-key-error-json', 'test-value');
    }).not.toThrow();

    Storage.prototype.setItem = originalSetItem;
  });

  it('should work with Zustand-like usage pattern', () => {
    const storage = createJSONStorage();
    
    const state = { count: 0, user: { name: 'Test' } };
    const serialized = JSON.stringify(state);
    
    storage.setItem('app-state-zustand-1', serialized);
    const retrieved = storage.getItem('app-state-zustand-1');
    
    expect(retrieved).toBe(serialized);
    
    if (retrieved) {
      const parsed = JSON.parse(retrieved);
      expect(parsed.count).toBe(0);
      expect(parsed.user.name).toBe('Test');
    }
  });
});

describe('testLocalStorage', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return boolean indicating localStorage availability', () => {
    const result = testLocalStorage();
    
    expect(typeof result).toBe('boolean');
  });

  it('should return false when localStorage throws error', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage disabled');
    });

    const result = testLocalStorage();
    
    expect(result).toBe(false);

    Storage.prototype.setItem = originalSetItem;
  });
});

describe('getStorageInfo', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should return storage information object', () => {
    const info = getStorageInfo();
    
    expect(info).toBeDefined();
    expect(info).toHaveProperty('used');
    expect(info).toHaveProperty('available');
    expect(info).toHaveProperty('usingFallback');
  });

  it('should report used storage as a number', () => {
    const info = getStorageInfo();
    
    expect(typeof info.used).toBe('number');
    expect(info.used).toBeGreaterThanOrEqual(0);
  });

  it('should report availability status', () => {
    const info = getStorageInfo();
    
    expect(typeof info.available).toBe('boolean');
  });

  it('should report fallback status', () => {
    const info = getStorageInfo();
    
    expect(typeof info.usingFallback).toBe('boolean');
  });

  it('should mark as using fallback when storage not available', () => {
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('Storage disabled');
    });

    const info = getStorageInfo();
    
    expect(info.available).toBe(false);
    expect(info.usingFallback).toBe(true);

    Storage.prototype.setItem = originalSetItem;
  });
});

describe('SafeStorage fallback behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should log warning when switching to fallback', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    const storage = createSafeStorage();
    
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw error;
    });

    storage.setItem('test-warn', 'value');
    
    expect(consoleWarnSpy).toHaveBeenCalled();
    
    consoleWarnSpy.mockRestore();
    Storage.prototype.setItem = originalSetItem;
  });

  it('should continue working after fallback', () => {
    const storage = createSafeStorage();
    
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      const error = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw error;
    });

    storage.setItem('key1-fallback', 'value1');
    storage.setItem('key2-fallback', 'value2');
    
    expect(storage.getItem('key1-fallback')).toBe('value1');
    expect(storage.getItem('key2-fallback')).toBe('value2');
    
    storage.removeItem('key1-fallback');
    expect(storage.getItem('key1-fallback')).toBeNull();
    
    storage.clear();
    expect(storage.getItem('key2-fallback')).toBeNull();

    Storage.prototype.setItem = originalSetItem;
  });
});
