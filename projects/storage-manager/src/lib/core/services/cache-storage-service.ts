import { Injectable } from '@angular/core';

import { CacheEntry } from '../models/cache-entry';
import { CacheMatchOptions } from '../models/cache-match-options';

/**
 * Servicio para gestionar el Cache Storage del navegador.
 *
 * Todas las operaciones son asíncronas (devuelven `Promise`). Siguiendo el estilo de
 * `LocalStorageService`, los métodos no lanzan excepciones: ante un error (o si Cache Storage
 * no está disponible) registran el problema con `console.error` y devuelven `false`,
 * `null` o un arreglo vacío según corresponda.
 *
 * @example
 * ```ts
 * private readonly cacheService = inject(CacheStorageService);
 *
 * await this.cacheService.put('mi-cache', '/api/datos', new Response('{"ok":true}'));
 * const respuesta = await this.cacheService.match('mi-cache', '/api/datos');
 * ```
 */
@Injectable({
  providedIn: 'root',
})
export class CacheStorageService {
  /**
   * Punto único de acceso al objeto global `caches`.
   * Devuelve `null` en entornos sin soporte (SSR, contexto no seguro, navegadores antiguos).
   */
  private get cacheStorage(): CacheStorage | null {
    return typeof caches === 'undefined' ? null : caches;
  }

  /**
   * Indica si Cache Storage está disponible en el entorno actual.
   *
   * @returns `true` si la API `caches` existe; `false` en caso contrario.
   *
   * @example
   * ```ts
   * if (!cacheService.isSupported()) { console.warn('Sin Cache Storage'); }
   * ```
   */
  isSupported(): boolean {
    return this.cacheStorage !== null;
  }

  /**
   * Abre una caché por nombre; si no existe, la crea.
   *
   * @param nombreCache Nombre de la caché.
   * @returns La instancia de `Cache`, o `null` si falla o no hay soporte.
   *
   * @example
   * ```ts
   * const cache = await cacheService.openCache('mi-cache');
   * ```
   */
  async openCache(nombreCache: string): Promise<Cache | null> {
    try {
      return await this.requireCacheStorage().open(nombreCache);
    } catch (error) {
      console.error('Error al abrir la caché:', error);
      return null;
    }
  }

  /**
   * Verifica si existe una caché con el nombre dado.
   *
   * @param nombreCache Nombre de la caché.
   * @returns `true` si existe; `false` si no existe, falla o no hay soporte.
   */
  async hasCache(nombreCache: string): Promise<boolean> {
    try {
      return await this.requireCacheStorage().has(nombreCache);
    } catch (error) {
      console.error('Error al verificar la existencia de la caché:', error);
      return false;
    }
  }

  /**
   * Lista los nombres de todas las cachés existentes.
   *
   * @returns Arreglo con los nombres; vacío si no hay cachés, falla o no hay soporte.
   *
   * @example
   * ```ts
   * const nombres = await cacheService.listCaches(); // ['mi-cache', 'otra']
   * ```
   */
  async listCaches(): Promise<string[]> {
    try {
      return await this.requireCacheStorage().keys();
    } catch (error) {
      console.error('Error al listar las cachés:', error);
      return [];
    }
  }

  /**
   * Almacena una respuesta asociada a una solicitud. Crea la caché si no existe.
   *
   * @param nombreCache Nombre de la caché destino.
   * @param solicitud URL, `URL` o `Request` que actúa como clave.
   * @param respuesta `Response` a almacenar.
   * @returns `true` si se guardó; `false` si falló o no hay soporte.
   *
   * @example
   * ```ts
   * await cacheService.put('mi-cache', '/api/datos', new Response('{"ok":true}'));
   * ```
   */
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

  /**
   * Consulta la respuesta almacenada para una solicitud. No crea la caché si no existe.
   *
   * @param nombreCache Nombre de la caché.
   * @param solicitud URL, `URL` o `Request` a buscar.
   * @param opciones Opciones de búsqueda (opcional).
   * @returns La `Response` almacenada, o `null` si la caché o el recurso no existen,
   * si falla o no hay soporte.
   *
   * @example
   * ```ts
   * const respuesta = await cacheService.match('mi-cache', '/api/datos');
   * const datos = respuesta ? await respuesta.json() : null;
   * ```
   */
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

  /**
   * Verifica si un recurso está almacenado en una caché.
   *
   * @param nombreCache Nombre de la caché.
   * @param solicitud URL, `URL` o `Request` a buscar.
   * @param opciones Opciones de búsqueda (opcional).
   * @returns `true` si el recurso existe; `false` en cualquier otro caso.
   *
   * @example
   * ```ts
   * const existe = await cacheService.has('mi-cache', '/api/datos');
   * ```
   */
  async has(
    nombreCache: string,
    solicitud: RequestInfo | URL,
    opciones?: CacheMatchOptions,
  ): Promise<boolean> {
    return (await this.match(nombreCache, solicitud, opciones)) !== null;
  }

  /**
   * Obtiene las claves (URL y método) almacenadas en una caché.
   *
   * @param nombreCache Nombre de la caché.
   * @returns Arreglo de {@link CacheEntry}; vacío si la caché no existe, falla o no hay soporte.
   *
   * @example
   * ```ts
   * const claves = await cacheService.keys('mi-cache');
   * ```
   */
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

  /**
   * Elimina un recurso específico de una caché.
   *
   * @param nombreCache Nombre de la caché.
   * @param solicitud URL, `URL` o `Request` a eliminar.
   * @param opciones Opciones de búsqueda (opcional).
   * @returns `true` si se eliminó; `false` si la caché o el recurso no existen,
   * si falla o no hay soporte.
   *
   * @example
   * ```ts
   * await cacheService.deleteEntry('mi-cache', '/api/datos');
   * ```
   */
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

  /**
   * Elimina una caché completa.
   *
   * @param nombreCache Nombre de la caché.
   * @returns `true` si se eliminó; `false` si no existía, falló o no hay soporte.
   *
   * @example
   * ```ts
   * await cacheService.deleteCache('mi-cache');
   * ```
   */
  async deleteCache(nombreCache: string): Promise<boolean> {
    try {
      return await this.requireCacheStorage().delete(nombreCache);
    } catch (error) {
      console.error('Error al eliminar la caché:', error);
      return false;
    }
  }

  /**
   * Elimina todas las cachés existentes.
   *
   * @returns `true` si se limpió; `false` si falló o no hay soporte.
   */
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

  /**
   * Abre una caché solo si ya existe (evita crearla como efecto colateral de una consulta).
   *
   * @param nombreCache Nombre de la caché.
   * @returns La caché, o `null` si no existe.
   * @throws Error si Cache Storage no está disponible.
   */
  private async openExistingCache(nombreCache: string): Promise<Cache | null> {
    const almacen = this.requireCacheStorage();
    return (await almacen.has(nombreCache)) ? almacen.open(nombreCache) : null;
  }

  /**
   * Obtiene `caches` o lanza un error si no está disponible.
   *
   * @returns El `CacheStorage` del navegador.
   * @throws Error si Cache Storage no está disponible en el entorno.
   */
  private requireCacheStorage(): CacheStorage {
    const almacen = this.cacheStorage;
    if (almacen === null) {
      throw new Error('Cache Storage no está disponible en este entorno');
    }
    return almacen;
  }
}
