package com.opossum.service;

import com.opossum.dto.file.FileDto;
import com.opossum.dto.file.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

public interface FileService {

    // Core file operations for lost & found announcements

    /**
     * Upload a single file to an announcement
     * 
     * @param file           The file to upload
     * @param announcementId The announcement to attach the file to
     * @param userId         The user uploading the file
     * @return Upload response with file details or error message
     */
    FileUploadResponse uploadFile(MultipartFile file, Long announcementId, Long userId) throws IOException;

    /**
     * Get file details by ID
     * 
     * @param id The file ID
     * @return File details if found
     */
    Optional<FileDto> getFileById(Long id);

    /**
     * Get all files for a specific announcement
     * Used to display photos in announcement details
     * 
     * @param announcementId The announcement ID
     * @return List of files for the announcement
     */
    List<FileDto> getFilesByAnnouncementId(Long announcementId);

    /**
     * Get all files uploaded by a specific user
     * 
     * @param userId The user ID
     * @return List of files uploaded by the user
     */
    List<FileDto> getFilesByUserId(Long userId);

    /**
     * Delete a file (user can only delete their own files)
     * 
     * @param fileId The file ID to delete
     * @param userId The user requesting deletion
     */
    void deleteFile(Long fileId, Long userId) throws IOException;

    // Validation methods

    /**
     * Check if the file is a valid image
     * 
     * @param file The file to validate
     * @return true if valid image, false otherwise
     */
    boolean isValidImageFile(MultipartFile file);

    /**
     * Check if the file size is within limits
     * 
     * @param file The file to validate
     * @return true if size is valid, false otherwise
     */
    boolean isValidFileSize(MultipartFile file);

    /**
     * Check if user owns the file
     * 
     * @param fileId The file ID
     * @param userId The user ID
     * @return true if user owns the file, false otherwise
     */
    boolean isFileOwner(Long fileId, Long userId);

    // Basic admin operations

    /**
     * Get all files (admin only)
     * 
     * @return List of all files in the system
     */
    List<FileDto> getAllFilesForAdmin();

    /**
     * Delete any file (admin only)
     * 
     * @param fileId The file ID to delete
     */
    void adminDeleteFile(Long fileId) throws IOException;

    /**
     * Get total number of active files (admin stats)
     * 
     * @return Count of active files
     */
    long getTotalFileCount();

    /**
     * Upload multiple files to an announcement
     * 
     * @param files          List of files to upload
     * @param announcementId The announcement to attach the files to
     * @param userId         The user uploading the files
     * @return List of upload responses with file details or error messages
     */
    List<FileUploadResponse> uploadFiles(List<MultipartFile> files, Long announcementId, Long userId)
            throws IOException;
}