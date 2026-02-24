import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-zoom-preview',
  templateUrl: './zoom-preview.component.html',
  styleUrls: ['./zoom-preview.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ZoomPreviewComponent {
  @Input() imageUrl!: string;
  @Input() keyword = '';
  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('zoom-backdrop')) {
      this.close.emit();
    }
  }
}
