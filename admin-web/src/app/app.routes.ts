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

  // Admin routes with main layout wrapper
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    canActivate: [authGuard],
    children: [
      // Dashboard route
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard - OPOSSUM Admin',
        data: { title: 'Dashboard' },
      },

      // Users routes
      {
        path: 'users',
        loadComponent: () =>
          import('./features/users/user-list/user-list.component').then(
            (m) => m.UserListComponent
          ),
        title: 'User Management - OPOSSUM Admin',
        data: { title: 'User Management' },
      },
      {
        path: 'users/create', // Add this route
        loadComponent: () =>
          import('./features/users/create-user/create-user.component').then(
            (m) => m.CreateUserComponent
          ),
        title: 'Create User - OPOSSUM Admin',
        data: { title: 'Create User' },
      },
      {
        path: 'users/edit/:id',
        loadComponent: () =>
          import('./features/users/edit-user/edit-user.component').then(
            (m) => m.EditUserComponent
          ),
        title: 'Edit User - OPOSSUM Admin',
        data: { title: 'Edit User' },
      },

      // // Announcements route
      // {
      //   path: 'announcements',
      //   loadComponent: () =>
      //     import('./features/announcements/announcement-list.component').then(
      //       (m) => m.AnnouncementListComponent
      //     ),
      //   title: 'Announcements - OPOSSUM Admin',
      //   data: { title: 'Announcements' },
      // },

      // // Messages route
      // {
      //   path: 'messages',
      //   loadComponent: () =>
      //     import('./features/messages/message-list.component').then(
      //       (m) => m.MessageListComponent
      //     ),
      //   title: 'Messages - OPOSSUM Admin',
      //   data: { title: 'Messages' },
      // },
    ],
  },

  // Catch-all route
  {
    path: '**',
    redirectTo: '/login',
  },
];
