import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable, Subject } from 'rxjs';
import { map, shareReplay, takeUntil, filter } from 'rxjs/operators';

import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

export interface NavigationItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  children?: NavigationItem[];
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Declare observables - will be initialized in constructor
  isHandset$!: Observable<boolean>;
  currentUser$!: Observable<any>;

  // Navigation state
  sidenavOpened = true;
  currentRoute = '';
  pageTitle = 'Dashboard';

  // Navigation items
  navigationItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      icon: 'dashboard',
      route: '/dashboard',
    },
    {
      label: 'User Management',
      icon: 'people',
      route: '/users',
      children: [
        { label: 'All Users', icon: 'list', route: '/users' },
        { label: 'User Details', icon: 'person', route: '/users/detail' },
      ],
    },
    {
      label: 'Announcements',
      icon: 'campaign',
      route: '/announcements',
    },
    {
      label: 'Messages',
      icon: 'message',
      route: '/messages',
      badge: 3, // Example badge count
    },
  ];

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    // Initialize observables AFTER services are injected
    this.isHandset$ = this.breakpointObserver.observe(Breakpoints.Handset).pipe(
      map((result) => result.matches),
      shareReplay()
    );

    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit() {
    // Watch for route changes to update page title and current route
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.urlAfterRedirects;
        this.updatePageTitle();
      });

    // Set initial route
    this.currentRoute = this.router.url;
    this.updatePageTitle();

    // Handle responsive sidenav
    this.isHandset$.pipe(takeUntil(this.destroy$)).subscribe((isHandset) => {
      this.sidenavOpened = !isHandset;
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updatePageTitle() {
    // Extract page title from current route
    const routeSegments = this.currentRoute
      .split('/')
      .filter((segment) => segment);

    if (routeSegments.length === 0 || routeSegments[0] === 'dashboard') {
      this.pageTitle = 'Dashboard';
    } else if (routeSegments[0] === 'users') {
      if (routeSegments.length > 1 && routeSegments[1] !== 'detail') {
        this.pageTitle = 'User Details';
      } else {
        this.pageTitle = 'User Management';
      }
    } else if (routeSegments[0] === 'announcements') {
      this.pageTitle = 'Announcements';
    } else if (routeSegments[0] === 'messages') {
      this.pageTitle = 'Messages';
    } else {
      this.pageTitle = 'Admin Panel';
    }
  }

  toggleSidenav() {
    this.sidenavOpened = !this.sidenavOpened;
  }

  isActiveRoute(route: string): boolean {
    if (route === '/dashboard') {
      return this.currentRoute === '/' || this.currentRoute === '/dashboard';
    }
    return this.currentRoute.startsWith(route);
  }

  navigateToRoute(route: string) {
    this.router.navigate([route]);
  }

  logout() {
    this.authService.logout().subscribe({
      next: (response) => {
        this.toastService.success('Logged out successfully');
        this.router.navigate(['/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        this.toastService.warning('Session ended');
        this.router.navigate(['/login']);
      },
    });
  }

  getUserInitials(user: any): string {
    if (!user) return 'AD';

    const firstName = user.firstName || user.username || '';
    const lastName = user.lastName || '';

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else {
      return 'AD';
    }
  }

  getUserDisplayName(user: any): string {
    if (!user) return 'Admin';

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.username) {
      return user.username;
    } else {
      return user.email || 'Admin';
    }
  }
}
