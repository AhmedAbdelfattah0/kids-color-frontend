import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { BulkSelectService } from '../../services/bulk-select.service';
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
  private bulkSelectService = inject(BulkSelectService);

  isFavorited = computed(() => this.favoritesService.isFavorited(this.image.id));
  isSelectionMode = computed(() => this.bulkSelectService.isSelectionMode());
  isSelected = computed(() => this.bulkSelectService.isSelected(this.image.id));

  private longPressTimeout: ReturnType<typeof setTimeout> | null = null;
  private longPressJustFired = false;

  onPointerDown() {
    this.longPressTimeout = setTimeout(() => {
      this.longPressJustFired = true;
      this.handleLongPress();
      this.longPressTimeout = null;
    }, 600);
  }

  onPointerUp() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  onPointerLeave() {
    if (this.longPressTimeout) {
      clearTimeout(this.longPressTimeout);
      this.longPressTimeout = null;
    }
  }

  handleClick() {
    if (this.longPressJustFired) {
      this.longPressJustFired = false;
      return;
    }
    if (this.isSelectionMode()) {
      this.bulkSelectService.toggleSelection(this.image);
    } else {
      this.router.navigate(['/gallery', this.image.id]);
    }
  }

  handleLongPress() {
    this.bulkSelectService.enterSelectionMode();
    this.bulkSelectService.toggleSelection(this.image);
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
