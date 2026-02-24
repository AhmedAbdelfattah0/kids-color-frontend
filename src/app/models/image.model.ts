export interface ImageRecord {
  id: string;
  keyword: string;
  category?: string;
  imageUrl: string;
  prompt: string;
  downloadCount: number;
  printCount: number;
  fromCache?: boolean;
  source?: string;
  createdAt: string;
  difficulty?: 'simple' | 'medium' | 'detailed';
  ageRange?: '2-4' | '5-8' | '9-12';
  relatedImages?: ImageRecord[];
}

export interface Category {
  id: string;
  label: string;
  emoji: string;
  keywords: string[];
}

export interface GalleryParams {
  page?: number;
  limit?: number;
  category?: string;
  sort?: 'newest' | 'popular';
  search?: string;
  difficulty?: string;
  ageRange?: string;
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
  difficulty?: string;
  ageRange?: string;
}
