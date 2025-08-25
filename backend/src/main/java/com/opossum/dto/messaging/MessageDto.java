package com.opossum.dto.messaging;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long conversationId;
    private Long senderId;
    private String senderUsername;
    private String senderFullName;
    private String messageText;
    private Boolean isRead;
    private LocalDateTime readAt;
    private LocalDateTime createdAt;
}
