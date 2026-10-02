import { Routes } from '@angular/router';

export const routes: Routes = [
  // Enquanto a experiência 3D não existe, a raiz abre o modo simples.
  { path: '', pathMatch: 'full', redirectTo: 'simples' },
  {
    path: 'simples',
    loadComponent: () => import('./features/modo-simples/modo-simples.page'),
    children: [
      {
        path: 'projetos/:id',
        loadComponent: () => import('./features/modo-simples/projeto.rota'),
      },
    ],
  },
  {
    // Experiência 3D (beta). Vira a rota raiz quando estiver pronta.
    path: '3d',
    loadComponent: () => import('./features/experiencia-3d/experiencia-3d.page'),
  },
  { path: '**', redirectTo: 'simples' },
];
