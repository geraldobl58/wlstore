package com.wlstore.catalog_service.dto;

import java.util.List;
import java.util.UUID;

public record CategorySummaryDTO(
        UUID id,
        String title,
        String slug,
        List<String> path
) {
}
