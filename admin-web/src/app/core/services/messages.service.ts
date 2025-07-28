import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

// Types and Interfaces
export interface ConversationDto {
  id: number;
  announcement: {
    id: number;
    title: string;
    type: 'LOST' | 'FOUND';
    status: string;
  };
  starterUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  recipientUser: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  otherUser?: {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED';
  lastMessageAt?: string;
  createdAt: string;
  lastMessage?: MessageDto;
  unreadMessageCount?: number;
}

export interface MessageDto {
  id: number;
  conversationId: number;
  senderId: number;
  senderUsername: string;
  messageText: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface MessageStatistics {
  totalConversations: number;
  activeConversations: number;
  archivedConversations: number;
  totalMessages: number;
}

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private conversationsSubject = new BehaviorSubject<ConversationDto[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  private statisticsSubject = new BehaviorSubject<MessageStatistics>({
    totalConversations: 0,
    activeConversations: 0,
    archivedConversations: 0,
    totalMessages: 0,
  });
  public statistics$ = this.statisticsSubject.asObservable();

  constructor(
    private apiService: ApiService,
    private toastService: ToastService
  ) {}

  // ===== ADMIN CONVERSATION OPERATIONS =====

  /**
   * Get all conversations for admin oversight
   */
  getAllConversations(): Observable<ConversationDto[]> {
    return this.apiService
      .get<ConversationDto[]>('/api/conversations/admin/all')
      .pipe(
        tap((conversations) => {
          console.log(`Admin loaded ${conversations.length} conversations`);
          this.conversationsSubject.next(conversations);
        }),
        catchError((error) => {
          console.error('Error fetching conversations:', error);
          this.toastService.error('Failed to load conversations');
          return throwError(() => error);
        })
      );
  }

  /**
   * Get conversation statistics for admin dashboard
   */
  getStatistics(): Observable<MessageStatistics> {
    return this.apiService
      .get<MessageStatistics>('/api/conversations/admin/stats')
      .pipe(
        tap((stats) => {
          console.log('Admin conversation statistics:', stats);
          this.statisticsSubject.next(stats);
        }),
        catchError((error) => {
          console.error('Error fetching conversation statistics:', error);
          this.toastService.error('Failed to load conversation statistics');
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete conversation as admin (removes conversation + all messages)
   */
  deleteConversation(conversationId: number): Observable<void> {
    return this.apiService
      .delete<void>(`/api/conversations/admin/${conversationId}`)
      .pipe(
        tap(() => {
          console.log(`Admin deleted conversation ${conversationId}`);
          // Remove from local state
          const currentConversations = this.conversationsSubject.value;
          const updatedConversations = currentConversations.filter(
            (c) => c.id !== conversationId
          );
          this.conversationsSubject.next(updatedConversations);
          this.toastService.success('Conversation deleted successfully');
        }),
        catchError((error) => {
          console.error(
            `Error deleting conversation ${conversationId}:`,
            error
          );
          this.toastService.error('Failed to delete conversation');
          return throwError(() => error);
        })
      );
  }

  // ===== MESSAGE OPERATIONS =====

  /**
   * Get messages in a conversation
   */
  getConversationMessages(conversationId: number): Observable<MessageDto[]> {
    return this.apiService
      .get<MessageDto[]>(`/api/messages/conversation/${conversationId}`)
      .pipe(
        tap((messages) => {
          console.log(
            `Loaded ${messages.length} messages for conversation ${conversationId}`
          );
        }),
        catchError((error) => {
          console.error(
            `Error fetching messages for conversation ${conversationId}:`,
            error
          );
          this.toastService.error('Failed to load messages');
          return throwError(() => error);
        })
      );
  }

  /**
   * Delete message as admin
   */
  deleteMessage(messageId: number): Observable<void> {
    return this.apiService
      .delete<void>(`/api/messages/admin/${messageId}`)
      .pipe(
        tap(() => {
          console.log(`Admin deleted message ${messageId}`);
          this.toastService.success('Message deleted successfully');
        }),
        catchError((error) => {
          console.error(`Error deleting message ${messageId}:`, error);
          this.toastService.error('Failed to delete message');
          return throwError(() => error);
        })
      );
  }

  /**
   * Change conversation status as admin
   */
  changeConversationStatus(
    conversationId: number,
    status: string
  ): Observable<ConversationDto> {
    return this.apiService
      .patch<ConversationDto>(
        `/api/conversations/admin/${conversationId}/status`,
        { status }
      )
      .pipe(
        tap(() => {
          console.log(
            `Admin changed conversation ${conversationId} status to ${status}`
          );
          this.toastService.success(`Conversation ${status.toLowerCase()}`);
        }),
        catchError((error) => {
          console.error(`Error changing conversation status:`, error);
          this.toastService.error('Failed to change conversation status');
          return throwError(() => error);
        })
      );
  }

  // ===== SEARCH AND FILTER OPERATIONS =====

  /**
   * Filter conversations by status
   */
  filterConversationsByStatus(
    conversations: ConversationDto[],
    status: string
  ): ConversationDto[] {
    if (!status || status === 'ALL') {
      return conversations;
    }
    return conversations.filter(
      (conversation) => conversation.status === status
    );
  }

  /**
   * Filter conversations by announcement type
   */
  filterConversationsByType(
    conversations: ConversationDto[],
    type: string
  ): ConversationDto[] {
    if (!type || type === 'ALL') {
      return conversations;
    }
    return conversations.filter(
      (conversation) => conversation.announcement.type === type
    );
  }

  /**
   * Search conversations by participants or announcement title
   */
  searchConversations(
    conversations: ConversationDto[],
    searchTerm: string
  ): ConversationDto[] {
    if (!searchTerm || searchTerm.trim() === '') {
      return conversations;
    }

    const term = searchTerm.toLowerCase().trim();
    return conversations.filter(
      (conversation) =>
        conversation.announcement.title.toLowerCase().includes(term) ||
        conversation.starterUser.username.toLowerCase().includes(term) ||
        conversation.starterUser.firstName.toLowerCase().includes(term) ||
        conversation.starterUser.lastName.toLowerCase().includes(term) ||
        conversation.recipientUser.username.toLowerCase().includes(term) ||
        conversation.recipientUser.firstName.toLowerCase().includes(term) ||
        conversation.recipientUser.lastName.toLowerCase().includes(term) ||
        (
          conversation.starterUser.firstName +
          ' ' +
          conversation.starterUser.lastName
        )
          .toLowerCase()
          .includes(term) ||
        (
          conversation.recipientUser.firstName +
          ' ' +
          conversation.recipientUser.lastName
        )
          .toLowerCase()
          .includes(term)
    );
  }

  /**
   * Combined filter method for convenience
   */
  filterConversations(
    conversations: ConversationDto[],
    filters: {
      status?: string;
      type?: string;
      search?: string;
    }
  ): ConversationDto[] {
    let filtered = conversations;

    if (filters.status) {
      filtered = this.filterConversationsByStatus(filtered, filters.status);
    }

    if (filters.type) {
      filtered = this.filterConversationsByType(filtered, filters.type);
    }

    if (filters.search) {
      filtered = this.searchConversations(filtered, filters.search);
    }

    return filtered;
  }

  // ===== UTILITY METHODS =====

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get color for conversation status
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'ARCHIVED':
        return 'warning';
      case 'BLOCKED':
        return 'danger';
      default:
        return 'medium';
    }
  }

  /**
   * Get color for announcement type
   */
  getTypeColor(type: string): string {
    switch (type) {
      case 'LOST':
        return 'danger';
      case 'FOUND':
        return 'success';
      default:
        return 'medium';
    }
  }

  /**
   * Get display name for user
   */
  getUserDisplayName(user: {
    firstName: string;
    lastName: string;
    username: string;
  }): string {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user.username;
  }

  /**
   * Get conversation title for display
   */
  getConversationTitle(conversation: ConversationDto): string {
    return `${conversation.announcement.title} (${conversation.announcement.type})`;
  }

  /**
   * Get participants summary
   */
  getParticipantsSummary(conversation: ConversationDto): string {
    const starter = this.getUserDisplayName(conversation.starterUser);
    const recipient = this.getUserDisplayName(conversation.recipientUser);
    return `${starter} ↔ ${recipient}`;
  }

  // ===== REFRESH METHODS =====

  /**
   * Refresh conversations data
   */
  refreshConversations(): Observable<ConversationDto[]> {
    return this.getAllConversations();
  }

  /**
   * Refresh statistics data
   */
  refreshStatistics(): Observable<MessageStatistics> {
    return this.getStatistics();
  }

  archiveConversation(conversationId: number): Observable<ConversationDto> {
    return this.changeConversationStatus(conversationId, 'ARCHIVED');
  }

  blockConversation(conversationId: number): Observable<ConversationDto> {
    return this.changeConversationStatus(conversationId, 'BLOCKED');
  }

  activateConversation(conversationId: number): Observable<ConversationDto> {
    return this.changeConversationStatus(conversationId, 'ACTIVE');
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.conversationsSubject.next([]);
    this.statisticsSubject.next({
      totalConversations: 0,
      activeConversations: 0,
      archivedConversations: 0,
      totalMessages: 0,
    });
  }
}
