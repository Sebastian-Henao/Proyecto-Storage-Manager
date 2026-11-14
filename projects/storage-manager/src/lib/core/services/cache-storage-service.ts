import { Injectable } from '@angular/core';

import { CacheEntry } from '../models/cache-entry';
import { CacheMatchOptions } from '../models/cache-match-options';

@Injectable({
  providedIn: 'root',
})
export class CacheStorageService {
  private get cacheStorage(): CacheStorage | null {
    return typeof caches === 'undefined' ? null : caches;
  }

  isSupported(): boolean {
    return this.cacheStorage !== null;
  }

  async openCache(nombreCache: string): Promise<Cache | null> {
    try {
      return await this.requireCacheStorage().open(nombreCache);
    } catch (error) {
      console.error('Error al abrir la caché:', error);
      return null;
    }
  }

  async hasCache(nombreCache: string): Promise<boolean> {
    try {
      return await this.requireCacheStorage().has(nombreCache);
    } catch (error) {
      console.error('Error al verificar la existencia de la caché:', error);
      return false;
    }
  }

  async listCaches(): Promise<string[]> {
    try {
      return await this.requireCacheStorage().keys();
    } catch (error) {
      console.error('Error al listar las cachés:', error);
      return [];
    }
  }

  async put(nombreCache: string, solicitud: RequestInfo | URL, respuesta: Response): Promise<boolean> {
    try {
      const cache = await this.requireCacheStorage().open(nombreCache);
      await cache.put(solicitud, respuesta);
      return true;
    } catch (error) {
      console.error('Error al guardar en la caché:', error);
      return false;
    }
  }

  async match(
    nombreCache: string,
    solicitud: RequestInfo | URL,
    opciones?: CacheMatchOptions,
  ): Promise<Response | null> {
    try {
      const cache = await this.openExistingCache(nombreCache);
      if (cache === null) {
        return null;
      }
      return (await cache.match(solicitud, opciones)) ?? null;
    } catch (error) {
      console.error('Error al consultar la caché:', error);
      return null;
    }
  }

  async has(
    nombreCache: string,
    solicitud: RequestInfo | URL,
    opciones?: CacheMatchOptions,
  ): Promise<boolean> {
    return (await this.match(nombreCache, solicitud, opciones)) !== null;
  }

  async keys(nombreCache: string): Promise<CacheEntry[]> {
    try {
      const cache = await this.openExistingCache(nombreCache);
      if (cache === null) {
        return [];
      }
      const solicitudes = await cache.keys();
      return solicitudes.map((solicitud) => ({ url: solicitud.url, method: solicitud.method }));
    } catch (error) {
      console.error('Error al obtener las claves de la caché:', error);
      return [];
    }
  }

  async deleteEntry(
    nombreCache: string,
    solicitud: RequestInfo | URL,
    opciones?: CacheMatchOptions,
  ): Promise<boolean> {
    try {
      const cache = await this.openExistingCache(nombreCache);
      if (cache === null) {
        return false;
      }
      return await cache.delete(solicitud, opciones);
    } catch (error) {
      console.error('Error al eliminar el recurso de la caché:', error);
      return false;
    }
  }

  async deleteCache(nombreCache: string): Promise<boolean> {
    try {
      return await this.requireCacheStorage().delete(nombreCache);
    } catch (error) {
      console.error('Error al eliminar la caché:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      const almacen = this.requireCacheStorage();
      const nombres = await almacen.keys();
      await Promise.all(nombres.map((nombre) => almacen.delete(nombre)));
      return true;
    } catch (error) {
      console.error('Error al limpiar Cache Storage:', error);
      return false;
    }
  }

  private async openExistingCache(nombreCache: string): Promise<Cache | null> {
    const almacen = this.requireCacheStorage();
    return (await almacen.has(nombreCache)) ? almacen.open(nombreCache) : null;
  }

  private requireCacheStorage(): CacheStorage {
    const almacen = this.cacheStorage;
    if (almacen === null) {
      throw new Error('Cache Storage no está disponible en este entorno');
    }
    return almacen;
  }
}
