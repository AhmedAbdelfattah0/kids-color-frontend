import { Injectable } from '@angular/core';

export interface ColorPalette {
  name: string;
  colors: string[];
}

@Injectable({ providedIn: 'root' })
export class PaletteService {
  private readonly palettes: Record<string, ColorPalette> = {
    animals:     { name: 'Wild & Natural',   colors: ['#8B4513', '#228B22', '#F4A460', '#2E8B57', '#D2691E', '#90EE90'] },
    vehicles:    { name: 'On the Road',      colors: ['#1E3A5F', '#CC0000', '#808080', '#FFA500', '#1F75FE', '#E8E8E8'] },
    fantasy:     { name: 'Magical Kingdom',  colors: ['#6A0DAD', '#FFD700', '#FF69B4', '#4169E1', '#C0C0C0', '#7FFF00'] },
    nature:      { name: 'Into the Wild',    colors: ['#228B22', '#87CEEB', '#8B4513', '#32CD32', '#00CED1', '#F0E68C'] },
    space:       { name: 'Cosmic Voyage',    colors: ['#191970', '#9400D3', '#FFD700', '#00CED1', '#4B0082', '#C0C0C0'] },
    food:        { name: 'Yummy Colors',     colors: ['#FF6347', '#FFD700', '#90EE90', '#FF8C00', '#FF69B4', '#8B0000'] },
    holidays:    { name: 'Festive Cheer',    colors: ['#CC0000', '#006400', '#FFD700', '#0000CD', '#FF69B4', '#C0C0C0'] },
    characters:  { name: 'Hero Colors',      colors: ['#FF4500', '#00BFFF', '#32CD32', '#FFD700', '#FF1493', '#9400D3'] },
    educational: { name: 'School Days',      colors: ['#0000CD', '#CC0000', '#006400', '#FFD700', '#FF8C00', '#800080'] },
    alphabet:    { name: 'ABC Rainbow',      colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00BB00', '#0000FF', '#8B00FF'] },
    numbers:     { name: 'Count & Color',    colors: ['#FF4500', '#FF8C00', '#FFD700', '#32CD32', '#1E90FF', '#9400D3'] },
    shapes:      { name: 'Geo Bright',       colors: ['#FF4500', '#00CED1', '#32CD32', '#9400D3', '#FFD700', '#FF69B4'] },
    geography:   { name: 'World Colors',     colors: ['#228B22', '#87CEEB', '#8B4513', '#F0E68C', '#006994', '#D2691E'] },
    science:     { name: 'Lab Palette',      colors: ['#0047AB', '#50C878', '#FF4500', '#FFD700', '#9400D3', '#C0C0C0'] },
    seasons:     { name: 'Four Seasons',     colors: ['#FF7043', '#F9A825', '#43A047', '#1565C0', '#E91E63', '#8D6E63'] },
  };

  private readonly fallback: ColorPalette = {
    name: 'Classic Crayons',
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00BB00', '#0000FF', '#8B00FF']
  };

  getPaletteForCategory(category?: string): ColorPalette {
    return (category && this.palettes[category]) ? this.palettes[category] : this.fallback;
  }

  getAllPalettes(): ColorPalette[] {
    return Object.values(this.palettes);
  }
}
