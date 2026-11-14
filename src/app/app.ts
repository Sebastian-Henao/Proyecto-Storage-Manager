import { Component } from '@angular/core';
import { CacheStorageDemo } from './components/cache-storage-demo/cache-storage-demo';
import { LocalStorageDemo } from './components/local-storage-demo/local-storage-demo';

@Component({
  selector: 'app-root',
  imports: [LocalStorageDemo, CacheStorageDemo],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {}
