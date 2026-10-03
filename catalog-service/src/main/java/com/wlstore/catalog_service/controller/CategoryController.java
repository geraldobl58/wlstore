package com.wlstore.catalog_service.controller;

import com.wlstore.catalog_service.common.PageResponseDTO;
import com.wlstore.catalog_service.dto.CategoryRequestDTO;
import com.wlstore.catalog_service.dto.CategoryResponseDTO;
import com.wlstore.catalog_service.service.impl.CategoryServiceImpl;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
class CategoryController {
    private final CategoryServiceImpl categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CategoryResponseDTO create(@Valid @RequestBody CategoryRequestDTO categoryRequestDTO
    ) {
        return categoryService.create(categoryRequestDTO);
    }

    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public PageResponseDTO<CategoryResponseDTO> findAll(@RequestParam(required = false) String title, Pageable pageable) {
        return categoryService.findAll(title, pageable);
    }

    @GetMapping("/{id}")
    public CategoryResponseDTO findById(@PathVariable UUID id) {
        return categoryService.findById(id);
    }

    @GetMapping("/slug/{slug}")
    public CategoryResponseDTO findBySlug(@PathVariable String slug) {
        return categoryService.findBySlug(slug);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public CategoryResponseDTO update(@PathVariable UUID id, @Valid @RequestBody CategoryRequestDTO categoryRequestDTO) {
        return categoryService.update(id, categoryRequestDTO);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        categoryService.delete(id);
    }

}
