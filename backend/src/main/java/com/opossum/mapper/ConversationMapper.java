package com.opossum.mapper;

import com.opossum.entity.messaging.Conversation;
import com.opossum.entity.messaging.Message;
import com.opossum.dto.messaging.ConversationDto;

import com.opossum.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ConversationMapper {

    private final UserMapper userMapper;
    private final AnnouncementMapper announcementMapper;
    private final MessageMapper messageMapper;

    public ConversationDto toDto(Conversation conversation, Long currentUserId) {
        if (conversation == null) {
            return null;
        }

        ConversationDto dto = new ConversationDto();
        dto.setId(conversation.getId());
        dto.setStatus(conversation.getStatus());
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setCreatedAt(conversation.getCreatedAt());

        // Set announcement info
        if (conversation.getAnnouncement() != null) {
            dto.setAnnouncement(announcementMapper.toDto(conversation.getAnnouncement()));
        }

        // Set user info
        dto.setStarterUser(userMapper.toDto(conversation.getStarterUser()));
        dto.setRecipientUser(userMapper.toDto(conversation.getRecipientUser()));

        // Set other user from current user's perspective
        User otherUser = conversation.getOtherUser(currentUserId);
        dto.setOtherUser(userMapper.toDto(otherUser));

        return dto;
    }

    public List<ConversationDto> toDtoList(List<Conversation> conversations, Long currentUserId) {
        if (conversations == null) {
            return null;
        }

        return conversations.stream()
                .map(conversation -> toDto(conversation, currentUserId))
                .collect(Collectors.toList());
    }

    // Add to existing ConversationMapper

    public List<ConversationDto> toDtoListForAdmin(List<Conversation> conversations) {
        if (conversations == null) {
            return null;
        }
        return conversations.stream()
                .map(this::toDtoForAdmin)
                .collect(Collectors.toList());
    }

    public ConversationDto toDtoForAdmin(Conversation conversation) {
        if (conversation == null) {
            return null;
        }

        ConversationDto dto = new ConversationDto();
        dto.setId(conversation.getId());
        dto.setStatus(conversation.getStatus());
        dto.setLastMessageAt(conversation.getLastMessageAt());
        dto.setCreatedAt(conversation.getCreatedAt());

        // Set announcement info (same as user view)
        if (conversation.getAnnouncement() != null) {
            dto.setAnnouncement(announcementMapper.toDto(conversation.getAnnouncement()));
        }

        // Set both users (admin sees both participants clearly)
        dto.setStarterUser(userMapper.toDto(conversation.getStarterUser()));
        dto.setRecipientUser(userMapper.toDto(conversation.getRecipientUser()));

        // For admin: don't set otherUser (no perspective needed)
        dto.setOtherUser(null);

        // Admin-specific: Get last message if available
        if (conversation.getMessages() != null && !conversation.getMessages().isEmpty()) {
            Message lastMessage = conversation.getMessages().stream()
                    .max(Comparator.comparing(Message::getCreatedAt))
                    .orElse(null);
            if (lastMessage != null) {
                dto.setLastMessage(messageMapper.toDto(lastMessage));
            }
        }

        // Admin-specific: Total unread count (not user-specific)
        if (conversation.getMessages() != null) {
            long unreadCount = conversation.getMessages().stream()
                    .filter(message -> !message.getIsRead())
                    .count();
            dto.setUnreadMessageCount(unreadCount);
        } else {
            dto.setUnreadMessageCount(0L);
        }

        return dto;
    }
}