import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoryPickerComponent } from '../../components/category-picker/category-picker.component';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { GalleryService } from '../../services/gallery.service';
import { GeneratorService } from '../../services/generator.service';
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
  private router = inject(Router);

  keyword = signal('');
  popularImages = signal<ImageRecord[]>([]);
  recentImages = signal<ImageRecord[]>([]);
  isLoadingPopular = signal(false);
  isLoadingRecent = signal(false);

  async ngOnInit() {
    await this.loadImages();
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

  onCategorySelected(event: { categoryId: string; keyword: string }) {
    this.keyword.set(event.keyword);
  }

  async onGenerate() {
    const kw = this.keyword().trim();
    if (!kw) return;

    this.router.navigate(['/generate'], {
      queryParams: { keyword: kw }
    });
  }
}
