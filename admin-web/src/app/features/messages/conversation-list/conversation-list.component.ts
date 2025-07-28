// src/app/features/messages/conversation-list/conversation-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
  MessageService,
  ConversationDto,
  MessageStatistics,
} from '../../../core/services/messages.service';

@Component({
  selector: 'app-conversation-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTableModule,
    MatSortModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
})
export class ConversationListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  conversations: ConversationDto[] = [];
  filteredConversations: ConversationDto[] = [];
  statistics: MessageStatistics = {
    totalConversations: 0,
    activeConversations: 0,
    archivedConversations: 0,
    totalMessages: 0,
  };

  // Loading states
  loading = true;
  deleting: { [key: number]: boolean } = {};

  // Filters
  searchTerm = '';
  statusFilter = 'ALL';
  typeFilter = 'ALL';

  // Filter options
  statusOptions = [
    { value: 'ALL', label: 'All Status' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'ARCHIVED', label: 'Archived' },
    { value: 'BLOCKED', label: 'Blocked' },
  ];

  typeOptions = [
    { value: 'ALL', label: 'All Types' },
    { value: 'LOST', label: 'Lost Items' },
    { value: 'FOUND', label: 'Found Items' },
  ];

  // Table columns
  displayedColumns: string[] = [
    'conversation',
    'participants',
    'status',
    'messages',
    'lastActivity',
    'actions',
  ];

  // Search subject for debouncing
  private searchSubject = new Subject<string>();

  constructor(private messageService: MessageService, private router: Router) {
    // Setup debounced search
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        this.searchTerm = searchTerm;
        this.applyFilters();
      });
  }

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load initial data
   */
  loadData(): void {
    this.loading = true;

    // Load both conversations and statistics
    combineLatest([
      this.messageService.getAllConversations(),
      this.messageService.getStatistics(),
    ])
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ([conversations, statistics]) => {
          this.conversations = conversations;
          this.statistics = statistics;
          this.applyFilters();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading conversation data:', error);
          this.loading = false;
        },
      });
  }

  /**
   * Apply all filters to conversations
   */
  applyFilters(): void {
    this.filteredConversations = this.messageService.filterConversations(
      this.conversations,
      {
        status: this.statusFilter,
        type: this.typeFilter,
        search: this.searchTerm,
      }
    );
  }

  /**
   * Handle search input
   */
  onSearchInput(event: any): void {
    this.searchSubject.next(event.target.value);
  }

  /**
   * Handle status filter change
   */
  onStatusFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Handle type filter change
   */
  onTypeFilterChange(): void {
    this.applyFilters();
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'ALL';
    this.typeFilter = 'ALL';
    this.applyFilters();
  }

  /**
   * View conversation details
   */
  viewConversation(conversation: ConversationDto): void {
    this.router.navigate(['/messages/conversation', conversation.id]);
  }

  /**
   * Delete conversation with confirmation
   */
  deleteConversation(conversation: ConversationDto, event: Event): void {
    event.stopPropagation(); // Prevent row click

    if (
      !confirm(
        `Are you sure you want to delete the conversation about "${conversation.announcement.title}"?\n\nThis will permanently delete the conversation and all its messages. This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deleting[conversation.id] = true;

    this.messageService
      .deleteConversation(conversation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove from local arrays
          this.conversations = this.conversations.filter(
            (c) => c.id !== conversation.id
          );
          this.applyFilters();

          // Update statistics
          this.statistics.totalConversations--;
          if (conversation.status === 'ACTIVE') {
            this.statistics.activeConversations--;
          } else if (conversation.status === 'ARCHIVED') {
            this.statistics.archivedConversations--;
          }

          this.deleting[conversation.id] = false;
        },
        error: (error: any) => {
          console.error('Error deleting conversation:', error);
          this.deleting[conversation.id] = false;
        },
      });
  }

  /**
   * Refresh data
   */
  refreshData(): void {
    this.loadData();
  }

  // ===== UTILITY METHODS =====

  /**
   * Get formatted date
   */
  getFormattedDate(dateString: string): string {
    return this.messageService.formatDate(dateString);
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    return this.messageService.getStatusColor(status);
  }

  /**
   * Get type color
   */
  getTypeColor(type: string): string {
    return this.messageService.getTypeColor(type);
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: any): string {
    return this.messageService.getUserDisplayName(user);
  }

  /**
   * Get conversation title
   */
  getConversationTitle(conversation: ConversationDto): string {
    return this.messageService.getConversationTitle(conversation);
  }

  /**
   * Get participants summary
   */
  getParticipantsSummary(conversation: ConversationDto): string {
    return this.messageService.getParticipantsSummary(conversation);
  }

  /**
   * Check if conversation has unread messages
   */
  hasUnreadMessages(conversation: ConversationDto): boolean {
    return (conversation.unreadMessageCount || 0) > 0;
  }

  /**
   * Get last message preview
   */
  getLastMessagePreview(conversation: ConversationDto): string {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const message = conversation.lastMessage.messageText;
    return message.length > 100 ? message.substring(0, 100) + '...' : message;
  }

  /**
   * Track by function for ngFor performance
   */
  trackByConversationId(index: number, conversation: ConversationDto): number {
    return conversation.id;
  }
}
