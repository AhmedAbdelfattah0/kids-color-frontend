import { Component, Input, Output, EventEmitter, AfterViewInit, ViewChild, ElementRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageRecord } from '../../models/image.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-image-customizer',
  templateUrl: './image-customizer.component.html',
  styleUrls: ['./image-customizer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ImageCustomizerComponent implements AfterViewInit {
  @Input() image!: ImageRecord;
  @Input() initialTopText: string = '';
  @Input() initialBottomText: string = '';
  @Output() customizedImageReady = new EventEmitter<string>();

  @ViewChild('previewCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  topText = signal('');
  bottomText = signal('');
  fontColor = signal('#1a1a1a');
  fontSize = signal(36);
  isLoading = signal(true);
  downloading = signal(false);

  private loadedImage: HTMLImageElement | null = null;
  private canvasReady = false;

  readonly colorOptions = [
    { value: '#1a1a1a', label: 'Black' },
    { value: '#FF6B35', label: 'Orange' },
    { value: '#4ECDC4', label: 'Teal' },
    { value: '#9B59B6', label: 'Purple' },
    { value: '#E74C3C', label: 'Red' },
    { value: '#2980B9', label: 'Blue' },
  ];

  async ngAfterViewInit() {
    await this.loadImageForCanvas();
    if (this.initialTopText) this.topText.set(this.initialTopText);
    if (this.initialBottomText) this.bottomText.set(this.initialBottomText);
    this.canvasReady = true;
    this.drawCanvas();
  }

  private async loadImageForCanvas(): Promise<void> {
    // External URLs (R2) are routed through the backend proxy so the canvas
    // stays untainted and toBlob() / download works.
    const src = this.image.imageUrl?.startsWith('http')
      ? `${environment.apiUrl}/api/image-proxy?url=${encodeURIComponent(this.image.imageUrl)}`
      : this.image.imageUrl;

    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.loadedImage = img;
        this.isLoading.set(false);
        resolve();
      };
      img.onerror = () => {
        this.isLoading.set(false);
        resolve();
      };
      img.src = src;
    });
  }

  onTopTextInput(value: string) {
    this.topText.set(value.slice(0, 40));
    this.drawCanvas();
  }

  onBottomTextInput(value: string) {
    this.bottomText.set(value.slice(0, 60));
    this.drawCanvas();
  }

  setColor(color: string) {
    this.fontColor.set(color);
    this.drawCanvas();
  }

  onFontSizeChange(value: string) {
    this.fontSize.set(Number(value));
    this.drawCanvas();
  }

  private drawCanvas() {
    if (!this.canvasReady || !this.loadedImage || !this.canvasRef) return;

    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const img = this.loadedImage;
    const topTxt = this.topText();
    const bottomTxt = this.bottomText();
    const color = this.fontColor();
    const topSize = this.fontSize();
    const bottomSize = Math.max(18, Math.round(topSize * 0.65));
    const imgSize = 512;
    const padding = 14;
    const topStripH = topTxt ? topSize + padding * 2 : 0;
    const bottomStripH = bottomTxt ? bottomSize + padding * 2 : 0;

    canvas.width = imgSize;
    canvas.height = imgSize + topStripH + bottomStripH;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(img, 0, topStripH, imgSize, imgSize);

    const fontStack = '"Fredoka One", "Arial Rounded MT Bold", Arial, sans-serif';

    if (topTxt) {
      ctx.font = `bold ${topSize}px ${fontStack}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(topTxt, imgSize / 2, topStripH / 2, imgSize - 24);
    }

    if (bottomTxt) {
      ctx.font = `${bottomSize}px ${fontStack}`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(bottomTxt, imgSize / 2, imgSize + topStripH + bottomStripH / 2, imgSize - 24);
    }

    this.customizedImageReady.emit(canvas.toDataURL('image/png'));
  }

  downloadCustomized() {
    if (!this.canvasRef || this.downloading()) return;
    this.downloading.set(true);
    const canvas = this.canvasRef.nativeElement;
    canvas.toBlob((blob) => {
      if (!blob) { this.downloading.set(false); return; }
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kidscolor-${this.image.keyword.replace(/\s+/g, '-')}-custom.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      this.downloading.set(false);
    }, 'image/png');
  }
}
