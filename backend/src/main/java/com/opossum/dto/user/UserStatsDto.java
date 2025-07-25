
package com.opossum.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserStatsDto {
    private Long totalAnnouncements;
    private Long activeAnnouncements;
    private Long resolvedAnnouncements;
    private Long expiredAnnouncements;
}