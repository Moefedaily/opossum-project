import api, { handleApiError } from "./api";
import {
  ConversationDto,
  MessageDto,
  StartConversationRequest,
  CreateMessageRequest,
} from "../types/messaging";

export const messagingService = {
  // ===== CONVERSATIONS =====

  /**
   * Get all conversations for the current user
   */
  getUserConversations: async (): Promise<ConversationDto[]> => {
    try {
      console.log("Fetching user conversations");
      const response = await api.get("/api/conversations");
      console.log(`Loaded ${response.data.length} conversations`);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  /**
   * Get only active conversations for the current user
   */
  getActiveConversations: async (): Promise<ConversationDto[]> => {
    try {
      console.log("Fetching active conversations");
      const response = await api.get("/api/conversations/active");
      console.log(`Loaded ${response.data.length} active conversations`);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  /**
   * Start a new conversation about an announcement
   */
  startConversation: async (
    request: StartConversationRequest
  ): Promise<ConversationDto> => {
    try {
      console.log(
        "Starting new conversation for announcement:",
        request.announcementId
      );
      const response = await api.post("/api/conversations/start", request);
      console.log("Conversation started with ID:", response.data.id);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  // ===== MESSAGES =====

  /**
   * Get all messages in a conversation (PERFECT for polling!)
   */
  getConversationMessages: async (
    conversationId: number
  ): Promise<MessageDto[]> => {
    try {
      console.log(`Fetching messages for conversation ${conversationId}`);
      const response = await api.get(
        `/api/messages/conversation/${conversationId}`
      );
      console.log(`Loaded ${response.data.length} messages`);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  /**
   * Send a message in a conversation
   */
  sendMessage: async (request: CreateMessageRequest): Promise<MessageDto> => {
    try {
      console.log(`Sending message to conversation ${request.conversationId}`);
      const response = await api.post("/api/messages", request);
      console.log("Message sent with ID:", response.data.id);
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  /**
   * Mark a message as read
   */
  markMessageAsRead: async (messageId: number): Promise<MessageDto> => {
    try {
      console.log(`Marking message ${messageId} as read`);
      const response = await api.patch(`/api/messages/${messageId}/read`);
      console.log("Message marked as read");
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },

  /**
   * Get a specific message by ID
   */
  getMessageById: async (messageId: number): Promise<MessageDto> => {
    try {
      console.log(`Fetching message ${messageId}`);
      const response = await api.get(`/api/messages/${messageId}`);
      console.log("Message loaded");
      return response.data;
    } catch (error: any) {
      const apiError = handleApiError(error);
      throw new Error(apiError.error);
    }
  },
};

/**
 * Format conversation time for display
 */
export const formatConversationTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

/**
 * Format message time for display
 */
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

/**
 * Get initials from username for avatar
 */
export const getInitials = (username: string): string => {
  if (!username) return "?";
  const words = username.split(" ");
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return username.slice(0, 2).toUpperCase();
};
