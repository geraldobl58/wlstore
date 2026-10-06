package com.wlstore.catalog_service.service.impl;

import com.wlstore.catalog_service.common.PageResponseDTO;
import com.wlstore.catalog_service.common.ResourceNotFoundException;
import com.wlstore.catalog_service.dto.ProductFilterDTO;
import com.wlstore.catalog_service.dto.ProductImageRequestDTO;
import com.wlstore.catalog_service.dto.ProductRequestDTO;
import com.wlstore.catalog_service.dto.ProductResponseDTO;
import com.wlstore.catalog_service.dto.ProductVariantRequestDTO;
import com.wlstore.catalog_service.enums.ActiveStatus;
import com.wlstore.catalog_service.mapper.ProductMapper;
import com.wlstore.catalog_service.model.Category;
import com.wlstore.catalog_service.model.Product;
import com.wlstore.catalog_service.model.ProductImage;
import com.wlstore.catalog_service.model.ProductVariant;
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
        validateChildren(requestDTO);

        Product product = productMapper.toEntity(requestDTO);
        product.setCategory(findCategory(requestDTO.category().id()));

        syncVariants(product, requestDTO.variants());
        addImages(product, requestDTO.images());

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
        validateChildren(requestDTO);

        Product product = productRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        productMapper.updateProductFromRequest(requestDTO, product);
        product.setCategory(findCategory(requestDTO.category().id()));

        // As imagens antigas saem primeiro e o flush as apaga já: uma delas pode apontar para
        // uma variant que vamos remover logo abaixo, e apagar a variant antes violaria a FK.
        product.getImages().clear();
        productRepository.flush();

        syncVariants(product, requestDTO.variants());
        addImages(product, requestDTO.images());

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
     * Regras que o Bean Validation não expressa: dependem de olhar a lista inteira.
     */
    private void validateChildren(ProductRequestDTO requestDTO) {
        Set<String> skus = new HashSet<>();
        for (ProductVariantRequestDTO variant : requestDTO.variants()) {
            if (!skus.add(variant.sku())) {
                throw new IllegalArgumentException("Duplicate variant SKU: " + variant.sku());
            }
        }

        List<ProductImageRequestDTO> images = requestDTO.images() == null ? List.of() : requestDTO.images();

        long primaryCount = images.stream().filter(ProductImageRequestDTO::primaryImage).count();
        if (primaryCount > 1) {
            throw new IllegalArgumentException("Only one image can be primary");
        }

        for (ProductImageRequestDTO image : images) {
            if (image.variantSku() != null && !skus.contains(image.variantSku())) {
                throw new IllegalArgumentException("Image references unknown variant SKU: " + image.variantSku());
            }
        }
    }

    /**
     * Casa as variants pelo SKU: conhecido atualiza, novo cria, ausente da lista é removido
     * (orphanRemoval). No create a lista do produto está vazia, então tudo cai no "novo".
     */
    private void syncVariants(Product product, List<ProductVariantRequestDTO> requested) {
        Set<String> requestedSkus = new HashSet<>();
        for (ProductVariantRequestDTO dto : requested) {
            requestedSkus.add(dto.sku());
        }

        product.getVariants().removeIf(variant -> !requestedSkus.contains(variant.getSku()));

        Map<String, ProductVariant> existing = new HashMap<>();
        for (ProductVariant variant : product.getVariants()) {
            existing.put(variant.getSku(), variant);
        }

        for (int index = 0; index < requested.size(); index++) {
            ProductVariantRequestDTO dto = requested.get(index);
            int position = dto.position() != null ? dto.position() : index;
            ProductVariant variant = existing.get(dto.sku());

            if (variant == null) {
                product.addVariant(buildVariant(dto, position));
            } else {
                variant.setName(dto.name());
                variant.setOptionValues(copyOptions(dto.optionValues()));
                variant.setWeightGrams(dto.weightGrams());
                variant.setStatus(dto.status() != null ? dto.status() : ActiveStatus.ACTIVE);
                variant.setPosition(position);
            }
        }
    }

    private ProductVariant buildVariant(ProductVariantRequestDTO dto, int position) {
        return ProductVariant.builder()
                .sku(dto.sku())
                .name(dto.name())
                .optionValues(copyOptions(dto.optionValues()))
                .weightGrams(dto.weightGrams())
                .status(dto.status() != null ? dto.status() : ActiveStatus.ACTIVE)
                .position(position)
                .build();
    }

    // O builder sobrescreve o @Builder.Default com null se passarmos null: por isso a cópia.
    private Map<String, String> copyOptions(Map<String, String> options) {
        return options == null ? new HashMap<>() : new HashMap<>(options);
    }

    private void addImages(Product product, List<ProductImageRequestDTO> requested) {
        if (requested == null) {
            return;
        }

        Map<String, ProductVariant> variantsBySku = new HashMap<>();
        for (ProductVariant variant : product.getVariants()) {
            variantsBySku.put(variant.getSku(), variant);
        }

        for (int index = 0; index < requested.size(); index++) {
            ProductImageRequestDTO dto = requested.get(index);

            ProductImage image = ProductImage.builder()
                    .url(dto.url())
                    .altText(dto.altText())
                    .position(dto.position() != null ? dto.position() : index)
                    .primaryImage(dto.primaryImage())
                    .variant(dto.variantSku() == null ? null : variantsBySku.get(dto.variantSku()))
                    .build();

            product.addImage(image);
        }
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

        return new LinkedHashSet<>(categoryRepository.findIdsInSubtree(category.getPath()));
    }
}