import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ImageRecord } from '../../models/image.model';

@Component({
  selector: 'app-image-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './image-card.component.html'
})
export class ImageCardComponent {
  @Input({ required: true }) image!: ImageRecord;
  @Input() showActions: boolean = true;

  isPrinting = false;

  onPrint(): void {
    this.isPrinting = true;
    setTimeout(() => {
      window.print();
      window.addEventListener('afterprint', () => {
        this.isPrinting = false;
      }, { once: true });
    });
  }

  async onDownload(): Promise<void> {
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
}
