package com.opossum.entity.announcement;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.opossum.entity.User;
import com.opossum.entity.File;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ops_announcements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Announcement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Column(nullable = false, length = 2000)
    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Announcement type is required")
    private AnnouncementType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Announcement status is required")
    private AnnouncementStatus status = AnnouncementStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @NotNull(message = "Announcement category is required")
    private AnnouncementCategory category;

    // GPS Location fields
    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(length = 500)
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Column(nullable = false)
    private Boolean isLocationApproximate = false;

    // Date fields
    @Column(nullable = false)
    @NotNull(message = "Incident date is required")
    private LocalDateTime incidentDate;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    // User relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    private User user;

    // File relationship - One-to-Many
    @OneToMany(mappedBy = "announcement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<File> files = new ArrayList<>();

    // Additional fields
    @Column(length = 500)
    @Size(max = 500, message = "Contact info must not exceed 500 characters")
    private String contactInfo;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Utility methods
    public String getLocationDescription() {
        if (address != null && !address.trim().isEmpty()) {
            return address;
        } else if (latitude != null && longitude != null) {
            return String.format("%.6f, %.6f", latitude, longitude);
        }
        return "Location not specified";
    }

    // File utility methods
    public void addFile(File file) {
        if (files == null) {
            files = new ArrayList<>();
        }
        files.add(file);
        file.setAnnouncement(this);
    }

    public void removeFile(File file) {
        if (files != null) {
            files.remove(file);
            file.setAnnouncement(null);
        }
    }

    public List<File> getImageFiles() {
        if (files == null)
            return new ArrayList<>();
        return files.stream()
                .filter(File::isImage)
                .toList();
    }

    public boolean hasImages() {
        return getImageFiles().size() > 0;
    }

    public String getDisplayUserName() {
        return user != null ? user.getUsername() : "Anonymous";
    }
}