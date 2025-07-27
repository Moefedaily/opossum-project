import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import {
  AnnouncementService,
  AnnouncementListItem,
  AnnouncementStats,
} from '../../../core/services/announcement.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-announcement-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    MatTabsModule,
  ],
  templateUrl: './announcement-list.component.html',
  styleUrl: './announcement-list.component.scss',
})
export class AnnouncementListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'image',
    'title',
    'type',
    'category',
    'status',
    'user',
    'location',
    'date',
    'actions',
  ];

  dataSource = new MatTableDataSource<AnnouncementListItem>([]);
  loading = true;

  // Search and filter form
  filterForm: FormGroup;

  // Statistics
  stats: AnnouncementStats = {
    total: 0,
    active: 0,
    lost: 0,
    found: 0,
    resolved: 0,
  };

  // Filter options
  typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'LOST', label: 'Lost Items' },
    { value: 'FOUND', label: 'Found Items' },
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'RESOLVED', label: 'Resolved' },
    { value: 'ARCHIVED', label: 'Archived' },
  ];

  categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'ELECTRONICS', label: 'Electronics' },
    { value: 'CLOTHING', label: 'Clothing' },
    { value: 'DOCUMENTS', label: 'Documents' },
    { value: 'JEWELRY', label: 'Jewelry' },
    { value: 'BAGS', label: 'Bags' },
    { value: 'SPORTS', label: 'Sports Equipment' },
    { value: 'BOOKS', label: 'Books' },
    { value: 'KEYS', label: 'Keys' },
    { value: 'VEHICLES', label: 'Vehicles' },
    { value: 'PETS', label: 'Pets' },
    { value: 'TOYS', label: 'Toys' },
    { value: 'TOOLS', label: 'Tools' },
    { value: 'OTHER', label: 'Other' },
  ];

  constructor(
    private announcementService: AnnouncementService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      type: [''],
      status: [''],
      category: [''],
    });
  }

  ngOnInit() {
    this.setupFilters();
    this.loadAnnouncements();
    this.loadAnnouncementStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupFilters() {
    // Setup search with debounce
    this.filterForm
      .get('search')
      ?.valueChanges.pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        setTimeout(() => this.applyFilters(), 0);
      });

    // Setup other filters
    ['type', 'status', 'category'].forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          setTimeout(() => this.applyFilters(), 0);
        });
    });
  }

  private loadAnnouncements() {
    this.loading = true;

    this.announcementService.getAllAnnouncements().subscribe({
      next: (announcements) => {
        console.log('Loaded announcements:', announcements);
        this.dataSource.data = announcements;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        this.setupFilterPredicate();
        this.applyFilters();

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading announcements:', error);
        this.toastService.error('Failed to load announcements');
        this.loading = false;
      },
    });
  }

  private loadAnnouncementStats() {
    this.announcementService.getAnnouncementStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading announcement stats:', error);
      },
    });
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (
      announcement: AnnouncementListItem,
      filter: string
    ) => {
      const filterObj = JSON.parse(filter);

      // Search filter
      if (filterObj.search && filterObj.search.trim()) {
        const searchTerm = filterObj.search.toLowerCase().trim();
        const searchableText = [
          announcement.title,
          announcement.description,
          announcement.user?.username || '',
          announcement.user?.firstName || '',
          announcement.user?.lastName || '',
          announcement.address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Type filter
      if (filterObj.type && filterObj.type.trim()) {
        if (announcement.type !== filterObj.type) {
          return false;
        }
      }

      // Status filter
      if (filterObj.status && filterObj.status.trim()) {
        if (announcement.status !== filterObj.status) {
          return false;
        }
      }

      // Category filter
      if (filterObj.category && filterObj.category.trim()) {
        if (announcement.category !== filterObj.category) {
          return false;
        }
      }

      return true;
    };
  }
  private applyFilters() {
    const formValue = this.filterForm.value;

    const cleanFilter = {
      search: (formValue.search || '').trim(),
      type: formValue.type || '',
      status: formValue.status || '',
      category: formValue.category || '',
    };

    console.log('Applying announcement filters:', cleanFilter);

    const filterValue = JSON.stringify(cleanFilter);
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // Announcement actions
  viewAnnouncement(announcement: AnnouncementListItem) {
    this.router.navigate(['/announcements/detail', announcement.id]);
  }

  deleteAnnouncement(announcement: AnnouncementListItem) {
    if (
      confirm(
        `Are you sure you want to delete "${announcement.title}"? This action cannot be undone.`
      )
    ) {
      this.announcementService.deleteAnnouncement(announcement.id).subscribe({
        next: () => {
          // Remove announcement from local data
          this.dataSource.data = this.dataSource.data.filter(
            (a) => a.id !== announcement.id
          );
          this.toastService.success(
            `Announcement "${announcement.title}" deleted successfully`
          );
          this.loadAnnouncementStats(); // Refresh stats
        },
        error: (error) => {
          console.error('Error deleting announcement:', error);
          this.toastService.error('Failed to delete announcement');
        },
      });
    }
  }

  // Utility methods
  getAnnouncementImage(announcement: AnnouncementListItem): string {
    if (announcement.files && announcement.files.length > 0) {
      return announcement.files[0].url;
    }
    return 'assets/images/no-image-placeholder.png';
  }

  hasImages(announcement: AnnouncementListItem): boolean {
    return announcement.files && announcement.files.length > 0;
  }

  getUserDisplayName(announcement: AnnouncementListItem): string {
    const user = announcement.user;

    if (!user) {
      return 'Unknown User';
    }

    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.username) {
      return user.username;
    } else {
      return 'Unknown User';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return date.toLocaleDateString();
  }

  getLocationDisplay(announcement: AnnouncementListItem): string {
    if (announcement.address) {
      return announcement.address;
    } else if (announcement.latitude && announcement.longitude) {
      return `${announcement.latitude.toFixed(
        4
      )}, ${announcement.longitude.toFixed(4)}`;
    }
    return 'No location';
  }

  clearFilters() {
    this.filterForm.patchValue({
      search: '',
      type: '',
      status: '',
      category: '',
    });

    setTimeout(() => {
      this.applyFilters();
    }, 0);
  }

  refreshAnnouncements() {
    this.loadAnnouncements();
    this.loadAnnouncementStats();
  }
}
