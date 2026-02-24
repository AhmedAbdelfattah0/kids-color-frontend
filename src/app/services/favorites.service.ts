import { Injectable, signal } from '@angular/core';
import { ImageRecord } from '../models/image.model';

const FAVORITES_KEY = 'kidscolor_favorites';
const MAX_FAVORITES = 50;

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  favorites = signal<ImageRecord[]>(this.loadFavorites());

  private loadFavorites(): ImageRecord[] {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private save(favorites: ImageRecord[]) {
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    } catch {
      console.warn('[Favorites] Could not save to localStorage');
    }
  }

  addFavorite(image: ImageRecord) {
    if (this.isFavorited(image.id)) return;
    const updated = [image, ...this.favorites()].slice(0, MAX_FAVORITES);
    this.favorites.set(updated);
    this.save(updated);
  }

  removeFavorite(id: string) {
    const updated = this.favorites().filter(f => f.id !== id);
    this.favorites.set(updated);
    this.save(updated);
  }

  isFavorited(id: string): boolean {
    return this.favorites().some(f => f.id === id);
  }

  clearAll() {
    this.favorites.set([]);
    localStorage.removeItem(FAVORITES_KEY);
  }
}
