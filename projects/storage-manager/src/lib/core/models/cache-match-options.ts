/**
 * Opciones para buscar o eliminar recursos dentro de una caché.
 * Equivale a `CacheQueryOptions` de la Cache Storage API (sin `cacheName`).
 *
 * @example
 * ```ts
 * const opciones: CacheMatchOptions = { ignoreSearch: true };
 * ```
 */
export interface CacheMatchOptions {
  /** Si es `true`, ignora la query string (`?a=1`) de la URL al comparar. */
  ignoreSearch?: boolean;
  /** Si es `true`, no valida que el método HTTP coincida (acepta POST, etc.). */
  ignoreMethod?: boolean;
  /** Si es `true`, ignora la cabecera `Vary` de la respuesta almacenada. */
  ignoreVary?: boolean;
}
