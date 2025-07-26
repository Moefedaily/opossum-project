package com.opossum.mapper;

import com.opossum.dto.file.FileDto;
import com.opossum.entity.File;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FileMapper {

    /**
     * Convert File entity to FileDto with all computed fields
     */
    public FileDto toDto(File file) {
        if (file == null) {
            return null;
        }

        FileDto dto = new FileDto();

        // Core file information
        dto.setId(file.getId());
        dto.setPublicId(file.getPublicId());
        dto.setOriginalFilename(file.getOriginalFilename());
        dto.setFileSize(file.getFileSize());
        dto.setContentType(file.getContentType());
        dto.setUrl(file.getUrl());
        dto.setIsActive(file.getIsActive());
        dto.setCreatedAt(file.getCreatedAt());

        // Relationship information
        if (file.getAnnouncement() != null) {
            dto.setAnnouncementId(file.getAnnouncement().getId());
            dto.setAnnouncementTitle(file.getAnnouncement().getTitle());
        }

        if (file.getUploadedBy() != null) {
            dto.setUploadedByUserId(file.getUploadedBy().getId());
            dto.setUploadedByUsername(file.getUploadedBy().getUsername());
        }

        // Computed fields
        dto.setFileExtension(calculateFileExtension(file.getOriginalFilename()));
        dto.setFormattedFileSize(calculateFormattedFileSize(file.getFileSize()));
        dto.setIsImage(calculateIsImage(file.getContentType()));
        dto.setThumbnailUrl(calculateThumbnailUrl(file.getUrl(), dto.getIsImage()));
        dto.setOptimizedUrl(calculateOptimizedUrl(file.getUrl(), dto.getIsImage()));

        return dto;
    }

    /**
     * Convert FileDto to File entity (for updates)
     * I will nly maps updateable fields
     */
    public File toEntity(FileDto dto) {
        if (dto == null) {
            return null;
        }

        File file = new File();
        file.setId(dto.getId());
        file.setPublicId(dto.getPublicId());
        file.setOriginalFilename(dto.getOriginalFilename());
        file.setFileSize(dto.getFileSize());
        file.setContentType(dto.getContentType());
        file.setUrl(dto.getUrl());
        file.setIsActive(dto.getIsActive());
        file.setCreatedAt(dto.getCreatedAt());

        return file;
    }

    /**
     * Update existing File entity with FileDto data
     * Only updates fields that are allowed to be modified
     */
    public void updateEntity(File file, FileDto dto) {
        if (file == null || dto == null) {
            return;
        }

        // Only allow updating these fields
        if (dto.getOriginalFilename() != null) {
            file.setOriginalFilename(dto.getOriginalFilename());
        }

        if (dto.getIsActive() != null) {
            file.setIsActive(dto.getIsActive());
        }

        // I will not update publicId, url, fileSize, contentType after upload
    }

    /**
     * Convert List of File entities to List of FileDtos
     */
    public List<FileDto> toDtoList(List<File> files) {
        if (files == null) {
            return null;
        }

        return files.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // Private utility methods for computed fields

    private String calculateFileExtension(String originalFilename) {
        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        return "";
    }

    private String calculateFormattedFileSize(Long fileSize) {
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

    private Boolean calculateIsImage(String contentType) {
        return contentType != null && contentType.startsWith("image/");
    }

    private String calculateThumbnailUrl(String url, Boolean isImage) {
        if (!Boolean.TRUE.equals(isImage) || url == null)
            return null;
        return url.replace("/upload/", "/upload/w_150,h_150,c_fill/");
    }

    private String calculateOptimizedUrl(String url, Boolean isImage) {
        if (!Boolean.TRUE.equals(isImage) || url == null)
            return url;
        return url.replace("/upload/", "/upload/q_auto,f_auto/");
    }
}