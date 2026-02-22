import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { GalleryService } from '../../services/gallery.service';
import { CategoryService } from '../../services/category.service';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCardComponent],
  templateUrl: './gallery.component.html'
})
export class GalleryComponent implements OnInit {
  galleryService = inject(GalleryService);
  private categoryService = inject(CategoryService);

  searchQuery = signal('');
  selectedCategory = signal<string | null>(null);
  sortBy = signal<'newest' | 'popular'>('newest');

  categories = this.categoryService.categories;

  async ngOnInit() {
    await this.loadGallery();
  }

  async loadGallery() {
    this.galleryService.resetPagination();
    await this.galleryService.loadGallery({
      search: this.searchQuery() || undefined,
      category: this.selectedCategory() || undefined,
      sort: this.sortBy()
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
}
