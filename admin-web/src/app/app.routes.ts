import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default route - redirect to login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Login route (standalone, no layout)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
    title: 'Admin Login - OPOSSUM',
  },

  // Dashboard route (with layout and auth guard)
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    title: 'Dashboard - OPOSSUM Admin',
    data: { title: 'Dashboard' },
  },

  // Users routes (with layout and auth guard)
  {
    path: 'users',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    title: 'User Management - OPOSSUM Admin',
    data: { title: 'User Management' },
  },

  {
    path: 'users/detail/:id',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    title: 'User Details - OPOSSUM Admin',
    data: { title: 'User Details' },
  },

  // Announcements route (with layout and auth guard)
  {
    path: 'announcements',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    title: 'Announcements - OPOSSUM Admin',
    data: { title: 'Announcements' },
  },

  // Messages route (with layout and auth guard)
  {
    path: 'messages',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    title: 'Messages - OPOSSUM Admin',
    data: { title: 'Messages' },
  },

  // Catch-all route
  {
    path: '**',
    redirectTo: '/login',
  },
];
