package com.opossum.mapper;

import com.opossum.dto.announcement.AnnouncementDto;
import com.opossum.dto.announcement.CreateAnnouncementRequest;
import com.opossum.dto.announcement.UpdateAnnouncementRequest;
import com.opossum.entity.announcement.Announcement;
import com.opossum.entity.announcement.AnnouncementStatus;
import com.opossum.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class AnnouncementMapper {

    // Convert Entity to DTO
    public AnnouncementDto toDto(Announcement announcement) {
        if (announcement == null) {
            return null;
        }

        AnnouncementDto dto = new AnnouncementDto();
        dto.setId(announcement.getId());
        dto.setTitle(announcement.getTitle());
        dto.setDescription(announcement.getDescription());
        dto.setType(announcement.getType());
        dto.setStatus(announcement.getStatus());
        dto.setCategory(announcement.getCategory());

        // Location fields
        dto.setLatitude(announcement.getLatitude());
        dto.setLongitude(announcement.getLongitude());
        dto.setAddress(announcement.getAddress());
        dto.setIsLocationApproximate(announcement.getIsLocationApproximate());

        // Date fields
        dto.setIncidentDate(announcement.getIncidentDate());
        dto.setCreatedAt(announcement.getCreatedAt());
        dto.setUpdatedAt(announcement.getUpdatedAt());

        // User info
        if (announcement.getUser() != null) {
            dto.setUserId(announcement.getUser().getId());
            dto.setUsername(announcement.getUser().getUsername());
            dto.setUserEmail(announcement.getUser().getEmail());
            dto.setUserFullName(announcement.getUser().getFullName());
        }
        dto.setContactInfo(announcement.getContactInfo());
        dto.setIsActive(announcement.getIsActive());
        dto.setLocationDescription(announcement.getLocationDescription());

        return dto;
    }

    // Convert CreateRequest to Entity
    public Announcement toEntity(CreateAnnouncementRequest request, User user) {
        if (request == null) {
            return null;
        }

        Announcement announcement = new Announcement();
        announcement.setTitle(request.getTitle());
        announcement.setDescription(request.getDescription());
        announcement.setType(request.getType());
        announcement.setStatus(AnnouncementStatus.ACTIVE);
        announcement.setCategory(request.getCategory());

        // Location fields
        announcement.setLatitude(request.getLatitude());
        announcement.setLongitude(request.getLongitude());
        announcement.setAddress(request.getAddress());
        announcement.setIsLocationApproximate(request.getIsLocationApproximate());

        // Date fields
        announcement.setIncidentDate(request.getIncidentDate());

        // User relationship
        announcement.setUser(user);
        announcement.setContactInfo(request.getContactInfo());
        announcement.setIsActive(true);

        return announcement;
    }

    // Update Entity from UpdateRequest
    public void updateEntity(Announcement announcement, UpdateAnnouncementRequest request) {
        if (announcement == null || request == null) {
            return;
        }

        // Only update non-null fields
        if (request.getTitle() != null) {
            announcement.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            announcement.setDescription(request.getDescription());
        }
        if (request.getStatus() != null) {
            announcement.setStatus(request.getStatus());
        }
        if (request.getCategory() != null) {
            announcement.setCategory(request.getCategory());
        }

        // Location fields (allow null to clear location)
        if (request.getLatitude() != null) {
            announcement.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            announcement.setLongitude(request.getLongitude());
        }
        if (request.getAddress() != null) {
            announcement.setAddress(request.getAddress());
        }
        if (request.getIsLocationApproximate() != null) {
            announcement.setIsLocationApproximate(request.getIsLocationApproximate());
        }

        // Date fields
        if (request.getIncidentDate() != null) {
            announcement.setIncidentDate(request.getIncidentDate());
        }

        // Additional fields
        if (request.getContactInfo() != null) {
            announcement.setContactInfo(request.getContactInfo());
        }

        // Updated timestamp will be set automatically by @UpdateTimestamp
    }

    // Convert List of Entities to List of DTOs
    public List<AnnouncementDto> toDtoList(List<Announcement> announcements) {
        if (announcements == null) {
            return null;
        }

        return announcements.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}