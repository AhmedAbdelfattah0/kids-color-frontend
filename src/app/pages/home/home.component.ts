import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryPickerComponent } from '../../components/category-picker/category-picker.component';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { GalleryService } from '../../services/gallery.service';
import { GeneratorService } from '../../services/generator.service';
import { CategoryService } from '../../services/category.service';
import { BulkSelectService } from '../../services/bulk-select.service';
import { PacksService, Pack } from '../../services/packs.service';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, CategoryPickerComponent, ImageCardComponent],
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  private galleryService = inject(GalleryService);
  private generatorService = inject(GeneratorService);
  private categoryService = inject(CategoryService);
  private bulkSelectService = inject(BulkSelectService);
  private packsService = inject(PacksService);
  private router = inject(Router);

  keyword = signal('');
  popularImages = signal<ImageRecord[]>([]);
  recentImages = signal<ImageRecord[]>([]);
  featuredPacks = signal<Pack[]>([]);
  isLoadingPopular = signal(false);
  isLoadingRecent = signal(false);

  async ngOnInit() {
    await Promise.all([this.loadImages(), this.loadFeaturedPacks()]);
  }

  async loadImages() {
    this.isLoadingPopular.set(true);
    this.isLoadingRecent.set(true);

    const [popular, recent] = await Promise.all([
      this.galleryService.loadPopular(6),
      this.galleryService.loadRecent(6)
    ]);

    this.popularImages.set(popular);
    this.recentImages.set(recent);
    this.isLoadingPopular.set(false);
    this.isLoadingRecent.set(false);
  }

  async loadFeaturedPacks() {
    const packs = await this.packsService.loadPacks();
    this.featuredPacks.set(packs.slice(0, 4));
  }

  enterSelectionMode() {
    this.bulkSelectService.enterSelectionMode();
  }

  onCategorySelected(categoryId: string | null) {
    if (categoryId) {
      const kw = this.categoryService.getRandomKeyword(categoryId);
      this.keyword.set(kw);
    }
  }

  async onGenerate() {
    const kw = this.keyword().trim();
    if (!kw) return;

    this.router.navigate(['/generate'], {
      queryParams: { keyword: kw }
    });
  }

  getDifficultyClass(difficulty: string): string {
    const map: Record<string, string> = {
      simple:   'bg-green-100 text-green-700',
      medium:   'bg-yellow-100 text-yellow-700',
      detailed: 'bg-purple-100 text-purple-700',
    };
    return map[difficulty] || 'bg-gray-100 text-gray-600';
  }

  getDifficultyLabel(difficulty: string): string {
    const map: Record<string, string> = { simple: 'Easy', medium: 'Medium', detailed: 'Detailed' };
    return map[difficulty] || difficulty;
  }
}
