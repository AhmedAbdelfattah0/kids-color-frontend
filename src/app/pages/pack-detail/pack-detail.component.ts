import { Component, OnInit, OnDestroy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PacksService, Pack } from '../../services/packs.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { ImageRecord } from '../../models/image.model';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { BulkActionBarComponent } from '../../components/bulk-action-bar/bulk-action-bar.component';

@Component({
  selector: 'app-pack-detail',
  templateUrl: './pack-detail.component.html',
  styleUrls: ['./pack-detail.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ImageCardComponent, BulkActionBarComponent]
})
export class PackDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private packsService = inject(PacksService);
  private pdfExportService = inject(PdfExportService);

  pack = signal<Pack | null>(null);
  images = signal<ImageRecord[]>([]);
  isStreaming = signal(false);
  isExporting = signal(false);
  statusMessage = signal('');
  progressCurrent = signal(0);
  progressTotal = signal(24);
  error = signal<string | null>(null);

  private stopStream?: () => void;

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/packs']); return; }

    const pack = await this.packsService.getById(id);
    if (!pack) { this.error.set('Pack not found'); return; }
    this.pack.set(pack);

    this.isStreaming.set(true);
    this.statusMessage.set('Loading pack...');

    this.stopStream = this.packsService.streamPackGeneration(
      id,
      (image) => {
        this.images.update(imgs => [...imgs, image]);
      },
      (current, total, keyword) => {
        this.progressCurrent.set(current);
        this.progressTotal.set(total);
        this.statusMessage.set(`Generating ${keyword}...`);
      },
      (total) => {
        this.isStreaming.set(false);
        this.statusMessage.set(`${total} pages ready!`);
      },
      (message) => {
        this.statusMessage.set(message);
      }
    );
  }

  ngOnDestroy() {
    this.stopStream?.();
  }

  get progressPercent(): number {
    const total = this.progressTotal();
    return total > 0 ? Math.round((this.progressCurrent() / total) * 100) : 0;
  }

  async printAll() {
    this.isExporting.set(true);
    try {
      await this.pdfExportService.exportToPdf(this.images());
    } finally {
      this.isExporting.set(false);
    }
  }

  goBack() {
    this.stopStream?.();
    this.router.navigate(['/packs']);
  }
}
