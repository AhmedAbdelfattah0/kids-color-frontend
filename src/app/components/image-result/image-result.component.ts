import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageRecord } from '../../models/image.model';
import { GeneratorService } from '../../services/generator.service';

@Component({
  selector: 'app-image-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-result.component.html'
})
export class ImageResultComponent {
  private generatorService = inject(GeneratorService);

  @Input({ required: true }) image!: ImageRecord;
  @Output() generateAnother = new EventEmitter<void>();
  @Output() tryAnother = new EventEmitter<void>();

  async onPrint(): Promise<void> {
    // Record print in backend
    await this.generatorService.recordPrint(this.image.id);

    // Open print dialog
    window.print();
  }

  async onDownload(): Promise<void> {
    await this.generatorService.recordDownload(this.image.id);

    // Fetch as blob first — required for cross-origin URLs where the
    // <a download> attribute is ignored by the browser.
    const response = await fetch(this.image.imageUrl);
    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);

    const ext = this.image.imageUrl.split('.').pop() || 'png';
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = `kidscolor-${this.image.keyword.replace(/\s+/g, '-')}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objectUrl);
  }

  onGenerateAnother(): void {
    this.generateAnother.emit();
  }

  onTryAnother(): void {
    this.tryAnother.emit();
  }

  onShare(): void {
    if (navigator.share) {
      navigator.share({
        title: `${this.image.keyword} coloring page - KidsColor`,
        text: `Check out this ${this.image.keyword} coloring page!`,
        url: window.location.href
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  }
}
