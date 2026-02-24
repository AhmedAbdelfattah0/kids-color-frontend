import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ImageRecord, GalleryParams, GalleryResponse } from '../models/image.model';
import { environment } from '../../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class GalleryService {
  private apiUrl = environment.apiUrl;

  images = signal<ImageRecord[]>([]);
  isLoading = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  total = signal<number>(0);

  constructor(private http: HttpClient) {}

  async loadGallery(params: GalleryParams = {}): Promise<void> {
    this.isLoading.set(true);

    try {
      let httpParams = new HttpParams();

      if (params.page) httpParams = httpParams.set('page', params.page.toString());
      if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
      if (params.category) httpParams = httpParams.set('category', params.category);
      if (params.sort) httpParams = httpParams.set('sort', params.sort);
      if (params.search) httpParams = httpParams.set('search', params.search);
      if (params.difficulty) httpParams = httpParams.set('difficulty', params.difficulty);
      if (params.ageRange) httpParams = httpParams.set('ageRange', params.ageRange);

      const response = await this.http.get<GalleryResponse>(
        `${this.apiUrl}/api/gallery`,
        { params: httpParams }
      ).toPromise();

      if (response) {
        // Make imageUrls absolute
        const imagesWithAbsoluteUrls = response.images.map(img => ({
          ...img,
          imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
        }));

        this.images.set(imagesWithAbsoluteUrls);
        this.currentPage.set(response.page);
        this.totalPages.set(response.totalPages);
        this.hasMore.set(response.hasMore);
        this.total.set(response.total);
      }
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadMore(): Promise<void> {
    if (!this.hasMore() || this.isLoading()) {
      return;
    }

    const nextPage = this.currentPage() + 1;
    this.isLoading.set(true);

    try {
      const response = await this.http.get<GalleryResponse>(
        `${this.apiUrl}/api/gallery`,
        { params: new HttpParams().set('page', nextPage.toString()) }
      ).toPromise();

      if (response) {
        // Make imageUrls absolute
        const imagesWithAbsoluteUrls = response.images.map(img => ({
          ...img,
          imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
        }));

        this.images.update(current => [...current, ...imagesWithAbsoluteUrls]);
        this.currentPage.set(response.page);
        this.hasMore.set(response.hasMore);
      }
    } catch (error) {
      console.error('Error loading more images:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async loadPopular(limit: number = 12): Promise<ImageRecord[]> {
    try {
      const response = await this.http.get<{ images: ImageRecord[] }>(
        `${this.apiUrl}/api/gallery/popular`,
        { params: new HttpParams().set('limit', limit.toString()) }
      ).toPromise();

      if (response) {
        return response.images.map(img => ({
          ...img,
          imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
        }));
      }

      return [];
    } catch (error) {
      console.error('Error loading popular images:', error);
      return [];
    }
  }

  async loadRecent(limit: number = 12): Promise<ImageRecord[]> {
    try {
      const response = await this.http.get<{ images: ImageRecord[] }>(
        `${this.apiUrl}/api/gallery/recent`,
        { params: new HttpParams().set('limit', limit.toString()) }
      ).toPromise();

      if (response) {
        return response.images.map(img => ({
          ...img,
          imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
        }));
      }

      return [];
    } catch (error) {
      console.error('Error loading recent images:', error);
      return [];
    }
  }

  async getImageById(id: string): Promise<ImageRecord | null> {
    try {
      const response = await this.http.get<ImageRecord>(
        `${this.apiUrl}/api/gallery/${id}`
      ).toPromise();

      if (response) {
        // Make all imageUrls absolute
        response.imageUrl = response.imageUrl.startsWith('http')
          ? response.imageUrl
          : `${this.apiUrl}${response.imageUrl}`;

        if (response.relatedImages) {
          response.relatedImages = response.relatedImages.map(img => ({
            ...img,
            imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
          }));
        }

        return response;
      }

      return null;
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  }

  resetPagination(): void {
    this.images.set([]);
    this.currentPage.set(1);
    this.hasMore.set(true);
  }

  async getById(id: string): Promise<ImageRecord> {
    const response = await fetch(`${this.apiUrl}/api/gallery/${id}`);
    if (!response.ok) throw new Error('Image not found');
    const image: ImageRecord = await response.json();
    image.imageUrl = image.imageUrl.startsWith('http') ? image.imageUrl : `${this.apiUrl}${image.imageUrl}`;
    return image;
  }

  async getRelated(category: string | undefined, excludeId: string): Promise<ImageRecord[]> {
    if (!category) return [];
    const response = await fetch(
      `${this.apiUrl}/api/gallery?category=${category}&limit=8&exclude=${excludeId}`
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.images as ImageRecord[])
      .filter(img => img.id !== excludeId)
      .map(img => ({
        ...img,
        imageUrl: img.imageUrl.startsWith('http') ? img.imageUrl : `${this.apiUrl}${img.imageUrl}`
      }))
      .slice(0, 6);
  }

  async recordDownload(id: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/gallery/${id}/download`, { method: 'POST' });
    } catch (error) {
      console.error('Error recording download:', error);
    }
  }

  async recordPrint(id: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/api/gallery/${id}/print`, { method: 'POST' });
    } catch (error) {
      console.error('Error recording print:', error);
    }
  }
}
