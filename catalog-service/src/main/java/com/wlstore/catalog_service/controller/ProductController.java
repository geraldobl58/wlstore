package com.wlstore.catalog_service.controller;

import com.wlstore.catalog_service.common.PageResponseDTO;
import com.wlstore.catalog_service.dto.ProductFilterDTO;
import com.wlstore.catalog_service.dto.ProductRequestDTO;
import com.wlstore.catalog_service.dto.ProductResponseDTO;
import com.wlstore.catalog_service.service.impl.ProductServiceImpl;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.websocket.server.PathParam;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@Tag(name = "Products", description = "Product catalog. Every product belongs to exactly one category or subcategory via categoryId.")
class ProductController {
    private final ProductServiceImpl productService;

    private static final String PRODUCT_EXAMPLE = """
            {
              "title": "Redmi 18",
              "brand": "Xiaomi",
              "image": "https://example.com/redmi-18.png",
              "gallery": [
                "https://example.com/redmi-18-front.png",
                "https://example.com/redmi-18-back.png"
              ],
              "description": "Lorem Ipsum Dolor Sit",
              "status": "IN_STOCK",
              "price": 1000,
              "categoryId": "9c858901-8a57-4791-81fe-4c455b099bc9"
            }
            """;

    @Operation(
            summary = "Create a product",
            description = "categoryId must point to an existing category or subcategory (returns 404 otherwise)."
    )
    @ApiResponse(responseCode = "201", description = "Product created")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "categoryId does not match any category")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponseDTO create(
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Product payload", required = true,
                    content = @Content(schema = @Schema(implementation = ProductRequestDTO.class),
                            examples = @ExampleObject(name = "New product", value = PRODUCT_EXAMPLE)))
            @RequestBody ProductRequestDTO productRequestDTO
    ) {
        return productService.create(productRequestDTO);
    }

    @Operation(
            summary = "List products (paginated + filters)",
            description = """
                    All filters are optional and combine with AND. `title` and `brand` are partial and \
                    case-insensitive; `status` is exact; `minPrice`/`maxPrice` bound the original price.

                    `categoryId` matches the category **and everything below it in the tree** — filtering by \
                    "Acessorios" also returns products filed under "Capas de Silicone". Pass \
                    `includeSubcategories=false` to match that one category exactly.

                    Pages are 10 items by default: `?page=0&size=10&sort=createdAt,desc`.
                    """
    )
    @ApiResponse(responseCode = "404", description = "categoryId does not match any category")
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public PageResponseDTO<ProductResponseDTO> findAll(
            @ParameterObject ProductFilterDTO filter,
            @ParameterObject Pageable pageable) {
        return  productService.findAll(filter, pageable);
    }

    @Operation(
            summary = "Get a product by id",
            description = "Returns the product along with a summary of its category, including the breadcrumb path from the root."
    )
    @ApiResponse(responseCode = "200", description = "Product found")
    @ApiResponse(responseCode = "404", description = "Product not found")
    @GetMapping("/{id}")
    public ProductResponseDTO findById(@PathVariable UUID id) {
        return productService.findById(id);
    }

    @Operation(
            summary = "Update a product",
            description = "Replaces every field, including categoryId — send the current categoryId back if it shouldn't change."
    )
    @ApiResponse(responseCode = "200", description = "Product updated")
    @ApiResponse(responseCode = "400", description = "Validation error")
    @ApiResponse(responseCode = "404", description = "Product or categoryId not found")
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ProductResponseDTO update(
            @PathVariable UUID id,
            @Valid @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Full product payload — every field is replaced", required = true,
                    content = @Content(schema = @Schema(implementation = ProductRequestDTO.class),
                            examples = @ExampleObject(name = "Updated product", value = PRODUCT_EXAMPLE)))
            @RequestBody ProductRequestDTO productRequestDTO
    ) {
        return productService.update(id, productRequestDTO);
    }

    @Operation(
            summary = "Delete a product",
            description = "Permanently removes the product. Does not affect its category."
    )
    @ApiResponse(responseCode = "204", description = "Deleted")
    @ApiResponse(responseCode = "404", description = "Product not found")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        productService.delete(id);
    }
}
