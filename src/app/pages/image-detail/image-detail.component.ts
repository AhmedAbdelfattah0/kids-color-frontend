import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { GalleryService } from '../../services/gallery.service';
import { GeneratorService } from '../../services/generator.service';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-image-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ImageCardComponent],
  templateUrl: './image-detail.component.html'
})
export class ImageDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private galleryService = inject(GalleryService);
  private generatorService = inject(GeneratorService);

  image = signal<ImageRecord | null>(null);
  isLoading = signal(true);

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/gallery']);
      return;
    }

    await this.loadImage(id);
  }

  async loadImage(id: string) {
    this.isLoading.set(true);
    const img = await this.galleryService.getImageById(id);
    this.image.set(img);
    this.isLoading.set(false);
  }

  async onPrint() {
    const img = this.image();
    if (!img) return;

    await this.generatorService.recordPrint(img.id);
    window.print();
  }

  async onDownload() {
    const img = this.image();
    if (!img) return;

    await this.generatorService.recordDownload(img.id);

    const response = await fetch(img.imageUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const ext = img.imageUrl.split('.').pop() || 'png';
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `kidscolor-${img.keyword.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  async onGenerateSimilar() {
    const img = this.image();
    if (!img) return;

    this.router.navigate(['/generate'], {
      queryParams: { keyword: img.keyword }
    });
  }
}
