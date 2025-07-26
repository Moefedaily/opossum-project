package com.opossum.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.opossum.entity.announcement.Announcement;

import java.time.LocalDateTime;

@Entity
@Table(name = "ops_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class File {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "public_id", nullable = false, length = 255)
    @NotBlank(message = "Cloudinary public ID is required")
    @Size(max = 255, message = "Public ID must not exceed 255 characters")
    private String publicId;

    @Column(nullable = false, length = 255)
    @NotBlank(message = "Original filename is required")
    @Size(max = 255, message = "Original filename must not exceed 255 characters")
    private String originalFilename;

    @Column(name = "url", nullable = false, length = 500)
    @NotBlank(message = "Cloudinary URL is required")
    @Size(max = 500, message = "URL must not exceed 500 characters")
    private String url;

    @Column(nullable = false)
    @NotNull(message = "File size is required")
    private Long fileSize;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "Content type is required")
    @Size(max = 100, message = "Content type must not exceed 100 characters")
    private String contentType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by_user_id", nullable = true)
    private User uploadedBy;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private Boolean isActive = true;

    // Many-to-one relationship with announcement
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "announcement_id", nullable = false)
    @NotNull(message = "Announcement is required")
    private Announcement announcement;

    // Utility methods
    public String getFileExtension() {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return "";
    }

    public boolean isImage() {
        return contentType != null && contentType.startsWith("image/");
    }

    public String getFormattedFileSize() {
        if (fileSize == null)
            return "0 B";

        long bytes = fileSize;
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return (bytes / 1024) + " KB";
        if (bytes < 1024 * 1024 * 1024)
            return (bytes / (1024 * 1024)) + " MB";
        return (bytes / (1024 * 1024 * 1024)) + " GB";
    }

    public String getUploaderName() {
        return uploadedBy != null ? uploadedBy.getUsername() : "Anonymous";
    }
}