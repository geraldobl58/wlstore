package com.wlstore.catalog_service.service;

import com.wlstore.catalog_service.AbstractIntegrationTest;
import com.wlstore.catalog_service.dto.CategoryRefDTO;
import com.wlstore.catalog_service.dto.ProductFilterDTO;
import com.wlstore.catalog_service.dto.ProductRequestDTO;
import com.wlstore.catalog_service.dto.ProductResponseDTO;
import com.wlstore.catalog_service.dto.ProductVariantRequestDTO;
import com.wlstore.catalog_service.model.Category;
import com.wlstore.catalog_service.model.VariantPrice;
import com.wlstore.catalog_service.repository.CategoryRepository;
import com.wlstore.catalog_service.repository.VariantPriceRepository;
import com.wlstore.common.tenant.TenantContext;
import com.wlstore.common.web.PageResponseDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.tuple;

class ProductPriceListingIntegrationTest extends AbstractIntegrationTest {

    private static final Instant T0 = Instant.parse("2026-01-01T10:00:00Z");

    @Autowired
    ProductService productService;

    @Autowired
    CategoryRepository categoryRepository;

    @Autowired
    VariantPriceRepository variantPriceRepository;

    @Test
    void listingShowsTheLowestVariantPriceOfEachProduct() {
        UUID tenant = UUID.randomUUID();
        UUID category = newCategory(tenant);

        ProductResponseDTO phone = newProduct(tenant, category, "Redmi 18", "PH-128", "PH-256");
        ProductResponseDTO phoneCase = newProduct(tenant, category, "Capa", "CASE-1");

        priceIt(tenant, phone.id(), "PH-256", 159900L);
        priceIt(tenant, phone.id(), "PH-128", 129900L);
        priceIt(tenant, phoneCase.id(), "CASE-1", 4990L);

        PageResponseDTO<ProductResponseDTO> page = list(tenant);

        assertThat(page.data())
                .extracting(ProductResponseDTO::title, ProductResponseDTO::priceFromCents)
                .containsExactlyInAnyOrder(
                        tuple("Redmi 18", 129900L),
                        tuple("Capa", 4990L));
    }

    @Test
    void variantsWithoutPriceDoNotCountTowardsTheFromPrice() {
        UUID tenant = UUID.randomUUID();
        UUID category = newCategory(tenant);

        ProductResponseDTO phone = newProduct(tenant, category, "Redmi 18", "PH-128", "PH-256");
        priceIt(tenant, phone.id(), "PH-256", 159900L);

        PageResponseDTO<ProductResponseDTO> page = list(tenant);

        assertThat(page.data())
                .singleElement()
                .extracting(ProductResponseDTO::priceFromCents)
                .isEqualTo(159900L);
    }

    @Test
    void productWithoutAnyPriceHasNullFromPriceNotZero() {
        UUID tenant = UUID.randomUUID();
        UUID category = newCategory(tenant);

        newProduct(tenant, category, "Sem preco", "NOPRICE-1");

        PageResponseDTO<ProductResponseDTO> page = list(tenant);

        assertThat(page.data())
                .singleElement()
                .extracting(ProductResponseDTO::priceFromCents)
                .isNull();
    }

    private PageResponseDTO<ProductResponseDTO> list(UUID tenant) {
        ProductFilterDTO noFilter = new ProductFilterDTO(null, null, null, null, null, null);
        return TenantContext.callWithTenant(tenant,
                () -> productService.findAll(noFilter, PageRequest.of(0, 10)));
    }

    private UUID newCategory(UUID tenant) {
        return TenantContext.callWithTenant(tenant, () -> {
            String name = "cat-" + UUID.randomUUID().toString().substring(0, 8);
            Category category = Category.builder().title(name).slug(name).build();
            category.refreshPath();
            return categoryRepository.saveAndFlush(category).getId();
        });
    }

    private ProductResponseDTO newProduct(UUID tenant, UUID categoryId, String title, String... skus) {
        List<ProductVariantRequestDTO> variants = Arrays.stream(skus)
                .map(sku -> new ProductVariantRequestDTO(sku, "Variant " + sku, null, null, null, null))
                .toList();

        ProductRequestDTO request = new ProductRequestDTO(
                title, "Brand", "Description", "ACTIVE",
                new CategoryRefDTO(categoryId), variants, null);

        return TenantContext.callWithTenant(tenant, () -> productService.create(request));
    }

    private void priceIt(UUID tenant, UUID productId, String sku, long amountCents) {
        TenantContext.runWithTenant(tenant, () -> variantPriceRepository.saveAndFlush(
                VariantPrice.builder()
                        .productId(productId)
                        .sku(sku)
                        .amountCents(amountCents)
                        .validFrom(T0)
                        .build()));
    }
}