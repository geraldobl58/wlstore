package com.wlstore.catalog_service.dto;

import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

public record CategoryRequestDTO(
        UUID id,
        String title,
        String slug,
        List<@Valid CategoryRequestDTO> children
) {

}
