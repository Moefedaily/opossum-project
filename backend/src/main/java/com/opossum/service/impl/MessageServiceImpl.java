// File: src/main/java/com/opossum/service/impl/MessageServiceImpl.java
package com.opossum.service.impl;

import com.opossum.dto.messaging.CreateMessageRequest;
import com.opossum.dto.messaging.MessageDto;
import com.opossum.entity.messaging.Conversation;
import com.opossum.entity.messaging.ConversationStatus;
import com.opossum.entity.messaging.Message;
import com.opossum.entity.User;
import com.opossum.mapper.MessageMapper;
import com.opossum.repository.ConversationRepository;
import com.opossum.repository.MessageRepository;
import com.opossum.repository.UserRepository;
import com.opossum.service.MessageEncryptionService;
import com.opossum.service.MessageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final MessageMapper messageMapper;
    private final MessageEncryptionService encryptionService;

    @Override
    public MessageDto sendMessage(CreateMessageRequest request, Long senderId) {
        log.info("Sending message to conversation {} by user {}", request.getConversationId(), senderId);

        // Find conversation
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(
                        () -> new RuntimeException("Conversation not found with ID: " + request.getConversationId()));

        // check the status of the conversation
        if (conversation.getStatus() == ConversationStatus.ARCHIVED) {
            throw new RuntimeException("This conversation has been archived and is no longer active");
        }

        if (conversation.getStatus() == ConversationStatus.BLOCKED) {
            throw new RuntimeException("This conversation has been restricted by an administrator");
        }
        // Check if user is participant
        if (!conversation.isParticipant(senderId)) {
            throw new RuntimeException("User not authorized to send messages in this conversation");
        }

        // Find sender
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + senderId));

        // Create message
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(sender);
        message.setMessageText(encryptionService.encryptMessage(request.getContent()));
        message.setIsRead(false);

        Message savedMessage = messageRepository.save(message);

        // Update conversation last message time
        conversation.setLastMessageAt(LocalDateTime.now());
        conversationRepository.save(conversation);

        log.info("Message sent successfully with ID: {}", savedMessage.getId());
        return messageMapper.toDto(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MessageDto> getConversationMessages(Long conversationId, Long userId) {
        log.debug("Getting messages for conversation {} by user {}", conversationId, userId);

        // Check if user is participant
        if (!isUserParticipantInConversation(conversationId, userId)) {
            throw new RuntimeException("User not authorized to view messages in this conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
        return messageMapper.toDtoList(messages);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<MessageDto> getMessageById(Long id, Long userId) {
        log.debug("Getting message by ID: {} for user: {}", id, userId);

        Optional<Message> message = messageRepository.findById(id);
        if (message.isPresent() && canAccessMessage(id, userId)) {
            return Optional.of(messageMapper.toDto(message.get()));
        }

        return Optional.empty();
    }

    @Override
    public MessageDto markMessageAsRead(Long messageId, Long userId) {
        log.info("Marking message {} as read by user {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));

        // Check if user can access message and is not the sender
        if (!canAccessMessage(messageId, userId)) {
            throw new RuntimeException("User not authorized to access this message");
        }

        if (message.getSender().getId().equals(userId)) {
            throw new RuntimeException("Cannot mark own message as read");
        }

        message.markAsRead();
        Message savedMessage = messageRepository.save(message);

        return messageMapper.toDto(savedMessage);
    }

    @Override
    public void markConversationMessagesAsRead(Long conversationId, Long userId) {
        log.info("Marking all messages as read in conversation {} by user {}", conversationId, userId);

        // Check if user is participant
        if (!isUserParticipantInConversation(conversationId, userId)) {
            throw new RuntimeException("User not authorized to mark messages as read in this conversation");
        }

        List<Message> messages = messageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);

        for (Message message : messages) {
            if (!message.getSender().getId().equals(userId) && !message.getIsRead()) {
                message.markAsRead();
                messageRepository.save(message);
            }
        }
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        log.info("Deleting message {} by user {}", messageId, userId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));

        // Only sender can delete their own messages
        if (!message.getSender().getId().equals(userId)) {
            throw new RuntimeException("User not authorized to delete this message");
        }

        messageRepository.delete(message);
        log.info("Message deleted successfully with ID: {}", messageId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadMessageCount(Long userId) {
        return messageRepository.countUnreadByUser(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadMessageCountForConversation(Long conversationId, Long userId) {
        return messageRepository.countUnreadByConversationAndUser(conversationId, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canAccessMessage(Long messageId, Long userId) {
        Optional<Message> message = messageRepository.findById(messageId);
        if (message.isPresent()) {
            return message.get().getConversation().isParticipant(userId);
        }
        return false;
    }

    private boolean isUserParticipantInConversation(Long conversationId, Long userId) {
        Optional<Conversation> conversation = conversationRepository.findById(conversationId);
        return conversation.isPresent() && conversation.get().isParticipant(userId);
    }

    @Override
    @Transactional
    public void deleteMessageAsAdmin(Long messageId) {
        log.info("Admin deleting message with ID: {}", messageId);

        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found with ID: " + messageId));

        messageRepository.delete(message);

        log.info("Message deleted successfully by admin: {}", messageId);
    }
}