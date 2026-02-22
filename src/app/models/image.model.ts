export interface ImageRecord {
  id: string;
  keyword: string;
  category?: string;
  imageUrl: string;
  prompt?: string;
  downloadCount: number;
  printCount: number;
  fromCache?: boolean;
  createdAt: string;
  relatedImages?: ImageRecord[];
}

export interface Category {
  id: string;
  label: string;
  icon: string;
  examples: string[];
}

export interface GalleryParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: 'newest' | 'popular';
  search?: string;
}

export interface GalleryResponse {
  images: ImageRecord[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SearchResult {
  found: boolean;
  exact: boolean;
  images: ImageRecord[];
}

export interface GenerateRequest {
  keyword: string;
  category?: string;
  forceNew?: boolean;
}
