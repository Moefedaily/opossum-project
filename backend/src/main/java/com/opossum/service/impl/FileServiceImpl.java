package com.opossum.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.opossum.dto.file.FileDto;
import com.opossum.dto.file.FileUploadResponse;
import com.opossum.entity.File;
import com.opossum.entity.User;
import com.opossum.entity.announcement.Announcement;
import com.opossum.mapper.FileMapper;
import com.opossum.repository.FileRepository;
import com.opossum.repository.UserRepository;
import com.opossum.repository.AnnouncementRepository;
import com.opossum.service.FileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;
    private final FileMapper fileMapper;
    private final Cloudinary cloudinary;

    @Value("${app.file.max-size:10485760}") // 10MB default
    private Long maxFileSize;

    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp");

    @Override
    public FileUploadResponse uploadFile(MultipartFile file, Long announcementId, Long userId) throws IOException {
        log.info("Uploading file: {} for announcement: {} by user: {}",
                file.getOriginalFilename(), announcementId, userId);

        // Validate file
        if (!isValidImageFile(file)) {
            throw new IllegalArgumentException("Invalid file type. Only images are allowed.");
        }

        if (!isValidFileSize(file)) {
            throw new IllegalArgumentException(
                    "File too large. Maximum size is " + (maxFileSize / 1024 / 1024) + "MB.");
        }

        // Get user and announcement
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        Announcement announcement = announcementRepository.findById(announcementId)
                .orElseThrow(() -> new RuntimeException("Announcement not found: " + announcementId));

        // Check if user owns the announcement
        if (!announcement.getUser().getId().equals(userId)) {
            throw new SecurityException("You can only upload files to your own announcements.");
        }

        // Upload to Cloudinary
        @SuppressWarnings("rawtypes")
        Map uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
        String publicId = (String) uploadResult.get("public_id");
        String url = (String) uploadResult.get("secure_url");

        // Create file entity
        File fileEntity = new File();
        fileEntity.setPublicId(publicId);
        fileEntity.setUrl(url);
        fileEntity.setOriginalFilename(file.getOriginalFilename());
        fileEntity.setFileSize(file.getSize());
        fileEntity.setContentType(file.getContentType());
        fileEntity.setUploadedBy(user);
        fileEntity.setAnnouncement(announcement);
        fileEntity.setIsActive(true);

        // Save to database
        File savedFile = fileRepository.save(fileEntity);

        log.info("File uploaded successfully: {}", savedFile.getId());

        return FileUploadResponse.success(
                savedFile.getId(),
                savedFile.getPublicId(),
                savedFile.getOriginalFilename(),
                savedFile.getFileSize(),
                savedFile.getContentType(),
                savedFile.getUrl());
    }

    @Override
    public List<FileUploadResponse> uploadFiles(List<MultipartFile> files, Long announcementId, Long userId)
            throws IOException {
        log.info("Uploading {} files for announcement: {} by user: {}", files.size(), announcementId, userId);

        return files.stream()
                .map(file -> {
                    try {
                        return uploadFile(file, announcementId, userId);
                    } catch (IOException e) {
                        log.error("Error uploading file: {}", e.getMessage());
                        return FileUploadResponse.error("Failed to upload file: " + file.getOriginalFilename());
                    }
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<FileDto> getFileById(Long id) {
        log.debug("Getting file by ID: {}", id);
        return fileRepository.findById(id)
                .map(fileMapper::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileDto> getFilesByAnnouncementId(Long announcementId) {
        log.debug("Getting files for announcement: {}", announcementId);
        List<File> files = fileRepository.findByAnnouncementId(announcementId);
        return fileMapper.toDtoList(files);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FileDto> getFilesByUserId(Long userId) {
        log.debug("Getting files for user: {}", userId);
        List<File> files = fileRepository.findByUploadedById(userId);
        return fileMapper.toDtoList(files);
    }

    @Override
    public void deleteFile(Long fileId, Long userId) throws IOException {
        log.info("Deleting file: {} by user: {}", fileId, userId);

        // Check ownership and get file
        File file = fileRepository.findByIdAndUploadedById(fileId, userId)
                .orElseThrow(() -> new SecurityException("File not found or you don't have permission to delete it"));

        // Delete from Cloudinary
        try {
            cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.emptyMap());
            log.debug("File deleted from Cloudinary: {}", file.getPublicId());
        } catch (Exception e) {
            log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
            // Continue with database deletion even if Cloudinary fails
        }

        // Delete from database
        fileRepository.delete(file);
        log.info("File deleted successfully: {}", fileId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return false;
        }

        String contentType = file.getContentType();
        return contentType != null && ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isValidFileSize(MultipartFile file) {
        return file != null && file.getSize() <= maxFileSize && file.getSize() > 0;
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isFileOwner(Long fileId, Long userId) {
        return fileRepository.findByIdAndUploadedById(fileId, userId).isPresent();
    }

    // Admin operations

    @Override
    @Transactional(readOnly = true)
    public List<FileDto> getAllFilesForAdmin() {
        log.debug("Getting all files for admin");
        List<File> files = fileRepository.findAll();
        return fileMapper.toDtoList(files);
    }

    @Override
    public void adminDeleteFile(Long fileId) throws IOException {
        log.info("Admin deleting file: {}", fileId);

        File file = fileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found: " + fileId));

        // Delete from Cloudinary
        try {
            cloudinary.uploader().destroy(file.getPublicId(), ObjectUtils.emptyMap());
            log.debug("File deleted from Cloudinary by admin: {}", file.getPublicId());
        } catch (Exception e) {
            log.warn("Failed to delete file from Cloudinary: {}", e.getMessage());
            // Continue with database deletion even if Cloudinary fails
        }

        // Delete from database
        fileRepository.delete(file);
        log.info("File deleted by admin: {}", fileId);
    }

    @Override
    @Transactional(readOnly = true)
    public long getTotalFileCount() {
        return fileRepository.countByIsActiveTrue();
    }
}