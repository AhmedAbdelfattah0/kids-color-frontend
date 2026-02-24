import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';
import { BulkSelectService } from '../../services/bulk-select.service';
import { ImageCardComponent } from '../../components/image-card/image-card.component';

@Component({
  selector: 'app-favorites',
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ImageCardComponent]
})
export class FavoritesComponent {
  favoritesService = inject(FavoritesService);
  private bulkSelectService = inject(BulkSelectService);
  showConfirmModal = signal(false);

  enterSelectionMode() {
    this.bulkSelectService.enterSelectionMode();
  }

  confirmClearAll() {
    this.showConfirmModal.set(true);
  }

  cancelClear() {
    this.showConfirmModal.set(false);
  }

  executeClearAll() {
    this.favoritesService.clearAll();
    this.showConfirmModal.set(false);
  }
}
