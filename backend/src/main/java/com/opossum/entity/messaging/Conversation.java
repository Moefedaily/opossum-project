package com.opossum.entity.messaging;

import com.opossum.entity.User;
import com.opossum.entity.announcement.Announcement;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ops_conversations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    private Announcement announcement;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "starter_user_id", nullable = false)
    private User starterUser; // User who initiated conversation

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipientUser; // User who owns the announcement

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConversationStatus status = ConversationStatus.ACTIVE;

    @Column(name = "last_message_at")
    private LocalDateTime lastMessageAt;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "conversation", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Message> messages = new ArrayList<>();

    // Utility methods
    public User getOtherUser(Long userId) {
        if (starterUser.getId().equals(userId)) {
            return recipientUser;
        } else if (recipientUser.getId().equals(userId)) {
            return starterUser;
        }
        throw new IllegalArgumentException("User is not part of this conversation");
    }

    public boolean isParticipant(Long userId) {
        return starterUser.getId().equals(userId) || recipientUser.getId().equals(userId);
    }
}
