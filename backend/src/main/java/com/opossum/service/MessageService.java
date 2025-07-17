package com.opossum.service;

import com.opossum.dto.messaging.CreateMessageRequest;
import com.opossum.dto.messaging.MessageDto;

import java.util.List;
import java.util.Optional;

public interface MessageService {

        MessageDto sendMessage(CreateMessageRequest request, Long senderId);

        // Read operations
        List<MessageDto> getConversationMessages(Long conversationId, Long userId);

        Optional<MessageDto> getMessageById(Long id, Long userId);

        // Update operations
        MessageDto markMessageAsRead(Long messageId, Long userId);

        void markConversationMessagesAsRead(Long conversationId, Long userId);

        // Delete operations
        void deleteMessage(Long messageId, Long userId);

        // Statistics
        long getUnreadMessageCount(Long userId);

        long getUnreadMessageCountForConversation(Long conversationId, Long userId);

        // Validation
        boolean canAccessMessage(Long messageId, Long userId);
}