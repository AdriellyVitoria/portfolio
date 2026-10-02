import { Routes } from '@angular/router';

export const routes: Routes = [
  // Enquanto a experiência 3D não existe, a raiz abre o modo simples (plano.md, fase 2).
  { path: '', pathMatch: 'full', redirectTo: 'simples' },
  {
    path: 'simples',
    title: 'Adrielly — Portfólio',
    loadComponent: () => import('./features/modo-simples/modo-simples.page'),
  },
  { path: '**', redirectTo: 'simples' },
];
