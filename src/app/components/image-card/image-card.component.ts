import { Component, Input, Output, EventEmitter, computed, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { BulkSelectService } from '../../services/bulk-select.service';
import { ZoomPreviewComponent } from '../zoom-preview/zoom-preview.component';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss'],
  standalone: true,
  imports: [CommonModule, ZoomPreviewComponent]
})
export class ImageCardComponent {
  @Input() image!: ImageRecord;
  @Output() cardClick = new EventEmitter<ImageRecord>();

  private router = inject(Router);
  private favoritesService = inject(FavoritesService);
  private bulkSelectService = inject(BulkSelectService);

  isFavorited = computed(() => this.favoritesService.isFavorited(this.image.id));
  isSelectionMode = computed(() => this.bulkSelectService.isSelectionMode());
  isSelected = computed(() => this.bulkSelectService.isSelected(this.image.id));
  isZoomed = signal(false);

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
    } else if (this.cardClick.observed) {
      this.cardClick.emit(this.image);
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

  openZoom(event: Event) {
    event.stopPropagation();
    this.isZoomed.set(true);
  }

  closeZoom() {
    this.isZoomed.set(false);
  }
}
