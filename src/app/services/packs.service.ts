import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ImageRecord } from '../models/image.model';

export interface Pack {
  id: string;
  title: string;
  emoji: string;
  description: string;
  category: string;
  difficulty: string;
  ageRange: string;
  cachedCount?: number;
  isReady?: boolean;
  totalPages?: number;
}

@Injectable({ providedIn: 'root' })
export class PacksService {
  packs = signal<Pack[]>([]);
  isLoading = signal(false);

  async loadPacks(): Promise<Pack[]> {
    this.isLoading.set(true);
    try {
      const response = await fetch(`${environment.apiUrl}/api/packs`);
      const data = await response.json();
      this.packs.set(data.packs);
      return data.packs;
    } catch (err) {
      console.error('[Packs] Failed to load:', err);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async getById(id: string): Promise<Pack | null> {
    try {
      const response = await fetch(`${environment.apiUrl}/api/packs/${id}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  // Stream pack generation via SSE — calls onImage for each generated image
  streamPackGeneration(
    packId: string,
    onImage: (image: ImageRecord) => void,
    onProgress: (current: number, total: number, keyword: string) => void,
    onComplete: (total: number) => void,
    onStatus: (message: string) => void
  ): () => void {
    const eventSource = new EventSource(
      `${environment.apiUrl}/api/packs/${packId}/generate-stream`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case 'status':
          onStatus(data.message);
          break;
        case 'progress':
          onProgress(data.current, data.total, data.keyword);
          break;
        case 'image': {
          const img: ImageRecord = data.image;
          img.imageUrl = img.imageUrl.startsWith('http')
            ? img.imageUrl
            : `${environment.apiUrl}${img.imageUrl}`;
          onImage(img);
          break;
        }
        case 'complete':
          onComplete(data.total);
          eventSource.close();
          break;
        case 'fatal':
          console.error('[Pack SSE] Fatal error:', data.message);
          eventSource.close();
          break;
      }
    };

    eventSource.onerror = () => {
      console.error('[Pack SSE] Connection error');
      eventSource.close();
    };

    // Return cleanup function
    return () => eventSource.close();
  }
}
