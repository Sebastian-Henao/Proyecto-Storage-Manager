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
}
