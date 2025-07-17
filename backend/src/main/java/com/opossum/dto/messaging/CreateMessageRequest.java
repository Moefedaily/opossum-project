package com.opossum.dto.messaging;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CreateMessageRequest {

    @NotNull(message = "Conversation ID is required")
    private Long conversationId;

    @NotBlank(message = "Message content is required")
    @Size(max = 2000, message = "Message must not exceed 2000 characters")
    private String content;
}
