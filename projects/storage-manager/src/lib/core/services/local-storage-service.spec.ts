import { TestBed } from '@angular/core/testing';

import { LocalStorageService } from './local-storage-service';

describe('LocalStorageService', () => {
  let service: LocalStorageService;
  let localStorageDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    localStorageDescriptor = Object.getOwnPropertyDescriptor(window, 'localStorage');
    const storedValues = new Map<string, string>();
    const storage: Storage = {
      get length() {
        return storedValues.size;
      },
      clear: () => storedValues.clear(),
      getItem: (key) => storedValues.get(key) ?? null,
      key: (index) => Array.from(storedValues.keys())[index] ?? null,
      removeItem: (key) => {
        storedValues.delete(key);
      },
      setItem: (key, value) => {
        storedValues.set(key, String(value));
      },
    };
    Object.defineProperty(window, 'localStorage', { configurable: true, value: storage });

    TestBed.configureTestingModule({});
    service = TestBed.inject(LocalStorageService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (localStorageDescriptor) {
      Object.defineProperty(window, 'localStorage', localStorageDescriptor);
    } else {
      Reflect.deleteProperty(window, 'localStorage');
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('stores and retrieves JSON values', () => {
    const value = { name: 'storage', enabled: true };

    expect(service.setItem('config', value)).toBe(true);
    expect(service.getItem<typeof value>('config')).toEqual(value);
  });

  it('returns false when a value serializes to undefined', () => {
    expect(service.setItem('undefined', undefined)).toBe(false);
    expect(localStorage.getItem('undefined')).toBeNull();
  });

  it('handles values that cannot be serialized', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.setItem('circular', circular)).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('handles storage errors while saving', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(localStorage, 'setItem', {
      configurable: true,
      value: () => {
        throw new Error('Storage unavailable');
      },
    });

    expect(service.setItem('config', 'value')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('returns null for missing keys and parses stored values', () => {
    expect(service.getItem('missing')).toBeNull();

    localStorage.setItem('count', '3');
    expect(service.getItem<number>('count')).toBe(3);
  });

  it('handles invalid JSON while retrieving', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('invalid', '{');

    expect(service.getItem('invalid')).toBeNull();
    expect(errorSpy).toHaveBeenCalled();
  });

  it('updates existing keys and rejects missing keys', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(service.updateItem('missing', 'value')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();

    service.setItem('config', 'before');
    expect(service.updateItem('config', 'after')).toBe(true);
    expect(service.getItem('config')).toBe('after');
  });

  it('removes existing keys and returns false for missing keys', () => {
    expect(service.removeItem('missing')).toBe(false);

    localStorage.setItem('config', 'value');
    expect(service.removeItem('config')).toBe(true);
    expect(localStorage.getItem('config')).toBeNull();
  });

  it('handles storage errors while removing', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    localStorage.setItem('config', 'value');
    Object.defineProperty(localStorage, 'removeItem', {
      configurable: true,
      value: () => {
        throw new Error('Storage unavailable');
      },
    });

    expect(service.removeItem('config')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('checks whether keys exist', () => {
    localStorage.setItem('config', 'value');

    expect(service.hasItem('config')).toBe(true);
    expect(service.hasItem('missing')).toBe(false);
  });

  it('handles storage errors while checking keys', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(localStorage, 'getItem', {
      configurable: true,
      value: () => {
        throw new Error('Storage unavailable');
      },
    });

    expect(service.hasItem('config')).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });

  it('clears all stored keys', () => {
    localStorage.setItem('config', 'value');

    expect(service.clear()).toBe(true);
    expect(localStorage.getItem('config')).toBeNull();
  });

  it('handles storage errors while clearing', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    Object.defineProperty(localStorage, 'clear', {
      configurable: true,
      value: () => {
        throw new Error('Storage unavailable');
      },
    });

    expect(service.clear()).toBe(false);
    expect(errorSpy).toHaveBeenCalled();
  });
});
