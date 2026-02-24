import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class HeaderComponent {
  private favoritesService = inject(FavoritesService);
  favoritesCount = computed(() => this.favoritesService.favorites().length);
  menuOpen = signal(false);

  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
}
