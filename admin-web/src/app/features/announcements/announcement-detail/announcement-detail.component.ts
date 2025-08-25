import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import {
  AnnouncementService,
  AnnouncementListItem,
} from '../../../core/services/announcement.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-announcement-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTooltipModule,
  ],
  templateUrl: './announcement-detail.component.html',
  styleUrl: './announcement-detail.component.scss',
})
export class AnnouncementDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  announcement: AnnouncementListItem | null = null;
  loading = true;
  currentImageIndex = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private announcementService: AnnouncementService,
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      const id = +params['id'];
      if (id) {
        this.loadAnnouncement(id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadAnnouncement(id: number) {
    this.loading = true;

    this.announcementService.getAnnouncementById(id).subscribe({
      next: (announcement) => {
        this.announcement = announcement;
        this.loading = false;
        console.log('Loaded announcement details:', announcement);
      },
      error: (error) => {
        console.error('Error loading announcement:', error);
        this.toastService.error('Failed to load announcement details');
        this.router.navigate(['/announcements']);
      },
    });
  }

  // Navigation
  goBack() {
    this.router.navigate(['/announcements']);
  }

  // Image gallery navigation
  previousImage() {
    if (this.announcement?.files && this.announcement.files.length > 0) {
      this.currentImageIndex =
        this.currentImageIndex > 0
          ? this.currentImageIndex - 1
          : this.announcement.files.length - 1;
    }
  }

  nextImage() {
    if (this.announcement?.files && this.announcement.files.length > 0) {
      this.currentImageIndex =
        this.currentImageIndex < this.announcement.files.length - 1
          ? this.currentImageIndex + 1
          : 0;
    }
  }

  setCurrentImage(index: number) {
    this.currentImageIndex = index;
  }

  // Admin actions
  deleteAnnouncement() {
    if (!this.announcement) return;

    if (
      confirm(
        `Are you sure you want to delete "${this.announcement.title}"? This action cannot be undone.`
      )
    ) {
      this.announcementService
        .deleteAnnouncement(this.announcement.id)
        .subscribe({
          next: () => {
            this.toastService.success('Announcement deleted successfully');
            this.router.navigate(['/announcements']);
          },
          error: (error) => {
            console.error('Error deleting announcement:', error);
            this.toastService.error('Failed to delete announcement');
          },
        });
    }
  }

  // Utility methods
  hasImages(): boolean {
    return (
      (this.announcement?.files && this.announcement.files.length > 0) || false
    );
  }

  getCurrentImage(): string {
    if (this.hasImages() && this.announcement?.files) {
      return this.announcement.files[this.currentImageIndex].url;
    }
    return 'assets/images/no-image-placeholder.png';
  }

  getUserDisplayName(): string {
    if (!this.announcement) return 'Unknown User';

    if (
      this.announcement.userFullName &&
      this.announcement.userFullName !== 'Deleted User'
    ) {
      return this.announcement.userFullName;
    } else if (this.announcement.username) {
      return this.announcement.username;
    } else {
      return 'Unknown User';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(dateString);
  }

  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      ELECTRONICS: 'devices',
      CLOTHING: 'checkroom',
      DOCUMENTS: 'description',
      JEWELRY: 'diamond',
      BAGS: 'work',
      SPORTS: 'sports_soccer',
      BOOKS: 'menu_book',
      KEYS: 'vpn_key',
      VEHICLES: 'directions_car',
      PETS: 'pets',
      TOYS: 'toys',
      TOOLS: 'build',
      OTHER: 'category',
    };
    return iconMap[category] || 'category';
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return '#4a0001';
      case 'RESOLVED':
        return '#2d5a3d';
      case 'ARCHIVED':
        return '#b69a99';
      default:
        return '#6b7280';
    }
  }

  getTypeColor(type: string): string {
    return type === 'LOST' ? '#4a0001' : '#2d5a3d';
  }

  isDeletedUser(): boolean {
    return this.announcement?.username === 'system-deleted-user';
  }

  getLocationDisplay(): string {
    if (!this.announcement) return 'No location';

    if (this.announcement.address) {
      return this.announcement.address;
    } else if (this.announcement.latitude && this.announcement.longitude) {
      return `${this.announcement.latitude.toFixed(
        4
      )}, ${this.announcement.longitude.toFixed(4)}`;
    }
    return 'No location';
  }
}
