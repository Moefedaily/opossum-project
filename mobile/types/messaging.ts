import { AnnouncementDto } from "./announcement";
import { UserProfileResponse } from "./profile";

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

export interface ConversationDto {
  id: number;
  announcement: AnnouncementDto;
  starterUser: UserProfileResponse;
  recipientUser: UserProfileResponse;
  otherUser: UserProfileResponse;
  status: ConversationStatus;
  lastMessageAt?: string;
  createdAt: string;
  lastMessage?: MessageDto;
  unreadMessageCount?: number;
}

export enum ConversationStatus {
  ACTIVE = "ACTIVE",
  ARCHIVED = "ARCHIVED",
  BLOCKED = "BLOCKED",
}

// Request DTOs
export interface StartConversationRequest {
  announcementId: number;
  initialMessage: string;
}

export interface CreateMessageRequest {
  conversationId: number;
  content: string;
}

// API Response types
export interface ConversationListResponse {
  conversations: ConversationDto[];
  totalCount: number;
}

export interface MessagesResponse {
  messages: MessageDto[];
  conversationId: number;
  totalCount: number;
}
