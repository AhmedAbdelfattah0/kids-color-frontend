import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Category } from '../models/image.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = environment.apiUrl;

  categories = signal<Category[]>([]);
  isLoading = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.loadCategories();
  }

  async loadCategories(): Promise<void> {
    if (this.categories().length > 0) {
      return; // Already loaded
    }

    this.isLoading.set(true);
    try {
      const response = await this.http.get<{ categories: Category[] }>(
        `${this.apiUrl}/api/categories`
      ).toPromise();

      if (response) {
        this.categories.set(response.categories);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async getCategories(): Promise<Category[]> {
    if (this.categories().length === 0) {
      await this.loadCategories();
    }
    return this.categories();
  }

  getRandomKeyword(categoryId?: string): string {
    const categories = this.categories();

    if (categoryId) {
      const category = categories.find(c => c.id === categoryId);
      if (category && category.keywords.length > 0) {
        const randomIndex = Math.floor(Math.random() * category.keywords.length);
        return category.keywords[randomIndex];
      }
    }

    // Get random from all categories
    const allKeywords = categories.flatMap(c => c.keywords);
    if (allKeywords.length > 0) {
      const randomIndex = Math.floor(Math.random() * allKeywords.length);
      return allKeywords[randomIndex];
    }

    return 'dinosaur'; // Fallback
  }

  async getRandomKeywordFromAPI(categoryId?: string): Promise<string> {
    try {
      const url = categoryId
        ? `${this.apiUrl}/api/categories/random?category=${categoryId}`
        : `${this.apiUrl}/api/categories/random`;

      const response = await this.http.get<{ keyword: string }>(url).toPromise();
      return response?.keyword || this.getRandomKeyword(categoryId);
    } catch (error) {
      console.error('Error getting random keyword:', error);
      return this.getRandomKeyword(categoryId);
    }
  }
}
