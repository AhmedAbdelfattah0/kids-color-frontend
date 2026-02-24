import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageRecord, GenerateRequest } from '../models/image.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GeneratorService {
  private apiUrl = environment.apiUrl;
  private readonly MAX_HISTORY = 12;

  currentImage = signal<ImageRecord | null>(null);
  isLoading = signal<boolean>(false);
  error = signal<string | null>(null);
  sessionHistory = signal<ImageRecord[]>([]);

  constructor(private http: HttpClient) {}

  async generate(
    keyword: string,
    options: { category?: string; forceNew?: boolean; difficulty?: string; ageRange?: string } = {}
  ): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const request: GenerateRequest = {
        keyword: keyword.trim(),
        category: options.category,
        forceNew: options.forceNew,
        difficulty: options.difficulty,
        ageRange: options.ageRange
      };

      const image = await this.http.post<ImageRecord>(
        `${this.apiUrl}/api/generate`,
        request
      ).toPromise();

      if (image) {
        // Make imageUrl absolute
        if (image.imageUrl && !image.imageUrl.startsWith('http')) {
          image.imageUrl = `${this.apiUrl}${image.imageUrl}`;
        }

        this.currentImage.set(image);

        // Add to session history (max 12 items)
        const history = [image, ...this.sessionHistory()];
        if (history.length > this.MAX_HISTORY) {
          history.pop();
        }
        this.sessionHistory.set(history);
      }
    } catch (err: any) {
      const errorMessage = err.error?.error || err.message || 'Failed to generate image';
      this.error.set(errorMessage);
      console.error('Error generating image:', err);
    } finally {
      this.isLoading.set(false);
    }
  }

  async checkExisting(keyword: string, category?: string): Promise<ImageRecord | null> {
    try {
      const url = category
        ? `${this.apiUrl}/api/gallery/search?keyword=${encodeURIComponent(keyword)}&category=${category}`
        : `${this.apiUrl}/api/gallery/search?keyword=${encodeURIComponent(keyword)}`;

      const response = await this.http.get<{ found: boolean; images: ImageRecord[] }>(url).toPromise();

      if (response?.found && response.images.length > 0) {
        const image = response.images[0];
        // Make imageUrl absolute
        if (image.imageUrl && !image.imageUrl.startsWith('http')) {
          image.imageUrl = `${this.apiUrl}${image.imageUrl}`;
        }
        return image;
      }

      return null;
    } catch (error) {
      console.error('Error checking existing image:', error);
      return null;
    }
  }

  async recordDownload(id: string): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}/api/gallery/${id}/download`, {}).toPromise();

      // Update current image download count if it matches
      const current = this.currentImage();
      if (current && current.id === id) {
        this.currentImage.set({
          ...current,
          downloadCount: current.downloadCount + 1
        });
      }
    } catch (error) {
      console.error('Error recording download:', error);
    }
  }

  async recordPrint(id: string): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}/api/gallery/${id}/print`, {}).toPromise();

      // Update current image print count if it matches
      const current = this.currentImage();
      if (current && current.id === id) {
        this.currentImage.set({
          ...current,
          printCount: current.printCount + 1
        });
      }
    } catch (error) {
      console.error('Error recording print:', error);
    }
  }

  clearError(): void {
    this.error.set(null);
  }

  clearCurrent(): void {
    this.currentImage.set(null);
  }
}
