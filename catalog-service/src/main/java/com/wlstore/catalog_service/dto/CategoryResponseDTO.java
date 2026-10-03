package com.wlstore.catalog_service.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CategoryResponseDTO(
        UUID id,
        String title,
        String slug,
        List<CategoryResponseDTO> children,
        LocalDate createdAt
) {
}
