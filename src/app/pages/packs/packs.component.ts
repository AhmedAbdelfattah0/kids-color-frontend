import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PacksService, Pack } from '../../services/packs.service';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class PacksComponent implements OnInit {
  private packsService = inject(PacksService);

  packs = this.packsService.packs;
  isLoading = this.packsService.isLoading;

  async ngOnInit() {
    await this.packsService.loadPacks();
  }

  getDifficultyLabel(difficulty: string): string {
    const map: Record<string, string> = { simple: 'Easy', medium: 'Medium', detailed: 'Detailed' };
    return map[difficulty] || difficulty;
  }

  getDifficultyClass(difficulty: string): string {
    const map: Record<string, string> = {
      simple:   'bg-green-100 text-green-700',
      medium:   'bg-yellow-100 text-yellow-700',
      detailed: 'bg-purple-100 text-purple-700',
    };
    return map[difficulty] || 'bg-gray-100 text-gray-600';
  }
}
