import { Injectable, signal } from '@angular/core';

const HISTORY_KEY = 'kidscolor_search_history';
const MAX_HISTORY = 20;

@Injectable({ providedIn: 'root' })
export class SearchHistoryService {
  history = signal<string[]>(this.loadHistory());

  private loadHistory(): string[] {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  addSearch(keyword: string) {
    const trimmed = keyword.trim().toLowerCase();
    if (!trimmed) return;
    const filtered = this.history().filter(k => k !== trimmed);
    const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
    this.history.set(updated);
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch {}
  }

  clearHistory() {
    this.history.set([]);
    localStorage.removeItem(HISTORY_KEY);
  }
}
