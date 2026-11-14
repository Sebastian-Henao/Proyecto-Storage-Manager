import { Injectable } from '@angular/core';

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

  private requireCacheStorage(): CacheStorage {
    const almacen = this.cacheStorage;
    if (almacen === null) {
      throw new Error('Cache Storage no está disponible en este entorno');
    }
    return almacen;
  }
}
