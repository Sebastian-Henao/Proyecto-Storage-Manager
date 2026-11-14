import { Injectable } from '@angular/core';

/**
 * Servicio para administrar información almacenada en el `localStorage` del navegador.
 *
 * Soporta valores primitivos y objetos mediante serialización JSON.
 * Ningún método lanza excepciones: los errores se manejan internamente
 * y se reportan con un valor de retorno (`false` o `null`).
 */
@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  /**
   * Guarda un valor (primitivo, arreglo u objeto) 
   * serializado en JSON.
   * 
   * @typeParam T - Tipo del valor a guardar.
   * @param llave Clase con la que se almacenara el valor
   * @param valor Valor a guardar. No puede ser 'undefined'
   * @returns `true` si se guardó correctamente; `false` si el valor no es serializable
   * o el almacenamiento falló (por ejemplo, cuota excedida).
   */
  setItem<T>(llave: string, valor: T): boolean {
    try {
      const serilizado = JSON.stringify(valor);
      if(serilizado === undefined) {
        return false;
      }
      localStorage.setItem(llave, serilizado);
      return true;
    } catch (error) {
      console.error('Error al guardar en localStorage:', error);
      return false;
    }
  }

  /**
   * Obtiene y deserializa el valor asociado a una llave
   * 
   * @typeParam T - Tipo esperado del valor almacenado.
   * @param llave Clave a consultar
   * @returns El valor almacenado, o `null` si la clave no existe,
   * el contenido no es JSON válido o el almacenamiento falló.
   */
  getItem<T>(llave: string): T | null {
    try {
      const raw = localStorage.getItem(llave);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      console.error('Error al obtener del localStorage:', error);
      return null;
    }
  }

  /**
   * Actualiza el valor de una clave que ya existe.
   * 
   * @typeParam T - Tipo del valor a actualizar.
   * 
   * @param llave Clave a actualizar.
   * @param valor Nuevo valor.
   * @returns `true` si se actualizó correctamente; `false` en caso contrario.
   */
  updateItem<T>(llave: string, valor: T): boolean {
    if (!this.hasItem(llave)) {
      console.error(`No existe el item con la llave: ${llave}`);
      return false;
    }
    return this.setItem(llave, valor);
  }

  /**
   * Elimina una llave del almacenamiento
   * 
   * @param llave Clave a eliminar.
   * @returns `true` si se eliminó correctamente; `false` en caso contrario.
   */
  removeItem(llave: string): boolean {
    if (!this.hasItem(llave)) {
      return false;
    }
    try {
      localStorage.removeItem(llave);
      return true;
    } catch (error) {
      console.error('Error al eliminar del localStorage:', error);
      return false;
    }
  }

  /**
   * Indica si una llave existe en el almacenamiento.
   * 
   * @param llave Clave a verificar.
   * @returns true si la clave existe; `false` en caso contrario o si ocurre un error.
   */
  hasItem(llave: string): boolean {
    try {
      return localStorage.getItem(llave) !== null;
    } catch (error) {
      console.error('Error al verificar la existencia en localStorage:', error);
      return false;
    }
  }

  /**
   * Elimina todo el contenido de 'localStorage'.
   * 
   * @returns `true` si se limpió correctamente; `false` en caso contrario.
   */
  clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error al limpiar el localStorage:', error);
      return false;
    }
  }
}
