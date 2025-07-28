import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import {
  MessageService,
  ConversationDto,
  MessageDto,
} from '../../../core/services/messages.service';

@Component({
  selector: 'app-conversation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDividerModule,
  ],
  templateUrl: './conversation-detail.component.html',
  styleUrls: ['./conversation-detail.component.scss'],
})
export class ConversationDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  conversation: ConversationDto | null = null;
  messages: MessageDto[] = [];
  conversationId: number | null = null;

  // Loading states
  loading = true;
  loadingMessages = false;
  deletingConversation = false;
  deletingMessage: { [key: number]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    // Get conversation ID from route
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.conversationId = +params['id'];
      if (this.conversationId) {
        this.loadConversationData();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load conversation and messages data
   */
  loadConversationData(): void {
    if (!this.conversationId) return;

    this.loading = true;
    this.loadingMessages = true;

    // First get all conversations to find this one
    this.messageService
      .getAllConversations()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (conversations) => {
          this.conversation =
            conversations.find((c) => c.id === this.conversationId) || null;
          this.loading = false;

          if (this.conversation) {
            this.loadMessages();
          } else {
            console.error('Conversation not found');
            this.router.navigate(['/messages']);
          }
        },
        error: (error) => {
          console.error('Error loading conversation:', error);
          this.loading = false;
          this.router.navigate(['/messages']);
        },
      });
  }

  /**
   * Load messages for the conversation
   */
  loadMessages(): void {
    if (!this.conversationId) return;

    this.loadingMessages = true;

    this.messageService
      .getConversationMessages(this.conversationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (messages) => {
          this.messages = messages;
          this.loadingMessages = false;
          // Scroll to bottom after messages load
          setTimeout(() => this.scrollToBottom(), 100);
        },
        error: (error: any) => {
          console.error('Error loading messages:', error);
          this.loadingMessages = false;
        },
      });
  }

  /**
   * Delete the entire conversation
   */
  deleteConversation(): void {
    if (!this.conversation) return;

    if (
      !confirm(
        `Are you sure you want to delete this entire conversation about "${this.conversation.announcement.title}"?\n\nThis will permanently delete all ${this.messages.length} messages. This action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingConversation = true;

    this.messageService
      .deleteConversation(this.conversation.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Navigate back to conversation list
          this.router.navigate(['/messages']);
        },
        error: (error: any) => {
          console.error('Error deleting conversation:', error);
          this.deletingConversation = false;
        },
      });
  }

  /**
   * Delete individual message
   */
  deleteMessage(message: MessageDto): void {
    if (
      !confirm(
        `Are you sure you want to delete this message?\n\n"${message.messageText}"\n\nThis action cannot be undone.`
      )
    ) {
      return;
    }

    this.deletingMessage[message.id] = true;

    this.messageService
      .deleteMessage(message.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Remove message from local array
          this.messages = this.messages.filter((m) => m.id !== message.id);
          this.deletingMessage[message.id] = false;
        },
        error: (error: any) => {
          console.error('Error deleting message:', error);
          this.deletingMessage[message.id] = false;
        },
      });
  }

  /**
   * Refresh conversation data
   */
  refreshData(): void {
    this.loadConversationData();
  }

  /**
   * Navigate back to conversation list
   */
  goBack(): void {
    this.router.navigate(['/messages']);
  }

  /**
   * Scroll to bottom of messages
   */
  private scrollToBottom(): void {
    try {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    } catch (err) {
      console.error('Error scrolling to bottom:', err);
    }
  }

  // ===== UTILITY METHODS =====

  /**
   * Get formatted date
   */
  getFormattedDate(dateString: string): string {
    return this.messageService.formatDate(dateString);
  }

  /**
   * Get full formatted date
   */
  getFullFormattedDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
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
  getConversationTitle(): string {
    if (!this.conversation) return '';
    return this.messageService.getConversationTitle(this.conversation);
  }

  /**
   * Get participants summary
   */
  getParticipantsSummary(): string {
    if (!this.conversation) return '';
    return this.messageService.getParticipantsSummary(this.conversation);
  }

  /**
   * Check if message is from starter user
   */
  isFromStarter(message: MessageDto): boolean {
    return this.conversation?.starterUser.id === message.senderId;
  }

  /**
   * Get sender info for message
   */
  getSenderInfo(message: MessageDto): any {
    if (!this.conversation) return null;

    if (message.senderId === this.conversation.starterUser.id) {
      return this.conversation.starterUser;
    } else {
      return this.conversation.recipientUser;
    }
  }

  /**
   * Get user avatar letter
   */
  getUserAvatarLetter(user: any): string {
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    } else if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  }

  /**
   * Check if deleting specific message
   */
  isDeletingMessage(messageId: number): boolean {
    return !!this.deletingMessage[messageId];
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
   * Track by function for ngFor performance
   */
  trackByMessageId(index: number, message: MessageDto): number {
    return message.id;
  }

  /**
   * Get message time for grouping
   */
  getMessageTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  /**
   * Check if messages are from same day
   */
  isSameDay(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.toDateString() === d2.toDateString();
  }

  /**
   * Get date separator text
   */
  getDateSeparator(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Check if date separator should be shown
   */
  shouldShowDateSeparator(index: number): boolean {
    if (index === 0) return true;

    const currentMessage = this.messages[index];
    const previousMessage = this.messages[index - 1];

    return !this.isSameDay(currentMessage.createdAt, previousMessage.createdAt);
  }
}
