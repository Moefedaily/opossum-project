package com.opossum.service.impl;

import com.opossum.dto.messaging.ConversationDto;
import com.opossum.dto.messaging.StartConversationRequest;
import com.opossum.entity.announcement.Announcement;
import com.opossum.entity.messaging.Conversation;
import com.opossum.entity.messaging.ConversationStatus;
import com.opossum.entity.messaging.Message;
import com.opossum.entity.User;
import com.opossum.mapper.ConversationMapper;
import com.opossum.repository.AnnouncementRepository;
import com.opossum.repository.ConversationRepository;
import com.opossum.repository.MessageRepository;
import com.opossum.repository.UserRepository;
import com.opossum.service.ConversationService;
import com.opossum.service.MessageEncryptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConversationServiceImpl implements ConversationService {

    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final MessageRepository messageRepository;
    private final ConversationMapper conversationMapper;
    private final MessageEncryptionService encryptionService;

    @Override
    public ConversationDto startConversation(StartConversationRequest request, Long starterUserId) {
        log.info("Starting conversation for announcement {} by user {}", request.getAnnouncementId(), starterUserId);

        // Find announcement
        Announcement announcement = announcementRepository.findById(request.getAnnouncementId())
                .orElseThrow(
                        () -> new RuntimeException("Announcement not found with ID: " + request.getAnnouncementId()));

        // Find users
        User starterUser = userRepository.findById(starterUserId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + starterUserId));

        User recipientUser = announcement.getUser();

        // Check if user is trying to message themselves
        if (starterUserId.equals(recipientUser.getId())) {
            throw new RuntimeException("Cannot start conversation with yourself");
        }

        // Check if conversation already exists
        Optional<Conversation> existingConversation = conversationRepository
                .findByAnnouncementAndUsers(request.getAnnouncementId(), starterUserId, recipientUser.getId());

        if (existingConversation.isPresent()) {
            log.info("Conversation already exists, returning existing conversation");
            return conversationMapper.toDto(existingConversation.get(), starterUserId);
        }

        // Create new conversation
        Conversation conversation = new Conversation();
        conversation.setAnnouncement(announcement);
        conversation.setStarterUser(starterUser);
        conversation.setRecipientUser(recipientUser);
        conversation.setStatus(ConversationStatus.ACTIVE);
        conversation.setLastMessageAt(LocalDateTime.now());

        Conversation savedConversation = conversationRepository.save(conversation);

        // Create initial message
        Message initialMessage = new Message();
        initialMessage.setConversation(savedConversation);
        initialMessage.setSender(starterUser);
        initialMessage.setMessageText(encryptionService.encryptMessage(request.getInitialMessage()));
        initialMessage.setIsRead(false);

        messageRepository.save(initialMessage);

        log.info("Conversation created successfully with ID: {}", savedConversation.getId());
        return conversationMapper.toDto(savedConversation, starterUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getUserConversations(Long userId) {
        log.debug("Getting conversations for user ID: {}", userId);
        List<Conversation> conversations = conversationRepository.findByUserId(userId);
        return conversationMapper.toDtoList(conversations, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ConversationDto> getConversationById(Long id, Long userId) {
        log.debug("Getting conversation by ID: {} for user: {}", id, userId);

        Optional<Conversation> conversation = conversationRepository.findById(id);
        if (conversation.isPresent() && conversation.get().isParticipant(userId)) {
            return Optional.of(conversationMapper.toDto(conversation.get(), userId));
        }

        return Optional.empty();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getActiveConversations(Long userId) {
        log.debug("Getting active conversations for user ID: {}", userId);
        List<Conversation> conversations = conversationRepository.findByUserIdAndStatus(userId,
                ConversationStatus.ACTIVE);
        return conversationMapper.toDtoList(conversations, userId);
    }

    @Override
    public void archiveConversation(Long id, Long userId) {
        log.info("Archiving conversation ID: {} by user: {}", id, userId);

        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + id));

        if (!conversation.isParticipant(userId)) {
            throw new RuntimeException("User not authorized to archive this conversation");
        }

        conversation.setStatus(ConversationStatus.ARCHIVED);
        conversationRepository.save(conversation);
    }

    @Override
    public void reactivateConversation(Long id, Long userId) {
        log.info("Reactivating conversation ID: {} by user: {}", id, userId);

        Conversation conversation = conversationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + id));

        if (!conversation.isParticipant(userId)) {
            throw new RuntimeException("User not authorized to reactivate this conversation");
        }

        conversation.setStatus(ConversationStatus.ACTIVE);
        conversationRepository.save(conversation);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isUserParticipant(Long conversationId, Long userId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        return conversation.isPresent() && conversation.get().isParticipant(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadConversationsCount(Long userId) {
        return conversationRepository.countByUserIdAndStatus(userId, ConversationStatus.ACTIVE);
    }

    // Add to existing ConversationServiceImpl.java

    @Override
    @Transactional(readOnly = true)
    public List<ConversationDto> getAllConversationsForAdmin() {
        log.debug("Admin getting all conversations");
        List<Conversation> conversations = conversationRepository.findAllByOrderByLastMessageAtDesc();
        // Note: Pass null as userId since admin sees all
        return conversationMapper.toDtoListForAdmin(conversations);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getConversationStatistics() {
        log.debug("Getting conversation statistics for admin");

        long totalConversations = conversationRepository.count();
        long activeConversations = conversationRepository.countByStatus(ConversationStatus.ACTIVE);
        long archivedConversations = conversationRepository.countByStatus(ConversationStatus.ARCHIVED);
        long totalMessages = messageRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalConversations", totalConversations);
        stats.put("activeConversations", activeConversations);
        stats.put("archivedConversations", archivedConversations);
        stats.put("totalMessages", totalMessages);

        return stats;
    }

    @Override
    @Transactional
    public void deleteConversationAsAdmin(Long conversationId) {
        log.info("Admin deleting conversation with ID: {}", conversationId);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + conversationId));

        // Delete all messages in conversation first
        messageRepository.deleteByConversationId(conversationId);

        // Delete conversation
        conversationRepository.delete(conversation);

        log.info("Conversation and all messages deleted successfully by admin: {}", conversationId);
    }

    @Override
    @Transactional
    public ConversationDto changeConversationStatus(Long conversationId, String newStatus) {
        log.info("Admin changing conversation {} status to {}", conversationId, newStatus);

        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation not found with ID: " + conversationId));

        // Validate status
        ConversationStatus status;
        try {
            status = ConversationStatus.valueOf(newStatus.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException(
                    "Invalid status: " + newStatus + ". Valid statuses are: ACTIVE, ARCHIVED, BLOCKED");
        }

        ConversationStatus oldStatus = conversation.getStatus();
        conversation.setStatus(status);
        conversationRepository.save(conversation);

        log.info("Conversation {} status changed from {} to {}", conversationId, oldStatus, status);
        return conversationMapper.toDtoForAdmin(conversation);
    }
}