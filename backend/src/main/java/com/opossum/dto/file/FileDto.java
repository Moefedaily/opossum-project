package com.opossum.dto.file;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FileDto {

    // Core file information
    private Long id;
    private String publicId; // Cloudinary public_id
    private String originalFilename; // User's original filename
    private Long fileSize; // File size in bytes
    private String contentType; // MIME type
    private String url; // Direct Cloudinary secure_url
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Relationship information
    private Long announcementId;
    private String announcementTitle;
    private Long uploadedByUserId;
    private String uploadedByUsername;

    // Computed fields (set by mapper)
    private String fileExtension;
    private String formattedFileSize;
    private Boolean isImage;
    private String thumbnailUrl; // 150x150 thumbnail for mobile
    private String optimizedUrl; // Auto-optimized for performance

    // Utility methods for thumbnail generation
    public String getCustomThumbnail(int width, int height) {
        if (!isImage || url == null)
            return null;
        return url.replace("/upload/", "/upload/w_" + width + ",h_" + height + ",c_fill/");
    }

    public String getCustomThumbnail(int width, int height, String cropMode) {
        if (!isImage || url == null)
            return null;
        return url.replace("/upload/", "/upload/w_" + width + ",h_" + height + ",c_" + cropMode + "/");
    }

    // Predefined thumbnail sizes for convenience
    public String getSmallThumbnail() {
        return getCustomThumbnail(150, 150);
    }

    public String getMediumThumbnail() {
        return getCustomThumbnail(300, 300);
    }

    public String getLargeThumbnail() {
        return getCustomThumbnail(600, 600);
    }
}