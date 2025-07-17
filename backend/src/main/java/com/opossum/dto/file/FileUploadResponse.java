package com.opossum.dto.file;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileUploadResponse {

    // Core file information
    private Long id;
    private String publicId; // Cloudinary public_id
    private String originalFilename; // User's original filename
    private Long fileSize; // File size in bytes
    private String contentType; // MIME type
    private String url; // Direct Cloudinary secure_url

    // Response metadata
    private Boolean success;
    private String message;

    // Computed fields (calculated automatically)
    private String fileExtension;
    private String formattedFileSize;
    private Boolean isImage;
    private String thumbnailUrl; // 150x150 thumbnail for mobile
    private String optimizedUrl; // Auto-optimized for performance

    // Success constructor
    public FileUploadResponse(Long id, String publicId, String originalFilename,
            Long fileSize, String contentType, String url) {
        this.id = id;
        this.publicId = publicId;
        this.originalFilename = originalFilename;
        this.fileSize = fileSize;
        this.contentType = contentType;
        this.url = url;
        this.success = true;
        this.message = "File uploaded successfully";

        // Calculate computed fields
        this.fileExtension = calculateFileExtension();
        this.formattedFileSize = calculateFormattedFileSize();
        this.isImage = calculateIsImage();
        this.thumbnailUrl = calculateThumbnailUrl();
        this.optimizedUrl = calculateOptimizedUrl();
    }

    // Error constructor
    public FileUploadResponse(String message) {
        this.success = false;
        this.message = message;
    }

    // Static factory methods
    public static FileUploadResponse success(Long id, String publicId, String originalFilename,
            Long fileSize, String contentType, String url) {
        return new FileUploadResponse(id, publicId, originalFilename, fileSize, contentType, url);
    }

    public static FileUploadResponse error(String message) {
        return new FileUploadResponse(message);
    }

    // Private calculation methods
    private String calculateFileExtension() {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return "";
    }

    private String calculateFormattedFileSize() {
        if (fileSize == null)
            return "0 B";

        long bytes = fileSize;
        if (bytes < 1024)
            return bytes + " B";
        if (bytes < 1024 * 1024)
            return String.format("%.1f KB", bytes / 1024.0);
        if (bytes < 1024 * 1024 * 1024)
            return String.format("%.1f MB", bytes / (1024.0 * 1024.0));
        return String.format("%.1f GB", bytes / (1024.0 * 1024.0 * 1024.0));
    }

    private Boolean calculateIsImage() {
        return contentType != null && contentType.startsWith("image/");
    }

    private String calculateThumbnailUrl() {
        if (!calculateIsImage() || url == null)
            return null;
        return url.replace("/upload/", "/upload/w_150,h_150,c_fill/");
    }

    private String calculateOptimizedUrl() {
        if (!calculateIsImage() || url == null)
            return url;
        return url.replace("/upload/", "/upload/q_auto,f_auto/");
    }

    // Public utility methods for custom thumbnails
    public String getCustomThumbnail(int width, int height) {
        if (!isImage || url == null)
            return null;
        return url.replace("/upload/", "/upload/w_" + width + ",h_" + height + ",c_fill/");
    }
}