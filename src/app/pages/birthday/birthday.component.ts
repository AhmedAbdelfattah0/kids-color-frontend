import { Component, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BirthdayService, BirthdayOptions, BirthdayTheme } from '../../services/birthday.service';
import { PdfExportService } from '../../services/pdf-export.service';
import { ImageCustomizerComponent } from '../../components/image-customizer/image-customizer.component';
import { ImageCardComponent } from '../../components/image-card/image-card.component';
import { ImageRecord } from '../../models/image.model';

type Mode = 'form' | 'single' | 'pack';

@Component({
  selector: 'app-birthday',
  templateUrl: './birthday.component.html',
  styleUrls: ['./birthday.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ImageCustomizerComponent, ImageCardComponent]
})
export class BirthdayComponent implements OnDestroy {
  private birthdayService = inject(BirthdayService);
  private pdfExportService = inject(PdfExportService);

  // Form state
  childName = signal('');
  age = signal<number>(5);
  selectedTheme = signal<string>('unicorn');
  message = signal('');

  // UI state
  mode = signal<Mode>('form');
  isGenerating = signal(false);
  isExporting = signal(false);
  error = signal<string | null>(null);

  // Single image result
  singleImage = signal<ImageRecord | null>(null);

  // Pack overlay
  selectedPackImage = signal<ImageRecord | null>(null);

  // Pack results
  packImages = signal<ImageRecord[]>([]);
  progressCurrent = signal(0);
  progressTotal = signal(6);
  progressKeyword = signal('');
  statusMessage = signal('');
  isStreaming = signal(false);

  themes = this.birthdayService.themes;
  Math = Math;

  private stopStream?: () => void;

  get selectedThemeData(): BirthdayTheme | undefined {
    return this.themes.find(t => t.id === this.selectedTheme());
  }

  get progressPercent(): number {
    const total = this.progressTotal();
    return total > 0 ? Math.round((this.progressCurrent() / total) * 100) : 0;
  }

  get options(): BirthdayOptions {
    return {
      childName: this.childName(),
      age: this.age(),
      theme: this.selectedTheme(),
      message: this.message()
    };
  }

  isFormValid = computed(() =>
    this.childName().trim().length > 0 &&
    this.age() >= 1 &&
    this.age() <= 12 &&
    this.selectedTheme().length > 0
  );

  async generateSingle() {
    if (!this.isFormValid()) return;
    this.isGenerating.set(true);
    this.error.set(null);
    this.mode.set('single');
    this.singleImage.set(null);

    try {
      const image = await this.birthdayService.generateSingle(this.options);
      this.singleImage.set(image);
    } catch (err: any) {
      this.error.set('Failed to generate image. Please try again.');
      this.mode.set('form');
    } finally {
      this.isGenerating.set(false);
    }
  }

  generatePack() {
    if (!this.isFormValid()) return;
    this.mode.set('pack');
    this.packImages.set([]);
    this.isStreaming.set(true);
    this.error.set(null);
    this.progressTotal.set(6);

    this.stopStream = this.birthdayService.streamBirthdayPack(
      this.options,
      (image) => this.packImages.update(imgs => [...imgs, image]),
      (current, total, keyword) => {
        this.progressCurrent.set(current);
        this.progressTotal.set(total);
        this.progressKeyword.set(keyword);
      },
      (total) => {
        this.isStreaming.set(false);
        this.statusMessage.set(`${total} pages ready for ${this.childName()}!`);
      },
      (message) => this.statusMessage.set(message)
    );
  }

  async exportPackPdf() {
    this.isExporting.set(true);
    try {
      await this.pdfExportService.exportToPdf(this.packImages());
    } finally {
      this.isExporting.set(false);
    }
  }

  onCustomizedImage(_dataUrl: string) {
    // Customizer emits its own download — no further action needed here
  }

  onPackImageCustomized(_dataUrl: string) {
    // User can download directly from the customizer
  }

  resetToForm() {
    this.stopStream?.();
    this.mode.set('form');
    this.singleImage.set(null);
    this.packImages.set([]);
    this.isStreaming.set(false);
    this.selectedPackImage.set(null);
    this.error.set(null);
  }

  ngOnDestroy() {
    this.stopStream?.();
  }
}
