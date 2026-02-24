import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { GalleryService } from '../../services/gallery.service';
import { FavoritesService } from '../../services/favorites.service';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ColorPaletteComponent } from '../../components/color-palette/color-palette.component';
import { ImageCustomizerComponent } from '../../components/image-customizer/image-customizer.component';
import { ZoomPreviewComponent } from '../../components/zoom-preview/zoom-preview.component';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, ImageCardComponent, ColorPaletteComponent, ImageCustomizerComponent, ZoomPreviewComponent]
})
export class ImageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private galleryService = inject(GalleryService);
  private favoritesService = inject(FavoritesService);

  image = signal<ImageRecord | null>(null);
  relatedImages = signal<ImageRecord[]>([]);
  isLoading = signal(true);
  error = signal<string | null>(null);
  linkCopied = signal(false);
  isZoomed = signal(false);

  isFavorited = computed(() => {
    const img = this.image();
    return img ? this.favoritesService.isFavorited(img.id) : false;
  });

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Image not found');
      this.isLoading.set(false);
      return;
    }
    try {
      const image = await this.galleryService.getById(id);
      this.image.set(image);
      const related = await this.galleryService.getRelated(image.category, id);
      this.relatedImages.set(related);
    } catch {
      this.error.set('Image not found or no longer available');
    } finally {
      this.isLoading.set(false);
    }
  }

  print() {
    this.galleryService.recordPrint(this.image()!.id);
    window.print();
  }

  async download() {
    const image = this.image()!;
    this.galleryService.recordDownload(image.id);

    const response = await fetch(image.imageUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const ext = image.imageUrl.split('.').pop() || 'png';
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `kidscolor-${image.keyword.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  toggleFavorite() {
    const image = this.image()!;
    if (this.isFavorited()) {
      this.favoritesService.removeFavorite(image.id);
    } else {
      this.favoritesService.addFavorite(image);
    }
  }

  share() {
    const url = `${window.location.origin}/gallery/${this.image()!.id}`;
    if (navigator.share) {
      navigator.share({ title: `Color a ${this.image()!.keyword}!`, url });
    } else {
      navigator.clipboard.writeText(url);
      this.linkCopied.set(true);
      setTimeout(() => this.linkCopied.set(false), 3000);
    }
  }

  generateSimilar() {
    this.router.navigate(['/generate'], {
      queryParams: { keyword: this.image()!.keyword, forceNew: true }
    });
  }

  goBack() {
    this.router.navigate(['/gallery']);
  }
}
