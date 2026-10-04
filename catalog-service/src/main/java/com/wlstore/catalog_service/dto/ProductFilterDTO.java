package com.wlstore.catalog_service.dto;

import com.wlstore.catalog_service.enums.Status;
import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

public record ProductFilterDTO(
        @Schema(description = "Partial, case-insensitive match on the product title", example = "redmi")
        String title,

        @Schema(description = "Partial, case-insensitive match on the brand", example = "xiaomi")
        String brand,

        @Schema(description = "Exact status match", example = "IN_STOCK")
        Status status,

        @Schema(description = "Filters by category and, by default, everything below it in the tree",
                example = "ff70bf22-e67a-4cc7-aee6-ed7246955d5a")
        UUID categoryId,

        @Schema(description = "Same as categoryId, but addressed by slug — for storefront URLs. "
                + "Ignored when categoryId is also sent.",
                example = "capas-e-cases")
        String categorySlug,

        @Schema(description = "When false, matches only the exact categoryId instead of its whole subtree",
                defaultValue = "true")
        Boolean includeChildren,

        @Schema(description = "Minimum original price, inclusive", example = "100.00")
        BigDecimal minPrice,

        @Schema(description = "Maximum original price, inclusive", example = "2000.00")
        BigDecimal maxPrice
) {
    public boolean shouldIncludeSubchildren() {
        return includeChildren == null || includeChildren;
    }
}
