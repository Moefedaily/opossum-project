import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  constructor(private toastr: ToastrService) {}

  // Success notification (green)
  success(message: string, title?: string): void {
    this.toastr.success(message, title || 'Success', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }

  // Error notification (red)
  error(message: string, title?: string): void {
    this.toastr.error(message, title || 'Error', {
      timeOut: 5000, // Longer for errors
      progressBar: true,
      closeButton: true,
    });
  }

  // Warning notification (orange)
  warning(message: string, title?: string): void {
    this.toastr.warning(message, title || 'Warning', {
      timeOut: 4000,
      progressBar: true,
      closeButton: true,
    });
  }

  // Info notification (blue)
  info(message: string, title?: string): void {
    this.toastr.info(message, title || 'Info', {
      timeOut: 3000,
      progressBar: true,
      closeButton: true,
    });
  }

  // Clear all notifications
  clear(): void {
    this.toastr.clear();
  }

  // Helper methods for common admin actions
  userDeleted(username: string): void {
    this.success(`User "${username}" has been deleted successfully`);
  }

  userBlocked(username: string): void {
    this.warning(`User "${username}" has been blocked`);
  }

  announcementDeleted(title: string): void {
    this.success(`Announcement "${title}" has been deleted`);
  }

  loginSuccess(username: string): void {
    this.success(`Welcome back, ${username}!`, 'Login Successful');
  }

  loginError(): void {
    this.error(
      'Invalid credentials or insufficient privileges',
      'Login Failed'
    );
  }

  actionError(action: string): void {
    this.error(`Failed to ${action}. Please try again.`);
  }

  loadingError(resource: string): void {
    this.error(`Failed to load ${resource}. Please refresh the page.`);
  }
}
