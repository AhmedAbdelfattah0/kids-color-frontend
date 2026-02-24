import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { GalleryService } from '../../services/gallery.service';
import { CategoryService } from '../../services/category.service';
import { BulkSelectService } from '../../services/bulk-select.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCardComponent],
  templateUrl: './gallery.component.html'
})
export class GalleryComponent implements OnInit {
  galleryService = inject(GalleryService);
  private categoryService = inject(CategoryService);
  private bulkSelectService = inject(BulkSelectService);

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal<'newest' | 'popular'>('newest');
  difficultyFilter = signal<string>('all');
  ageFilter = signal<string>('all');

  categories = this.categoryService.categories;

  difficultyOptions = [
    { value: 'all', label: '🎨 All' },
    { value: 'simple', label: '😊 Simple' },
    { value: 'medium', label: '🙂 Medium' },
    { value: 'detailed', label: '🤩 Detailed' }
  ];

  ageOptions = [
    { value: 'all', label: '👶 All Ages' },
    { value: '2-4', label: '🍼 2–4 yrs' },
    { value: '5-8', label: '🎒 5–8 yrs' },
    { value: '9-12', label: '📚 9–12 yrs' }
  ];

  async ngOnInit() {
    await this.loadGallery();
  }

  async loadGallery() {
    this.galleryService.resetPagination();
    await this.galleryService.loadGallery({
      search: this.searchQuery() || undefined,
      category: this.selectedCategory() || undefined,
      sort: this.sortBy(),
      difficulty: this.difficultyFilter() !== 'all' ? this.difficultyFilter() : undefined,
      ageRange: this.ageFilter() !== 'all' ? this.ageFilter() : undefined
    });
  }

  async onSearch() {
    await this.loadGallery();
  }

  async onCategoryFilter(categoryId: string | null) {
    this.selectedCategory.set(categoryId);
    await this.loadGallery();
  }

  async onSortChange(sort: 'newest' | 'popular') {
    this.sortBy.set(sort);
    await this.loadGallery();
  }

  async onLoadMore() {
    await this.galleryService.loadMore();
  }

  enterSelectionMode() {
    this.bulkSelectService.enterSelectionMode();
  }
}
