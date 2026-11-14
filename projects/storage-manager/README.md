# Estudiantes:
Daniela Gutierrez Gallego - 230231001
Sebastian Henao Gamboa - 230231021
Kevin Andres Montes Camelo - 230231025

# UCEVA Angular Storage Manager

Librería Angular para administrar almacenamiento del navegador mediante `localStorage` y la
API `Cache Storage`. Los servicios se proporcionan en el inyector raíz de Angular.

## Requisitos

- Angular `^20.3.0` (`@angular/core` y `@angular/common`).
- Para `LocalStorageService`, un entorno de navegador con `localStorage`.
- Para `CacheStorageService`, un navegador que soporte Cache Storage. Esta API normalmente
  requiere un contexto seguro (HTTPS o `localhost`).

## Instalación

Cuando el paquete esté publicado en npm:

```bash
npm install @sebastian-henao/storage-manager
```

En una aplicación Angular también se deben cumplir las versiones peer de Angular indicadas
por el paquete.

## Uso de `LocalStorageService`

Importa el servicio desde el paquete e inyéctalo en un servicio o componente:

Los valores se serializan como JSON. El tipo indicado en `getItem<T>()` es una ayuda de
TypeScript; no valida en tiempo de ejecución que el contenido almacenado corresponda a ese
tipo.

### Métodos

| Método | Resultado | Descripción |
| --- | --- | --- |
| `setItem<T>(llave, valor)` | `boolean` | Guarda el valor serializado. Devuelve `false` si no se puede serializar o falla el almacenamiento. |
| `getItem<T>(llave)` | `T \| null` | Lee y deserializa el valor; devuelve `null` si no existe o no se puede leer. |
| `updateItem<T>(llave, valor)` | `boolean` | Actualiza una clave existente. No la crea si no existe. |
| `removeItem(llave)` | `boolean` | Elimina una clave existente. |
| `hasItem(llave)` | `boolean` | Indica si existe una clave. |
| `clear()` | `boolean` | Limpia **todo el `localStorage` del origen**, no solo los datos de esta librería. |

## Uso de `CacheStorageService`

`CacheStorageService` permite guardar respuestas `Request`/`Response` en Cache Storage. Sus
operaciones son asíncronas:

Comprueba el soporte antes de usar la API si la aplicación también se ejecuta en entornos
como SSR

### Métodos

| Método | Resultado | Descripción |
| --- | --- | --- |
| `isSupported()` | `boolean` | Indica si el entorno expone Cache Storage. |
| `openCache(nombreCache)` | `Promise<Cache \| null>` | Abre una caché o la crea. |
| `hasCache(nombreCache)` | `Promise<boolean>` | Comprueba si existe una caché. |
| `listCaches()` | `Promise<string[]>` | Lista los nombres de las cachés. |
| `put(nombreCache, solicitud, respuesta)` | `Promise<boolean>` | Guarda una respuesta; crea la caché si hace falta. |
| `match(nombreCache, solicitud, opciones?)` | `Promise<Response \| null>` | Busca una respuesta sin crear la caché. |
| `has(nombreCache, solicitud, opciones?)` | `Promise<boolean>` | Comprueba si hay una respuesta para la solicitud. |
| `keys(nombreCache)` | `Promise<CacheEntry[]>` | Devuelve las URL y métodos almacenados. |
| `deleteEntry(nombreCache, solicitud, opciones?)` | `Promise<boolean>` | Elimina una entrada de una caché existente. |
| `deleteCache(nombreCache)` | `Promise<boolean>` | Elimina una caché completa. |
| `clear()` | `Promise<boolean>` | Elimina todas las cachés del origen. |

`CacheMatchOptions` permite configurar `ignoreSearch`, `ignoreMethod` e `ignoreVary` al
buscar o eliminar entradas. `CacheEntry` tiene la forma `{ url: string; method: string }`.

Los métodos manejan internamente los errores de almacenamiento: los registran en la consola
y devuelven `false`, `null` o un arreglo vacío, según el método.

## Desarrollo de esta librería

Desde la raíz del repositorio:

```bash
npm i
npm run build
npm test
npm run test:coverage
```

El build de la librería se genera en `dist/storage-manager`. Para volver a compilar al cambiar
el código:

```bash
npm run build:dev
```
