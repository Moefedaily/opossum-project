package com.opossum.mapper;

import com.opossum.entity.messaging.Conversation;
import com.opossum.dto.messaging.ConversationDto;
import com.opossum.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class ConversationMapper {

    private final UserMapper userMapper;
    private final AnnouncementMapper announcementMapper;

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
}