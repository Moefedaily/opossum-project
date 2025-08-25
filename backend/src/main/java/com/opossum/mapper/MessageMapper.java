package com.opossum.mapper;

import com.opossum.dto.messaging.MessageDto;
import com.opossum.entity.messaging.Message;
import com.opossum.service.MessageEncryptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class MessageMapper {

    private final MessageEncryptionService encryptionService;

    public MessageDto toDto(Message message) {
        if (message == null) {
            return null;
        }

        MessageDto dto = new MessageDto();
        dto.setId(message.getId());
        dto.setConversationId(message.getConversation().getId());
        dto.setSenderId(message.getSender().getId());
        dto.setSenderUsername(message.getSender().getUsername());
        dto.setSenderFullName(message.getSender().getFullName());

        // Decrypt message content
        dto.setMessageText(encryptionService.decryptMessage(message.getMessageText()));

        dto.setIsRead(message.getIsRead());
        dto.setReadAt(message.getReadAt());
        dto.setCreatedAt(message.getCreatedAt());

        return dto;
    }

    public List<MessageDto> toDtoList(List<Message> messages) {
        if (messages == null) {
            return null;
        }

        return messages.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}