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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { UserService, UserListItem } from '../../../core/services/user.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-user-list',
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
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table configuration
  displayedColumns: string[] = [
    'avatar',
    'username',
    'email',
    'name',
    'role',
    'status',
    'verified',
    'lastLogin',
    'actions',
  ];

  dataSource = new MatTableDataSource<UserListItem>([]);
  loading = true;

  // Search and filter form
  filterForm: FormGroup;

  // Statistics
  totalUsers = 0;
  activeUsers = 0;
  verifiedUsers = 0;
  adminUsers = 0;

  // Filter options
  roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'USER', label: 'User' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  verificationOptions = [
    { value: '', label: 'All Users' },
    { value: 'verified', label: 'Verified' },
    { value: 'unverified', label: 'Unverified' },
  ];

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog
  ) {
    this.filterForm = this.fb.group({
      search: [''],
      role: [''],
      status: [''],
      verification: [''],
    });
  }

  ngOnInit() {
    this.setupFilters();
    this.loadUsers();
    this.loadUserStats();
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

    // Setup other filters with setTimeout
    ['role', 'status', 'verification'].forEach((field) => {
      this.filterForm
        .get(field)
        ?.valueChanges.pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          setTimeout(() => this.applyFilters(), 0);
        });
    });
  }

  private loadUsers() {
    this.loading = true;

    this.userService.getUsers().subscribe({
      next: (users) => {
        console.log('Loaded users:', users);
        this.dataSource.data = users;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        // Calculate admin count AFTER users are loaded
        this.adminUsers = users.filter((user) => user.role === 'ADMIN').length;
        console.log('Admin count:', this.adminUsers); // Debug log

        // Setup custom filter predicate
        this.setupFilterPredicate();
        this.applyFilters();

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.toastService.error('Failed to load users');
        this.loading = false;
      },
    });
  }

  private loadUserStats() {
    this.userService.getUserStats().subscribe({
      next: (stats) => {
        this.totalUsers = stats.totalUsers || 0;
        this.activeUsers = stats.activeUsers || 0;
        this.verifiedUsers = stats.verifiedUsers || 0;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
      },
    });
  }

  private setupFilterPredicate() {
    this.dataSource.filterPredicate = (user: UserListItem, filter: string) => {
      const filterObj = JSON.parse(filter);

      // Search filter (this is working correctly)
      if (filterObj.search && filterObj.search.trim()) {
        const searchTerm = filterObj.search.toLowerCase().trim();
        const searchableText = [
          user.username,
          user.email,
          user.firstName,
          user.lastName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Role filter - Fixed logic
      if (filterObj.role && filterObj.role.trim()) {
        if (user.role !== filterObj.role) {
          return false;
        }
      }

      // Status filter - Fixed the reversed logic
      if (filterObj.status && filterObj.status.trim()) {
        if (filterObj.status === 'active' && !user.isActive) {
          return false;
        }
        if (filterObj.status === 'inactive' && user.isActive) {
          return false;
        }
      }

      // Verification filter - Fixed logic
      if (filterObj.verification && filterObj.verification.trim()) {
        if (filterObj.verification === 'verified' && !user.isVerified) {
          return false;
        }
        if (filterObj.verification === 'unverified' && user.isVerified) {
          return false;
        }
      }

      return true;
    };
  }

  private applyFilters() {
    const formValue = this.filterForm.value;

    // Clean the filter values
    const cleanFilter = {
      search: (formValue.search || '').trim(),
      role: formValue.role || '',
      status: formValue.status || '',
      verification: formValue.verification || '',
    };

    console.log('Applying filters:', cleanFilter);

    const filterValue = JSON.stringify(cleanFilter);
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // User actions
  viewUser(user: UserListItem) {
    this.router.navigate(['/users/detail', user.id]);
  }

  toggleUserStatus(user: UserListItem) {
    const action = user.isActive ? 'deactivate' : 'activate';
    const actionText = user.isActive ? 'deactivating' : 'activating';

    console.log(`${actionText} user:`, user.username);

    if (user.isActive) {
      this.userService.deactivateUser(user.id).subscribe({
        next: () => {
          user.isActive = false;
          this.toastService.success(
            `User ${user.username} deactivated successfully`
          );
          this.loadUserStats(); // Refresh stats
        },
        error: (error) => {
          console.error('Error deactivating user:', error);
          this.toastService.error('Failed to deactivate user');
        },
      });
    } else {
      this.userService.activateUser(user.id).subscribe({
        next: () => {
          user.isActive = true;
          this.toastService.success(
            `User ${user.username} activated successfully`
          );
          this.loadUserStats(); // Refresh stats
        },
        error: (error) => {
          console.error('Error activating user:', error);
          this.toastService.error('Failed to activate user');
        },
      });
    }
  }

  deleteUser(user: UserListItem) {
    if (
      confirm(
        `Are you sure you want to delete user "${user.username}"? This action cannot be undone.`
      )
    ) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          // Remove user from local data
          this.dataSource.data = this.dataSource.data.filter(
            (u) => u.id !== user.id
          );
          this.toastService.success(
            `User ${user.username} deleted successfully`
          );
          this.loadUserStats(); // Refresh stats
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastService.error('Failed to delete user');
        },
      });
    }
  }

  // Utility methods
  getUserInitials(user: UserListItem): string {
    const firstName = user.firstName || user.username || '';
    const lastName = user.lastName || '';

    if (firstName && lastName) {
      return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
    } else if (firstName) {
      return firstName.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  }

  getUserDisplayName(user: UserListItem): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else {
      return user.username;
    }
  }

  formatLastLogin(date: string | null): string {
    if (!date) return 'Never';

    const lastLogin = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - lastLogin.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;

    return lastLogin.toLocaleDateString();
  }

  clearFilters() {
    this.filterForm.patchValue({
      search: '',
      role: '',
      status: '',
      verification: '',
    });

    // Force apply filters after clearing
    setTimeout(() => {
      this.applyFilters();
    }, 0);
  }

  refreshUsers() {
    this.loadUsers();
    this.loadUserStats();
  }
}
