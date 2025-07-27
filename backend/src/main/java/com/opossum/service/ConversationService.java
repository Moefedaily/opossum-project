package com.opossum.service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.opossum.dto.messaging.ConversationDto;
import com.opossum.dto.messaging.StartConversationRequest;

public interface ConversationService {

    // Create operations
    ConversationDto startConversation(StartConversationRequest request, Long starterUserId);

    // Read operations
    List<ConversationDto> getUserConversations(Long userId);

    Optional<ConversationDto> getConversationById(Long id, Long userId);

    List<ConversationDto> getActiveConversations(Long userId);

    // Update operations
    void archiveConversation(Long id, Long userId);

    void reactivateConversation(Long id, Long userId);

    // Utility operations
    boolean isUserParticipant(Long conversationId, Long userId);

    long getUnreadConversationsCount(Long userId);

    List<ConversationDto> getAllConversationsForAdmin();

    Map<String, Object> getConversationStatistics();

    void deleteConversationAsAdmin(Long conversationId);
}
