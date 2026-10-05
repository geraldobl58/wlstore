package com.wlstore.catalog_service.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ProductResponseDTO(
        UUID id,
        String title,
        String brand,
        String image,
        List<String> gallery,
        String description,
        String status,
        BigDecimal price,
        CategorySummaryDTO category,
        Instant createdAt,
        Instant updatedAt
) {
}
