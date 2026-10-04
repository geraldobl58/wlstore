package com.wlstore.catalog_service.service.impl;


import com.wlstore.catalog_service.common.PageResponseDTO;
import com.wlstore.catalog_service.common.ResourceNotFoundException;
import com.wlstore.catalog_service.dto.ProductFilterDTO;
import com.wlstore.catalog_service.dto.ProductRequestDTO;
import com.wlstore.catalog_service.dto.ProductResponseDTO;
import com.wlstore.catalog_service.mapper.ProductMapper;
import com.wlstore.catalog_service.model.Category;
import com.wlstore.catalog_service.model.Product;
import com.wlstore.catalog_service.repository.CategoryRepository;
import com.wlstore.catalog_service.repository.ProductRepository;
import com.wlstore.catalog_service.repository.ProductSpecifications;
import com.wlstore.catalog_service.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public ProductResponseDTO create(ProductRequestDTO requestDTO) {
        Product product = productMapper.toEntity(requestDTO);
        product.setCategory(findCategory(requestDTO.categoryId()));

        Product saveProduct = productRepository.save(product);

        return productMapper.toResponseDTO(saveProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ProductResponseDTO> findAll(ProductFilterDTO filter, Pageable pageable) {
        Collection<UUID> categoryIds = resolveCategoryIds(filter);

        return PageResponseDTO.from(
                productRepository
                        .findAll(ProductSpecifications.withFilters(filter, categoryIds), pageable)
                        .map(productMapper::toResponseDTO)
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponseDTO findById(UUID id) {
        Product product = productRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        return productMapper.toResponseDTO(product);
    }

    @Override
    @Transactional
    public ProductResponseDTO update(UUID id, ProductRequestDTO requestDTO) {
        Product product = productRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productMapper.updateProductFromRequest(requestDTO, product);
        product.setCategory(findCategory(requestDTO.categoryId()));

        Product updateProduct = productRepository.save(product);

        return productMapper.toResponseDTO(updateProduct);
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        if (!productRepository.existsById(id)) {
            throw new ResourceNotFoundException("Product", "id", id);
        }

        productRepository.deleteById(id);
    }

    private Category findCategory(UUID categoryId) {
        return categoryRepository
                .findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", categoryId));
    }

    /**
     * Returns null when no category filter was sent, so the specification skips the IN clause entirely.
     */
    private Collection<UUID> resolveCategoryIds(ProductFilterDTO filter) {
        if (filter.categoryId() == null && !StringUtils.hasText(filter.categorySlug())) {
            return null;
        }

        Category category = filter.categoryId() != null
                ? findCategory(filter.categoryId())
                : categoryRepository
                .findBySlug(filter.categorySlug())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", filter.categorySlug()));

        if (!filter.shouldIncludeSubchildren()) {
            return Set.of(category.getId());
        }

        Set<UUID> ids = new LinkedHashSet<>();
        Deque<Category> pending = new ArrayDeque<>();
        pending.add(category);

        while (!pending.isEmpty()) {
            Category current = pending.poll();

            if (ids.add(current.getId())) {
                pending.addAll(current.getChildren());
            }
        }

        return ids;
    }
}
