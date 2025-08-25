import { Injectable } from '@angular/core';
import { Observable, switchMap, tap, catchError, throwError } from 'rxjs';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface UserListItem {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface UserDetail {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  // Statistics
  totalAnnouncements: number;
  activeAnnouncements: number;
  resolvedAnnouncements: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  adminUsers: number;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private apiService: ApiService,
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {}

  /**
   * Update current user profile (uses AuthService.getCurrentUser())
   */
  updateProfile(profileData: UpdateProfileDto): Observable<any> {
    return this.authService.getCurrentUser().pipe(
      switchMap((currentUser) =>
        this.apiService.patch(
          `/api/users/${currentUser.id}/profile`,
          profileData
        )
      ),
      tap(() => {
        console.log('Profile updated successfully');
        this.toastService.success('Profile updated successfully');
      }),
      catchError((error) => {
        console.error('Error updating profile:', error);
        this.toastService.error('Failed to update profile');
        return throwError(() => error);
      })
    );
  }

  /**
   * Change password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.apiService.post('/api/auth/change-password', passwordData).pipe(
      tap(() => {
        console.log('Password changed successfully');
        this.toastService.success('Password changed successfully');
      }),
      catchError((error) => {
        console.error('Error changing password:', error);
        this.toastService.error('Failed to change password');
        return throwError(() => error);
      })
    );
  }

  // Existing User Management Methods
  getUsers(): Observable<UserListItem[]> {
    return this.apiService.get('/api/users');
  }

  // Get single user details (your existing endpoint)
  getUserById(userId: number): Observable<UserDetail> {
    return this.apiService.get(`/api/users/${userId}`);
  }

  // Delete user (your existing endpoint - admin can delete any user)
  deleteUser(userId: number): Observable<void> {
    return this.apiService.delete(`/api/users/${userId}`);
  }

  // Activate user (your existing endpoint)
  activateUser(userId: number): Observable<{ message: string }> {
    return this.apiService.patch(`/api/users/${userId}/activate`, {});
  }

  // Deactivate user (your existing endpoint)
  deactivateUser(userId: number): Observable<{ message: string }> {
    return this.apiService.patch(`/api/users/${userId}/deactivate`, {});
  }

  // Get user statistics (your existing endpoint)
  getUserStats(): Observable<UserStats> {
    return this.apiService.get('/api/users/stats');
  }

  createUser(userData: any): Observable<UserListItem> {
    return this.apiService.post<UserListItem>('/api/users', userData);
  }

  assignRole(userId: number, role: 'USER' | 'ADMIN'): Observable<UserListItem> {
    return this.http.patch<UserListItem>(
      `${environment.apiBaseUrl}/api/users/${userId}/role`,
      `"${role}"`,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  updateUser(userId: number, userData: any): Observable<UserListItem> {
    return this.apiService.put<UserListItem>(`/api/users/${userId}`, userData);
  }

  // Helper methods for frontend search/filtering
  searchUsers(users: UserListItem[], searchTerm: string): UserListItem[] {
    if (!searchTerm) return users;

    const term = searchTerm.toLowerCase();
    return users.filter(
      (user) =>
        user.email.toLowerCase().includes(term) ||
        user.username.toLowerCase().includes(term) ||
        (user.firstName && user.firstName.toLowerCase().includes(term)) ||
        (user.lastName && user.lastName.toLowerCase().includes(term))
    );
  }

  // Filter users by role
  filterUsersByRole(
    users: UserListItem[],
    role?: 'USER' | 'ADMIN'
  ): UserListItem[] {
    if (!role) return users;
    return users.filter((user) => user.role === role);
  }

  // Filter users by status
  filterUsersByStatus(
    users: UserListItem[],
    isActive?: boolean
  ): UserListItem[] {
    if (isActive === undefined) return users;
    return users.filter((user) => user.isActive === isActive);
  }
}
