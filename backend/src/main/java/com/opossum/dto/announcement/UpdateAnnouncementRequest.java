package com.opossum.dto.announcement;

import com.opossum.entity.announcement.AnnouncementStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class UpdateAnnouncementRequest {

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private AnnouncementStatus status;

    @Size(max = 100, message = "Category must not exceed 100 characters")
    private String category;

    // Location fields
    private BigDecimal latitude;
    private BigDecimal longitude;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    private Boolean isLocationApproximate;

    private LocalDateTime incidentDate;

    @Size(max = 500, message = "Contact info must not exceed 500 characters")
    private String contactInfo;
}