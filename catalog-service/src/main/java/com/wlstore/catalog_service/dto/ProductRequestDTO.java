package com.wlstore.catalog_service.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record ProductRequestDTO(
        @NotBlank(message = "Title is required")
        String title,

        @NotBlank(message = "Brand is required")
        String brand,

        @NotBlank(message = "Image is required")
        String image,

        List<String> gallery,

        @NotBlank(message = "Description is required")
        String description,

        @NotBlank(message = "Status is required")
        String status,

        @NotNull(message = "Price is required")
        @Valid
        BigDecimal price,

        @NotNull(message = "Category is required")
        UUID categoryId
) {
}