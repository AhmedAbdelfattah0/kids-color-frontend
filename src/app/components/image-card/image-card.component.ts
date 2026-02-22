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

  onPrint(): void {
    const printWindow = window.open(this.image.imageUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  }

  onDownload(): void {
    const link = document.createElement('a');
    link.href = this.image.imageUrl;
    link.download = `kidscolor-${this.image.keyword.replace(/\s+/g, '-')}.png`;
    link.click();
  }
}
