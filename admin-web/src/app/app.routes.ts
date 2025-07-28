import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Default route - redirect to login
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // Login route
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
        path: 'users/create',
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

      // Announcements route
      {
        path: 'announcements',
        loadComponent: () =>
          import(
            './features/announcements/announcement-list/announcement-list.component'
          ).then((m) => m.AnnouncementListComponent),
        title: 'Announcements - OPOSSUM Admin',
        data: { title: 'Announcements' },
      },
      {
        path: 'announcements/detail/:id',
        loadComponent: () =>
          import(
            './features/announcements/announcement-detail/announcement-detail.component'
          ).then((m) => m.AnnouncementDetailComponent),
        title: 'Announcement Details - OPOSSUM Admin',
        data: { title: 'Announcement Details' },
      },

      // Messages route
      {
        path: 'messages',
        children: [
          {
            path: '',
            loadComponent: () =>
              import(
                './features/messages/conversation-list/conversation-list.component'
              ).then((m) => m.ConversationListComponent),
          },
          {
            path: 'conversation/:id',
            loadComponent: () =>
              import(
                './features/messages/conversation-detail/conversation-detail.component'
              ).then((m) => m.ConversationDetailComponent),
          },
        ],
        canActivate: [authGuard],
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },

  // Catch-all route
  {
    path: '**',
    redirectTo: '/login',
  },
];
