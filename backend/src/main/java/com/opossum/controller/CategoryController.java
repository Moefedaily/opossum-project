package com.opossum.controller;

import com.opossum.entity.announcement.AnnouncementCategory;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@Tag(name = "Categories", description = "Announcement category management")
@Slf4j
public class CategoryController {

    /**
     * Get all available announcement categories.
     * Returns a simple list of category enum values.
     * 
     * @return List of all available categories
     */
    @GetMapping
    @Operation(summary = "Get all categories", description = "Retrieve all available announcement categories")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Categories retrieved successfully")
    })
    public ResponseEntity<List<String>> getAllCategories() {
        log.debug("Getting all available categories");

        List<String> categories = Arrays.stream(AnnouncementCategory.values())
                .map(Enum::name)
                .collect(Collectors.toList());

        return ResponseEntity.ok(categories);
    }
}