import { Component, Input, AfterViewInit, ViewChild, ElementRef, signal, Injector, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageRecord } from '../../models/image.model';

type Position = 'above' | 'below' | 'top' | 'bottom';

@Component({
  selector: 'app-image-customizer',
  templateUrl: './image-customizer.component.html',
  styleUrls: ['./image-customizer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ImageCustomizerComponent implements AfterViewInit {
  @Input() image!: ImageRecord;
  @ViewChild('previewCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  text = signal('');
  position = signal<Position>('below');
  fontColor = signal('#1a1a1a');
  fontSize = signal(36);
  isLoading = signal(true);
  downloading = signal(false);

  private loadedImage: HTMLImageElement | null = null;
  private canvasReady = false;

  readonly positions: { value: Position; label: string }[] = [
    { value: 'above',  label: 'Above Image' },
    { value: 'below',  label: 'Below Image' },
    { value: 'top',    label: 'On Image Top' },
    { value: 'bottom', label: 'On Image Bottom' },
  ];

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
    this.canvasReady = true;
    this.drawCanvas();
  }

  private async loadImageForCanvas(): Promise<void> {
    return new Promise<void>((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.loadedImage = img;
        this.isLoading.set(false);
        resolve();
      };
      img.onerror = () => {
        // Retry without crossOrigin as fallback
        const img2 = new Image();
        img2.onload = () => {
          this.loadedImage = img2;
          this.isLoading.set(false);
          resolve();
        };
        img2.onerror = () => {
          this.isLoading.set(false);
          resolve();
        };
        img2.src = `${this.image.imageUrl}?t=${Date.now()}`;
      };
      img.src = this.image.imageUrl;
    });
  }

  onTextInput(value: string) {
    this.text.set(value.slice(0, 40));
    this.drawCanvas();
  }

  setPosition(pos: Position) {
    this.position.set(pos);
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
    const text = this.text();
    const pos = this.position();
    const color = this.fontColor();
    const size = this.fontSize();
    const imgSize = 512;
    const padding = 16;
    const textAreaH = size + padding * 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (pos === 'above') {
      canvas.width = imgSize;
      canvas.height = imgSize + textAreaH;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, textAreaH, imgSize, imgSize);
      if (text) {
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, imgSize / 2, textAreaH / 2, imgSize - 24);
      }
    } else if (pos === 'below') {
      canvas.width = imgSize;
      canvas.height = imgSize + textAreaH;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, imgSize, imgSize);
      if (text) {
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, imgSize / 2, imgSize + textAreaH / 2, imgSize - 24);
      }
    } else if (pos === 'top') {
      canvas.width = imgSize;
      canvas.height = imgSize;
      ctx.drawImage(img, 0, 0, imgSize, imgSize);
      if (text) {
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, 0, imgSize, textAreaH);
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, imgSize / 2, textAreaH / 2, imgSize - 24);
      }
    } else {
      // bottom overlay
      canvas.width = imgSize;
      canvas.height = imgSize;
      ctx.drawImage(img, 0, 0, imgSize, imgSize);
      if (text) {
        const overlayY = imgSize - textAreaH;
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(0, overlayY, imgSize, textAreaH);
        ctx.font = `bold ${size}px Arial, sans-serif`;
        ctx.fillStyle = color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, imgSize / 2, overlayY + textAreaH / 2, imgSize - 24);
      }
    }
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
