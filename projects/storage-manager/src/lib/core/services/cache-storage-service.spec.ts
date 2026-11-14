import { TestBed } from '@angular/core/testing';

import { CacheStorageService } from './cache-storage-service';

describe('CacheStorageService', () => {
  let service: CacheStorageService;
  let cacheMock: {
    put: jest.Mock;
    match: jest.Mock;
    delete: jest.Mock;
    keys: jest.Mock;
  };
  let cachesMock: {
    open: jest.Mock;
    has: jest.Mock;
    keys: jest.Mock;
    delete: jest.Mock;
  };
  let errorSpy: jest.SpyInstance;

  const definirCaches = (valor: unknown): void => {
    Object.defineProperty(globalThis, 'caches', {
      value: valor,
      configurable: true,
      writable: true,
    });
  };

  beforeEach(() => {
    cacheMock = {
      put: jest.fn().mockResolvedValue(undefined),
      match: jest.fn(),
      delete: jest.fn(),
      keys: jest.fn(),
    };
    cachesMock = {
      open: jest.fn().mockResolvedValue(cacheMock),
      has: jest.fn().mockResolvedValue(true),
      keys: jest.fn().mockResolvedValue([]),
      delete: jest.fn().mockResolvedValue(true),
    };
    definirCaches(cachesMock);
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);

    TestBed.configureTestingModule({});
    service = TestBed.inject(CacheStorageService);
  });

  afterEach(() => {
    definirCaches(undefined);
    errorSpy.mockRestore();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isSupported', () => {
    it('devuelve true cuando caches está disponible', () => {
      expect(service.isSupported()).toBe(true);
    });

    it('devuelve false cuando caches no está disponible', () => {
      definirCaches(undefined);
      expect(service.isSupported()).toBe(false);
    });
  });

  describe('openCache', () => {
    it('abre la caché y la devuelve', async () => {
      await expect(service.openCache('c1')).resolves.toBe(cacheMock);
      expect(cachesMock.open).toHaveBeenCalledWith('c1');
    });

    it('devuelve null si open falla', async () => {
      cachesMock.open.mockRejectedValue(new Error('fallo'));
      await expect(service.openCache('c1')).resolves.toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve null sin soporte de Cache Storage', async () => {
      definirCaches(undefined);
      await expect(service.openCache('c1')).resolves.toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('hasCache', () => {
    it('devuelve true si la caché existe', async () => {
      await expect(service.hasCache('c1')).resolves.toBe(true);
    });

    it('devuelve false si la caché no existe', async () => {
      cachesMock.has.mockResolvedValue(false);
      await expect(service.hasCache('c1')).resolves.toBe(false);
    });

    it('devuelve false si has falla', async () => {
      cachesMock.has.mockRejectedValue(new Error('fallo'));
      await expect(service.hasCache('c1')).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve false sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.hasCache('c1')).resolves.toBe(false);
    });
  });

  describe('listCaches', () => {
    it('devuelve los nombres de las cachés', async () => {
      cachesMock.keys.mockResolvedValue(['a', 'b']);
      await expect(service.listCaches()).resolves.toEqual(['a', 'b']);
    });

    it('devuelve [] si keys falla', async () => {
      cachesMock.keys.mockRejectedValue(new Error('fallo'));
      await expect(service.listCaches()).resolves.toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve [] sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.listCaches()).resolves.toEqual([]);
    });
  });

  describe('put', () => {
    it('guarda la respuesta y devuelve true', async () => {
      const respuesta = {} as Response;
      await expect(service.put('c1', '/api', respuesta)).resolves.toBe(true);
      expect(cacheMock.put).toHaveBeenCalledWith('/api', respuesta);
    });

    it('devuelve false si put falla', async () => {
      cacheMock.put.mockRejectedValue(new Error('fallo'));
      await expect(service.put('c1', '/api', {} as Response)).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve false si open falla', async () => {
      cachesMock.open.mockRejectedValue(new Error('fallo'));
      await expect(service.put('c1', '/api', {} as Response)).resolves.toBe(false);
    });

    it('devuelve false sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.put('c1', '/api', {} as Response)).resolves.toBe(false);
    });
  });

  describe('match', () => {
    it('devuelve la respuesta almacenada', async () => {
      const respuesta = {} as Response;
      cacheMock.match.mockResolvedValue(respuesta);
      await expect(service.match('c1', '/api', { ignoreSearch: true })).resolves.toBe(respuesta);
      expect(cacheMock.match).toHaveBeenCalledWith('/api', { ignoreSearch: true });
    });

    it('devuelve null si el recurso no existe', async () => {
      cacheMock.match.mockResolvedValue(undefined);
      await expect(service.match('c1', '/api')).resolves.toBeNull();
    });

    it('devuelve null si la caché no existe y no la crea', async () => {
      cachesMock.has.mockResolvedValue(false);
      await expect(service.match('c1', '/api')).resolves.toBeNull();
      expect(cachesMock.open).not.toHaveBeenCalled();
    });

    it('devuelve null si match falla', async () => {
      cacheMock.match.mockRejectedValue(new Error('fallo'));
      await expect(service.match('c1', '/api')).resolves.toBeNull();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve null sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.match('c1', '/api')).resolves.toBeNull();
    });
  });

  describe('has', () => {
    it('devuelve true si el recurso existe', async () => {
      cacheMock.match.mockResolvedValue({} as Response);
      await expect(service.has('c1', '/api')).resolves.toBe(true);
    });

    it('devuelve false si el recurso no existe', async () => {
      cacheMock.match.mockResolvedValue(undefined);
      await expect(service.has('c1', '/api')).resolves.toBe(false);
    });
  });

  describe('keys', () => {
    it('devuelve url y método de cada entrada', async () => {
      cacheMock.keys.mockResolvedValue([{ url: 'http://x/a', method: 'GET' }]);
      await expect(service.keys('c1')).resolves.toEqual([{ url: 'http://x/a', method: 'GET' }]);
    });

    it('devuelve [] si la caché no existe', async () => {
      cachesMock.has.mockResolvedValue(false);
      await expect(service.keys('c1')).resolves.toEqual([]);
    });

    it('devuelve [] si keys falla', async () => {
      cacheMock.keys.mockRejectedValue(new Error('fallo'));
      await expect(service.keys('c1')).resolves.toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve [] sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.keys('c1')).resolves.toEqual([]);
    });
  });

  describe('deleteEntry', () => {
    it('devuelve true si eliminó el recurso', async () => {
      cacheMock.delete.mockResolvedValue(true);
      await expect(service.deleteEntry('c1', '/api', { ignoreVary: true })).resolves.toBe(true);
      expect(cacheMock.delete).toHaveBeenCalledWith('/api', { ignoreVary: true });
    });

    it('devuelve false si el recurso no existe', async () => {
      cacheMock.delete.mockResolvedValue(false);
      await expect(service.deleteEntry('c1', '/api')).resolves.toBe(false);
    });

    it('devuelve false si la caché no existe', async () => {
      cachesMock.has.mockResolvedValue(false);
      await expect(service.deleteEntry('c1', '/api')).resolves.toBe(false);
      expect(cacheMock.delete).not.toHaveBeenCalled();
    });

    it('devuelve false si delete falla', async () => {
      cacheMock.delete.mockRejectedValue(new Error('fallo'));
      await expect(service.deleteEntry('c1', '/api')).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve false sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.deleteEntry('c1', '/api')).resolves.toBe(false);
    });
  });

  describe('deleteCache', () => {
    it('devuelve true si eliminó la caché', async () => {
      await expect(service.deleteCache('c1')).resolves.toBe(true);
      expect(cachesMock.delete).toHaveBeenCalledWith('c1');
    });

    it('devuelve false si la caché no existe', async () => {
      cachesMock.delete.mockResolvedValue(false);
      await expect(service.deleteCache('c1')).resolves.toBe(false);
    });

    it('devuelve false si delete falla', async () => {
      cachesMock.delete.mockRejectedValue(new Error('fallo'));
      await expect(service.deleteCache('c1')).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve false sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.deleteCache('c1')).resolves.toBe(false);
    });
  });

  describe('clear', () => {
    it('elimina todas las cachés', async () => {
      cachesMock.keys.mockResolvedValue(['a', 'b']);
      await expect(service.clear()).resolves.toBe(true);
      expect(cachesMock.delete).toHaveBeenCalledTimes(2);
    });

    it('devuelve false si falla', async () => {
      cachesMock.keys.mockRejectedValue(new Error('fallo'));
      await expect(service.clear()).resolves.toBe(false);
      expect(errorSpy).toHaveBeenCalled();
    });

    it('devuelve false sin soporte', async () => {
      definirCaches(undefined);
      await expect(service.clear()).resolves.toBe(false);
    });
  });
});
