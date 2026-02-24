import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'generate',
    loadComponent: () => import('./pages/generator/generator.component').then(m => m.GeneratorComponent)
  },
  {
    path: 'gallery',
    loadComponent: () => import('./pages/gallery/gallery.component').then(m => m.GalleryComponent)
  },
  {
    path: 'gallery/:id',
    loadComponent: () => import('./pages/image-detail/image-detail.component').then(m => m.ImageDetailComponent)
  },
  {
    path: 'favorites',
    loadComponent: () => import('./pages/favorites/favorites.component').then(m => m.FavoritesComponent)
  },
  {
    path: 'packs',
    loadComponent: () => import('./pages/packs/packs.component').then(m => m.PacksComponent)
  },
  {
    path: 'packs/:id',
    loadComponent: () => import('./pages/pack-detail/pack-detail.component').then(m => m.PackDetailComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
