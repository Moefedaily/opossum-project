package com.opossum.dto.announcement;

import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.announcement.AnnouncementType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AnnouncementDto {

    private Long id;
    private String title;
    private String description;
    private AnnouncementType type;
    private AnnouncementStatus status;
    private String category;

    // Location fields
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private Boolean isLocationApproximate;

    // Date fields
    private LocalDateTime incidentDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // User info
    private Long userId;
    private String username;
    private String userEmail;
    private String userFullName;

    // Additional fields
    private String contactInfo;
    private Boolean isActive;

    // Utility field
    private String locationDescription;
}