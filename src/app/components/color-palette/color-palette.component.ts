import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaletteService, ColorPalette } from '../../services/palette.service';

@Component({
  selector: 'app-color-palette',
  templateUrl: './color-palette.component.html',
  styleUrls: ['./color-palette.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ColorPaletteComponent {
  private paletteService = inject(PaletteService);

  palette: ColorPalette = this.paletteService.getPaletteForCategory(undefined);
  copiedColor = signal<string | null>(null);

  @Input() set category(value: string | undefined) {
    this.palette = this.paletteService.getPaletteForCategory(value);
  }

  async copyColor(hex: string) {
    await navigator.clipboard.writeText(hex);
    this.copiedColor.set(hex);
    setTimeout(() => this.copiedColor.set(null), 2000);
  }

  isLight(hex: string): boolean {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return (r * 299 + g * 587 + b * 114) / 1000 > 128;
  }
}
