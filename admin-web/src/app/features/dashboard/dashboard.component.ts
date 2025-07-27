import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { UserService } from '../../core/services/user.service';
import { AnnouncementService } from '../../core/services/announcement.service';
import { AuthService } from '../../core/services/auth.service';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  totalAnnouncements: number;
  recentAnnouncements: number;
}

interface RecentActivity {
  id: number;
  type: 'user' | 'announcement' | 'verification';
  title: string;
  description: string;
  timestamp: Date;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  loading = true;
  currentUser: any = null;

  // Dashboard data - matching your backend
  stats: DashboardStats = {
    totalUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    totalAnnouncements: 0,
    recentAnnouncements: 0,
  };

  recentActivity: RecentActivity[] = [];

  // Quick stats for cards - updated to match your backend
  statCards = [
    {
      title: 'Total Users',
      value: 0,
      icon: 'people',
      color: 'primary',
      route: '/users',
    },
    {
      title: 'Active Users',
      value: 0,
      icon: 'person_check',
      color: 'success',
      route: '/users',
    },
    {
      title: 'Verified Users',
      value: 0,
      icon: 'verified',
      color: 'info',
      route: '/users',
    },
    {
      title: 'Announcements',
      value: 0,
      icon: 'campaign',
      color: 'warning',
      route: '/announcements',
    },
  ];

  constructor(
    private userService: UserService,
    private announcementService: AnnouncementService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadCurrentUser() {
    // Subscribe to current user
    this.authService.currentUser$.subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Error loading current user:', error);
      },
    });
  }

  private loadDashboardData() {
    this.loading = true;
    let loadedCount = 0;
    const totalLoads = 2; // Only user stats and announcement stats

    // Load user statistics - matching your backend response
    this.userService.getUserStats().subscribe({
      next: (userStats) => {
        // Matching your exact backend response format
        this.stats.totalUsers = userStats.totalUsers || 0;
        this.stats.activeUsers = userStats.activeUsers || 0;
        this.stats.verifiedUsers = userStats.verifiedUsers || 0;

        this.updateStatCards();
        this.checkLoadingComplete(++loadedCount, totalLoads);
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
        // Set default values on error
        this.stats.totalUsers = 0;
        this.stats.activeUsers = 0;
        this.stats.verifiedUsers = 0;
        this.updateStatCards();
        this.checkLoadingComplete(++loadedCount, totalLoads);
      },
    });

    // Load announcement statistics
    this.announcementService.getAnnouncementStats().subscribe({
      next: (announcementStats) => {
        this.stats.totalAnnouncements = announcementStats.total || 0;
        this.stats.recentAnnouncements = announcementStats.active || 0;

        this.updateStatCards();
        this.checkLoadingComplete(++loadedCount, totalLoads);
      },
      error: (error) => {
        console.error('Error loading announcement stats:', error);
        // Set default values on error
        this.stats.totalAnnouncements = 0;
        this.stats.recentAnnouncements = 0;
        this.updateStatCards();
        this.checkLoadingComplete(++loadedCount, totalLoads);
      },
    });
  }

  private checkLoadingComplete(loadedCount: number, totalLoads: number) {
    if (loadedCount >= totalLoads) {
      this.loading = false;
    }
  }

  private updateStatCards() {
    this.statCards[0].value = this.stats.totalUsers;
    this.statCards[1].value = this.stats.activeUsers;
    this.statCards[2].value = this.stats.verifiedUsers;
    this.statCards[3].value = this.stats.totalAnnouncements;
  }

  // Navigation methods
  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToAnnouncements() {
    this.router.navigate(['/announcements']);
  }

  navigateToMessages() {
    this.router.navigate(['/messages']);
  }

  navigateToCard(route: string) {
    this.router.navigate([route]);
  }

  // Utility methods
  formatNumber(num: number): string {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  refreshData() {
    this.loadDashboardData();
  }

  getUserDisplayName(): string {
    if (!this.currentUser) return 'Admin';

    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    } else if (this.currentUser.username) {
      return this.currentUser.username;
    } else {
      return this.currentUser.email || 'Admin';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser) return 'AD';

    const firstName =
      this.currentUser.firstName || this.currentUser.username || '';
    const lastName = this.currentUser.lastName || '';

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else {
      return 'AD';
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
