import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BulkSelectService } from '../../services/bulk-select.service';
import { PdfExportService } from '../../services/pdf-export.service';

@Component({
  selector: 'app-bulk-action-bar',
  templateUrl: './bulk-action-bar.component.html',
  styleUrls: ['./bulk-action-bar.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class BulkActionBarComponent {
  private bulkSelectService = inject(BulkSelectService);
  private pdfExportService = inject(PdfExportService);

  isVisible = computed(() => this.bulkSelectService.isSelectionMode());
  selectedCount = computed(() => this.bulkSelectService.selectedCount());
  isExporting = false;

  async exportPdf() {
    const images = this.bulkSelectService.getSelectedImages();
    if (images.length === 0) return;
    this.isExporting = true;
    try {
      await this.pdfExportService.exportToPdf(images);
      this.bulkSelectService.clearSelection();
    } catch (err) {
      console.error('[BulkExport] Failed:', err);
    } finally {
      this.isExporting = false;
    }
  }

  cancel() {
    this.bulkSelectService.exitSelectionMode();
  }
}
