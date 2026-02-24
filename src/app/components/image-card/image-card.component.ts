import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ImageCardComponent {
  @Input() image!: ImageRecord;

  private router = inject(Router);
  private favoritesService = inject(FavoritesService);

  isFavorited = computed(() => this.favoritesService.isFavorited(this.image.id));

  navigateToDetail() {
    this.router.navigate(['/gallery', this.image.id]);
  }

  toggleFavorite(event: Event) {
    event.stopPropagation();
    if (this.isFavorited()) {
      this.favoritesService.removeFavorite(this.image.id);
    } else {
      this.favoritesService.addFavorite(this.image);
    }
  }
}
