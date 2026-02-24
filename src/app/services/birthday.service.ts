import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ImageRecord } from '../models/image.model';

export interface BirthdayOptions {
  childName: string;
  age: number;
  theme: string;
  message: string;
}

export interface BirthdayTheme {
  id: string;
  label: string;
  emoji: string;
}

@Injectable({ providedIn: 'root' })
export class BirthdayService {

  themes: BirthdayTheme[] = [
    { id: 'unicorn',    label: 'Unicorn',      emoji: '🦄' },
    { id: 'dinosaur',  label: 'Dinosaur',      emoji: '🦕' },
    { id: 'princess',  label: 'Princess',      emoji: '👸' },
    { id: 'superhero', label: 'Superhero',     emoji: '🦸' },
    { id: 'space',     label: 'Space',         emoji: '🚀' },
    { id: 'mermaid',   label: 'Mermaid',       emoji: '🧜' },
    { id: 'pirate',    label: 'Pirate',        emoji: '🏴‍☠️' },
    { id: 'animals',   label: 'Animals',       emoji: '🐾' },
    { id: 'cars',      label: 'Cars & Trucks', emoji: '🚗' },
    { id: 'fairy',     label: 'Fairy',         emoji: '🧚' },
    { id: 'dragon',    label: 'Dragon',        emoji: '🐉' },
    { id: 'ocean',     label: 'Ocean',         emoji: '🌊' }
  ];

  async generateSingle(options: BirthdayOptions): Promise<ImageRecord> {
    const theme = this.themes.find(t => t.id === options.theme);
    const response = await fetch(`${environment.apiUrl}/api/birthday/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...options,
        themeLabel: theme?.label ?? options.theme
      })
    });
    if (!response.ok) throw new Error('Birthday generation failed');
    return response.json();
  }

  streamBirthdayPack(
    options: BirthdayOptions,
    onImage: (image: ImageRecord) => void,
    onProgress: (current: number, total: number, keyword: string) => void,
    onComplete: (total: number) => void,
    onStatus: (message: string) => void
  ): () => void {
    const theme = this.themes.find(t => t.id === options.theme);
    const params = new URLSearchParams({
      childName: options.childName,
      age: options.age.toString(),
      theme: options.theme,
      themeLabel: theme?.label ?? options.theme,
      message: options.message
    });

    const eventSource = new EventSource(
      `${environment.apiUrl}/api/birthday/generate-pack-stream?${params}`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      switch (data.type) {
        case 'status':   onStatus(data.message); break;
        case 'progress': onProgress(data.current, data.total, data.keyword); break;
        case 'image':    onImage(data.image); break;
        case 'complete': onComplete(data.total); eventSource.close(); break;
        case 'fatal':    console.error('[Birthday SSE]', data.message); eventSource.close(); break;
      }
    };

    eventSource.onerror = () => {
      console.error('[Birthday SSE] Connection error');
      eventSource.close();
    };

    return () => eventSource.close();
  }
}
