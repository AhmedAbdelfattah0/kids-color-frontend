import { Injectable, signal, computed } from '@angular/core';
import { ImageRecord } from '../models/image.model';

@Injectable({ providedIn: 'root' })
export class BulkSelectService {
  private selectedIds = signal<Set<string>>(new Set());
  private selectedImages = signal<Map<string, ImageRecord>>(new Map());

  isSelectionMode = signal(false);

  selectedCount = computed(() => this.selectedIds().size);

  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  toggleSelection(image: ImageRecord) {
    const ids = new Set(this.selectedIds());
    const images = new Map(this.selectedImages());

    if (ids.has(image.id)) {
      ids.delete(image.id);
      images.delete(image.id);
    } else {
      ids.add(image.id);
      images.set(image.id, image);
    }

    this.selectedIds.set(ids);
    this.selectedImages.set(images);
  }

  getSelectedImages(): ImageRecord[] {
    return Array.from(this.selectedImages().values());
  }

  clearSelection() {
    this.selectedIds.set(new Set());
    this.selectedImages.set(new Map());
    this.isSelectionMode.set(false);
  }

  enterSelectionMode() {
    this.isSelectionMode.set(true);
  }

  exitSelectionMode() {
    this.clearSelection();
  }
}
