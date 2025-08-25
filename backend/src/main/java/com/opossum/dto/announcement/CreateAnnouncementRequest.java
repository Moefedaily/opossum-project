package com.opossum.dto.announcement;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.opossum.entity.announcement.AnnouncementCategory;
import com.opossum.entity.announcement.AnnouncementType;

@Data
public class CreateAnnouncementRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Announcement type is required")
    private AnnouncementType type;

    @NotNull(message = "Announcement category is required")
    private AnnouncementCategory category;
    // Location fields
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private Boolean isLocationApproximate = false;

    @NotNull(message = "Incident date is required")
    private LocalDateTime incidentDate;

    @Size(max = 500, message = "Contact info must not exceed 500 characters")
    private String contactInfo;
}