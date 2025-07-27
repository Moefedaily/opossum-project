import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';

export interface AnnouncementListItem {
  id: number;
  title: string;
  description: string;
  type: 'LOST' | 'FOUND';
  category: string;
  status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED';
  isActive: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
  contactInfo?: string;
  incidentDate?: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
  };
  files: FileItem[];
}

export interface FileItem {
  id: number;
  publicId: string;
  url: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  originalFilename: string;
  fileSize: number;
  contentType: string;
  isActive: boolean;
  createdAt: string;
}

export interface AnnouncementStats {
  total: number;
  lost: number;
  found: number;
  active: number;
  resolved: number;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementService {
  constructor(private apiService: ApiService) {}

  // Get all announcements (for admin view)
  getAllAnnouncements(): Observable<AnnouncementListItem[]> {
    return this.apiService.get<AnnouncementListItem[]>('/api/announcements');
  }

  // Get single announcement details
  getAnnouncementById(
    announcementId: number
  ): Observable<AnnouncementListItem> {
    return this.apiService.get<AnnouncementListItem>(
      `/api/announcements/${announcementId}`
    );
  }

  // Delete announcement (admin can delete any announcement)
  deleteAnnouncement(announcementId: number): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(
      `/api/announcements/${announcementId}`
    );
  }

  // Get announcement statistics (for admin dashboard)
  getAnnouncementStats(): Observable<AnnouncementStats> {
    return this.apiService.get<AnnouncementStats>('/api/announcements/stats');
  }

  // Get recent announcements (for dashboard)
  getRecentAnnouncements(
    limit: number = 10
  ): Observable<AnnouncementListItem[]> {
    return this.apiService.get<AnnouncementListItem[]>(
      '/api/announcements/recent',
      { limit }
    );
  }

  // Get announcements by user (for user detail page)
  getAnnouncementsByUser(userId: number): Observable<AnnouncementListItem[]> {
    return this.apiService.get<AnnouncementListItem[]>('/api/announcements', {
      userId,
    });
  }

  // Helper methods for frontend filtering and searching
  searchAnnouncements(
    announcements: AnnouncementListItem[],
    searchTerm: string
  ): AnnouncementListItem[] {
    if (!searchTerm) return announcements;

    const term = searchTerm.toLowerCase();
    return announcements.filter(
      (announcement) =>
        announcement.title.toLowerCase().includes(term) ||
        announcement.description.toLowerCase().includes(term) ||
        announcement.user.username.toLowerCase().includes(term) ||
        announcement.user.email.toLowerCase().includes(term) ||
        (announcement.address &&
          announcement.address.toLowerCase().includes(term))
    );
  }

  // Filter by type
  filterByType(
    announcements: AnnouncementListItem[],
    type?: 'LOST' | 'FOUND'
  ): AnnouncementListItem[] {
    if (!type) return announcements;
    return announcements.filter((announcement) => announcement.type === type);
  }

  // Filter by status
  filterByStatus(
    announcements: AnnouncementListItem[],
    status?: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED'
  ): AnnouncementListItem[] {
    if (!status) return announcements;
    return announcements.filter(
      (announcement) => announcement.status === status
    );
  }

  // Filter by category
  filterByCategory(
    announcements: AnnouncementListItem[],
    category?: string
  ): AnnouncementListItem[] {
    if (!category) return announcements;
    return announcements.filter(
      (announcement) => announcement.category === category
    );
  }

  // Filter by date range
  filterByDateRange(
    announcements: AnnouncementListItem[],
    startDate?: string,
    endDate?: string
  ): AnnouncementListItem[] {
    if (!startDate && !endDate) return announcements;

    return announcements.filter((announcement) => {
      const announcementDate = new Date(announcement.createdAt);
      const start = startDate ? new Date(startDate) : new Date('1900-01-01');
      const end = endDate ? new Date(endDate) : new Date('2100-01-01');

      return announcementDate >= start && announcementDate <= end;
    });
  }

  // Sort announcements
  sortAnnouncements(
    announcements: AnnouncementListItem[],
    sortBy: string,
    direction: 'asc' | 'desc' = 'desc'
  ): AnnouncementListItem[] {
    const sorted = [...announcements].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sortBy) {
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        case 'createdAt':
          valueA = new Date(a.createdAt);
          valueB = new Date(b.createdAt);
          break;
        case 'username':
          valueA = a.user.username.toLowerCase();
          valueB = b.user.username.toLowerCase();
          break;
        case 'type':
          valueA = a.type;
          valueB = b.type;
          break;
        case 'status':
          valueA = a.status;
          valueB = b.status;
          break;
        case 'category':
          valueA = a.category;
          valueB = b.category;
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return direction === 'asc' ? -1 : 1;
      if (valueA > valueB) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }

  // Get categories for filter dropdown
  getCategories(): string[] {
    return [
      'ELECTRONICS',
      'CLOTHING',
      'DOCUMENTS',
      'BAGS',
      'KEYS',
      'JEWELRY',
      'BOOKS',
      'HOUSEHOLD',
      'VEHICLE',
      'SPORTS',
      'PETS',
      'WALLET',
      'OTHER',
    ];
  }

  // Get status badge color
  getStatusColor(status: 'ACTIVE' | 'RESOLVED' | 'ARCHIVED'): string {
    switch (status) {
      case 'ACTIVE':
        return '#4a0001'; // Rich oxblood
      case 'RESOLVED':
        return '#2d5a3d'; // Success green
      case 'ARCHIVED':
        return '#b69a99'; // Warm taupe
      default:
        return '#6b7280'; // Gray
    }
  }

  // Get type color
  getTypeColor(type: 'LOST' | 'FOUND'): string {
    return type === 'LOST' ? '#4a0001' : '#2d5a3d'; // Oxblood for lost, green for found
  }

  // Format date for display
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // Calculate time ago
  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return this.formatDate(dateString);
  }
}
