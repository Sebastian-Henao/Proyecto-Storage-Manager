import { Component, inject, signal } from '@angular/core';
import { LocalStorageService } from '@sebastian-henao/storage-manager';

type ResultStatus = 'success' | 'info' | 'error';

interface OperationResult {
  id: number;
  operation: string;
  status: ResultStatus;
  message: string;
  time: string;
}

@Component({
  selector: 'app-local-storage-demo',
  imports: [],
  templateUrl: './local-storage-demo.html',
  styleUrl: './local-storage-demo.scss'
})
export class LocalStorageDemo {
  private readonly storage = inject(LocalStorageService);
  private nextResultId = 0;

  readonly key = signal('mensaje');
  readonly value = signal('{"texto":"Hola desde Local Storage"}');
  readonly interpretAsJson = signal(true);
  readonly results = signal<OperationResult[]>([]);

  setItem(): void {
    const value = this.valueToStore('setItem');
    if (!value.valid) {
      return;
    }

    const saved = this.storage.setItem(this.key(), value.value);
    this.record('setItem', saved ? 'success' : 'error', String(saved));
  }

  getItem(): void {
    const key = this.key();
    const exists = this.storage.hasItem(key);
    const value = this.storage.getItem<unknown>(key);
    const message = exists
      ? this.formatValue(value)
      : 'null — la clave no existe';
    this.record('getItem', exists ? 'success' : 'info', message);
  }

  updateItem(): void {
    const value = this.valueToStore('updateItem');
    if (!value.valid) {
      return;
    }

    const updated = this.storage.updateItem(this.key(), value.value);
    this.record(
      'updateItem',
      updated ? 'success' : 'info',
      updated ? 'true — valor actualizado' : 'false — la clave no existe o no se pudo actualizar'
    );
  }

  removeItem(): void {
    const removed = this.storage.removeItem(this.key());
    this.record(
      'removeItem',
      removed ? 'success' : 'info',
      removed ? 'true — clave eliminada' : 'false — la clave no existe o no se pudo eliminar'
    );
  }

  hasItem(): void {
    const exists = this.storage.hasItem(this.key());
    this.record('hasItem', exists ? 'success' : 'info', String(exists));
  }

  clear(): void {
    const cleared = this.storage.clear();
    this.record(
      'clear',
      cleared ? 'success' : 'error',
      cleared ? 'true — se limpió todo el localStorage de este origen' : 'false — no se pudo limpiar'
    );
  }

  private valueToStore(
    operation: string
  ): { valid: true; value: unknown } | { valid: false } {
    if (!this.interpretAsJson()) {
      return { valid: true, value: this.value() };
    }

    try {
      return { valid: true, value: JSON.parse(this.value()) as unknown };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.record(operation, 'error', `JSON inválido: ${message}`);
      return { valid: false };
    }
  }

  private formatValue(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }

    return JSON.stringify(value, null, 2) ?? String(value);
  }

  private record(operation: string, status: ResultStatus, message: string): void {
    const result: OperationResult = {
      id: ++this.nextResultId,
      operation,
      status,
      message,
      time: new Date().toLocaleTimeString()
    };
    this.results.update((results) => [result, ...results].slice(0, 8));
  }
}
