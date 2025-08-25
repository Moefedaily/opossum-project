import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, switchMap, catchError } from 'rxjs/operators';
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
  userId: number;
  username: string;
  userEmail: string;
  userFullName: string;
  files: FileItem[];
}

export interface FileItem {
  id: number;
  filename: string;
  originalFilename: string;
  storedFilename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  formattedFileSize: string;
  uploadedBy: number;
  uploadedByUsername: string;
  createdAt: string;
  url: string;
  thumbnailUrl?: string;
  optimizedUrl?: string;
  isImage: boolean;
  contentType: string;
  publicId: string;
  isActive: boolean;
  announcementId: number;
  announcementTitle: string;
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

  // Get all announcements (for admin view) WITH FILES
  getAllAnnouncements(): Observable<AnnouncementListItem[]> {
    return this.apiService
      .get<AnnouncementListItem[]>('/api/announcements/admin/all')
      .pipe(
        switchMap((announcements) => {
          // If no announcements, return empty array
          if (!announcements || announcements.length === 0) {
            return of([]);
          }

          // For each announcement, fetch its files
          const announcementsWithFiles$ = announcements.map((announcement) =>
            this.apiService
              .get<any>(`/api/files/announcement/${announcement.id}`)
              .pipe(
                map((filesResponse) => {
                  // Handle nested response structure from backend
                  let files: FileItem[] = [];

                  if (filesResponse) {
                    if (Array.isArray(filesResponse)) {
                      // Direct array response
                      files = filesResponse;
                    } else if (
                      filesResponse.files &&
                      Array.isArray(filesResponse.files)
                    ) {
                      // Nested response with files property
                      files = filesResponse.files;
                    }
                  }

                  return {
                    ...announcement,
                    files: files || [],
                  };
                }),
                catchError((fileError) => {
                  // If files fail for this announcement, continue with empty files
                  console.warn(
                    `No files found for announcement ${announcement.id}:`,
                    fileError
                  );
                  return of({
                    ...announcement,
                    files: [],
                  });
                })
              )
          );

          return forkJoin(announcementsWithFiles$);
        }),
        catchError((error) => {
          console.error('Error fetching announcements:', error);
          throw error;
        })
      );
  }

  // Get single announcement details WITH FILES
  getAnnouncementById(
    announcementId: number
  ): Observable<AnnouncementListItem> {
    return this.apiService
      .get<AnnouncementListItem>(`/api/announcements/${announcementId}`)
      .pipe(
        switchMap((announcement) => {
          // First get the announcement, then get its files
          return this.apiService
            .get<any>(`/api/files/announcement/${announcementId}`)
            .pipe(
              map((filesResponse) => {
                // Handle nested response structure from backend
                let files: FileItem[] = [];

                if (filesResponse) {
                  if (Array.isArray(filesResponse)) {
                    // Direct array response
                    files = filesResponse;
                  } else if (
                    filesResponse.files &&
                    Array.isArray(filesResponse.files)
                  ) {
                    // Nested response with files property
                    files = filesResponse.files;
                  }
                }

                return {
                  ...announcement,
                  files: files || [],
                };
              }),
              catchError((fileError) => {
                // If files endpoint fails, continue with announcement but empty files array
                console.warn(
                  `No files found for announcement ${announcementId}:`,
                  fileError
                );
                return of({
                  ...announcement,
                  files: [],
                });
              })
            );
        }),
        catchError((error) => {
          console.error('Error fetching announcement:', error);
          throw error;
        })
      );
  }

  // Get recent announcements WITH FILES (for dashboard)
  getRecentAnnouncements(
    limit: number = 10
  ): Observable<AnnouncementListItem[]> {
    return this.apiService
      .get<AnnouncementListItem[]>('/api/announcements/recent', { limit })
      .pipe(
        switchMap((announcements) => {
          // If no announcements, return empty array
          if (!announcements || announcements.length === 0) {
            return of([]);
          }

          // For each announcement, fetch its files
          const announcementsWithFiles$ = announcements.map((announcement) =>
            this.apiService
              .get<any>(`/api/files/announcement/${announcement.id}`)
              .pipe(
                map((filesResponse) => {
                  // Handle nested response structure from backend
                  let files: FileItem[] = [];

                  if (filesResponse) {
                    if (Array.isArray(filesResponse)) {
                      // Direct array response
                      files = filesResponse;
                    } else if (
                      filesResponse.files &&
                      Array.isArray(filesResponse.files)
                    ) {
                      // Nested response with files property
                      files = filesResponse.files;
                    }
                  }

                  return {
                    ...announcement,
                    files: files || [],
                  };
                }),
                catchError((fileError) => {
                  // If files fail for this announcement, continue with empty files
                  console.warn(
                    `No files found for announcement ${announcement.id}:`,
                    fileError
                  );
                  return of({
                    ...announcement,
                    files: [],
                  });
                })
              )
          );

          return forkJoin(announcementsWithFiles$);
        }),
        catchError((error) => {
          console.error('Error fetching recent announcements:', error);
          throw error;
        })
      );
  }

  // Get announcements by user WITH FILES (for user detail page)
  getAnnouncementsByUser(userId: number): Observable<AnnouncementListItem[]> {
    return this.apiService
      .get<AnnouncementListItem[]>('/api/announcements', { userId })
      .pipe(
        switchMap((announcements) => {
          // If no announcements, return empty array
          if (!announcements || announcements.length === 0) {
            return of([]);
          }

          // For each announcement, fetch its files
          const announcementsWithFiles$ = announcements.map((announcement) =>
            this.apiService
              .get<any>(`/api/files/announcement/${announcement.id}`)
              .pipe(
                map((filesResponse) => {
                  // Handle nested response structure from backend
                  let files: FileItem[] = [];

                  if (filesResponse) {
                    if (Array.isArray(filesResponse)) {
                      // Direct array response
                      files = filesResponse;
                    } else if (
                      filesResponse.files &&
                      Array.isArray(filesResponse.files)
                    ) {
                      // Nested response with files property
                      files = filesResponse.files;
                    }
                  }

                  return {
                    ...announcement,
                    files: files || [],
                  };
                }),
                catchError((fileError) => {
                  // If files fail for this announcement, continue with empty files
                  console.warn(
                    `No files found for announcement ${announcement.id}:`,
                    fileError
                  );
                  return of({
                    ...announcement,
                    files: [],
                  });
                })
              )
          );

          return forkJoin(announcementsWithFiles$);
        }),
        catchError((error) => {
          console.error('Error fetching user announcements:', error);
          throw error;
        })
      );
  }
  // Delete announcement (admin can delete any announcement)
  deleteAnnouncement(announcementId: number): Observable<{ message: string }> {
    // Use admin endpoint for deletion since admin should be able to delete any announcement
    return this.apiService.delete<{ message: string }>(
      `/api/announcements/admin/${announcementId}`
    );
  }

  // Activate announcement (admin can activate any announcement)
  activateAnnouncement(
    announcementId: number
  ): Observable<{ message: string }> {
    return this.apiService.patch<{ message: string }>(
      `/api/announcements/${announcementId}/activate`,
      {}
    );
  }

  // Deactivate announcement (admin can deactivate any announcement)
  deactivateAnnouncement(
    announcementId: number
  ): Observable<{ message: string }> {
    return this.apiService.patch<{ message: string }>(
      `/api/announcements/${announcementId}/deactivate`,
      {}
    );
  }

  // Get announcement statistics (for admin dashboard)
  getAnnouncementStats(): Observable<AnnouncementStats> {
    return this.apiService.get<AnnouncementStats>('/api/announcements/stats');
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
        announcement.username.toLowerCase().includes(term) ||
        announcement.userEmail.toLowerCase().includes(term) ||
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
          valueA = a.username.toLowerCase();
          valueB = b.username.toLowerCase();
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
