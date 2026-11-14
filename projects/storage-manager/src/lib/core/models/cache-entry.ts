/**
 * Representa una entrada (clave) almacenada dentro de una caché.
 *
 * @example
 * ```ts
 * const entrada: CacheEntry = { url: 'https://api.ejemplo.com/datos', method: 'GET' };
 * ```
 */
export interface CacheEntry {
  /** URL absoluta del recurso almacenado. */
  url: string;
  /** Método HTTP de la solicitud asociada (por ejemplo, `GET`). */
  method: string;
}
