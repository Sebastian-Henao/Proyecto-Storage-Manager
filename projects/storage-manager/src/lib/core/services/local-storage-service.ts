import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
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

  getItem<T>(llave: string): T | null {
    try {
      const raw = localStorage.getItem(llave);
      return raw === null ? null : (JSON.parse(raw) as T);
    } catch (error) {
      console.error('Error al obtener del localStorage:', error);
      return null;
    }
  }

  updateItem<T>(llave: string, valor: T): boolean {
    if (!this.hasItem(llave)) {
      console.error(`No existe el item con la llave: ${llave}`);
      return false;
    }
    return this.setItem(llave, valor);
  }

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

  hasItem(llave: string): boolean {
    try {
      return localStorage.getItem(llave) !== null;
    } catch (error) {
      console.error('Error al verificar la existencia en localStorage:', error);
      return false;
    }
  }

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
