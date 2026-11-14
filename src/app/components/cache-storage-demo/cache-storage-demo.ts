import { Component, inject, signal } from '@angular/core';
import { CacheStorageService, type CacheMatchOptions } from '@sebastian-henao/storage-manager';

type ResultStatus = 'success' | 'info' | 'error';

interface OperationResult {
  id: number;
  operation: string;
  status: ResultStatus;
  message: string;
  time: string;
}

@Component({
  selector: 'app-cache-storage-demo',
  imports: [],
  templateUrl: './cache-storage-demo.html',
  styleUrl: './cache-storage-demo.scss'
})
export class CacheStorageDemo {
  private readonly cacheService = inject(CacheStorageService);
  private nextResultId = 0;

  readonly cacheName = signal('storage-manager-demo');
  readonly url = signal('/api/showcase.json');
  readonly content = signal('{"mensaje":"Hola desde Cache Storage"}');
  readonly ignoreSearch = signal(false);
  readonly ignoreMethod = signal(false);
  readonly ignoreVary = signal(false);
  readonly supported = this.cacheService.isSupported();
  readonly results = signal<OperationResult[]>([]);

  async open(): Promise<void> {
    const cache = await this.cacheService.openCache(this.cacheName());
    this.record(
      'openCache',
      cache ? 'success' : 'error',
      cache ? `Caché abierta: ${this.cacheName()}` : 'null — no se pudo abrir la caché'
    );
  }

  async put(): Promise<void> {
    const stored = await this.cacheService.put(
      this.cacheName(),
      this.url(),
      new Response(this.content(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' }
      })
    );
    this.record(
      'put',
      stored ? 'success' : 'error',
      stored ? `true — respuesta guardada para ${this.url()}` : 'false — no se pudo guardar la respuesta'
    );
  }

  async match(): Promise<void> {
    const response = await this.cacheService.match(
      this.cacheName(),
      this.url(),
      this.matchOptions()
    );

    if (!response) {
      this.record('match', 'info', 'null — no se encontró una respuesta para esta URL');
      return;
    }

    const body = await response.text();
    this.record('match', 'success', `Response (${response.status}):\n${body}`);
  }

  async list(): Promise<void> {
    const names = await this.cacheService.listCaches();
    this.record('listCaches', names.length > 0 ? 'success' : 'info', JSON.stringify(names, null, 2));
  }

  async keys(): Promise<void> {
    const entries = await this.cacheService.keys(this.cacheName());
    this.record(
      'keys',
      entries.length > 0 ? 'success' : 'info',
      JSON.stringify(entries, null, 2)
    );
  }

  async deleteEntry(): Promise<void> {
    const deleted = await this.cacheService.deleteEntry(
      this.cacheName(),
      this.url(),
      this.matchOptions()
    );
    this.record(
      'deleteEntry',
      deleted ? 'success' : 'info',
      deleted ? 'true — entrada eliminada' : 'false — no existe o no se pudo eliminar'
    );
  }

  async deleteCache(): Promise<void> {
    const deleted = await this.cacheService.deleteCache(this.cacheName());
    this.record(
      'deleteCache',
      deleted ? 'success' : 'info',
      deleted ? 'true — caché eliminada' : 'false — no existe o no se pudo eliminar'
    );
  }

  private matchOptions(): CacheMatchOptions {
    return {
      ignoreSearch: this.ignoreSearch(),
      ignoreMethod: this.ignoreMethod(),
      ignoreVary: this.ignoreVary()
    };
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
