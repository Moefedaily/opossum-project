package com.opossum.dto.messaging;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.user.UserDto;
import com.opossum.entity.messaging.ConversationStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDto {
    private Long id;
    private AnnouncementDto announcement;
    private UserDto starterUser;
    private UserDto recipientUser;
    private UserDto otherUser;
    private ConversationStatus status;
    private LocalDateTime lastMessageAt;
    private LocalDateTime createdAt;
    private MessageDto lastMessage;
    private Long unreadMessageCount;
}
